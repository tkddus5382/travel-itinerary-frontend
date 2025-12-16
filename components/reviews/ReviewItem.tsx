'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import { StrapiData, Review } from '@/lib/strapi';

interface ReviewItemProps {
  review: StrapiData<Review>;
  currentUserId?: number;
  onLike: (reviewId: number, isLiked: boolean) => Promise<void>;
  onDelete?: (reviewId: number) => Promise<void>;
}

export default function ReviewItem({ review, currentUserId, onLike, onDelete }: ReviewItemProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const likesCount = review.attributes.likedBy.data.length;
  const isLiked = currentUserId
    ? review.attributes.likedBy.data.some((user) => user.id === currentUserId)
    : false;

  const isOwnReview = currentUserId === review.attributes.user.data?.id;

  const handleLikeClick = async () => {
    if (!currentUserId) {
      alert('로그인이 필요합니다');
      return;
    }

    setIsLiking(true);
    try {
      await onLike(review.id, isLiked);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await onDelete(review.id);
    } catch (error) {
      alert('리뷰 삭제에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {review.attributes.user.data?.attributes.username[0].toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {review.attributes.user.data?.attributes.username || '알 수 없는 사용자'}
              </p>
              <StarRating rating={review.attributes.rating} size="sm" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {new Date(review.attributes.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {isOwnReview && onDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-xs text-red-600 hover:text-red-700 mt-1 disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">{review.attributes.content}</p>

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked
              ? 'text-red-600 font-semibold'
              : 'text-gray-600 hover:text-red-600'
          } disabled:opacity-50`}
        >
          <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
          <span>추천 {likesCount}</span>
        </button>
      </div>
    </div>
  );
}
