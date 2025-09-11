import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get('ref');

  const redirectUrl = new URL('/', request.url);
  redirectUrl.hash = 'cadastro';

  if (ref) {
    redirectUrl.searchParams.set('ref', ref);
  }

  redirect(redirectUrl.toString());
}