import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xdjelcrhzjmnxlkbllxv.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkamVsY3Joemptbnhsa2JsbHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDYzNDUsImV4cCI6MjEwODQyMjM0NX0.7IWCwADTdioSTHb6rnkqI2G8IoJXniLb7XupTaTpa-Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
