'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StrapiData, Review, getReviewsByItinerary, createReview, updateReview, deleteReview } from '@/lib/strapi';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import Link from 'next/link';

interface ReviewListProps {
  itineraryId: number;
}

type SortOption = 'latest' | 'likes' | 'rating';

export default function ReviewList({ itineraryId }: ReviewListProps) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<StrapiData<Review>[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const sortOptions = [
    { value: 'latest' as SortOption, label: '최신순' },
    { value: 'likes' as SortOption, label: '추천순' },
    { value: 'rating' as SortOption, label: '평점순' },
  ];

  const fetchReviews = async () => {
    try {
      let sort = 'createdAt:desc';
      if (sortBy === 'rating') {
        sort = 'rating:desc';
      }
      // Note: Sorting by likes requires custom logic since it's a relation count
      const response = await getReviewsByItinerary(itineraryId, sort);
      let fetchedReviews = response.data;

      // Manual sort by likes if needed
      if (sortBy === 'likes') {
        fetchedReviews = [...fetchedReviews].sort(
          (a, b) => b.attributes.likedBy.data.length - a.attributes.likedBy.data.length
        );
      }

      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [itineraryId, sortBy]);

  const handleCreateReview = async (data: { rating: number; content: string }) => {
    if (!token || !user) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      await createReview(token, {
        ...data,
        itinerary: itineraryId,
      });
      await fetchReviews();
    } catch (error) {
      throw error;
    }
  };

  const handleLike = async (reviewId: number, isLiked: boolean) => {
    if (!token || !user) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      const review = reviews.find((r) => r.id === reviewId);
      if (!review) return;

      const currentLikes = review.attributes.likedBy.data.map((u) => u.id);
      const newLikes = isLiked
        ? currentLikes.filter((id) => id !== user.id)
        : [...currentLikes, user.id];

      await updateReview(token, reviewId, newLikes);
      await fetchReviews();
    } catch (error) {
      console.error('Failed to update like:', error);
      alert('추천 처리에 실패했습니다.');
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!token) return;

    try {
      await deleteReview(token, reviewId);
      await fetchReviews();
    } catch (error) {
      throw error;
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.attributes.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">리뷰</h2>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{averageRating}</p>
            <p className="text-sm text-gray-600">평균 별점</p>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            <p className="text-sm text-gray-600">총 리뷰</p>
          </div>
        </div>
      </div>

      {/* Write Review */}
      {user ? (
        <ReviewForm onSubmit={handleCreateReview} />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-3">리뷰를 작성하려면 로그인이 필요합니다</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">정렬:</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">리뷰를 불러오는 중...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">아직 작성된 리뷰가 없습니다.</p>
          <p className="text-sm text-gray-500 mt-2">첫 번째 리뷰를 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onLike={handleLike}
              onDelete={user?.id === review.attributes.user.data?.id ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
