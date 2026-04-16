// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('❌ 缺少 SUPABASE_URL 环境变量。请在 .env.local 中添加 SUPABASE_URL');
}

if (!supabaseServiceKey) {
  throw new Error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY 环境变量');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});