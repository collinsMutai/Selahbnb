import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const bookingStatusCount = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenueByMonth = await Booking.aggregate([
      {
        $project: {
          month: { $month: "$checkIn" },
          year: { $year: "$checkIn" },
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const userDemographics = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalAdults: { $sum: "$adults" },
          totalChildren: { $sum: "$children" },
          totalInfants: { $sum: "$infants" },
          totalPets: { $sum: "$pets" },
        },
      },
    ]);

    res.json({
      totalBookings,
      bookingStatusCount,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalRevenueByMonth, // Added this data
      userDemographics: userDemographics[0] || {},
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};
