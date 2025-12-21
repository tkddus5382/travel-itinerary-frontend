'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import { StrapiData, Review } from '@/lib/strapi';
import LikeAnimation from './LikeAnimation';

interface ReviewItemProps {
  review: StrapiData<Review>;
  currentUserId?: number;
  onLike: (reviewId: number, isLiked: boolean) => Promise<void>;
  onUpdate?: (reviewId: number, data: { rating: number; content: string }) => Promise<void>;
  onDelete?: (reviewId: number) => Promise<void>;
}

export default function ReviewItem({ review, currentUserId, onLike, onUpdate, onDelete }: ReviewItemProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const [editRating, setEditRating] = useState(review.attributes.rating);
  const [editContent, setEditContent] = useState(review.attributes.content);

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
      if (!isLiked) {
        setAnimationTrigger(prev => prev + 1);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditRating(review.attributes.rating);
    setEditContent(review.attributes.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditRating(review.attributes.rating);
    setEditContent(review.attributes.content);
  };

  const handleSaveEdit = async () => {
    if (!onUpdate) return;
    if (editContent.length < 10) {
      alert('리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(review.id, {
        rating: editRating,
        content: editContent,
      });
      setIsEditing(false);
    } catch (error) {
      alert('리뷰 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
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

  if (isEditing) {
    // Edit Mode
    return (
      <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">별점</label>
          <StarRating rating={editRating} interactive onChange={setEditRating} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">리뷰 내용</label>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
            minLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="리뷰 내용 (최소 10자)"
          />
          <p className="text-xs text-gray-500 mt-1">{editContent.length}자</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveEdit}
            disabled={isSaving || editContent.length < 10}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  // Normal Display Mode
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
          {isOwnReview && (
            <div className="flex gap-2 mt-1">
              {onUpdate && (
                <button
                  onClick={handleEditClick}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  수정
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">{review.attributes.content}</p>

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`relative flex items-center gap-1.5 text-sm transition-colors ${
            isLiked
              ? 'text-red-600 font-semibold'
              : 'text-gray-600 hover:text-red-600'
          } disabled:opacity-50`}
        >
          <LikeAnimation trigger={animationTrigger} />
          <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
          <span>추천 {likesCount}</span>
        </button>
      </div>
    </div>
  );
}
