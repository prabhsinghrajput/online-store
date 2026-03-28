import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, editable = false, size = 20 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type={editable ? "button" : "submit"}
            className={`${editable ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
            onClick={() => editable && setRating(starValue)}
            onMouseEnter={() => editable && setHover(starValue)}
            onMouseLeave={() => editable && setHover(0)}
            disabled={!editable}
          >
            <Star
              size={size}
              className={`${
                starValue <= (hover || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-100 text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
