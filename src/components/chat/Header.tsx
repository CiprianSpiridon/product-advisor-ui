'use client';

import { MdOutlineShoppingBag } from 'react-icons/md';
import { FaUserCircle, FaShoppingCart } from 'react-icons/fa';

interface HeaderProps {
  title?: string;
  onUserClick?: () => void;
  onCartClick?: () => void;
  cartItemCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ title = "Mumz Advisor", onUserClick, onCartClick, cartItemCount = 0 }) => {
  return (
    <header className="bg-blue-600 text-white py-4 px-6 shadow-md fixed top-0 left-0 right-0 z-50 header-component">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdOutlineShoppingBag className="text-2xl" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              aria-label="View cart"
              onClick={onCartClick}
              className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <FaShoppingCart className="text-2xl" />
            </button>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
          <button
            aria-label="View my details"
            onClick={onUserClick}
            className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <FaUserCircle className="text-2xl" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 