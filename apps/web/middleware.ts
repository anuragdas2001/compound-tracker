export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/habits/:path*",
    "/profile/:path*",
    "/store/:path*"
  ],
};
