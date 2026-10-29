import { InjectionToken } from '@angular/core';
import { SupabaseConfig } from '../models/supabase-config';

export const SUPABASE_CONFIG = new InjectionToken<SupabaseConfig>('SUPABASE_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    url: process.env.SUPABASE_URL ?? 'https://ygizvocqcznjcxxgmyha.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_1FD6yVzwAqA5F1JzZWMBRQ_OxlANBS-',
  }),
});
