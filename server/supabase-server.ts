/**
 * BRAIN BOLT - Cliente Supabase para Servidor
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Validar que as variáveis de ambiente estão configuradas
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "❌ ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias.\n" +
      "Crie um arquivo .env no diretório server/ baseado no env.example"
  );
}

// Cliente Supabase configurado para servidor Node.js
export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Sem armazenamento local (não há localStorage no servidor)
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
