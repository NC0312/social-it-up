import React from 'react';

const services = () => {
  return (
    <div className="relative w-full h-auto overflow-x-hidden">
      {/* Background Image Container */}
      <div 
        className="relative w-full h-screen"
      >
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
          <p className="text-xl md:text-2xl pb-10 font-bold text-[#2e2e2e] mt-0 uppercase tracking-wider">
            MAKE IT STAND OUT.
          </p>
        </div>
      </div>

      {/* Offerings Section */}
      <React.Fragment>
        <div className="container mx-auto py-48 px-16 md:px-24">
        <h2 className="text-3xl md:text-4xl lg:text-4xl font-semibold font-serif text-center text-[#2e2e2e] mb-16">
          Our Offerings
        </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tile 1 */}
            <div className="p-4 md:p-14 bg-[#ECE4DA] text-center">
              <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
                Branding
              </h3>
              <p className="text-[#36302A] text-sm">
              This is the foundation of your business identity. It&apos;s more than just a logo; it&apos;s how you communicate your values, mission, and personality to your audience. We help you craft a compelling brand narrative, develop a cohesive visual identity, and create memorable experiences that resonate with your target market. Together, we&apos;ll build a brand that stands out and fosters loyalty.
              </p>
            </div>

            {/* Tile 2 */}
            <div className="p-4 md:p-14 bg-[#ECE4DA] text-center">
              <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
              Digital Marketing
              </h3>
              <p className="text-[#36302A] text-sm">
              This encompasses a range of strategies designed to promote your brand online. From SEO and content marketing to social media campaigns and email outreach, we tailor our approach to maximize your reach and engagement. Our goal is to connect you with your audience, drive traffic to your website, and convert leads into customers whilst building a strong presence.
              </p>
            </div>

            {/* Tile 3 */}
            <div className="p-4 md:p-14 bg-[#ECE4DA] text-center">
              <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
              Website
              </h3>
              <p className="text-[#36302A] text-sm">
              This is where aesthetics meet functionality. We create visually stunning and user-friendly websites that not only look great but also perform seamlessly. Our designs are tailored to your specific needs, ensuring an intuitive user experience across all devices. From using website builders to building one from scratch, we deliver solutions that elevate your brand and drive results.
              </p>
            </div>

            {/* Tile 4 */}
            <div className="p-4 md:p-14 bg-[#ECE4DA] text-center">
              <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
              Finance Services
              </h3>
              <p className="text-[#36302A] text-sm">
              At Social It Up, we understand that strong financial management is the backbone of any successful business. In the Indian market, navigating financial regulations and ensuring compliance can be a daunting task. That&apos;s why we offer a range of comprehensive financial services tailored to meet the needs of businesses of all sizes.
              </p>
            </div>
          </div>
        </div>
      </React.Fragment>
    </div>
  );
};

export default services;
