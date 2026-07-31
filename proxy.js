// proxy.js (Raiz do projeto)
import { NextResponse } from 'next/server';

export function proxy(request) {
  // Permitir todos os acessos - proteção é feita no client-side via useRouter
  // Isso evita loops infinitos de redirecionamento
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
