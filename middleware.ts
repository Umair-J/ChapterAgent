export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/plan/:path*",
    "/activities/:path*",
    "/api/plan/:path*",
    "/api/activities/:path*",
    "/api/calendar/:path*",
  ],
};
