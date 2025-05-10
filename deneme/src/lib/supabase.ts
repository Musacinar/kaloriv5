import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
/*export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};*/

export const signUp = async (email: string, password: string) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !authData?.user) {
    return { error };
  }

  const userId = authData.user.id;

  // Profil tablosuna veri ekleme
  const { error: insertError } = await supabase.from('profiles').insert({
    user_id: userId,
    // Buraya profil bilgileri ekleyebilirsin
    // Örnek: name: '', age: null, gender: '', etc.
  });

  if (insertError) {
    console.error('Profil eklenemedi:', insertError.message);
    return { error: insertError };
  }

  return { error: null };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
