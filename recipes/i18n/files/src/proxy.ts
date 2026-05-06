import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Exclude Payload admin, API routes, Next.js internals, and static files
  matcher: ["/", "/(en|pt)/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
