
export interface Employee {
  id: string;
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
  ctps: string;
  pis: string;
  phone: string; // Novo
  emergencyPhone: string; // Novo
  education: string;
  cnh: {
    number: string;
    category: string;
    validity: string;
  };
  voterId: string;
  bankInfo: {
    bank: string;
    account: string;
    digit: string;
    agency: string;
  };
  pixKey: string; // Novo
  admissionDate: string;
  role: string;
  cbo: string;
  salary: number;
  scale: string;
  status: 'Ativo' | 'Afastado' | 'Desligado';
  paymentMode: string;
  paymentPeriod: string;
  fgtsOptant: boolean;
  performanceRating?: number;
  performanceNotes?: string;
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
  justification?: string;
  severity?: 'Leve' | 'Média' | 'Grave';
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
