'use client';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, interactive = false, onChange, size = 'md' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex gap-1 ${sizeClasses[size]}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${!interactive && 'pointer-events-none'}`}
        >
          {star <= rating ? (
            <span className="text-yellow-400">★</span>
          ) : (
            <span className="text-gray-300">★</span>
          )}
        </button>
      ))}
    </div>
  );
}
