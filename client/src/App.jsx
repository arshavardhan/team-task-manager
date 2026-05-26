import React, { useState, useEffect } from 'react';
import { ApiService } from './ApiService';
import { 
  LayoutDashboard, Folder, CheckSquare, LogOut, 
  Plus, AlertCircle, ShieldAlert, User, Mail, Lock, 
  Activity, Layers, Calendar, CheckCircle2, Clock
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({ totalTasks: 0, todo: 0, inProgress: 0, done: 0, overdue: 0, overdueTasks: [] });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [newProject, setNewProject] = useState({ name: '', description: '', members: [] });
  const [newTask, setNewTask] = useState({ title: '', description: '', project_id: '', assigned_to: '', due_date: '' });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const m = await ApiService.getMetrics();
      setMetrics(m);
      const p = await ApiService.getProjects();
      setProjects(p);
      const t = await ApiService.getTasks();
      setTasks(t);
      if (user.role === 'Admin') {
        const u = await ApiService.getUsers();
        setAllUsers(u);
      }
    } catch (err) {
      console.error("Error pulling data", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const data = await ApiService.login(authForm.email, authForm.password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        await ApiService.signup(authForm.name, authForm.email, authForm.password, authForm.role);
        alert("Registration Successful! Proceeding to auth gate.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Authentication Failure");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createProject(newProject.name, newProject.description, newProject.members);
      setNewProject({ name: '', description: '', members: [] });
      fetchDashboardData();
    } catch (err) { alert(err.response?.data?.detail); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTask,
        project_id: parseInt(newTask.project_id),
        assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null,
        due_date: new Date(newTask.due_date).toISOString()
      };
      await ApiService.createTask(payload);
      setNewTask({ title: '', description: '', project_id: '', assigned_to: '', due_date: '' });
      fetchDashboardData();
    } catch (err) { alert(err.response?.data?.detail); }
  };

  const changeTaskStatus = async (taskId, nextStatus) => {
    try {
      await ApiService.updateTaskStatus(taskId, nextStatus);
      fetchDashboardData();
    } catch (err) { alert(err.response?.data?.detail); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Modern Absolute Aesthetic Background Glow Rings */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="glass-card p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-indigo-600/10 text-indigo-400 rounded-xl mb-3 border border-indigo-500/20">
              <Activity size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">TaskEngine</h2>
            <p className="text-slate-400 text-sm mt-1.5">{isLogin ? 'Sign in to access your dashboard' : 'Create a fresh workspace profile'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-2 bg-slate-900/60 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" placeholder="John Doe" required onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                </div>
              </div>
            )}
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="email" className="w-full pl-10 pr-4 py-2 bg-slate-900/60 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" placeholder="name@company.com" required onChange={e => setAuthForm({...authForm, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="password" className="w-full pl-10 pr-4 py-2 bg-slate-900/60 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" placeholder="••••••••" required onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Workspace Role</label>
                <select className="w-full p-2 mt-1 bg-slate-900/60 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" onChange={e => setAuthForm({...authForm, role: e.target.value})}>
                  <option value="Member">Team Member</option>
                  <option value="Admin">Workspace Admin</option>
                </select>
              </div>
            )}
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-950/50 mt-4 text-sm tracking-wide">
              {isLogin ? 'Access Workspace' : 'Build Account'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
            <p className="text-slate-400 text-xs">
              {isLogin ? "New to the platform? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 font-medium hover:text-indigo-300 underline underline-offset-4 bg-transparent border-none p-0 cursor-pointer">
                {isLogin ? 'Register account' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar Layout Navigation */}
      <div className="w-68 bg-slate-950 border-r border-slate-900 p-6 flex flex-col justify-between relative z-10">
        <div>
          <div className="mb-8 flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-900">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-950">T</div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">TaskEngine v1</h1>
              <p className="text-[11px] font-medium text-indigo-400 tracking-wide uppercase mt-0.5">{user.role}</p>
            </div>
          </div>
          
          <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-3">Navigation</div>
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
              { id: 'projects', label: 'Projects', icon: <Folder size={16} /> }, // Resolved: Changed FolderCanvas to Folder here
              { id: 'tasks', label: 'Task Board', icon: <CheckSquare size={16} /> }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-900 pt-4">
          <div className="px-3 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-400 truncate">{user.name}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-950/20 px-3 py-2 rounded-lg transition-all text-sm w-full font-medium">
            <LogOut size={16} /> Sign Out Workspace
          </button>
        </div>
      </div>

      {/* Main Workspace Frame Container */}
      <div className="flex-1 p-8 overflow-y-auto relative z-10">
        
        {/* --- TAB: DASHBOARD METRICS --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">Workspace Overview</h2>
              <p className="text-slate-400 text-sm mt-1">Real-time status metrics of your active development pipeline.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { title: 'Total Operations', val: metrics.totalTasks, color: 'text-white', border: 'border-slate-800', icon: <Layers size={18} className="text-indigo-400" /> },
                { title: 'Pending Backlog', val: metrics.todo, color: 'text-indigo-400', border: 'border-slate-800', icon: <Clock size={18} className="text-indigo-400" /> },
                { title: 'In Active Sprint', val: metrics.inProgress, color: 'text-amber-400', border: 'border-slate-800', icon: <Activity size={18} className="text-amber-400" /> },
                { title: 'Closed / Completed', val: metrics.done, color: 'text-emerald-400', border: 'border-slate-800', icon: <CheckCircle2 size={18} className="text-emerald-400" /> }
              ].map((card, idx) => (
                <div key={idx} className={`glass-card p-5 rounded-xl border ${card.border} shadow-sm flex items-center justify-between`}>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                    <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.val}</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">{card.icon}</div>
                </div>
              ))}
            </div>

            {/* Alert Panel for Overdue items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400" /> System Bottleneck Warnings ({metrics.overdue})
                </h3>
                {metrics.overdueTasks.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">All systems operating within acceptable parameters.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
                    {metrics.overdueTasks.map(t => (
                      <div key={t.id} className="bg-slate-950/60 p-3.5 rounded-lg border border-red-950/60 flex items-center justify-between text-sm shadow-sm">
                        <span className="font-semibold text-slate-200">{t.title}</span>
                        <span className="text-xs bg-red-950/50 border border-red-900 text-red-400 px-2.5 py-1 rounded-md font-medium">Overdue Target Date</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="glass-card border border-slate-800 rounded-xl p-6 bg-gradient-to-b from-indigo-950/10 to-transparent">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Workspace Insight</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Admins can use the Task Board tab to instantiate project parameters and distribute workloads across the cluster map. Members are constrained to viewing and updating the lifecycle of items explicitly delegated to them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: PROJECTS --- */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">Project Infrastructure</h2>
              <p className="text-slate-400 text-sm mt-1">High-level containers mapping active workspace clusters.</p>
            </div>

            {user.role === 'Admin' && (
              <form onSubmit={handleCreateProject} className="glass-card p-5 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-end shadow-lg">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project System Name</label>
                  <input type="text" className="w-full p-2 mt-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="Alpha Alpha Engine" value={newProject.name} required onChange={e => setNewProject({...newProject, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Scope Scope</label>
                  <input type="text" className="w-full p-2 mt-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="Brief outline description..." value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all h-9.5"><Plus size={16}/> Build Framework</button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map(p => (
                <div key={p.id} className="glass-card p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-md group relative">
                  <div className="absolute top-4 right-4 text-slate-600 group-hover:text-indigo-400 transition-colors"><Folder size={18} /></div> {/* Resolved: Changed FolderCanvas to Folder here */}
                  <h3 className="text-lg font-bold text-white tracking-tight">{p.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-2">{p.description || 'No system parameters documented for this framework item.'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: TASKS BOARD --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">System Task Flow</h2>
              <p className="text-slate-400 text-sm mt-1">Track and transition the lifecycle vectors of operational components.</p>
            </div>

            {user.role === 'Admin' && (
              <form onSubmit={handleCreateTask} className="glass-card p-5 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-4 items-end shadow-md text-xs">
                <div className="md:col-span-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Task Assignment Title</label>
                  <input type="text" className="w-full p-2 mt-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="Deploy updates..." value={newTask.title} required onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Parent Cluster</label>
                  <select className="w-full p-2 mt-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" value={newTask.project_id} required onChange={e => setNewTask({...newTask, project_id: e.target.value})}>
                    <option value="">Select Target Link</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Delegated Agent</label>
                  <select className="w-full p-2 mt-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}>
                    <option value="">Leave Unallocated</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Target Resolution Date</label>
                  <input type="date" className="w-full p-2 mt-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" value={newTask.due_date} required onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all h-9.5"><Plus size={16}/> Instantiate</button>
              </form>
            )}

            {/* Kanban Columns Component Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {['To Do', 'In Progress', 'Done'].map(colStatus => (
                <div key={colStatus} className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 min-h-[450px]">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{colStatus}</span>
                    <span className="text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 h-5 w-5 rounded-full flex items-center justify-center">{tasks.filter(t => t.status === colStatus).length}</span>
                  </div>
                  
                  <div className="space-y-3.5">
                    {tasks.filter(t => t.status === colStatus).map(task => {
                      const isOverdue = colStatus !== 'Done' && new Date(task.due_date) < new Date();
                      return (
                        <div key={task.id} className={`glass-card p-4 rounded-xl shadow-sm border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group ${isOverdue ? 'border-red-900/40 bg-red-950/5' : 'hover:border-slate-700'}`}>
                          {isOverdue && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                          <div>
                            <h4 className="text-white font-semibold text-sm tracking-tight">{task.title}</h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 font-medium">
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-indigo-400 font-semibold">Project Node: {task.project_id}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-900">
                            <span className={`font-medium flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                              <Calendar size={12} /> {new Date(task.due_date).toLocaleDateString()}
                            </span>
                            <select className="bg-slate-900 border border-slate-800 rounded-md text-slate-300 py-1 px-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500" value={task.status} onChange={e => changeTaskStatus(task.id, e.target.value)}>
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}