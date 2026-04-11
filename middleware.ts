import type { NextRequest } from 'next/server';

// Route protection middleware
export function middleware(request: NextRequest) {
  return request;
}

export const config = {
  matcher: [],
};
