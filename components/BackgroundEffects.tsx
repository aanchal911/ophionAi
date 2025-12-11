
import React from 'react';
import { ThemeId } from '../types';

interface BackgroundEffectsProps {
    themeId: ThemeId;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ themeId }) => {
    
    // STRANGER THINGS: Dark atmosphere, floating spores, lightning + Alphabet Wall
    if (themeId === ThemeId.STRANGER) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        const lightColors = [
            'bg-blue-500', 'bg-red-500', 'bg-yellow-400', 'bg-green-500', 
            'bg-blue-400', 'bg-red-600', 'bg-yellow-300', 'bg-green-600'
        ];

        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#2b0a0a] to-black" />
                <div className="absolute inset-0 opacity-[0.03]" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle at 50% 50%, #888 2px, transparent 2.5px)',
                         backgroundSize: '24px 24px'
                     }} 
                />

                {/* ALPHABET WALL */}
                <div className="absolute top-[10%] inset-x-0 flex flex-wrap justify-center gap-x-8 gap-y-4 px-4 md:px-20 max-w-6xl mx-auto opacity-30">
                    {alphabet.map((char, i) => {
                         const colorClass = lightColors[i % lightColors.length];
                         const delay = Math.random() * 5 + 's';
                         const duration = Math.random() * 2 + 3 + 's';
                         return (
                             <div key={char} className="flex flex-col items-center gap-1 group">
                                 <div className="absolute -top-4 w-full h-8 border-b border-black/50 rounded-[50%]" style={{ left: (i % 2 === 0 ? -10 : 10) + 'px' }} />
                                 <div 
                                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${colorClass} shadow-md animate-bulb-flicker`}
                                    style={{ animationDelay: delay, animationDuration: duration }}
                                 />
                                 <span className="font-serif font-bold text-2xl md:text-4xl text-black/60 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                                     {char}
                                 </span>
                             </div>
                         );
                    })}
                </div>

                {[...Array(25)].map((_, i) => (
                     <div 
                        key={i}
                        className="absolute bg-red-500/40 rounded-full blur-[1px] animate-float"
                        style={{
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animationDuration: Math.random() * 10 + 15 + 's',
                            animationDelay: Math.random() * -20 + 's'
                        }}
                     />
                ))}
                
                <div className="absolute inset-0 bg-red-500/10 mix-blend-color-dodge animate-flicker pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>
        );
    }

    // BATMAN: Gotham rain, fog, Bat Signal
    if (themeId === ThemeId.BATMAN) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
                <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-black opacity-80" />

                <div className="absolute top-[5%] right-[15%] w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-yellow-100/5 rounded-full blur-[60px] animate-pulse-signal" />
                
                <div className="absolute inset-0 opacity-40">
                    {[...Array(50)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute w-[1px] bg-slate-500 animate-rain"
                            style={{
                                height: Math.random() * 40 + 20 + 'px',
                                left: Math.random() * 100 + '%',
                                top: -60 + 'px',
                                opacity: Math.random() * 0.5 + 0.2,
                                animationDuration: Math.random() * 0.5 + 0.5 + 's',
                                animationDelay: Math.random() * -5 + 's'
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // ANIME: Sunset gradient, drifting clouds, stars
    if (themeId === ThemeId.ANIME) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a1b3d] via-[#44318d] to-[#8265a7] mix-blend-overlay" />
                
                {[...Array(60)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-white rounded-full animate-twinkle"
                        style={{
                            width: Math.random() * 2 + 'px',
                            height: Math.random() * 2 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            opacity: Math.random() * 0.8,
                            animationDelay: Math.random() * 3 + 's'
                        }}
                    />
                ))}

                <div className="absolute top-[15%] left-[-20%] w-[50%] h-[120px] bg-white/5 blur-[50px] rounded-full animate-drift" style={{ animationDuration: '45s' }} />
                <div className="absolute top-[40%] left-[-10%] w-[40%] h-[100px] bg-pink-300/10 blur-[40px] rounded-full animate-drift" style={{ animationDuration: '38s', animationDelay: '-12s' }} />
                <div className="absolute bottom-[20%] left-[-15%] w-[60%] h-[150px] bg-purple-300/10 blur-[60px] rounded-full animate-drift" style={{ animationDuration: '50s', animationDelay: '-25s' }} />
            </div>
        );
    }

    // CYBER: Retro 3D Grid, speed lines
    if (themeId === ThemeId.CYBER) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#02020a]">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2676&auto=format&fit=crop')] bg-cover bg-center" />
                
                <div className="absolute bottom-[-20%] left-[-50%] w-[200%] h-[60%] opacity-30" style={{ perspective: '500px' }}>
                     <div className="w-full h-full animate-grid"
                          style={{
                              backgroundImage: `linear-gradient(to right, rgba(6,182,212,0.4) 1px, transparent 1px),
                                                linear-gradient(to bottom, rgba(6,182,212,0.4) 1px, transparent 1px)`,
                              backgroundSize: '40px 40px',
                              transform: 'rotateX(60deg)',
                              transformOrigin: '50% 0%'
                          }}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-transparent to-transparent" />
                </div>

                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-cyan-400 h-[2px] rounded-full animate-speed blur-[1px]"
                        style={{
                            top: Math.random() * 80 + '%',
                            right: '-20%',
                            width: Math.random() * 200 + 100 + 'px',
                            opacity: 0,
                            animationDuration: Math.random() * 1 + 2 + 's',
                            animationDelay: Math.random() * 5 + 's'
                        }}
                    />
                ))}
            </div>
        );
    }

    // SYNTHWAVE 84: Outrun Grid, Retro Sun
    if (themeId === ThemeId.SYNTHWAVE) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#1a0b2e]">
                {/* Background Sky */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]" />
                
                {/* Retro Sun */}
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-t from-yellow-500 to-pink-600 blur-[2px]">
                     <div className="absolute inset-0 flex flex-col justify-end">
                         {[...Array(6)].map((_, i) => (
                             <div key={i} className="w-full bg-[#1a0b2e]" style={{ height: (i * 4) + 'px', marginBottom: (i * 3 + 4) + 'px', opacity: 0.8 }} />
                         ))}
                     </div>
                </div>

                {/* Perspective Grid */}
                <div className="absolute bottom-[-20%] left-[-50%] w-[200%] h-[50%] opacity-50" style={{ perspective: '400px' }}>
                     <div className="w-full h-full animate-grid-fast"
                          style={{
                              backgroundImage: `linear-gradient(to right, rgba(217, 70, 239, 0.5) 2px, transparent 2px),
                                                linear-gradient(to bottom, rgba(217, 70, 239, 0.5) 2px, transparent 2px)`,
                              backgroundSize: '50px 50px',
                              transform: 'rotateX(60deg)',
                              transformOrigin: '50% 0%',
                              boxShadow: '0 0 40px rgba(217, 70, 239, 0.4)'
                          }}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b2e] via-transparent to-transparent" />
                </div>
            </div>
        );
    }

    // WIZARD'S STUDY: Fireplace, cozy, dust
    if (themeId === ThemeId.WIZARD) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#1c110a]">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1c110a] via-transparent to-[#1c110a]/90" />
                
                {/* Firelight Flicker Overlay */}
                <div className="absolute inset-0 bg-amber-600/10 mix-blend-overlay animate-flicker-fire" />

                {/* Floating Dust Motes */}
                {[...Array(30)].map((_, i) => (
                     <div 
                        key={i}
                        className="absolute bg-amber-100/40 rounded-full blur-[1px] animate-float-slow"
                        style={{
                            width: Math.random() * 3 + 'px',
                            height: Math.random() * 3 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animationDuration: Math.random() * 20 + 20 + 's',
                            animationDelay: Math.random() * -20 + 's'
                        }}
                     />
                ))}
            </div>
        );
    }

    // HYPERSPACE: Stars streaks
    if (themeId === ThemeId.HYPERSPACE) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
                {/* Warp Stars */}
                {[...Array(40)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-white rounded-full animate-warp"
                        style={{
                            top: '50%',
                            left: '50%',
                            width: '2px',
                            height: Math.random() * 100 + 50 + 'px',
                            transformOrigin: '0% 0%',
                            transform: `rotate(${Math.random() * 360}deg) translate(0, 100px)`,
                            opacity: 0,
                            animationDuration: Math.random() * 1 + 0.5 + 's',
                            animationDelay: Math.random() * 2 + 's'
                        }}
                    />
                ))}
                
                {/* Distant Nebula */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=2678&auto=format&fit=crop')] bg-cover opacity-30 animate-pulse-slow" />
            </div>
        );
    }

    // STEAMPUNK: Gears, steam
    if (themeId === ThemeId.STEAMPUNK) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#1a1613]">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1543854589-3ae847e70419?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center sepia" />
                
                {/* Rotating Gears (CSS Representations) */}
                <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] border-[20px] border-dashed border-[#5d4037] rounded-full opacity-30 animate-spin-slow" />
                <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] border-[30px] border-dotted border-[#3e2723] rounded-full opacity-30 animate-spin-reverse-slow" />

                {/* Steam Puffs */}
                {[...Array(8)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-white/10 rounded-full blur-3xl animate-steam"
                        style={{
                            width: '200px',
                            height: '200px',
                            left: Math.random() * 100 + '%',
                            bottom: -50 + 'px',
                            animationDuration: Math.random() * 5 + 5 + 's',
                            animationDelay: Math.random() * 5 + 's'
                        }}
                    />
                ))}
            </div>
        );
    }

    // GOTHIC CASTLE: Rain, storm, torches
    if (themeId === ThemeId.GOTHIC) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0f1115]">
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1542256840-2b62054236b2?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center" />
                
                {/* Rain (reused) */}
                 <div className="absolute inset-0 opacity-40">
                    {[...Array(60)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute w-[1px] bg-slate-400 animate-rain"
                            style={{
                                height: Math.random() * 40 + 20 + 'px',
                                left: Math.random() * 100 + '%',
                                top: -60 + 'px',
                                opacity: Math.random() * 0.4 + 0.1,
                                animationDuration: Math.random() * 0.3 + 0.5 + 's',
                                animationDelay: Math.random() * -5 + 's'
                            }}
                        />
                    ))}
                </div>

                {/* Thunder Flash */}
                <div className="absolute inset-0 bg-white/10 animate-thunder pointer-events-none mix-blend-overlay" />

                {/* Torch Glow (Bottom corners) */}
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl animate-flicker-fire" />
                <div className="absolute bottom-0 right-10 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl animate-flicker-fire" style={{ animationDelay: '1s' }} />
            </div>
        );
    }

    // FAIRYTALE: Pink clouds, sparkles
    if (themeId === ThemeId.FAIRYTALE) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-pink-50">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 via-purple-100 to-blue-100 animate-gradient-shift" style={{ backgroundSize: '400% 400%' }} />
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1598335624129-068393e15777?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />

                {/* Floating Sparkles */}
                {[...Array(40)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-yellow-200 rounded-full animate-twinkle shadow-[0_0_5px_gold]"
                        style={{
                            width: Math.random() * 4 + 2 + 'px',
                            height: Math.random() * 4 + 2 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            opacity: 0,
                            animationDuration: Math.random() * 2 + 2 + 's',
                            animationDelay: Math.random() * 5 + 's'
                        }}
                    />
                ))}

                {/* Drifting Clouds (White, soft) */}
                <div className="absolute top-[10%] left-[-20%] w-[40%] h-[100px] bg-white/40 blur-[40px] rounded-full animate-drift" style={{ animationDuration: '60s' }} />
                <div className="absolute bottom-[20%] right-[-20%] w-[50%] h-[150px] bg-white/30 blur-[60px] rounded-full animate-drift" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
            </div>
        );
    }

    // NEON VIBE (Fallback for Live)
    if (themeId === ThemeId.NEON_VIBE) {
        return (
             <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-900">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
             </div>
        );
    }

    return null;
};

// Inject Global Keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    20% { opacity: 0.8; }
    80% { opacity: 0.6; }
    100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
  }
  @keyframes float-slow {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: translateY(-50px) translateX(50px); opacity: 0; }
  }
  @keyframes rain {
    0% { transform: translateY(0); }
    100% { transform: translateY(100vh); }
  }
  @keyframes drift {
    from { transform: translateX(-20%); }
    to { transform: translateX(120%); }
  }
  @keyframes speed {
    0% { transform: translateX(100px) scaleX(0.1); opacity: 0; }
    10% { opacity: 0.8; }
    100% { transform: translateX(-120vw) scaleX(2); opacity: 0; }
  }
  @keyframes flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 0; }
    20%, 24%, 55% { opacity: 0.15; }
  }
  @keyframes flicker-fire {
    0% { opacity: 0.3; }
    25% { opacity: 0.6; }
    50% { opacity: 0.4; }
    75% { opacity: 0.7; }
    100% { opacity: 0.3; }
  }
  @keyframes bulb-flicker {
    0%, 100% { opacity: 0.2; box-shadow: 0 0 0 transparent; }
    50% { opacity: 1; box-shadow: 0 0 10px currentColor; }
    52% { opacity: 0.2; box-shadow: 0 0 0 transparent; }
    54% { opacity: 1; box-shadow: 0 0 15px currentColor; }
  }
  @keyframes grid-move {
    0% { background-position: 0 0; }
    100% { background-position: 0 40px; }
  }
  @keyframes grid-move-fast {
    0% { background-position: 0 0; }
    100% { background-position: 0 50px; }
  }
  @keyframes pulse-signal {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes pulse-slow {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.7; }
  }
  @keyframes warp {
    0% { transform: rotate(0deg) translate(0, 100px) scaleY(1); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: rotate(0deg) translate(0, 400px) scaleY(10); opacity: 0; }
  }
  @keyframes steam {
    0% { transform: translateY(0) scale(1); opacity: 0; }
    20% { opacity: 0.4; }
    100% { transform: translateY(-100px) scale(2); opacity: 0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spin-reverse-slow {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  @keyframes thunder {
    0%, 95% { opacity: 0; }
    96% { opacity: 0.6; }
    97% { opacity: 0; }
    98% { opacity: 0.3; }
    100% { opacity: 0; }
  }
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .animate-float { animation: float linear infinite; }
  .animate-float-slow { animation: float-slow linear infinite; }
  .animate-rain { animation: rain linear infinite; }
  .animate-drift { animation: drift linear infinite; }
  .animate-speed { animation: speed linear infinite; }
  .animate-flicker { animation: flicker 5s infinite; }
  .animate-flicker-fire { animation: flicker-fire 0.5s infinite; }
  .animate-bulb-flicker { animation: bulb-flicker ease-in-out infinite; }
  .animate-grid { animation: grid-move 1s linear infinite; }
  .animate-grid-fast { animation: grid-move-fast 0.5s linear infinite; }
  .animate-pulse-signal { animation: pulse-signal 4s ease-in-out infinite; }
  .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
  .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
  .animate-warp { animation: warp ease-in infinite; }
  .animate-steam { animation: steam linear infinite; }
  .animate-spin-slow { animation: spin-slow 20s linear infinite; }
  .animate-spin-reverse-slow { animation: spin-reverse-slow 25s linear infinite; }
  .animate-thunder { animation: thunder 10s infinite; }
  .animate-gradient-shift { animation: gradient-shift 15s ease infinite; }
`;
document.head.appendChild(style);

export default BackgroundEffects;
