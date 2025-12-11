
import React, { useState, useRef, useEffect } from 'react';
import { Note, Theme, StickyNoteSkin, User } from '../types';
import { 
  X, CheckSquare, Sparkles, Pin, GripHorizontal, Maximize2, 
  Mic, Trash2, Check, ArrowDownToLine, Move, AlertTriangle
} from 'lucide-react';
import { analyzeStickyNote, smartAnalyzeNote } from '../services/geminiService';

interface StickyBoardProps {
  theme: Theme;
  user: User;
  notes: Note[];
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onConvertToTask: (noteId: string, taskTitle: string) => void;
}

const COLORS = ['bg-yellow-100', 'bg-blue-100', 'bg-pink-100', 'bg-emerald-100', 'bg-purple-100', 'bg-orange-100', 'bg-zinc-800 text-white', 'bg-red-100'];

const StickyBoard: React.FC<StickyBoardProps> = ({ theme, user, notes, onUpdateNote, onDeleteNote, onConvertToTask }) => {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{id: string, startX: number, startY: number, startW: number, startH: number} | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState<string | null>(null);
  const [listeningNoteId, setListeningNoteId] = useState<string | null>(null);
  const [confirmConversion, setConfirmConversion] = useState<{isOpen: boolean, noteId: string | null}>({isOpen: false, noteId: null});

  const boardRef = useRef<HTMLDivElement>(null);

  // === DRAG LOGIC ===
  const handleMouseDown = (e: React.MouseEvent, note: Note) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || 
        (e.target as HTMLElement).tagName === 'BUTTON' ||
        (e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    e.stopPropagation();
    setActiveNote(note.id);
    setDragOffset({
      x: e.clientX - (note.x || 0),
      y: e.clientY - (note.y || 0)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Handling Drag Move
    if (activeNote) {
      const note = notes.find(n => n.id === activeNote);
      if (note) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        onUpdateNote({
          ...note,
          x: newX,
          y: newY
        });

        // Check drop zone proximity (bottom 100px)
        const boardHeight = boardRef.current?.clientHeight || 800;
        if (newY + note.height > boardHeight - 80) {
            setDropZoneActive(true);
        } else {
            setDropZoneActive(false);
        }
      }
    }

    // Handling Resize Move
    if (resizing) {
        const note = notes.find(n => n.id === resizing.id);
        if (note) {
            const deltaX = e.clientX - resizing.startX;
            const deltaY = e.clientY - resizing.startY;
            onUpdateNote({
                ...note,
                width: Math.max(200, resizing.startW + deltaX),
                height: Math.max(150, resizing.startH + deltaY)
            });
        }
    }
  };

  const handleMouseUp = () => {
    // Drop to Task Logic
    if (activeNote && dropZoneActive) {
        setConfirmConversion({ isOpen: true, noteId: activeNote });
    }

    setActiveNote(null);
    setResizing(null);
    setDropZoneActive(false);
  };

  const confirmTaskConversion = () => {
      if (confirmConversion.noteId) {
          const note = notes.find(n => n.id === confirmConversion.noteId);
          if (note) {
              onConvertToTask(note.id, note.content);
          }
      }
      setConfirmConversion({isOpen: false, noteId: null});
  };

  // === RESIZE LOGIC ===
  const startResize = (e: React.MouseEvent, note: Note) => {
      e.stopPropagation();
      setResizing({
          id: note.id,
          startX: e.clientX,
          startY: e.clientY,
          startW: note.width || 250,
          startH: note.height || 200
      });
  };

  // === VOICE LOGIC ===
  const startListening = (note: Note) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          alert("Speech recognition not supported in this browser.");
          return;
      }
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setListeningNoteId(note.id);
      recognition.onend = () => setListeningNoteId(null);
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onUpdateNote({
              ...note,
              content: note.content ? note.content + ' ' + transcript : transcript
          });
      };
      recognition.start();
  };

  // === AI & SMART FEATURES ===
  const handleSmartEnhance = async (note: Note) => {
      setLoadingAI(note.id);
      const analysis = await smartAnalyzeNote(note.content);
      
      onUpdateNote({
          ...note,
          priority: analysis.priority,
          color: analysis.suggestedColor || note.color
      });
      setLoadingAI(null);
  };

  const handleComplete = (id: string) => {
      setShowConfetti(id);
      setTimeout(() => {
          onDeleteNote(id);
          setShowConfetti(null);
      }, 1000);
  };

  // === SKIN RENDERER ===
  const getSkinClasses = (note: Note) => {
      const base = `flex flex-col rounded-sm shadow-[5px_5px_15px_rgba(0,0,0,0.2)] cursor-move select-none transition-transform`;
      const isDragging = activeNote === note.id;
      
      // Glow based on priority
      let glow = '';
      if (note.priority === 'High') glow = 'shadow-[0_0_20px_rgba(239,68,68,0.6)] ring-1 ring-red-500';
      else if (note.priority === 'Medium') glow = 'shadow-[0_0_15px_rgba(234,179,8,0.4)]';

      switch (note.skin) {
          case StickyNoteSkin.HOLOGRAPHIC:
              return `${base} bg-gradient-to-br from-indigo-500/90 via-purple-500/90 to-pink-500/90 text-white backdrop-blur-md border border-white/20 ${glow}`;
          case StickyNoteSkin.CYBERPUNK:
              return `${base} bg-black border-2 border-neon-green text-green-400 font-mono ${glow}`;
          case StickyNoteSkin.MINIMAL:
              return `${base} bg-white border border-gray-200 text-gray-800 shadow-sm ${glow}`;
          case StickyNoteSkin.GLASS:
              return `${base} bg-white/10 backdrop-blur-xl border border-white/30 text-white ${glow}`;
          default: // CLASSIC
              return `${base} ${note.color} ${note.color.includes('zinc') ? 'text-white' : 'text-slate-900'} ${glow}`;
      }
  };

  return (
    <div 
        ref={boardRef}
        className={`relative w-full h-[calc(100vh-120px)] overflow-hidden rounded-2xl border ${theme.borderClass} transition-colors duration-500
          ${isFocusMode ? 'bg-black/95' : theme.id === 'NEON_VIBE' ? 'bg-slate-900/50' : 'bg-slate-100/50'}
        `}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
        {/* === HEADER CONTROLS === */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
             <div className="bg-black/20 backdrop-blur-sm p-1 rounded-full flex gap-1">
                 <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-2 rounded-full hover:bg-white/10 text-white`}>
                     <Maximize2 size={16} />
                 </button>
             </div>
        </div>

        {/* === DROP ZONE === */}
        <div className={`absolute bottom-0 left-0 w-full h-24 border-t-2 border-dashed transition-all duration-300 z-0 flex items-center justify-center
            ${dropZoneActive ? 'border-emerald-500 bg-emerald-500/10 scale-y-110' : 'border-transparent translate-y-20'}
        `}>
            <div className={`flex flex-col items-center ${dropZoneActive ? 'text-emerald-500 animate-bounce' : 'text-gray-400'}`}>
                <ArrowDownToLine size={24} />
                <span className="font-bold">Drop to Convert to Task</span>
            </div>
        </div>

        {/* === NOTES RENDERING === */}
        {notes.map(note => {
            const style = {
                left: note.x,
                top: note.y,
                width: note.width || 250,
                height: note.height || 200,
                transform: `rotate(${activeNote === note.id ? 0 : note.rotation || 0}deg) scale(${showConfetti === note.id ? 0 : 1})`,
                zIndex: activeNote === note.id ? 50 : 10,
                opacity: note.opacity || 1
            };

            return (
                <div
                    key={note.id}
                    onMouseDown={(e) => handleMouseDown(e, note)}
                    style={style}
                    className={`${getSkinClasses(note)} group`}
                >
                     {/* --- Top Bar --- */}
                    <div className="flex justify-between items-center p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex gap-1">
                            {/* Pin Toggle */}
                            <button onClick={(e) => {e.stopPropagation(); onUpdateNote({...note, isPinned: !note.isPinned})}}>
                                <Pin size={14} className={note.isPinned ? 'fill-current' : 'opacity-50'} />
                            </button>
                            {/* Smart Enhance */}
                            <button 
                                onClick={(e) => {e.stopPropagation(); handleSmartEnhance(note)}} 
                                className={`hover:text-amber-400 ${loadingAI === note.id ? 'animate-spin' : ''}`}
                                title="AI Smart Enhance"
                            >
                                <Sparkles size={14} />
                            </button>
                         </div>

                         <div className="flex gap-1">
                            {/* Skin Cycler */}
                            <button onClick={(e) => {
                                e.stopPropagation();
                                const skins = Object.values(StickyNoteSkin);
                                const currentIdx = skins.indexOf(note.skin);
                                const nextSkin = skins[(currentIdx + 1) % skins.length];
                                onUpdateNote({...note, skin: nextSkin});
                            }} className="text-xs opacity-50 hover:opacity-100 uppercase font-bold tracking-tighter">
                                {note.skin}
                            </button>
                            <button onClick={(e) => {e.stopPropagation(); onDeleteNote(note.id)}} className="hover:text-red-500">
                                <X size={14} />
                            </button>
                         </div>
                    </div>

                    {/* --- Content --- */}
                    <textarea
                        value={note.content}
                        onChange={(e) => onUpdateNote({ ...note, content: e.target.value })}
                        className={`
                            flex-1 bg-transparent resize-none outline-none p-4 font-medium leading-relaxed
                            ${note.skin === StickyNoteSkin.CYBERPUNK ? 'font-mono text-sm' : 'font-sans'}
                            placeholder-current placeholder-opacity-50
                        `}
                        placeholder="Write something..."
                    />

                    {/* --- Bottom Toolbar --- */}
                    <div className="p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex gap-2">
                             {/* Voice Input */}
                             <button onClick={(e) => {e.stopPropagation(); startListening(note)}} className={`${listeningNoteId === note.id ? 'text-red-500 animate-pulse' : 'opacity-50 hover:opacity-100'}`}>
                                 <Mic size={14} />
                             </button>
                             {/* Opacity Toggle */}
                             <input 
                                type="range" min="0.2" max="1" step="0.1" 
                                value={note.opacity || 1}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => onUpdateNote({...note, opacity: parseFloat(e.target.value)})}
                                className="w-12 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
                             />
                         </div>

                         <div className="flex gap-2">
                             {/* Complete Button */}
                             <button 
                                onClick={(e) => {e.stopPropagation(); handleComplete(note.id)}}
                                className="p-1 rounded-full border border-current hover:bg-white/20"
                                title="Mark Complete"
                             >
                                 <Check size={14} />
                             </button>
                         </div>
                    </div>

                    {/* --- Color Dots (Absolute) --- */}
                    <div className="absolute -left-6 top-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {COLORS.map(c => (
                             <button 
                                key={c} 
                                className={`w-3 h-3 rounded-full border border-black/10 shadow-sm ${c}`} 
                                onClick={(e) => { e.stopPropagation(); onUpdateNote({...note, color: c}); }}
                             />
                         ))}
                    </div>

                    {/* --- Resize Handle --- */}
                    <div 
                        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize resize-handle flex items-end justify-end p-1 opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => startResize(e, note)}
                    >
                        <div className="w-2 h-2 border-r-2 border-b-2 border-current opacity-50 pointer-events-none" />
                    </div>

                </div>
            );
        })}
        
        {/* Empty State */}
        {notes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                <Sparkles size={64} className="mb-4 opacity-20" />
                <p className="text-xl font-bold opacity-50">Sticky Board Empty</p>
            </div>
        )}

        {/* === CONFIRMATION MODAL === */}
        {confirmConversion.isOpen && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckSquare size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Convert to Task?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        This note will be removed and added to your main task list.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => setConfirmConversion({isOpen: false, noteId: null})}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmTaskConversion}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default StickyBoard;
