/**
 * When true (strictly non-production only), the auth gate is bypassed and screens
 * render sample data instead of querying Supabase.
 * Hard-locked to false in production builds to prevent accidental authentication bypasses.
 */
export const isPreviewMode =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
