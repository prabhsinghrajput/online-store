import { Link } from 'react-router-dom';
import {
  Heart,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  Package,
  Star,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const formatPrice = (value) => Number(value || 0).toLocaleString('en-IN');

const ProductCard = ({
  product,
  variant = 'default',
  showCategory = false,
  categoryName,
  showRating = false,
  showFlavorWeight = true,
  onRemove,
}) => {
  const { state, dispatch } = useCart();
  const { items: wishlistItems, dispatch: wishlistDispatch } = useWishlist();

  const cartItem = state.items.find((item) => item.id === product.id || item.id.startsWith(product.id + '-'));
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);
  const displayPrice = product.discounted_price || product.price;
  const hasDiscount = product.discounted_price && product.discounted_price < product.price;
  const isOutOfStock = Number(product.stock) <= 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discounted_price) / product.price) * 100)
    : 0;

  const isMinimal = variant === 'minimal';
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';
  const isWishlist = variant === 'wishlist';
  const isDefault = !isMinimal && !isCompact && !isFeatured && !isWishlist;
  const showStepper = cartItem && !isMinimal && !isWishlist;

  const getCartPayload = (p) => {
    if (p && p.weight) {
      try {
        const obj = JSON.parse(p.weight);
        if (obj && typeof obj === 'object') {
          const available = Object.entries(obj).find(([_, stock]) => Number(stock) > 0);
          if (available) {
            return {
              ...p,
              id: `${p.id}-${available[0]}`,
              weight: available[0],
              stock: Number(available[1])
            };
          }
        }
      } catch (e) {}
    }
    return p;
  };

  const formatSizes = (weightStr) => {
    if (!weightStr) return null;
    try {
      const obj = JSON.parse(weightStr);
      if (obj && typeof obj === 'object') {
        return Object.keys(obj).join(' • ');
      }
    } catch (e) {}
    return weightStr;
  };

  const rootClass = () => {
    if (isMinimal) {
      return 'group bg-white p-3 rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all h-full';
    }
    if (isCompact) {
      return `group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 h-full flex flex-col ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`;
    }
    if (isFeatured) {
      return 'group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between h-full relative';
    }
    if (isWishlist) {
      return 'group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col h-full';
    }
    return `group block relative bg-transparent transition-all duration-300 h-full flex flex-col ${isOutOfStock ? 'opacity-90' : ''}`;
  };

  const renderHeartButton = (position) => {
    const disabled = isOutOfStock && !isWishlist;
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          if (onRemove) onRemove(product.id);
          else wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
        }}
        aria-label={onRemove ? 'Remove from wishlist' : 'Toggle wishlist'}
        className={`${position} absolute z-20 rounded-full flex items-center justify-center shadow-md transition-colors ${
          onRemove
            ? 'w-8 h-8 bg-white/80 backdrop-blur-md text-red-500 hover:bg-red-50 hover:text-red-600'
            : `w-8 h-8 bg-white/80 backdrop-blur-md hover:bg-white ${disabled ? 'opacity-50 pointer-events-none' : ''}`
        }`}
      >
        {onRemove ? (
          <Trash2 size={16} />
        ) : (
          <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        )}
      </button>
    );
  };

  const renderCartControl = () => {
    if (isWishlist) {
      return (
        <button
          onClick={() => dispatch({ type: 'ADD_ITEM', payload: getCartPayload(product) })}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-gray-200"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      );
    }

    if (isMinimal) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: 'ADD_ITEM', payload: getCartPayload(product) });
          }}
          aria-label="Add to cart"
          className="w-6 h-6 bg-gray-950 text-white rounded-md flex items-center justify-center hover:bg-gray-800 text-xs font-bold"
        >
          +
        </button>
      );
    }

    if (isOutOfStock) {
      if (isCompact) {
        return (
          <button
            disabled
            className="px-3 py-1.5 text-[11px] font-bold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
          >
            SOLD
          </button>
        );
      }
      return (
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
          <Package size={18} />
        </div>
      );
    }

    if (showStepper) {
      const wrapClass = isCompact
        ? 'flex items-center bg-primary/5 border border-primary/20 rounded-lg overflow-hidden'
        : isFeatured
          ? 'flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden h-8'
          : 'flex items-center bg-gray-900 rounded-2xl p-1 gap-1';
      const btnClass = isCompact
        ? 'w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 font-bold text-sm'
        : isFeatured
          ? 'w-7 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-xs'
          : 'w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors font-bold';
      const countClass = isCompact
        ? 'w-6 h-7 flex items-center justify-center text-xs font-bold text-primary bg-white border-x border-primary/10'
        : isFeatured
          ? 'px-2 text-xs font-black text-gray-900 bg-white h-full flex items-center justify-center min-w-[24px]'
          : 'text-sm font-bold text-white w-4 text-center';

      return (
        <div className={wrapClass} onClick={(e) => e.preventDefault()}>
          <button
            onClick={(e) => {
              e.preventDefault();
              dispatch({ type: 'DECREASE_QUANTITY', payload: cartItem.id });
            }}
            aria-label="Decrease quantity"
            className={btnClass}
          >
            <Minus size={isCompact ? 10 : 12} strokeWidth={isDefault ? 3 : 2.5} />
          </button>
          <span className={countClass}>{cartItem.quantity}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              dispatch({ type: 'INCREASE_QUANTITY', payload: cartItem.id });
            }}
            aria-label="Increase quantity"
            className={btnClass}
          >
            <Plus size={isCompact ? 10 : 12} strokeWidth={isDefault ? 3 : 2.5} />
          </button>
        </div>
      );
    }

    if (isCompact) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: 'ADD_ITEM', payload: getCartPayload(product) });
          }}
          className="px-3 py-1.5 text-[11px] font-bold text-white bg-gray-900 rounded-lg shadow-md shadow-gray-200 hover:bg-gray-800 transition-all"
        >
          ADD
        </button>
      );
    }

    if (isFeatured) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: 'ADD_ITEM', payload: getCartPayload(product) });
          }}
          aria-label="Add to cart"
          className="bg-gray-100 text-gray-900 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:text-gray-950 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          dispatch({ type: 'ADD_ITEM', payload: getCartPayload(product) });
        }}
        aria-label="Add to cart"
        className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 hover:bg-gray-800 hover:-translate-y-1 transition-all"
      >
        <ShoppingBag size={18} strokeWidth={2.5} />
      </button>
    );
  };

  const cardContent = () => {
    if (isWishlist) {
      return (
        <>
          <Link
            to={`/products/${product.id}`}
            className="relative bg-gray-50/80 p-4 flex items-center justify-center aspect-square block"
          >
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {renderHeartButton('top-3 right-3')}
          </Link>
          <div className="p-4 flex flex-col flex-1">
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</h3>
              {product.weight && <p className="text-xs text-gray-550 dark:text-neutral-400 font-medium mb-3">{formatSizes(product.weight)}</p>}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-gray-900">₹{formatPrice(displayPrice)}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">₹{formatPrice(product.price)}</span>
                )}
              </div>
            </div>
            {renderCartControl()}
          </div>
        </>
      );
    }

    if (isMinimal) {
      return (
        <>
          <div className="bg-gray-50 p-2 rounded-xl flex items-center justify-center h-28">
            <img src={product.image} alt={product.name} className="max-h-full object-contain" />
          </div>
          <div className="mt-2 space-y-1">
            <h4 className="text-xs font-extrabold text-gray-900 line-clamp-1">{product.name}</h4>
            {product.weight && <p className="text-[9px] text-gray-450 dark:text-neutral-500 font-semibold">{formatSizes(product.weight)}</p>}
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-black text-gray-950">₹{formatPrice(displayPrice)}</span>
              {renderCartControl()}
            </div>
          </div>
        </>
      );
    }

    if (isFeatured) {
      return (
        <>
          <div className="relative bg-gray-50/50 p-6 flex items-center justify-center h-56 sm:h-64 w-full">
            {renderHeartButton('top-4 right-4')}
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-[#e52e2e] text-inverse text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="p-5 flex-grow flex flex-col justify-between border-t border-gray-50 bg-white">
            <div>
              {showCategory && categoryName && (
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">
                  {categoryName}
                </span>
              )}
              <h3 className="font-extrabold text-sm text-gray-900 leading-snug line-clamp-2 min-h-[40px]">
                {product.name}
              </h3>
              {showRating && (
                <div className="flex items-center gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-[#8bc34a] text-[#8bc34a]" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900">₹{formatPrice(displayPrice)}</span>
                {hasDiscount && (
                  <span className="text-[10px] text-gray-400 line-through font-semibold">
                    ₹{formatPrice(product.price)}
                  </span>
                )}
              </div>
              {renderCartControl()}
            </div>
          </div>
        </>
      );
    }

    if (isCompact) {
      return (
        <>
          <div className="relative bg-gray-50/80 p-4 flex items-center justify-center h-36 sm:h-40">
            {renderHeartButton('top-2 right-2')}
            <img
              src={product.image}
              alt={product.name}
              className={`max-h-full object-contain group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale' : ''}`}
            />
            {hasDiscount && !isOutOfStock && (
              <span className="absolute top-2 left-2 bg-red-500 text-inverse text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                {discountPercent}% OFF
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          <div className="p-3 space-y-1.5 flex flex-col flex-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight h-8 sm:h-10">
              {product.name}
            </h3>
            <div className="flex items-center justify-between gap-1 flex-wrap">
              {product.weight && <p className="text-[10px] text-gray-450 dark:text-neutral-450">{formatSizes(product.weight)}</p>}
              {product.brand && (
                <p className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {product.brand}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between pt-1 mt-auto">
              <div>
                <span className="text-sm font-bold text-gray-900">₹{formatPrice(displayPrice)}</span>
                {hasDiscount && (
                  <span className="text-[10px] text-gray-400 line-through ml-1">₹{formatPrice(product.price)}</span>
                )}
              </div>
              {renderCartControl()}
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
          {renderHeartButton('top-3 left-3')}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${isOutOfStock ? 'grayscale-[0.3]' : ''}`}
          />
          
          {isOutOfStock ? (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
              Sold out
            </span>
          ) : hasDiscount ? (
            <span className="absolute top-3 right-3 bg-black text-white text-[10px] font-black w-9 h-9 rounded-full flex items-center justify-center uppercase tracking-wider z-10 shadow-md">
              Sale
            </span>
          ) : null}

          {!isOutOfStock && (
            <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dispatch({ type: 'ADD_ITEM', payload: getCartPayload(product) });
                }}
                className="w-9 h-9 bg-black hover:bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
              >
                <ShoppingBag size={15} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
        <div className="pt-3 pb-1 space-y-1">
          <h3 className="text-sm font-bold text-gray-805 dark:text-neutral-200 line-clamp-1 tracking-wide group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-gray-900 dark:text-white">Rs. {formatPrice(displayPrice)} INR</span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 dark:text-neutral-500 line-through">
                Rs. {formatPrice(product.price)} INR
              </span>
            )}
          </div>
        </div>
      </>
    );
  };

  const inner = cardContent();
  const productLink = `/products/${product.id}`;

  if (isWishlist) {
    return <div className={rootClass()}>{inner}</div>;
  }

  return <Link to={productLink} className={rootClass()}>{inner}</Link>;
};

export default ProductCard;
