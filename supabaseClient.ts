
import { createClient } from '@supabase/supabase-js';

/**
 * IMPORTANTE: Substitua as strings abaixo pelas chaves do seu projeto Supabase
 * que você encontra em: Project Settings -> API
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://shgfclmmyspufmambmkd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_pxzjP5pbpsK0687rzhfMFw_IGWzjUEu';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
