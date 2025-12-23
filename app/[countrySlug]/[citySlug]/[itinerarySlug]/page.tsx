import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getItineraryBySlug, getStrapiMediaUrl } from '@/lib/strapi';
import ReviewList from '@/components/reviews/ReviewList';
import ItineraryMapView from '@/components/itinerary/ItineraryMapView';

interface ItineraryPageProps {
  params: Promise<{
    countrySlug: string;
    citySlug: string;
    itinerarySlug: string;
  }>;
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const { countrySlug, citySlug, itinerarySlug } = await params;

  const response = await getItineraryBySlug(itinerarySlug);
  const itinerary = response.data[0];

  if (!itinerary) {
    notFound();
  }

  const coverImageUrl = itinerary.attributes.coverImage?.data?.attributes?.url;
  const city = itinerary.attributes.city.data;
  const category = itinerary.attributes.category.data;
  const tags = itinerary.attributes.tags.data;
  const places = itinerary.attributes.places?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            {' > '}
            <Link href={`/${countrySlug}`} className="hover:text-blue-600">
              {city.attributes.country.data.attributes.name}
            </Link>
            {' > '}
            <Link href={`/${countrySlug}/${citySlug}`} className="hover:text-blue-600">
              {city.attributes.name}
            </Link>
            {' > '}
            <span className="text-gray-900 font-semibold">{itinerary.attributes.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {coverImageUrl && (
            <div className="w-full h-96 relative">
              <img
                src={getStrapiMediaUrl(coverImageUrl)}
                alt={itinerary.attributes.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-3">
              {category && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: category.attributes.color }}
                >
                  {category.attributes.icon} {category.attributes.name}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                {itinerary.attributes.durationDays}일
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {itinerary.attributes.title}
            </h1>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                  >
                    #{tag.attributes.name}
                  </span>
                ))}
              </div>
            )}

            {itinerary.attributes.summary && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {itinerary.attributes.summary}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {itinerary.attributes.content && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">상세 내용</h2>
            <div
              className="prose max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: itinerary.attributes.content }}
            />
          </div>
        )}

        {/* Day by Day Itinerary with Maps */}
        {places.length > 0 && <ItineraryMapView places={places} />}

        {/* Reviews */}
        <ReviewList itineraryId={itinerary.id} />
      </div>
    </div>
  );
}
