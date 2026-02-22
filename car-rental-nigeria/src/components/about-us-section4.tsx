"use client"

export function AboutUsSection4() {
  return (
    <section className="w-full overflow-hidden bg-white pt-4 pb-16">
      <div className="relative flex animate-slide-infinite hover:pause">
        {/* First set of text */}
        <div className="flex items-center space-x-8 whitespace-nowrap text-7xl sm:text-8xl lg:text-9xl font-medium text-black">
          <span>BRINGING</span>
          
          {/* Cloud SVG in circular background */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-gray-600" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
            </svg>
          </div>
          
          <span>COMFORT</span>
          <span>TO</span>
          <span>YOU</span>
          <span className="text-7xl sm:text-8xl lg:text-9xl">😘</span>
        </div>
        
        {/* Duplicate set for seamless loop */}
        <div className="flex items-center space-x-8 whitespace-nowrap text-7xl sm:text-8xl lg:text-9xl font-medium text-black ml-16">
          <span>BRINGING</span>
          
          {/* Cloud SVG in circular background */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-gray-600" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
            </svg>
          </div>
          
          <span>COMFORT</span>
          <span>TO</span>
          <span>YOU</span>
          <span className="text-7xl sm:text-8xl lg:text-9xl">😘</span>
        </div>
      </div>
      
    </section>
  )
}
