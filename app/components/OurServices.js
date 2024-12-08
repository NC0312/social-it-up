import { motion } from 'framer-motion';
import Link from 'next/link';
const OurServices = () => {
    return (
        <div className="w-full min-h-screen bg-[#FAF4ED]">
            <div className="container mx-auto relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center min-h-[600px]">
                    {/* Left Image Section */}
                    <div className="relative h-full w-full md:absolute md:left-0 md:w-1/2 lg:relative lg:w-full">
                        <div className="h-60 md:h-[600px] w-full">
                            <img
                                src="ourservices1.jpeg"
                                alt="Interior design with chair"
                                className="object-cover h-full w-full"
                            />
                        </div>
                    </div>

                    {/* Middle Content Section */}
                    <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-20 md:col-start-2 lg:col-auto">
                        <h2 className="text-4xl md:text-7xl font-serif font-medium text-[#36302A]">Our Services</h2>
                        <p className="text-[#36302A] max-w-md">
                            Not sure about where to start? Book a free strategy call with us,
                            and let&apos;s map out your future together!
                        </p>
                        <Link href="/inquire">
                        <button className="bg-[#36302A] text-[#F6F3EE] px-20 py-3 md:px-20 md:py-5 rounded-md md:rounded-xl transition-all duration-300 hover:bg-[#4A3F31]">
                            Book
                        </button>
                        </Link>
                    </div>

                    {/* Right Image Section */}
                    <div className="relative h-full w-full">
                        <div className="relative h-96 md:h-[600px] w-full overflow-hidden">
                            <div className="absolute inset-0 bg-gray-100 rounded-tl-full rounded-tr-full overflow-hidden">
                                <div className="relative h-full w-full flex items-center justify-center">
                                    <img
                                        src="/ourservices2.jpeg"
                                        alt="Phone display"
                                        className="object-cover w-full h-full rounded-tl-full rounded-tr-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurServices;