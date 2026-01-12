
import { createClient } from '@supabase/supabase-js';
import { Employee, OperationalEvent, Document, AppUser } from './types';

const SUPABASE_URL = 'https://oolfgzdtblgpbejlcrvy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wXuxrjpWhEat7jaFUCewjA_QAnVLfF1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper para testar conexão
export const checkDbConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('employees').select('id').limit(1);
    if (error) {
      console.warn('DB Connection Warning:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Auth Helpers
export const loginUser = async (email: string, password: string): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) return null;
  return data;
};

// Função auxiliar para remover campos nulos ou indefinidos antes de enviar ao banco
const cleanPayload = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined || newObj[key] === null || newObj[key] === '') {
      delete newObj[key];
    }
  });
  return newObj;
};

// Employees CRUD
export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
  return data || [];
};

export const createEmployee = async (employee: Employee): Promise<Employee> => {
  const { id, ...rest } = employee;
  const payload = cleanPayload(rest);
  
  const { data, error } = await supabase
    .from('employees')
    .insert([payload])
    .select()
    .single();
  
  if (error) {
    // Se ainda der erro de cache, logamos para debug
    console.error('Supabase Insert Error:', error);
    throw error;
  }
  return data;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<Employee> => {
  const payload = cleanPayload(updates);
  const { data, error } = await supabase
    .from('employees')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteEmployeeById = async (id: string) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Events CRUD
export const fetchEvents = async (): Promise<OperationalEvent[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) return [];
  return data || [];
};

export const createEvent = async (event: OperationalEvent): Promise<OperationalEvent> => {
  const { id, ...rest } = event;
  const payload = cleanPayload(rest);
  const { data, error } = await supabase
    .from('events')
    .insert([payload])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
