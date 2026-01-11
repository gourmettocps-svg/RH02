
import { createClient } from '@supabase/supabase-js';
import { Employee, OperationalEvent, Document, AppUser } from './types';

const SUPABASE_URL = 'https://oolfgzdtblgpbejlcrvy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wXuxrjpWhEat7jaFUCewjA_QAnVLfF1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

export const registerNewUser = async (user: Omit<AppUser, 'id'> & { password: string }) => {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Employees CRUD
export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data || [];
};

export const createEmployee = async (employee: Employee): Promise<Employee> => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<Employee> => {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
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
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data || [];
};

export const createEvent = async (event: OperationalEvent): Promise<OperationalEvent> => {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateOperationalEvent = async (id: string, updates: Partial<OperationalEvent>): Promise<OperationalEvent> => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteEventById = async (id: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Documents CRUD
export const fetchDocuments = async (): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('uploadDate', { ascending: false });
  
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  return data || [];
};

export const createDocument = async (doc: Document): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents')
    .insert([doc])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteDocumentById = async (id: string) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
