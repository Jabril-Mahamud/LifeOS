"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActivityHeatmap } from '../visualizations/activity-heatmap';
import { StreakCalendar } from '../visualizations/streak-calendar';

type HabitSummary = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  streak: number;
  completionRate: number;
  streakData: {
    date: string;
    completed: boolean;
  }[];
};

type JournalSummary = {
  totalEntries: number;
  hasEntryToday: boolean;
  moodDistribution: Record<string, number>;
  recentMoods: string[];
  heatmap: {
    date: string;
    mood: string;
    count: number;
  }[];
};

type DashboardSummary = {
  habits: HabitSummary[];
  journal: JournalSummary;
};

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-red-600 text-lg font-medium mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-700">{error}</p>
        <p className="mt-4 text-sm text-gray-600">
          Try refreshing the page or visiting your journal or habits pages directly.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/journal" className="text-blue-600 hover:text-blue-800">
            Go to Journal
          </Link>
          <Link href="/habits" className="text-blue-600 hover:text-blue-800">
            Go to Habits
          </Link>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium mb-2">No Dashboard Data</h2>
        <p className="text-gray-700">Start by creating habits and journal entries to see your dashboard statistics.</p>
        <div className="mt-6 flex gap-4">
          <Link href="/journal" className="text-blue-600 hover:text-blue-800">
            Create a Journal Entry
          </Link>
          <Link href="/habits" className="text-blue-600 hover:text-blue-800">
            Set Up Habits
          </Link>
        </div>
      </div>
    );
  }
  
  // Get today's date in a readable format
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedDate = dateFormatter.format(today);
  
  // Helper function to get mood emoji
  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      case 'calm': return '😌';
      case 'excited': return '🤩';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Your Dashboard</h1>
            <p className="text-gray-600">{formattedDate}</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {!summary.journal.hasEntryToday && (
              <Link 
                href="/journal" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Write Today's Journal
              </Link>
            )}
            <Link 
              href="/habits" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage Habits
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Habit Streaks</h2>
            <Link href="/habits" className="text-sm text-blue-600 hover:text-blue-800">
              View All Habits
            </Link>
          </div>
          
          {summary.habits.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-md">
              <p className="mb-2">You haven't created any habits yet.</p>
              <Link href="/habits" className="text-blue-600 hover:text-blue-800">
                Create your first habit
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.habits.map(habit => (
                <div 
                  key={habit.id} 
                  className="border border-gray-200 rounded-lg p-4"
                  style={{ borderLeftWidth: '4px', borderLeftColor: habit.color || '#4299e1' }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{habit.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{habit.name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${habit.completionRate}%`,
                              backgroundColor: habit.color || '#4299e1'
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{habit.completionRate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <StreakCalendar 
                      data={habit.streakData} 
                      color={habit.color || undefined}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Journal Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Journal Stats</h2>
            <Link href="/journal" className="text-sm text-blue-600 hover:text-blue-800">
              Go to Journal
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">Total entries</div>
              <div className="text-xl font-bold text-blue-800">{summary.journal.totalEntries}</div>
            </div>
            
            {summary.journal.heatmap.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Activity Calendar</h3>
                <ActivityHeatmap data={summary.journal.heatmap} numWeeks={8} />
              </div>
            )}
            
            {summary.journal.recentMoods.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent moods</h3>
                <div className="flex overflow-hidden">
                  {summary.journal.recentMoods.slice(0, 7).map((mood, index) => (
                    <div 
                      key={index} 
                      className="w-10 h-10 flex items-center justify-center rounded-full text-xl border-2 border-white -mr-2"
                      style={{ 
                        backgroundColor: '#f3f4f6',
                        zIndex: 7 - index 
                      }}
                    >
                      {getMoodEmoji(mood)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {Object.keys(summary.journal.moodDistribution).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mood distribution</h3>
                <div className="space-y-2">
                  {Object.entries(summary.journal.moodDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([mood, percentage]) => (
                      <div key={mood} className="flex items-center">
                        <span className="text-lg mr-2">{getMoodEmoji(mood)}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 capitalize">{mood}</span>
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-blue-600" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">Today's entry</div>
                <div>
                  {summary.journal.hasEntryToday ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tips and resources section */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-xl mb-2">📝</div>
            <h3 className="font-medium text-gray-900 mb-1">Journaling Tips</h3>
            <p className="text-sm text-gray-600">Writing for just 5 minutes a day can improve mental clarity and reduce stress.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-xl mb-2">⏱️</div>
            <h3 className="font-medium text-gray-900 mb-1">Building Habits</h3>
            <p className="text-sm text-gray-600">Start small and be consistent. It takes about 66 days to form a new habit.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-xl mb-2">📊</div>
            <h3 className="font-medium text-gray-900 mb-1">Track Progress</h3>
            <p className="text-sm text-gray-600">Regularly reviewing your journal entries helps identify patterns and progress.</p>
          </div>
        </div>
      </div>
    </div>
  );
}