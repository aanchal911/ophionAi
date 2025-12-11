
import React, { useState } from 'react';
import { Theme, Project, Member, Task, User } from '../types';
import { MOCK_PROJECTS, MOCK_TASKS } from '../constants';
import { Briefcase, Users, User as UserIcon, Clock, CheckCircle2, Circle, MoreHorizontal, Sparkles, Plus, Search } from 'lucide-react';
import { analyzeProjectHealth } from '../services/geminiService';

interface ProjectsProps {
  theme: Theme;
  user: User;
}

const Projects: React.FC<ProjectsProps> = ({ theme, user }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PERSONAL' | 'GROUP'>('ALL');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const filteredProjects = projects.filter(p => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'PERSONAL') return p.type === 'Personal';
      if (activeTab === 'GROUP') return p.type === 'Group';
      return true;
  });

  const handleAnalyze = async (e: React.MouseEvent, project: Project) => {
      e.stopPropagation();
      setAnalyzing(true);
      setAiAnalysis(null);
      const result = await analyzeProjectHealth(project, MOCK_TASKS);
      setAiAnalysis(result);
      setAnalyzing(false);
  };

  const renderProjectCard = (project: Project) => (
      <div 
        key={project.id}
        onClick={() => { setSelectedProject(project); setAiAnalysis(null); }}
        className={`group p-6 rounded-2xl border ${theme.borderClass} ${theme.cardClass} cursor-pointer hover:scale-[1.01] transition-all`}
      >
          <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold 
                  ${project.type === 'Personal' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}
              >
                  {project.type}
              </div>
              <button className={`${theme.textSecondary} hover:text-current`}>
                  <MoreHorizontal size={20} />
              </button>
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${theme.textPrimary}`}>{project.title}</h3>
          <p className={`text-sm line-clamp-2 mb-6 ${theme.textSecondary}`}>{project.description}</p>
          
          <div className="flex items-center justify-between mt-auto">
              {/* Members */}
              <div className="flex -space-x-2">
                  {project.members.map((m, i) => (
                      <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700" title={m.name}>
                          {m.avatar}
                      </div>
                  ))}
                  {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          +
                      </div>
                  )}
              </div>
              
              {/* Progress */}
              <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                      <Clock size={12} className={theme.textSecondary} />
                      <span className={`text-xs font-bold ${theme.textPrimary}`}>{project.dueDate}</span>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full ${theme.id === 'NEON_VIBE' ? 'bg-pink-500' : 'bg-emerald-500'}`} style={{ width: `${project.progress}%` }} />
                  </div>
              </div>
          </div>
      </div>
  );

  const renderDetailView = () => {
      if (!selectedProject) return null;
      const projectTasks = MOCK_TASKS.filter(t => t.projectId === selectedProject.id);

      return (
          <div className="animate-in slide-in-from-right duration-300">
              <button 
                  onClick={() => setSelectedProject(null)}
                  className={`mb-4 text-sm font-bold flex items-center gap-2 ${theme.textSecondary} hover:text-current`}
              >
                  ← Back to Projects
              </button>
              
              <div className={`p-8 rounded-3xl border ${theme.borderClass} ${theme.cardClass} relative overflow-hidden`}>
                   {/* Header */}
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <h2 className={`text-3xl font-serif font-bold ${theme.textPrimary}`}>{selectedProject.title}</h2>
                               <span className={`px-3 py-1 rounded-full text-xs font-bold border border-current opacity-60 ${theme.textPrimary}`}>
                                   {selectedProject.status}
                               </span>
                           </div>
                           <p className={`${theme.textSecondary}`}>{selectedProject.description}</p>
                       </div>
                       
                       <div className="flex gap-3">
                           <button 
                                onClick={(e) => handleAnalyze(e, selectedProject)}
                                disabled={analyzing}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                                ${theme.buttonClass} disabled:opacity-50`}
                            >
                                <Sparkles size={16} className={analyzing ? 'animate-spin' : ''} />
                                AI Health Check
                           </button>
                           <button className={`p-2 rounded-xl border ${theme.borderClass} ${theme.textSecondary} hover:bg-black/5`}>
                               <Users size={20} />
                           </button>
                       </div>
                   </div>

                   {/* AI Insight Box */}
                   {aiAnalysis && (
                       <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                           <h4 className={`flex items-center gap-2 font-bold mb-2 ${theme.textPrimary}`}>
                               <Sparkles size={16} className="text-blue-500" />
                               Ophion Analysis
                           </h4>
                           <p className={`text-sm ${theme.textPrimary}`}>{aiAnalysis}</p>
                       </div>
                   )}

                   {/* Stats Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       <div className={`p-4 rounded-xl bg-white/5 border ${theme.borderClass}`}>
                           <span className={`text-xs ${theme.textSecondary}`}>Progress</span>
                           <div className={`text-2xl font-bold ${theme.accent}`}>{selectedProject.progress}%</div>
                       </div>
                       <div className={`p-4 rounded-xl bg-white/5 border ${theme.borderClass}`}>
                           <span className={`text-xs ${theme.textSecondary}`}>Team Size</span>
                           <div className={`text-2xl font-bold ${theme.textPrimary}`}>{selectedProject.members.length}</div>
                       </div>
                       <div className={`p-4 rounded-xl bg-white/5 border ${theme.borderClass}`}>
                           <span className={`text-xs ${theme.textSecondary}`}>Tasks</span>
                           <div className={`text-2xl font-bold ${theme.textPrimary}`}>{projectTasks.length}</div>
                       </div>
                   </div>

                   {/* Project Tasks */}
                   <h3 className={`text-xl font-bold mb-4 ${theme.textPrimary}`}>Project Tasks</h3>
                   <div className="space-y-3">
                       {projectTasks.length === 0 ? (
                           <div className={`text-center py-8 ${theme.textSecondary}`}>No tasks assigned to this project yet.</div>
                       ) : projectTasks.map(task => (
                           <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border ${theme.borderClass} bg-white/5`}>
                               <div className="flex items-center gap-3">
                                   {task.completed ? <CheckCircle2 className="text-green-500" /> : <Circle className={theme.textSecondary} />}
                                   <span className={task.completed ? 'line-through opacity-50' : '' + ` ${theme.textPrimary}`}>{task.title}</span>
                               </div>
                               <div className="flex items-center gap-4">
                                   {task.assignedTo && (
                                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                           {MOCK_PROJECTS[0].members.find(m => m.id === task.assignedTo)?.avatar || '??'}
                                       </div>
                                   )}
                                   <span className={`text-xs font-bold px-2 py-1 rounded-full 
                                       ${task.priority === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                       {task.priority}
                                   </span>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>
          </div>
      );
  };

  if (selectedProject) return renderDetailView();

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto mb-20 md:mb-0 space-y-6 overflow-y-auto h-screen no-scrollbar pb-24">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h2 className={`text-3xl font-serif font-bold ${theme.textPrimary}`}>Projects Hub</h2>
                <p className={theme.textSecondary}>Manage your personal growth and team collaborations.</p>
            </div>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${theme.buttonClass}`}>
                <Plus size={18} /> New Project
            </button>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-gray-100/50 dark:bg-white/5 w-fit">
            {['ALL', 'PERSONAL', 'GROUP'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                        ${activeTab === tab ? 'bg-white shadow-sm text-black' : `${theme.textSecondary} hover:text-current`}
                    `}
                >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
            ))}
        </div>

        {/* Search Bar */}
        <div className={`flex items-center gap-2 p-3 rounded-xl border ${theme.borderClass} ${theme.cardClass}`}>
            <Search size={20} className={theme.textSecondary} />
            <input 
                placeholder="Search projects..." 
                className={`bg-transparent outline-none w-full ${theme.textPrimary} placeholder-gray-400`}
            />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(renderProjectCard)}
            
            {/* Empty State / Add Card */}
            <button className={`p-6 rounded-2xl border-2 border-dashed ${theme.borderClass} flex flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 hover:border-current transition-all group`}>
                <div className={`p-4 rounded-full bg-black/5 group-hover:bg-black/10 transition-colors`}>
                    <Plus size={24} className={theme.textSecondary} />
                </div>
                <span className={`font-bold ${theme.textSecondary}`}>Create Project</span>
            </button>
        </div>
    </div>
  );
};

export default Projects;
