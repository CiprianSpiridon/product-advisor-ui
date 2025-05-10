'use client';

import React from 'react';
import { toast } from 'react-hot-toast';

// Cart item type
export interface CartItem {
  id: string;
  title: string;
  price: string;
  brand: string;
  fullDescription: string;
  image?: string;
}

interface CartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
}

const CartBottomSheet: React.FC<CartBottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onRemove 
}) => (
  <div
    className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'backdrop-blur-sm' : 'pointer-events-none'}`}
    style={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0)' }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-t-xl w-full max-w-screen-sm max-h-[90vh] overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out"
      style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">My Cart</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content Area */}
      <div className="px-6 pb-20">
        {cart.length === 0 ? (
          <div className="text-gray-700 mt-4">Your cart is empty.</div>
        ) : (
          <>
            <ul className="space-y-4 mb-6 mt-4">
              {cart.map(item => (
                <li key={item.id} className="border border-gray-200 rounded p-4 flex gap-4 text-gray-800">
                  {/* Image on the left */}
                  <div className="flex-shrink-0 w-24">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-24 object-contain rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100x100?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content on the right */}
                  <div className="flex-1 flex flex-col">
                    <div className="font-medium text-base">{item.title}</div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">{item.fullDescription}</p>
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-blue-600 text-sm">{item.price}</div>
                      <button
                        className="text-xs text-red-500 hover:text-red-700 transition flex items-center gap-1"
                        onClick={() => onRemove(item.id)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="feather feather-trash-2"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      
      {/* Sticky Total and Buy Now section */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 bg-white px-6 pt-4 pb-6 border-t border-gray-200 shadow-md z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-800">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              {calculateTotal(cart)}
            </span>
          </div>
          
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
            onClick={() => toast.error('Hold your horses, we don\'t have payments enabled :)', { position: 'bottom-center', duration: 3000 })}
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  </div>
);

// Helper function to calculate total price
const calculateTotal = (items: CartItem[]): string => {
  let total = 0;
  
  items.forEach(item => {
    // Extract numeric part from price string (e.g., "AED 100" -> 100)
    const priceMatch = item.price.match(/[\d.]+/);
    if (priceMatch) {
      total += parseFloat(priceMatch[0]);
    }
  });
  
  return `AED ${total.toFixed(2)}`;
};

export default CartBottomSheet; 