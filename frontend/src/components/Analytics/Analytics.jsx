import React, { useState, useEffect } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; // Add ArcElement here
import axios from "axios";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
); // Add ArcElement here

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalBookings: 0,
    bookingStatusCount: [],
    totalRevenue: 0,
    userDemographics: {},
  });

  useEffect(() => {
    // Fetch data from backend API
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/analytics`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is passed in headers for auth
            },
          }
        );
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Error fetching analytics data", error);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Chart Data for Total Revenue (Bar Chart)
const revenueData = {
  labels: (analyticsData.totalRevenueByMonth || []).map(
    (item) => `${item._id.month}-${item._id.year}`
  ),
  datasets: [
    {
      label: "Revenue ($)",
      data: (analyticsData.totalRevenueByMonth || []).map(
        (item) => item.totalRevenue
      ),
      backgroundColor: ["rgba(75, 192, 192, 0.2)"],
      borderColor: ["rgba(75, 192, 192, 1)"],
      borderWidth: 1,
    },
  ],
};

  // Chart Data for Booking Status (Pie Chart)
  const statusData = {
    labels: analyticsData.bookingStatusCount.map((status) => status._id),
    datasets: [
      {
        data: analyticsData.bookingStatusCount.map((status) => status.count),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"],
        hoverBackgroundColor: ["#ff5f66", "#4ba2e1", "#ffbc6b", "#4ba6a7"],
      },
    ],
  };

  // Chart Data for User Demographics (Bar Chart)
  const demographicsData = {
    labels: ["Adults", "Children", "Infants", "Pets"],
    datasets: [
      {
        label: "Count",
        data: [
          analyticsData.userDemographics.totalAdults || 0,
          analyticsData.userDemographics.totalChildren || 0,
          analyticsData.userDemographics.totalInfants || 0,
          analyticsData.userDemographics.totalPets || 0,
        ],
        backgroundColor: "#36a2eb",
        borderColor: "#36a2eb",
        borderWidth: 1,
      },
    ],
  };

  // Chart Options for consistent styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true, // Keep aspect ratio
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Analytics Data",
      },
    },
    // Using onResize to explicitly reset chart size when resizing
    onResize: (chart) => {
      const width = chart.canvas.parentNode.clientWidth;
      const height = chart.canvas.parentNode.clientHeight;
      chart.canvas.width = width;
      chart.canvas.height = height;
    },
  };

  return (
    <div className="analytics-dashboard">
      <div
        className="chart-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {/* Total Revenue Bar Chart */}
        <div style={{ height: 400, width: 350 }}>
          <h3>Total Revenue</h3>
          <Bar
            data={revenueData}
            options={chartOptions}
            width={300} // Set chart width
            height={300} // Set chart height
          />
        </div>

        {/* Booking Status Pie Chart */}
        <div style={{ height: 400, width: 350 }}>
          <h3>Booking Status</h3>
          <Pie
            data={statusData}
            options={chartOptions}
            width={300} // Set chart width
            height={300} // Set chart height
          />
        </div>

        {/* User Demographics Bar Chart */}
        <div style={{ height: 400, width: 350 }}>
          <h3>User Demographics</h3>
          <Bar
            data={demographicsData}
            options={chartOptions}
            width={300} // Set chart width
            height={300} // Set chart height
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
