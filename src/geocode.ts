import fetch from 'node-fetch';

export interface GeocodeResult {
  lat: number;
  lon: number;
}

/**
 * Geocodes a street address using the U.S. Census Geocoder API. This function
 * sends a GET request to the Census API and returns the latitude and
 * longitude of the provided address. If the API fails or no result is
 * returned, the promise rejects.
 *
 * Note: In production, you should cache results and respect rate limits.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const url = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');
  url.searchParams.set('address', address);
  url.searchParams.set('benchmark', 'Public_AR_Current');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Geocoding API error: ${res.status}`);
  }
  const data = await res.json();
  const result = data.result?.addressMatches?.[0];
  if (!result) {
    throw new Error(`No geocoding result for address: ${address}`);
  }
  const { coordinates } = result;
  return {
    lat: coordinates.y,
    lon: coordinates.x,
  };
}
