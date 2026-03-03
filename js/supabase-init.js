// Supabase initialization - load this first in all pages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ngtarhwkcigbvbjqalbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGFyaHdrY2lnYnZianFhbGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjAzODYsImV4cCI6MjA4ODA5NjM4Nn0.E3eDI6q24BD_DU-HP4fFJ0P_Wo0FbgsVqFx6rvZQN9E';


// Create and export supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it globally available
window.supabase = supabase;

console.log('Supabase initialized successfully');