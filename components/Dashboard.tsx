
import React, { useState, useEffect } from 'react';
import { Theme, Task, Note, StickyNoteSkin, User } from '../types';
import { MOCK_TASKS, MOCK_NOTES } from '../constants';
import { 
  CheckCircle2, Circle, Clock, TrendingUp, Sparkles, Trophy, 
  Plus, StickyNote, Wand2, X, Calendar, MoreHorizontal, Pin, Layout, Grid, CloudOff,
  Play, Pause, RotateCcw, Timer
} from 'lucide-react';
import { generateMotivation, generateTasksFromInput, generateDailyPlan } from '../services/geminiService';
import { 
    subscribeToTasks, addTaskToDb, updateTaskInDb, deleteTaskFromDb,
    subscribeToNotes, addNoteToDb, updateNoteInDb, deleteNoteFromDb 
} from '../services/firebase';
import StickyBoard from './StickyBoard';

interface DashboardProps {
  theme: Theme;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ theme, user }) => {
  // Data State - Initialize empty, load from DB
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dbConnected, setDbConnected] = useState(true);
  
  const [motivation, setMotivation] = useState<string>("Initializing wisdom...");
  const [loadingWisdom, setLoadingWisdom] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<'LIST' | 'STICKY_BOARD'>('LIST');

  // Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [taskMode, setTaskMode] = useState<'MANUAL' | 'AI'>('MANUAL');
  
  // Form States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('Work');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Medium');
  
  // Date & Time Form States
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskStartTime, setNewTaskStartTime] = useState('');
  const [newTaskEndTime, setNewTaskEndTime] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('bg-yellow-100');

  // Load Data
  useEffect(() => {
    fetchWisdom();
    
    // Subscribe to Firebase with User ID
    try {
        const unsubscribeTasks = subscribeToTasks(user.uid, (data) => {
            setTasks(currentTasks => {
                return data.map(serverTask => {
                    const localTask = currentTasks.find(t => t.id === serverTask.id);
                    if (localTask?.isTimerRunning) {
                        return { ...serverTask, timeSpent: localTask.timeSpent, isTimerRunning: true };
                    }
                    return serverTask;
                });
            });
            setDbConnected(true);
        });
        const unsubscribeNotes = subscribeToNotes(user.uid, (data) => {
            setNotes(data);
            setDbConnected(true);
        });
        
        return () => {
            unsubscribeTasks();
            unsubscribeNotes();
        };
    } catch (e) {
        console.error("Firebase connection failed", e);
        setDbConnected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  // Timer Ticker
  useEffect(() => {
      let interval: NodeJS.Timeout;
      const hasRunningTimer = tasks.some(t => t.isTimerRunning);
      
      if (hasRunningTimer) {
          interval = setInterval(() => {
              setTasks(prevTasks => prevTasks.map(task => {
                  if (task.isTimerRunning) {
                      return { ...task, timeSpent: (task.timeSpent || 0) + 1 };
                  }
                  return task;
              }));
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [tasks]);

  const fetchWisdom = async () => {
    setLoadingWisdom(true);
    const completedCount = tasks.filter(t => t.completed).length;
    const context = completedCount > 2 ? "productive and winning" : "needs a gentle push to start working";
    const quote = await generateMotivation(context);
    setMotivation(quote);
    setLoadingWisdom(false);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const updated = { ...task, completed: !task.completed };
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        if (dbConnected) await updateTaskInDb(updated);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (dbConnected) await deleteTaskFromDb(id);
  };
  
  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (dbConnected) await deleteNoteFromDb(id);
  };

  const togglePinNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
        const updated = { ...note, isPinned: !note.isPinned };
        setNotes(prev => prev.map(n => n.id === id ? updated : n));
        if (dbConnected) await updateNoteInDb(updated);
    }
  };

  const updateNote = async (updatedNote: Note) => {
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      if (dbConnected) await updateNoteInDb(updatedNote);
  };

  // --- TIMER LOGIC ---
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const newIsRunning = !task.isTimerRunning;
      const updatedTask = { ...task, isTimerRunning: newIsRunning };

      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      if (dbConnected) await updateTaskInDb(updatedTask);
  };

  const resetTimer = async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const updatedTask = { ...task, isTimerRunning: false, timeSpent: 0 };
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      if (dbConnected) await updateTaskInDb(updatedTask);
  };

  const handleManualAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    let duration = 0;
    if (newTaskStartTime && newTaskEndTime) {
        const [startH, startM] = newTaskStartTime.split(':').map(Number);
        const [endH, endM] = newTaskEndTime.split(':').map(Number);
        duration = (endH * 60 + endM) - (startH * 60 + startM);
        if (duration < 0) duration += 24 * 60;
    }
    
    const dateObj = new Date(newTaskDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[dateObj.getDay()];

    const newTask = {
      userId: user.uid, // Assign to current user
      title: newTaskTitle,
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      dueDate: newTaskDate,
      startTime: newTaskStartTime || undefined,
      duration: duration > 0 ? duration : undefined,
      day: dayName,
      timeSpent: 0,
      isTimerRunning: false
    };
    
    setTasks(prev => [{ ...newTask, id: 'temp-' + Date.now() } as Task, ...prev]);
    if (dbConnected) await addTaskToDb(newTask);
    
    setShowTaskModal(false);
    setNewTaskTitle('');
    setNewTaskStartTime('');
    setNewTaskEndTime('');
  };

  const handleAiAddTask = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAI(true);
    const newTasks = await generateTasksFromInput(aiPrompt);
    
    const tasksWithUser = newTasks.map(t => ({ 
        ...t, 
        userId: user.uid, 
        timeSpent: 0, 
        isTimerRunning: false 
    }));

    setTasks(prev => [...tasksWithUser, ...prev]);
    if (dbConnected) {
        for (const t of tasksWithUser) {
            const { id, ...taskData } = t;
            await addTaskToDb(taskData);
        }
    }
    
    setLoadingAI(false);
    setShowTaskModal(false);
    setAiPrompt('');
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    const newNote = {
      userId: user.uid,
      content: newNoteContent,
      color: newNoteColor,
      skin: StickyNoteSkin.CLASSIC,
      isPinned: false,
      date: 'Just now',
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      rotation: (Math.random() * 6) - 3,
      width: 250,
      height: 200,
      opacity: 1
    };
    
    setNotes(prev => [{ ...newNote, id: 'temp-' + Date.now() } as Note, ...prev]);
    if (dbConnected) await addNoteToDb(newNote);
    
    setShowNoteModal(false);
    setNewNoteContent('');
  };

  const handleMagicSetup = async () => {
    setLoadingAI(true);
    const { tasks: aiTasks, noteContent } = await generateDailyPlan();
    
    const tasksWithUser = aiTasks.map(t => ({ 
        ...t, 
        userId: user.uid,
        timeSpent: 0, 
        isTimerRunning: false 
    }));

    setTasks(prev => [...tasksWithUser, ...prev]);
    if (dbConnected) {
        for (const t of tasksWithUser) {
            const { id, ...taskData } = t; 
            await addTaskToDb(taskData);
        }
    }

    if (noteContent) {
        const magicNote = {
            userId: user.uid,
            content: noteContent,
            color: 'bg-emerald-100 text-emerald-900',
            skin: StickyNoteSkin.CLASSIC,
            isPinned: true,
            date: 'Daily Goal',
            x: 100,
            y: 100,
            width: 250,
            height: 200,
            rotation: 0,
            opacity: 1
        };
        setNotes(prev => [{...magicNote, id: 'temp-'+Date.now()} as Note, ...prev]);
        if (dbConnected) await addNoteToDb(magicNote);
    }
    setLoadingAI(false);
  };

  const handleNoteToTask = async (noteId: string, taskTitle: string) => {
      const newTask = {
        userId: user.uid,
        title: taskTitle.length > 50 ? taskTitle.substring(0, 50) + "..." : taskTitle,
        category: 'Work' as any,
        priority: 'Medium' as any,
        completed: false,
        dueDate: 'Today',
        timeSpent: 0,
        isTimerRunning: false
      };
      
      setTasks(prev => [{ ...newTask, id: 'temp-' + Date.now() } as Task, ...prev]);
      deleteNote(noteId);
      
      if (dbConnected) {
          await addTaskToDb(newTask);
      }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work': return 'bg-blue-500/20 text-blue-500';
      case 'Personal': return 'bg-purple-500/20 text-purple-500';
      case 'Health': return 'bg-rose-500/20 text-rose-500';
      case 'Growth': return 'bg-emerald-500/20 text-emerald-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 w-full max-w-7xl mx-auto mb-20 md:mb-0">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-serif font-bold ${theme.textPrimary}`}>Dashboard</h2>
          <div className="flex items-center gap-2">
            <p className={theme.textSecondary}>Orchestrate your day, {user.displayName || 'Olympian'}.</p>
          </div>
        </div>
        <div className="flex gap-2">
            <div className={`flex p-1 rounded-xl border ${theme.borderClass} ${theme.cardClass}`}>
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? theme.buttonClass : theme.textSecondary}`}
                    title="List View"
                >
                    <Layout size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('STICKY_BOARD')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'STICKY_BOARD' ? theme.buttonClass : theme.textSecondary}`}
                    title="Sticky Board Mode"
                >
                    <Grid size={18} />
                </button>
            </div>
            <button 
                onClick={handleMagicSetup}
                disabled={loadingAI}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all 
                bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:brightness-110 disabled:opacity-50`}
            >
                {loadingAI ? <Sparkles className="animate-spin" size={18} /> : <Wand2 size={18} />}
                Magic Setup
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === 'STICKY_BOARD' ? (
          <div className="animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-4">
                 <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Sticky Board</h3>
                 <button onClick={() => setShowNoteModal(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${theme.buttonClass}`}>
                     <Plus size={16}/> Quick Note
                 </button>
             </div>
             <StickyBoard 
                theme={theme} 
                notes={notes} 
                user={user}
                onUpdateNote={updateNote} 
                onDeleteNote={deleteNote}
                onConvertToTask={handleNoteToTask}
            />
          </div>
      ) : (
          /* Standard List View Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            
            {/* Left Column: Stats & Tasks (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Quick Stats / Wisdom */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                    <div className={`p-5 rounded-2xl border ${theme.borderClass} ${theme.cardClass} relative overflow-hidden`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-serif font-bold ${theme.accent}`}>Daily Wisdom</h3>
                            <button onClick={fetchWisdom} disabled={loadingWisdom} className={theme.textSecondary}><Sparkles size={16}/></button>
                        </div>
                        <p className={`italic text-sm ${theme.textPrimary} min-h-[3rem]`}>"{motivation}"</p>
                    </div>
                    
                    <div className={`p-5 rounded-2xl border ${theme.borderClass} ${theme.cardClass} flex items-center justify-between`}>
                        <div>
                            <h3 className={`font-serif font-bold ${theme.textPrimary}`}>Progress</h3>
                            <p className={`text-xs ${theme.textSecondary}`}>{completedTasks}/{tasks.length} Tasks Completed</p>
                        </div>
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={theme.id === 'OLYMPUS' ? '#cbd5e1' : '#333'} strokeWidth="4"/>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${progress}, 100`} className={`${theme.accent} transition-all duration-1000 ease-out`}/>
                            </svg>
                            <span className={`absolute text-xs font-bold ${theme.textPrimary}`}>{progress}%</span>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className={`p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass} min-h-[400px]`}>
                    <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Tasks</h3>
                    <button 
                        onClick={() => setShowTaskModal(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${theme.buttonClass}`}
                    >
                        <Plus size={16} /> Add Task
                    </button>
                    </div>
                    
                    <div className="space-y-3">
                    {tasks.length === 0 && (
                        <div className={`text-center py-10 ${theme.textSecondary}`}>
                            <p>No tasks yet. Use <span className="font-bold">Magic Setup</span> or add one manually!</p>
                        </div>
                    )}
                    {tasks.map((task) => (
                        <div 
                        key={task.id}
                        className={`group flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-xl transition-all border border-transparent hover:border-white/10 ${task.completed ? 'opacity-50' : ''} hover:bg-white/5 gap-3 sm:gap-0`}
                        >
                            <div className="flex items-center w-full sm:w-auto flex-1">
                                <button onClick={() => toggleTask(task.id)} className={`mr-4 ${theme.accent} transition-transform active:scale-90 shrink-0`}>
                                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${task.completed ? 'line-through opacity-60' : ''} ${theme.textPrimary}`}>
                                    {task.title}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs mt-1">
                                        <span className={`${theme.textSecondary} flex items-center gap-1`}>
                                            <Clock size={12} /> {task.dueDate === new Date().toISOString().split('T')[0] ? 'Today' : task.dueDate}
                                            {task.startTime && ` • ${task.startTime}`}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getCategoryColor(task.category)}`}>
                                            {task.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timer & Actions */}
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0 pl-10 sm:pl-0">
                                {/* Focus Timer */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.borderClass} ${task.isTimerRunning ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5'}`}>
                                    <span className={`font-mono text-sm font-bold ${task.isTimerRunning ? 'text-emerald-500' : theme.textSecondary}`}>
                                        {formatTime(task.timeSpent || 0)}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleTimer(task.id); }}
                                        className={`p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${task.isTimerRunning ? 'text-emerald-500' : theme.textSecondary}`}
                                    >
                                        {task.isTimerRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                    </button>
                                    {(task.timeSpent || 0) > 0 && !task.isTimerRunning && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); resetTimer(task.id); }}
                                            className={`p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${theme.textSecondary}`}
                                            title="Reset Timer"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`hidden md:block px-2 py-0.5 rounded-full text-[10px] font-bold 
                                        ${task.priority === 'High' ? 'bg-red-500/20 text-red-500' : 
                                        task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                                        'bg-green-500/20 text-green-500'}`}>
                                        {task.priority}
                                    </div>
                                    <button onClick={() => deleteTask(task.id)} className={`opacity-0 group-hover:opacity-100 text-red-400 p-1 hover:bg-red-400/10 rounded`}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Sticky Notes (1/3 width) - Mini View */}
            <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass} h-full`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Sticky Notes</h3>
                        <button 
                            onClick={() => setShowNoteModal(true)}
                            className={`p-2 rounded-lg hover:bg-white/10 ${theme.textPrimary}`}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {notes.slice(0, 5).map(note => (
                            <div key={note.id} className={`p-4 rounded-xl relative group transition-all hover:-translate-y-1 shadow-sm ${note.color} ${note.isPinned ? 'ring-2 ring-offset-2 ring-amber-400/50' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase opacity-60 mix-blend-multiply">{note.date}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => togglePinNote(note.id)} className="p-1 hover:bg-black/5 rounded">
                                            <Pin size={12} className={note.isPinned ? 'fill-current' : ''}/>
                                        </button>
                                        <button onClick={() => deleteNote(note.id)} className="p-1 hover:bg-black/5 rounded">
                                            <X size={12}/>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-800/90">{note.content}</p>
                            </div>
                        ))}
                        {notes.length === 0 && (
                            <div className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center ${theme.textSecondary}`}>
                                <StickyNote className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Add a note to remember ideas</p>
                            </div>
                        )}
                        <button 
                            onClick={() => setViewMode('STICKY_BOARD')}
                            className={`w-full py-2 mt-2 text-xs font-bold opacity-50 hover:opacity-100 ${theme.textPrimary}`}
                        >
                            View All on Board →
                        </button>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${theme.id === 'OLYMPUS' ? 'bg-white' : 'bg-slate-900 border border-slate-700'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Add New Task</h3>
                    <button onClick={() => setShowTaskModal(false)} className={theme.textSecondary}><X size={20}/></button>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <button 
                        onClick={() => setTaskMode('MANUAL')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${taskMode === 'MANUAL' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
                    >
                        Manual Entry
                    </button>
                    <button 
                         onClick={() => setTaskMode('AI')}
                         className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${taskMode === 'AI' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
                    >
                        <Sparkles size={14} /> AI Assist
                    </button>
                </div>

                {taskMode === 'MANUAL' ? (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-xs font-bold mb-1 ${theme.textSecondary}`}>Task Title</label>
                            <input 
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className={`w-full p-3 rounded-lg bg-transparent border ${theme.borderClass} outline-none focus:ring-2 ring-blue-500/50 ${theme.textPrimary}`} 
                                placeholder="e.g. Finish quarterly review"
                            />
                        </div>
                        
                        {/* Date & Time Picker */}
                        <div className="grid grid-cols-1 gap-4">
                             <div>
                                <label className={`block text-xs font-bold mb-1 ${theme.textSecondary}`}>Date</label>
                                <input 
                                    type="date"
                                    value={newTaskDate}
                                    onChange={(e) => setNewTaskDate(e.target.value)}
                                    className={`w-full p-3 rounded-lg bg-transparent border ${theme.borderClass} outline-none ${theme.textPrimary} dark:bg-slate-900`}
                                />
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className={`block text-xs font-bold mb-1 ${theme.textSecondary}`}>Start Time</label>
                                <input 
                                    type="time"
                                    value={newTaskStartTime}
                                    onChange={(e) => setNewTaskStartTime(e.target.value)}
                                    className={`w-full p-3 rounded-lg bg-transparent border ${theme.borderClass} outline-none ${theme.textPrimary} dark:bg-slate-900`}
                                />
                             </div>
                             <div>
                                <label className={`block text-xs font-bold mb-1 ${theme.textSecondary}`}>End Time</label>
                                <input 
                                    type="time"
                                    value={newTaskEndTime}
                                    onChange={(e) => setNewTaskEndTime(e.target.value)}
                                    className={`w-full p-3 rounded-lg bg-transparent border ${theme.borderClass} outline-none ${theme.textPrimary} dark:bg-slate-900`}
                                />
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className={`block text-xs font-bold mb-1 ${theme.textSecondary}`}>Category</label>
                                <select 
                                    value={newTaskCategory}
                                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                                    className={`w-full p-3 rounded-lg bg-transparent border ${theme.borderClass} outline-none ${theme.textPrimary} dark:bg-slate-900`}
                                >
                                    <option value="Work">Work</option>
                                    <option value="Personal">Personal</option>
                                    <option value="Health">Health</option>
                                    <option value="Growth">Growth</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-1 ${theme.textSecondary}`}>Priority</label>
                                <select 
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                    className={`w-full p-3 rounded-lg bg-transparent border ${theme.borderClass} outline-none ${theme.textPrimary} dark:bg-slate-900`}
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={handleManualAddTask}
                            className={`w-full py-3 rounded-xl font-bold mt-2 ${theme.buttonClass}`}
                        >
                            Create Task
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-xs font-bold mb-1 ${theme.textSecondary}`}>Tell Ophion your goal</label>
                            <textarea 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className={`w-full p-3 rounded-lg bg-transparent border ${theme.borderClass} outline-none focus:ring-2 ring-purple-500/50 ${theme.textPrimary} min-h-[100px] resize-none`} 
                                placeholder="e.g. I need to plan a marketing campaign for next week and also find time to exercise 3 times."
                            />
                        </div>
                        <button 
                            onClick={handleAiAddTask}
                            disabled={loadingAI}
                            className={`w-full py-3 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 ${theme.buttonClass} disabled:opacity-50`}
                        >
                            {loadingAI ? <Sparkles className="animate-spin" /> : <Wand2 />}
                            Generate Tasks
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl ${theme.id === 'OLYMPUS' ? 'bg-white' : 'bg-slate-900 border border-slate-700'}`}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>New Sticky Note</h3>
                      <button onClick={() => setShowNoteModal(false)} className={theme.textSecondary}><X size={20}/></button>
                  </div>
                  <div className="space-y-4">
                      <textarea 
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className={`w-full p-4 rounded-xl outline-none text-slate-800 min-h-[150px] resize-none ${newNoteColor}`}
                          placeholder="Type your note here..."
                      />
                      <div className="flex gap-2 justify-center">
                          {['bg-yellow-100', 'bg-blue-100', 'bg-pink-100', 'bg-emerald-100', 'bg-purple-100'].map(color => (
                              <button 
                                key={color}
                                onClick={() => setNewNoteColor(color)}
                                className={`w-6 h-6 rounded-full border border-gray-200 ${color} ${newNoteColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                              />
                          ))}
                      </div>
                      <button 
                          onClick={handleAddNote}
                          className={`w-full py-3 rounded-xl font-bold ${theme.buttonClass}`}
                      >
                          Add Note
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Dashboard;
