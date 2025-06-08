// src/app/api/verify/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// POST /api/verify
export async function POST(request) {
  try {
    const { mcNumber } = await request.json();
    if (!mcNumber) {
      return NextResponse.json(
        { valid: false, error: 'MC number required' },
        { status: 400 }
      );
    }

    // Query the calls table for matching mc_number, return at most one row
    const { data, error } = await supabase
      .from('calls')
      .select('carrier_name')
      .eq('mc_number', mcNumber)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { valid: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (!data) {
      // No matching carrier found
      return NextResponse.json({ valid: false });
    }

    // Carrier found, return name
    return NextResponse.json({ valid: true, carrierName: data.carrier_name });
  } catch (err) {
    console.error('Unexpected error in /api/verify:', err);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
