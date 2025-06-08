import dotenv from 'dotenv';

dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 4000;
export const API_KEY = process.env.MY_SECRET_API_KEY;