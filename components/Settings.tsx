import React from 'react';
import { Theme, ThemeId, ThemeType } from '../types';
import { THEMES } from '../constants';
import { Palette, User, Zap, Sparkles } from 'lucide-react';

interface SettingsProps {
  currentTheme: ThemeId;
  setTheme: (id: ThemeId) => void;
  theme: Theme;
}

const Settings: React.FC<SettingsProps> = ({ currentTheme, setTheme, theme }) => {
  
  const liveThemes = Object.values(THEMES).filter(t => t.type === ThemeType.LIVE);
  const staticThemes = Object.values(THEMES).filter(t => t.type === ThemeType.STATIC);

  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto mb-20 md:mb-0 space-y-8 overflow-y-auto h-screen no-scrollbar pb-24">
      <header>
        <h2 className={`text-3xl font-serif font-bold ${theme.textPrimary}`}>Settings</h2>
        <p className={theme.textSecondary}>Personalize your companion.</p>
      </header>

      {/* Live Themes Section */}
      <section className={`p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass}`}>
        <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-purple-500" />
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Live Themes (Animated)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden group
                ${currentTheme === t.id ? `border-current ${t.accent}` : 'border-transparent hover:border-gray-400/50'}
                ${t.bgClass}
              `}
            >
              <div className={`relative z-10 ${t.textPrimary}`}>
                 <span className="font-bold block flex items-center gap-2">
                     {t.name} <Zap size={12} className="opacity-50" />
                 </span>
                 <span className="text-xs opacity-70">Interactive Effects</span>
              </div>
              {/* Preview Element */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 opacity-20 transform translate-x-4 translate-y-4 rounded-full blur-xl bg-current text-white`} />
            </button>
          ))}
        </div>
      </section>

      {/* Static Themes Section */}
      <section className={`p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass}`}>
        <div className="flex items-center gap-2 mb-6">
            <Palette className={theme.accent} />
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Static Themes (Minimal)</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {staticThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden
                ${currentTheme === t.id ? `border-current ${t.accent}` : 'border-transparent hover:border-gray-400/50'}
                ${t.bgClass}
              `}
            >
              <div className={`relative z-10 ${t.textPrimary}`}>
                 <span className="font-bold block text-sm">{t.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={`p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass}`}>
         <div className="flex items-center gap-2 mb-4">
            <User className={theme.accent} />
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Account & Data</h3>
         </div>
         <div className="space-y-4">
            <div className={`flex justify-between items-center p-3 rounded-lg bg-white/5`}>
                <span className={theme.textPrimary}>Sync Cross-Platform</span>
                <div className={`w-10 h-6 rounded-full bg-green-500/20 p-1 cursor-pointer`}>
                    <div className="w-4 h-4 rounded-full bg-green-500 ml-auto"></div>
                </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default Settings;