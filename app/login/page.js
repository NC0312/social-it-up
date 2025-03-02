'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle } from "react-icons/fa";
import { ImSpinner8 } from 'react-icons/im';
import { useAdminAuth } from '../components/providers/AdminAuthProvider'; // Import your auth context
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Auth = () => {
    const router = useRouter();
    const { login, register } = useAdminAuth(); // Use the auth context
    const [activeTab, setActiveTab] = useState('login');

    // Login state
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [emailOrUsernameError, setEmailOrUsernameError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Register state
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerEmailError, setRegisterEmailError] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerUsernameError, setRegisterUsernameError] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordError, setRegisterPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [gender, setGender] = useState('unspecified');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptTermsError, setAcceptTermsError] = useState('');

    // Shared state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitMessage, setFormSubmitMessage] = useState('');
    

    // Login visibility
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Register visibility
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
    };

    // Login validation functions
    const validateEmailOrUsername = () => {
        if (!emailOrUsername.trim()) {
            setEmailOrUsernameError('Email or username is required');
            return false;
        }

        // Check if it's an email (contains @ and .) or a username (letters, numbers, underscore)
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailOrUsername);
        const isUsername = /^[a-zA-Z0-9_]{3,}$/.test(emailOrUsername);

        if (!isEmail && !isUsername) {
            setEmailOrUsernameError('Please enter a valid email or username');
            return false;
        }

        setEmailOrUsernameError('');
        return true;
    };

    const validatePassword = () => {
        if (!password.trim()) {
            setPasswordError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    // Registration validation functions
    const validateRegisterEmail = () => {
        if (!registerEmail.trim()) {
            setRegisterEmailError('Email is required');
            return false;
        }
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(registerEmail)) {
            setRegisterEmailError('Please enter a valid email address');
            return false;
        }
        setRegisterEmailError('');
        return true;
    };

    const validateRegisterUsername = () => {
        if (!registerUsername.trim()) {
            setRegisterUsernameError('Username is required');
            return false;
        }
        if (registerUsername.length < 3) {
            setRegisterUsernameError('Username must be at least 3 characters');
            return false;
        }
        const usernamePattern = /^[a-zA-Z0-9_]{3,}$/;
        if (!usernamePattern.test(registerUsername)) {
            setRegisterUsernameError('Username can only contain letters, numbers, and underscores');
            return false;
        }
        setRegisterUsernameError('');
        return true;
    };

    const validateRegisterPassword = () => {
        if (!registerPassword.trim()) {
            setRegisterPasswordError('Password is required');
            return false;
        }
        if (registerPassword.length < 6) {
            setRegisterPasswordError('Password must be at least 6 characters');
            return false;
        }
        // You can add more password strength requirements here
        setRegisterPasswordError('');
        return true;
    };

    const validateConfirmPassword = () => {
        if (!confirmPassword.trim()) {
            setConfirmPasswordError('Please confirm your password');
            return false;
        }
        if (confirmPassword !== registerPassword) {
            setConfirmPasswordError('Passwords do not match');
            return false;
        }
        setConfirmPasswordError('');
        return true;
    };

    const validateTerms = () => {
        if (!acceptTerms) {
            setAcceptTermsError('You must accept the terms and conditions');
            return false;
        }
        setAcceptTermsError('');
        return true;
    };


    // Login form submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Run all validations and store their results
        const emailOrUsernameValid = validateEmailOrUsername();
        const passwordValid = validatePassword();

        // Check if all validations passed
        const isValid = emailOrUsernameValid && passwordValid;

        // If any validation failed, stop submission and show errors
        if (!isValid) {
            setIsSubmitting(false);
            return;
        }

        try {
            // Call the login function from your auth context
            const result = await login(emailOrUsername, password);

            if (result.success) {
                setFormSubmitMessage("Login successful! Redirecting to admin panel...");

                // Reset form if not remember me
                if (!rememberMe) {
                    setEmailOrUsername("");
                    setPassword("");
                }

                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/admin-panel69');
                }, 1500);
            } else {
                // Show error message
                setFormSubmitMessage(result.error || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Error during login: ", error);
            setFormSubmitMessage(
                error.message || "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Registration form submission
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Run all validations
        const emailValid = validateRegisterEmail();
        const usernameValid = validateRegisterUsername();
        const passwordValid = validateRegisterPassword();
        const confirmPasswordValid = validateConfirmPassword();
        const termsValid = validateTerms();

        // Check if all validations passed
        const isValid = emailValid && usernameValid && passwordValid && confirmPasswordValid && termsValid;

        // If any validation failed, stop submission
        if (!isValid) {
            setIsSubmitting(false);
            return;
        }

        try {
            // Call the register function from your auth context
            const result = await register(registerEmail, registerUsername, registerPassword, gender);

            if (result.success) {
                // Show success message
                setFormSubmitMessage(result.message || "Registration successful! You can now log in.");

                // Reset form
                setRegisterEmail("");
                setRegisterUsername("");
                setRegisterPassword("");
                setConfirmPassword("");
                setAcceptTerms(false);
                setGender("unspecified");

                // Switch to login tab after successful registration
                setTimeout(() => {
                    setActiveTab('login');
                    setFormSubmitMessage("");
                }, 2000);
            } else {
                // Show error message
                setFormSubmitMessage(result.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during registration: ", error);
            setFormSubmitMessage(
                error.message || "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative w-full h-auto" style={{ userSelect: "none" }}>
            <div className="flex flex-col md:flex-row items-stretch h-auto">
                {/* Image Section */}
                <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 md:bottom-0 z-10">
                    <Image
                        src="/inquire-image.jpeg"
                        alt="Authentication"
                        fill
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
                    {/* Tabs */}
                    <div className="flex bg-[#FAF4ED]">
                        <button
                            className={`flex-1 py-4 text-center font-medium text-lg transition-colors duration-300 ${activeTab === 'login'
                                ? 'border-b-2 border-[#36302A] text-[#36302A]'
                                : 'text-[#86807A] border-b border-[#E2D9CE]'
                                }`}
                            onClick={() => setActiveTab('login')}
                        >
                            Login
                        </button>
                        <button
                            className={`flex-1 py-4 text-center font-medium text-lg transition-colors duration-300 ${activeTab === 'register'
                                ? 'border-b-2 border-[#36302A] text-[#36302A]'
                                : 'text-[#86807A] border-b border-[#E2D9CE]'
                                }`}
                            onClick={() => setActiveTab('register')}
                        >
                            Register
                        </button>
                    </div>

                    {/* Login Form */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'login' && (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="px-6 md:px-10 w-full py-6 md:py-8 z-20 bg-[#FAF4ED] flex flex-col gap-4"
                                onSubmit={handleLoginSubmit}
                            >
                                <p className="text-[#36302A] text-sm md:text-lg">
                                    Welcome back! Please enter your credentials to access your account.
                                </p>

                                <div className="flex flex-col py-1 mt-4">
                                    <label className="text-sm text-[#36302A]">
                                        Email or Username <span className="text-[#86807A] ml-1">(required)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={emailOrUsername}
                                        onChange={(e) => {
                                            setEmailOrUsername(e.target.value);
                                            if (emailOrUsernameError) setEmailOrUsernameError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                                        placeholder="Enter your email or username"
                                    />
                                    {emailOrUsernameError && (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle />{emailOrUsernameError}</p>
                                    )}
                                </div>

                                <div className="flex flex-col py-1">
                                    <label className="text-sm text-[#36302A]">
                                        Password <span className="text-[#86807A] ml-1">(required)</span>
                                    </label>
                                    <div className="relative">
                                    <input
                                            type={showLoginPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (passwordError) setPasswordError('');
                                            }}
                                            className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36302A]"
                                        >
                                            {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle />{passwordError}</p>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="remember-me"
                                            className="appearance-none h-4 w-4 border bg-[#EFE7DD] hover:border-[#36302A] rounded-lg cursor-pointer checked:bg-[#36302A] checked:text-white focus:ring-1 focus:ring-[#36302A]"
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                        />
                                        <label htmlFor="remember-me" className="text-sm text-[#36302A] cursor-pointer">
                                            Remember me
                                        </label>
                                    </div>

                                    <a href="/forgot-password" className="text-sm text-[#36302A] hover:underline">
                                        Forgot password?
                                    </a>
                                </div>

                                <AnimatePresence>
                                    {formSubmitMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.5 }}
                                            className={`text-sm mt-6 px-4 py-2 rounded-lg border ${formSubmitMessage.includes("successful")
                                                ? 'text-green-700 bg-green-100 border-green-400'
                                                : 'text-red-700 bg-red-100 border-red-400'
                                                }`}
                                        >
                                            {formSubmitMessage}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    type="submit"
                                    className="mt-6 px-5 py-3 md:py-4 md:w-40 text-sm rounded-md md:rounded-md bg-[#36302A] text-white relative overflow-hidden flex items-center justify-center gap-2"
                                    disabled={isSubmitting}
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: 0.3, ease: "easeOut" },
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                        transition: { duration: 0.2 },
                                    }}
                                >
                                    {isSubmitting && (
                                        <ImSpinner8 className="w-4 h-4 animate-spin" />
                                    )}
                                    <span className="relative z-10">
                                        {isSubmitting ? 'Logging in...' : 'Login'}
                                    </span>
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-full bg-white opacity-0"
                                        whileHover={{ opacity: 0.1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>

                                <p className="text-sm text-[#36302A] text-center mt-4 mb-6">
                                    Don&apos;t have an account? <button
                                        type="button"
                                        onClick={() => setActiveTab('register')}
                                        className="text-[#36302A] font-semibold hover:underline"
                                    >
                                        Register here
                                    </button>
                                </p>
                            </motion.form>
                        )}

                        {/* Register Form */}
                        {activeTab === 'register' && (
                            <motion.form
                                key="register-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="px-6 md:px-10 w-full py-6 md:py-8 z-20 bg-[#FAF4ED] flex flex-col gap-4"
                                onSubmit={handleRegisterSubmit}
                            >
                                <p className="text-[#36302A] text-sm md:text-lg">
                                    Create an account to access exclusive features and content.
                                </p>

                                <div className="flex flex-col py-1 mt-4">
                                    <label className="text-sm text-[#36302A]">
                                        Email <span className="text-[#86807A] ml-1">(required)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={registerEmail}
                                        onChange={(e) => {
                                            setRegisterEmail(e.target.value);
                                            if (registerEmailError) setRegisterEmailError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                                        placeholder="Enter your email"
                                    />
                                    {registerEmailError && (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle />{registerEmailError}</p>
                                    )}
                                </div>

                                <div className="flex flex-col py-1">
                                    <label className="text-sm text-[#36302A]">
                                        Username <span className="text-[#86807A] ml-1">(required)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={registerUsername}
                                        onChange={(e) => {
                                            setRegisterUsername(e.target.value);
                                            if (registerUsernameError) setRegisterUsernameError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                                        placeholder="Choose a username"
                                    />
                                    {registerUsernameError && (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle />{registerUsernameError}</p>
                                    )}
                                </div>

                                <div className="flex flex-col py-1">
                                    <label className="text-sm text-[#36302A]">
                                        Password<span className="text-[#86807A] ml-1">(required)</span>
                                    </label>
                                    <div className="relative">
                                    <input
                                            type={showRegisterPassword ? "text" : "password"}
                                            value={registerPassword}
                                            onChange={(e) => {
                                                setRegisterPassword(e.target.value);
                                                if (registerPasswordError) setRegisterPasswordError('');
                                                if (confirmPasswordError && confirmPassword) setConfirmPasswordError('');
                                            }}
                                            className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                                            placeholder="Create a password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36302A]"
                                        >
                                            {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {registerPasswordError && (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle />{registerPasswordError}</p>
                                    )}
                                </div>

                                <div className="flex flex-col py-1">
                                    <label className="text-sm text-[#36302A]">
                                        Confirm Password <span className="text-[#86807A] ml-1">(required)</span>
                                    </label>
                                    <div className="relative">
                                    <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (confirmPasswordError) setConfirmPasswordError('');
                                            }}
                                            className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36302A]"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {confirmPasswordError && (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle />{confirmPasswordError}</p>
                                    )}
                                </div>

                                <div className="flex flex-col py-1">
                                    <label className="text-sm text-[#36302A]">
                                        Gender <span className="text-[#86807A] ml-1">(optional)</span>
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 py-2 rounded-lg w-full"
                                    >
                                        <option value="unspecified">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="flex items-start gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="appearance-none h-4 w-4 border bg-[#EFE7DD] hover:border-[#36302A] rounded-lg cursor-pointer checked:bg-[#36302A] checked:text-white focus:ring-1 focus:ring-[#36302A] mt-1"
                                        checked={acceptTerms}
                                        onChange={() => {
                                            setAcceptTerms(!acceptTerms);
                                            if (acceptTermsError) setAcceptTermsError('');
                                        }}
                                    />
                                    <label htmlFor="terms" className="text-sm text-[#36302A] cursor-pointer">
                                        I agree to the <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>
                                    </label>
                                </div>
                                {acceptTermsError && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><FaInfoCircle />{acceptTermsError}</p>
                                )}

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                                    <p className="text-sm text-yellow-800">
                                        Note: Your account will be created with admin privileges and will be pending approval.
                                    </p>
                                </div>

                                <AnimatePresence>
                                    {formSubmitMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.5 }}
                                            className={`text-sm mt-6 px-4 py-2 rounded-lg border ${formSubmitMessage.includes("successful")
                                                ? 'text-green-700 bg-green-100 border-green-400'
                                                : 'text-red-700 bg-red-100 border-red-400'
                                                }`}
                                        >
                                            {formSubmitMessage}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    type="submit"
                                    className="mt-6 px-5 py-3 md:py-4 md:w-40 text-sm rounded-md md:rounded-md bg-[#36302A] text-white relative overflow-hidden flex items-center justify-center gap-2"
                                    disabled={isSubmitting}
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: 0.3, ease: "easeOut" },
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                        transition: { duration: 0.2 },
                                    }}
                                >
                                    {isSubmitting && (
                                        <ImSpinner8 className="w-4 h-4 animate-spin" />
                                    )}
                                    <span className="relative z-10">
                                        {isSubmitting ? 'Registering...' : 'Register'}
                                    </span>
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-full bg-white opacity-0"
                                        whileHover={{ opacity: 0.1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>

                                <p className="text-sm text-[#36302A] text-center mt-4 mb-6">
                                    Already have an account? <button
                                        type="button"
                                        onClick={() => setActiveTab('login')}
                                        className="text-[#36302A] font-semibold hover:underline"
                                    >
                                        Login here
                                    </button>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Auth;