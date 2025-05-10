'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProductType } from './types';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ProductBottomSheetProps {
  isOpen: boolean;
  product: ProductType | null;
  products: ProductType[]; // Add all products for navigation
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent) => void;
  onAddToCart?: (product: ProductType) => void;
  cartItems?: { id: string }[];
}

export const ProductBottomSheet: React.FC<ProductBottomSheetProps> = ({
  isOpen,
  product,
  products,
  onClose,
  onBackdropClick,
  onAddToCart,
  cartItems = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentProduct, setCurrentProduct] = useState<ProductType | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance for gesture detection (in px)
  const MIN_SWIPE_DISTANCE = 50;
  
  // Reference to the content div for touch events
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State for collapsible description
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Set the current product and find its index in the product array
  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
      
      // Reset description expanded state when product changes
      setIsDescriptionExpanded(false);
    }
  }, [product, products]);
  
  // Scroll to top when sheet opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen, currentProduct]);

  // Toggle description expand/collapse
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Navigate to the next product
  const goToNext = () => {
    if (products.length <= 1 || currentIndex >= products.length - 1) return;
    
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentProduct(products[nextIndex]);
  };

  // Navigate to the previous product
  const goToPrevious = () => {
    if (products.length <= 1 || currentIndex <= 0) return;
    
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentProduct(products[prevIndex]);
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;
    
    if (isLeftSwipe) {
      goToNext();
    }
    
    if (isRightSwipe) {
      goToPrevious();
    }
    
    // Reset touch coordinates
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Check if current product is in cart
  const isInCart = !!currentProduct && cartItems.some(item => item.id === currentProduct.id);

  if (!currentProduct && !isOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
        isOpen ? 'backdrop-blur-sm' : 'pointer-events-none'
      }`}
      style={{
        backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0)'
      }}
      onClick={onBackdropClick}
    >
      <div 
        ref={contentRef}
        className="bg-white rounded-t-xl w-full max-w-screen-md max-h-[80vh] overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out"
        style={{ 
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Bottom sheet header with close button */}
        <div className="flex justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex-1 pr-3">
            <h2 className="text-xl font-semibold text-gray-800 break-words">{currentProduct?.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Product navigation indicators */}
        {products.length > 1 && (
          <div className="bg-white px-6 py-2 flex justify-between items-center">
            <button
              onClick={goToPrevious}
              disabled={currentIndex <= 0}
              className={`p-2 rounded-full ${
                currentIndex <= 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FiChevronLeft size={20} />
            </button>
            
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {products.length}
            </span>
            
            <button
              onClick={goToNext}
              disabled={currentIndex >= products.length - 1}
              className={`p-2 rounded-full ${
                currentIndex >= products.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
        
        {/* Product details content */}
        <div className="p-6">
          {/* Product image */}
          {currentProduct?.image && (
            <div className="mb-6 flex justify-center">
              <img 
                src={currentProduct.image} 
                alt={currentProduct.title} 
                className="max-h-64 object-contain rounded-md"
                onError={(e) => {
                  console.log('Image failed to load:', currentProduct.image);
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
            </div>
          )}
        
          {/* Brand and SKU */}
          <div className="mb-4 flex justify-between items-center">
            <span className="text-gray-500 text-sm">SKU: {currentProduct?.id}</span>
            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {currentProduct?.brand}
            </span>
          </div>
          
          {/* Categories */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{currentProduct?.topCategory}</span>
              {currentProduct?.secondaryCategory && (
                <>
                  <span>•</span>
                  <span>{currentProduct?.secondaryCategory}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Product description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Description</h3>
            <p className={`text-gray-600 ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
              {currentProduct?.fullDescription}
            </p>
            {currentProduct?.fullDescription && currentProduct.fullDescription.length > 100 && (
              <button 
                onClick={toggleDescription}
                className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-800"
              >
                {isDescriptionExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
          
          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Features</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              {currentProduct?.features.split(/\s{2,}/).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          
          {/* Recommended Age */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Recommended Age</h3>
            <p className="text-gray-600">{currentProduct?.ageRange}</p>
          </div>

          {/* Price section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Price</h3>
            <p className="text-gray-600 text-xl font-bold text-blue-600">{currentProduct?.price}</p>
          </div>

          {currentProduct?.url && (
            <div className="mb-4">
              <a 
                href={currentProduct.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full block text-center font-medium py-3 px-4 rounded-lg transition border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                View on Website
              </a>
            </div>
          )}
          
          {/* Call to action button */}
          <button
            className={`w-full font-medium py-3 px-4 rounded-lg transition ${isInCart ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            disabled={isInCart}
            onClick={() => currentProduct && onAddToCart && onAddToCart(currentProduct)}
          >
            {isInCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
        
        {/* Swipe indicator at bottom */}
        {products.length > 1 && (
          <div className="p-4 flex justify-center">
            <div className="flex space-x-1">
              {products.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBottomSheet; 