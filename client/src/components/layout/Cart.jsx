// components/Cart.jsx
import React, { useState, useEffect } from 'react';
import { X, Clock, Info, Plus, MapPin, Package, ChevronDown, Navigation } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

// Add predefined societies
const AVAILABLE_SOCIETIES = [
  'Sushant Golf City',
  'Ansal API',
  'Gomti Nagar',
  'Indira Nagar',
  'Aashiana'
];

const Cart = ({ user }) => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  // Remove predefined address and start with empty array
  const [addresses, setAddresses] = useState([]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [showDonation, setShowDonation] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    flatNo: '',
    society: '',
    name: '',
    phone: ''
  });

  // Replace delivery and convenience charges with platform fee
  const platformFee = 9;
  const minimumOrderAmount = 100;

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending');

  // Load saved addresses when component mounts
  useEffect(() => {
    const savedAddresses = localStorage.getItem('userAddresses');
    if (savedAddresses) {
      const parsedAddresses = JSON.parse(savedAddresses);
      setAddresses(parsedAddresses);
      if (parsedAddresses.length > 0) {
        setSelectedAddress(parsedAddresses[0]);
      }
    }
  }, []);

  if (!state.isOpen) return null;

  const itemsTotal = state.items.reduce((sum, item) => sum + ((item.discounted_price || item.price) * item.quantity), 0);
  const grandTotal = itemsTotal + platformFee + tipAmount;
  const isOrderValid = itemsTotal >= minimumOrderAmount;

  const handleAddAddress = () => {
    if (!newAddress.flatNo || !newAddress.society || !newAddress.name || !newAddress.phone) {
      return;
    }

    const address = {
      id: Date.now(),
      ...newAddress
    };

    const updatedAddresses = [...addresses, address];

    // Update state
    setAddresses(updatedAddresses);
    setSelectedAddress(address);

    // Save to localStorage
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));

    // Reset form and close
    setNewAddress({
      flatNo: '',
      society: '',
      name: '',
      phone: ''
    });
    setIsAddingAddress(false);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) { // Limit to 10 digits
      setNewAddress({ ...newAddress, phone: value });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    if (!isOrderValid) {
      alert(`Minimum order amount is ₹${minimumOrderAmount}`);
      return;
    }

    try {
      if (!user) {
        dispatch({ type: 'CLOSE_CART' });
        navigate('/login');
        return;
      }

      setIsPlacingOrder(true);

      // 1. Insert order via API
      const orderData = await api.orders.create({
        items: state.items,
        shipping_address: `${selectedAddress.flatNo}, ${selectedAddress.society}${selectedAddress.landmark ? ', ' + selectedAddress.landmark : ''}, ${selectedAddress.area || ''}`,
        customer_name: selectedAddress.name,
        customer_phone: selectedAddress.phone,
        total_amount: grandTotal,
      });

      // 2. Clear cart and navigate
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'CLOSE_CART' });

      navigate('/order-confirmation', {
        state: {
          orderId: orderData.id,
          address: selectedAddress,
          items: [...state.items],
          totalAmount: grandTotal,
          orderEmail: user.email,
        }
      });

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. ' + (error.message || 'Please try again.'));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      alert('Location services are not supported by your browser');
      setLocationStatus('denied');
      setShowLocationModal(false);
      return;
    }

    try {
      // This will trigger the browser's native location permission prompt
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

      if (permissionStatus.state === 'granted') {
        // Location already permitted, get coordinates
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationStatus('granted');
            setShowLocationModal(false);
          },
          (error) => {
            console.error('Location error:', error);
            setLocationStatus('denied');
            setShowLocationModal(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else if (permissionStatus.state === 'prompt') {
        // Will show the native browser prompt
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationStatus('granted');
            setShowLocationModal(false);
          },
          (error) => {
            console.error('Location error:', error);
            setLocationStatus('denied');
            setShowLocationModal(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        // Permission denied
        setLocationStatus('denied');
        setShowLocationModal(false);
      }

      // Listen for permission changes
      permissionStatus.onchange = () => {
        if (permissionStatus.state === 'granted') {
          setLocationStatus('granted');
        } else {
          setLocationStatus('denied');
        }
      };
    } catch (error) {
      console.error('Permission error:', error);
      // Fallback to regular geolocation request
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('granted');
          setShowLocationModal(false);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationStatus('denied');
          setShowLocationModal(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" onClick={() => dispatch({ type: 'CLOSE_CART' })}>
      <div
        className="bg-gradient-to-b from-gray-50 to-white w-full md:w-[460px] h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">My Cart</h2>
              <p className="text-xs text-gray-400">{state.items.length} item{state.items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Empty Cart State */}
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-400">Add items to get started</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3">
                {state.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{item.weight}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-gray-900">₹{(item.discounted_price || item.price) * item.quantity}</span>
                        <div className="flex items-center bg-primary/5 border border-primary/20 rounded-xl overflow-hidden">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors font-bold"
                            onClick={() => dispatch({ type: 'DECREASE_QUANTITY', payload: item.id })}
                          >
                            −
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-primary bg-white border-x border-primary/10">
                            {item.quantity}
                          </span>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors font-bold"
                            onClick={() => dispatch({ type: 'INCREASE_QUANTITY', payload: item.id })}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold text-gray-700">Delivery Address</h3>
                </div>

                {!isAddingAddress ? (
                  <div className="p-3 space-y-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`rounded-xl p-3 cursor-pointer transition-all ${selectedAddress?.id === address.id
                          ? 'bg-primary/5 border-2 border-primary/30 shadow-sm'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedAddress?.id === address.id ? 'border-primary bg-primary' : 'border-gray-300'
                            }`}>
                            {selectedAddress?.id === address.id && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm text-gray-800">{address.name}</p>
                              {selectedAddress?.id === address.id && (
                                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold tracking-wide">
                                  SELECTED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{address.flatNo}, {address.society}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{address.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-primary border-2 border-dashed border-primary/20 rounded-xl hover:bg-primary/5 transition-all text-sm font-semibold mt-1"
                    >
                      <Plus size={16} />
                      Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={newAddress.phone}
                          onChange={handlePhoneChange}
                          maxLength={10}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                          {newAddress.phone.length}/10
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Flat / House No."
                        value={newAddress.flatNo}
                        onChange={(e) => setNewAddress({ ...newAddress, flatNo: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <div className="relative">
                        <select
                          value={newAddress.society}
                          onChange={(e) => setNewAddress({ ...newAddress, society: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                        >
                          <option value="">Select Society</option>
                          {AVAILABLE_SOCIETIES.map((society) => (
                            <option key={society} value={society}>{society}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddAddress}
                          className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:opacity-90 transition-all disabled:bg-gray-200 disabled:text-gray-400 text-sm font-semibold"
                          disabled={!newAddress.flatNo || !newAddress.society || !newAddress.name || newAddress.phone.length !== 10}
                        >
                          Save Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                  Bill Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Item Total</span>
                    <span className="font-medium text-gray-700">₹{itemsTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      Platform Fee
                      <Info size={12} className="text-gray-300" />
                    </span>
                    <span className="font-medium text-gray-700">₹{platformFee}</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">To Pay</span>
                  <span className="font-bold text-gray-800 text-lg">₹{grandTotal}</span>
                </div>
                {!isOrderValid && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <Info size={14} />
                    Add ₹{minimumOrderAmount - itemsTotal} more to place order (min ₹{minimumOrderAmount})
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Bar */}
        {state.items.length > 0 && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4">
            <button
              disabled={!selectedAddress || !isOrderValid}
              onClick={handlePlaceOrder}
              className={`w-full py-3.5 rounded-2xl flex items-center justify-between px-5 font-semibold transition-all duration-300 ${selectedAddress && isOrderValid
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5'
                : !user ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <span className="text-lg">₹{grandTotal}</span>
              <span className="flex items-center gap-2 text-sm">
                {!user
                  ? 'Sign In to Checkout'
                  : !selectedAddress
                    ? 'Select Address'
                    : !isOrderValid
                      ? `Add ₹${minimumOrderAmount - itemsTotal} more`
                      : 'Place Order'}
                <ChevronDown size={16} className="-rotate-90" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Order Processing Modal */}
      {isPlacingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5 max-w-sm w-full mx-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-green-100 rounded-full animate-spin border-t-green-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Processing Order</h3>
              <p className="text-sm text-gray-400">Please wait while we confirm your order...</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Enable Location</h3>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setLocationStatus('denied');
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Allow location access for better delivery service</p>
                <p className="text-xs text-gray-400 mt-1">This opens your browser's location permission</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setLocationStatus('denied');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={requestLocation}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Cart;