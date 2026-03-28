import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import StarRating from './StarRating';
import { User, MessageSquare, Trash2 } from 'lucide-react';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    fetchUserAndReviews();
  }, [productId]);

  const fetchUserAndReviews = async () => {
    try {
      // Get Review Data
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(reviewsData || []);

      // Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Check if user already reviewed
      if (user && reviewsData) {
        const myReview = reviewsData.find(r => r.user_id === user.id);
        if (myReview) {
            setExistingReview(myReview);
            setRating(myReview.rating);
            setComment(myReview.comment);
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
      const reviewData = {
        product_id: productId,
        user_id: user.id,
        user_email: user.email,
        rating,
        comment
      };

      let error;
      if (existingReview) {
        // Update
        const { error: updateError } = await supabase
          .from('reviews')
          .update({ rating, comment })
          .eq('id', existingReview.id);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('reviews')
          .insert([reviewData]);
        error = insertError;
      }

      if (error) throw error;
      
      // Refresh
      await fetchUserAndReviews();
      if (!existingReview) setComment(''); // Clear only if new review

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
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', existingReview.id);
      
      if (error) throw error;
      setExistingReview(null);
      setRating(5);
      setComment('');
      fetchUserAndReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Calculate Average
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  if (loading) return <div className="py-4 text-center text-gray-400">Loading reviews...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="text-primary" size={24} />
        Customer Reviews
        <span className="text-sm font-normal text-gray-500 ml-2">({reviews.length})</span>
      </h3>

      {/* Summary Box */}
      <div className="flex items-center gap-6 mb-8 bg-gray-50/50 p-4 rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
          <StarRating rating={Math.round(averageRating)} size={16} />
          <div className="text-xs text-gray-500 mt-1">{reviews.length} ratings</div>
        </div>
        <div className="h-12 w-px bg-gray-200" />
        <div className="flex-1">
           {/* Simple distribution bars could go here */}
           <p className="text-sm text-gray-600">Share your thoughts with other customers</p>
        </div>
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-3">
            {existingReview ? 'Edit Your Review' : 'Write a Review'}
          </h4>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Rating</label>
            <StarRating rating={rating} setRating={setRating} editable={true} size={28} />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              rows="3"
              placeholder="What did you like or dislike?"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </button>
            
            {existingReview && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm text-center">
            Please login to write a review.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                        {review.user_email?.split('@')[0] || 'User'}
                        {review.user_id === user?.id && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">You</span>}
                    </p>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed pl-10">
                {review.comment}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm py-4">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default Reviews;
