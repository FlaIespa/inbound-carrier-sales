import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client utility for server-side database operations.
 *
 * Initializes a Supabase client using the service role key, which grants
 * elevated privileges suitable for backend use.
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
