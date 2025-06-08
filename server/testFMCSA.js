import dotenv from 'dotenv';
dotenv.config();

import { verifyMCNumber } from './utils/fmcsa.js';

async function test() {
  console.log('✅ Loaded FMCSA_API_KEY:', process.env.FMCSA_API_KEY);

  const mcNumber = '121805'; 
  const result = await verifyMCNumber(mcNumber);
  console.log('✅ MC verification result:', result);
}

test().catch(console.error);
