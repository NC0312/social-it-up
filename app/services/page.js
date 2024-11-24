import React from 'react';

const services = () => {
  return (
    <div className="relative w-full h-screen overflow-x-hidden">
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/city-image.jpg')",
          filter: "brightness(0.95)"
        }}
      />
      
      {/* White Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.65)"
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center h-full">
        <h1 className="text-5xl md:text-9xl lg:text-9xl font-light text-[#2e2e2e] font-serif mb-8 text-center">
          Every Brand has a Story
        </h1>
        <p className="text-2xl pb-10 font-bold text-[#2e2e2e] mt-0 uppercase tracking-wider">
          MAKE IT STAND OUT.
        </p>
      </div>
    </div>
  );
};

export default services