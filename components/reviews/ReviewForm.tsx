'use client';

import { useState, FormEvent } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; content: string }) => Promise<void>;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (content.length < 10) {
      alert('리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, content });
      setRating(5);
      setContent('');
    } catch (error: any) {
      alert(error.message || '리뷰 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">리뷰 작성</h3>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          별점을 선택하세요
        </label>
        <StarRating rating={rating} interactive onChange={setRating} />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
          리뷰 내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={10}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="여행 일정에 대한 솔직한 리뷰를 남겨주세요 (최소 10자)"
        />
        <p className="text-xs text-gray-500 mt-1">{content.length}자</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || content.length < 10}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '작성 중...' : '리뷰 등록'}
      </button>
    </form>
  );
}
