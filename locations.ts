export type CountryCode = "ch" | "fr" | "de";

// Precomputed country extents to avoid circular dependency with utils.ts
// this is temporary, should be removed when we a list of LOCATIONS per country
// Each bbox is [minLon, minLat, maxLon, maxLat]
const countriesExtent: { [key in CountryCode]: number[] } = {
  ch: [5.954809, 45.820718, 10.466627, 47.801166],
  fr: [-4.784901, 41.365912, 9.559581, 51.087541],
  de: [5.85249, 47.271121, 15.022059, 54.9059],
};

// Bounding boxes for interesting locations in each country
// FIXME: add more interesting bounding boxes for each country

export const LOCATIONS: { [key in CountryCode]: number[][] } = {
  ch: [countriesExtent["ch"]],
  fr: [countriesExtent["fr"]],
  de: [countriesExtent["de"]],
};
