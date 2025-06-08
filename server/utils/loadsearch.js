// server/utils/loadsearch.js
import supabase from './supabaseClient.js';

/**
 * Given an origin and destination string, return an array of matching loads.
 * Performs a “case-insensitive substring” search on origin & destination using Supabase.
 */
export async function searchLoads(origin, destination) {
  // Normalize to lowercase
  const origLower = origin.trim().toLowerCase();
  const destLower = destination.trim().toLowerCase();

  // Fetch loads from Supabase
  const { data: loads, error } = await supabase
    .from('loads')
    .select('*');

  if (error) {
    console.error('Error fetching loads from Supabase:', error);
    return [];
  }

  // Filter in memory (Supabase doesn’t support ILIKE on multiple fields in one query by default)
  const matches = loads.filter((load) => {
    const loadOrigin = (load.origin || '').trim().toLowerCase();
    const loadDest = (load.destination || '').trim().toLowerCase();

    console.log('Comparing:', {
      loadOrigin,
      loadDest,
      searchOrigin: origLower,
      searchDest: destLower
    });

    return (
      typeof load.origin === 'string' &&
      typeof load.destination === 'string' &&
      loadOrigin.includes(origLower) &&
      loadDest.includes(destLower)
    );
  });

  return matches;
}
