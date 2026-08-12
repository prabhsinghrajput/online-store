import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import ProductCard from './ProductCard';

const Recommended = ({ categoryId, currentProductId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const allProducts = await api.products.getAll();
        if (allProducts && Array.isArray(allProducts)) {
          // Filter same category, excluding current product
          let filtered = allProducts.filter(
            (p) => String(p.category_id) === String(categoryId) && String(p.id) !== String(currentProductId)
          );

          // If not enough from same category, fill with others
          if (filtered.length < 4) {
            const others = allProducts.filter(
              (p) => String(p.id) !== String(currentProductId) && String(p.category_id) !== String(categoryId)
            );
            filtered = [...filtered, ...others].slice(0, 4);
          } else {
            filtered = filtered.slice(0, 4);
          }

          setRecommendations(filtered);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      fetchRecommendations();
    }
  }, [categoryId, currentProductId]);

  if (loading) return <div className="py-8 text-center text-gray-400">Loading recommendations...</div>;
  if (recommendations.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-neutral-900">
      <h3 className="text-2xl md:text-3xl font-black text-center text-gray-900 dark:text-white mb-8">
        You might also like
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} variant="default" />
        ))}
      </div>
    </div>
  );
};

export default Recommended;
