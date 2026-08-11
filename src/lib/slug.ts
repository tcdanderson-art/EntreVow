const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
