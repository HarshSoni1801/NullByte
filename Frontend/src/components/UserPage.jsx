import React, { useState, useEffect } from 'react';
import ProfileEditModal from './ProfileEditModal';
import { useSelector } from 'react-redux';
import axiosClient from '../axiosClient';
import { Github, Linkedin, Calendar, Flame, Code2, CheckCircle, Clock, Mail, User } from 'lucide-react';

const UserPage = () => {
  const [profileData, setProfileData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [profileResponse, statsResponse, activityResponse] = await Promise.all([
          axiosClient.get(`/user/profile/${currentUser._id}`),
          axiosClient.get(`/user/profile/getStats/${currentUser._id}`),
          axiosClient.get(`/user/profile/getActivity/${currentUser._id}`)
        ]);

        setProfileData(profileResponse.data.user);
        setStats(statsResponse.data);
        setActivityData(activityResponse.data.activity || []);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [currentUser]);
  console.log(profileData);
  const handleProfileUpdated = () => {
    window.location.reload();
  };

  // Calculate streak from activity data
  const calculateStreak = () => {
    if (!activityData.length) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const dates = activityData.map(a => a.date).sort().reverse(); //extracting just date in descending order
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

// Utility function to convert UTC date to local date string
const utcToLocalDateString = (utcDateString) => {
  const date = new Date(utcDateString);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

// Updated calendar generation
const generateCurrentMonthCalendar = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDay.getDate();
  
  const monthName = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  
  const calendarDays = [];
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    // Add empty cells for days before the first day of month. Calendars don't always start on Sunday. If January 1st is a Wednesday, we need 3 empty cells for Sun, Mon, Tue.
    calendarDays.push({ day: null, activity: 0, solvedProblem: false }); 
  }
  
  // Convert all activity dates to local timezone once
  const localActivityData = activityData.map(activity => ({
    ...activity,
    localDate: utcToLocalDateString(activity.date + 'T00:00:00Z')
  }));
  
  for (let day = 1; day <= totalDays; day++) {
     // Create date string like "2024-01-15"
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Check if user was active on this day
    const dayActivity = localActivityData.find(activity => activity.localDate === dateStr);
    
    calendarDays.push({
      day: day,
      activity: dayActivity ? dayActivity.count : 0,
      solvedProblem: dayActivity ? dayActivity.solvedProblem : false,
      isToday: day === today.getDate() && currentMonth === today.getMonth()
    });
  }
  
  return { monthName, year, calendarDays };
};

  const currentStreak = calculateStreak();
  const calendar = generateCurrentMonthCalendar();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center" style={{ paddingTop: '6rem' }}>
        <div className="animate-spin rounded-full border-t-3 border-b-3 border-red-500 w-20 h-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center" style={{ paddingTop: '6rem' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Error Loading Profile</h2>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-300 p-4" style={{ paddingTop: '7rem' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* 3-Column Layout - Reduced spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Profile Info - Compact */}
          <div className="bg-zinc-800/50 rounded-xl p-6 shadow-lg">
            {/* Profile Picture - Smaller */}
            <div className="flex flex-col items-center mb-4">
              <img
                src={profileData?.avatarUrl || '/Avatars/default.jpg'}
                alt="User Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow-lg mb-4"
              />
              
              {/* Name and Email - Compact */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-zinc-100 mb-1">
                  {profileData?.firstName} {profileData?.lastName}
                </h1>
                
                <div className="flex items-center justify-center space-x-1 text-zinc-400 mb-2 text-sm">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{profileData?.emailId}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-1 text-zinc-400 mb-3 text-sm">
                  <User className="w-3 h-3" />
                  <span className="capitalize">{profileData?.role || 'User'}</span>
                </div>
                
                {/* Streak - Smaller */}
                <div className="flex items-center justify-center space-x-1 text-yellow-400 mb-4 text-sm">
                  <Flame className="w-4 h-4" />
                  <span className="font-semibold">{currentStreak} day streak</span>
                </div>
              </div>
            </div>

            {/* About Me Section - Compact */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-zinc-100 mb-2">About Me</h2>
              <div className="bg-zinc-700/30 rounded-lg p-3 min-h-[80px] max-h-[100px] overflow-y-auto">
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {profileData?.about || 'No description added yet. Click Edit Profile to add information about yourself.'}
                </p>
              </div>
            </div>

            {/* Social Links - Compact */}
            {(profileData?.socialLinks?.github || profileData?.socialLinks?.linkedin) && (
              <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-100 mb-2">Social Links</h2>
                <div className="flex space-x-2">
                  {profileData.socialLinks.github && (
                    <a
                      href={profileData.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-xs transition-colors flex-1 justify-center"
                    >
                      <Github className="w-3 h-3" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profileData.socialLinks.linkedin && (
                    <a
                      href={profileData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-xs transition-colors flex-1 justify-center"
                    >
                      <Linkedin className="w-3 h-3" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Language Preference - Compact */}
            {profileData?.languagePreference && profileData.languagePreference !== 'None' && (
              <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-100 mb-2">Preferred Language</h2>
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {profileData.languagePreference}
                </span>
              </div>
            )}

            {/* Edit Profile Button - Smaller */}
            <button
              className="w-full mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Code2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Column 2: Coding Stats - Compact */}
          <div className="bg-zinc-800/50 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-bold text-zinc-100 mb-4 text-center">Coding Stats</h2>
            
            <div className="space-y-4">
              {/* Total Solved - Smaller */}
              <div className="text-center p-3 bg-zinc-700/30 rounded-lg">
                <div className="text-3xl font-bold text-green-400 mb-1">{stats?.totalSolved || 0}</div>
                <div className="text-zinc-400 text-sm">Problems Solved</div>
              </div>
              
              {/* Difficulty Breakdown - Compact */}
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-zinc-700/20 rounded text-sm">
                  <span className="text-blue-400 font-semibold">Easy</span>
                  <span className="font-bold">{stats?.easySolved || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-700/20 rounded text-sm">
                  <span className="text-yellow-400 font-semibold">Medium</span>
                  <span className="font-bold">{stats?.mediumSolved || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-700/20 rounded text-sm">
                  <span className="text-red-400 font-semibold">Hard</span>
                  <span className="font-bold">{stats?.hardSolved || 0}</span>
                </div>
              </div>

              {/* Total Submissions - Smaller */}
              <div className="text-center p-3 bg-zinc-700/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">{stats?.totalSubmissions || 0}</div>
                <div className="text-zinc-400 text-sm">Total Submissions</div>
              </div>

              {/* Recent Submission - Compact */}
              {stats?.recentSubmission && (
                <div className="p-3 bg-zinc-700/30 rounded-lg">
                  <div className="flex items-center space-x-1 text-zinc-400 mb-2 text-xs">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">Recent Submission</span>
                  </div>
                  <div className="font-medium text-zinc-200 text-xs mb-1 truncate">{stats.recentSubmission.problemName}</div>
                  <div className="text-zinc-400 text-xs">{stats.recentSubmission.language}</div>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Activity Calendar - Compact */}
          <div className="bg-zinc-800/50 rounded-xl p-4 shadow-lg">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-zinc-100 mb-1 flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">{calendar.monthName} {calendar.year}</span>
              </h2>
              <p className="text-zinc-400 text-xs">Days active this month</p>
            </div>
            
            {/* Days of Week Header - Smaller */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-zinc-500 text-xs font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - Smaller cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendar.calendarDays.map((dayInfo, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded flex items-center justify-center text-xs ${
                    dayInfo.day === null 
                      ? 'invisible' 
                      : dayInfo.isToday
                      ? 'border border-red-500'
                      : dayInfo.activity > 0
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-700 text-zinc-400'
                  } ${
                    dayInfo.activity === 1 ? 'bg-green-500' :
                    dayInfo.activity === 2 ? 'bg-green-600' :
                    dayInfo.activity >= 3 ? 'bg-green-700' : ''
                  }`}
                  title={dayInfo.day ? `Day ${dayInfo.day}: ${dayInfo.activity} activities` : ''}
                >
                  {dayInfo.day}
                </div>
              ))}
            </div>

            {/* Activity Legend - Compact */}
            <div className="mt-4 p-3 bg-zinc-700/30 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-400">Less</span>
                <span className="text-zinc-400">More</span>
              </div>
              <div className="flex space-x-1 mb-2">
                <div className="flex-1 h-1 bg-zinc-700 rounded"></div>
                <div className="flex-1 h-1 bg-green-500 rounded"></div>
                <div className="flex-1 h-1 bg-green-600 rounded"></div>
                <div className="flex-1 h-1 bg-green-700 rounded"></div>
              </div>
              
              {/* Monthly Summary - Smaller */}
              <div className="text-center">
                <div className="text-md font-bold text-green-400">
                  {activityData.filter(a => a.date.startsWith(`${calendar.year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)).length}
                </div>
                <div className="text-zinc-400 text-xs">Active days this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <ProfileEditModal
          initialData={profileData}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default UserPage;