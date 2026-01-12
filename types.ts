
export interface Relative {
  name: string;
  birthDate: string;
  parentage: string;
}

export interface Employee {
  id: string;
  codigo: string;
  nrRecibo: string;
  name: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  race: string;
  naturalness: string;
  nationality: string;
  address: string;
  neighborhood: string;
  zipCode: string;
  city: string;
  state: string;
  cpf: string;
  rg: string;
  rgOrgao: string;
  rgEstado: string;
  rgEmissao: string;
  ctps: string;
  ctpsSerie: string;
  ctpsEstado: string;
  ctpsExpedicao: string;
  pis: string;
  pisDataCadastro: string;
  education: string;
  cnhNum: string;
  cnhCat: string;
  cnhValidade: string;
  reservista: string;
  reservistaCategoria: string;
  voterId: string;
  voterZone: string;
  voterSection: string;
  sindicato: string;
  consProfis: string;
  registroProfis: string;
  dataRegistroProfis: string;
  
  // Estrangeiro
  f_dataChegada?: string;
  f_tipoVisto?: string;
  f_rne?: string;
  f_rneValidade?: string;
  f_portariaNum?: string;
  f_portariaData?: string;

  bankInfo: {
    bank: string;
    account: string;
    digit: string;
    agency: string;
  };
  pixKey: string;
  
  // Contrato
  admissionDate: string;
  fgtsOptant: boolean;
  fgtsDataOpcao: string;
  fgtsConta: string;
  role: string;
  cbo: string;
  organograma: string;
  salary: number;
  modoPgto: string;
  periodoPgto: string;
  scale: string;
  dismissalDate?: string;
  
  // Ficha Familiar
  relatives: Relative[];
  
  status: 'Ativo' | 'Afastado' | 'Desligado';
  performanceRating?: number;
  notes?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'Gerente' | 'Gestor';
}

export type EventType = 'Falta' | 'Atraso' | 'Advertência' | 'Elogio';

export interface OperationalEvent {
  id: string;
  employeeId: string;
  type: EventType;
  date: string;
  description: string;
}

export interface Document {
  id: string;
  employeeId: string;
  title: string;
  type: 'Contrato' | 'Declaração' | 'Atestado' | 'Outro';
  uploadDate: string;
  fileUrl: string;
}

export type View = 'dashboard' | 'employees' | 'new-employee' | 'employee-detail';
export type AuthView = 'login' | 'register';
