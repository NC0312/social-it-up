import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const RatingModal = ({ isOpen: externalIsOpen = true, onClose }) => {
    const [isOpen, setIsOpen] = useState(externalIsOpen);
    const [selectedRating, setSelectedRating] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(null);

    useEffect(() => {
        setIsOpen(externalIsOpen);
    }, [externalIsOpen]);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open && onClose) {
            onClose();
        }
    };

    const emojis = [
        { rating: 1, emoji: "😡", label: "Angry", color: "#FF4D4D" },
        { rating: 2, emoji: "😕", label: "Disappointed", color: "#FFA64D" },
        { rating: 3, emoji: "😐", label: "Neutral", color: "#FFD700" },
        { rating: 4, emoji: "🙂", label: "Satisfied", color: "#4DFF4D" },
        { rating: 5, emoji: "😍", label: "Love it!", color: "#4DB8FF" }
    ];

    const handleSubmit = () => {
        if (selectedRating) {
            console.log(`Submitted rating: ${selectedRating}`);
            setIsSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitted(false);
                setSelectedRating(null);
                if (onClose) onClose();
            }, 1500);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="fixed left-[50%] top-[50%] z-[1000] w-[95%] sm:w-[400px] md:w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-lg border-none bg-[#FAF4ED] p-4 sm:p-6 shadow-lg">
                <AlertDialogHeader className="mb-2 sm:mb-4">
                    <AlertDialogTitle className="text-center text-lg sm:text-xl md:text-2xl font-bold font-serif text-[#36302A]">
                        How was your experience?
                    </AlertDialogTitle>
                    <div className="text-center">
                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-4 sm:py-6 text-base sm:text-lg font-medium text-[#36302A]"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        times: [0, 0.2, 0.5, 0.8, 1],
                                    }}
                                >
                                    Thanks for your feedback! 🎉
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="py-4 sm:py-6">
                                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                                    {emojis.map((item, index) => (
                                        <motion.button
                                            key={item.rating}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => setSelectedRating(item.rating)}
                                            onMouseEnter={() => setHoveredRating(item.rating)}
                                            onMouseLeave={() => setHoveredRating(null)}
                                            className={`group relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300
                                                ${selectedRating === item.rating 
                                                    ? 'bg-[#36302A]/10 scale-110 shadow-lg' 
                                                    : 'hover:bg-[#36302A]/5'}`}
                                        >
                                            <AnimatePresence>
                                                {selectedRating === item.rating && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 0.15, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0 }}
                                                        className="absolute inset-0 rounded-lg"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                )}
                                            </AnimatePresence>
                                            
                                            <div className="flex flex-col items-center relative z-10">
                                                <motion.span
                                                    animate={{
                                                        scale: selectedRating === item.rating ? 1.2 : 1,
                                                        y: selectedRating === item.rating ? -4 : 0,
                                                    }}
                                                    className="text-2xl sm:text-3xl md:text-4xl transition-transform duration-200 group-hover:scale-110"
                                                >
                                                    {item.emoji}
                                                </motion.span>
                                                
                                                <motion.span
                                                    animate={{
                                                        opacity: selectedRating === item.rating || hoveredRating === item.rating ? 1 : 0.8,
                                                    }}
                                                    className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-[#36302A] font-medium"
                                                >
                                                    {item.label}
                                                </motion.span>
                                                
                                                {selectedRating === item.rating && (
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "100%" }}
                                                        className="absolute -bottom-2 h-0.5 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                )}
                                            </div>
                                            
                                            {hoveredRating === item.rating && selectedRating !== item.rating && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col gap-2 sm:gap-4 pt-2 sm:pt-4 w-full">
                    {!isSubmitted && (
                        <>
                            <AlertDialogCancel className="w-full bg-[#EFE7DD] text-[#36302A] hover:bg-[#36302A] hover:text-white text-sm sm:text-base">
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedRating}
                                className={`w-full bg-[#36302A] text-white hover:bg-[#36302A]/90 text-sm sm:text-base
                                    ${!selectedRating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Submit
                            </Button>
                        </>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default RatingModal;