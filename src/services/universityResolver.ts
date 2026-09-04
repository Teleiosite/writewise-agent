/**
 * src/services/universityResolver.ts
 *
 * Maps university names to their OpenURL resolver endpoints.
 * Generates deep links directly into university library systems
 * so users can access paywalled papers with one click.
 */

export interface University {
  name: string;
  country: string;
  region: string;
  resolverBase?: string; // OpenURL resolver base URL (null = use DOI link)
}

export const UNIVERSITIES: University[] = [
  // ── Nigeria ──────────────────────────────────────────────────────────────────
  { name: 'University of Lagos', country: 'Nigeria', region: 'West Africa', resolverBase: 'https://unilag.idm.oclc.org/login?url=' },
  { name: 'University of Ibadan', country: 'Nigeria', region: 'West Africa', resolverBase: 'https://ui.idm.oclc.org/login?url=' },
  { name: 'Ahmadu Bello University', country: 'Nigeria', region: 'West Africa' },
  { name: 'Covenant University', country: 'Nigeria', region: 'West Africa' },
  { name: 'Obafemi Awolowo University', country: 'Nigeria', region: 'West Africa' },
  { name: 'University of Benin', country: 'Nigeria', region: 'West Africa' },
  { name: 'University of Port Harcourt', country: 'Nigeria', region: 'West Africa' },
  { name: 'Nnamdi Azikiwe University', country: 'Nigeria', region: 'West Africa' },
  { name: 'Lagos State University', country: 'Nigeria', region: 'West Africa' },
  { name: 'Federal University of Technology Akure', country: 'Nigeria', region: 'West Africa' },
  { name: 'Bayero University Kano', country: 'Nigeria', region: 'West Africa' },
  { name: 'University of Nigeria Nsukka', country: 'Nigeria', region: 'West Africa' },

  // ── Ghana ─────────────────────────────────────────────────────────────────────
  { name: 'University of Ghana', country: 'Ghana', region: 'West Africa', resolverBase: 'https://ug.idm.oclc.org/login?url=' },
  { name: 'Kwame Nkrumah University of Science and Technology', country: 'Ghana', region: 'West Africa' },
  { name: 'University of Cape Coast', country: 'Ghana', region: 'West Africa' },
  { name: 'University for Development Studies', country: 'Ghana', region: 'West Africa' },
  { name: 'Ghana Institute of Management and Public Administration', country: 'Ghana', region: 'West Africa' },

  // ── Kenya ─────────────────────────────────────────────────────────────────────
  { name: 'University of Nairobi', country: 'Kenya', region: 'East Africa', resolverBase: 'https://uon.idm.oclc.org/login?url=' },
  { name: 'Kenyatta University', country: 'Kenya', region: 'East Africa' },
  { name: 'Strathmore University', country: 'Kenya', region: 'East Africa' },
  { name: 'Moi University', country: 'Kenya', region: 'East Africa' },
  { name: 'Jomo Kenyatta University of Agriculture and Technology', country: 'Kenya', region: 'East Africa' },

  // ── South Africa ─────────────────────────────────────────────────────────────
  { name: 'University of Cape Town', country: 'South Africa', region: 'Southern Africa', resolverBase: 'https://uct.idm.oclc.org/login?url=' },
  { name: 'University of the Witwatersrand', country: 'South Africa', region: 'Southern Africa', resolverBase: 'https://wits.idm.oclc.org/login?url=' },
  { name: 'Stellenbosch University', country: 'South Africa', region: 'Southern Africa' },
  { name: 'University of Pretoria', country: 'South Africa', region: 'Southern Africa', resolverBase: 'https://up.idm.oclc.org/login?url=' },
  { name: 'University of Johannesburg', country: 'South Africa', region: 'Southern Africa' },

  // ── UK ────────────────────────────────────────────────────────────────────────
  { name: 'University of Oxford', country: 'United Kingdom', region: 'UK', resolverBase: 'https://login.ezproxy.bodleian.ox.ac.uk/login?url=' },
  { name: 'University of Cambridge', country: 'United Kingdom', region: 'UK', resolverBase: 'https://login.ezproxy.lib.cam.ac.uk/login?url=' },
  { name: 'Imperial College London', country: 'United Kingdom', region: 'UK', resolverBase: 'https://login.ezproxy.imperial.ac.uk/login?url=' },
  { name: 'University College London', country: 'United Kingdom', region: 'UK', resolverBase: 'https://login.ezproxy.ucl.ac.uk/login?url=' },
  { name: 'University of Manchester', country: 'United Kingdom', region: 'UK', resolverBase: 'https://man-uea.idm.oclc.org/login?url=' },
  { name: 'University of Birmingham', country: 'United Kingdom', region: 'UK' },
  { name: 'University of Edinburgh', country: 'United Kingdom', region: 'UK', resolverBase: 'https://login.ezproxy.is.ed.ac.uk/login?url=' },
  { name: 'King\'s College London', country: 'United Kingdom', region: 'UK' },
  { name: 'University of Leeds', country: 'United Kingdom', region: 'UK', resolverBase: 'https://leeds.idm.oclc.org/login?url=' },
  { name: 'University of Bristol', country: 'United Kingdom', region: 'UK' },
  { name: 'University of Nottingham', country: 'United Kingdom', region: 'UK', resolverBase: 'https://uniofnottm.idm.oclc.org/login?url=' },
  { name: 'University of Sheffield', country: 'United Kingdom', region: 'UK' },
  { name: 'University of Southampton', country: 'United Kingdom', region: 'UK' },
  { name: 'University of Warwick', country: 'United Kingdom', region: 'UK' },
  { name: 'University of Exeter', country: 'United Kingdom', region: 'UK' },

  // ── USA ───────────────────────────────────────────────────────────────────────
  { name: 'Harvard University', country: 'United States', region: 'North America', resolverBase: 'https://login.ezp-prod1.hul.harvard.edu/login?url=' },
  { name: 'Massachusetts Institute of Technology', country: 'United States', region: 'North America' },
  { name: 'Stanford University', country: 'United States', region: 'North America' },
  { name: 'University of California Berkeley', country: 'United States', region: 'North America', resolverBase: 'https://ezproxy.lib.berkeley.edu/login?url=' },
  { name: 'Columbia University', country: 'United States', region: 'North America' },
  { name: 'Johns Hopkins University', country: 'United States', region: 'North America' },
  { name: 'University of Michigan', country: 'United States', region: 'North America', resolverBase: 'https://proxy.lib.umich.edu/login?url=' },
  { name: 'Arizona State University', country: 'United States', region: 'North America' },
  { name: 'University of Florida', country: 'United States', region: 'North America' },

  // ── Canada ────────────────────────────────────────────────────────────────────
  { name: 'University of Toronto', country: 'Canada', region: 'North America', resolverBase: 'https://login.myaccess.library.utoronto.ca/login?url=' },
  { name: 'McGill University', country: 'Canada', region: 'North America' },
  { name: 'University of British Columbia', country: 'Canada', region: 'North America' },

  // ── Australia ─────────────────────────────────────────────────────────────────
  { name: 'Australian National University', country: 'Australia', region: 'Oceania', resolverBase: 'https://anu.idm.oclc.org/login?url=' },
  { name: 'University of Sydney', country: 'Australia', region: 'Oceania' },
  { name: 'University of Melbourne', country: 'Australia', region: 'Oceania', resolverBase: 'https://unimelb.idm.oclc.org/login?url=' },
  { name: 'University of Queensland', country: 'Australia', region: 'Oceania' },

  // ── India ────────────────────────────────────────────────────────────────────
  { name: 'Indian Institute of Technology Delhi', country: 'India', region: 'South Asia' },
  { name: 'Indian Institute of Science', country: 'India', region: 'South Asia' },
  { name: 'University of Delhi', country: 'India', region: 'South Asia' },
  { name: 'Jawaharlal Nehru University', country: 'India', region: 'South Asia' },
];

/**
 * Builds a university library deep link for a paper DOI.
 * If the university has an EZProxy/OpenURL resolver, generates a direct link.
 * Otherwise falls back to the DOI link.
 */
export function buildLibraryLink(doi: string, universityName: string): string {
  const uni = UNIVERSITIES.find(u => u.name === universityName);
  const doiUrl = `https://doi.org/${doi}`;

  if (uni?.resolverBase) {
    return `${uni.resolverBase}${encodeURIComponent(doiUrl)}`;
  }
  // Generic fallback — most universities use the DOI URL via their library portal
  return doiUrl;
}

/** Groups universities by region for the dropdown */
export function getUniversitiesByRegion(): Record<string, University[]> {
  const grouped: Record<string, University[]> = {};
  for (const uni of UNIVERSITIES) {
    if (!grouped[uni.region]) grouped[uni.region] = [];
    grouped[uni.region].push(uni);
  }
  return grouped;
}
