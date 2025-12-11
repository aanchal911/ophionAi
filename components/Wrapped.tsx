import React, { useState, useEffect } from 'react';
import { Theme, WrappedData, Task, Project, AppView } from '../types';
import { generateWrappedStory } from '../services/geminiService';
import { MOCK_TASKS, MOCK_PROJECTS } from '../constants';
import { Sparkles, ChevronRight, Share2, X, Trophy, TrendingUp, Calendar, Zap, Film } from 'lucide-react';

interface WrappedProps {
  theme: Theme;
  onClose: () => void;
}

const Wrapped: React.FC<WrappedProps> = ({ theme, onClose }) => {
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
        // Pass mock data or real data from props/context in real implementation
        const result = await generateWrappedStory(MOCK_TASKS, MOCK_PROJECTS);
        if (result) {
            setData(result);
        }
        setLoading(false);
    };
    fetchData();
  }, []);

  const nextSlide = () => {
      if (slide < 11) setSlide(s => s + 1);
  };

  const prevSlide = () => {
      if (slide > 0) setSlide(s => s - 1);
  };

  const share = () => {
      alert("Shared to Ophion Story! (Demo)");
  };

  if (loading) {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
              <Sparkles size={48} className="animate-spin text-purple-500 mb-4" />
              <h2 className="text-2xl font-serif font-bold animate-pulse">Analyzing Your Year...</h2>
              <p className="text-sm opacity-50 mt-2">Connecting dots. measuring growth.</p>
          </div>
      );
  }

  if (!data) return null;

  // Slide Renders
  const renderSlideContent = () => {
      switch (slide) {
          case 0: // Intro
            return (
                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-1000">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        2025
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-white/90">
                        This year... you didn't just do tasks.
                        <br/><span className="font-bold text-purple-400">You evolved.</span>
                    </p>
                </div>
            );
          case 1: // Identity
            return (
                <div className="text-center space-y-6 animate-in slide-in-from-bottom duration-700">
                    <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <Zap size={48} className="text-yellow-400" />
                    </div>
                    <h2 className="text-lg uppercase tracking-widest opacity-70">Your Productivity Identity</h2>
                    <h1 className="text-4xl md:text-6xl font-bold text-yellow-400">{data.identity.archetype}</h1>
                    <p className="text-xl italic text-white/80">"{data.identity.quote}"</p>
                    <div className="p-4 bg-white/10 rounded-xl max-w-lg mx-auto text-sm text-white/70">
                        {data.identity.description}
                    </div>
                </div>
            );
          case 2: // Time
            return (
                <div className="space-y-8 animate-in slide-in-from-right duration-700 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-white">Your Time Rhythm</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-blue-900/40 rounded-2xl border border-blue-500/30">
                            <ClockIcon className="mx-auto mb-2 text-blue-400" />
                            <div className="text-4xl font-bold text-white">{data.timeStats.peakHour}</div>
                            <div className="text-sm opacity-60">Peak Focus Hour</div>
                        </div>
                        <div className="p-6 bg-red-900/40 rounded-2xl border border-red-500/30">
                            <Calendar className="mx-auto mb-2 text-red-400" />
                            <div className="text-4xl font-bold text-white">{data.timeStats.bestDay}</div>
                            <div className="text-sm opacity-60">Most Productive Day</div>
                        </div>
                    </div>
                    <p className="text-lg text-white/80">"{data.timeStats.comment}"</p>
                </div>
            );
          case 3: // Categories
            return (
                <div className="text-center space-y-6 animate-in fade-in duration-700">
                     <h2 className="text-2xl font-bold">Where You Spent Energy</h2>
                     <div className="flex justify-center items-center gap-4">
                         <div className="w-48 h-48 rounded-full border-8 border-purple-500 flex items-center justify-center relative">
                             <div className="text-center">
                                 <div className="text-3xl font-bold text-purple-400">{data.categoryStats.topCategory}</div>
                                 <div className="text-xs uppercase opacity-50">Top Domain</div>
                             </div>
                         </div>
                     </div>
                     <div className="text-4xl font-bold text-green-400">{data.categoryStats.completionRate}%</div>
                     <p className="text-sm opacity-60">Completion Rate on High Priority</p>
                     <p className="italic text-white/80 max-w-md mx-auto">{data.categoryStats.comment}</p>
                </div>
            );
          case 4: // Streaks
            return (
                <div className="text-center space-y-8 animate-in zoom-in duration-500">
                    <TrendingUp size={64} className="mx-auto text-orange-500" />
                    <div>
                        <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-600">
                            {data.streaks.longestStreak}
                        </div>
                        <div className="text-2xl font-bold uppercase tracking-widest mt-2">Day Streak</div>
                    </div>
                    <p className="text-xl font-serif text-white/90">"{data.streaks.comment}"</p>
                </div>
            );
          case 5: // Project
             return (
                 <div className="text-center space-y-6 animate-in slide-in-from-bottom duration-700">
                     <h2 className="text-xl opacity-70">Main Character Energy</h2>
                     <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                         <h1 className="text-3xl font-bold text-white mb-2">{data.projectStats.highlightProject}</h1>
                         <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold mb-4">
                             Role: {data.projectStats.role}
                         </div>
                         <p className="text-lg text-white/80">{data.projectStats.comment}</p>
                     </div>
                 </div>
             );
          case 6: // Growth
             return (
                 <div className="space-y-6 max-w-xl animate-in fade-in duration-700">
                     <h2 className="text-3xl font-bold text-center mb-8">Growth Milestones</h2>
                     {data.growth.map((g, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10" style={{ animationDelay: `${i*200}ms` }}>
                             <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">{i+1}</div>
                             <p className="text-lg">{g}</p>
                         </div>
                     ))}
                 </div>
             );
           case 7: // Achievements
             return (
                 <div className="text-center space-y-8 animate-in zoom-in duration-500">
                     <Trophy size={64} className="mx-auto text-yellow-500" />
                     <h2 className="text-3xl font-serif font-bold">Top Achievements</h2>
                     <div className="space-y-4">
                         {data.achievements.map((a, i) => (
                             <div key={i} className="text-xl font-medium text-white/90">
                                 ✨ {a}
                             </div>
                         ))}
                     </div>
                 </div>
             );
           case 8: // Movie
             return (
                 <div className="text-center space-y-6 animate-in fade-in duration-1000">
                     <Film size={48} className="mx-auto text-red-500" />
                     <h2 className="text-sm uppercase tracking-widest opacity-50">If 2025 was a movie...</h2>
                     <h1 className="text-5xl font-bold font-serif text-white leading-tight">{data.movie.title}</h1>
                     <div className="text-sm font-bold text-red-400 uppercase tracking-widest">{data.movie.genre}</div>
                     <p className="text-lg italic text-gray-300 max-w-lg mx-auto border-l-4 border-red-500 pl-4 text-left">
                         {data.movie.description}
                     </p>
                 </div>
             );
           case 9: // Predictions
              return (
                  <div className="text-center space-y-8 animate-in slide-in-from-top duration-700">
                      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <Sparkles size={32} className="text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-bold">Ophion's Oracle</h2>
                      <div className="grid gap-4">
                          {data.predictions.map((p, i) => (
                              <div key={i} className="p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl border border-white/10">
                                  <p className="text-lg">{p}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              );
           case 10: // Final
               return (
                   <div className="text-center space-y-6 animate-in zoom-in duration-1000">
                       <h2 className="text-xl opacity-70">Your Chapter Title</h2>
                       <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                           {data.final.title}
                       </h1>
                       <div className="w-24 h-1 bg-white/20 mx-auto my-8"></div>
                       <p className="text-2xl italic text-white/90">"{data.final.quote}"</p>
                       <button onClick={share} className="mt-8 flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full mx-auto hover:scale-105 transition-transform">
                           <Share2 size={20} /> Share Story
                       </button>
                   </div>
               );
          default:
              return null;
      }
  };

  const ClockIcon = ({ className }: { className?: string }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 text-white flex flex-col font-sans">
        {/* Background Layer (Reusing Theme Logic or Simple Gradient) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-purple-900 opacity-50" />
             {/* Dynamic color blobs */}
             <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
             <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        {/* Header Controls */}
        <div className="relative z-10 flex justify-between items-center p-6">
             <div className="flex gap-1">
                 {Array.from({length: 11}).map((_, i) => (
                     <div 
                        key={i} 
                        className={`h-1 w-8 rounded-full transition-all duration-300 ${i === slide ? 'bg-white' : i < slide ? 'bg-white/50' : 'bg-white/20'}`} 
                     />
                 ))}
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
            {renderSlideContent()}
        </div>

        {/* Footer Navigation */}
        <div className="relative z-10 p-6 flex justify-between items-center w-full max-w-4xl mx-auto">
             <button 
                onClick={prevSlide} 
                disabled={slide === 0}
                className="text-sm font-bold opacity-50 hover:opacity-100 disabled:opacity-0"
             >
                 BACK
             </button>
             <button 
                onClick={slide === 10 ? onClose : nextSlide} 
                className="flex items-center gap-2 text-sm font-bold hover:scale-105 transition-transform"
             >
                 {slide === 10 ? 'CLOSE' : 'NEXT'} <ChevronRight size={16} />
             </button>
        </div>
    </div>
  );
};

export default Wrapped;