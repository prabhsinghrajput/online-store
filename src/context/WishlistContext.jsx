import React, { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext();

const initialState = {
  items: []
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        // Remove if exists
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }
      // Add if doesn't exist
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: []
      };

    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      dispatch({ type: 'LOAD_WISHLIST', payload: JSON.parse(savedWishlist) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.items));
  }, [state.items]);

  const value = {
    state,
    dispatch,
    items: state.items,
    totalItems: state.items.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
