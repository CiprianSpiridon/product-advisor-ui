'use client';

import { RefObject } from 'react';
import { MdOutlineShoppingBag } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import ReactMarkdown from 'react-markdown';
import Skeleton from 'react-loading-skeleton';
import { ProductType } from './types';
import ProductCarousel from './ProductCarousel';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  relatedProducts?: ProductType[];
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onProductClick: (product: ProductType) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  messagesEndRef,
  onProductClick
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-0 overscroll-contain">
      <div className="max-w-3xl mx-auto space-y-4 min-h-[100px]">
        {messages.map((message) => (
          <div key={message.id}>
            <div
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
            {message.sender === 'assistant' && message.relatedProducts && message.relatedProducts.length > 0 && (
              <div className="mt-2">
                <ProductCarousel
                  products={message.relatedProducts}
                  onProductClick={onProductClick}
                />
              </div>
            )}
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
  );
};

export default MessageList; 