
const SUPABASE_URL = "https://okrigcahinlvdodvquqo.supabase.co";
const SUPABASE_KEY = "sb_publishable_6E8Dg22vne0ZjmLUGqGZOg_SvJFktXf";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.supabaseClient = supabaseClient;
