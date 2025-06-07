// server/utils/fmcsa.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const FMCSA_API_KEY = process.env.FMCSA_API_KEY;

/**
 * Verifies an MC number using FMCSA's QCMobile API.
 * @param {string} mcNumber - The MC number to verify.
 * @returns {Promise<object>} - { valid: boolean, carrierName?: string, authorityStatus?: string }
 */
export async function verifyMCNumber(mcNumber) {
  const url = `https://mobile.fmcsa.dot.gov/qc/services/carriers/docket-number/${mcNumber}?webKey=${FMCSA_API_KEY}`;
  console.log('🌐 FMCSA API URL:', url); // ✅ helpful debug

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    console.log('🌐 FMCSA API status code:', res.status);

    if (!res.ok) {
      console.error(`❌ FMCSA API responded with status ${res.status}`);
      if (res.status >= 500) {
        return { valid: false, error: 'FMCSA service is temporarily unavailable' };
      }
      return { valid: false };
    }

    const data = await res.json();
    console.log('🌐 FMCSA API response:', JSON.stringify(data, null, 2));

    // content is an array of carrier objects
    if (!data || !Array.isArray(data.content) || data.content.length === 0) {
      console.log('⚠️ No carrier data found in FMCSA response.');
      return { valid: false };
    }

    const carrierInfo = data.content[0];
    const { statusCode, legalName } = carrierInfo.carrier;

    if (statusCode === 'A') { // statusCode 'A' means Active
      console.log(`✅ Carrier verified as active: ${legalName}`);
      return {
        valid: true,
        carrierName: legalName,
        authorityStatus: statusCode,
      };
    } else {
      console.log(`⚠️ Carrier status is not active (statusCode: ${statusCode}).`);
      return { valid: false };
    }
  } catch (err) {
    console.error('❌ Error querying FMCSA API:', err);
    return { valid: false };
  }
}
