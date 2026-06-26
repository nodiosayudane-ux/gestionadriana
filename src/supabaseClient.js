import { createClient } from '@supabase/supabase-js';

// Las llaves públicas de Supabase son seguras de colocar aquí
// porque nuestra base de datos ya está protegida por políticas (RLS) en el servidor.
const supabaseUrl = 'https://pshvlwynozetdgwzkzio.supabase.co';
const supabaseAnonKey = 'sb_publishable_yphfz9MDyeaxFhA1kDCdHA_JO8TSv8o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
