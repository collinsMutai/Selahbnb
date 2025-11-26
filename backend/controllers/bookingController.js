import Booking from "../models/Booking.js";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 to generate unique IDs
import Listing from "../models/Listing.js"; // To fetch listing details
import { createPaypalPayment } from './paypalController.js'; // Import PayPal payment method

// Create a new booking and initiate PayPal payment
export const createBooking = async (req, res) => {
  try {
    const { listingId, name, phone, checkIn, checkOut, adults, children, infants, pets } = req.body;
    const listing = await Listing.findById(listingId);

    // If listing not found, return an error
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Calculate the number of days between check-in and check-out
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Calculate the total price based on price per night and number of days
    const totalPrice = listing.price * numberOfDays;

    // Generate a unique transaction ID using uuidv4
    const paymentTransactionId = uuidv4();

    // Create a new booking
    const booking = new Booking({
      listing: listingId,
      user: req.user._id,  // Assuming user is attached to req by an auth middleware
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
      paymentTransactionId,  // Save the unique payment transaction ID
    });

    // Save the booking to the database
    const savedBooking = await booking.save();

    // Now trigger the PayPal payment flow after saving the booking
    // Call the createPaypalPayment function with the booking ID
    const paymentResponse = await createPaypalPayment({ body: { bookingId: savedBooking._id } });

    // If payment creation was successful, return the booking and approval link
    if (paymentResponse.status === 200) {
      res.status(201).json({
        booking: savedBooking,
        approvalLink: paymentResponse.data.approvalLink,
      });
    } else {
      res.status(paymentResponse.status).json({ message: paymentResponse.message });
    }

  } catch (error) {
    console.error('Error creating booking and initiating PayPal payment:', error);
    res.status(500).json({ message: 'Error creating booking and initiating PayPal payment' });
  }
};


// Get all bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing", "title location price").populate("user", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings for a listing (for hosts to manage their bookings)
export const getListingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ listing: req.params.id }).populate("user", "name email");
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

    if (booking.listing.host.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
