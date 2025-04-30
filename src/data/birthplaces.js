// filepath: /Users/james/projects/alan_mariner_app/src/data/birthplaces.js
/**
 * Structured place of birth data for the Maritime Database
 * 
 * This data is organized into option groups for use in dropdowns and filters
 * Similar place names have been intelligently consolidated
 */

export const birthplaces = {
  shetland: [
    { value: "aithsting", label: "Aithsting" },
    { value: "bressay", label: "Bressay" },
    { value: "burra", label: "Burra" },
    { value: "cunningsburgh", label: "Cunningsburgh" },
    { value: "delting", label: "Delting" },
    { value: "dunrossness", label: "Dunrossness" },
    { value: "fair-isle", label: "Fair Isle" },
    { value: "fetlar", label: "Fetlar" },
    { value: "foula", label: "Foula" },
    { value: "lerwick", label: "Lerwick" },
    { value: "lunnasting", label: "Lunnasting" },
    { value: "nesting", label: "Nesting" },
    { value: "northmavine", label: "Northmavine" },
    { value: "oxna", label: "Oxna" },
    { value: "papa-stour", label: "Papa Stour" },
    { value: "quarff", label: "Quarff" },
    { value: "sandness", label: "Sandness" },
    { value: "sandsting", label: "Sandsting" },
    { value: "sandwick", label: "Sandwick" },
    { value: "shetland", label: "Shetland (general)" },
    { value: "skerries", label: "Skerries" },
    { value: "tingwall", label: "Tingwall" },
    { value: "trondra", label: "Trondra" },
    { value: "unst", label: "Unst" },
    { value: "walls", label: "Walls" },
    { value: "weisdale", label: "Weisdale" },
    { value: "whalsay", label: "Whalsay" },
    { value: "whiteness", label: "Whiteness" },
    { value: "yell", label: "Yell" },
    { value: "yell-east", label: "Yell (East)" },
    { value: "yell-mid", label: "Yell (Mid)" },
    { value: "yell-north", label: "Yell (North)" },
    { value: "yell-west", label: "Yell (West)" }
  ],
  other: [
    { value: "aberdeen", label: "Aberdeen" },
    { value: "berwick", label: "Berwick" },
    { value: "edinburgh", label: "Edinburgh" },
    { value: "sunderland", label: "Sunderland" },
    { value: "ryhall", label: "Ryhall" },
    { value: "unknown", label: "Unknown" },
    { value: "not-shetland", label: "Not Shetland (general)" }
  ]
};

/**
 * Maps specific birthplaces to their regional divisions in the GeoJSON map
 * This allows aggregating specific birthplaces to display on a regional choropleth map
 */
export const shetlandPlaceBuckets = {
  LerwickNorth: [
    "lerwick",
    "bressay"
  ],
  LerwickSouth: [
    "lerwick",
    "bressay"
  ],
  NorthIsles: [
    "unst",
    "fetlar",
    "yell",
    "yell-east",
    "yell-mid",
    "yell-north",
    "yell-west",
    "skerries"
  ],
  ShetlandCentral: [
    "tingwall",
    "nesting",
    "lunnasting",
    "burra",
    "trondra",
    "oxna",
  ],
  ShetlandNorth: [
    "delting",
    "northmavine"
  ],
  ShetlandSouth: [
    "cunningsburgh",
    "quarff",
    "sandwick",
    "dunrossness",
    "fair-isle"
  ],
  ShetlandWest: [
    "aithsting",
    "sandness",
    "sandsting",
    "walls",
    "papa-stour",
    "foula",
    "weisdale",
    "whiteness"
  ]
};

/**
 * Maps all possible raw input values to their standardized values
 * This handles typos, variants, and uncertain entries
 */
export const birthplaceMapping = {
  // Shetland mappings
  "?shetland": "shetland",
  "aithsting": "aithsting",
  "bressay": "bressay",
  "bressay?": "bressay",
  "burra": "burra",
  "cunningsburgh": "cunningsburgh",
  "delting": "delting",
  "dunrossess": "dunrossness", // Typo correction
  "dunrossness": "dunrossness",
  "fair isle": "fair-isle",
  "fetlar": "fetlar",
  "foula": "foula",
  "lerwick": "lerwick",
  "lunnasting": "lunnasting",
  "nesting": "nesting",
  "northmavine": "northmavine",
  "northness": "northmavine", // Assuming this is a variant/typo of Northmavine
  "oxna": "oxna",
  "papa stour": "papa-stour",
  "quarff": "quarff",
  "sandness": "sandness",
  "sandsting": "sandsting",
  "sandwick": "sandwick",
  "shetland": "shetland",
  "shetland?": "shetland",
  "skerries": "skerries",
  "tingwall": "tingwall",
  "tingwall/lwk": "tingwall", // Consolidated
  "trondra": "trondra",
  "unst": "unst",
  "unst/yell": "unst", // Assuming primary is Unst
  "walls": "walls",
  "weisdale": "weisdale",
  "wiesdale": "weisdale", // Typo correction
  "whalsay": "whalsay",
  "whiteness": "whiteness",
  "yell": "yell",
  "yell east": "yell-east",
  "yell mid": "yell-mid",
  "yell north": "yell-north",
  "yell west": "yell-west",
  
  // Other mappings
  "?": "unknown",
  "?not shetland": "not-shetland",
  "?sunderland": "sunderland",
  "aberdeen": "aberdeen",
  "berwick?": "berwick",
  "edinburgh": "edinburgh",
  "loune may be laurence": "unknown",
  "not shetland?": "not-shetland",
  "ryhall, shet.": "ryhall",
  "sunderland": "sunderland",
  "werdin": "unknown"
};

/**
 * Helper function to get the standardized place value from any input
 * @param {string} rawPlace - The raw place name from the database
 * @returns {object|null} - The standardized place object or null if not found
 */
export function getStandardizedPlace(rawPlace) {
  if (!rawPlace) return null;
  
  // Convert to lowercase for case-insensitive matching
  const normalizedPlace = rawPlace.toLowerCase().trim();
  
  // Get the standardized value from the mapping
  const standardizedValue = birthplaceMapping[normalizedPlace];
  
  // For debugging - log the raw and normalized place values
  console.log(`Trying to standardize: "${rawPlace}" -> normalized as "${normalizedPlace}"`);
  console.log(`Mapping found: ${standardizedValue ? `"${standardizedValue}"` : 'none'}`);
  
  if (!standardizedValue) {
    // Try partial matching if exact match fails
    const keys = Object.keys(birthplaceMapping);
    // Check if the normalized place contains any of the mapping keys
    for (const key of keys) {
      if (normalizedPlace.includes(key) || key.includes(normalizedPlace)) {
        console.log(`Partial match found: "${normalizedPlace}" contains or is contained in "${key}"`);
        const partialMatch = birthplaceMapping[key];
        
        // Determine which group the place belongs to
        const shetlandMatch = birthplaces.shetland.find(place => place.value === partialMatch);
        if (shetlandMatch) return { ...shetlandMatch, group: 'shetland' };
        
        const otherMatch = birthplaces.other.find(place => place.value === partialMatch);
        if (otherMatch) return { ...otherMatch, group: 'other' };
      }
    }
    
    return null;
  }
  
  // Determine which group the place belongs to
  const shetlandMatch = birthplaces.shetland.find(place => place.value === standardizedValue);
  if (shetlandMatch) return { ...shetlandMatch, group: 'shetland' };
  
  const otherMatch = birthplaces.other.find(place => place.value === standardizedValue);
  if (otherMatch) return { ...otherMatch, group: 'other' };
  
  return null;
}

/**
 * Finds the region for a given place
 * @param {string} placeValue - The standardized place value
 * @returns {string|null} - The region name or null if not found
 */
export function getRegionForPlace(placeValue) {
  if (!placeValue) return null;
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedPlace = placeValue.toLowerCase();
  
  for (const [region, places] of Object.entries(shetlandPlaceBuckets)) {
    // Check if the normalized place matches any place in this region (case-insensitive)
    if (places.some(place => place.toLowerCase() === normalizedPlace)) {
      return region;
    }
  }
  
  return null;
}

/**
 * Returns all places formatted for use in a grouped dropdown
 * @returns {Array} - Array of option groups with their options
 */
export function getGroupedBirthplaces() {
  return [
    {
      label: "Shetland",
      options: birthplaces.shetland
    },
    {
      label: "Other Locations",
      options: birthplaces.other
    }
  ];
}

/**
 * Get distinct places of birth from a collection of mariner records
 * @param {Array} mariners - Array of mariner objects
 * @returns {Array} - Array of unique standardized place objects
 */
export function getDistinctPlaces(mariners) {
  if (!mariners || !Array.isArray(mariners)) return [];
  
  const uniquePlaces = new Set();
  const result = [];
  
  mariners.forEach(mariner => {
    if (mariner.place_of_birth) {
      const standardized = getStandardizedPlace(mariner.place_of_birth);
      if (standardized && !uniquePlaces.has(standardized.value)) {
        uniquePlaces.add(standardized.value);
        result.push(standardized);
      }
    }
  });
  
  // Sort alphabetically
  return result.sort((a, b) => a.label.localeCompare(b.label));
}

export default {
  birthplaces,
  shetlandPlaceBuckets,
  birthplaceMapping,
  getStandardizedPlace,
  getRegionForPlace,
  getGroupedBirthplaces,
  getDistinctPlaces
};