import React, { useMemo } from 'react';
import { Theme } from '../types';
import { MOCK_ANALYTICS, MOCK_CATEGORY_STATS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface AnalyticsProps {
  theme: Theme;
}

// Helper to generate fake heatmap data (365 days)
const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  // Generate roughly 52 weeks of data
  for (let i = 0; i < 364; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (363 - i));
    // Random intensity 0-4. Higher probability for 0 or 1.
    const rand = Math.random();
    let intensity = 0;
    if (rand > 0.9) intensity = 4;
    else if (rand > 0.75) intensity = 3;
    else if (rand > 0.55) intensity = 2;
    else if (rand > 0.3) intensity = 1;
    
    data.push({ date, intensity });
  }
  return data;
};

const Heatmap: React.FC<{ theme: Theme }> = ({ theme }) => {
  const data = useMemo(() => generateHeatmapData(), []);
  
  // Theme-aware color scale
  const getCellColor = (intensity: number) => {
    // Base "empty" color
    const emptyColor = theme.id === 'MIDNIGHT' || theme.id === 'NEON_VIBE' ? 'bg-white/5' : 'bg-slate-200';
    if (intensity === 0) return emptyColor;
    
    // Gradient scales based on theme
    if (theme.id === 'NEON_VIBE') {
        const colors = ['bg-purple-900', 'bg-purple-700', 'bg-pink-600', 'bg-pink-400'];
        return colors[intensity - 1] || colors[0];
    } else if (theme.id === 'MIDNIGHT') {
        const colors = ['bg-blue-900', 'bg-blue-700', 'bg-blue-500', 'bg-blue-300'];
        return colors[intensity - 1] || colors[0];
    } else {
        // Olympus / Zen (Green scale like original GitHub)
        const colors = ['bg-emerald-200', 'bg-emerald-400', 'bg-emerald-600', 'bg-emerald-800'];
        return colors[intensity - 1] || colors[0];
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-2">
      <div className="flex gap-1 min-w-max">
         {/* Render 52 columns approx */}
         {Array.from({ length: 52 }).map((_, colIndex) => (
             <div key={colIndex} className="flex flex-col gap-1">
                 {/* 7 days per column */}
                 {Array.from({ length: 7 }).map((_, rowIndex) => {
                     const dayIndex = colIndex * 7 + rowIndex;
                     const day = data[dayIndex];
                     return (
                        <div 
                            key={rowIndex}
                            className={`w-3 h-3 rounded-[2px] ${day ? getCellColor(day.intensity) : 'opacity-0'} hover:ring-2 ring-offset-1 ring-offset-transparent ring-current transition-all`}
                            title={day?.date.toDateString()}
                        />
                     );
                 })}
             </div>
         ))}
      </div>
      <div className="flex justify-end items-center gap-2 mt-3 text-[10px] opacity-60">
        <span>Less</span>
        <div className={`w-3 h-3 rounded-[2px] ${theme.id === 'MIDNIGHT' ? 'bg-white/5' : 'bg-slate-200'}`} />
        <div className={`w-3 h-3 rounded-[2px] ${getCellColor(2)}`} />
        <div className={`w-3 h-3 rounded-[2px] ${getCellColor(4)}`} />
        <span>More</span>
      </div>
    </div>
  );
};

const CircularCard: React.FC<{ 
    label: string; 
    date: string; 
    value: number; 
    theme: Theme; 
    index: number;
}> = ({ label, date, value, theme, index }) => {
    const isDark = theme.id === 'MIDNIGHT' || theme.id === 'NEON_VIBE';
    
    // Dynamic color for the ring
    const getColor = () => {
        if (theme.id === 'NEON_VIBE') return index % 2 === 0 ? '#d946ef' : '#8b5cf6'; // Pink/Purple
        if (theme.id === 'MIDNIGHT') return '#3b82f6'; // Blue
        return '#10b981'; // Emerald
    };
    
    const activeColor = getColor();
    const trackColor = isDark ? '#333' : '#e2e8f0';

    return (
        <div className={`flex flex-col rounded-xl overflow-hidden border ${theme.borderClass} ${theme.cardClass} shadow-sm`}>
             {/* Header */}
             <div className={`p-3 text-center ${theme.id === 'NEON_VIBE' ? 'bg-white/10' : 'bg-emerald-500/10'}`}>
                 <h4 className={`text-lg font-bold ${theme.textPrimary}`}>{label}</h4>
                 <span className={`text-xs ${theme.textSecondary}`}>{date}</span>
             </div>
             
             {/* Body */}
             <div className="p-6 flex flex-col items-center justify-center bg-opacity-50">
                <div className="relative w-28 h-28">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ value: 100 }]} 
                                dataKey="value" 
                                cx="50%" cy="50%" 
                                innerRadius={40} outerRadius={50} 
                                fill={trackColor} 
                                stroke="none"
                            />
                            <Pie
                                data={[{ value: value }, { value: 100 - value }]} 
                                dataKey="value" 
                                cx="50%" cy="50%" 
                                innerRadius={40} outerRadius={50} 
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                                cornerRadius={10}
                            >
                                <Cell fill={activeColor} />
                                <Cell fill="transparent" />
                            </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className={`text-2xl font-bold ${theme.textPrimary}`}>{value}%</span>
                     </div>
                </div>
                <div className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'} ${theme.textSecondary}`}>
                    Productivity
                </div>
             </div>
        </div>
    );
};

const Analytics: React.FC<AnalyticsProps> = ({ theme }) => {
  const isDark = theme.id === 'MIDNIGHT' || theme.id === 'NEON_VIBE';
  const gridColor = isDark ? "#444" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto mb-20 md:mb-0 space-y-6 overflow-y-auto h-screen no-scrollbar pb-24">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b pb-4 border-gray-200 dark:border-gray-800">
        <div>
            <h2 className={`text-3xl font-serif font-bold ${theme.textPrimary}`}>Analytics Dashboard</h2>
            <p className={theme.textSecondary}>Visualize your progress and consistency.</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-medium border ${theme.borderClass} ${theme.textSecondary}`}>
            Last 30 Days
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart - Overall Progress */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass} min-h-[350px] flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Overall Progress</h3>
                    <p className={`text-sm ${theme.textSecondary}`}>Tasks completed vs Pending</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${theme.id === 'NEON_VIBE' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                        <span className={theme.textPrimary}>Completed</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></span>
                        <span className={theme.textPrimary}>Pending</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={MOCK_ANALYTICS} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: textColor, fontSize: 12}} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: textColor, fontSize: 12}} 
                        />
                        <Tooltip 
                            cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                            contentStyle={{ 
                                backgroundColor: isDark ? '#1e293b' : '#fff', 
                                borderColor: gridColor, 
                                borderRadius: '12px',
                                color: isDark ? '#fff' : '#000'
                            }}
                        />
                        <Bar 
                            dataKey="tasksCompleted" 
                            name="Completed" 
                            fill={theme.id === 'NEON_VIBE' ? '#a855f7' : '#10b981'} 
                            radius={[4, 4, 4, 4]} 
                            barSize={16}
                        />
                        <Bar 
                            dataKey="tasksPending" 
                            name="Pending" 
                            fill={isDark ? '#334155' : '#cbd5e1'} 
                            radius={[4, 4, 4, 4]} 
                            barSize={16}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Task Category Distribution Chart (Donut) */}
        <div className={`flex flex-col gap-6`}>
             <div className={`flex-1 p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass} flex flex-col`}>
                 <h3 className={`text-xl font-bold mb-4 ${theme.textPrimary}`}>Focus Distribution</h3>
                 <div className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={MOCK_CATEGORY_STATS}
                             cx="50%" cy="50%"
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {MOCK_CATEGORY_STATS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                             ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                                backgroundColor: isDark ? '#1e293b' : '#fff', 
                                borderColor: gridColor, 
                                borderRadius: '12px',
                                color: isDark ? '#fff' : '#000'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                       <div className="text-center">
                          <span className={`block text-3xl font-bold ${theme.textPrimary}`}>33</span>
                          <span className={`text-xs ${theme.textSecondary}`}>Total Tasks</span>
                       </div>
                    </div>
                 </div>
             </div>
        </div>
      </div>

      {/* GitHub Style Heatmap Section */}
      <section className={`p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass}`}>
        <div className="mb-4">
            <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Activity Map</h3>
            <p className={`text-xs ${theme.textSecondary}`}>365 days of productivity tracking</p>
        </div>
        <Heatmap theme={theme} />
      </section>

      {/* Daily Breakdown Grid (Circular Cards) */}
      <section>
          <h3 className={`text-lg font-bold mb-4 ml-1 ${theme.textPrimary}`}>Daily Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {MOCK_ANALYTICS.map((day, idx) => (
                  <CircularCard 
                    key={day.name} 
                    label={day.name} 
                    date={day.date} 
                    value={day.productivity} 
                    theme={theme}
                    index={idx}
                  />
              ))}
          </div>
      </section>

    </div>
  );
};

export default Analytics;