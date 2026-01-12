
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

const safeStr = (val: any) => (val === null || val === undefined) ? '' : String(val);

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

  const showNotification = (type: 'success' | 'error', message: string, isCacheError = false) => {
    setNotification({ type, message, isCacheError });
    if (!isCacheError) setTimeout(() => setNotification(null), 4000);
  };

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [empData, eventData] = await Promise.all([fetchEmployees(), fetchEvents()]);
      setEmployees(empData);
      setEvents(eventData);
    } catch (err: any) {
      const isCache = err.message?.includes('column') || err.message?.includes('schema');
      showNotification('error', "Erro de sincronização: " + err.message, isCache);
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
      showNotification('error', "Credenciais inválidas.");
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rh_user');
    setCurrentView('dashboard');
  };

  const activeEmployee = useMemo(() => employees.find(e => e.id === selectedEmployeeId), [employees, selectedEmployeeId]);
  const filteredEmployees = employees.filter(e => {
    const nameMatch = safeStr(e.name).toLowerCase().includes(searchTerm.toLowerCase());
    const cpfMatch = safeStr(e.cpf).includes(searchTerm);
    const matchesSearch = nameMatch || cpfMatch;
    const matchesStatus = statusFilter === 'Todos' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const navigateTo = (view: View, id?: string) => {
    if (id) setSelectedEmployeeId(id);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-800">
        {notification && <Toast notification={notification} onClose={() => setNotification(null)} />}
        <div className="w-full max-w-md bg-white rounded-sm shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-center">
            <div className="w-10 h-10 bg-blue-600 rounded-sm flex items-center justify-center mx-auto mb-4 shadow-lg text-white font-bold text-lg">G</div>
            <h1 className="text-lg font-bold text-white uppercase tracking-widest">Gourmetto RH</h1>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input label="E-mail" name="email" type="email" placeholder="usuario@gourmetto.com" icon={<Mail size={16}/>}/>
              <Input label="Senha" name="password" type="password" placeholder="••••••••" icon={<Lock size={16}/>}/>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-sm font-bold uppercase tracking-widest text-[10px] shadow transition-all flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Acessar Painel'}
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
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-white">G</div>
          <span className="text-base font-bold tracking-tight text-white uppercase">Gourmetto</span>
        </div>
        <nav className="space-y-1 flex-1">
          <SidebarLink active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<LayoutDashboard size={18} />} label="Início" />
          <SidebarLink active={currentView === 'employees' || currentView === 'employee-detail'} onClick={() => navigateTo('employees')} icon={<Users size={18} />} label="Equipe" />
          <SidebarLink active={currentView === 'new-employee'} onClick={() => navigateTo('new-employee')} icon={<UserPlus size={18} />} label="Nova Ficha" />
        </nav>
        <div className="mt-auto space-y-4">
          <div className={`px-4 py-2 rounded-sm border ${dbStatus === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} flex items-center gap-3`}>
            {dbStatus === 'online' ? <Wifi size={14}/> : <WifiOff size={14}/>}
            <span className="text-[9px] font-bold uppercase tracking-widest">{dbStatus === 'online' ? 'DB Conectado' : 'Erro de Cache'}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-bold text-[10px] uppercase text-slate-500 hover:text-white transition-all"><LogOut size={16}/><span>Sair</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full">
          {isLoading && (
            <div className="fixed inset-0 bg-slate-50/80 z-[100] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-600 mb-4 mx-auto" size={32} />
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Sincronizando...</p>
              </div>
            </div>
          )}
          {currentView === 'dashboard' && <DashboardView employees={employees} events={events} onNavigate={navigateTo} />}
          {currentView === 'employees' && <EmployeeListView employees={filteredEmployees} searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onNavigate={navigateTo} />}
          {currentView === 'new-employee' && <NewEmployeeView onCancel={() => navigateTo('employees')} onSubmit={(emp: Employee) => {
            setIsLoading(true);
            createEmployee(emp).then((savedEmp) => { 
              setEmployees(prev => [...prev, savedEmp]); 
              navigateTo('employees'); 
              showNotification('success', "Funcionário registrado.");
            }).catch((err) => {
              const isCache = err.message?.includes('column') || err.message?.includes('schema');
              showNotification('error', err.message, isCache);
              console.error(err);
            }).finally(() => setIsLoading(false));
          }} />}
          {currentView === 'employee-detail' && activeEmployee && (
            <EmployeeDetailView 
              employee={activeEmployee} 
              events={events.filter(ev => ev.employeeId === activeEmployee.id)}
              onAddEvent={async (ev: OperationalEvent) => {
                try {
                  const savedEv = await createEvent(ev);
                  setEvents(p => [savedEv, ...p]);
                  showNotification('success', "Evento registrado.");
                } catch (e: any) {
                  showNotification('error', "Erro no registro: " + e.message);
                }
              }}
              onUpdateEmployee={(id: string, updates: Partial<Employee>) => updateEmployee(id, updates).then((savedEmp) => {
                setEmployees(p => p.map(e => e.id === id ? savedEmp : e));
                showNotification('success', "Dados atualizados.");
              }).catch(e => showNotification('error', e.message))}
              onDeleteEmployee={(id: string) => { 
                deleteEmployeeById(id).then(() => { 
                  setEmployees(p => p.filter(e => e.id !== id)); 
                  navigateTo('employees'); 
                  showNotification('success', "Registro excluído.");
                }).catch(e => showNotification('error', e.message));
              }}
              onBack={() => navigateTo('employees')}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Toast({ notification, onClose }: { notification: Notification, onClose: () => void }) {
  const { type, message, isCacheError } = notification;
  const [copied, setCopied] = useState(false);
  
  // Expanded SQL Fix to cover fgtsOptant and all other likely missing columns
  const sqlFix = `-- SCRIPT DE REPARO COMPLETO\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS codigo TEXT;\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "nrRecibo" TEXT;\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "admissionDate" DATE;\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "fgtsOptant" BOOLEAN DEFAULT TRUE;\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary NUMERIC DEFAULT 0;\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS "bankInfo" JSONB DEFAULT '{}'::jsonb;\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS relatives JSONB DEFAULT '[]'::jsonb;\nNOTIFY pgrst, 'reload schema';`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 max-w-md w-full px-4">
      <div className={`p-4 rounded-sm shadow-2xl border ${type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
        <div className="flex items-start gap-3">
          {type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0"/> : <AlertTriangle size={18} className="mt-0.5 shrink-0"/>}
          <div className="flex-1">
             <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">{safeStr(message)}</p>
             {isCacheError && (
               <div className="mt-4 p-3 bg-red-900/10 rounded-sm space-y-3">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-red-700">Correção necessária no Supabase:</p>
                 <code className="block text-[8px] bg-white/50 p-2 border border-red-200 text-red-900 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                   {sqlFix}
                 </code>
                 <button onClick={handleCopy} className="w-full bg-red-600 text-white py-2 rounded-sm font-bold text-[9px] uppercase flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg">
                   {copied ? <Check size={14}/> : <Copy size={14}/>}
                   {copied ? "Copiado!" : "Copiar Script Completo"}
                 </button>
               </div>
             )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full"><Trash2 size={14}/></button>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: any) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{icon}<span>{label}</span></button>;
}
function Input({ label, icon, ...props }: any) {
  return (
    <div className="space-y-1">
      {label && <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-0.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input {...props} className={`w-full bg-white border border-slate-200 rounded-sm py-2 ${icon ? 'pl-9' : 'px-3'} pr-4 font-semibold text-slate-800 text-sm outline-none focus:border-blue-500 transition-colors`} />
      </div>
    </div>
  );
}
function Select({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-1">
      {label && <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-0.5">{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-sm py-2 px-3 text-sm font-semibold outline-none focus:border-blue-500 uppercase transition-colors">
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
function DashboardView({ employees, events, onNavigate }: any) {
  const activeCount = employees.filter((e: any) => e.status === 'Ativo').length;
  return (
    <div className="space-y-8 animate-in fade-in text-slate-800">
      <header className="flex justify-between items-end">
        <div><h2 className="text-xl font-bold uppercase">Painel de Controle</h2><p className="text-slate-500 text-xs uppercase">Gestão Operacional</p></div>
        <button onClick={() => onNavigate('new-employee')} className="bg-blue-600 text-white px-4 py-2 rounded-sm font-bold uppercase text-[10px] shadow flex items-center gap-2 hover:bg-blue-700 transition-colors"><Plus size={14}/> Nova Ficha</button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ativos" value={activeCount} icon={<Users size={16} className="text-blue-600"/>} />
        <StatCard label="Eventos" value={events.length} icon={<AlertCircle size={16} className="text-orange-500"/>} />
        <StatCard label="Inativos" value={employees.length - activeCount} icon={<Calendar size={16} className="text-slate-400"/>} />
        <StatCard label="Dossiês" value={employees.length} icon={<FileText size={16} className="text-emerald-500"/>} />
      </div>
    </div>
  );
}
function StatCard({ label, value, icon }: any) {
  return <div className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center justify-between mb-1"><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>{icon}</div><p className="text-lg font-bold">{safeStr(value)}</p></div>;
}
function EmployeeListView({ employees, searchTerm, setSearchTerm, statusFilter, setStatusFilter, onNavigate }: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <h2 className="text-xl font-bold uppercase">Quadro de Funcionários</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
            <input type="text" placeholder="Nome ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-slate-200 rounded-sm pl-9 pr-3 py-1.5 text-sm font-semibold outline-none w-64 focus:border-blue-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase outline-none focus:border-blue-500">
            <option>Todos</option><option>Ativo</option><option>Afastado</option><option>Desligado</option>
          </select>
        </div>
      </header>
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase">Cód.</th>
              <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase">Cargo</th>
              <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
               <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] uppercase font-bold text-slate-300 tracking-widest">Nenhum registro encontrado</td></tr>
            ) : employees.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-slate-50 cursor-pointer group transition-colors" onClick={() => onNavigate('employee-detail', emp.id)}>
                <td className="px-6 py-3 text-[11px] font-bold text-slate-400">{safeStr(emp.codigo || '---')}</td>
                <td className="px-6 py-3"><p className="font-bold text-[11px]">{safeStr(emp.name)}</p><p className="text-[9px] text-slate-400 uppercase">CPF: {safeStr(emp.cpf)}</p></td>
                <td className="px-6 py-3 text-[9px] font-bold uppercase">{safeStr(emp.role)}</td>
                <td className="px-6 py-3"><StatusBadge status={emp.status} /></td>
                <td className="px-6 py-3 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto group-hover:text-blue-500 transition-colors"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function StatusBadge({ status }: any) {
  const styles: any = { Ativo: 'text-emerald-600', Afastado: 'text-orange-600', Desligado: 'text-red-600' };
  return <span className={`font-black uppercase tracking-widest ${styles[status]}`}>• {safeStr(status)}</span>;
}
function NewEmployeeView({ onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState<any>({
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
    nrRecibo: ''
  });
  const [newRelative, setNewRelative] = useState<Relative>({ name: '', birthDate: '', parentage: '' });
  const addRelative = () => { if (newRelative.name) { setFormData({ ...formData, relatives: [...formData.relatives, newRelative] }); setNewRelative({ name: '', birthDate: '', parentage: '' }); } };
  const updateBank = (field: string, val: string) => { setFormData({ ...formData, bankInfo: { ...formData.bankInfo, [field]: val } }); };
  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in slide-in-from-bottom-2">
      <header className="flex items-center gap-4 mb-8"><button onClick={onCancel} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={18}/></button><h2 className="text-xl font-bold uppercase">Registro de Novo Colaborador</h2></header>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({...formData}); }} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm space-y-12 text-slate-800">
          <section>
            <h3 className="text-[10px] font-bold text-blue-600 uppercase mb-6 border-b pb-2 flex items-center gap-2"><UserIcon size={14}/> Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2"><Input label="Nome Completo" required value={formData.name || ''} onChange={(e:any) => setFormData({...formData, name: e.target.value})} /></div>
              <Input label="Código" value={formData.codigo || ''} onChange={(e:any) => setFormData({...formData, codigo: e.target.value})} />
              <Input label="Nº Recibo" value={formData.nrRecibo || ''} onChange={(e:any) => setFormData({...formData, nrRecibo: e.target.value})} />
              <Input label="Pai" value={formData.fatherName || ''} onChange={(e:any) => setFormData({...formData, fatherName: e.target.value})} />
              <Input label="Mãe" value={formData.motherName || ''} onChange={(e:any) => setFormData({...formData, motherName: e.target.value})} />
              <Input label="Nascimento" type="date" value={formData.birthDate || ''} onChange={(e:any) => setFormData({...formData, birthDate: e.target.value})} />
              <Select label="Sexo" value={formData.gender} options={['Feminino', 'Masculino']} onChange={(v:any) => setFormData({...formData, gender: v})} />
              <Select label="Est. Civil" value={formData.maritalStatus} options={['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']} onChange={(v:any) => setFormData({...formData, maritalStatus: v})} />
              <Select label="Raça/Cor" value={formData.race} options={['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena']} onChange={(v:any) => setFormData({...formData, race: v})} />
              <Input label="Naturalidade" value={formData.naturalness || ''} onChange={(e:any) => setFormData({...formData, naturalness: e.target.value})} />
              <Input label="Nacionalidade" value={formData.nationality || 'Brasileiro'} onChange={(e:any) => setFormData({...formData, nationality: e.target.value})} />
            </div>
          </section>
          <section>
            <h3 className="text-[10px] font-bold text-blue-600 uppercase mb-6 border-b pb-2 flex items-center gap-2"><Globe size={14}/> Localização e Documentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2"><Input label="Endereço" value={formData.address || ''} onChange={(e:any) => setFormData({...formData, address: e.target.value})} /></div>
              <Input label="Bairro" value={formData.neighborhood || ''} onChange={(e:any) => setFormData({...formData, neighborhood: e.target.value})} />
              <Input label="CEP" value={formData.zipCode || ''} onChange={(e:any) => setFormData({...formData, zipCode: e.target.value})} />
              <Input label="CPF" required value={formData.cpf || ''} onChange={(e:any) => setFormData({...formData, cpf: e.target.value})} />
              <Input label="RG" value={formData.rg || ''} onChange={(e:any) => setFormData({...formData, rg: e.target.value})} />
              <Input label="CTPS" value={formData.ctps || ''} onChange={(e:any) => setFormData({...formData, ctps: e.target.value})} />
              <Input label="PIS" value={formData.pis || ''} onChange={(e:any) => setFormData({...formData, pis: e.target.value})} />
            </div>
          </section>
          <section>
            <h3 className="text-[10px] font-bold text-blue-600 uppercase mb-6 border-b pb-2 flex items-center gap-2"><CreditCard size={14}/> Dados Bancários e Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Banco" value={formData.bankInfo?.bank || ''} onChange={(e:any) => updateBank('bank', e.target.value)} />
              <Input label="Agência" value={formData.bankInfo?.agency || ''} onChange={(e:any) => updateBank('agency', e.target.value)} />
              <Input label="Conta" value={formData.bankInfo?.account || ''} onChange={(e:any) => updateBank('account', e.target.value)} />
              <Input label="Dígito" value={formData.bankInfo?.digit || ''} onChange={(e:any) => updateBank('digit', e.target.value)} />
              <div className="md:col-span-2"><Input label="Chave PIX" value={formData.pixKey || ''} onChange={(e:any) => setFormData({...formData, pixKey: e.target.value})} /></div>
              <Select label="Modo de Pgto" value={formData.modoPgto} options={['Dinheiro', 'Depósito', 'PIX']} onChange={(v:any) => setFormData({...formData, modoPgto: v})} />
              <Select label="Período" value={formData.periodoPgto} options={['Mensal', 'Quinzenal', 'Semanal', 'Diário']} onChange={(v:any) => setFormData({...formData, periodoPgto: v})} />
            </div>
          </section>
          <section>
            <h3 className="text-[10px] font-bold text-blue-600 uppercase mb-6 border-b pb-2 flex items-center gap-2"><Briefcase size={14}/> Contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Admissão" type="date" value={formData.admissionDate || ''} onChange={(e:any) => setFormData({...formData, admissionDate: e.target.value})} />
              <div className="md:col-span-2"><Input label="Cargo" value={formData.role || ''} onChange={(e:any) => setFormData({...formData, role: e.target.value})} /></div>
              <Input label="CBO" value={formData.cbo || ''} onChange={(e:any) => setFormData({...formData, cbo: e.target.value})} />
              <Input label="Salário Base" type="number" step="0.01" value={formData.salary || 0} onChange={(e:any) => setFormData({...formData, salary: parseFloat(e.target.value)})} />
              <Input label="Escala" value={formData.scale || ''} placeholder="09:00 as 17:20" onChange={(e:any) => setFormData({...formData, scale: e.target.value})} />
            </div>
          </section>
          <section>
            <h3 className="text-[10px] font-bold text-blue-600 uppercase mb-6 border-b pb-2 flex items-center gap-2"><Heart size={14}/> Ficha Familiar</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <Input label="Nome Dependente" value={newRelative.name} onChange={(e:any) => setNewRelative({...newRelative, name: e.target.value})} />
                <Input label="Nascimento" type="date" value={newRelative.birthDate} onChange={(e:any) => setNewRelative({...newRelative, birthDate: e.target.value})} />
                <Input label="Parentesco" value={newRelative.parentage} onChange={(e:any) => setNewRelative({...newRelative, parentage: e.target.value})} />
                <button type="button" onClick={addRelative} className="bg-slate-100 hover:bg-slate-200 py-2 rounded-sm font-bold text-[9px] uppercase transition-colors">Adicionar Familiar</button>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-3">
                {formData.relatives.length === 0 ? <p className="text-[9px] text-slate-400 text-center uppercase">Nenhum familiar listado</p> : (
                  <ul className="divide-y divide-slate-200">
                    {formData.relatives.map((rel: any, idx: number) => (
                      <li key={idx} className="py-2 text-[11px] font-bold flex justify-between group">
                        <span>{rel.name} ({rel.parentage})</span>
                        <div className="flex items-center gap-3"><span className="text-slate-400">{rel.birthDate}</span><button type="button" onClick={() => setFormData({...formData, relatives: formData.relatives.filter((_:any, i:number) => i !== idx)})} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button></div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
        <div className="flex gap-4 pt-10"><button type="button" onClick={onCancel} className="flex-1 bg-white border border-slate-200 py-3 rounded-sm font-bold uppercase text-[10px] hover:bg-slate-50 transition-colors">Descartar</button><button type="submit" className="flex-[2] bg-blue-600 text-white py-3 rounded-sm font-bold uppercase text-[10px] shadow hover:bg-blue-700 transition-colors">Finalizar Registro</button></div>
      </form>
    </div>
  );
}
function EmployeeDetailView({ employee, events, onUpdateEmployee, onDeleteEmployee, onBack }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'relatives'>('info');
  return (
    <div className="space-y-6 animate-in slide-in-from-right-2 text-slate-800">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3"><button onClick={onBack} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={18}/></button><div><h2 className="text-lg font-bold uppercase">{safeStr(employee.name)}</h2><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Dossiê {safeStr(employee.codigo)} | <StatusBadge status={employee.status} /></p></div></div>
        <div className="flex gap-2"><button onClick={() => onUpdateEmployee(employee.id, {})} className="px-4 py-2 bg-slate-900 text-white rounded-sm font-bold text-[9px] uppercase hover:bg-slate-800 transition-colors">Editar</button><button onClick={() => onDeleteEmployee(employee.id)} className="px-4 py-2 bg-red-100 text-red-600 rounded-sm font-bold text-[9px] uppercase hover:bg-red-200 transition-colors">Remover</button></div>
      </header>
      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden flex min-h-[500px]">
        <nav className="w-56 bg-slate-50 border-r border-slate-100 p-2 space-y-1">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Ficha Cadastral" icon={<FileText size={16}/>} />
          <TabButton active={activeTab === 'relatives'} onClick={() => setActiveTab('relatives')} label="Ficha Familiar" icon={<Heart size={16}/>} />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Histórico" icon={<Clock size={16}/>} />
        </nav>
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InfoSection title="Identificação" items={[{label: "Pai", value: safeStr(employee.fatherName)}, {label: "Mãe", value: safeStr(employee.motherName)}, {label: "Nascimento", value: safeStr(employee.birthDate)}, {label: "Est. Civil", value: safeStr(employee.maritalStatus)}]} />
              <InfoSection title="Documentos" items={[{label: "CPF", value: safeStr(employee.cpf)}, {label: "RG", value: `${safeStr(employee.rg)} / ${safeStr(employee.rgOrgao)}`}, {label: "PIS", value: safeStr(employee.pis)}, {label: "CTPS", value: safeStr(employee.ctps)}]} />
              <InfoSection title="Financeiro" items={[{label: "Banco", value: safeStr(employee.bankInfo?.bank)}, {label: "Agência / Conta", value: `${safeStr(employee.bankInfo?.agency)} / ${safeStr(employee.bankInfo?.account)}-${safeStr(employee.bankInfo?.digit)}`}, {label: "Chave PIX", value: safeStr(employee.pixKey)}]} />
              <InfoSection title="Vínculo" items={[{label: "Cargo", value: safeStr(employee.role)}, {label: "Admissão", value: safeStr(employee.admissionDate)}, {label: "Salário", value: formatBRL(employee.salary)}, {label: "Escala", value: safeStr(employee.scale)}]} />
            </div>
          )}
          {activeTab === 'relatives' && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase text-blue-600 mb-4">Dependentes e Parentes</h4>
              <div className="divide-y divide-slate-100">
                {(employee.relatives || []).map((rel: any, idx: number) => (
                  <div key={idx} className="py-3 flex justify-between items-center"><div><p className="text-[11px] font-bold uppercase">{rel.name}</p><p className="text-[9px] text-slate-400 uppercase font-bold">{rel.parentage}</p></div><span className="text-[11px] font-bold">{rel.birthDate}</span></div>
                ))}
                {(!employee.relatives || employee.relatives.length === 0) && <p className="text-center py-10 text-[9px] font-bold text-slate-300 uppercase">Sem familiares registrados</p>}
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {events.map((ev: any) => (
                <div key={ev.id} className="p-3 border border-slate-100 bg-slate-50 rounded-sm">
                  <p className="text-[9px] font-bold uppercase">{ev.type} • {ev.date}</p>
                  <p className="text-xs font-medium text-slate-500">{ev.description}</p>
                </div>
              ))}
              {events.length === 0 && <p className="text-[10px] uppercase font-bold text-slate-300 text-center py-10">Sem ocorrências registradas</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function TabButton({ active, onClick, label, icon }: any) { return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2 rounded-sm font-bold text-[9px] uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>{icon}<span>{label}</span></button>; }
function InfoSection({ title, items }: any) { return <div><h4 className="text-[9px] font-bold text-blue-600 uppercase mb-4 border-l-2 border-blue-600 pl-2">{title}</h4><div className="space-y-4">{items.map((i: any, idx: number) => <div key={idx}><p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">{i.label}</p><p className="text-[11px] font-bold">{i.value || '---'}</p></div>)}</div></div>; }
