import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCommentDots, FaInfoCircle } from 'react-icons/fa';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

const InquireModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    subject: 'bug',
    message: '',
    email: '',
  });
  const [errors, setErrors] = useState({
    subject: '',
    message: '',
    email: '',
  });

  const modalVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.5 } },
  };

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
    if (showSuccess) setShowSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { subject: '', message: '', email: '' };

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Store feedback in Firebase
      await addDoc(collection(db, "feedback"), {
        ...formData,
        timestamp: new Date(),
      });

      // Send confirmation email
      await fetch('/api/send-feedback-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsModalOpen(false);
      }, 3000);

      // Reset form
      setFormData({ subject: 'bug', message: '', email: '' });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Feedback Icon/Button */}
      <motion.div
        className="fixed top-1/2 right-0 z-50 flex items-center bg-[#36302A] text-white rounded-l-lg cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleModalToggle}
        animate={{
          width: isHovered ? '110px' : '40px',
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          width: '50px',
          whiteSpace: 'nowrap',
        }}
      >
        <div className="flex items-center px-3 py-2 md:py-5">
          <FaCommentDots className="text-lg sm:text-xl" />
          <motion.span
            className="ml-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Feedback
          </motion.span>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed top-0 right-0 w-11/12 sm:w-3/4 lg:w-1/2 h-full bg-[#FAF4ED] shadow-lg z-50 overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-4 sm:p-6 flex flex-col gap-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-3xl font-serif text-[#36302A]">Feedback/Queries</h2>
                <button
                  className="text-[#86807A] hover:text-[#36302A] text-lg"
                  onClick={handleModalToggle}
                >
                  ✖
                </button>
              </div>

              {/* Form */}
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* Subject Select Box */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#36302A]">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-[#EFE7DD] border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A]"
                  >
                    <option value="bug">Report a Bug</option>
                    <option value="form-issue">Any Problem Occurred While Form Submission</option>
                    <option value="others">Others</option>
                  </select>
                  {errors.subject && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <FaInfoCircle /> {errors.subject}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#36302A]">
                    Email <span className='text-[#86807A] ml-1'>(required)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-[#EFE7DD] border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A]"
                    placeholder="Your email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <FaInfoCircle /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Message Textarea */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#36302A]">
                    Message <span className='text-[#86807A] ml-1'>(required)</span>
                  </label>
                  <div data-lenis-prevent>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-[#EFE7DD] border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A]"
                      placeholder="Type your message here..."
                    />
                  </div>
                  {errors.message && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <FaInfoCircle /> {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-[#36302A] text-white px-4 py-2 rounded-lg hover:bg-[#4b473f] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>

                {/* Success Message */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center bg-[#FAF4ED] bg-opacity-90"
                    >
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline"> Submitted your response!</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={handleModalToggle}
        ></div>
      )}
    </>
  );
};

export default InquireModal;