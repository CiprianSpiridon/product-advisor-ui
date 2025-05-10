'use client';

import { useState, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import { ProductType } from './types';
import { Arrow } from './Arrow';
import './styles.css';

interface ProductCarouselProps {
  products: ProductType[];
  onProductClick: (product: ProductType) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  onProductClick
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  
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

  useEffect(() => {
    // Reset the slider when products change
    instanceRef.current?.update();
  }, [products, instanceRef]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <h2 className="text-lg font-medium mb-3 text-gray-700 px-2">Recommended Products</h2>
      <div className="relative">
        <div ref={sliderRef} className="keen-slider">
          {products.map((product) => (
            <div
              key={product.id}
              className="keen-slider__slide p-1"
              style={{ minWidth: '200px', maxWidth: '200px' }}
              onClick={() => onProductClick(product)}
            >
              <div className="border border-gray-200 rounded-lg p-3 h-full flex flex-col justify-between hover:shadow-md transition bg-white cursor-pointer">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 truncate" title={product.title}>{product.title}</h3>
                  <p className="text-xs text-gray-500 truncate" title={product.category}>{product.category}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 h-8" title={product.fullDescription}>
                    {product.fullDescription}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-600 text-sm">{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slider Arrows */}
        {loaded && instanceRef.current && products.length > ((instanceRef.current.options.slides as { perView?: number })?.perView || 1) && (
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
  );
};

export default ProductCarousel; 