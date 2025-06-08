import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/calls?mcNumber=<mcNumber>
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mcNumber = searchParams.get('mcNumber');

  if (!mcNumber) {
    return NextResponse.json(
      { error: 'MC number is required' },
      { status: 400 }
    );
  }

  // Fetch all call entries matching this MC number
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('mc_number', mcNumber);

  if (error) {
    console.error('Supabase query error in /api/calls:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ entries: data });
}
