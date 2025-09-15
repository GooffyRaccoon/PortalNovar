import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://sbfrjfqaraxfulwqselv.supabase.co"; // <<-- substitua
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZnJqZnFhcmF4ZnVsd3FzZWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5Mzg2ODUsImV4cCI6MjA3MzUxNDY4NX0.YPJ0zYeXU6UtacOCWJ2JM6NAUQIu0WwrN3B8aQiLMY0"; // <<-- substitua

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


