// Supabase configuration

const SUPABASE_URL = 'https://ngtarhwkcigbvbjqalbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGFyaHdrY2lnYnZianFhbGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjAzODYsImV4cCI6MjA4ODA5NjM4Nn0.E3eDI6q24BD_DU-HP4fFJ0P_Wo0FbgsVqFx6rvZQN9E';

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make supabase available globally
window.supabase = supabase;


// Helper function to create Supabase client if not exists
function supabaseCreateClient(url, key) {
    return window.supabase || { 
        from: () => ({ 
            select: () => Promise.resolve({ data: [], error: null }),
            insert: () => Promise.resolve({ data: null, error: null }),
            update: () => Promise.resolve({ data: null, error: null }),
            delete: () => Promise.resolve({ data: null, error: null })
        })
    };
}