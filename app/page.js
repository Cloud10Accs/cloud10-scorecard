'use client';

import { useState, useEffect } from 'react';
import Scorecard from '@/components/Scorecard';

export default function Home() {
  const [data, setData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditorMode, setIsEditorMode] = useState(false);

  // Check editor mode from session storage
  useEffect(() => {
    const editorMode = sessionStorage.getItem('c10-editor-mode');
    setIsEditorMode(editorMode === 'true');
  }, []);

  // Fetch available weeks on mount
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await fetch('/api/sheets?action=weeks');
        const result = await response.json();
        if (result.success && result.weeks) {
          setAvailableWeeks(result.weeks);
          // Set to current week or latest week
          const today = new Date().toISOString().split('T')[0];
          const weekIndex = result.weeks.findIndex((w) => w >= today);
          const week = weekIndex !== -1 ? result.weeks[weekIndex] : result.weeks[0];
          setSelectedWeek(week);
        }
      } catch (err) {
        console.error('Error fetching weeks:', err);
      }
    };

    fetchWeeks();
  }, []);

  // Fetch data for selected week
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedWeek) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/sheets?week=${selectedWeek}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data || {});
        } else {
          setError('Could not load data. Running in demo mode.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading data. Using demo data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedWeek]);

  // Fetch historical data on mount
  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const response = await fetch('/api/sheets?action=history&weeks=12');
        const result = await response.json();

        if (result.success && result.data) {
          setHistoricalData(result.data);
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
      }
    };

    fetchHistorical();
  }, []);

  const handleSave = async (kpiData) => {
    if (!selectedWeek) return;

    try {
      const savePromises = Object.entries(kpiData).map(([dept, deptData]) =>
        fetch('/api/sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            week: selectedWeek,
            department: dept,
            data: deptData,
          }),
        })
      );

      const results = await Promise.all(savePromises);
      const allSuccessful = results.every((res) => res.ok);

      if (!allSuccessful) {
        throw new Error('One or more saves failed');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  };

  return (
    <div>
      {/* Week selector */}
      {availableWeeks.length > 0 && (
        <div className="bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <label className="text-sm font-semibold text-gray-300 block mb-2">
              Select Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-c10-pink"
            >
              {availableWeeks.map((week) => (
                <option key={week} value={week}>
                  Week ending {week}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Scorecard */}
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white border-r-c10-pink mb-4" />
            <p className="text-gray-400">Loading scorecard...</p>
          </div>
        </div>
      ) : (
        <Scorecard
          data={data}
          onSave={handleSave}
          historicalData={historicalData}
          isEditor={isEditorMode}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-900/50 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg max-w-sm">
          {error}
        </div>
      )}
    </div>
  );
}
