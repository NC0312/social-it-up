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

    if (isPhoneValid && isEmailValid && isFirstNameValid) {
      // Simulate form submission delay
      setTimeout(() => {
        // Reset all fields
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
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
      <div className="flex flex-col md:flex-row h-auto md:h-screen">
        <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 md:bottom-0 z-10 h-[25vh] md:h-full">
          <img
            src="/inquire-image.jpeg"
            alt="Inquire"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col w-full md:w-1/2 relative">
          <div className="w-full overflow-hidden py-0 md:py-0">
            <div className="flex whitespace-nowrap items-center md:items-start" ref={containerRef}>
              <motion.div className="flex" animate={controls} style={{ x }}>
                {textElements}
              </motion.div>
            </div>
          </div>

          <form className="px-6 md:px-10 w-full py-5 md:py-0 z-20 bg-[#FAF4ED]" onSubmit={handleSubmit}>
            <p className="text-[#36302A] text-sm md:text-lg">
              Interested in working together? Fill out some info and we will be in
              touch shortly! We can't wait to hear from you!
            </p>

            <p className="md:text-md pt-5 md:pt-10 text-[#36302A]">
              Name<span className="text-sm text-[#86807A] ml-1"> (required)</span>
            </p>

            <div className="flex flex-col md:flex-row md:gap-4 py-1 md:py-2">
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

            <div className="flex flex-col py-2">
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

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className={`text-sm mt-2 px-4 py-2 rounded-lg border ${
                    message === 'Signed up successfully!'
                      ? 'text-green-700 bg-green-100 border-green-400'
                      : 'text-red-700 bg-red-100 border-red-400'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="md:text-md pt-5 md:pt-10 text-[#36302A]">
              Phone <span className="text-sm text-[#86807A] ml-1">(required)</span>
            </p>
            <div className="flex items-center gap-4 py-2">
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

            <button
              type="submit"
              className="mt-5 md:mt-10 px-5 py-2 rounded-md bg-[#36302A] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inquire;