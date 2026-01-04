import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";
import moment from "moment-timezone";
import * as chrono from "chrono-node";

/**
 * 🔎 Simple intent detection
 */
const detectIntent = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes("available") || msg.includes("availability")) return "AVAILABILITY";
  if (msg.includes("price") || msg.includes("cost") || msg.includes("rate")) return "PRICING";
  if (msg.includes("contact") || msg.includes("email") || msg.includes("phone")) return "CONTACT";
  if (msg.includes("location") || msg.includes("where")) return "LOCATION";
  if (msg.includes("description") || msg.includes("about")) return "DESCRIPTION";
  if (msg.includes("book") || msg.includes("reserve")) return "BOOKING_HELP";

  // Natural language date detection (tomorrow, jan 4, next friday)
  const parsedDates = chrono.parse(msg);
  if (parsedDates.length > 0) return "CHECK_DATE";

  return "GENERAL";
};

/**
 * 📅 Find next available date (up to 30 days ahead)
 */
const findNextAvailableDate = async (listingId, requestedDate) => {
  let date = moment.tz(requestedDate, "America/Denver");

  for (let i = 0; i < 30; i++) {
    const overlapping = await Booking.findOne({
      listing: listingId,
      status: { $in: ["Confirmed", "Hold"] },
      checkIn: { $lt: date.clone().add(1, "day").toDate() },
      checkOut: { $gt: date.toDate() },
    });

    if (!overlapping) {
      return date.format("YYYY-MM-DD");
    }

    date.add(1, "day");
  }

  return null;
};

/**
 * 🤖 Chatbot Controller
 */
export const chatWithListingBot = async (req, res) => {
  try {
    const { message, listingId } = req.body;

    if (!message || !listingId) {
      return res.status(400).json({
        reply: "Missing message or listing ID.",
      });
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        reply: "Listing not found.",
      });
    }

    const intent = detectIntent(message);

    // ---------------- CHECK DATE ----------------
    if (intent === "CHECK_DATE") {
      const parsed = chrono.parse(message);

      if (!parsed.length) {
        return res.json({
          reply: "Please provide a valid date.",
        });
      }

      const requestedDate = parsed[0].start.date();
      const dateStr = moment(requestedDate).format("YYYY-MM-DD");

      const overlapping = await Booking.findOne({
        listing: listingId,
        status: { $in: ["Confirmed", "Hold"] },
        checkIn: { $lt: moment(requestedDate).add(1, "day").toDate() },
        checkOut: { $gt: moment(requestedDate).toDate() },
      });

      if (!overlapping) {
        return res.json({
          reply: `${dateStr} is available ✅ You can book it now.`,
        });
      }

      const alternative = await findNextAvailableDate(listingId, requestedDate);

      if (alternative) {
        return res.json({
          reply: `${dateStr} is already booked ❌. The next available date is ${alternative}.`,
        });
      }

      return res.json({
        reply: `${dateStr} is booked, and no alternative dates are available in the next 30 days.`,
      });
    }

    // ---------------- AVAILABILITY ----------------
    if (intent === "AVAILABILITY") {
      const activeBookings = await Booking.countDocuments({
        listing: listingId,
        status: { $in: ["Confirmed", "Hold"] },
      });

      if (activeBookings === 0) {
        return res.json({
          reply:
            "This property is currently available. You can select your dates on the calendar to proceed.",
        });
      }

      return res.json({
        reply:
          "Some dates are already booked or temporarily held. Ask me about a specific date!",
      });
    }

    // ---------------- PRICING ----------------
    if (intent === "PRICING") {
      return res.json({
        reply: `The nightly rate is $${listing.price}. Taxes and fees are calculated during checkout.`,
      });
    }

    // ---------------- CONTACT (HARDCODED) ----------------
    if (intent === "CONTACT") {
      return res.json({
        reply:
          "You can contact us directly:\n📞 Phone: +1 719-492-0042\n📧 Email: selahsprings48@gmail.com",
      });
    }

    // ---------------- LOCATION ----------------
    if (intent === "LOCATION") {
      return res.json({
        reply: `The property is located in ${listing.location}.`,
      });
    }

    // ---------------- DESCRIPTION ----------------
    if (intent === "DESCRIPTION") {
      return res.json({
        reply:
          listing.description ||
          "This listing does not currently have a detailed description.",
      });
    }

    // ---------------- BOOKING HELP ----------------
    if (intent === "BOOKING_HELP") {
      return res.json({
        reply:
          "To book this property, select your desired dates on the calendar and submit a booking request. Availability is updated in real time.",
      });
    }

    // ---------------- FALLBACK ----------------
    return res.json({
      reply:
        "I can help with pricing, availability, dates, location, and booking guidance. Try asking about a specific date!",
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      reply: "Sorry, something went wrong. Please try again later.",
    });
  }
};
