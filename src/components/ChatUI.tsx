'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';
import { MdOutlineShoppingBag } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ReactMarkdown from 'react-markdown';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
}

// Updated structure for related products from the API
interface ApiRelatedProduct {
  sku: string;
  name: string;
  description: string;
  brand_default_store: string;
  features: string;
  recom_age: string;
  top_category: string;
  secondary_category: string;
}

// Keep the existing RelatedProduct for the UI but include new fields
interface RelatedProduct {
  id: string; // Will be mapped from sku
  title: string; // Will be mapped from name
  price: string; // Will default to "N/A" or be handled
  category: string; // Will use description or a placeholder
  brand: string; // From brand_default_store
  features: string; // From features
  ageRange: string; // From recom_age
  topCategory: string; // From top_category
  secondaryCategory: string; // From secondary_category
  fullDescription: string; // Full description text
}

// Simplified API response structure
interface ApiResponse {
  answer: string;
  relatedProducts: ApiRelatedProduct[];
}

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
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RelatedProduct | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    slides: {
      perView: 'auto',
      spacing: 16,
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle sending message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputMessage.trim()) return;
    
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
      const response = await axios.post<ApiResponse>(`${API_URL}/ask`, {
        question: userMessage.content,
      });
      
      // Handle the direct response structure
      const assistantMessageContent = response.data.answer;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantMessageContent,
        sender: 'assistant',
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Map API products to UI products if available
      if (response.data.relatedProducts && Array.isArray(response.data.relatedProducts)) {
        const productsForCarousel = response.data.relatedProducts.map((product) => {
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

  // Handle product click
  const handleProductClick = (product: RelatedProduct) => {
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

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="flex items-center gap-2">
          <MdOutlineShoppingBag className="text-2xl" />
          <h1 className="text-xl font-semibold">Product Assistant</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'user' ? (
                        <AiOutlineUser className="text-lg" />
                      ) : (
                        <MdOutlineShoppingBag className="text-lg" />
                      )}
                      <span className="font-medium">
                        {message.sender === 'user' ? 'You' : 'Assistant'}
                      </span>
                    </div>
                    <div className="markdown-content whitespace-pre-wrap prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MdOutlineShoppingBag className="text-lg" />
                      <span className="font-medium">Assistant</span>
                    </div>
                    <Skeleton count={3} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <h2 className="text-lg font-medium mb-3 text-gray-700 px-2">Related Products</h2>
              <div className="relative">
                <div ref={sliderRef} className="keen-slider">
                  {relatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="keen-slider__slide p-1"
                      style={{ minWidth: '200px', maxWidth: '200px' }}
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="border border-gray-200 rounded-lg p-3 h-full flex flex-col justify-between hover:shadow-md transition bg-white cursor-pointer">
                        <div>
                          <h3 className="font-medium text-sm text-gray-800 truncate" title={product.title}>{product.title}</h3>
                          <p className="text-xs text-gray-500 truncate" title={product.category}>{product.category}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-blue-600 text-sm">{product.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Slider Arrows - Optional */}
                {loaded && instanceRef.current && relatedProducts.length > ((instanceRef.current.options.slides as { perView?: number })?.perView || 1) && (
                  <>
                    <Arrow
                      left
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); instanceRef.current?.prev(); }}
                      disabled={currentSlide === 0}
                    />
                    <Arrow
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); instanceRef.current?.next(); }}
                      disabled={
                        currentSlide ===
                        instanceRef.current.track.details.slides.length - ((instanceRef.current.options.slides as { perView?: number })?.perView || 1)
                      }
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form
              onSubmit={handleSendMessage}
              className="max-w-3xl mx-auto flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about our products..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50"
                disabled={isLoading || !inputMessage.trim()}
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Product Details Bottom Sheet */}
      {(isBottomSheetOpen || selectedProduct) && (
        <div 
          className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
            isBottomSheetOpen ? 'backdrop-blur-sm' : 'pointer-events-none'
          }`}
          style={{
            backgroundColor: isBottomSheetOpen ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0)'
          }}
          onClick={handleBackdropClick}
        >
          <div 
            className="bg-white rounded-t-xl w-full max-w-screen-md max-h-[80vh] overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out"
            style={{ 
              transform: isBottomSheetOpen ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            {/* Bottom sheet header with close button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">{selectedProduct?.title}</h2>
              <button 
                onClick={closeBottomSheet}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Product details content */}
            <div className="p-6">
              {/* Brand and SKU */}
              <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-500 text-sm">SKU: {selectedProduct?.id}</span>
                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {selectedProduct?.brand}
                </span>
              </div>
              
              {/* Categories */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{selectedProduct?.topCategory}</span>
                  {selectedProduct?.secondaryCategory && (
                    <>
                      <span>•</span>
                      <span>{selectedProduct?.secondaryCategory}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Product description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Description</h3>
                <p className="text-gray-600">{selectedProduct?.fullDescription}</p>
              </div>
              
              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Features</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  {selectedProduct?.features.split(/\s{2,}/).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              {/* Recommended Age */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Recommended Age</h3>
                <p className="text-gray-600">{selectedProduct?.ageRange}</p>
              </div>
              
              {/* Call to action button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for Arrows (optional)
function Arrow(props: {
  disabled: boolean
  left?: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  const disabled = props.disabled ? " arrow--disabled" : ""
  return (
    <svg
      onClick={props.onClick}
      className={`arrow ${
        props.left ? "arrow--left" : "arrow--right"
      } ${disabled}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {props.left && (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      )}
      {!props.left && (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  )
} 