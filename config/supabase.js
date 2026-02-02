const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
  console.error('❌ ERROR: SUPABASE_URL is not set in .env file');
  console.error('Please add: SUPABASE_URL=https://your-project-id.supabase.co');
  process.exit(1);
}

if (!supabaseKey || supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.error('❌ ERROR: SUPABASE_ANON_KEY is not set in .env file');
  console.error('Please add your anon public key from Supabase dashboard');
  process.exit(1);
}

console.log('✅ Supabase configured with URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;