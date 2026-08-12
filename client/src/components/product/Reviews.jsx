import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../../lib/auth';
import api from '../../lib/api';
import { Trash2, X, Camera } from 'lucide-react';

const Reviews = ({ productId, product }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    fetchUserAndReviews();
  }, [productId]);

  const fetchUserAndReviews = async () => {
    try {
      const reviewsData = await api.reviews.getByProduct(productId);
      setReviews(reviewsData || []);

      const currentUser = getStoredUser();
      setUser(currentUser);

      if (currentUser && reviewsData) {
        const myReview = reviewsData.find(r => r.user_id === currentUser.id);
        if (myReview) {
          setExistingReview(myReview);
          setRating(myReview.rating);
          setComment(myReview.comment);
        } else {
          setExistingReview(null);
          setRating(5);
          setComment('');
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to write a review');
    
    setSubmitting(true);
    try {
      await api.reviews.submit({ product_id: productId, rating, comment });
      await fetchUserAndReviews();
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    try {
      await api.reviews.delete(existingReview.id);
      setExistingReview(null);
      setRating(5);
      setComment('');
      await fetchUserAndReviews();
      setShowForm(false);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Metrics
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });

  const getStarPercentage = (num) => {
    if (reviews.length === 0) return 0;
    return Math.round((starCounts[num] / reviews.length) * 100);
  };

  // Dynamic tags based on comments keywords
  const tagsList = [
    { label: 'Quality', count: reviews.filter(r => r.comment.toLowerCase().includes('quality') || r.comment.toLowerCase().includes('good')).length },
    { label: 'Fit', count: reviews.filter(r => r.comment.toLowerCase().includes('fit') || r.comment.toLowerCase().includes('size')).length },
    { label: 'Comfort', count: reviews.filter(r => r.comment.toLowerCase().includes('comfort') || r.comment.toLowerCase().includes('soft')).length },
    { label: 'Fabric', count: reviews.filter(r => r.comment.toLowerCase().includes('fabric') || r.comment.toLowerCase().includes('cloth')).length },
  ].filter(t => t.count > 0);

  const filteredReviews = reviews.filter(r => {
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Quality') return r.comment.toLowerCase().includes('quality') || r.comment.toLowerCase().includes('good');
    if (selectedTag === 'Fit') return r.comment.toLowerCase().includes('fit') || r.comment.toLowerCase().includes('size');
    if (selectedTag === 'Comfort') return r.comment.toLowerCase().includes('comfort') || r.comment.toLowerCase().includes('soft');
    if (selectedTag === 'Fabric') return r.comment.toLowerCase().includes('fabric') || r.comment.toLowerCase().includes('cloth');
    return true;
  });

  if (loading) return <div className="py-4 text-center text-gray-400">Loading reviews...</div>;

  return (
    <div className="mt-16 border-t border-gray-100 dark:border-neutral-900 pt-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Column: Summary and distribution */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer reviews</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-amber-500 text-lg">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(averageRating) ? 'opacity-100' : 'opacity-20'}>★</span>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{averageRating} out of 5</span>
            </div>
            <p className="text-xs text-gray-550 mt-1">{reviews.length} global ratings</p>
          </div>

          {/* Star progress rows */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((num) => {
              const pct = getStarPercentage(num);
              return (
                <div key={num} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-gray-655 dark:text-neutral-450 font-semibold hover:underline cursor-pointer">{num} star</span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-neutral-900 rounded border border-gray-200/50 dark:border-neutral-800 overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-semibold">{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Write Review Block */}
          <div className="border-t border-gray-100 dark:border-neutral-900 pt-6 space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Review this product</h4>
            <p className="text-xs text-gray-500 leading-normal">Share your thoughts with other customers</p>
            {user ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full h-9 border border-gray-300 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900 rounded-full text-xs font-bold transition-all text-gray-800 dark:text-white"
              >
                {existingReview ? 'Edit your review' : 'Write a product review'}
              </button>
            ) : (
              <div className="text-xs text-gray-400 italic">Please login to write a review.</div>
            )}
          </div>
        </div>

        {/* Right Columns: Review List */}
        <div className="lg:col-span-2 space-y-6">
          {tagsList.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Customers say</h4>
              <p className="text-xs text-gray-555 leading-relaxed">
                Customers find the apparel fabric to be comfortable and soft, noting how it matches the fit and brand style guide correctly.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold pt-1">
                <button
                  onClick={() => setSelectedTag('All')}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    selectedTag === 'All'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-605 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  All ({reviews.length})
                </button>
                {tagsList.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => setSelectedTag(tag.label)}
                    className={`px-3 py-1 rounded-full border transition-all ${
                      selectedTag === tag.label
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-605 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {tag.label} ({tag.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-neutral-900 pt-6">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Top reviews</h4>
            <div className="space-y-6">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-neutral-900 last:border-0 pb-6 last:pb-0 space-y-2.5">
                    
                    {/* User info */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-bold text-xs uppercase flex items-center justify-center">
                        {(review.user_email?.charAt(0) || 'U')}
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {review.user_email?.split('@')[0] || 'User'}
                      </span>
                    </div>

                    {/* Rating row */}
                    <div className="flex items-center gap-2">
                      <div className="text-amber-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-20'}>★</span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {review.rating >= 4 ? 'Verified Quality' : 'Fit Verification'}
                      </span>
                    </div>

                    {/* Date and verified label */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-semibold">
                      <span>Reviewed on {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="text-gray-355">•</span>
                      <span className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-wider text-[9px]">Verified Purchase</span>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-gray-655 dark:text-neutral-350 leading-relaxed font-medium">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-455 py-2">No reviews match the selected tag filter.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Modal dialog box */}
      {user && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-gray-150 dark:border-neutral-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-[scaleIn_0.2s_ease-out] relative my-8">
            {/* Close Button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header: How was the item? */}
            <div className="flex items-center gap-3.5 border-b border-gray-100 dark:border-neutral-900 pb-4">
              {product?.image && (
                <img src={product.image} alt={product.name} className="w-12 h-16 object-cover rounded-lg border border-gray-100 dark:border-neutral-800 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">How was the item?</h4>
                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{product?.name || "Product Review"}</p>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Select Rating</label>
                <div className="flex gap-1.5 text-3xl text-amber-500">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className={`hover:scale-110 transition-transform ${num <= rating ? 'opacity-100' : 'opacity-25'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Write a review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3.5 text-xs bg-gray-50/50 dark:bg-neutral-900 border border-gray-250 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-all placeholder-gray-400 font-semibold"
                  rows="4"
                  placeholder="What should other customers know?"
                  required
                />
              </div>

              {/* Share Photo/Video mock */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Share a video or photo</label>
                <div className="border border-dashed border-gray-250 dark:border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-neutral-900 transition-all text-gray-450 dark:text-neutral-500">
                  <Camera size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Upload media</span>
                </div>
              </div>

              {/* Title your review mock input */}
              <div className="space-y-1.5 pb-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Title your review (required)</label>
                <input
                  type="text"
                  placeholder="What's most important to know?"
                  className="w-full px-3.5 h-10 text-xs bg-gray-50/50 dark:bg-neutral-900 border border-gray-250 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-all placeholder-gray-405 font-semibold"
                  defaultValue={rating >= 4 ? 'Verified Quality' : 'Fit Verification'}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-900">
                {existingReview ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 h-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete Review
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 h-10 border border-gray-300 dark:border-neutral-800 rounded-full text-xs font-bold hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 h-10 bg-amber-400 hover:bg-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-full transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
