const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (SUPABASE_URL && SUPABASE_KEY) {
  module.exports = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn('SUPABASE_URL or SUPABASE_KEY not set. Supabase client not initialized.');

  // Minimal stub that surfaces a clear error when used at runtime
  const notConfiguredError = () => {
    const err = new Error('Supabase client not configured. Set SUPABASE_URL and SUPABASE_KEY in .env to enable Supabase features.');
    throw err;
  };

  const stub = {
    auth: {
      signUp: async () => { notConfiguredError(); },
      signInWithPassword: async () => { notConfiguredError(); },
      signOut: async () => { notConfiguredError(); },
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') })
    },
    from: () => ({
      select: async () => { notConfiguredError(); },
      insert: async () => { notConfiguredError(); },
      update: async () => { notConfiguredError(); },
      delete: async () => { notConfiguredError(); }
    })
  };

  module.exports = stub;
}
