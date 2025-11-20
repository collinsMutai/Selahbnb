// controllers/bookingController.js
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";

// Create a booking
export const createBooking = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Calculate the total price based on price per night
    const totalPrice = listing.price * Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

    const booking = new Booking({
      listing: listingId,
      user: req.user._id, // Attach user from the auth middleware
      startDate,
      endDate,
      totalPrice,
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
