'use client';

import { RefObject, FormEvent, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

interface InputAreaProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (e?: FormEvent) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  inputRef,
  isLoading
}) => {
  // Handle mobile keyboard adjustments
  useEffect(() => {
    // Track initial window height to detect keyboard
    const initialWindowHeight = window.innerHeight;
    
    const handleFocus = () => {
      // Mark body when keyboard is likely visible
      if (window.innerHeight < initialWindowHeight * 0.8) {
        document.body.classList.add('has-keyboard');
        if (document.querySelector('.chat-container')) {
          document.querySelector('.chat-container')?.classList.add('has-keyboard');
        }
        
        // Ensure header remains visible by scrolling to top first
        const headerElement = document.querySelector('.header-component');
        if (headerElement) {
          headerElement.classList.add('keyboard-active');
        }
      }
      
      // Small delay to allow the keyboard to appear
      setTimeout(() => {
        // Ensure the input is focused and visible
        if (inputRef.current) {
          // Set focus again to ensure keyboard stays open
          inputRef.current.focus();
          
          // Remove all automatic scrolling behavior - the browser's default will handle keeping 
          // the input visible when the keyboard appears, which is much less aggressive
        }
      }, 300);
    };
    
    const handleBlur = () => {
      // Reset body class when keyboard likely hidden
      document.body.classList.remove('has-keyboard');
      if (document.querySelector('.chat-container')) {
        document.querySelector('.chat-container')?.classList.remove('has-keyboard');
      }
      
      // Reset header state
      const headerElement = document.querySelector('.header-component');
      if (headerElement) {
        headerElement.classList.remove('keyboard-active');
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
      
      // Also handle window resize which happens when keyboard appears
      window.addEventListener('resize', handleFocus);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      }
      window.removeEventListener('resize', handleFocus);
    };
  }, [inputRef]);

  // Special iOS viewport management
  useEffect(() => {
    // Function to adjust viewport for iOS
    const adjustViewportForIOS = () => {
      // Check if device is likely iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
      
      if (isIOS) {
        // Get the existing viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        
        // When input is focused on iOS
        const handleIOSFocus = () => {
          // Update viewport to prevent zooming and ensure fixed elements stay visible
          if (viewportMeta) {
            viewportMeta.setAttribute('content', 
              'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
            );
          }
        };
        
        // When input loses focus
        const handleIOSBlur = () => {
          // Restore normal viewport
          if (viewportMeta) {
            viewportMeta.setAttribute('content', 
              'width=device-width, initial-scale=1, viewport-fit=cover'
            );
          }
        };
        
        // Add event listeners specifically for iOS
        const input = inputRef.current;
        if (input && isIOS) {
          input.addEventListener('focus', handleIOSFocus);
          input.addEventListener('blur', handleIOSBlur);
          
          return () => {
            input.removeEventListener('focus', handleIOSFocus);
            input.removeEventListener('blur', handleIOSBlur);
          };
        }
      }
    };
    
    // Set up the iOS-specific handlers
    const cleanupIOS = adjustViewportForIOS();
    
    return () => {
      if (cleanupIOS) cleanupIOS();
    };
  }, [inputRef]);

  return (
    <div className="border-t border-gray-200 p-4 bg-white fixed bottom-0 left-0 right-0 z-20 shadow-md">
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
  );
};

export default InputArea; 