// server/config/config.js
import dotenv from 'dotenv';

// *must* come before reading any env vars:
dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
export const API_KEY = process.env.MY_SECRET_API_KEY;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const FMCSA_API_KEY = process.env.FMCSA_API_KEY;
