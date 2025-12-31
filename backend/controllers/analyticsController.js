import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  try {
    // Total Bookings
    const totalBookings = await Booking.countDocuments();

    // Booking Status Breakdown
    const bookingStatusCount = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Revenue Breakdown
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // User Demographics (adults, children, infants, pets)
    const userDemographics = await Booking.aggregate([
      { $group: { _id: null, totalAdults: { $sum: "$adults" }, totalChildren: { $sum: "$children" }, totalInfants: { $sum: "$infants" }, totalPets: { $sum: "$pets" } } }
    ]);

    res.json({
      totalBookings,
      bookingStatusCount,
      totalRevenue: totalRevenue[0]?.total || 0,
      userDemographics: userDemographics[0] || {}
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};
