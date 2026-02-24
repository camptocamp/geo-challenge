import bbox from "@turf/bbox";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { multiPolygon, point } from "@turf/helpers";
import { randomPosition } from "@turf/random";
import { distance as distanceBetweenPoints } from "@turf/distance";
import { fromExtent } from "ol/geom/Polygon";

import countries from "./data/countries.json" with { type: "json" };
import { LOCATIONS, type CountryCode } from "./locations";

export type { CountryCode } from "./locations";

export const countriesGeometry: { [key in CountryCode]: any } = {
  ch: multiPolygon(countries.features.find((f: any) => f.properties.code === "ch").geometry.coordinates),
  fr: multiPolygon(countries.features.find((f: any) => f.properties.code === "fr").geometry.coordinates),
  de: multiPolygon(countries.features.find((f: any) => f.properties.code === "de").geometry.coordinates),
};

export const countriesExtent: { [key in CountryCode]: number[] } = {
  ch: bbox(countriesGeometry["ch"]),
  fr: bbox(countriesGeometry["fr"]),
  de: bbox(countriesGeometry["de"]),
};

// export const countriesMaxDistance: { [key in CountryCode]: number } = {
//   ch: maxDistance(countriesGeometry["ch"]),  // 355620.06424896297
//   fr: maxDistance(countriesGeometry["fr"]),  // 1079440.1997255683
//   de: maxDistance(countriesGeometry["de"]),  // 879452.6028816501
// };
// Precomputed for performance
export const countriesMaxDistance: { [key in CountryCode]: number } = {
  ch: 355620,
  fr: 1079440,
  de: 879452,
};

export function scoreFromDistance(distance: number, country: CountryCode): number {
  // https://www.reddit.com/r/geoguessr/comments/zqwgnr/how_the_hell_does_this_game_calculate_damage/
  const size = countriesMaxDistance[country]; // approximate max distance in meters
  return 5000 * Math.exp((-10 * distance) / size);
}

export function randomPositionInCountry(country: CountryCode): [number, number] {
  const polygon = countriesGeometry[country];
  const bboxes = LOCATIONS[country];
  const selectedBbox = bboxes[Math.floor(Math.random() * bboxes.length)];

  while (true) {
    const position = randomPosition(selectedBbox as [number, number, number, number]);
    if (booleanPointInPolygon(position, polygon)) {
      return position as [number, number];
    }
  }
}

export function scaleExtent(extent: number[], factor: number): number[] {
  const geom = fromExtent(extent);
  geom.scale(factor);
  return geom.getExtent();
}

function maxDistance(geometry: any): number {
  let max = 0;
  // geometry is a multipolygon and the first polygon is the biggest
  const coords = geometry.geometry.coordinates[0][0];
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      const distance = distanceBetweenPoints(point(coords[i]), point(coords[j]), { units: "meters" });
      if (distance > max) {
        max = distance;
      }
    }
  }
  return max;
}

/**
 * Get all search parameters from the current URL as a query string
 * Returns empty string if no parameters exist
 * Example: "?utm_source=google&utm_medium=cpc&utm_campaign=summer"
 */
export function getSearchParamsString(): string {
   const params = new URL(window.location.href).searchParams;
   if (params.size === 0) return '';

   const entries = Array.from(params.entries());
   const queryString = entries.map(([key, value]) =>
     `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
   ).join('&');

   return queryString ? `?${queryString}` : '';
 }

/**
 * Append search parameters to a given URL
 * Example: appendSearchParams("https://camptocamp.com/")
 *   with URL "?utm_source=google" returns "https://camptocamp.com/?utm_source=google"
 */
export function appendSearchParams(baseUrl: string): string {
   const params = getSearchParamsString();
   if (!params) return baseUrl;

   // Check if URL already has query params
   if (baseUrl.includes('?')) {
     return `${baseUrl}&${params.slice(1)}`;
   }
   return baseUrl + params;
 }
