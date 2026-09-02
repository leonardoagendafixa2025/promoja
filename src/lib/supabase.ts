import { createClient } from '@supabase/supabase-js';

// Obter variáveis de ambiente ou usar fallbacks editáveis
const getEnvVar = (key: string, defaultValue: string = '') => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[key]) {
    return metaEnv[key];
  }
  return defaultValue;
};

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', localStorage.getItem('PROMOJA_SUPABASE_URL') || '');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', localStorage.getItem('PROMOJA_SUPABASE_ANON_KEY') || '');

export const isSupabaseConfigured = (): boolean => {
  const url = localStorage.getItem('PROMOJA_SUPABASE_URL') || SUPABASE_URL;
  const key = localStorage.getItem('PROMOJA_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;
  return Boolean(url && key && url.includes('supabase.co'));
};

export const getSupabaseClient = () => {
  const url = localStorage.getItem('PROMOJA_SUPABASE_URL') || SUPABASE_URL || 'https://xyzcompany.supabase.co';
  const key = localStorage.getItem('PROMOJA_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
  
  return createClient(url, key);
};

export const supabase = getSupabaseClient();

export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('PROMOJA_SUPABASE_URL', url.trim());
  localStorage.setItem('PROMOJA_SUPABASE_ANON_KEY', key.trim());
  window.location.reload();
};
