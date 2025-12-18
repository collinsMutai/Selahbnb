import Booking from "../models/Booking.js";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 to generate unique IDs
import Listing from "../models/Listing.js"; // To fetch listing details
import { createPaypalPayment } from "./paypalController.js"; // Import PayPal payment method
import moment from "moment-timezone";

// Define the check-in and check-out restrictions in Colorado Springs time (America/Denver timezone)
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

    // If listing not found, return an error
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Convert the check-in and check-out times to Colorado Springs time
    const checkInDate = moment.tz(checkIn, "America/Denver");
    const checkOutDate = moment.tz(checkOut, "America/Denver");

    // Check for double booking - Same listing, overlapping dates
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      status: { $in: ["Confirmed", "Hold"] }, // Check for confirmed or held bookings
      checkIn: { $lt: new Date(checkOutDate) }, // Check if check-in of existing booking is before new check-out
      checkOut: { $gt: new Date(checkInDate) }, // Check if check-out of existing booking is after new check-in
    });

    // If the overlapping booking is held by the same user, allow the booking
    if (overlappingBooking && overlappingBooking.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Dates are already booked or held." });
    }

    // Calculate the number of days between check-in and check-out
    const checkInDateJS = new Date(checkInDate);
    const checkOutDateJS = new Date(checkOutDate);
    const numberOfDays = Math.ceil(
      (checkOutDateJS - checkInDateJS) / (1000 * 60 * 60 * 24)
    );

    // Colorado Springs / El Paso County lodging tax
    const TAX_RATE = 0.112; // 11.2%
    const subtotal = listing.price * numberOfDays;
    const taxAmount = Number((subtotal * TAX_RATE).toFixed(2));
    const totalPrice = Number((subtotal + taxAmount).toFixed(2));

    // Generate a unique transaction ID (UUID) for local tracking
    const paymentTransactionId = uuidv4();

    // Set the hold expiration time (15 minutes from now)
    const holdExpiration = moment().add(15, "minutes").toDate();

    // Create a new booking with "Hold" status
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
      subtotal,
      tax: taxAmount,
      totalPrice,
      numberOfDays,
      paymentTransactionId,
      status: "Hold", // Set status to "Hold"
      holdExpiration, // Set the expiration time for hold
    });

    // Save the booking to the database
    const savedBooking = await booking.save();

    // Now trigger the PayPal payment flow after saving the booking
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
        booking: {
          ...savedBooking._doc,
          subtotal: savedBooking.subtotal.toFixed(2),
          tax: savedBooking.tax.toFixed(2),
          totalPrice: savedBooking.totalPrice.toFixed(2),
        },
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

// Get availability for a listing (returns booked dates)

export const getListingAvailability = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const userId = req.user.id; // Assuming user is authenticated and user ID is available in the request
    console.log("listingId", listingId);

    // Fetch all confirmed and held bookings for the given listing
    const bookings = await Booking.find({
      listing: listingId,
      $or: [
        { status: "Confirmed" }, // Only consider confirmed bookings
        { status: "Held", user: userId }, // Allow the current user to book held dates
      ],
    }).select("checkIn checkOut status user");

    console.log("bookings", bookings);

    // Convert booked date ranges into a more usable format (Array of booked dates)
    const bookedDates = [];
    bookings.forEach((booking) => {
      const startDate = moment(booking.checkIn);
      const endDate = moment(booking.checkOut);

      // Iterate through the range of dates between checkIn and checkOut
      while (startDate.isBefore(endDate)) {
        bookedDates.push(startDate.format("YYYY-MM-DD")); // Add each date to the bookedDates array
        startDate.add(1, "days"); // Increment by 1 day
      }
    });

    // Return the booked dates
    res.json({ bookedDates });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Error fetching availability" });
  }
};
