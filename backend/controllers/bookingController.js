import Booking from "../models/Booking.js";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 to generate unique IDs
import Listing from "../models/Listing.js"; // To fetch listing details
import { createPaypalPayment } from "./paypalController.js"; // Import PayPal payment method
import moment from 'moment-timezone';

// Define the check-in and check-out restrictions in Colorado Springs time (America/Denver timezone)
const HOUSE_RULES = {
  checkIn: { hour: 15, minute: 0 },  // 3:00 PM
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

    // If listing not found, return an error
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check for double booking - Same listing, overlapping dates
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      status: "Confirmed", // only consider confirmed bookings
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: "Dates are already booked." });
    }

      // Convert the check-in and check-out times to Colorado Springs time (America/Denver timezone)
  const checkInDate = moment.tz(checkIn, "America/Denver");
  const checkOutDate = moment.tz(checkOut, "America/Denver");

  // Ensure the check-in is after 3:00 PM Colorado Springs time
  if (checkInDate.hour() < HOUSE_RULES.checkIn.hour || 
      (checkInDate.hour() === HOUSE_RULES.checkIn.hour && checkInDate.minute() < HOUSE_RULES.checkIn.minute)) {
    return res.status(400).json({ message: "Check-in must be after 3:00 PM in Colorado Springs." });
  }

  // Ensure the check-out is before 11:00 AM Colorado Springs time
  if (checkOutDate.hour() > HOUSE_RULES.checkOut.hour || 
      (checkOutDate.hour() === HOUSE_RULES.checkOut.hour && checkOutDate.minute() > HOUSE_RULES.checkOut.minute)) {
    return res.status(400).json({ message: "Checkout must be before 11:00 AM in Colorado Springs." });
  }

    // Calculate the number of days between check-in and check-out
    const checkInDateJS = new Date(checkIn);
    const checkOutDateJS = new Date(checkOut);
    const numberOfDays = Math.ceil(
      (checkOutDateJS - checkInDateJS) / (1000 * 60 * 60 * 24)
    );

    // Calculate the total price based on price per night and number of days
    const totalPrice = listing.price * numberOfDays;

    // Generate a unique transaction ID (UUID) for local tracking
    const paymentTransactionId = uuidv4();

    // Create a new booking
    const booking = new Booking({
      listing: listingId,
      user: req.user._id, // Assuming user is attached to req by an auth middleware
      name,
      phone,
      checkIn,
      checkOut,
      adults,
      children,
      infants,
      pets,
      totalPrice,
      numberOfDays,
      paymentTransactionId, // Save the unique payment transaction ID
    });

    // Save the booking to the database
    const savedBooking = await booking.save();

    // Now trigger the PayPal payment flow after saving the booking
    // Call the createPaypalPayment function with the booking ID
    const paymentResponse = await createPaypalPayment({
      body: { bookingId: savedBooking._id, totalPrice },
    });

    // If payment creation was successful, return the booking and approval link
    if (paymentResponse.status === 200) {
      // Save the PayPal Order ID
      await Booking.findByIdAndUpdate(savedBooking._id, {
        paypalOrderId: paymentResponse.data.orderId,
      });

      res.status(201).json({
        booking: savedBooking,
        approvalLink: paymentResponse.data.approvalLink,
      });
    } else {
      res
        .status(paymentResponse.status)
        .json({ message: paymentResponse.message });
    }
  } catch (error) {
    console.error(
      "Error creating booking and initiating PayPal payment:",
      error
    );
    res
      .status(500)
      .json({
        message: "Error creating booking and initiating PayPal payment",
      });
  }
};

// Get all bookings for a user
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

// Get all bookings for a listing (for hosts to manage their bookings)
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

// Update booking status (Only admin or host can do this)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      booking.listing.host.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};











