
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  UserPlus, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Award,
  Search,
  ChevronRight,
  Plus,
  ArrowLeft,
  Trash2,
  Clock,
  Edit2,
  Loader2,
  Lock,
  Mail,
  LogOut,
  User as UserIcon,
  CreditCard,
  Globe,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Database,
  Wifi,
  WifiOff,
  Copy,
  Check
} from 'lucide-react';
import { Employee, OperationalEvent, View, AppUser, Relative } from './types';
import { 
  fetchEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployeeById, 
  fetchEvents, 
  createEvent, 
  loginUser,
  checkDbConnection,
  supabase
} from './store';

const formatBRL = (val: any) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

// Função safeStr aprimorada para evitar o erro [object Object]
const safeStr = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (val instanceof Error) return val.message;
  if (typeof val === 'object') {
    // Tenta extrair mensagens comuns de erro do Supabase ou stringify o objeto
    return val.message || val.error_description || val.error || JSON.stringify(val);
  }
  return String(val);
};

interface Notification {
  type: 'success' | 'error';
  message: string;
  isCacheError?: boolean;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('rh_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    checkDbConnection().then(online => {
      setDbStatus(online ? 'online' : 'offline');
      if (online) loadAllData();
      else setIsLoading(false);
    });
  }, []);

  const showNotification = (type: 'success' | 'error', message: any, isCacheError = false) => {
    setNotification({ type, message: safeStr(message), isCacheError });
    if (!isCacheError) setTimeout(() => setNotification(null), 5000);
  };

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [empData, eventData] = await Promise.all([fetchEmployees(), fetchEvents()]);
      setEmployees(empData);
      setEvents(eventData);
    } catch (err: any) {
      const msg = safeStr(err);
      const isCache = msg.toLowerCase().includes('column') || msg.toLowerCase().includes('schema') || msg.toLowerCase().includes('cache');
      showNotification('error', "Erro de sincronização: " + msg, isCache);
      setDbStatus('offline');
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const user = await loginUser(formData.get('email') as string, formData.get('password') as string);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('rh_user', JSON.stringify(user));
      showNotification('success', `Bem-vindo, ${user.name}`);
      loadAllData();
    } else {
      showNotification('error', "Credenciais inválidas ou erro de conexão.");
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rh_user');
    setCurrentView('dashboard');
  };

  const activeEmployee = useMemo(() => employees.find(e => e.id === selectedEmployeeId), [employees, selectedEmployeeId]);
  
  const filteredEmployees = useMemo(() => employees.filter(e => {
    const nameMatch = safeStr(e.name).toLowerCase().includes(searchTerm.toLowerCase());
    const cpfMatch = safeStr(e.cpf).includes(searchTerm);
    const matchesSearch = nameMatch || cpfMatch;
    const matchesStatus = statusFilter === 'Todos Status' || statusFilter === 'Todos' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [employees, searchTerm, statusFilter]);

  const navigateTo = (view: View, id?: string) => {
    if (id) setSelectedEmployeeId(id);
    setCurrentView(view);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-800">
        {notification && <Toast notification={notification} onClose={() => setNotification(null)} />}
        <div className="w-full max-w-md bg-white rounded-sm shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg text-white font-bold text-xl">G</div>
            <h1 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Gourmetto RH</h1>
            <p className="text-slate-400 text-[10px] uppercase font-medium mt-1">Gestão Operacional de Equipes</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <Input label="E-mail Corporativo" name="email" type="email" placeholder="usuario@gourmetto.com" icon={<Mail size={16}/>}/>
              <Input label="Senha de Acesso" name="password" type="password" placeholder="••••••••" icon={<Lock size={16}/>}/>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-md font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-3">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Acessar Terminal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      {notification && <Toast notification={notification} onClose={() => setNotification(null)} />}
      
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 sticky top-0 h-screen z-40 text-slate-300">
        <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-inner">G</div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-widest text-white uppercase">Gourmetto</span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">RH Operacional</span>
          </div>
        </div>
        <nav className="space-y-2 flex-1">
          <SidebarLink active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<LayoutDashboard size={18} />} label="Painel Geral" />
          <SidebarLink active={currentView === 'employees' || currentView === 'employee-detail'} onClick={() => navigateTo('employees')} icon={<Users size={18} />} label="Gestão de Equipe" />
          <SidebarLink active={currentView === 'new-employee' && !isEditing} onClick={() => navigateTo('new-employee')} icon={<UserPlus size={18} />} label="Admitir Novo" />
        </nav>
        <div className="mt-auto space-y-4 pt-6 border-t border-slate-800/50">
          <div className={`px-4 py-2.5 rounded-md border ${dbStatus === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} flex items-center gap-3 transition-colors`}>
            {dbStatus === 'online' ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> : <WifiOff size={14}/>}
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{dbStatus === 'online' ? 'Base Conectada' : 'Sem Conexão'}</span>
          </div>
          <div className="px-2">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">{currentUser.name.charAt(0)}</div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-white truncate">{currentUser.name}</span>
                  <span className="text-[8px] font-medium text-slate-500 uppercase">{currentUser.role}</span>
                </div>
             </div>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-md font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"><LogOut size={16}/><span>Encerrar Sessão</span></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full mb-20 lg:mb-0">
          {isLoading && (
            <div className="fixed inset-0 bg-slate-50/90 z-[100] flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Sincronizando Base</p>
              </div>
            </div>
          )}

          {currentView === 'dashboard' && <DashboardView employees={employees} events={events} onNavigate={navigateTo} />}
          
          {currentView === 'employees' && <EmployeeListView employees={filteredEmployees} searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onNavigate={navigateTo} />}
          
          {currentView === 'new-employee' && (
            <NewEmployeeView 
              isEditing={isEditing}
              initialData={isEditing ? activeEmployee : undefined}
              onCancel={() => navigateTo('employees')} 
              onSubmit={(emp: Employee) => {
                setIsLoading(true);
                if (isEditing && selectedEmployeeId) {
                  updateEmployee(selectedEmployeeId, emp).then((savedEmp) => {
                    setEmployees(prev => prev.map(e => e.id === selectedEmployeeId ? savedEmp : e));
                    navigateTo('employee-detail', selectedEmployeeId);
                    showNotification('success', "Cadastro atualizado com sucesso.");
                  }).catch(err => {
                    showNotification('error', err);
                  }).finally(() => setIsLoading(false));
                } else {
                  createEmployee(emp).then((savedEmp) => { 
                    setEmployees(prev => [...prev, savedEmp]); 
                    navigateTo('employees'); 
                    showNotification('success', "Funcionário registrado com sucesso.");
                  }).catch((err) => {
                    const msg = safeStr(err);
                    const isCache = msg.toLowerCase().includes('column') || msg.toLowerCase().includes('schema');
                    showNotification('error', msg, isCache);
                  }).finally(() => setIsLoading(false));
                }
              }} 
            />
          )}

          {currentView === 'employee-detail' && activeEmployee && (
            <EmployeeDetailView 
              employee={activeEmployee} 
              events={events.filter(ev => ev.employeeId === activeEmployee.id)}
              onAddEvent={async (ev: OperationalEvent) => {
                try {
                  const savedEv = await createEvent(ev);
                  setEvents(p => [savedEv, ...p]);
                  showNotification('success', "Evento operacional registrado.");
                } catch (e: any) {
                  showNotification('error', e);
                }
              }}
              onEditEmployee={() => {
                setIsEditing(true);
                setCurrentView('new-employee');
              }}
              onUpdateStatus={async (status: 'Ativo' | 'Afastado' | 'Desligado') => {
                try {
                  const saved = await updateEmployee(activeEmployee.id, { status });
                  setEmployees(p => p.map(e => e.id === activeEmployee.id ? saved : e));
                  showNotification('success', `Status alterado para ${status}`);
                } catch (e) {
                  showNotification('error', e);
                }
              }}
              onDeleteEmployee={(id: string) => { 
                if(window.confirm("Deseja realmente excluir este registro? Esta ação é irreversível.")) {
                  deleteEmployeeById(id).then(() => { 
                    setEmployees(p => p.filter(e => e.id !== id)); 
                    navigateTo('employees'); 
                    showNotification('success', "Colaborador removido da base.");
                  }).catch(e => showNotification('error', e));
                }
              }}
              onBack={() => navigateTo('employees')}
            />
          )}
        </div>
        
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
          <MobileNavLink active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<LayoutDashboard size={20}/>} label="Início" />
          <MobileNavLink active={currentView === 'employees'} onClick={() => navigateTo('employees')} icon={<Users size={20}/>} label="Equipe" />
          <MobileNavLink active={currentView === 'new-employee'} onClick={() => navigateTo('new-employee')} icon={<Plus size={20}/>} label="Novo" />
        </div>
      </main>
    </div>
  );
}

function MobileNavLink({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function Toast({ notification, onClose }: { notification: Notification, onClose: () => void }) {
  const { type, message, isCacheError } = notification;
  const [copied, setCopied] = useState(false);
  
  const sqlFix = `-- SCRIPT DE REPARO COMPLETO E IDEMPOTENTE
-- Execute no SQL Editor do Supabase para sincronizar o banco.

DO $$ 
BEGIN
    -- 1. Garante que as tabelas existem
    CREATE TABLE IF NOT EXISTS public.users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE IF NOT EXISTS public.employees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), codigo TEXT, "nrRecibo" TEXT, name TEXT NOT NULL, cpf TEXT UNIQUE NOT NULL, status TEXT DEFAULT 'Ativo', created_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE IF NOT EXISTS public.events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), "employeeId" UUID REFERENCES public.employees(id) ON DELETE CASCADE, type TEXT NOT NULL, date DATE DEFAULT CURRENT_DATE, description TEXT, created_at TIMESTAMPTZ DEFAULT now());

    -- 2. Adiciona colunas faltantes se necessário
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "admissionDate" DATE;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "fgtsOptant" BOOLEAN DEFAULT TRUE;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary NUMERIC DEFAULT 0;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "bankInfo" JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS relatives JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "pixKey" TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS role TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "fatherName" TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "motherName" TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "birthDate" DATE;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS gender TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS race TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS naturalness TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS nationality TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS neighborhood TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS rg TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "rgOrgao" TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS pis TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS ctps TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cbo TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS scale TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "modoPgto" TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "periodoPgto" TEXT;
    
    -- 3. Habilita RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

    -- 4. Cria Políticas (Garante que não falhe se já existirem)
    DROP POLICY IF EXISTS "Allow public read on users" ON public.users;
    CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow public all access on employees" ON public.employees;
    CREATE POLICY "Allow public all access on employees" ON public.employees FOR ALL USING (true);
    DROP POLICY IF EXISTS "Allow public all access on events" ON public.events;
    CREATE POLICY "Allow public all access on events" ON public.events FOR ALL USING (true);
END $$;

INSERT INTO public.users (name, email, password, role) VALUES ('Admin', 'admin@gourmetto.com', '123', 'Gerente') ON CONFLICT (email) DO NOTHING;
NOTIFY pgrst, 'reload schema';`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-6 max-w-lg w-full px-4">
      <div className={`p-5 rounded-lg shadow-2xl border backdrop-blur-md ${type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' : 'bg-red-50/95 border-red-200 text-red-900'}`}>
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {type === 'success' ? <CheckCircle2 size={20}/> : <AlertTriangle size={20}/>}
          </div>
          <div className="flex-1">
             <h4 className="text-[11px] font-black uppercase tracking-widest mb-1">{type === 'success' ? 'Sucesso' : 'Erro Detectado'}</h4>
             <p className="text-xs font-medium leading-relaxed opacity-90">{safeStr(message)}</p>
             {isCacheError && (
               <div className="mt-4 p-4 bg-white/50 rounded-md border border-red-100 space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-red-700 text-center">Inconsistência na Base de Dados</p>
                 <div className="relative group">
                    <code className="block text-[8px] bg-slate-900 text-slate-300 p-3 rounded font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {sqlFix}
                    </code>
                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
                      {copied ? <Check size={12}/> : <Copy size={12}/>}
                    </button>
                 </div>
                 <button onClick={handleCopy} className="w-full bg-red-600 text-white py-2.5 rounded font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 active:scale-[0.98] transition-all shadow-md">
                   {copied ? <Check size={14}/> : <Copy size={14}/>}
                   {copied ? "Copiar Script Corretivo" : "Copiar Script Corretivo"}
                 </button>
                 <p className="text-[8px] text-slate-400 italic text-center uppercase">Execute este script no SQL Editor do Supabase</p>
               </div>
             )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><Trash2 size={16}/></button>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-bold text-[10px] uppercase tracking-[0.15em] transition-all group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
      <span className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'} transition-colors`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Input({ label, icon, ...props }: any) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-0.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
        <input {...props} className={`w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 ${icon ? 'pl-11' : 'px-4'} pr-4 font-semibold text-slate-800 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300`} />
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange, name }: any) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-0.5">{label}</label>}
      <select name={name} value={value} onChange={(e) => onChange && onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all uppercase appearance-none cursor-pointer">
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function DashboardView({ employees, events, onNavigate }: any) {
  const activeCount = employees.filter((e: any) => e.status === 'Ativo').length;
  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Painel de Controle</h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Resumo Operacional Gourmetto</p>
        </div>
        <button onClick={() => onNavigate('new-employee')} className="bg-blue-600 text-white px-6 py-3 rounded-md font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={16}/> Admitir Colaborador</button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Colaboradores Ativos" value={activeCount} icon={<Users size={20} className="text-blue-600"/>} trend="+2 este mês" />
        <StatCard label="Ocorrências Registradas" value={events.length} icon={<AlertCircle size={20} className="text-orange-500"/>} trend="Ações pendentes" />
        <StatCard label="Fichas Inativas" value={employees.length - activeCount} icon={<Calendar size={20} className="text-slate-400"/>} trend="Histórico" />
        <StatCard label="Total em Base" value={employees.length} icon={<FileText size={20} className="text-emerald-500"/>} trend="Dossiês Digitais" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Últimas Ocorrências</h3>
            <button onClick={() => onNavigate('employees')} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Ver Todos</button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {recentEvents.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Clock size={32} className="text-slate-200 mb-3" />
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhuma ocorrência recente</p>
               </div>
            ) : (
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {recentEvents.map((ev: any) => {
                    const emp = employees.find((e: any) => e.id === ev.employeeId);
                    return (
                      <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <EventIcon type={ev.type} />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{emp?.name || 'Funcionário Removido'}</p>
                              <p className="text-[9px] font-medium text-slate-500 uppercase">{ev.type} • {ev.date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-[200px]">{ev.description}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => onNavigate('employee-detail', ev.employeeId)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors"><ChevronRight size={16}/></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-6">Ações Rápidas</h3>
          <div className="space-y-3">
             <QuickActionBtn onClick={() => onNavigate('new-employee')} icon={<UserPlus size={18}/>} label="Admitir Colaborador" color="blue" />
             <QuickActionBtn onClick={() => onNavigate('employees')} icon={<Search size={18}/>} label="Pesquisar Ficha" color="slate" />
             <QuickActionBtn onClick={() => window.print()} icon={<FileText size={18}/>} label="Imprimir Tela Atual" color="emerald" />
          </div>
          <div className="mt-auto pt-6 border-t border-slate-100">
             <div className="p-4 bg-slate-50 rounded-md">
                <div className="flex items-center gap-3 mb-2">
                   <AlertCircle size={14} className="text-blue-600" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Aviso do Sistema</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Mantenha os dados atualizados para garantir a conformidade com as normas operacionais.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ onClick, icon, label, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    slate: 'bg-slate-50 text-slate-600 hover:bg-slate-100'
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] ${colors[color]}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function EventIcon({ type }: { type: string }) {
  const configs: any = {
    'Falta': { icon: <AlertCircle size={14}/>, color: 'bg-red-100 text-red-600' },
    'Atraso': { icon: <Clock size={14}/>, color: 'bg-orange-100 text-orange-600' },
    'Advertência': { icon: <AlertTriangle size={14}/>, color: 'bg-red-100 text-red-600' },
    'Elogio': { icon: <CheckCircle2 size={14}/>, color: 'bg-emerald-100 text-emerald-600' }
  };
  const config = configs[type] || configs['Falta'];
  return <div className={`p-2 rounded-full ${config.color}`}>{config.icon}</div>;
}

function StatCard({ label, value, icon, trend }: any) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-400">{trend}</span>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 mb-1">{safeStr(value)}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      </div>
    </div>
  );
}

function EmployeeListView({ employees, searchTerm, setSearchTerm, statusFilter, setStatusFilter, onNavigate }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Base de Colaboradores</h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Lista completa de pessoal</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16}/>
            <input 
              type="text" 
              placeholder="Pesquisar por Nome ou CPF..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="bg-white border border-slate-200 rounded-md pl-12 pr-4 py-2.5 text-sm font-semibold outline-none w-full sm:w-80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all" 
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="bg-white border border-slate-200 rounded-md px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none pr-10 min-w-[140px]"
            >
              <option>Todos Status</option>
              <option>Ativo</option>
              <option>Afastado</option>
              <option>Desligado</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </header>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">ID Operacional</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Cargo e Função</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status Atual</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center justify-center opacity-30">
                          <Users size={48} className="mb-4" />
                          <p className="text-xs font-black uppercase tracking-[0.2em]">Nenhum registro encontrado</p>
                       </div>
                    </td>
                 </tr>
              ) : employees.map((emp: any) => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-blue-50/30 cursor-pointer group transition-all" 
                  onClick={() => onNavigate('employee-detail', emp.id)}
                >
                  <td className="px-6 py-5 text-[11px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                    #{safeStr(emp.codigo || 'S/C')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {safeStr(emp.name).charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{safeStr(emp.name)}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">CPF: {safeStr(emp.cpf)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{safeStr(emp.role || 'Não definido')}</p>
                    <p className="text-[9px] font-medium text-slate-400 uppercase">{safeStr(emp.cbo || 'CBO S/I')}</p>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: any) {
  const styles: any = { 
    Ativo: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
    Afastado: 'bg-orange-100 text-orange-700 border-orange-200', 
    Desligado: 'bg-slate-100 text-slate-600 border-slate-200' 
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${styles[status] || styles['Desligado']}`}>
      {safeStr(status)}
    </span>
  );
}

function NewEmployeeView({ onSubmit, onCancel, isEditing, initialData }: any) {
  const [formData, setFormData] = useState<any>(initialData || {
    status: 'Ativo',
    admissionDate: new Date().toISOString().split('T')[0],
    bankInfo: { bank: '', account: '', digit: '', agency: '' },
    relatives: [],
    gender: 'Feminino',
    maritalStatus: 'Solteiro',
    race: 'Branca',
    fgtsOptant: true,
    salary: 0,
    pixKey: '',
    codigo: '',
    nrRecibo: '',
    modoPgto: 'PIX',
    periodoPgto: 'Mensal'
  });
  
  const [newRelative, setNewRelative] = useState<Relative>({ name: '', birthDate: '', parentage: '' });
  
  const addRelative = () => { 
    if (newRelative.name && newRelative.birthDate) { 
      setFormData({ ...formData, relatives: [...(formData.relatives || []), newRelative] }); 
      setNewRelative({ name: '', birthDate: '', parentage: '' }); 
    } 
  };
  
  const updateBank = (field: string, val: string) => { 
    setFormData({ ...formData, bankInfo: { ...(formData.bankInfo || {}), [field]: val } }); 
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"><ArrowLeft size={20}/></button>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{isEditing ? 'Editar Cadastro' : 'Nova Admissão'}</h2>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{isEditing ? 'Atualize as informações do dossiê' : 'Preencha o dossiê cadastral'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
           <AlertCircle size={14} className="text-blue-600" />
           <span className="text-[9px] font-bold text-blue-700 uppercase tracking-widest">Dados seguros em conformidade operacional</span>
        </div>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit({...formData}); }} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-12 text-slate-800">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><UserIcon size={20}/></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Informações Pessoais</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2"><Input label="Nome Completo" required value={formData.name || ''} onChange={(e:any) => setFormData({...formData, name: e.target.value})} /></div>
              <Input label="ID Operacional" value={formData.codigo || ''} onChange={(e:any) => setFormData({...formData, codigo: e.target.value})} />
              <Input label="Número do Recibo" value={formData.nrRecibo || ''} onChange={(e:any) => setFormData({...formData, nrRecibo: e.target.value})} />
              
              <div className="md:col-span-2"><Input label="Pai" value={formData.fatherName || ''} onChange={(e:any) => setFormData({...formData, fatherName: e.target.value})} /></div>
              <div className="md:col-span-2"><Input label="Mãe" value={formData.motherName || ''} onChange={(e:any) => setFormData({...formData, motherName: e.target.value})} /></div>
              
              <Input label="Nascimento" type="date" value={formData.birthDate || ''} onChange={(e:any) => setFormData({...formData, birthDate: e.target.value})} />
              <Select label="Sexo" value={formData.gender} options={['Feminino', 'Masculino', 'Outro']} onChange={(v:any) => setFormData({...formData, gender: v})} />
              <Select label="Estado Civil" value={formData.maritalStatus} options={['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']} onChange={(v:any) => setFormData({...formData, maritalStatus: v})} />
              <Select label="Etnia" value={formData.race} options={['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena']} onChange={(v:any) => setFormData({...formData, race: v})} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><Globe size={20}/></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identidade e Endereço</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2"><Input label="Endereço Completo" value={formData.address || ''} onChange={(e:any) => setFormData({...formData, address: e.target.value})} /></div>
              <Input label="Bairro" value={formData.neighborhood || ''} onChange={(e:any) => setFormData({...formData, neighborhood: e.target.value})} />
              <Input label="CEP" value={formData.zipCode || ''} onChange={(e:any) => setFormData({...formData, zipCode: e.target.value})} />
              
              <Input label="CPF" required value={formData.cpf || ''} onChange={(e:any) => setFormData({...formData, cpf: e.target.value})} />
              <Input label="RG" value={formData.rg || ''} onChange={(e:any) => setFormData({...formData, rg: e.target.value})} />
              <Input label="CTPS" value={formData.ctps || ''} onChange={(e:any) => setFormData({...formData, ctps: e.target.value})} />
              <Input label="PIS" value={formData.pis || ''} onChange={(e:any) => setFormData({...formData, pis: e.target.value})} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center"><CreditCard size={20}/></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pagamento</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Input label="Banco" value={formData.bankInfo?.bank || ''} onChange={(e:any) => updateBank('bank', e.target.value)} />
              <Input label="Agência" value={formData.bankInfo?.agency || ''} onChange={(e:any) => updateBank('agency', e.target.value)} />
              <Input label="Conta" value={formData.bankInfo?.account || ''} onChange={(e:any) => updateBank('account', e.target.value)} />
              <Input label="Dígito" value={formData.bankInfo?.digit || ''} onChange={(e:any) => updateBank('digit', e.target.value)} />
              
              <div className="md:col-span-2"><Input label="Chave PIX" value={formData.pixKey || ''} onChange={(e:any) => setFormData({...formData, pixKey: e.target.value})} /></div>
              <Select label="Modo" value={formData.modoPgto} options={['Dinheiro', 'Depósito', 'PIX']} onChange={(v:any) => setFormData({...formData, modoPgto: v})} />
              <Select label="Ciclo" value={formData.periodoPgto} options={['Mensal', 'Quinzenal', 'Semanal', 'Diário']} onChange={(v:any) => setFormData({...formData, periodoPgto: v})} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Briefcase size={20}/></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Vínculo Contratual</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Input label="Admissão" type="date" value={formData.admissionDate || ''} onChange={(e:any) => setFormData({...formData, admissionDate: e.target.value})} />
              <div className="md:col-span-2"><Input label="Cargo" value={formData.role || ''} onChange={(e:any) => setFormData({...formData, role: e.target.value})} /></div>
              <Input label="CBO" value={formData.cbo || ''} onChange={(e:any) => setFormData({...formData, cbo: e.target.value})} />
              
              <Input label="Salário Base (R$)" type="number" step="0.01" value={formData.salary || 0} onChange={(e:any) => setFormData({...formData, salary: parseFloat(e.target.value)})} />
              <Input label="Escala" value={formData.scale || ''} onChange={(e:any) => setFormData({...formData, scale: e.target.value})} />
              <div className="flex items-center gap-2 pt-6">
                <input 
                  type="checkbox" 
                  id="fgts" 
                  checked={formData.fgtsOptant} 
                  onChange={(e) => setFormData({...formData, fgtsOptant: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" 
                />
                <label htmlFor="fgts" className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Optante FGTS</label>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><Heart size={20}/></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Ficha Familiar</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-6 rounded-lg border border-slate-100">
                <Input label="Nome" value={newRelative.name} onChange={(e:any) => setNewRelative({...newRelative, name: e.target.value})} />
                <Input label="Nascimento" type="date" value={newRelative.birthDate} onChange={(e:any) => setNewRelative({...newRelative, birthDate: e.target.value})} />
                <Select label="Parentesco" value={newRelative.parentage} options={['Filho(a)', 'Cônjuge', 'Pai/Mãe', 'Outro']} onChange={(v:any) => setNewRelative({...newRelative, parentage: v})} />
                <button type="button" onClick={addRelative} className="bg-white border border-slate-200 py-2.5 rounded-md font-black text-[9px] uppercase tracking-widest shadow-sm">Adicionar</button>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-lg p-4">
                {(!formData.relatives || formData.relatives.length === 0) ? (
                  <p className="text-[9px] text-slate-400 text-center uppercase py-8 tracking-widest font-black">Sem dependentes</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.relatives.map((rel: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-md">
                        <div>
                          <p className="text-[11px] font-black text-slate-800 uppercase">{rel.name}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">{rel.parentage} • {rel.birthDate}</p>
                        </div>
                        <button type="button" onClick={() => setFormData({...formData, relatives: formData.relatives.filter((_:any, i:number) => i !== idx)})} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-10">
          <button type="button" onClick={onCancel} className="flex-1 bg-white border border-slate-200 py-4 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
          <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all">
            {isEditing ? 'Salvar Alterações' : 'Finalizar Admissão'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EmployeeDetailView({ employee, events, onAddEvent, onDeleteEmployee, onBack, onEditEmployee, onUpdateStatus }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'relatives'>('info');
  const [showEventModal, setShowEventModal] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm"><ArrowLeft size={20}/></button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">
              {safeStr(employee.name).charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{safeStr(employee.name)}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{safeStr(employee.codigo)}</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <StatusBadge status={employee.status} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              value={employee.status} 
              onChange={(e) => onUpdateStatus(e.target.value)} 
              className="px-4 py-3 bg-white border border-slate-200 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-sm appearance-none pr-10"
            >
              <option value="Ativo">Ativo</option>
              <option value="Afastado">Afastado</option>
              <option value="Desligado">Desligado</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14} />
          </div>
          <button onClick={onEditEmployee} className="p-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md">
            <Edit2 size={18}/>
          </button>
          <button onClick={() => onDeleteEmployee(employee.id)} className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-all">
            <Trash2 size={18}/>
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        <nav className="lg:w-64 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 space-y-2">
          <DetailTabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Ficha Cadastral" icon={<FileText size={18}/>} />
          <DetailTabButton active={activeTab === 'relatives'} onClick={() => setActiveTab('relatives')} label="Vínculo Familiar" icon={<Heart size={18}/>} />
          <DetailTabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Ocorrências" icon={<Clock size={18}/>} />
          <div className="pt-8 px-2">
             <button 
              onClick={() => setShowEventModal(true)} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md"
             >
               <Plus size={14}/> Nova Ocorrência
             </button>
          </div>
        </nav>
        
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[700px]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-500">
              <InfoSection title="Informações Pessoais" items={[
                {label: "Pai", value: safeStr(employee.fatherName)}, 
                {label: "Mãe", value: safeStr(employee.motherName)}, 
                {label: "Nascimento", value: safeStr(employee.birthDate)}, 
                {label: "Estado Civil", value: safeStr(employee.maritalStatus)},
                {label: "Etnia", value: safeStr(employee.race)}
              ]} />
              <InfoSection title="Identidade Civil" items={[
                {label: "CPF", value: safeStr(employee.cpf)}, 
                {label: "RG", value: safeStr(employee.rg)}, 
                {label: "PIS", value: safeStr(employee.pis)}, 
                {label: "CTPS", value: safeStr(employee.ctps)}
              ]} />
              <InfoSection title="Dados Financeiros" items={[
                {label: "Banco", value: safeStr(employee.bankInfo?.bank)}, 
                {label: "Agência/Conta", value: `${safeStr(employee.bankInfo?.agency)} / ${safeStr(employee.bankInfo?.account)}-${safeStr(employee.bankInfo?.digit)}`}, 
                {label: "Chave PIX", value: safeStr(employee.pixKey)},
                {label: "Pagamento", value: safeStr(employee.modoPgto)}
              ]} />
              <InfoSection title="Vínculo Profissional" items={[
                {label: "Cargo", value: safeStr(employee.role)}, 
                {label: "Admissão", value: safeStr(employee.admissionDate)}, 
                {label: "Salário", value: formatBRL(employee.salary)}, 
                {label: "Escala", value: safeStr(employee.scale)}
              ]} />
            </div>
          )}
          
          {activeTab === 'relatives' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(employee.relatives || []).map((rel: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Heart size={18} fill="currentColor" /></div>
                    <div>
                      <p className="text-[11px] font-black uppercase text-slate-900 mb-1">{rel.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{rel.parentage} • {rel.birthDate}</p>
                    </div>
                  </div>
                ))}
                {(!employee.relatives || employee.relatives.length === 0) && (
                  <div className="md:col-span-2 text-center py-20 opacity-30"><Heart size={48} className="mx-auto mb-4" /><p className="text-xs font-black uppercase tracking-[0.2em]">Sem familiares vinculados</p></div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              {events.map((ev: any) => (
                <div key={ev.id} className="p-4 border border-slate-100 bg-white rounded-lg shadow-sm flex gap-5">
                  <div className="shrink-0"><EventIcon type={ev.type} /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{ev.type}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{ev.date}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{ev.description}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-20 opacity-30"><Clock size={48} className="mx-auto mb-4" /><p className="text-xs font-black uppercase tracking-[0.2em]">Sem ocorrências</p></div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
             <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3"><AlertCircle className="text-blue-600" size={24}/> Nova Ocorrência</h3>
             <form onSubmit={(e: any) => {
               e.preventDefault();
               const formData = new FormData(e.target);
               onAddEvent({
                 employeeId: employee.id,
                 type: formData.get('type') as any,
                 date: formData.get('date') as string,
                 description: formData.get('description') as string
               });
               setShowEventModal(false);
             }} className="space-y-5">
                <Select label="Tipo" name="type" options={['Falta', 'Atraso', 'Advertência', 'Elogio']} />
                <Input label="Data" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-0.5">Descrição</label>
                   <textarea name="description" required rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-semibold outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 py-3 font-black uppercase text-[10px] tracking-widest text-slate-500">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-blue-600 text-white py-3 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg">Gravar</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailTabButton({ active, onClick, label, icon }: any) { 
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>
      <span className={active ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
    </button>
  ); 
}

function InfoSection({ title, items }: any) { 
  return (
    <div>
      <h4 className="text-[10px] font-black text-blue-600 uppercase mb-6 tracking-widest border-b border-blue-100 pb-2">{title}</h4>
      <div className="grid grid-cols-1 gap-5">
        {items.map((i: any, idx: number) => (
          <div key={idx}>
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{i.label}</p>
            <p className="text-xs font-bold text-slate-800">{i.value || '---'}</p>
          </div>
        ))}
      </div>
    </div>
  ); 
}
