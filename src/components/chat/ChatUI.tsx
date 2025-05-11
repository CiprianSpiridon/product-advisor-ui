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
import UserDetailsSheet from './UserDetailsSheet';
import CartBottomSheet, { CartItem } from './CartBottomSheet';
import { ProductType, ApiResponse, ApiRelatedProduct } from './types';
import UserSetupBottomSheet, { UserData } from './UserSetupBottomSheet';
import './styles.css';

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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
      
      // We don't need this - it's already handled in InputArea.tsx
      // and causes double-scrolling making the input go too high
      /*
      if (document.activeElement?.tagName === 'INPUT') {
        setTimeout(() => {
          (document.activeElement as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
      */
    };

    // Set initial height
    setHeight();

    // Handle resize and orientation change
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);
    
    // Also handle on focus event for inputs - Removing this too as it's handled in InputArea
    /*
    const handleFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement) {
        setTimeout(() => setHeight(), 300);
      }
    };
    
    document.addEventListener('focusin', handleFocusIn);
    */

    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
      //document.removeEventListener('focusin', handleFocusIn);
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
            price: product.price ? `AED ${product.price}` : 'N/A', 
            category: `${product.top_category} > ${product.secondary_category}`,
            brand: product.brand_default_store || 'N/A',
            features: product.features || 'No features available',
            ageRange: product.recom_age || 'All ages',
            topCategory: product.top_category || 'Uncategorized',
            secondaryCategory: product.secondary_category || '',
            fullDescription: product.description || 'No description available',
            image: product.image,
            url: product.url
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
          image: product.image
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