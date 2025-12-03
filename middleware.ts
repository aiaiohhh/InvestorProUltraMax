import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isDevPreviewMode,
  previewEmail,
  previewPassword,
} from '@/config/authConfig';

export function middleware(request: NextRequest) {
  if (isDevPreviewMode) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');

    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const [username, password] = decoded.split(':');

      if (username === previewEmail && password === previewPassword) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="InvestorProUltraMax"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};

