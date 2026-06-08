import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ data: { success: true }, error: null, status: 200 });
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('next-auth.csrf-token');
  response.cookies.delete('__Host-next-auth.csrf-token');
  return response;
}
