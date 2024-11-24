import React from "react";

const WorkPageGrid = () => {
  const works = [
    {
      src: "/work-images/image1.png",
      alt: "Eco Jet",
      bgcolor: "bg-[#8B1818]", // deep red background
    },
    {
      src: "/work-images/image2.png",
      alt: "Safar",
      bgcolor: "bg-[#003B5C]", // deep blue background
    },
    {
      src: "/work-images/image3.png",
      alt: "Indo Canadian Transport Co.",
      bgcolor: "bg-[#2E1A47]", // purple background
    },
    {
      src: "/work-images/image4.png",
      alt: "Taiga",
      bgcolor: "bg-[#1B4D2E]", // green background
    },
    {
      src: "/work-images/image5.png",
      alt: "Machan",
      bgcolor: "bg-[#1C1C1C]", // dark background
    },
    {
      src: "/work-images/image6.png",
      alt: "Box Ongo",
      bgcolor: "bg-[#0A4B8F]", // royal blue background
    },
    {
        src: "/work-images/image7.png",
        alt:"Wise Monkeys",
    },
    {
        src:"/work-images/image8.png",
        alt:"pretty knots",
    }
  ];

  return (
    <section className="bg-[#ECE4DA] min-h-screen py-16">
        <div className="absolute bottom-72 md:top-96 left-0 w-full overflow-hidden">
        <svg
          className="w-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 20C240 50 480 80 720 80C960 80 1200 50 1440 20V120H0V20Z"
            fill="#ECE4DA"
          />
        </svg>
      </div>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {works.map((work, index) => (
            <div
              key={index}
              className={`relative overflow-hidden group cursor-pointer ${work.bgcolor}`}
              style={{ paddingBottom: "135%" }}
            >
              <img
                src={work.src}
                alt={work.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkPageGrid;