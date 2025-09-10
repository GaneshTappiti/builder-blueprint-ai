"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Star, Heart, Smile, Meh, ThumbsDown, Angry } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingSystemProps {
  value?: number;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

interface EmojiReactionProps {
  value?: '❤️' | '😊' | '😐' | '👎' | '😡';
  onReactionChange?: (reaction: '❤️' | '😊' | '😐' | '👎' | '😡') => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export const StarRating: React.FC<RatingSystemProps> = ({
  value = 0,
  onRatingChange,
  disabled = false,
  size = 'md',
  showLabel = true
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (rating: number) => {
    if (!disabled && onRatingChange) {
      onRatingChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoveredRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredRating(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isActive = rating <= (hoveredRating || value);
          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled}
              className={cn(
                "transition-colors duration-200",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110",
                isActive ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
              )}
            >
              <Star 
                className={cn(
                  sizeClasses[size],
                  isActive ? "fill-current" : ""
                )}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {value > 0 ? `${value}/5` : 'Rate this'}
        </span>
      )}
    </div>
  );
};

export const EmojiReactions: React.FC<EmojiReactionProps> = ({
  value,
  onReactionChange,
  disabled = false,
  showLabel = true
}) => {
  const reactions = [
    { emoji: '❤️', label: 'Love', icon: Heart, color: 'text-red-500' },
    { emoji: '😊', label: 'Like', icon: Smile, color: 'text-green-500' },
    { emoji: '😐', label: 'Neutral', icon: Meh, color: 'text-yellow-500' },
    { emoji: '👎', label: 'Dislike', icon: ThumbsDown, color: 'text-orange-500' },
    { emoji: '😡', label: 'Hate', icon: Angry, color: 'text-red-600' }
  ] as const;

  const handleReactionClick = (reaction: '❤️' | '😊' | '😐' | '👎' | '😡') => {
    if (!disabled && onReactionChange) {
      onReactionChange(reaction);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {reactions.map(({ emoji, label, icon: Icon, color }) => {
          const isActive = value === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => handleReactionClick(emoji)}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110",
                isActive ? "bg-primary/20 ring-2 ring-primary/30" : "hover:bg-muted"
              )}
              title={label}
            >
              <span className="text-lg">{emoji}</span>
            </button>
          );
        })}
      </div>
      {showLabel && value && (
        <span className="text-sm text-muted-foreground">
          {reactions.find(r => r.emoji === value)?.label}
        </span>
      )}
    </div>
  );
};

interface FeedbackRatingProps {
  rating?: number;
  emojiReaction?: '❤️' | '😊' | '😐' | '👎' | '😡';
  onRatingChange?: (rating: number) => void;
  onEmojiChange?: (reaction: '❤️' | '😊' | '😐' | '👎' | '😡') => void;
  disabled?: boolean;
  showBoth?: boolean;
}

export const FeedbackRating: React.FC<FeedbackRatingProps> = ({
  rating,
  emojiReaction,
  onRatingChange,
  onEmojiChange,
  disabled = false,
  showBoth = true
}) => {
  return (
    <div className="space-y-3">
      {showBoth && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Star Rating
          </label>
          <StarRating
            value={rating}
            onRatingChange={onRatingChange}
            disabled={disabled}
            size="md"
          />
        </div>
      )}
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Quick Reaction
        </label>
        <EmojiReactions
          value={emojiReaction}
          onReactionChange={onEmojiChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
