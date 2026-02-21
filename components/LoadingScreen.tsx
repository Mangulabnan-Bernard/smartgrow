import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Growing your garden..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 safe-area-inset-top safe-area-inset-bottom pwa-full-height">
      <div className="text-center max-w-sm mx-auto px-6">
        {/* Animated plant icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full animate-bounce mb-6 flex items-center justify-center shadow-lg">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-green-600 rounded-t-full relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-green-500 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* SmartGrow branding */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-800 mb-2">SmartGrow</h1>
          <p className="text-sm text-green-600 font-medium">AI-Powered Plant Care</p>
        </div>
        
        {/* Loading message */}
        <div className="text-lg text-green-700 font-semibold mb-4 animate-pulse">
          {message}
        </div>
        
        {/* Progress bar */}
        <div className="w-40 h-2 bg-green-200 rounded-full overflow-hidden mx-auto">
          <div className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        
        {/* Status */}
        <div className="mt-4 text-sm text-green-600">
          🌱 Preparing your garden...
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
