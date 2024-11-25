'use client';
import Link from 'next/link';
import Image from 'next/image';
import { AiOutlineInstagram } from 'react-icons/ai';
import { HiLocationMarker } from 'react-icons/hi';
import { BsTelephoneFill } from 'react-icons/bs';
import { MdEmail } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center py-8 px-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Social It Up Logo"
          width={120}
          height={40}
          className="h-auto w-auto"
        />
      </div>

      {/* Navigation Links */}
      <nav className="mb-8">
        <ul className="hidden md:flex space-x-20">
          <li>
            <Link href="/about" className="hover:underline text-gray-800">
              About
            </Link>
          </li>
          <li>
            <Link href="/services" className="hover:underline text-gray-800">
              Services
            </Link>
          </li>
          <li>
            <Link href="/work" className="hover:underline text-gray-800">
              Work
            </Link>
          </li>
          <li>
            <Link href="/inquire" className="hover:underline text-gray-800">
              Inquire
            </Link>
          </li>
        </ul>

        {/* Mobile Navigation */}
        <ul className="flex flex-col space-y-4 md:hidden items-center">
          <li>
            <Link href="/about" className="hover:underline text-gray-800">
              About
            </Link>
          </li>
          <li>
            <Link href="/services" className="hover:underline text-gray-800">
              Services
            </Link>
          </li>
          <li>
            <Link href="/work" className="hover:underline text-gray-800">
              Work
            </Link>
          </li>
          <li>
            <Link href="/inquire" className="hover:underline text-gray-800">
              Inquire
            </Link>
          </li>
        </ul>
      </nav>

      {/* Instagram Icon */}
      <Link href="https://instagram.com/socialitup" target='_blank' className="mb-8">
        <AiOutlineInstagram className="w-6 h-6 text-gray-800 hover:text-gray-600" />
      </Link>

      {/* Contact Information */}
      <div className="flex flex-col items-center space-y-4 text-gray-800">
        <div className="flex items-center space-x-2">
          <HiLocationMarker className="w-5 h-5 text-pink-500" />
          <p>Chandigarh, India</p>
        </div>
        <div className="flex items-center space-x-2">
          <BsTelephoneFill className="w-4 h-4 text-pink-500" />
          <p>+91 7009690481</p>
        </div>
        <div className="flex items-center space-x-2">
          <MdEmail className="w-5 h-5 text-pink-500" />
          <p>thesocialitup@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;