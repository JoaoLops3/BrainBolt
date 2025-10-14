/**
 * BRAIN BOLT - Cliente Supabase para Servidor
 *
 * Este cliente é configurado especificamente para uso em ambiente Node.js,
 * sem dependências de APIs do navegador como localStorage.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vnoltbgfatheyhmsltpg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub2x0YmdmYXRoZXlobXNsdHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzc0NjksImV4cCI6MjA3Mjc1MzQ2OX0.TQ_xa42b9KtUWWaqtTTtNwTKn4t-3tppid6D2nIB1wo";

// Cliente Supabase configurado para servidor Node.js
export const supabaseServer = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // Sem armazenamento local (não há localStorage no servidor)
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
