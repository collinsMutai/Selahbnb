import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalBookings: 0,
    bookingStatusCount: [],
    totalRevenue: 0,
    userDemographics: {}
  });

  useEffect(() => {
    // Fetch data from backend API
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('/api/analytics', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Ensure token is passed in headers for auth
          }
        });
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching analytics data', error);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Chart Data for Total Revenue (Bar Chart)
  const revenueData = {
    labels: ['Total Revenue'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [analyticsData.totalRevenue],
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Chart Data for Booking Status (Pie Chart)
  const statusData = {
    labels: analyticsData.bookingStatusCount.map(status => status._id),
    datasets: [
      {
        data: analyticsData.bookingStatusCount.map(status => status.count),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0'],
        hoverBackgroundColor: ['#ff5f66', '#4ba2e1', '#ffbc6b', '#4ba6a7'],
      },
    ],
  };

  // Chart Data for User Demographics (Bar Chart)
  const demographicsData = {
    labels: ['Adults', 'Children', 'Infants', 'Pets'],
    datasets: [
      {
        label: 'Count',
        data: [
          analyticsData.userDemographics.totalAdults || 0,
          analyticsData.userDemographics.totalChildren || 0,
          analyticsData.userDemographics.totalInfants || 0,
          analyticsData.userDemographics.totalPets || 0,
        ],
        backgroundColor: '#36a2eb',
        borderColor: '#36a2eb',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="analytics-dashboard">
      <h2>Admin Analytics Dashboard</h2>

      <div className="chart-container">
        <h3>Total Revenue</h3>
        <Bar data={revenueData} />

        <h3>Booking Status Breakdown</h3>
        <Pie data={statusData} />

        <h3>User Demographics</h3>
        <Bar data={demographicsData} />
      </div>
    </div>
  );
};

export default Analytics;
