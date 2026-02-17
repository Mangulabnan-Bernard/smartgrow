import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading SmartGrow AI..." }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center z-50 safe-area-inset-top safe-area-inset-bottom pwa-full-height">
      <div className="text-center">
        {/* Animated plant icon */}
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-green-600 rounded-full animate-ping"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-green-600" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41 1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 animate-pulse">
            {message}
          </h2>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-100 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
