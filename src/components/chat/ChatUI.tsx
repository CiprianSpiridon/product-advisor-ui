'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import 'react-loading-skeleton/dist/skeleton.css';
import 'keen-slider/keen-slider.min.css';
import React from 'react';

import Header from './Header';
import MessageList, { Message } from './MessageList';
import InputArea from './InputArea';
import ProductCarousel from './ProductCarousel';
import ProductBottomSheet from './ProductBottomSheet';
import { ProductType, ApiResponse, ApiRelatedProduct } from './types';
import UserSetupBottomSheet, { UserData, ChildData } from './UserSetupBottomSheet';
import './styles.css';

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// User details bottom sheet/modal
const UserDetailsSheet: React.FC<{ 
  user: UserData | null, 
  isOpen: boolean, 
  onClose: () => void,
  onUpdateUser: (updatedUser: UserData) => void 
}> = ({ user, isOpen, onClose, onUpdateUser }) => {
  const [addingChild, setAddingChild] = useState(false);
  const [editingChildIdx, setEditingChildIdx] = useState<number | null>(null);

  const [currentChild, setCurrentChild] = useState<ChildData>({ 
    name: '', age: 0, gender: '', birthday: '' 
  });

  // Initialize editing for a child
  const startEditChild = (idx: number) => {
    if (!user) return;
    setCurrentChild({...user.children[idx]});
    setEditingChildIdx(idx);
    setAddingChild(false);
  };

  // Start adding a new child
  const startAddChild = () => {
    setCurrentChild({ name: '', age: 0, gender: '', birthday: '' });
    setAddingChild(true);
    setEditingChildIdx(null);
  };

  // Cancel editing/adding
  const cancelEdit = () => {
    setAddingChild(false);
    setEditingChildIdx(null);
  };

  // Handle child field changes
  const handleChildField = (field: keyof ChildData, value: string) => {
    setCurrentChild((prev: ChildData) => ({ ...prev, [field]: value }));
  };

  // Calculate age from birthday
  const getAgeFromBirthday = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Save the edited or new child
  const saveChildChanges = () => {
    if (!user) return;
    
    // Validate required fields
    if (!currentChild.name || !currentChild.gender || !currentChild.birthday) {
      return; // Don't save if missing required fields
    }
    
    // Calculate age from birthday
    const childWithAge = {
      ...currentChild,
      age: getAgeFromBirthday(currentChild.birthday)
    };
    
    const updatedChildren = [...user.children];
    
    if (editingChildIdx !== null) {
      // Update existing child
      updatedChildren[editingChildIdx] = childWithAge;
    } else {
      // Add new child
      updatedChildren.push(childWithAge);
    }
    
    // Update user data
    const updatedUser = {
      ...user,
      children: updatedChildren
    };
    
    onUpdateUser(updatedUser);
    cancelEdit();
  };

  // Remove a child
  const removeChild = (idx: number) => {
    if (!user) return;
    
    const updatedChildren = user.children.filter((_, index) => index !== idx);
    const updatedUser = {
      ...user,
      children: updatedChildren
    };
    
    onUpdateUser(updatedUser);
  };

  if (!user) return null;
  
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'backdrop-blur-sm' : 'pointer-events-none'}`}
      style={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-xl w-full max-w-screen-sm max-h-[90vh] overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out p-6 pt-8"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">My Details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 text-gray-800">
          <div className="mb-2"><span className="font-medium">Name:</span> {user.name}</div>
          <div className="mb-2"><span className="font-medium">User ID:</span> {user.id}</div>
        </div>
        
        <div className="text-gray-800">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium">Children:</div>
            <button 
              onClick={startAddChild}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
              disabled={addingChild || editingChildIdx !== null}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
          </div>
          
          {(addingChild || editingChildIdx !== null) && (
            <div className="border border-gray-200 rounded p-4 mb-4 mt-4">
              <h3 className="text-lg font-medium mb-3">{addingChild ? 'Add New Child' : 'Edit Child'}</h3>
              <form className="flex flex-col gap-3">
                <div>
                  <label className="text-sm text-gray-600 font-medium" htmlFor="edit-child-name">Name</label>
                  <input
                    id="edit-child-name"
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mt-1"
                    value={currentChild.name}
                    onChange={e => handleChildField('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium" htmlFor="edit-child-birthday">Date of Birth</label>
                  <input
                    id="edit-child-birthday"
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mt-1"
                    value={currentChild.birthday}
                    onChange={e => handleChildField('birthday', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium" htmlFor="edit-child-gender">Gender</label>
                  <select
                    id="edit-child-gender"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mt-1"
                    value={currentChild.gender}
                    onChange={e => handleChildField('gender', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select gender...</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={saveChildChanges}
                    className="flex-1 bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-200 text-gray-700 rounded px-4 py-2 font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {user.children && user.children.length > 0 ? (
            <ul className="space-y-3">
              {user.children.map((child, idx) => (
                <li key={idx} className="border border-gray-200 rounded p-3 text-gray-800">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-lg">{child.name}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditChild(idx)}
                        className="text-blue-600 p-1 rounded hover:bg-blue-50"
                        aria-label="Edit child"
                        disabled={addingChild || editingChildIdx !== null}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => removeChild(idx)}
                        className="text-red-600 p-1 rounded hover:bg-red-50"
                        aria-label="Remove child"
                        disabled={addingChild || editingChildIdx !== null}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div><span className="font-medium">Gender:</span> {child.gender}</div>
                  <div><span className="font-medium">DOB:</span> {child.birthday}</div>
                  <div><span className="font-medium">Age:</span> {child.age}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-800">No children added.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Cart item type
interface CartItem {
  id: string;
  title: string;
  price: string;
  brand: string;
  fullDescription: string;
}

// Cart bottom sheet/modal
const CartBottomSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
}> = ({ isOpen, onClose, cart, onRemove }) => (
  <div
    className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'backdrop-blur-sm' : 'pointer-events-none'}`}
    style={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0)' }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-t-xl w-full max-w-screen-sm max-h-[90vh] overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out p-6"
      style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">My Cart</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {cart.length === 0 ? (
        <div className="text-gray-700">Your cart is empty.</div>
      ) : (
        <ul className="space-y-4">
          {cart.map(item => (
            <li key={item.id} className="border border-gray-200 rounded p-4 flex flex-col gap-2 text-gray-800">
              <div className="font-medium text-lg">{item.title}</div>
              <div className="text-sm text-gray-600">{item.brand}</div>
              <div className="text-sm text-gray-600">{item.fullDescription}</div>
              <div className="font-bold text-blue-600">{item.price}</div>
              <button
                className="mt-2 self-end bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                onClick={() => onRemove(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default function ChatUI() {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your product assistant. Ask me about our products!',
      sender: 'assistant',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [viewportHeight, setViewportHeight] = useState('100vh');
  
  // User state
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [showUserDetails, setShowUserDetails] = React.useState(false);
  
  // Bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  // Cart state
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [showCart, setShowCart] = React.useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // On mount, check for user object in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setShowUserSetup(true);
    }
  }, []);

  // Set initial viewport height and handle resize
  useEffect(() => {
    const setHeight = () => {
      // Use the window.innerHeight for a more accurate viewport on mobile
      setViewportHeight(`${window.innerHeight}px`);
      // Update --vh CSS variable for use in CSS
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      
      // Improve keyboard handling on iOS/Safari
      if (document.activeElement?.tagName === 'INPUT') {
        // Allow some time for the keyboard to fully appear
        setTimeout(() => {
          // Scroll to the active input
          (document.activeElement as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    };

    // Set initial height
    setHeight();

    // Handle resize and orientation change
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);
    
    // Also handle on focus event for inputs
    const handleFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement) {
        // Delay to ensure keyboard is fully shown
        setTimeout(() => setHeight(), 300);
      }
    };
    
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load cart from localStorage for current user
  React.useEffect(() => {
    if (user) {
      const cartKey = `cart_${user.id}`;
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      } else {
        setCart([]);
      }
    }
  }, [user]);

  // Save cart to localStorage when it changes
  React.useEffect(() => {
    if (user) {
      const cartKey = `cart_${user.id}`;
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, user]);

  // Handle product click
  const handleProductClick = (product: ProductType) => {
    setSelectedProduct(product);
    setIsBottomSheetOpen(true);
  };

  // Close bottom sheet
  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
    // After animation completes, clear the selected product
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300); // Match duration-300 from the animation
  };

  // Handle click on backdrop to close the sheet
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the content
    if (e.target === e.currentTarget) {
      closeBottomSheet();
    }
  };

  // Handle user setup completion
  const handleUserSetupComplete = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('chatUser', JSON.stringify(userData));
    setShowUserSetup(false);
  };

  // Handle sending message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !user) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setRelatedProducts([]);
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}/chat`, {
        query: userMessage.content,
        user,
      });
      const assistantMessageContent = response.data.answer;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantMessageContent,
        sender: 'assistant',
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if (response.data.relatedProducts && Array.isArray(response.data.relatedProducts)) {
        const productsForCarousel = response.data.relatedProducts.map((product: ApiRelatedProduct) => {
          return {
            id: product.sku,
            title: product.name,
            price: 'N/A', 
            category: `${product.top_category} > ${product.secondary_category}`,
            brand: product.brand_default_store || 'N/A',
            features: product.features || 'No features available',
            ageRange: product.recom_age || 'All ages',
            topCategory: product.top_category || 'Uncategorized',
            secondaryCategory: product.secondary_category || '',
            fullDescription: product.description || 'No description available'
          };
        });
        setRelatedProducts(productsForCarousel);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to get an answer. Please try again later.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I couldn\'t process your question. Please try again later.',
        sender: 'assistant',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to cart handler
  const handleAddToCart = (product: ProductType) => {
    setCart(prev => {
      if (prev.find(item => item.id === product.id)) return prev; // Prevent duplicates
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          brand: product.brand,
          fullDescription: product.fullDescription,
        },
      ];
    });
  };

  // Remove from cart handler
  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Update user details
  const handleUpdateUser = (updatedUser: UserData) => {
    setUser(updatedUser);
    localStorage.setItem('chatUser', JSON.stringify(updatedUser));
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col bg-gray-50 chat-container"
      style={{ height: viewportHeight, maxHeight: viewportHeight }}
    >
      <Header 
        onUserClick={() => setShowUserDetails(true)} 
        onCartClick={() => setShowCart(true)} 
        cartItemCount={cart.length}
      />

      {/* User setup bottom sheet */}
      <UserSetupBottomSheet isOpen={showUserSetup} onComplete={handleUserSetupComplete} />

      <UserDetailsSheet 
        user={user} 
        isOpen={showUserDetails} 
        onClose={() => setShowUserDetails(false)} 
        onUpdateUser={handleUpdateUser} 
      />

      <CartBottomSheet isOpen={showCart} onClose={() => setShowCart(false)} cart={cart} onRemove={handleRemoveFromCart} />

      <div className="flex-1 overflow-hidden relative flex flex-col pt-16 pb-16">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ProductCarousel 
          products={relatedProducts}
          onProductClick={handleProductClick}
        />

        <InputArea 
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          inputRef={inputRef}
          isLoading={isLoading || showUserSetup}
        />
      </div>

      <ProductBottomSheet 
        isOpen={isBottomSheetOpen}
        product={selectedProduct}
        products={relatedProducts}
        onClose={closeBottomSheet}
        onBackdropClick={handleBackdropClick}
        onAddToCart={handleAddToCart}
        cartItems={cart}
      />
    </div>
  );
} 