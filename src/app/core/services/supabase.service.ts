import { Service, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../tokens/supabase-config.token';

@Service()
export class SupabaseService {
  private readonly config = inject(SUPABASE_CONFIG);
  readonly client: SupabaseClient = createClient(this.config.url, this.config.anonKey);
}
