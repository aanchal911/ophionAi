
import React, { useState, useEffect } from 'react';
import { Theme, Task, ThemeId, User } from '../types';
import { MOCK_TASKS } from '../constants';
import { 
    Calendar as CalendarIcon, Clock, Bell, Sparkles, AlertCircle, 
    CheckCircle2, ChevronRight, ChevronLeft, Plus, MapPin, Activity
} from 'lucide-react';
import { smartReschedule } from '../services/geminiService';
import { subscribeToTasks } from '../services/firebase';

interface WeeklyPlannerProps {
  theme: Theme;
  user: User;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ theme, user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // The date currently being viewed
  const [now, setNow] = useState(new Date()); // The actual real-time "now"
  const [rescheduling, setRescheduling] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Clock Tick
    const timer = setInterval(() => setNow(new Date()), 60000); // Every minute
    
    // Notification Permission
    if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
    
    // Subscribe to Tasks
    const unsubscribe = subscribeToTasks(user.uid, (data) => {
        setTasks(data);
    });

    return () => {
        clearInterval(timer);
        unsubscribe();
    };
  }, [user.uid]);

  // --- DATE HELPERS ---
  
  // Get the Monday of the week for the selected date
  const getStartOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
  };

  const startOfViewWeek = getStartOfWeek(currentDate);

  // Generate the 7 days for the main grid view
  const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfViewWeek);
      d.setDate(startOfViewWeek.getDate() + i);
      return d;
  });

  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getDate() === d2.getDate() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getFullYear() === d2.getFullYear();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // --- HEATMAP & ACTIVITY LOGIC ---
  const getTaskIntensity = (date: Date) => {
      const dateString = date.toISOString().split('T')[0];
      const dayName = WEEK_DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
      
      const count = tasks.filter(t => {
          // Check explicit YYYY-MM-DD
          if (t.dueDate === dateString) return true;
          // Check 'Today'
          if (t.dueDate === 'Today' && isSameDay(date, new Date())) return true;
          // Check Weekday Name (simplified: assume it repeats weekly for this view logic)
          // We map the generic 'Monday' task to any Monday in the calendar for visualization
          if (t.day === dayName) return true;
          
          return false;
      }).length;

      return count;
  };

  const getHeatmapStyle = (intensity: number, isSelected: boolean, isTodayDate: boolean) => {
      // Base styles
      if (isTodayDate) return 'bg-red-500 text-white font-bold ring-2 ring-red-300';
      if (isSelected) return 'bg-blue-500 text-white ring-2 ring-blue-300';
      
      if (intensity === 0) return 'hover:bg-black/5 dark:hover:bg-white/10';

      // Theme-aware Heatmap Colors
      const isRedTheme = theme.id === ThemeId.STRANGER;
      const isPurpleTheme = theme.id === ThemeId.NEON_VIBE || theme.id === ThemeId.ANIME;
      const isBlueTheme = theme.id === ThemeId.MIDNIGHT || theme.id === ThemeId.CYBER || theme.id === ThemeId.OCEAN;
      
      if (isRedTheme) {
          if (intensity <= 2) return 'bg-red-900/40 text-red-100';
          if (intensity <= 4) return 'bg-red-800/60 text-white font-medium';
          return 'bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(220,38,38,0.4)]';
      }
      if (isPurpleTheme) {
          if (intensity <= 2) return 'bg-purple-500/20 text-purple-700 dark:text-purple-200';
          if (intensity <= 4) return 'bg-purple-500/40 text-purple-900 dark:text-white font-medium';
          return 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]';
      }
      if (isBlueTheme) {
          if (intensity <= 2) return 'bg-blue-500/20 text-blue-700 dark:text-blue-200';
          if (intensity <= 4) return 'bg-blue-500/40 text-blue-900 dark:text-white font-medium';
          return 'bg-blue-600 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.4)]';
      }
      
      // Default (Green/Emerald) for Zen/Olympus/Minimal
      if (intensity <= 2) return 'bg-emerald-400/30 text-emerald-800 dark:text-emerald-100';
      if (intensity <= 4) return 'bg-emerald-500/60 text-emerald-900 dark:text-white font-medium';
      return 'bg-emerald-600 text-white font-bold';
  };

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkTasks = () => {
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const todayName = WEEK_DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Fix Sun=0 index

        tasks.forEach(task => {
            if (task.day === todayName && task.startTime) {
                const [h, m] = task.startTime.split(':').map(Number);
                // Trigger notification if it's start time matching exactly
                if (h === currentHour && m === currentMin) {
                    new Notification(`OphionAI: ${task.title}`, {
                        body: `Starting now! (${task.duration} min)`,
                        icon: '/favicon.ico' 
                    });
                }
            }
        });
    };

    const interval = setInterval(checkTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks, notificationPermission, now]);

  const requestNotify = () => {
      Notification.requestPermission().then(setNotificationPermission);
  };

  const handleReschedule = async () => {
      setRescheduling(true);
      const unscheduled = tasks.filter(t => !t.startTime && !t.completed);
      const scheduled = tasks.filter(t => t.startTime);
      const optimizedTasks = await smartReschedule(unscheduled, scheduled);
      
      setTasks(prev => prev.map(t => {
          const optimized = optimizedTasks.find(opt => opt.id === t.id);
          return optimized || t;
      }));
      setRescheduling(false);
  };

  // --- STYLE HELPERS ---
  const getBlockStyle = (startTime: string, duration: number = 60) => {
      const [h, m] = startTime.split(':').map(Number);
      const startHour = 6; 
      const pixelsPerHour = 60; 
      
      const top = ((h - startHour) * pixelsPerHour) + m;
      const height = duration; 

      return { top: `${top}px`, height: `${height}px` };
  };

  const getCurrentTimeTop = () => {
      const h = now.getHours();
      const m = now.getMinutes();
      const startHour = 6;
      if (h < startHour || h > 22) return -1; 
      return ((h - startHour) * 60) + m;
  };

  // --- MINI CALENDAR RENDERER ---
  const renderMiniCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Adjust start day (0=Sun, we want 1=Mon as first col if following ISO, but standard cal usually starts Sun. Let's stick to Sun start for mini cal)
      const startDay = firstDayOfMonth.getDay(); // 0 is Sunday
      
      const days = [];
      // Empty slots for previous month
      for (let i = 0; i < startDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-6 w-6" />);
      }
      
      // Days of month
      for (let i = 1; i <= daysInMonth; i++) {
          const dateToCheck = new Date(year, month, i);
          const isSelected = isSameDay(dateToCheck, currentDate);
          const isTodayDate = isToday(dateToCheck);
          const intensity = getTaskIntensity(dateToCheck);

          days.push(
              <button 
                  key={i} 
                  onClick={() => setCurrentDate(dateToCheck)}
                  className={`
                    h-6 w-6 text-[10px] rounded-full flex items-center justify-center transition-all
                    ${getHeatmapStyle(intensity, isSelected, isTodayDate)}
                  `}
                  title={`${intensity} tasks on ${dateToCheck.toDateString()}`}
              >
                  {i}
              </button>
          );
      }

      return (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                  <span className={`font-bold text-sm ${theme.textPrimary}`}>
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex gap-1">
                      <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-black/5 rounded"><ChevronLeft size={12}/></button>
                      <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-black/5 rounded"><ChevronRight size={12}/></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S','M','T','W','T','F','S'].map(d => (
                      <span key={d} className="text-[10px] opacity-50 font-bold">{d}</span>
                  ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                  {days}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                  <span className="text-[10px] opacity-50 flex items-center gap-1"><Activity size={10}/> Activity</span>
                  <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-sm ${getHeatmapStyle(0, false, false).split(' ')[0] || 'bg-gray-200 dark:bg-white/10'}`}></div>
                      <div className={`w-2 h-2 rounded-sm ${getHeatmapStyle(2, false, false).split(' ')[0]}`}></div>
                      <div className={`w-2 h-2 rounded-sm ${getHeatmapStyle(4, false, false).split(' ')[0]}`}></div>
                      <div className={`w-2 h-2 rounded-sm ${getHeatmapStyle(6, false, false).split(' ')[0]}`}></div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto mb-20 md:mb-0 h-screen overflow-hidden flex flex-col">
        
        {/* Header with Navigation */}
        <header className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className={`text-3xl font-serif font-bold ${theme.textPrimary}`}>Weekly Planner</h2>
                    <div className="flex items-center gap-2 text-sm opacity-60">
                         <CalendarIcon size={14} />
                         <span>{startOfViewWeek.toLocaleDateString()} - {weekDates[6].toLocaleDateString()}</span>
                    </div>
                </div>
                
                {/* Date Navigation Controls */}
                <div className={`hidden md:flex items-center gap-1 p-1 rounded-xl border ${theme.borderClass} ${theme.cardClass}`}>
                    <button onClick={() => navigateWeek('prev')} className={`p-2 rounded-lg hover:bg-black/5 ${theme.textPrimary}`}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={goToToday} className={`px-3 py-1 text-xs font-bold rounded-md hover:bg-black/5 ${theme.textPrimary}`}>
                        Today
                    </button>
                    <button onClick={() => navigateWeek('next')} className={`p-2 rounded-lg hover:bg-black/5 ${theme.textPrimary}`}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                {notificationPermission !== 'granted' && (
                    <button onClick={requestNotify} className="p-2 rounded-xl bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30" title="Enable Notifications">
                        <Bell size={20} />
                    </button>
                )}
                <button 
                    onClick={handleReschedule}
                    disabled={rescheduling}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all
                    bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-110 disabled:opacity-50`}
                >
                    <Sparkles size={16} className={rescheduling ? 'animate-spin' : ''} />
                    {rescheduling ? 'Optimizing...' : 'AI Auto-Schedule'}
                </button>
            </div>
        </header>

        {/* Main Content: Split View */}
        <div className="flex flex-1 gap-6 overflow-hidden">
            
            {/* Left: Weekly Calendar Grid */}
            <div className={`flex-1 flex flex-col rounded-2xl border ${theme.borderClass} ${theme.cardClass} overflow-hidden`}>
                
                {/* Dynamic Day Headers */}
                <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5">
                    <div className="p-4 text-center font-bold text-xs uppercase opacity-50 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-center">
                        <Clock size={16} className="mx-auto mb-1 opacity-50"/>
                        GMT
                    </div>
                    {weekDates.map((date) => {
                        const isTodayDate = isToday(date);
                        return (
                            <div key={date.toISOString()} className={`p-2 md:p-4 text-center border-r border-gray-200 dark:border-gray-700/50 ${isTodayDate ? 'bg-blue-500/5' : ''}`}>
                                <div className={`text-xs uppercase font-bold mb-1 ${isTodayDate ? 'text-blue-500' : theme.textSecondary}`}>
                                    {WEEK_DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                                </div>
                                <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-lg font-bold 
                                    ${isTodayDate ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : theme.textPrimary}`}>
                                    {date.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time Grid */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative">
                    {/* Background Grid Lines */}
                    {HOURS.map(hour => (
                        <div key={hour} className="grid grid-cols-8 h-[60px] border-b border-gray-100 dark:border-gray-800/50">
                            {/* Time Label */}
                            <div className="text-xs text-right pr-2 pt-1 opacity-40 -mt-2 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-transparent z-10">
                                {hour}:00
                            </div>
                            {/* Empty Cells for alignment */}
                            {weekDates.map((_, i) => (
                                <div key={i} className="border-r border-gray-100 dark:border-gray-800/30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative group">
                                    <button className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                        <Plus size={16} className="opacity-30" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Current Time Indicator (Only show if today is in view) */}
                    {weekDates.some(d => isToday(d)) && getCurrentTimeTop() > 0 && (
                        <div 
                            className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                            style={{ top: `${getCurrentTimeTop()}px` }}
                        >
                            <div className="w-16 bg-red-500 text-white text-[10px] font-bold px-1 rounded-r-sm -mt-3 shadow-md">
                                {now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 -mt-[1px] animate-pulse shadow-[0_0_10px_red]" />
                        </div>
                    )}

                    {/* Task Blocks */}
                    {tasks.filter(t => t.startTime && t.day).map(task => {
                        // Find which column (0-6) this task belongs to in the CURRENT view
                        // This logic maps the task string 'Mon' to the index, but we need to ensure it matches the dates in view.
                        const dayIndex = WEEK_DAYS.indexOf(task.day || 'Mon');
                        
                        // Render task
                        const style = getBlockStyle(task.startTime!, task.duration);
                        const left = `${(dayIndex + 1) * 12.5}%`;

                        return (
                            <div 
                                key={task.id}
                                className={`absolute p-1 z-10 mx-0.5 rounded-md text-xs border overflow-hidden cursor-pointer hover:brightness-110 hover:z-20 transition-all shadow-sm
                                    ${task.completed ? 'bg-gray-200 text-gray-500 border-gray-300 opacity-60' : 
                                      task.category === 'Work' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-100' :
                                      task.category === 'Personal' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:border-purple-700 dark:text-purple-100' :
                                      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-700 dark:text-emerald-100'
                                    }
                                `}
                                style={{ top: style.top, height: style.height, left, width: '12%', marginLeft: '0.25%' }}
                                title={`${task.title} (${task.startTime} - ${task.duration}m)`}
                            >
                                <div className="font-bold truncate">{task.title}</div>
                                <div className="opacity-80 text-[10px]">{task.startTime}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Sidebar with Mini Calendar (Heatmap) & Backlog */}
            <div className={`w-80 flex flex-col rounded-2xl border ${theme.borderClass} ${theme.cardClass} overflow-hidden`}>
                
                {/* MINI CALENDAR + HEATMAP */}
                {renderMiniCalendar()}

                {/* Backlog Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5">
                    <h3 className={`font-bold ${theme.textPrimary}`}>Backlog</h3>
                    <p className="text-xs opacity-60">Drag to schedule</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {tasks.filter(t => !t.startTime && !t.completed).map(task => (
                        <div key={task.id} className={`p-3 rounded-xl border ${theme.borderClass} bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group cursor-grab active:cursor-grabbing`}>
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-medium ${theme.textPrimary}`}>{task.title}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 opacity-70`}>{task.category}</span>
                            </div>
                            <div className="mt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] opacity-50">{task.priority} Priority</span>
                                <button className="text-blue-500 hover:text-blue-600">
                                    <Clock size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {tasks.filter(t => !t.startTime && !t.completed).length === 0 && (
                        <div className="p-6 text-center opacity-40">
                            <CheckCircle2 className="mx-auto mb-2" />
                            <p className="text-sm">All tasks scheduled!</p>
                        </div>
                    )}
                </div>

                {/* Analysis Widget */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-emerald-500/10">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={14} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Analysis</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-emerald-500" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-[10px] opacity-70 text-emerald-800 dark:text-emerald-200">
                        65% of weekly goals completed.
                    </p>
                </div>
            </div>

        </div>
    </div>
  );
};

export default WeeklyPlanner;
