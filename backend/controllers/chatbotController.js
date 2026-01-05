import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";
import moment from "moment-timezone";
import * as chrono from "chrono-node";

/**
 * 🔎 Simple intent detection (FIXED)
 */
const detectIntent = (message) => {
  const msg = message.toLowerCase().trim();

  // Normalize odd date orders: "dec 2025 25" → "dec 25 2025"
  const normalizedMsg = msg.replace(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{4})\s+(\d{1,2})\b/i,
    "$1 $3 $2"
  );

  // ✅ DATE DETECTION FIRST (important)
  const parsedDates = chrono.parse(normalizedMsg, new Date(), {
    forwardDate: true,
  });

  if (parsedDates.length > 0) return "CHECK_DATE";

  if (msg.includes("available") || msg.includes("availability")) return "AVAILABILITY";
  if (msg.includes("price") || msg.includes("cost") || msg.includes("rate")) return "PRICING";
  if (msg.includes("contact") || msg.includes("email") || msg.includes("phone")) return "CONTACT";
  if (msg.includes("location") || msg.includes("where")) return "LOCATION";
  if (msg.includes("description") || msg.includes("about")) return "DESCRIPTION";
  if (msg.includes("book") || msg.includes("reserve")) return "BOOKING_HELP";

  return "GENERAL";
};

/**
 * 📅 Find next available date (up to 30 days ahead)
 */
const findNextAvailableDate = async (listingId, requestedDate) => {
  let date = moment.tz(requestedDate, "America/Denver").startOf("day");

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
      const parsed = chrono.parse(message, new Date(), { forwardDate: true });

      if (!parsed.length || !parsed[0].start) {
        return res.json({
          reply: "Please provide a valid future date.",
        });
      }

      const requestedDate = moment
        .tz(parsed[0].start.date(), "America/Denver")
        .startOf("day");

      const today = moment.tz("America/Denver").startOf("day");

      // 🚫 Block past dates
      if (requestedDate.isBefore(today)) {
        return res.json({
          reply: "❌ You can’t check past dates. Please choose a future date.",
        });
      }

      const dateStr = requestedDate.format("YYYY-MM-DD");

      const overlapping = await Booking.findOne({
        listing: listingId,
        status: { $in: ["Confirmed", "Hold"] },
        checkIn: { $lt: requestedDate.clone().add(1, "day").toDate() },
        checkOut: { $gt: requestedDate.toDate() },
      });

      if (!overlapping) {
        return res.json({
          reply: `${dateStr} is available ✅ You can book it now.`,
        });
      }

      const alternative = await findNextAvailableDate(
        listingId,
        requestedDate.toDate()
      );

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

    // ---------------- CONTACT ----------------
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
