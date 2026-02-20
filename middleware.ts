import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const role = req.nextauth?.token?.role as string | undefined;

    const executiveOnly = ['/settings', '/organisation/delete'];
    const isExecutiveOnly = executiveOnly.some((p) => path.includes(p));
    if (isExecutiveOnly && role !== 'Executive') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return Response.redirect(url);
    }
    return undefined;
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ['/dashboard/:path*', '/organisation/:path*', '/team/:path*', '/settings/:path*'],
};
