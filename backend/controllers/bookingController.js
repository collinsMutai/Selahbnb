import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import moment from "moment-timezone";
import { createPaypalPayment } from "./paypalController.js";

// America/Denver timezone
const TIMEZONE = "America/Denver";
const HOUSE_RULES = { checkIn: { hour: 15, minute: 0 }, checkOut: { hour: 11, minute: 0 } };

/**
 * Create a new booking and initiate PayPal payment
 */
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { listingId, checkIn: rawCheckIn, checkOut: rawCheckOut } = req.body;

    // Ensure listing exists
    const listing = await Listing.findById(listingId).session(session);
    if (!listing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Listing not found" });
    }

    // Normalize check-in and check-out dates
    const checkInDate = moment(rawCheckIn).tz(TIMEZONE).startOf('day');
    const checkOutDate = moment(rawCheckOut).tz(TIMEZONE).startOf('day');
    const numberOfDays = checkOutDate.diff(checkInDate, "days");

    // Enforce minimum 2-night stay
    if (numberOfDays < 2) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Minimum stay is 2 nights." });
    }

    // Apply house rules to check-in/check-out
    const checkIn = moment(rawCheckIn)
      .tz(TIMEZONE)
      .hour(HOUSE_RULES.checkIn.hour)
      .minute(HOUSE_RULES.checkIn.minute)
      .second(0)
      .millisecond(0)
      .toDate();

    const checkOut = moment(rawCheckOut)
      .tz(TIMEZONE)
      .hour(HOUSE_RULES.checkOut.hour)
      .minute(HOUSE_RULES.checkOut.minute)
      .second(0)
      .millisecond(0)
      .toDate();

    // Check for overlapping bookings
    const conflict = await Booking.findOne({
      listing: listingId,
      status: { $in: ["HOLD", "CONFIRMED"] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    }).session(session);

    if (conflict) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: "Dates unavailable" });
    }

    // Set booking expiration (15 minutes TTL)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Calculate total price
    const subtotal = listing.price * numberOfDays;
    const tax = subtotal * 0.1; // example 10% tax
    const totalPrice = subtotal + tax;

    // Ensure total price is greater than zero
    if (totalPrice <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Total price must be greater than zero." });
    }

    // Create booking
    const booking = await Booking.create(
      [
        {
          ...req.body,
          listing: listingId,
          user: req.user._id,
          checkIn,
          checkOut,
          subtotal,
          tax,
          totalPrice,
          numberOfDays,
          status: "HOLD",
          expiresAt,
        },
      ],
      { session }
    );

    console.log("Booking created successfully:", booking);  // Log booking creation

    // Create PayPal order
    let paypalOrder;
    try {
      paypalOrder = await createPaypalPayment({
        body: {
          bookingId: booking[0]._id,
          totalPrice: booking[0].totalPrice,
        },
      });

      console.log("PayPal order created successfully:", paypalOrder);  // Log PayPal order creation
    } catch (paypalError) {
      await session.abortTransaction();
      session.endSession();
      console.error("PayPal order creation failed:", paypalError);
      return res.status(500).json({ message: "Payment initialization failed" });
    }

    // Save PayPal order ID to booking
    await Booking.findByIdAndUpdate(
      booking[0]._id,
      { paypalOrderId: paypalOrder.data.orderId },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Return booking info with PayPal approval link
    res.status(201).json({
      bookingId: booking[0]._id,
      approvalLink: paypalOrder.data.approvalLink,
      expiresAt,
      checkIn,
      checkOut,
      totalPrice,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Booking creation failed:", err);
    res.status(500).json({ message: "Booking creation failed" });
  }
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing", "title location price")
      .populate("user", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all bookings for a listing (hosts)
 */
export const getListingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ listing: req.params.id }).populate("user", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get availability for a listing
 */
export const getListingAvailability = async (req, res) => {
  try {
    const bookings = await Booking.find({ listing: req.params.listingId, status: "CONFIRMED" }).select("checkIn checkOut");
    const bookedDates = [];

    bookings.forEach((booking) => {
      const start = moment(booking.checkIn);
      const end = moment(booking.checkOut);
      while (start.isBefore(end)) {
        bookedDates.push(start.format("YYYY-MM-DD"));
        start.add(1, "day");
      }
    });

    res.json({ bookedDates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching availability" });
  }
};
