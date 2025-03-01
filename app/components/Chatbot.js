'use client'

import GeminiChatbot from './LiveChatBotUtility';
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { websiteInfo } from './WebsiteInfoUtility';

const ChatbotUI = ({ chatbot }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);
    const botref = useRef(null);
    const inputRef = useRef(null);

    const [windowSize, setWindowSize] = useState({
        width: 1024,
        height: 768,
    });

    useEffect(() => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (botref.current && !botref.current.contains(event.target)) {
                // Only minimize if the chat is open and not already minimized
                if (isOpen && !isMinimized) {
                    setIsMinimized(true);
                }
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isOpen, isMinimized]);

    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    const handleToggleChat = () => {
        if (!isOpen) {
            const newConversationId = chatbot.startConversation('user');
            setConversationId(newConversationId);
            setMessages([{
                type: 'bot',
                content: "Hello! 👋 I'm here to help. How can I assist you today?"
            }]);
        }
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        if (!conversationId) {
            const newConversationId = chatbot.startConversation('user');
            setConversationId(newConversationId);
        }

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setIsLoading(true);
        setIsTyping(true);

        if (typingTimeout) clearTimeout(typingTimeout);

        try {
            const currentConversationId = conversationId;
            const newTimeout = setTimeout(async () => {
                const response = await chatbot.sendMessage(currentConversationId, userMessage);

                if (response.error) {
                    setMessages(prev => [...prev, {
                        type: 'error',
                        content: 'Sorry, I encountered an error. Please try again.'
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        type: 'bot',
                        content: response.message
                    }]);
                }
                setIsTyping(false);
            }, 1000);

            setTypingTimeout(newTimeout);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Sorry, something went wrong. Please try again.'
            }]);
            setIsTyping(false);
        } finally {
            setIsLoading(false);
        }
    };

    const messageVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -10 }
    };

    // SSR-safe calculation of chat dimensions
    const isMobile = windowSize.width < 640;
    const isTablet = windowSize.width >= 640 && windowSize.width < 768;

    const chatWidth = isMobile
        ? 'w-[85vw] max-w-[350px]'
        : isTablet
            ? 'w-[350px] max-w-[350px]'
            : 'w-96';

    const positionClasses = 'bottom-4 right-4';

    const chatHeight = isMobile
        ? `${windowSize.height * 0.6}px`
        : '500px';

    return (
        <div ref={botref} className={`fixed ${positionClasses} z-50`}>
            {/* Chat toggle button */}
            <motion.button
                onClick={handleToggleChat}
                className="bg-[#36302A] hover:bg-[#4A443E] text-[#FAF4ED] rounded-full p-3 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90 }}
                            animate={{ rotate: 0 }}
                            exit={{ rotate: 90 }}
                        >
                            <X size={isMobile ? 20 : 24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90 }}
                            animate={{ rotate: 0 }}
                            exit={{ rotate: -90 }}
                        >
                            <MessageCircle size={isMobile ? 20 : 24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 'auto' : chatHeight
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute bottom-16 right-0 rounded-lg ${chatWidth} bg-[#FAF4ED] shadow-xl flex flex-col overflow-hidden`}
                        style={{
                            maxHeight: isMobile ? `${windowSize.height * 0.8}px` : '600px'
                        }}
                    >
                        {/* Header */}
                        <div className="p-3 md:p-4 bg-[#36302A] text-[#FAF4ED] rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <motion.h3
                                    className="text-base md:text-lg font-semibold"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    Chat Support 👨‍💻
                                </motion.h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsMinimized(!isMinimized)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        {isMinimized ? <ChevronUp size={isMobile ? 18 : 20} /> : <ChevronDown size={isMobile ? 18 : 20} />}
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <X size={isMobile ? 18 : 20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        {!isMinimized && (
                            <motion.div
                                className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-[#FAF4ED]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <AnimatePresence initial={false}>
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={index}
                                            variants={messageVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-lg p-2 md:p-3 text-sm md:text-base ${message.type === 'user'
                                                    ? 'bg-[#36302A] text-[#FAF4ED]'
                                                    : message.type === 'error'
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-[#EFE7DD] text-[#36302A]'
                                                    } shadow-sm`}
                                            >
                                                {message.content}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-white border border-gray-200 rounded-lg p-2 md:p-3 shadow-sm">
                                                <div className="flex space-x-2">
                                                    <div className="w-2 h-2 bg-[#36302A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 bg-[#36302A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 bg-[#36302A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </motion.div>
                        )}

                        {/* Input Form */}
                        {!isMinimized && (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSendMessage}
                                className="p-3 md:p-4 bg-[#EFE7DD] border-t border-gray-100"
                            >
                                <div className="flex space-x-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 p-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent bg-[#EFE7DD] text-[#36302A] placeholder-[#575553]"
                                        disabled={isLoading}
                                    />
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || !inputMessage.trim()}
                                        className="bg-[#36302A] text-white p-2 rounded-lg hover:bg-[#4A443E] disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Send size={isMobile ? 18 : 20} />
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const APIKEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
// Initialize the chatbot
const chatbot = new GeminiChatbot(APIKEY, websiteInfo);

export default function Chatbot() {
    return (
        <div>
            <ChatbotUI chatbot={chatbot} />
        </div>
    );
}