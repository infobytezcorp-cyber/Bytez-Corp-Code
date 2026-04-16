// Custom hook for analytics data management
import { useState, useEffect, useCallback } from 'react';
import analyticsAPI from '../services/analyticsAPI';

export const useAnalytics = () => {
  const [data, setData] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    weeklyVisitors: 0,
    monthlyVisitors: 0,
    averageVisitTime: 0,
    peakHours: [],
    popularPurposes: [],
    weeklyTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [realtimeData, setRealtimeData] = useState({
    currentVisitors: 0,
    timestamp: null
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyticsAPI.getAllAnalytics();
      setData(result);
      setLastUpdated(new Date(result.fetchedAt));
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRealtimeData = useCallback(async () => {
    try {
      const result = await analyticsAPI.getRealtimeVisitors();
      setRealtimeData(result);
    } catch (err) {
      console.error('Failed to fetch realtime data:', err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchRealtimeData, 30000);
    fetchRealtimeData(); // Initial fetch

    return () => clearInterval(interval);
  }, [fetchRealtimeData]);

  const refresh = () => {
    fetchAnalytics();
    fetchRealtimeData();
  };

  return {
    data: { ...data, ...realtimeData },
    loading,
    error,
    lastUpdated,
    refresh,
    realtimeData
  };
};

export default useAnalytics;