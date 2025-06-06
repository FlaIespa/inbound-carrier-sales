// server/utils/fmcsa.js

import fetch from 'node-fetch';

/**
 * Verifies an MC number using FMCSA's Carrier Snapshot service.
 * Returns an object: { valid: boolean, carrierName?: string, authorityStatus?: string }.
 * If invalid (not found or not Active), returns { valid: false }.
 */
export async function verifyMCNumber(mcNumber) {
  const url = `https://mobile.fmcsa.dot.gov/qc/services/carriers?searchText=${mcNumber}&type=MC`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      console.error(`FMCSA API responded with status ${res.status}`);
      return { valid: false };
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false };
    }
    // Find an entry where the MC matches (digits only) and the authority_status is "Active"
    const match = data.find((c) => {
      const mcDigits = (c.mc_number || '').replace(/\D/g, '');
      return mcDigits === mcNumber.replace(/\D/g, '') && c.authority_status === 'Active';
    });
    if (match) {
      return {
        valid: true,
        carrierName: match.carrier_name,
        authorityStatus: match.authority_status,
      };
    } else {
      return { valid: false };
    }
  } catch (err) {
    console.error('Error querying FMCSA API:', err);
    return { valid: false };
  }
}
