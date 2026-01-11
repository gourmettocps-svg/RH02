
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
  X,
  ChevronDown,
  Download,
  Loader2,
  Lock,
  Mail,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  MessageSquare,
  MapPin,
  CreditCard,
  Briefcase,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Star,
  TrendingUp,
  Phone,
  Heart
} from 'lucide-react';
import { Employee, OperationalEvent, Document, View, AppUser, AuthView, EventType } from './types';
import { 
  fetchEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployeeById, 
  fetchEvents, 
  createEvent, 
  updateOperationalEvent,
  deleteEventById,
  fetchDocuments, 
  createDocument, 
  deleteDocumentById,
  loginUser,
  registerNewUser
} from './store';

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('rh_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    loadAllData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [empData, eventData, docData] = await Promise.all([
        fetchEmployees(),
        fetchEvents(),
        fetchDocuments()
      ]);
      setEmployees(empData);
      setEvents(eventData);
      setDocuments(docData);
    } catch (err) {
      showNotification('error', "Falha na conexão com o banco de dados.");
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
    } else {
      showNotification('error', "Credenciais inválidas.");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const user = await registerNewUser({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as any,
        password: formData.get('password') as string
      });
      setCurrentUser(user);
      localStorage.setItem('rh_user', JSON.stringify(user));
      showNotification('success', "Acesso configurado.");
    } catch (err) {
      showNotification('error', "Erro ao cadastrar gestor.");
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rh_user');
    setCurrentView('dashboard');
    showNotification('success', "Sessão encerrada.");
  };

  const activeEmployee = useMemo(() => employees.find(e => e.id === selectedEmployeeId), [employees, selectedEmployeeId]);
  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.cpf.includes(searchTerm);
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
        {notification && <Toast type={notification.type} message={notification.message} />}
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-900 p-8 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg"><span className="text-white font-bold text-xl">G</span></div>
            <h1 className="text-xl font-bold text-white uppercase tracking-widest">Gourmetto RH</h1>
            <p className="text-slate-400 text-[10px] uppercase mt-1 tracking-[0.2em]">Painel Operacional de Controle</p>
          </div>
          <div className="p-8">
            {authView === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <Input label="E-mail" name="email" type="email" placeholder="usuario@gourmetto.com" icon={<Mail size={16}/>}/>
                <Input label="Senha" name="password" type="password" placeholder="••••••••" icon={<Lock size={16}/>}/>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-md transition-all flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Acessar Sistema'}
                </button>
                <div className="pt-4 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">Novo gestor? <button type="button" onClick={() => setAuthView('register')} className="text-blue-600 font-bold hover:underline">Solicitar cadastro</button></p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <Input label="Nome Completo" name="name" type="text" placeholder="Seu nome" icon={<UserIcon size={16}/>}/>
                <Input label="E-mail" name="email" type="email" placeholder="usuario@gourmetto.com" icon={<Mail size={16}/>}/>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Cargo</label>
                  <select name="role" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm">
                    <option value="Gestor">Líder Operacional</option>
                    <option value="Gerente">Gerência Geral</option>
                  </select>
                </div>
                <Input label="Senha" name="password" type="password" placeholder="••••••••" icon={<Lock size={16}/>}/>
                <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-md transition-all flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Concluir Cadastro'}
                </button>
                <div className="pt-4 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">Já tem conta? <button type="button" onClick={() => setAuthView('login')} className="text-blue-600 font-bold hover:underline">Voltar ao login</button></p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      {notification && <Toast type={notification.type} message={notification.message} />}
      
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 sticky top-0 h-screen z-40 text-slate-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white">G</div>
          <span className="text-lg font-bold tracking-tight text-white uppercase">Gourmetto</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <SidebarLink active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<LayoutDashboard size={18} />} label="Início" />
          <SidebarLink active={currentView === 'employees' || currentView === 'employee-detail'} onClick={() => navigateTo('employees')} icon={<Users size={18} />} label="Colaboradores" />
          <SidebarLink active={currentView === 'new-employee'} onClick={() => navigateTo('new-employee')} icon={<UserPlus size={18} />} label="Novo Registro" />
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Logado como</p>
            <p className="font-semibold text-xs truncate text-white">{currentUser.name}</p>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter mt-1">{currentUser.role}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={16}/><span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">G</div>
            <h1 className="font-bold text-slate-900 uppercase tracking-tighter text-sm">Gourmetto</h1>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400"><LogOut size={20} /></button>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && <DashboardView employees={employees} events={events} onNavigate={navigateTo} />}
          {currentView === 'employees' && <EmployeeListView employees={filteredEmployees} searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onNavigate={navigateTo} />}
          {currentView === 'new-employee' && <NewEmployeeView onCancel={() => navigateTo('employees')} onSubmit={(emp: Employee) => {
            createEmployee(emp).then((savedEmp) => { 
              setEmployees(prev => [...prev, savedEmp]); 
              navigateTo('employees'); 
              showNotification('success', "Funcionário registrado com sucesso.");
            }).catch(() => showNotification('error', "Falha ao salvar registro."));
          }} />}
          {currentView === 'employee-detail' && activeEmployee && (
            <EmployeeDetailView 
              employee={activeEmployee} 
              events={events.filter(ev => ev.employeeId === activeEmployee.id)}
              documents={documents.filter(doc => doc.employeeId === activeEmployee.id)}
              onAddEvent={async (ev: OperationalEvent) => {
                const savedEv = await createEvent(ev);
                setEvents(p => [savedEv, ...p]);
                showNotification('success', "Ocorrência registrada.");
                return savedEv;
              }}
              onUpdateEvent={async (id: string, ev: Partial<OperationalEvent>) => {
                const savedEv = await updateOperationalEvent(id, ev);
                setEvents(p => p.map(x => x.id === id ? savedEv : x));
                showNotification('success', "Registro atualizado.");
                return savedEv;
              }}
              onDeleteEvent={(id: string) => deleteEventById(id).then(() => {
                setEvents(p => p.filter(x => x.id !== id));
                showNotification('success', "Registro removido.");
              })}
              onUpdateEmployee={(id: string, updates: Partial<Employee>) => updateEmployee(id, updates).then((savedEmp) => {
                setEmployees(p => p.map(e => e.id === id ? savedEmp : e));
                showNotification('success', "Dossiê atualizado.");
              })}
              onAddDocument={(doc: Document) => createDocument(doc).then((savedDoc) => {
                setDocuments(p => [savedDoc, ...p]);
                showNotification('success', "Documento anexado.");
              })}
              onDeleteDocument={(id: string) => deleteDocumentById(id).then(() => {
                setDocuments(p => p.filter(d => d.id !== id));
                showNotification('success', "Arquivo excluído.");
              })}
              onDeleteEmployee={(id: string) => { 
                deleteEmployeeById(id).then(() => { 
                  setEmployees(p => p.filter(e => e.id !== id)); 
                  navigateTo('employees'); 
                  showNotification('success', "Funcionário removido.");
                });
              }}
              onBack={() => navigateTo('employees')}
            />
          )}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 shadow-lg">
        <MobileNavLink active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<LayoutDashboard size={20}/>} label="Início"/>
        <MobileNavLink active={currentView === 'employees'} onClick={() => navigateTo('employees')} icon={<Users size={20}/>} label="Equipe"/>
        <MobileNavLink active={currentView === 'new-employee'} onClick={() => navigateTo('new-employee')} icon={<UserPlus size={20}/>} label="Novo"/>
      </nav>
      <div className="h-16 lg:hidden"></div>
    </div>
  );
}

function Toast({ type, message }: { type: 'success' | 'error', message: string }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4">
      <div className={`px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
        {type === 'success' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
        <span className="text-[11px] font-bold uppercase tracking-wider">{message}</span>
      </div>
    </div>
  );
}

function Input({ label, icon, ...props }: any) {
  return (
    <div className="space-y-1.5 text-slate-800">
      {label && <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-0.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input 
          {...props} 
          className={`w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 ${icon ? 'pl-10' : 'px-3.5'} pr-4 font-semibold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 placeholder:font-normal`} 
        />
      </div>
    </div>
  );
}

function DashboardView({ employees, events, onNavigate }: any) {
  const activeCount = employees.filter((e: any) => e.status === 'Ativo').length;
  const recentEvents = events.slice(0, 6);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Dashboard Operacional</h2>
          <p className="text-slate-500 text-sm">Resumo de indicadores e equipe em tempo real</p>
        </div>
        <button onClick={() => onNavigate('new-employee')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"><Plus size={16}/> Adicionar Colaborador</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Ativos" value={activeCount} icon={<Users size={18} className="text-blue-600"/>} />
        <StatCard label="Faltas / Mês" value={events.filter((e: any) => e.type === 'Falta').length} icon={<Calendar size={18} className="text-red-500"/>} />
        <StatCard label="Destaques" value={events.filter((e: any) => e.type === 'Elogio').length} icon={<Award size={18} className="text-emerald-500"/>} />
        <StatCard label="Advertências" value={events.filter((e: any) => e.type === 'Advertência').length} icon={<AlertCircle size={18} className="text-orange-500"/>} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Atividades Recentes</h3>
            <button onClick={() => onNavigate('employees')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Ver Histórico</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentEvents.map((ev: any) => {
              const emp = employees.find((e: any) => e.id === ev.employeeId);
              return (
                <div key={ev.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${ev.type === 'Falta' ? 'bg-red-50 text-red-600' : ev.type === 'Elogio' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {ev.type === 'Falta' ? <Calendar size={14}/> : ev.type === 'Elogio' ? <Award size={14}/> : <AlertCircle size={14}/>}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{emp?.name || '---'}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{ev.type} • {new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              );
            })}
            {recentEvents.length === 0 && <p className="px-6 py-12 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Sem atividades registradas</p>}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-8 text-white shadow-lg flex flex-col justify-between border border-slate-800">
          <div>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-6"><ShieldCheck size={20}/></div>
            <h3 className="text-lg font-bold uppercase tracking-tight mb-3">Auditoria de Dados</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">Todos os registros operacionais são monitorados para conformidade com as normas da Gourmetto. As alterações ficam vinculadas ao seu perfil de gestor.</p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800">
             <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Status do Servidor</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Sincronizado</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeListView({ employees, searchTerm, setSearchTerm, statusFilter, setStatusFilter, onNavigate }: any) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Equipe Gourmetto</h2>
          <p className="text-slate-500 text-sm">Gerencie o quadro de funcionários e acessos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar colaborador..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 font-semibold text-slate-800 text-sm outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 font-bold text-slate-700 text-xs outline-none shadow-sm cursor-pointer appearance-none"
          >
            <option>Todos</option>
            <option>Ativo</option>
            <option>Afastado</option>
            <option>Desligado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Função</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admissão</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">{emp.name.substring(0, 2)}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs tracking-tight">{emp.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400">CPF: {emp.cpf}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded inline-block">{emp.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold text-slate-500">{new Date(emp.admissionDate).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onNavigate('employee-detail', emp.id)} className="bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-500 px-3 py-1.5 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest inline-flex items-center gap-1.5">
                      <FileText size={12}/> Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Users size={40} className="mb-3"/>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum registro encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NewEmployeeView({ onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState<any>({
    status: 'Ativo',
    admissionDate: new Date().toISOString().split('T')[0],
    fgtsOptant: true,
    bankInfo: { bank: '', account: '', digit: '', agency: '' },
    cnh: { number: '', category: '', validity: '' },
    phone: '',
    emergencyPhone: '',
    pixKey: '',
    address: '',
    neighborhood: '',
    zipCode: '',
    city: '',
    state: ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({ ...formData, id: Math.random().toString(36).substr(2, 9) });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20 text-slate-800">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><ArrowLeft size={20}/></button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Cadastro de Colaborador</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-10">
          <div className="space-y-12">
            <section>
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><span className="w-10 h-[2px] bg-blue-600 rounded"></span> Dados Pessoais & Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><Input label="Nome Completo" required value={formData.name || ''} onChange={(e:any) => setFormData({...formData, name: e.target.value})} /></div>
                <Input label="CPF" required value={formData.cpf || ''} onChange={(e:any) => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />
                <Input label="Nascimento" type="date" required value={formData.birthDate || ''} onChange={(e:any) => setFormData({...formData, birthDate: e.target.value})} />
                <Input label="Mãe" value={formData.motherName || ''} onChange={(e:any) => setFormData({...formData, motherName: e.target.value})} />
                <Input label="Pai" value={formData.fatherName || ''} onChange={(e:any) => setFormData({...formData, fatherName: e.target.value})} />
                <Input label="Telefone de Contato" icon={<Phone size={14}/>} value={formData.phone || ''} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" />
                <Input label="Telefone de Urgência" icon={<Heart size={14}/>} value={formData.emergencyPhone || ''} onChange={(e:any) => setFormData({...formData, emergencyPhone: e.target.value})} placeholder="(00) 00000-0000" />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><span className="w-10 h-[2px] bg-blue-600 rounded"></span> Endereço Completo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><Input label="Logradouro e Número" value={formData.address || ''} onChange={(e:any) => setFormData({...formData, address: e.target.value})} placeholder="Ex: Rua das Flores, 123" /></div>
                <Input label="Bairro" value={formData.neighborhood || ''} onChange={(e:any) => setFormData({...formData, neighborhood: e.target.value})} />
                <Input label="CEP" value={formData.zipCode || ''} onChange={(e:any) => setFormData({...formData, zipCode: e.target.value})} placeholder="00000-000" />
                <Input label="Cidade" value={formData.city || ''} onChange={(e:any) => setFormData({...formData, city: e.target.value})} />
                <Input label="Estado (UF)" value={formData.state || ''} onChange={(e:any) => setFormData({...formData, state: e.target.value})} maxLength={2} placeholder="Ex: SP" />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><span className="w-10 h-[2px] bg-blue-600 rounded"></span> Financeiro & PIX</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><Input label="Chave PIX para Pagamento" icon={<CreditCard size={14}/>} value={formData.pixKey || ''} onChange={(e:any) => setFormData({...formData, pixKey: e.target.value})} placeholder="CPF, E-mail, Celular ou Aleatória" /></div>
                <Input label="Banco" value={formData.bankInfo?.bank || ''} onChange={(e:any) => setFormData({...formData, bankInfo: {...formData.bankInfo, bank: e.target.value}})} />
                <Input label="Agência" value={formData.bankInfo?.agency || ''} onChange={(e:any) => setFormData({...formData, bankInfo: {...formData.bankInfo, agency: e.target.value}})} />
                <Input label="Conta" value={formData.bankInfo?.account || ''} onChange={(e:any) => setFormData({...formData, bankInfo: {...formData.bankInfo, account: e.target.value}})} />
                <Input label="Dígito" value={formData.bankInfo?.digit || ''} onChange={(e:any) => setFormData({...formData, bankInfo: {...formData.bankInfo, digit: e.target.value}})} />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><span className="w-10 h-[2px] bg-blue-600 rounded"></span> Contrato Gourmetto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Cargo" required value={formData.role || ''} onChange={(e:any) => setFormData({...formData, role: e.target.value})} />
                <Input label="Salário Base" type="number" step="0.01" required value={formData.salary || ''} onChange={(e:any) => setFormData({...formData, salary: parseFloat(e.target.value)})} />
                <Input label="Admissão" type="date" required value={formData.admissionDate || ''} onChange={(e:any) => setFormData({...formData, admissionDate: e.target.value})} />
                <Input label="Escala" value={formData.scale || ''} onChange={(e:any) => setFormData({...formData, scale: e.target.value})} placeholder="Ex: 6x1" />
              </div>
            </section>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={onCancel} className="flex-1 bg-white border border-slate-200 text-slate-500 py-4 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">Descartar</button>
          <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-md hover:bg-blue-700 transition-all">Salvar Registro</button>
        </div>
      </form>
    </div>
  );
}

function EmployeeDetailView({ employee, events, documents, onAddEvent, onUpdateEvent, onDeleteEvent, onUpdateEmployee, onAddDocument, onDeleteDocument, onDeleteEmployee, onBack }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'docs'>('info');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditEmpModalOpen, setIsEditEmpModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OperationalEvent | null>(null);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-400 text-slate-800">
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen} 
        onClose={() => setIsDeleteConfirmOpen(false)} 
        onConfirm={() => onDeleteEmployee(employee.id)} 
        title="Remover Permanente" 
        message={`Deseja realmente excluir o dossiê de ${employee.name}? Esta ação não pode ser desfeita.`} 
      />

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><ArrowLeft size={20}/></button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">{employee.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">{employee.name}</h2>
              <div className="flex items-center gap-3 mt-1"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dossiê #{employee.id}</span><StatusBadge status={employee.status} /></div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }} className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"><AlertCircle size={14}/> Lançar Ocorrência</button>
          <button onClick={() => setIsDocModalOpen(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"><Plus size={14}/> Anexo</button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col lg:flex-row">
        <div className="w-full lg:w-60 bg-slate-50 border-r border-slate-100 p-4 space-y-1">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Dossiê" icon={<Users size={16}/>} />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Histórico" icon={<Clock size={16}/>} />
          <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} label="Arquivos" icon={<FileText size={16}/>} />
          <div className="pt-6 mt-6 border-t border-slate-200 space-y-2 px-4">
            <button onClick={() => setIsEditEmpModalOpen(true)} className="w-full flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline transition-all"><Edit2 size={12}/> Editar Ficha</button>
            <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline transition-all"><Trash2 size={12}/> Remover</button>
          </div>
        </div>
        
        <div className="flex-1 p-8 lg:p-10 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-300">
               <InfoSection title="Identificação & Filiação" items={[
                 { label: "Pai", value: employee.fatherName },
                 { label: "Mãe", value: employee.motherName },
                 { label: "Nascimento", value: employee.birthDate },
                 { label: "CPF", value: employee.cpf },
                 { label: "RG", value: employee.rg }
               ]} />
               <InfoSection title="Contato & Emergência" items={[
                 { label: "Telefone Principal", value: employee.phone },
                 { label: "Contato de Urgência", value: employee.emergencyPhone }
               ]} />
               <InfoSection title="Endereço Residencial" items={[
                 { label: "Endereço", value: employee.address },
                 { label: "Bairro", value: employee.neighborhood },
                 { label: "Cidade/UF", value: employee.city ? `${employee.city} - ${employee.state || ''}` : '' },
                 { label: "CEP", value: employee.zipCode }
               ]} />
               <InfoSection title="Dados Financeiros & PIX" items={[
                 { label: "Chave PIX", value: employee.pixKey },
                 { label: "Banco", value: employee.bankInfo?.bank },
                 { label: "Agência/Conta", value: employee.bankInfo?.agency ? `${employee.bankInfo.agency} / ${employee.bankInfo.account}-${employee.bankInfo.digit}` : '' }
               ]} />
               <InfoSection title="Contrato Gourmetto" items={[
                 { label: "Cargo", value: employee.role },
                 { label: "Admissão", value: employee.admissionDate },
                 { label: "Salário", value: formatBRL(employee.salary) },
                 { label: "Escala", value: employee.scale }
               ]} />
            </div>
          )}
          {activeTab === 'history' && (
            <div className="divide-y divide-slate-100">
               {events.map((ev: any) => (
                 <div key={ev.id} className="py-5 flex items-start justify-between group">
                    <div className="flex gap-4">
                      <div className={`mt-1 p-2 rounded ${ev.type === 'Falta' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {ev.type === 'Falta' ? <Calendar size={14}/> : <Clock size={14}/>}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{ev.type} • {ev.date}</p>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{ev.description}</p>
                      </div>
                    </div>
                 </div>
               ))}
               {events.length === 0 && <p className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Sem registros no histórico</p>}
            </div>
          )}
          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc: any) => (
                <div key={doc.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{doc.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{doc.type}</p>
                  </div>
                  <button className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"><Download size={16}/></button>
                </div>
              ))}
              {documents.length === 0 && <p className="col-span-2 py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Nenhum documento digitalizado</p>}
            </div>
          )}
        </div>
      </div>
      
      {isEventModalOpen && <EventModal event={editingEvent} onClose={() => setIsEventModalOpen(false)} onSubmit={(d: any) => { onAddEvent({...d, employeeId: employee.id}); setIsEventModalOpen(false); }} />}
      {isEditEmpModalOpen && <EditEmployeeModal employee={employee} onClose={() => setIsEditEmpModalOpen(false)} onSubmit={(d: any) => { onUpdateEmployee(employee.id, d); setIsEditEmpModalOpen(false); }} />}
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: any) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{icon}<span>{label}</span></button>;
}
function MobileNavLink({ active, onClick, icon, label }: any) {
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600' : 'text-slate-400'}`}>{icon}<span className="text-[9px] font-bold uppercase tracking-widest">{label}</span></button>;
}
function StatCard({ label, value, icon }: any) {
  return <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm"><div className="flex items-center justify-between mb-2"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</span><div className="bg-slate-50 p-2 rounded-lg">{icon}</div></div><p className="text-2xl font-bold text-slate-900">{value}</p></div>;
}
function TabButton({ active, onClick, label, icon }: any) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>{icon}<span>{label}</span></button>;
}
function InfoSection({ title, items }: any) {
  return <div><h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{title}</h4><div className="space-y-5">{items.map((i: any, idx: number) => <div key={idx}><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{i.label}</p><p className="text-xs font-bold text-slate-800">{i.value || '---'}</p></div>)}</div></div>;
}
function StatusBadge({ status }: any) {
  const styles: any = { Ativo: 'bg-emerald-50 text-emerald-600 border-emerald-100', Afastado: 'bg-orange-50 text-orange-600 border-orange-100', Desligado: 'bg-red-50 text-red-600 border-red-100' };
  return <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${styles[status]}`}>{status}</span>;
}

function EventModal({ event, onClose, onSubmit }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-8 animate-in zoom-in-95">
        <h3 className="text-lg font-bold mb-6 text-slate-900 uppercase tracking-tight">Registro de Ocorrência</h3>
        <form className="space-y-4" onSubmit={(e: any) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSubmit({ type: fd.get('type') as any, date: fd.get('date') as string, description: fd.get('description') as string, justification: fd.get('justification') as string }); }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Tipo</label><select name="type" className="w-full bg-slate-50 p-3 rounded-lg font-bold text-xs border border-slate-200 outline-none"><option value="Falta">Falta</option><option value="Atraso">Atraso</option><option value="Advertência">Advertência</option><option value="Elogio">Elogio</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Data</label><input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 p-3 rounded-lg font-bold text-xs border border-slate-200 outline-none" /></div>
          </div>
          <div className="space-y-1"><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Relatório</label><textarea name="description" required className="w-full bg-slate-50 p-3 rounded-lg font-bold text-xs border border-slate-200 outline-none h-24 resize-none" placeholder="Relate o ocorrido..."></textarea></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold uppercase text-[10px] tracking-widest text-slate-400">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-md transition-all">Salvar Evento</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEmployeeModal({ employee, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState<Employee>({ ...employee });
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-slate-800">
        <h3 className="text-xl font-bold mb-8 text-slate-900 uppercase tracking-tight">Editar Dossiê</h3>
        <form className="space-y-8" onSubmit={(e: any) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label="Nome Completo" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            </div>
            <Input label="CPF" value={formData.cpf} onChange={(e:any) => setFormData({...formData, cpf: e.target.value})} />
            <Input label="Telefone" value={formData.phone} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} />
            <Input label="Telefone Urgência" value={formData.emergencyPhone} onChange={(e:any) => setFormData({...formData, emergencyPhone: e.target.value})} />
            <Input label="Chave PIX" value={formData.pixKey} onChange={(e:any) => setFormData({...formData, pixKey: e.target.value})} />
            <div className="md:col-span-2">
              <Input label="Endereço Completo" value={formData.address} onChange={(e:any) => setFormData({...formData, address: e.target.value})} />
            </div>
            <Input label="Bairro" value={formData.neighborhood} onChange={(e:any) => setFormData({...formData, neighborhood: e.target.value})} />
            <Input label="Cidade" value={formData.city} onChange={(e:any) => setFormData({...formData, city: e.target.value})} />
            <Input label="Cargo" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} />
            <Input label="Salário" type="number" step="0.01" value={formData.salary} onChange={(e:any) => setFormData({...formData, salary: parseFloat(e.target.value)})} />
          </div>
          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-400">Descartar</button>
            <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-md transition-all">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-xl p-8 animate-in zoom-in-95 shadow-2xl text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded flex items-center justify-center mx-auto mb-6"><AlertTriangle size={24}/></div>
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-3">{title}</h3>
        <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed px-4">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 font-bold uppercase text-[10px] tracking-widest text-slate-400">Não</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-md transition-all">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
