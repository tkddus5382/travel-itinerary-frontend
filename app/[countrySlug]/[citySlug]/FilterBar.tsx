'use client';

import { useRouter } from 'next/navigation';
import { StrapiData, Category, Tag } from '@/lib/strapi';

interface FilterBarProps {
  categories: StrapiData<Category>[];
  tags: StrapiData<Tag>[];
  currentCategory?: string;
  currentTags: string[];
  countrySlug: string;
  citySlug: string;
}

export default function FilterBar({
  categories,
  tags,
  currentCategory,
  currentTags,
  countrySlug,
  citySlug,
}: FilterBarProps) {
  const router = useRouter();

  const updateFilters = (newCategory?: string, newTags?: string[]) => {
    const params = new URLSearchParams();
    if (newCategory) params.set('category', newCategory);
    if (newTags && newTags.length > 0) params.set('tags', newTags.join(','));
    const queryString = params.toString();
    const newUrl = '/' + countrySlug + '/' + citySlug + (queryString ? '?' + queryString : '');
    router.push(newUrl);
  };

  const handleCategoryClick = (categorySlug: string) => {
    const newCategory = currentCategory === categorySlug ? undefined : categorySlug;
    updateFilters(newCategory, currentTags);
  };

  const handleTagClick = (tagSlug: string) => {
    const newTags = currentTags.includes(tagSlug)
      ? currentTags.filter((t) => t !== tagSlug)
      : [...currentTags, tagSlug];
    updateFilters(currentCategory, newTags);
  };

  const clearFilters = () => {
    router.push('/' + countrySlug + '/' + citySlug);
  };

  const hasFilters = currentCategory || currentTags.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">필터</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 underline">
            필터 초기화
          </button>
        )}
      </div>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">카테고리</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = currentCategory === category.attributes.slug;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.attributes.slug)}
                className={"px-4 py-2 rounded-full font-semibold transition-all " + (isSelected ? 'text-white shadow-md scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                style={{ backgroundColor: isSelected ? category.attributes.color : undefined }}
              >
                {category.attributes.icon} {category.attributes.name}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">해시태그</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = currentTags.includes(tag.attributes.slug);
            return (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.attributes.slug)}
                className={"px-3 py-1.5 rounded-full text-sm font-medium transition-all " + (isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
              >
                #{tag.attributes.name}
              </button>
            );
          })}
        </div>
      </div>
      {hasFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-600">선택된 필터:</span>
            {currentCategory && (
              <button
                onClick={() => updateFilters(undefined, currentTags)}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
              >
                {categories.find((c) => c.attributes.slug === currentCategory)?.attributes.name}
                <span className="ml-1 hover:text-blue-900">✕</span>
              </button>
            )}
            {currentTags.map((tagSlug) => {
              const tag = tags.find((t) => t.attributes.slug === tagSlug);
              return tag ? (
                <button
                  key={tagSlug}
                  onClick={() => handleTagClick(tagSlug)}
                  className="inline-flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-300 transition-colors"
                >
                  #{tag.attributes.name}
                  <span className="ml-1 hover:text-gray-900">✕</span>
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
