// controllers/bookingController.js
import Booking from "../models/Booking.js";
import { v4 as uuidv4 } from "uuid";
import Listing from "../models/Listing.js";
import { createPaypalPayment } from "./paypalController.js";
import moment from "moment-timezone";
import mongoose from "mongoose";

// Define house rules for timezone-specific calculations
const HOUSE_RULES = {
  checkIn: { hour: 15, minute: 0 }, // 3:00 PM
  checkOut: { hour: 11, minute: 0 }, // 11:00 AM
};

// Create a new booking and initiate PayPal payment
export const createBooking = async (req, res) => {
  try {
    const {
      listingId,
      name,
      phone,
      checkIn,
      checkOut,
      adults,
      children,
      infants,
      pets,
    } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Use consistent timezone for date conversion
    const checkInDate = moment.tz(checkIn, "America/Denver").startOf("day");
    const checkOutDate = moment.tz(checkOut, "America/Denver").startOf("day");

    // 1. Check for overlapping bookings (Confirmed or active Holds)
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      status: { $in: ["Confirmed", "Hold"] },
      checkIn: { $lt: new Date(checkOutDate) },
      checkOut: { $gt: new Date(checkInDate) },
    });

    // If overlap exists, only allow if it belongs to the SAME user (prevents duplicate tabs)
    if (
      overlappingBooking &&
      overlappingBooking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "Dates are already booked or currently held by another guest.",
      });
    }

    // 2. Calculate the number of nights
    const numberOfDays = checkOutDate.diff(checkInDate, "days");

    if (numberOfDays <= 0) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after the check-in date." });
    }

    // 3. Pricing Calculation
    const TAX_RATE = 0.112;
    const subtotal = listing.price * numberOfDays;
    const totalPrice = Math.round(subtotal * (1 + TAX_RATE) * 100) / 100;
    const taxAmount = Math.round((totalPrice - subtotal) * 100) / 100;

    // 4. Create a unique transaction ID and 30-MINUTE HOLD
    const paymentTransactionId = uuidv4();

    // UPDATED: Hold changed to 30 minutes for better user experience
    const holdExpiration = moment().add(30, "minutes").toDate();

    // 5. Build and Save the Booking
    const booking = new Booking({
      listing: listingId,
      user: req.user._id,
      name,
      phone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults,
      children,
      infants,
      pets,
      subtotal: Number(subtotal.toFixed(2)),
      tax: taxAmount,
      totalPrice,
      numberOfDays,
      paymentTransactionId,
      status: "Hold", // Important: Partial Filter Index tracks this status
      holdExpiration,
    });

    const savedBooking = await booking.save();

    // 6. Initiate PayPal Payment
    const paymentResponse = await createPaypalPayment({
      body: { bookingId: savedBooking._id, totalPrice },
    });

    if (paymentResponse.status === 200) {
      // 🚨 CRITICAL: Save the PayPal Order ID immediately
      await Booking.findByIdAndUpdate(savedBooking._id, {
        paypalOrderId: paymentResponse.data.orderId,
      });

      res.status(201).json({
        booking: savedBooking,
        approvalLink: paymentResponse.data.approvalLink,
      });
    } else {
      // If PayPal fails, we don't necessarily want to delete the booking yet,
      // but we should let the user know.
      res
        .status(paymentResponse.status)
        .json({ message: paymentResponse.message });
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ message: "Error creating booking and initiating payment" });
  }
};

// Get availability for a listing (returns array of YYYY-MM-DD strings)
export const getListingAvailability = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Extract user ID if they are logged in (populated by optionalProtect middleware)
    const currentUserId = req.user ? req.user._id.toString() : null;

    // Fetch all Confirmed and Hold bookings
    const bookings = await Booking.find({
      listing: listingId,
      status: { $in: ["Confirmed", "Hold"] },
    }).select("checkIn checkOut status user");

    const bookedDates = [];

    bookings.forEach((booking) => {
      // LOGIC: If the status is 'Hold' and it belongs to the user asking,
      // we DON'T add it to the bookedDates array (keep it selectable for them).
      const isMyHold =
        booking.status === "Hold" &&
        currentUserId &&
        booking.user.toString() === currentUserId;

      if (!isMyHold) {
        let startDate = moment(booking.checkIn).tz("America/Denver");
        const endDate = moment(booking.checkOut).tz("America/Denver");

        // Loop through dates and add to blocked list
        while (startDate.isBefore(endDate)) {
          bookedDates.push(startDate.format("YYYY-MM-DD"));
          startDate.add(1, "days");
        }
      }
    });

    res.json({ bookedDates });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Error fetching availability" });
  }
};

// Get all bookings for a user
// controllers/bookingController.js

export const getUserBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "No user found in request" });
    }

    // Explicitly cast to ObjectId to avoid String vs ObjectId mismatches
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const bookings = await Booking.find({ user: userId })
      .populate("listing", "title location price images")
      .sort({ createdAt: -1 });

    // Debugging: Log this in your terminal to see if the DB returns anything
    console.log(`Querying for ${userId}. Found: ${bookings.length} bookings`);

    res.json(bookings);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single booking by ID (Crucial for the success page polling)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId to prevent cast errors
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Booking ID format" });
    }

    const booking = await Booking.findById(id).populate(
      "listing",
      "title location price images host"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Security: Only allow the person who made the booking (or the host) to view it
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isHost = booking.listing.host.toString() === req.user._id.toString();

    if (!isOwner && !isHost && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Fetch Single Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings for a listing (Host View)
export const getListingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ listing: req.params.id }).populate(
      "user",
      "name email"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Authorization check
    if (
      booking.listing.host.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const adminBlockDates = async (req, res) => {
  try {
    // Check if the user has 'admin' role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { listingId } = req.params;
    const { startDate, endDate, reason } = req.body;

    const checkIn = moment.tz(startDate, "America/Denver").startOf("day");
    const checkOut = moment.tz(endDate, "America/Denver").startOf("day");

    if (!checkOut.isAfter(checkIn)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Prevent overlap (same logic as guests)
    const overlap = await Booking.findOne({
      listing: listingId,
      status: { $in: ["Confirmed", "Hold"] },
      checkIn: { $lt: checkOut.toDate() },
      checkOut: { $gt: checkIn.toDate() },
    });

    if (overlap) {
      return res.status(400).json({ message: "Dates already blocked" });
    }

    const adminBlock = await Booking.create({
      listing: listingId,
      user: req.user._id, // admin user
      name: "ADMIN BLOCK",
      phone: "N/A",
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
      checkIn,
      checkOut,
      subtotal: 0,
      tax: 0,
      totalPrice: 0,
      numberOfDays: checkOut.diff(checkIn, "days"),
      paymentTransactionId: `ADMIN-${Date.now()}`,
      status: "Confirmed",
      paymentStatus: "Completed",
      createdBy: "admin",
      blockReason: reason,
    });

    res.status(201).json(adminBlock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const adminRemoveBlock = async (req, res) => {
  try {
    // Check if the user has 'admin' role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.createdBy !== "admin") {
      return res.status(404).json({ message: "Admin block not found" });
    }

    await booking.deleteOne();
    res.json({ message: "Blocked dates removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getAdminCalendar = async (req, res) => {
  // Check if the user has 'admin' role
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  const bookings = await Booking.find({
    listing: req.params.listingId,
    status: "Confirmed",
  }).select("checkIn checkOut createdBy blockReason user");

  res.json(bookings);
};
