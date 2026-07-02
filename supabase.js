const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Normal client (used for login, reading tables, etc.)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Admin client (used only for password reset)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = {
    supabase,
    supabaseAdmin
};