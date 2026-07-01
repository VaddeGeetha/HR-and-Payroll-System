require("dotenv").config();

console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY =", process.env.SUPABASE_ANON_KEY);

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;