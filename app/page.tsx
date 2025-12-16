import Link from 'next/link';
import { getCountries, getStrapiMediaUrl } from '@/lib/strapi';

export default async function HomePage() {
  let countries = [];
  let error = null;

  try {
    const response = await getCountries();
    countries = response.data || [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load countries';
    console.error('Error fetching countries:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            ✈️ 여행 일정 추천
          </h1>
          <p className="text-gray-600 mt-2">
            원하는 국가를 선택하고 맞춤형 여행 일정을 찾아보세요
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              ⚠️ {error}
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Strapi 서버가 실행 중인지 확인하세요 (http://localhost:1337)
            </p>
          </div>
        )}

        {!error && countries.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 text-lg mb-2">
              아직 등록된 국가가 없습니다
            </p>
            <p className="text-blue-600">
              Strapi 관리자 패널에서 국가를 추가해주세요
            </p>
            <a
              href="http://localhost:1337/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              관리자 패널 열기
            </a>
          </div>
        )}

        {countries.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              국가 선택
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countries.map((country) => (
                <Link
                  key={country.id}
                  href={`/${country.attributes.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  {country.attributes.imageUrl?.data && (
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img
                        src={getStrapiMediaUrl(country.attributes.imageUrl.data.attributes.url)}
                        alt={country.attributes.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {!country.attributes.imageUrl?.data && (
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-6xl">🌍</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {country.attributes.name}
                    </h3>
                    {country.attributes.nameEn && (
                      <p className="text-sm text-gray-500 mt-1">
                        {country.attributes.nameEn}
                      </p>
                    )}
                    {country.attributes.description && (
                      <div
                        className="text-gray-600 mt-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: country.attributes.description }}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-100 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>여행 일정 추천 사이트 | Powered by Strapi & Next.js</p>
        </div>
      </footer>
    </div>
  );
}
