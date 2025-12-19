// controllers/bookingController.js
import Booking from "../models/Booking.js";
import { v4 as uuidv4 } from "uuid";
import Listing from "../models/Listing.js";
import { createPaypalPayment } from "./paypalController.js";
import moment from "moment-timezone";

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

    const checkInDate = moment.tz(checkIn, "America/Denver");
    const checkOutDate = moment.tz(checkOut, "America/Denver");

    // Check for double booking
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      status: { $in: ["Confirmed", "Hold"] },
      checkIn: { $lt: new Date(checkOutDate) },
      checkOut: { $gt: new Date(checkInDate) },
    });

    // logic: If overlapping booking exists, only allow if it belongs to the SAME user
    if (overlappingBooking && overlappingBooking.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Dates are already booked or held." });
    }

    const numberOfDays = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );

    const TAX_RATE = 0.112; 
    const subtotal = listing.price * numberOfDays;
    const taxAmount = Number((subtotal * TAX_RATE).toFixed(2));
    const totalPrice = Number((subtotal + taxAmount).toFixed(2));

    const paymentTransactionId = uuidv4();
    const holdExpiration = moment().add(15, "minutes").toDate();

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
      status: "Hold",
      holdExpiration,
    });

    const savedBooking = await booking.save();

    const paymentResponse = await createPaypalPayment({
      body: { bookingId: savedBooking._id, totalPrice },
    });

    if (paymentResponse.status === 200) {
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
      res.status(paymentResponse.status).json({ message: paymentResponse.message });
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking and initiating payment" });
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
      const isMyHold = booking.status === "Hold" && 
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
    if (booking.listing.host.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};