/**
 * Constructs invite links based on recipient role:
 * - Admin invites generate a web URL pointing to this admin dashboard (/invite/<token>).
 * - Councillor invites generate a mobile app deep-link (hello-hyperlocal://invite/<token>).
 */
export function buildInviteLink(token: string, role: "admin" | "councillor" = "councillor"): string {
  if (role === "admin") {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    return `${baseUrl.replace(/\/$/, "")}/invite/${token}`;
  }

  const scheme = process.env.NEXT_PUBLIC_MOBILE_APP_SCHEME || "hello-hyperlocal";
  return `${scheme}://invite/${token}`;
}
