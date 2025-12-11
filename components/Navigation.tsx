
import React from 'react';
import { AppView, Theme } from '../types';
import { NAV_ITEMS } from '../constants';
import { Gift, LogOut } from 'lucide-react';
import { logout } from '../services/firebase';

interface NavigationProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  theme: Theme;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, theme }) => {
  return (
    <nav className={`
      fixed bottom-0 left-0 w-full z-50 
      md:relative md:w-64 md:h-screen md:flex-col md:justify-start 
      flex justify-around items-center p-4 border-t md:border-t-0 md:border-r 
      ${theme.cardClass} ${theme.borderClass}
      transition-all duration-300
    `}>
      <div className="hidden md:flex flex-col items-center mb-10 mt-4">
        <h1 className={`text-2xl font-serif font-bold tracking-widest ${theme.textPrimary}`}>
          OPHION<span className={theme.accent}>AI</span>
        </h1>
        <p className={`text-xs ${theme.textSecondary} mt-1`}>Wisdom. Guidance. Growth.</p>
      </div>

      <div className="flex md:flex-col w-full gap-2 md:gap-4 justify-around md:justify-start overflow-x-auto md:overflow-visible no-scrollbar">
        {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AppView)}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200 min-w-[50px] justify-center md:justify-start
                ${isActive 
                  ? `${theme.buttonClass} shadow-md scale-105` 
                  : `${theme.textSecondary} hover:bg-black/5`
                }
              `}
              title={item.label}
            >
              <Icon size={20} />
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          )
        })}
        
        {/* Special Wrapped Button */}
        <button
            onClick={() => setCurrentView(AppView.WRAPPED)}
            className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200 min-w-[50px] justify-center md:justify-start
                bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:brightness-110 animate-pulse-slow mt-2
            `}
            title="2025 Wrapped"
        >
            <Gift size={20} className="animate-bounce" />
            <span className="hidden md:block font-bold">2025 Wrapped</span>
        </button>
      </div>
      
      <div className="hidden md:block mt-auto mb-4 w-full px-2">
         <button
            onClick={logout}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 justify-start hover:bg-red-500/10 text-red-500`}
            title="Logout"
         >
             <LogOut size={20} />
             <span className="font-bold">Logout</span>
         </button>
         
         <div className={`mt-4 p-4 rounded-xl text-center text-xs border ${theme.borderClass} ${theme.textSecondary}`}>
             v1.2.0 &bull; Beta
         </div>
      </div>
    </nav>
  );
};

export default Navigation;
