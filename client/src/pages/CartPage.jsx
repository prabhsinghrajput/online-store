import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  MapPin, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Info, 
  ChevronDown, 
  ArrowLeft,
  Check, 
  Loader2,
  Lock,
  AlertCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { getStoredUser } from '../lib/auth';

const AVAILABLE_SOCIETIES = [
  'Sushant Golf City',
  'Ansal API',
  'Gomti Nagar',
  'Indira Nagar',
  'Aashiana'
];

const CartPage = ({ user: propUser }) => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const [user, setUser] = useState(propUser || getStoredUser());
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    flatNo: '',
    society: '',
    name: '',
    phone: ''
  });

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const platformFee = 9;
  const minimumOrderAmount = 100;
  const freeShippingThreshold = 2499;

  useEffect(() => {
    setUser(propUser || getStoredUser());
  }, [propUser]);

  useEffect(() => {
    const handleAuth = () => {
      setUser(getStoredUser());
    };
    window.addEventListener('auth:changed', handleAuth);
    return () => window.removeEventListener('auth:changed', handleAuth);
  }, []);

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

  const itemsTotal = state.items.reduce((sum, item) => sum + ((item.discounted_price || item.price) * item.quantity), 0);
  const grandTotal = itemsTotal + platformFee;
  const isOrderValid = itemsTotal >= minimumOrderAmount;
  const isFreeShipping = itemsTotal >= freeShippingThreshold;

  const handleAddAddress = () => {
    if (!newAddress.flatNo || !newAddress.society || !newAddress.name || !newAddress.phone) {
      return;
    }

    const address = {
      id: Date.now(),
      ...newAddress
    };

    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);
    setSelectedAddress(address);
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));

    setNewAddress({
      flatNo: '',
      society: '',
      name: '',
      phone: ''
    });
    setIsAddingAddress(false);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
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
        navigate('/login');
        return;
      }

      setIsPlacingOrder(true);

      const formattedItems = state.items.map(item => {
        const baseProductId = item.id.includes('-') && item.id.split('-').length > 5
          ? item.id.split('-').slice(0, 5).join('-')
          : item.id;

        const formattedItem = {
          product_id: baseProductId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity)
        };

        if (item.discounted_price) {
          formattedItem.discounted_price = Number(item.discounted_price);
        }
        if (item.weight) {
          formattedItem.weight = String(item.weight);
        }
        if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
          formattedItem.image = item.image;
        }

        return formattedItem;
      });

      const orderData = await api.orders.create({
        items: formattedItems,
        shipping_address: `${selectedAddress.flatNo}, ${selectedAddress.society}`,
        customer_name: selectedAddress.name,
        customer_phone: selectedAddress.phone,
        total_amount: grandTotal,
      });

      dispatch({ type: 'CLEAR_CART' });

      navigate('/order-confirmation', {
        state: {
          orderId: orderData.id,
          address: selectedAddress,
          items: [...state.items],
          totalAmount: grandTotal,
          orderDate: new Date().toISOString(),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100/50 to-neutral-50 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 text-neutral-800 dark:text-zinc-100 py-12 px-4 md:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Breadcrumb / Progress Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-200/60 dark:border-zinc-800/80">
          <button 
            onClick={() => navigate('/products')} 
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white transition-all hover:-translate-x-1 group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Continue Shopping</span>
          </button>
          
          <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-zinc-500">
            <span className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-black">
              <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-[9px] font-bold">1</span>
              Bag
            </span>
            <ChevronRight size={12} className="text-neutral-350 dark:text-zinc-650" />
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full border border-neutral-300 dark:border-zinc-800 flex items-center justify-center text-[9px] font-medium">2</span>
              Address
            </span>
            <ChevronRight size={12} className="text-neutral-350 dark:text-zinc-650" />
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full border border-neutral-300 dark:border-zinc-800 flex items-center justify-center text-[9px] font-medium">3</span>
              Payment
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-tight mb-10 bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Shopping Bag</h1>

        {state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/30 rounded-3xl p-10 shadow-xl shadow-neutral-100/30 dark:shadow-none animate-[fadeIn_0.3s_ease-out]">
            <div className="w-24 h-24 bg-neutral-100 dark:bg-zinc-850 rounded-full flex items-center justify-center mb-8 relative">
              <ShoppingBag size={38} className="text-neutral-400 dark:text-zinc-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
            </div>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">Your Bag is Empty</h2>
            <p className="text-neutral-400 dark:text-zinc-500 text-sm max-w-sm mb-10 leading-relaxed">
              Explore our collections and discover dynamic streetwear items designed for self-expression.
            </p>
            <Link 
              to="/products" 
              className="bg-black hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-extrabold text-sm px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left Column: Items & Address */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Items Card */}
              <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/30 rounded-3xl overflow-hidden shadow-xl shadow-neutral-100/30 dark:shadow-none">
                <div className="p-6 border-b border-neutral-100 dark:border-zinc-800/40 flex items-center justify-between bg-white/40 dark:bg-zinc-900/10">
                  <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                    Items In Bag
                    <span className="px-2.5 py-0.5 text-xs bg-neutral-100 dark:bg-zinc-800 rounded-full font-extrabold">{state.items.length}</span>
                  </h2>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-zinc-800/30">
                  {state.items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-neutral-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300 relative group/item">
                      {/* Product Image wrapper with lift effect */}
                      <div className="w-24 h-24 bg-neutral-50 dark:bg-zinc-850 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-150 dark:border-zinc-800 transition-transform group-hover/item:scale-105 duration-350">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-contain p-1" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-lg line-clamp-1 group-hover/item:text-primary transition-colors">{item.name}</h3>
                        <span className="inline-block text-[10px] text-neutral-400 dark:text-zinc-550 mt-1.5 px-2 py-0.5 bg-neutral-100 dark:bg-zinc-800 rounded font-black tracking-widest uppercase">{item.weight}</span>
                        
                        <div className="flex items-baseline gap-2 mt-4">
                          <span className="font-black text-lg text-neutral-900 dark:text-white">₹{item.discounted_price || item.price}</span>
                          {item.discounted_price && (
                            <span className="text-xs text-neutral-400 line-through font-bold">₹{item.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Action controls */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:mt-0 mt-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-neutral-100 dark:border-zinc-800">
                        {/* Quantity Counter container with subtle shadow */}
                        <div className="flex items-center bg-neutral-100/80 dark:bg-zinc-850/80 border border-neutral-200/40 dark:border-zinc-800 rounded-2xl p-1">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all font-bold text-base shadow-sm active:scale-90"
                            onClick={() => dispatch({ type: 'DECREASE_QUANTITY', payload: item.id })}
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-black tracking-tight">
                            {item.quantity}
                          </span>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all font-bold text-base shadow-sm active:scale-90"
                            onClick={() => dispatch({ type: 'INCREASE_QUANTITY', payload: item.id })}
                          >
                            +
                          </button>
                        </div>

                        {/* Remove item button with modern red glow */}
                        <button 
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                          className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/30 rounded-3xl p-6 shadow-xl shadow-neutral-100/30 dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold flex items-center gap-2.5 tracking-tight">
                    <MapPin size={20} className="text-neutral-900 dark:text-white" />
                    Delivery Address
                  </h2>
                  {!isAddingAddress && addresses.length > 0 && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1 hover:opacity-80 transition-opacity border-b-2 border-neutral-900 dark:border-white pb-0.5"
                    >
                      <Plus size={14} /> Add New
                    </button>
                  )}
                </div>

                {!isAddingAddress ? (
                  addresses.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-neutral-200 dark:border-zinc-800/80 rounded-2xl bg-neutral-50/20 dark:bg-zinc-950/10">
                      <p className="text-sm text-neutral-400 dark:text-zinc-550 mb-5 font-medium">No saved addresses found</p>
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black font-extrabold text-xs px-6 py-3 rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-md"
                      >
                        <Plus size={14} /> Add First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => {
                        const isSelected = selectedAddress?.id === address.id;
                        return (
                          <div
                            key={address.id}
                            onClick={() => setSelectedAddress(address)}
                            className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${
                              isSelected
                                ? 'border-neutral-950 dark:border-zinc-500 bg-neutral-100/40 dark:bg-zinc-800/30 shadow-sm'
                                : 'border-neutral-200 dark:border-zinc-800/60 hover:border-neutral-300 dark:hover:border-zinc-700 bg-white/40 dark:bg-zinc-900/10'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-extrabold text-base text-neutral-900 dark:text-white">{address.name}</p>
                                <p className="text-xs text-neutral-400 dark:text-zinc-455 mt-1 font-semibold">{address.phone}</p>
                                <p className="text-xs text-neutral-500 dark:text-zinc-300 mt-3 font-semibold leading-relaxed">
                                  {address.flatNo}, {address.society}
                                </p>
                              </div>
                              
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                                  <Check size={12} className="text-white dark:text-zinc-100 stroke-[3px]" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="bg-neutral-50/50 dark:bg-zinc-950/20 p-6 rounded-2xl border border-neutral-100 dark:border-zinc-800/40 animate-[fadeIn_0.25s_ease-out]">
                    <h3 className="text-sm font-black tracking-tight mb-5 uppercase text-neutral-400">New Address Details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-800 transition-all font-semibold"
                        />
                        <div className="relative">
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={newAddress.phone}
                            onChange={handlePhoneChange}
                            maxLength={10}
                            className="w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-800 transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Flat / House No. / Building"
                          value={newAddress.flatNo}
                          onChange={(e) => setNewAddress({ ...newAddress, flatNo: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-800 transition-all font-semibold"
                        />
                        <div className="relative">
                          <select
                            value={newAddress.society}
                            onChange={(e) => setNewAddress({ ...newAddress, society: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-800 transition-all font-semibold"
                          >
                            <option value="">Select Locality / Society</option>
                            {AVAILABLE_SOCIETIES.map((society) => (
                              <option key={society} value={society}>{society}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="px-5 py-3 text-xs font-black border border-neutral-250 dark:border-zinc-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-all text-neutral-600 dark:text-zinc-350"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddAddress}
                          className="px-5 py-3 text-xs font-black bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                          disabled={!newAddress.flatNo || !newAddress.society || !newAddress.name || newAddress.phone.length !== 10}
                        >
                          Save Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Checkout Summary Card */}
            <div className="lg:sticky lg:top-28 space-y-6">
              
              <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/30 rounded-3xl p-6 shadow-xl shadow-neutral-100/30 dark:shadow-none">
                <h2 className="text-xl font-black mb-6 tracking-tight">Order Summary</h2>

                {/* Free shipping bar progress */}
                {!isFreeShipping ? (
                  <div className="mb-6 p-4 bg-neutral-50 dark:bg-zinc-950/40 rounded-2xl border border-neutral-200/40 dark:border-zinc-800/40">
                    <p className="text-xs font-bold text-neutral-500 dark:text-zinc-400 mb-2.5">
                      Add <span className="font-extrabold text-neutral-900 dark:text-white">₹{freeShippingThreshold - itemsTotal}</span> more for <span className="text-primary font-black uppercase">Free Shipping</span>
                    </p>
                    <div className="w-full bg-neutral-200 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-neutral-900 dark:bg-white h-full transition-all duration-500"
                        style={{ width: `${(itemsTotal / freeShippingThreshold) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Truck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Free Shipping Unlocked</p>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500 mt-0.5">Your delivery charge has been waived.</p>
                    </div>
                  </div>
                )}

                {/* Bill Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-neutral-500 dark:text-zinc-400">Bag Subtotal</span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{itemsTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-neutral-500 dark:text-zinc-400 flex items-center gap-1">
                      Platform Fee
                      <Info size={14} className="text-neutral-300 dark:text-zinc-650" />
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-neutral-500 dark:text-zinc-400">Delivery</span>
                    {isFreeShipping ? (
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">FREE</span>
                    ) : (
                      <span className="font-bold text-neutral-900 dark:text-white">₹99</span>
                    )}
                  </div>

                  <div className="border-t border-dashed border-neutral-200 dark:border-zinc-800 pt-5 mt-3 flex justify-between items-center">
                    <span className="font-black text-base">Grand Total</span>
                    <span className="font-black text-2xl text-neutral-900 dark:text-white">
                      ₹{grandTotal + (isFreeShipping ? 0 : 99)}
                    </span>
                  </div>
                </div>

                {/* Conditions / Alerts */}
                <div className="mt-6 space-y-3">
                  {!isOrderValid && (
                    <div className="flex items-start gap-2.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Minimum order amount is ₹{minimumOrderAmount}. Please add ₹{minimumOrderAmount - itemsTotal} more items to proceed.</span>
                    </div>
                  )}

                  {!selectedAddress && isOrderValid && (
                    <div className="flex items-start gap-2.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                      <Info size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-semibold">Please select or add a delivery address to place your order.</span>
                    </div>
                  )}
                </div>

                {/* Primary Checkout CTA */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || !isOrderValid || isPlacingOrder}
                  className={`w-full py-4.5 rounded-2xl font-black text-sm tracking-widest uppercase mt-6 flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    selectedAddress && isOrderValid && !isPlacingOrder
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100 shadow-xl shadow-neutral-900/10 dark:shadow-none'
                      : 'bg-neutral-100 dark:bg-zinc-800/80 text-neutral-400 dark:text-zinc-555 cursor-not-allowed border border-neutral-200/20'
                  }`}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : !user ? (
                    <span>Sign In to Checkout</span>
                  ) : !selectedAddress ? (
                    <span>Select Address</span>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Place Order</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[9px] text-neutral-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest mt-6">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Secure Checkout • SSL Encrypted</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
