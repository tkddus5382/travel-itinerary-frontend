import Link from 'next/link';
import { getCityBySlug, getItineraries, getCategories, getTags, getStrapiMediaUrl } from '@/lib/strapi';
import FilterBar from './FilterBar';

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ countrySlug: string; citySlug: string }>;
  searchParams: Promise<{ category?: string; tags?: string }>;
}) {
  const { countrySlug, citySlug } = await params;
  const searchParamsResolved = await searchParams;
  const categorySlug = searchParamsResolved.category;
  const tagSlugs = searchParamsResolved.tags ? searchParamsResolved.tags.split(',') : [];

  let city = null;
  let itineraries = [];
  let categories = [];
  let tags = [];
  let error = null;

  try {
    // Fetch city details
    const cityResponse = await getCityBySlug(citySlug);
    if (cityResponse.data.length > 0) {
      city = cityResponse.data[0];
    }

    // Fetch itineraries with filters
    const itinerariesResponse = await getItineraries(citySlug, categorySlug, tagSlugs);
    itineraries = itinerariesResponse.data || [];

    // Fetch categories and tags for filter
    const categoriesResponse = await getCategories();
    categories = categoriesResponse.data || [];

    const tagsResponse = await getTags();
    tags = tagsResponse.data || [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data';
    console.error('Error fetching data:', e);
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">도시를 찾을 수 없습니다</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${countrySlug}`} className="text-blue-600 hover:underline text-sm">
            ← {city.attributes.country?.data?.attributes?.name || '국가'} 도시 목록으로
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* City Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {city.attributes.name} 여행 일정
          </h1>
          {city.attributes.description && (
            <div
              className="text-gray-600 mt-4"
              dangerouslySetInnerHTML={{ __html: city.attributes.description }}
            />
          )}
        </div>

        {/* Filter Bar - 카테고리 & 해시태그 필터 */}
        <FilterBar
          categories={categories}
          tags={tags}
          currentCategory={categorySlug}
          currentTags={tagSlugs}
          countrySlug={countrySlug}
          citySlug={citySlug}
        />

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">⚠️ {error}</p>
          </div>
        )}

        {/* Itineraries List */}
        {itineraries.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mt-6">
            <p className="text-blue-800 text-lg mb-2">
              {categorySlug || tagSlugs.length > 0
                ? '선택한 필터에 맞는 일정이 없습니다'
                : '이 도시에 등록된 일정이 없습니다'}
            </p>
            <p className="text-blue-600">다른 필터를 선택하거나 관리자 패널에서 일정을 추가해주세요</p>
          </div>
        )}

        {itineraries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary.id}
                href={`/${countrySlug}/${citySlug}/${itinerary.attributes.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                {itinerary.attributes.coverImage?.data && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={getStrapiMediaUrl(itinerary.attributes.coverImage.data.attributes.url)}
                      alt={itinerary.attributes.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                {!itinerary.attributes.coverImage?.data && (
                  <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-6xl">📍</span>
                  </div>
                )}
                <div className="p-6">
                  {/* Category Badge */}
                  {itinerary.attributes.category?.data && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-3"
                      style={{
                        backgroundColor: itinerary.attributes.category.data.attributes.color || '#6B7280',
                      }}
                    >
                      {itinerary.attributes.category.data.attributes.icon}{' '}
                      {itinerary.attributes.category.data.attributes.name}
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                    {itinerary.attributes.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    {itinerary.attributes.durationDays}박 {itinerary.attributes.durationDays + 1}일
                  </p>

                  {itinerary.attributes.summary && (
                    <p className="text-gray-600 mt-3 line-clamp-2">{itinerary.attributes.summary}</p>
                  )}

                  {/* Tags */}
                  {itinerary.attributes.tags?.data && itinerary.attributes.tags.data.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {itinerary.attributes.tags.data.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          #{tag.attributes.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View Count */}
                  <div className="mt-4 text-xs text-gray-400">
                    👁️ {itinerary.attributes.viewCount || 0} views
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
