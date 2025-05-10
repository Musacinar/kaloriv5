import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test Connection
const testConnection = async () => {
  const { data, error } = await supabase.from('kullanicilar').select('*');
  if (error) {
    console.error('Supabase bağlantı hatası:', error.message);
  } else {
    console.log('Bağlantı başarılı, veri:', data);
  }
};
testConnection();
