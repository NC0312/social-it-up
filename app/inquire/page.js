'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, AnimatePresence } from 'framer-motion';
import CountrySelector from '../components/CountrySelector';
import { FaInfoCircle } from "react-icons/fa";
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';


const Inquire = () => {
  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
  };
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneDialCode, setPhoneDialCode] = useState('');
  const [phoneCodeError, setPhoneCodeError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [socials, setSocials] = useState('');
  const [socialsError, setSocialsError] = useState('');
  const [services,setServices] = useState('');
  const [servicesError , setServicesError] = useState('');
  const [messages,setMessages] = useState('');
  const [messagesError,setMessagesError] = useState('');
  const [websiteError, setWebsiteError] = useState('');
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
        className="text-5xl md:text-8xl font-serif font-medium text-[#36302A] whitespace-nowrap md:pt-32 px-5 py-7 md:py-20"
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

  const validateWebsite = () => {
    if (!website.trim()) {
      setWebsiteError('Website is required');
      return false;
    }
    setWebsiteError('');
    return true;
  }

  const validateMessages = () =>{
    if(!messages.trim()){
      setMessagesError('Message is required');
      return false;
    }
    setMessagesError('');
    return true;
  }

  const validateSocials = () => {
    if (!socials.trim()) {
      setSocialsError('Socials are required');
      return false;
    }
    setSocialsError('');
    return true;
  }

  const validateServices = () =>{
    if(!services.trim())
    {
      setServicesError('This field is required');
      return false;
    }
    setServicesError('');
    return true;
  }

  const validatePhoneCode = () => {
    if (!phoneDialCode.trim()) {
      setPhoneCodeError('Phone Code is required');
      return false;
    }
    setPhoneCodeError('');
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
    const isPhoneCodeValid = validatePhoneCode();
    const isSocialsValid = validateSocials();
    const isServicesValid = validateServices();
    const isMessagesValid = validateMessages();
  
    if (
      isPhoneValid &&
      isEmailValid &&
      isFirstNameValid &&
      isCompanyValid &&
      isWebsiteValid &&
      isPhoneCodeValid &&
      isSocialsValid &&
      isServicesValid &&
      isMessagesValid
    ) {
      try {
        // Store form data in Firestore
        // for(let i=0;i<50;i++)
        // {
          await addDoc(collection(db, "inquiries"), {
            firstName,
            lastName,
            email,
            phoneNumber,
            company,
            website,
            phoneDialCode,
            messages,
            socials,
            services,
            isChecked,
            timestamp: new Date(), // Add a timestamp for tracking
          });
        // }

        
        // Reset all fields
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setCompany("");
        setWebsite("");
        setPhoneDialCode("");
        setMessages("");
        setSocials("");
        setServices("");
        setIsChecked(false);
  
        // Show success message
        setFormSubmitMessage("Form submitted successfully!");
  
        // Clear success message after 3 seconds
        setTimeout(() => {
          setFormSubmitMessage("");
        }, 3000);
      } catch (error) {
        console.error("Error adding document to Firestore: ", error);
        setFormSubmitMessage("Failed to submit the form. Please try again later.");
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setFormSubmitMessage("");
        }, 3000);
      } finally {
        setIsSubmitting(false);
      }
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
        <motion.div
                                className="flex flex-col w-full md:w-1/2 relative"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
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
                  className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                />
                {firstNameError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle /> {firstNameError}</p>
                )}
              </div>

              <div className="flex flex-col w-full md:w-1/2 mt-3 md:mt-0">
                <label className="text-sm text-[#36302A]">Last Name</label>
                <input
                  name="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
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
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
              />
              {emailError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle/>{emailError}</p>
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
                  className={`text-sm mt-2 px-4 py-2 rounded-lg border ${message === 'Signed up successfully!'
                    ? 'text-green-700 bg-green-100 border-green-400'
                    : 'text-red-700 bg-red-100 border-red-400'
                    }`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="md:text-md pt-5 md:pt-2 text-[#36302A]">
              Phone <span className="text-sm text-[#86807A] ml-1">(required)</span>
            </p>

            <div className="flex items-center gap-4 py-0">
              {/* Country Selector */}
              <div className="flex-1">
                <CountrySelector
                  onChange={(dialCode) => setPhoneDialCode(dialCode)}
                />
                {/* Dial Code Error */}
                {phoneCodeError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle/> {phoneCodeError}</p>
                )}
              </div>

              {/* Phone Number Input */}
              <div className="flex-1">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                />
                {/* Phone Number Error */}
                {phoneError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm text-red-600 mt-2 flex items-center gap-1"
                  >
                    <FaInfoCircle/> {phoneError}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-col py-1">
              <label className="text-sm text-[#36302A] mb-1">
                Your Company/Brand&apos;s Name <span className="text-[#86807A] ml-1">(required)</span>
              </label>
              <input
                type="company"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (companyError) setCompanyError('');
                }}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
              />
              {companyError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle/> {companyError}</p>
              )}
            </div>

            <div className='flex flex-col py-1'>
              <label className='text-sm text-[#36302A] mb-1'>
                Your Website <span className="text-[#86807A] ml-1">(required)</span>
              </label>
              <input
                type='website'
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (websiteError) setWebsiteError('');
                }}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
              />{websiteError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle/> {websiteError}</p>
              )}
            </div>

            <div className='flex flex-col py-1'>
              <label className='text-sm text-[#36302A]'>
                Your Socials <span className='text-[#86807A] ml-1'>(required)</span>
              </label>
              <p className='text-sm text-[#86807A] pt-2 pb-1'>Instagram/Facebook/Threads/Youtube/TikTok/More (Show us everything!)</p>
              <input
                type='socials'
                value={socials}
                onChange={(e) => {
                  setSocials(e.target.value);
                  if (socialsError) setSocialsError('');
                }}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
              />{socialsError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle/> {socialsError}</p>
              )}
            </div>

            <div className='flex flex-col py-2'>
              <label className='text-sm text-[#36302A] mb-1'>
                What services are you interested in? <span className='text-[#86807A] ml-1'>(required)</span>
              </label>
              <input
                type='services'
                value={services}
                onChange={(e) => {
                  setServices(e.target.value);
                  if (servicesError) setServicesError('');
                }}
                className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
              />{servicesError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle/> {servicesError}</p>
              )}
            </div>

            <div className='flex flex-col py-2'>
              <label className='text-sm text-[#36302A] mb-1'>
                Message <span className='text-[#86807A] ml-1'>(required)</span>
              </label>
              <textarea
              type='messages'
              value={messages}
              onChange={(e)=>{
                setMessages(e.target.value);
                if(messagesError) setMessagesError('');
              }}
              className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
              />
              {messagesError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle/> {messagesError}</p>
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

            <motion.button
              type="submit"
              className="mt-5 md:mt-2 px-5 py-3 md:py-4 md:w-28 text-sm rounded-md md:rounded-md bg-[#36302A] text-white relative overflow-hidden"
              disabled={isSubmitting}
              whileHover={{
                scale: 1.05, // Slight scale-up on hover
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              whileTap={{
                scale: 0.95, // Slight tap effect
                transition: { duration: 0.2 },
              }}
            >
              <span className="relative z-10">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-white opacity-0"
                whileHover={{ opacity: 0.1 }} // Slight fade effect
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </form>
          </motion.div>
        </div>
        </div>
      
    

  );
};

export default Inquire;