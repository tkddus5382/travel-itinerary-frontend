import Link from 'next/link';
import { getCountryBySlug, getCitiesByCountry, getStrapiMediaUrl } from '@/lib/strapi';

export default async function CountryPage({ params }: { params: Promise<{ countrySlug: string }> }) {
  const { countrySlug } = await params;
  let country = null;
  let cities = [];
  let error = null;

  try {
    const countryResponse = await getCountryBySlug(countrySlug);
    if (countryResponse.data.length > 0) {
      country = countryResponse.data[0];
    }

    const citiesResponse = await getCitiesByCountry(countrySlug);
    cities = citiesResponse.data || [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data';
    console.error('Error fetching data:', e);
  }

  if (!country) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">국가를 찾을 수 없습니다</h1>
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
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← 국가 선택으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {country.attributes.name}
          </h1>
          {country.attributes.description && (
            <div
              className="text-gray-600 mt-4"
              dangerouslySetInnerHTML={{ __html: country.attributes.description }}
            />
          )}
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">⚠️ {error}</p>
          </div>
        )}

        {cities.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 text-lg">이 국가에 등록된 도시가 없습니다</p>
          </div>
        )}

        {cities.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">도시 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/${countrySlug}/${city.attributes.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  {city.attributes.imageUrl?.data && (
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img
                        src={getStrapiMediaUrl(city.attributes.imageUrl.data.attributes.url)}
                        alt={city.attributes.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {!city.attributes.imageUrl?.data && (
                    <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-6xl">🏙️</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {city.attributes.name}
                    </h3>
                    {city.attributes.nameEn && (
                      <p className="text-sm text-gray-500 mt-1">{city.attributes.nameEn}</p>
                    )}
                    {city.attributes.description && (
                      <div
                        className="text-gray-600 mt-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: city.attributes.description }}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
