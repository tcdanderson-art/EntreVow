export function publicStorageUrl(
  bucket: "photos" | "videos",
  key: string,
  opts?: { download?: string }
): string {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${key}`;
  // Supabase Storage sets Content-Disposition: attachment when ?download is present,
  // which is what makes cross-origin "save" links actually save instead of navigating.
  return opts?.download ? `${base}?download=${encodeURIComponent(opts.download)}` : base;
}
