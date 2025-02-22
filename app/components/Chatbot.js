'use client'

import GeminiChatbot from './LiveChatBotUtility';
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    return (
        <div ref={botref} className="fixed bottom-4 right-4 z-50">
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
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90 }}
                            animate={{ rotate: 0 }}
                            exit={{ rotate: -90 }}
                        >
                            <MessageCircle size={24} />
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
                            height: isMinimized ? 'auto' : '500px'
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-96 bg-[#FAF4ED] rounded-lg shadow-xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-[#36302A] text-[#FAF4ED] rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <motion.h3
                                    className="text-lg font-semibold"
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
                                        {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        {!isMinimized && (
                            <motion.div
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF4ED]"
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
                                                className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
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
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
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
                                className="p-4 bg-[#EFE7DD] border-t border-gray-100"
                            >
                                <div className="flex space-x-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent bg-[#EFE7DD] text-[#36302A] placeholder-[#575553]"
                                        disabled={isLoading}
                                    />
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || !inputMessage.trim()}
                                        className="bg-[#36302A] text-white p-2 rounded-lg hover:bg-[#4A443E] disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Send size={20} />
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


// Your website information
const websiteInfo = {
    name: "Social It Up",
    tagline: "Elevate Your Brand's Digital Presence",
    domain: "socialitup.in",
    description: "Social It Up is a dynamic marketing agency that specializes in transforming businesses through strategic digital marketing solutions. Based in India, we combine creativity with data-driven strategies to deliver exceptional results for our clients.",

    companyInfo: {
        founded: "2024",
        location: "India",
        expertise: "Digital Marketing & Brand Development",
        mission: "To empower businesses with innovative digital solutions that drive growth and create lasting impact",
        vision: "To be the leading force in digital transformation, helping businesses thrive in the digital age"
    },

    serviceCategories: [
        {
            id: "branding",
            title: "Branding & Design",
            description: "Comprehensive branding solutions to establish and strengthen your market presence",
            sections: [
                {
                    title: "Brand Identity",
                    items: [
                        {
                            title: "Logo Design and Development",
                            description: "Crafting a unique and memorable logo that encapsulates your brand's essence and values"
                        },
                        {
                            title: "Color Palette Creation",
                            description: "Developing a cohesive color scheme that reflects your brand's personality"
                        },
                        {
                            title: "Typography Selection",
                            description: "Choosing fonts that align with your brand identity"
                        },
                        {
                            title: "Brand Voice and Messaging",
                            description: "Establishing a clear and consistent tone for communications"
                        },
                        {
                            title: "Visual Elements",
                            description: "Custom icons and imagery design"
                        },
                        {
                            title: "Brand Style Guide",
                            description: "Comprehensive documentation for brand consistency"
                        }
                    ]
                },
                {
                    title: "Print Media & Collaterals",
                    items: [
                        {
                            title: "Business Cards & Stationery",
                            description: "Professional business cards, letterheads, and envelopes"
                        },
                        {
                            title: "Marketing Materials",
                            description: "Brochures, flyers, posters, and banners"
                        },
                        {
                            title: "Packaging Design",
                            description: "Product packaging and label design with mockups"
                        },
                        {
                            title: "Promotional Items",
                            description: "Branded merchandise, apparel, and promotional materials"
                        }
                    ]
                }
            ]
        },
        {
            id: "digital",
            title: "Digital Marketing",
            description: "Strategic digital marketing solutions to boost your online presence",
            sections: [
                {
                    title: "Social Media Marketing",
                    items: [
                        {
                            title: "Strategy Development",
                            description: "Custom social media strategies based on market analysis"
                        },
                        {
                            title: "Content Creation",
                            description: "Engaging posts, graphics, and videos"
                        },
                        {
                            title: "Community Management",
                            description: "Active engagement and response management"
                        },
                        {
                            title: "Paid Advertising",
                            description: "Targeted ad campaigns across platforms"
                        },
                        {
                            title: "Analytics & Reporting",
                            description: "Detailed performance tracking and optimization"
                        }
                    ]
                },
                {
                    title: "SEO & Content Marketing",
                    items: [
                        {
                            title: "Keyword Research & Strategy",
                            description: "Comprehensive keyword analysis and planning"
                        },
                        {
                            title: "On-Page SEO",
                            description: "Website optimization for search engines"
                        },
                        {
                            title: "Content Strategy",
                            description: "Blog posts, articles, and SEO content"
                        },
                        {
                            title: "Technical SEO",
                            description: "Site structure and performance optimization"
                        }
                    ]
                },
                {
                    title: "Email & WhatsApp Marketing",
                    items: [
                        {
                            title: "Campaign Management",
                            description: "Strategic email and WhatsApp campaigns"
                        },
                        {
                            title: "Automation",
                            description: "Automated workflows and sequences"
                        },
                        {
                            title: "List Management",
                            description: "Audience segmentation and targeting"
                        },
                        {
                            title: "Performance Analytics",
                            description: "Tracking engagement and conversions"
                        }
                    ]
                }
            ]
        },
        {
            id: "development",
            title: "Web & App Development",
            description: "Custom development solutions for digital platforms",
            sections: [
                {
                    title: "Website Development",
                    items: [
                        {
                            title: "Custom Website Design",
                            description: "Tailored website solutions"
                        },
                        {
                            title: "E-commerce Development",
                            description: "Online store creation and management"
                        },
                        {
                            title: "CMS Implementation",
                            description: "Content management system setup"
                        },
                        {
                            title: "Website Maintenance",
                            description: "Ongoing support and updates"
                        }
                    ]
                },
                {
                    title: "App Development",
                    items: [
                        {
                            title: "iOS Development",
                            description: "Native iPhone and iPad apps"
                        },
                        {
                            title: "Android Development",
                            description: "Custom Android applications"
                        },
                        {
                            title: "Cross-Platform Solutions",
                            description: "Multi-platform app development"
                        }
                    ]
                },
                {
                    title: "UI/UX Design",
                    items: [
                        {
                            title: "User Research",
                            description: "Audience analysis and testing"
                        },
                        {
                            title: "Interface Design",
                            description: "Visual design and prototyping"
                        },
                        {
                            title: "Interaction Design",
                            description: "User experience optimization"
                        }
                    ]
                }
            ]
        },
        {
            id: "business",
            title: "Business Services",
            description: "Essential business operation and compliance services",
            sections: [
                {
                    title: "GST Services",
                    items: [
                        {
                            title: "GST Registration",
                            description: "Complete GSTIN registration assistance"
                        },
                        {
                            title: "Returns Filing",
                            description: "Regular GST return preparation and filing"
                        },
                        {
                            title: "Compliance Management",
                            description: "Ongoing GST compliance support"
                        }
                    ]
                },
                {
                    title: "Financial Services",
                    items: [
                        {
                            title: "Bookkeeping",
                            description: "Regular financial record maintenance"
                        },
                        {
                            title: "Financial Reporting",
                            description: "Periodic financial statement preparation"
                        },
                        {
                            title: "Tax Planning",
                            description: "Strategic tax optimization advice"
                        }
                    ]
                },
                {
                    title: "Business Registration",
                    items: [
                        {
                            title: "Company Formation",
                            description: "Business structure setup and registration"
                        },
                        {
                            title: "Licensing Support",
                            description: "Business license acquisition assistance"
                        },
                        {
                            title: "Compliance Services",
                            description: "Ongoing regulatory compliance management"
                        }
                    ]
                }
            ]
        }
    ],
    work:[
        {
            name:"Eco Jet",
        },
        {
            name:"Machan",
        },
        {
            name:"Taiga",
        },
        {
            name:"Pretty Knots",
        },
        {
            name:"Box Ongo",
        },
        {
            name:"Safar",
        },
        {
            name:"Box Ongo",
        },{
            name:"Creamy Delight",
        }
    ],
    features: [
        {
            name: "Bug Reporting System",
            description: "Users can report bugs through the inquire page using the feedback button. Upon bug resolution, users receive automatic email notifications.",
            path: "/inquire"
        },
        {
            name: "Client Onboarding",
            description: "New clients can get started by filling out the inquire form. Upon submission, they receive an automatic email confirmation and personal contact from our team.",
            path: "/inquire"
        },
    ],

    faq: {
        "What services do you offer?": "We provide a comprehensive range of services including branding, marketing strategy, web design, graphic design, social media management, and content creation. Our goal is to help you build a cohesive and impactful online presence.",
        "How do you approach branding projects?": "Our branding process involves thorough research to understand your business, audience, and market trends. We collaborate with you to develop a custom package that fits your unique needs. Most of them include brand identity, including logo design, colour palettes, typography, and brand guidelines.",
        "How can I get started?": "Getting started is easy! Simply reach out via our contact form or give us a call. We'll schedule a consultation to discuss your goals, and how we can help bring your vision to life.",
        "Do you offer custom packages?": "Yes, we understand that every business is unique. We offer customized packages tailored to your specific needs and budget.",
        "What industries do you work with?": "We work with businesses across various industries including e-commerce, healthcare, technology, education, and more. Our diverse experience allows us to adapt our strategies to any sector.",
        "How do you measure success?": "We establish clear KPIs at the start of each project and provide regular reports tracking metrics such as engagement rates, conversion rates, website traffic, and ROI.",
        "Do you provide ongoing support?": "Yes, we offer continuous support and maintenance packages to ensure your digital presence remains optimal and up-to-date."
    },

    contact: {
        email: "thesocialitup@gmail.com",
        website: "https://socialitup.in",
        social: {
            instagram: "@socialitup.in",
        }
    },

    support: {
        bugReport: {
            path: "/inquire",
            process: "Use the feedback button to report bugs. You'll receive an email notification once the issue is resolved."
        },
        customerService: {
            response: "Within 24 hours",
            channels: ["Email", "Contact Form", "Social Media"]
        }
    },
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