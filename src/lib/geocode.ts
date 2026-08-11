export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(address)}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;

  return { lat: result.latitude, lng: result.longitude };
}
