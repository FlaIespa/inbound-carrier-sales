import supabase from './supabaseClient.js';

/**
 * Search for loads matching the given origin and destination.
 *
 * Performs a case-insensitive substring search on the `origin` and `destination`
 * fields of all records in the `loads` table. Since Supabase doesn’t support
 * ILIKE on multiple fields in a single query by default, this function fetches
 * all loads and filters them in memory.
 *
 * @param {string} origin
 *   The origin location to search for (e.g., "Los Angeles, CA").
 * @param {string} destination
 *   The destination location to search for (e.g., "Phoenix, AZ").
 *
 * @returns {Promise<Array<Object>>}
 *   A promise that resolves to an array of load objects whose `origin` and
 *   `destination` fields include the provided search terms (case-insensitive).
 *   Returns an empty array if there is an error fetching from Supabase.
 */

export async function searchLoads(origin, destination) {
  const origLower = origin.trim().toLowerCase();
  const destLower = destination.trim().toLowerCase();

  const { data: loads, error } = await supabase
    .from('loads')
    .select('*');

  if (error) {
    console.error('Error fetching loads from Supabase:', error);
    return [];
  }

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
