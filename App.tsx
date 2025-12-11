
import React, { useState, useEffect } from 'react';
import { AppView, ThemeId, User } from './types';
import { THEMES } from './constants';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ChatInterface from './components/ChatInterface';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import WeeklyPlanner from './components/WeeklyPlanner';
import BackgroundEffects from './components/BackgroundEffects';
import Wrapped from './components/Wrapped';
import { isFirebaseConfigured } from './services/firebase';
import { AlertTriangle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(ThemeId.OLYMPUS);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Name Modal State
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');

  const theme = THEMES[currentThemeId];

  useEffect(() => {
    // AUTO-LOGIN LOGIC (No Login Screen)
    // 1. Check if we already have a guest ID
    let guestId = localStorage.getItem('ophion_guest_id');
    
    // 2. If not, generate one and save it
    if (!guestId) {
        guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ophion_guest_id', guestId);
    }

    // 3. Check for saved name
    const savedName = localStorage.getItem('ophion_user_name');

    // 4. Set the user state immediately
    setUser({
        uid: guestId,
        displayName: savedName || 'Olympian',
        email: null,
        photoURL: null
    });
    
    // 5. If no name saved, show modal
    if (!savedName) {
        setShowNameModal(true);
    }

    setAuthLoading(false);
  }, []);

  const handleSaveName = () => {
      if (!tempName.trim()) return;
      
      // Save to local storage
      localStorage.setItem('ophion_user_name', tempName);
      
      // Update state
      setUser(prev => prev ? { ...prev, displayName: tempName } : null);
      
      // Close modal
      setShowNameModal(false);
  };

  const renderView = () => {
    if (!user) return null;

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard theme={theme} user={user} />;
      case AppView.WEEKLY:
        return <WeeklyPlanner theme={theme} user={user} />;
      case AppView.PROJECTS:
        return <Projects theme={theme} user={user} />;
      case AppView.CHAT:
        return <ChatInterface theme={theme} />;
      case AppView.ANALYTICS:
        return <Analytics theme={theme} />;
      case AppView.SETTINGS:
        return <Settings currentTheme={currentThemeId} setTheme={setCurrentThemeId} theme={theme} />;
      default:
        return <Dashboard theme={theme} user={user} />;
    }
  };

  // Loading State
  if (authLoading) {
      return (
          <div className={`min-h-screen flex items-center justify-center ${theme.bgClass}`}>
              <Loader2 size={48} className={`animate-spin ${theme.textPrimary}`} />
          </div>
      );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row font-sans transition-colors duration-500 ${theme.bgClass}`}>
      
      {/* Configuration Warning Banner */}
      {!isFirebaseConfigured && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[100] p-2 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
            <AlertTriangle size={16} />
            <span>SETUP REQUIRED: Go to Firebase Console &gt; Project Settings &gt; Copy Config &gt; Paste into services/firebase.ts</span>
        </div>
      )}

      {/* Live Background Layer */}
      <BackgroundEffects themeId={currentThemeId} />

      {/* Wrapped Overlay */}
      {currentView === AppView.WRAPPED && (
          <Wrapped theme={theme} onClose={() => setCurrentView(AppView.DASHBOARD)} />
      )}

      {/* Welcome / Name Entry Modal */}
      {showNameModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
              <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl bg-slate-900 border border-slate-700 text-center relative overflow-hidden`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
                  
                  <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome, Traveler.</h2>
                  <p className="text-slate-400 mb-8">Before we begin your journey, what should Ophion call you?</p>
                  
                  <input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl p-4 text-white text-center text-lg font-bold outline-none focus:ring-2 ring-purple-500 mb-6 transition-all placeholder-slate-600"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  
                  <button 
                      onClick={handleSaveName}
                      disabled={!tempName.trim()}
                      className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                      Begin Odyssey
                  </button>
              </div>
          </div>
      )}

      {/* Main App Content (Always visible now) */}
      {user && (
          <>
            <Navigation 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                theme={theme} 
            />
            <main className={`flex-1 relative overflow-hidden flex flex-col ${!isFirebaseConfigured ? 'mt-8 md:mt-0' : ''}`}>
                <div className="relative z-10 w-full h-full flex justify-center">
                    {renderView()}
                </div>
            </main>
          </>
      )}
    </div>
  );
};

export default App;
