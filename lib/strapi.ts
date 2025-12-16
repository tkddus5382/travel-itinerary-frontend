const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiData<T> {
  id: number;
  attributes: T;
}

export interface Country {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  imageUrl: any;
  order: number;
  isPublished: boolean;
}

export interface City {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  imageUrl: any;
  order: number;
  isPublished: boolean;
  country: { data: StrapiData<Country> };
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Itinerary {
  title: string;
  slug: string;
  summary: string;
  content: string;
  durationDays: number;
  coverImage: any;
  order: number;
  isPublished: boolean;
  viewCount: number;
  city: { data: StrapiData<City> };
  category: { data: StrapiData<Category> };
  tags: { data: StrapiData<Tag>[] };
}

export interface Place {
  name: string;
  category: string;
  dayNumber: number;
  timeSlot: string;
  description: string;
  googleMapsUrl: string;
  externalUrl: string;
  imageUrl: any;
  order: number;
}

export interface Hotel {
  name: string;
  priceRange: string;
  rating: number;
  description: string;
  bookingUrl: string;
  imageUrl: any;
  order: number;
}

export interface Activity {
  name: string;
  category: string;
  price: string;
  description: string;
  bookingUrl: string;
  imageUrl: any;
  order: number;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = STRAPI_API_URL + endpoint;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = 'Bearer ' + STRAPI_API_TOKEN;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error('API Error: ' + response.status + ' ' + response.statusText);
  }

  return response.json();
}

// Countries
export async function getCountries(): Promise<StrapiResponse<StrapiData<Country>[]>> {
  return fetchAPI('/countries?populate=*&sort=order:asc&filters[isPublished][$eq]=true');
}

export async function getCountryBySlug(slug: string): Promise<StrapiResponse<StrapiData<Country>[]>> {
  return fetchAPI('/countries?filters[slug][$eq]=' + slug + '&populate=*');
}

// Cities
export async function getCitiesByCountry(countrySlug: string): Promise<StrapiResponse<StrapiData<City>[]>> {
  return fetchAPI('/cities?filters[country][slug][$eq]=' + countrySlug + '&populate=*&sort=order:asc&filters[isPublished][$eq]=true');
}

export async function getCityBySlug(slug: string): Promise<StrapiResponse<StrapiData<City>[]>> {
  return fetchAPI('/cities?filters[slug][$eq]=' + slug + '&populate=*');
}

// Categories
export async function getCategories(): Promise<StrapiResponse<StrapiData<Category>[]>> {
  return fetchAPI('/categories?sort=name:asc');
}

// Tags
export async function getTags(): Promise<StrapiResponse<StrapiData<Tag>[]>> {
  return fetchAPI('/tags?sort=name:asc');
}

// Itineraries
export async function getItineraries(
  citySlug?: string,
  categorySlug?: string,
  tagSlugs?: string[]
): Promise<StrapiResponse<StrapiData<Itinerary>[]>> {
  let query = '/itineraries?populate=*&sort=order:asc&filters[isPublished][$eq]=true';

  if (citySlug) {
    query += '&filters[city][slug][$eq]=' + citySlug;
  }

  if (categorySlug) {
    query += '&filters[category][slug][$eq]=' + categorySlug;
  }

  if (tagSlugs && tagSlugs.length > 0) {
    tagSlugs.forEach((tagSlug, index) => {
      query += '&filters[tags][slug][$in][' + index + ']=' + tagSlug;
    });
  }

  return fetchAPI(query);
}

export async function getItineraryBySlug(slug: string): Promise<StrapiResponse<StrapiData<Itinerary>[]>> {
  return fetchAPI('/itineraries?filters[slug][$eq]=' + slug + '&populate[city][populate]=*&populate[category][populate]=*&populate[tags][populate]=*&populate[places][populate]=*&populate[coverImage][populate]=*');
}

// Hotels
export async function getHotelsByCity(citySlug: string): Promise<StrapiResponse<StrapiData<Hotel>[]>> {
  return fetchAPI('/hotels?filters[city][slug][$eq]=' + citySlug + '&populate=*&sort=order:asc');
}

// Activities
export async function getActivitiesByCity(citySlug: string): Promise<StrapiResponse<StrapiData<Activity>[]>> {
  return fetchAPI('/activities?filters[city][slug][$eq]=' + citySlug + '&populate=*&sort=order:asc');
}

// Media URL Helper
export function getStrapiMediaUrl(url: string | null): string {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return (process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337') + url;
}

// Reviews
export interface Review {
  rating: number;
  content: string;
  createdAt: string;
  user: { data: { id: number; attributes: { username: string; email: string } } };
  itinerary: { data: StrapiData<Itinerary> };
  likedBy: { data: Array<{ id: number }> };
}

export async function getReviewsByItinerary(itineraryId: number, sort: string = 'createdAt:desc'): Promise<StrapiResponse<StrapiData<Review>[]>> {
  return fetchAPI(`/reviews?filters[itinerary][id][$eq]=${itineraryId}&populate=user,likedBy&sort=${sort}`);
}

export async function createReview(token: string, data: { rating: number; content: string; itinerary: number }): Promise<StrapiResponse<StrapiData<Review>>> {
  return fetchAPI('/reviews', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });
}

export async function updateReview(token: string, reviewId: number, likedBy: number[]): Promise<StrapiResponse<StrapiData<Review>>> {
  return fetchAPI(`/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        likedBy: likedBy,
      },
    }),
  });
}

export async function deleteReview(token: string, reviewId: number): Promise<void> {
  return fetchAPI(`/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function updateReviewContent(token: string, reviewId: number, data: { rating: number; content: string }): Promise<StrapiResponse<StrapiData<Review>>> {
  return fetchAPI(`/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });
}
