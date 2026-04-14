// Analytics API service for fetching chart data
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators for realistic data
const generateRandomData = (base, variance = 0.2) => {
  const variation = base * variance;
  return Math.floor(base + (Math.random() - 0.5) * variation * 2);
};

const generatePeakHours = () => {
  const hours = [];
  for (let i = 8; i <= 18; i++) {
    const hour = i < 12 ? `${i}:00` : i === 12 ? '12:00' : `${i-12}:00`;
    const isPeakHour = i >= 9 && i <= 11 || i >= 14 && i <= 16;
    const baseVisitors = isPeakHour ? generateRandomData(20, 0.3) : generateRandomData(8, 0.4);
    hours.push({ hour, visitors: Math.max(0, baseVisitors) });
  }
  return hours;
};

const generateWeeklyTrends = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    visitors: generateRandomData(50, 0.4)
  }));
};

const generatePopularPurposes = () => {
  const purposes = [
    { purpose: "Patient Visit", baseCount: 450 },
    { purpose: "Doctor Appointment", baseCount: 320 },
    { purpose: "Consultation", baseCount: 280 },
    { purpose: "Emergency", baseCount: 120 },
    { purpose: "Other", baseCount: 80 },
  ];

  const total = purposes.reduce((sum, p) => sum + p.baseCount, 0);
  return purposes.map(p => ({
    purpose: p.purpose,
    count: generateRandomData(p.baseCount, 0.2),
    percentage: Math.round((p.baseCount / total) * 100)
  }));
};

// API functions
export const analyticsAPI = {
  // Fetch main analytics overview
  async getAnalyticsOverview() {
    await delay(800); // Simulate network delay

    const totalVisitors = generateRandomData(1250, 0.1);
    const todayVisitors = generateRandomData(45, 0.3);
    const weeklyVisitors = generateRandomData(320, 0.2);
    const monthlyVisitors = totalVisitors; // Same as total for this month
    const averageVisitTime = generateRandomData(45, 0.2);

    return {
      totalVisitors,
      todayVisitors,
      weeklyVisitors,
      monthlyVisitors,
      averageVisitTime,
      lastUpdated: new Date().toISOString()
    };
  },

  // Fetch peak hours data
  async getPeakHoursData() {
    await delay(600);
    return {
      peakHours: generatePeakHours(),
      lastUpdated: new Date().toISOString()
    };
  },

  // Fetch popular visit purposes
  async getPopularPurposes() {
    await delay(500);
    return {
      popularPurposes: generatePopularPurposes(),
      lastUpdated: new Date().toISOString()
    };
  },

  // Fetch weekly trends
  async getWeeklyTrends() {
    await delay(700);
    return {
      weeklyTrends: generateWeeklyTrends(),
      lastUpdated: new Date().toISOString()
    };
  },

  // Fetch all analytics data in one call
  async getAllAnalytics() {
    try {
      const [overview, peakHours, purposes, trends] = await Promise.all([
        this.getAnalyticsOverview(),
        this.getPeakHoursData(),
        this.getPopularPurposes(),
        this.getWeeklyTrends()
      ]);

      return {
        ...overview,
        peakHours: peakHours.peakHours,
        popularPurposes: purposes.popularPurposes,
        weeklyTrends: trends.weeklyTrends,
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw new Error('Failed to fetch analytics data');
    }
  },

  // Fetch real-time visitor count (for live updates)
  async getRealtimeVisitors() {
    await delay(200);
    return {
      currentVisitors: generateRandomData(23, 0.5),
      timestamp: new Date().toISOString()
    };
  },

  // Fetch visitor trends over time (for line charts)
  async getVisitorTrends(period = '7d') {
    await delay(1000);
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        visitors: generateRandomData(45, 0.3),
        checkIns: generateRandomData(42, 0.3),
        checkOuts: generateRandomData(40, 0.3)
      });
    }

    return {
      period,
      trends,
      lastUpdated: new Date().toISOString()
    };
  }
};

export default analyticsAPI;