'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, AnimatePresence } from 'framer-motion';
import CountrySelector from '../components/CountrySelector';

const Inquire = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneDialCode, setPhoneDialCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website,setWebsite]=useState('');
  const[websiteError,setWebsiteError]=useState('');
  const [companyError, setCompanyError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitMessage, setFormSubmitMessage] = useState('');

  const controls = useAnimation();
  const x = useMotionValue(0);
  const text = 'Contact Us';
  const containerRef = useRef(null);

  const startAnimation = () => {
    const textWidth = containerRef.current?.firstChild?.offsetWidth || 2000;
    controls.start({
      x: [0, -textWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 35000,
          ease: 'linear',
        },
      },
    });
  };

  useEffect(() => {
    startAnimation();
  }, []);

  const textElements = [];
  const numberOfCopies = 8000;

  for (let i = 0; i < numberOfCopies; i++) {
    textElements.push(
      <span
        key={i}
        className="text-5xl md:text-8xl font-serif font-medium text-[#36302A] whitespace-nowrap md:pt-24 px-5 py-7"
      >
        {text}
      </span>
    );
  }

  const handleCheckboxChange = (e) => {
    const isCheckedNow = e.target.checked;
    setIsChecked(isCheckedNow);
    setMessage(isCheckedNow ? 'Signed up successfully!' : 'Uh ohh!!! why?? 😲');

    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  // const handlePhoneChange = (event) => {
  //   const value = event.target.value;
  //   setPhoneNumber(value);
  //   if (phoneError) setPhoneError('');
  // };

  const handlePhoneChange = (event) => {
    // Only allow digits, no special characters
    const value = event.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
    if (phoneError) setPhoneError('');
  };



  const validatePhoneNumber = () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }


    // Basic length check (8-15 digits)
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError('Phone number must be between 8 and 15 digits');
      return false;
    }

    // Check for repeating digits
    const repeatingDigitsRegex = /^(\d)\1+$/;
    if (repeatingDigitsRegex.test(phoneNumber)) {
      setPhoneError('Invalid phone number: cannot contain all repeating digits');
      return false;
    }

    // Check for sequential digits (optional, uncomment if needed)
    // const sequentialDigitsRegex = /^(?:(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){8,}|\d+$/;
    // if (sequentialDigitsRegex.test(phoneNumber)) {
    //   setPhoneError('Invalid phone number: cannot be sequential digits');
    //   return false;
    // }

    setPhoneError('');
    return true;
  };

  const validateEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailPattern.test(email)) {
      setEmailError('Invalid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateCompany = () => {
    if (!company.trim()) {
      setCompanyError('Company/Brand name is required');
      return false;
    }
    setCompanyError('');
    return true;
  }

  const validateWebsite = ()=>{
    if(!website.trim())
    {
      setWebsiteError('Website is required');
      return false;
    }
    setWebsiteError('');
    return true;
  }

  const validateFirstName = () => {
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      return false;
    }
    setFirstNameError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isPhoneValid = validatePhoneNumber();
    const isEmailValid = validateEmail();
    const isFirstNameValid = validateFirstName();
    const isCompanyValid = validateCompany();
    const isWebsiteValid = validateWebsite();

    if (isPhoneValid && isEmailValid && isFirstNameValid && isCompanyValid && isWebsiteValid) {
      // Simulate form submission delay
      setTimeout(() => {
        // Reset all fields
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
        setCompany('');
        setWebsite('');
        setIsChecked(false);

        // Show success message
        setFormSubmitMessage('Form submitted successfully!');

        // Clear success message after 3 seconds
        setTimeout(() => {
          setFormSubmitMessage('');
        }, 3000);

        setIsSubmitting(false);
      }, 1000);
    } else {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="relative w-full h-auto">
      <div className="flex flex-col md:flex-row items-stretch h-auto">
        {/* Image Section */}
        <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 md:bottom-0 z-10">
          <img
            src="/inquire-image.jpeg"
            alt="Inquire"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Section */}
        <div className="flex flex-col w-full md:w-1/2 relative">
          <div className="w-full overflow-hidden py-0 md:py-0">
            <div className="flex whitespace-nowrap items-center md:items-start" ref={containerRef}>
              <motion.div className="flex" animate={controls} style={{ x }}>
                {textElements}
              </motion.div>
            </div>
          </div>

          {/* Form */}
          <form
            className="px-6 md:px-10 w-full py-5 md:py-0 z-20 bg-[#FAF4ED] flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <p className="text-[#36302A] text-sm md:text-lg">
              Interested in working together? Fill out some info and we will be in touch shortly! We can&apos;t wait to hear from you!
            </p>

            <p className="md:text-md pt-5 md:pt-10 text-[#36302A]">
              Name<span className="text-sm text-[#86807A] ml-1"> (required)</span>
            </p>

            <div className="flex flex-col md:flex-row md:gap-4 py-1 md:py-0">
              <div className="flex flex-col w-full md:w-1/2">
                <label className="text-sm text-[#36302A]">First Name</label>
                <input
                  name="first-name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (firstNameError) setFirstNameError('');
                  }}
                  className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-1 rounded-lg w-full"
                />
                {firstNameError && (
                  <p className="text-sm text-red-600 mt-1">{firstNameError}</p>
                )}
              </div>

              <div className="flex flex-col w-full md:w-1/2 mt-3 md:mt-0">
                <label className="text-sm text-[#36302A]">Last Name</label>
                <input
                  name="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-1 rounded-lg w-full"
                />
              </div>
            </div>

            <div className="flex flex-col py-1">
              <label className="text-sm text-[#36302A]">
                Email <span className="text-[#86807A] ml-1">(required)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-1 rounded-lg w-full"
              />
              {emailError && (
                <p className="text-sm text-red-600 mt-1">{emailError}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="appearance-none h-4 w-4 border bg-[#EFE7DD] hover:border-[#36302A] rounded-lg cursor-pointer checked:bg-[#36302A] checked:text-white focus:ring-1 focus:ring-[#36302A]"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <label className="text-sm text-[#36302A]">
                Sign up for news and updates
              </label>
            </div>

            <p className="md:text-md pt-5 md:pt-2 text-[#36302A]">
              Phone <span className="text-sm text-[#86807A] ml-1">(required)</span>
            </p>
            <div className="flex items-center gap-4 py-0">
              <CountrySelector
                onChange={(dialCode) => setPhoneDialCode(dialCode)}
              />

              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-1 rounded-lg w-full"
              />
            </div>

            {phoneError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-sm text-red-600 mt-2"
              >
                {phoneError}
              </motion.div>
            )}

            <div className="flex flex-col py-1">
              <label className="text-sm text-[#36302A]">
                Your Company/Brand&apos;s Name <span className="text-[#86807A] ml-1">(required)</span>
              </label>
              <input
                type="company"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (companyError) setCompanyError('');
                }}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-1 rounded-lg w-full"
              />
              {companyError && (
                <p className="text-sm text-red-600 mt-1">{companyError}</p>
              )}
            </div>

            <div className='flex flex-col py-1'>
              <label className='text-sm text-[#36302A]'>
                Your Website <span className="text-[#86807A] ml-1">(required)</span>
              </label>
              <input
                type='website'
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (websiteError) setWebsiteError('');
                }}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-1 rounded-lg w-full"
              />{websiteError && (
                <p className="text-sm text-red-600 mt-1">{websiteError}</p>
              )}
            </div>

            <AnimatePresence>
              {formSubmitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm mt-2 px-4 py-2 rounded-lg border text-green-700 bg-green-100 border-green-400"
                >
                  {formSubmitMessage}
                </motion.div>
              )}
            </AnimatePresence>
            {/* <button
                type="submit"
                className="mt-5 md:mt-10 px-5 py-6 w-28 text-sm rounded-xl bg-[#36302A] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button> */}
            <motion.button
              type="submit"
              className="relative mt-5 md:mt-10 px-5 py-2 md:py-4 md:w-28 text-sm rounded-md md:rounded-md bg-gradient-to-r from-[#36302A] to-[#4A423B] text-white"
              disabled={isSubmitting}
              whileHover={{
                scale: 1.05, // Slightly emphasize the button
                rotate: 0.5, // Add a subtle tilt
                boxShadow: "0px 0px 10px 2px rgba(255, 255, 255, 0.6)", // Glow effect
                transition: {
                  duration: 0.4,
                  ease: "easeInOut",
                },
              }}
              whileTap={{
                scale: 0.95, // Add a press-in effect
                boxShadow: "0px 0px 5px 1px rgba(255, 255, 255, 0.3)", // Dim glow on tap
                transition: { duration: 0.2 },
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#4A423B] via-[#8A7965] to-[#36302A] animate-shimmer"></span>
              <span className="relative z-10">
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </span>
            </motion.button>

            <style jsx>{`
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
              .animate-shimmer {
                content: "";
                position: absolute;
                top: 0;
                left: -150%;
                width: 300%;
                height: 100%;
                background: linear-gradient(
                  90deg,
                  rgba(255, 255, 255, 0) 25%,
                  rgba(255, 255, 255, 0.3) 50%,
                  rgba(255, 255, 255, 0) 75%
                );
                animation: shimmer 2s infinite;
                z-index: 0;
              }
            `}</style>


          </form>
        </div>
      </div>
    </div>

  );
};

export default Inquire;