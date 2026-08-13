import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Phone, User, Check, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    flatNo: '',
    society: ''
  });
  const { toast, confirm } = useToast();

  // Load addresses on mount
  useEffect(() => {
    const saved = localStorage.getItem('userAddresses');
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing userAddresses:', e);
      }
    }
  }, []);

  // Save addresses helper
  const saveAddresses = (updated) => {
    setAddresses(updated);
    localStorage.setItem('userAddresses', JSON.stringify(updated));
    // Trigger standard custom event to sync across other components like Cart
    window.dispatchEvent(new Event('addresses:updated'));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.flatNo || !newAddress.society) {
      toast('Please fill out all fields.', 'error');
      return;
    }

    const address = {
      id: Date.now(),
      ...newAddress
    };

    const updated = [...addresses, address];
    saveAddresses(updated);

    // Reset form
    setNewAddress({
      name: '',
      phone: '',
      flatNo: '',
      society: ''
    });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address?',
      confirmLabel: 'Delete',
      danger: true
    });
    if (!confirmed) return;
    const updated = addresses.filter(addr => addr.id !== id);
    saveAddresses(updated);
    toast('Address deleted', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">My Addresses</h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Manage your delivery destinations</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-sm"
          >
            <Plus size={14} />
            Add Address
          </button>
        )}
      </div>

      {/* Add Address Form Card */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-neutral-900">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Add New Address</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Recipient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Prabhjot Singh"
                value={newAddress.name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-neutral-950/20 border border-gray-200 dark:border-neutral-900 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={newAddress.phone}
                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-neutral-950/20 border border-gray-200 dark:border-neutral-900 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none dark:text-white transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Flat / House No. / Building Name</label>
              <input
                type="text"
                required
                placeholder="e.g. H.No. A-3, B.B.M.B. Colony"
                value={newAddress.flatNo}
                onChange={(e) => setNewAddress(prev => ({ ...prev, flatNo: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-neutral-950/20 border border-gray-200 dark:border-neutral-900 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none dark:text-white transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Society / Colony / Area / Landmark</label>
              <input
                type="text"
                required
                placeholder="e.g. Jamalpur, Ludhiana"
                value={newAddress.society}
                onChange={(e) => setNewAddress(prev => ({ ...prev, society: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-neutral-950/20 border border-gray-200 dark:border-neutral-900 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-bold hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-400 dark:text-neutral-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black dark:bg-white hover:bg-neutral-900 dark:hover:bg-neutral-100 text-white dark:text-black px-6 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      {addresses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/20 rounded-full flex items-center justify-center mx-auto text-purple-600">
            <MapPin size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">No Saved Addresses</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-500">You haven't saved any delivery addresses yet.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-5 relative group shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/25 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="flex-1 space-y-2 min-w-0 pr-8">
                  <div>
                    <h3 className="font-bold text-xs text-gray-800 dark:text-white uppercase tracking-wider truncate">
                      {addr.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1">
                      <Phone size={12} className="text-gray-400" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-neutral-400 font-medium">
                    <p>{addr.flatNo}</p>
                    <p>{addr.society}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => handleDelete(addr.id)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 dark:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                title="Delete address"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
