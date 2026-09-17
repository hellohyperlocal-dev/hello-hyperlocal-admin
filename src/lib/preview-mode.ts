/**
 * When true, the auth gate is bypassed entirely and screens render sample
 * data instead of querying Supabase — for showing the UI to someone (e.g. a
 * client demo over a tunnel) without real credentials or touching real data.
 * Never enable this in an actual deployment.
 */
export const isPreviewMode = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
