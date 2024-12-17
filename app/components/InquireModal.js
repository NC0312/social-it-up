import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCommentDots } from 'react-icons/fa';

const InquireModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.5 } },
  };

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <>
      {/* Feedback Icon/Button */}
      <motion.div
        className="fixed top-1/2 right-0 z-50 flex items-center bg-[#36302A] text-white px-3 py-2 rounded-l-lg cursor-pointer group lg:right-2"
        onClick={handleModalToggle}
        whileHover={{ x: -10 }}
      >
        <FaCommentDots className="text-lg sm:text-xl" />
        <span className="ml-2 text-sm hidden group-hover:block">Feedback</span>
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
                <h2 className="text-lg sm:text-xl font-serif text-[#36302A]">Feedback</h2>
                <button
                  className="text-[#86807A] hover:text-[#36302A] text-lg"
                  onClick={handleModalToggle}
                >
                  ✖
                </button>
              </div>

              {/* Form */}
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Form Submitted');
                  setIsModalOpen(false);
                }}
              >
                {/* Subject Select Box */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-[#36302A]"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    className="mt-1 block w-full px-3 py-2 bg-[#EFE7DD] border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A]"
                  >
                    <option value="bug">Report a Bug</option>
                    <option value="form-issue">
                      Any Problem Occurred While Form Submission
                    </option>
                    <option value="others">Others</option>
                  </select>
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[#36302A]"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    className="mt-1 block w-full px-3 py-2 bg-[#EFE7DD] border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A]"
                    placeholder="Type your message here..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-[#36302A] text-white px-4 py-2 rounded-lg hover:bg-[#4b473f]"
                >
                  Submit
                </button>
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
