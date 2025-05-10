import { supabase } from '../lib/supabase';

export const getirKullanici = async (uid: string) => {
  const { data, error } = await supabase
    .from('kullanicilar')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) {
    console.error('Kullanıcı getirilemedi:', error.message);
    return null;
  }

  return data;
};
