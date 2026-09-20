import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://rfdvrynwzmghxovikukk.supabase.co";
const DEFAULT_KEY = "sb_publishable_E2ZOLFfvDod-OQ1zhe421w_QNKT_akn";

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const cleanedUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseUrl = cleanedUrl || DEFAULT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
