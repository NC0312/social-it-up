'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaLock, FaUser, FaEnvelope } from "react-icons/fa";
import { ImSpinner8 } from 'react-icons/im';
import { useAdminAuth } from '../components/providers/AdminAuthProvider';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Auth = () => {
    const router = useRouter();
    const { login, register } = useAdminAuth();
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
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptTermsError, setAcceptTermsError] = useState('');

    // Shared state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitMessage, setFormSubmitMessage] = useState('');

    // Password visibility toggles
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const tabVariants = {
        inactive: {
            opacity: 0.7,
            scale: 0.95
        },
        active: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
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
            const result = await register(registerEmail, registerUsername, registerPassword, gender, isEmailVerified);

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
                setIsEmailVerified(false);

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
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#FAF4ED] to-[#EFE7DD] p-4" style={{ userSelect: "none" }}>
            <motion.div
                className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl bg-[#FAF4ED]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1]
                }}
            >
                {/* Logo or brand element */}
                <div className="flex justify-center p-6 bg-gradient-to-r from-[#36302A] to-[#514840]">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                            delay: 0.3
                        }}
                    >
                        <h1 className="text-2xl font-bold text-white">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            >
                                Social It Up Admin View
                            </motion.span>
                        </h1>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#FAF4ED] border-b border-[#E2D9CE]">
                    <motion.button
                        className={`flex-1 py-4 text-center font-medium text-lg relative ${activeTab === 'login' ? 'text-[#36302A]' : 'text-[#86807A]'
                            }`}
                        onClick={() => setActiveTab('login')}
                        variants={tabVariants}
                        animate={activeTab === 'login' ? 'active' : 'inactive'}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Login
                        {activeTab === 'login' && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#36302A]"
                                layoutId="tabIndicator"
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                    </motion.button>
                    <motion.button
                        className={`flex-1 py-4 text-center font-medium text-lg relative ${activeTab === 'register' ? 'text-[#36302A]' : 'text-[#86807A]'
                            }`}
                        onClick={() => setActiveTab('register')}
                        variants={tabVariants}
                        animate={activeTab === 'register' ? 'active' : 'inactive'}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Register
                        {activeTab === 'register' && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#36302A]"
                                layoutId="tabIndicator"
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                    </motion.button>
                </div>

                {/* Forms */}
                <AnimatePresence mode="wait">
                    {activeTab === 'login' && (
                        <motion.form
                            key="login-form"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.4 }}
                            className="px-6 py-8 w-full bg-[#FAF4ED]"
                            onSubmit={handleLoginSubmit}
                            variants={staggerContainer}
                        >
                            <motion.p
                                className="text-[#36302A] text-sm mb-6"
                                variants={itemVariant}
                            >
                                Welcome back! Please enter your credentials to access your account.
                            </motion.p>

                            <motion.div
                                className="space-y-5"
                                variants={itemVariant}
                            >
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#86807A]">
                                        <FaUser />
                                    </div>
                                    <input
                                        type="text"
                                        value={emailOrUsername}
                                        onChange={(e) => {
                                            setEmailOrUsername(e.target.value);
                                            if (emailOrUsernameError) setEmailOrUsernameError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] rounded-lg block w-full pl-10 p-3"
                                        placeholder="Email or Username"
                                    />
                                    {emailOrUsernameError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1 flex items-center gap-1"
                                        >
                                            <FaInfoCircle />{emailOrUsernameError}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#86807A]">
                                        <FaLock />
                                    </div>
                                    <input
                                        type={showLoginPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] rounded-lg block w-full pl-10 pr-10 p-3"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36302A] hover:text-[#86807A]"
                                    >
                                        {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    {passwordError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1 flex items-center gap-1"
                                        >
                                            <FaInfoCircle />{passwordError}
                                        </motion.p>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                className="flex justify-between items-center mt-6"
                                variants={itemVariant}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="remember-me"
                                            className="appearance-none h-4 w-4 border bg-[#EFE7DD] hover:border-[#36302A] rounded text-[#36302A] focus:ring-[#36302A] transition duration-150 ease-in-out cursor-pointer checked:bg-[#36302A]"
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                        />
                                        {rememberMe && (
                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center text-white text-xs"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                ✓
                                            </motion.div>
                                        )}
                                    </div>
                                    <label htmlFor="remember-me" className="text-sm text-[#36302A] cursor-pointer">
                                        Remember me
                                    </label>
                                </div>

                                <motion.a
                                    href="/forgot-password"
                                    className="text-sm text-[#36302A] hover:text-[#514840] hover:underline"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Forgot password?
                                </motion.a>
                            </motion.div>

                            <AnimatePresence>
                                {formSubmitMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`text-sm mt-6 px-4 py-3 rounded-lg ${formSubmitMessage.includes("successful")
                                            ? 'text-green-700 bg-green-50 border border-green-200'
                                            : 'text-red-700 bg-red-50 border border-red-200'
                                            }`}
                                    >
                                        {formSubmitMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                className="mt-6 w-full p-3 text-base font-medium rounded-lg bg-[#36302A] text-white relative overflow-hidden flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor: "#514840",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{
                                    scale: 0.98,
                                    transition: { duration: 0.2 }
                                }}
                                variants={itemVariant}
                            >
                                {isSubmitting ? (
                                    <>
                                        <ImSpinner8 className="w-5 h-5 animate-spin" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <motion.div
                                            className="absolute inset-0 bg-white opacity-0"
                                            whileHover={{ opacity: 0.1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </>
                                )}
                            </motion.button>

                            <motion.p
                                className="text-sm text-[#36302A] text-center mt-6"
                                variants={itemVariant}
                            >
                                Don&apos;t have an account? {" "}
                                <motion.button
                                    type="button"
                                    onClick={() => setActiveTab('register')}
                                    className="text-[#36302A] font-semibold hover:underline"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Register here
                                </motion.button>
                            </motion.p>
                        </motion.form>
                    )}

                    {activeTab === 'register' && (
                        <motion.form
                            key="register-form"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4 }}
                            className="px-6 py-8 w-full bg-[#FAF4ED]"
                            onSubmit={handleRegisterSubmit}
                            variants={staggerContainer}
                        >
                            <motion.p
                                className="text-[#36302A] text-sm mb-6"
                                variants={itemVariant}
                            >
                                Create an account to access exclusive features and content.
                            </motion.p>

                            <motion.div
                                className="space-y-4"
                                variants={itemVariant}
                            >
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#86807A]">
                                        <FaEnvelope />
                                    </div>
                                    <input
                                        type="email"
                                        value={registerEmail}
                                        onChange={(e) => {
                                            setRegisterEmail(e.target.value);
                                            if (registerEmailError) setRegisterEmailError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] rounded-lg block w-full pl-10 p-3"
                                        placeholder="Email"
                                    />
                                    {registerEmailError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1 flex items-center gap-1"
                                        >
                                            <FaInfoCircle />{registerEmailError}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#86807A]">
                                        <FaUser />
                                    </div>
                                    <input
                                        type="text"
                                        value={registerUsername}
                                        onChange={(e) => {
                                            setRegisterUsername(e.target.value);
                                            if (registerUsernameError) setRegisterUsernameError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] rounded-lg block w-full pl-10 p-3"
                                        placeholder="Username"
                                    />
                                    {registerUsernameError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1 flex items-center gap-1"
                                        >
                                            <FaInfoCircle />{registerUsernameError}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#86807A]">
                                        <FaLock />
                                    </div>
                                    <input
                                        type={showRegisterPassword ? "text" : "password"}
                                        value={registerPassword}
                                        onChange={(e) => {
                                            setRegisterPassword(e.target.value);
                                            if (registerPasswordError) setRegisterPasswordError('');
                                            if (confirmPasswordError && confirmPassword) setConfirmPasswordError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] rounded-lg block w-full pl-10 pr-10 p-3"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36302A] hover:text-[#86807A]"
                                    >
                                        {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    {registerPasswordError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1 flex items-center gap-1"
                                        >
                                            <FaInfoCircle />{registerPasswordError}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#86807A]">
                                        <FaLock />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (confirmPasswordError) setConfirmPasswordError('');
                                        }}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] rounded-lg block w-full pl-10 pr-10 p-3"
                                        placeholder="Confirm Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36302A] hover:text-[#86807A]"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    {confirmPasswordError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1 flex items-center gap-1"
                                        >
                                            <FaInfoCircle />{confirmPasswordError}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="relative">
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] rounded-lg block w-full p-3"
                                    >
                                        <option value="unspecified">Gender (Optional)</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </motion.div>

                            <motion.div
                                className="flex items-start gap-2 mt-5"
                                variants={itemVariant}
                            >
                                <div className="relative mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="appearance-none h-4 w-4 border bg-[#EFE7DD] hover:border-[#36302A] rounded text-[#36302A] focus:ring-[#36302A] transition duration-150 ease-in-out cursor-pointer checked:bg-[#36302A]"
                                        checked={acceptTerms}
                                        onChange={() => {
                                            setAcceptTerms(!acceptTerms);
                                            if (acceptTermsError) setAcceptTermsError('');
                                        }}
                                    />
                                    {acceptTerms && (
                                        <motion.div
                                            className="absolute inset-0 flex items-center justify-center text-white text-xs"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            ✓
                                        </motion.div>
                                    )}
                                </div>
                                <label htmlFor="terms" className="text-sm text-[#36302A] cursor-pointer">
                                    I agree to the <a href="/terms" className="text-[#36302A] font-semibold hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#36302A] font-semibold hover:underline">Privacy Policy</a>
                                </label>
                            </motion.div>
                            {acceptTermsError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-600 mt-1 flex items-center gap-1 ml-6"
                                >
                                    <FaInfoCircle />{acceptTermsError}
                                </motion.p>
                            )}

                            <motion.div
                                className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-5"
                                variants={itemVariant}
                            >
                                <p className="text-sm text-amber-800">
                                    Note: Your account will be created with admin privileges and will be pending approval.
                                </p>
                            </motion.div>

                            <AnimatePresence>
                                {formSubmitMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`text-sm mt-6 px-4 py-3 rounded-lg ${formSubmitMessage.includes("successful")
                                            ? 'text-green-700 bg-green-50 border border-green-200'
                                            : 'text-red-700 bg-red-50 border border-red-200'
                                            }`}
                                    >
                                        {formSubmitMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                className="mt-6 w-full p-3 text-base font-medium rounded-lg bg-[#36302A] text-white relative overflow-hidden flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor: "#514840",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{
                                    scale: 0.98,
                                    transition: { duration: 0.2 }
                                }}
                                variants={itemVariant}
                            >
                                {isSubmitting ? (
                                    <>
                                        <ImSpinner8 className="w-5 h-5 animate-spin" />
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <motion.div
                                            className="absolute inset-0 bg-white opacity-0"
                                            whileHover={{ opacity: 0.1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </>
                                )}
                            </motion.button>

                            <motion.p
                                className="text-sm text-[#36302A] text-center mt-6"
                                variants={itemVariant}
                            >
                                Already have an account? {" "}
                                <motion.button
                                    type="button"
                                    onClick={() => setActiveTab('login')}
                                    className="text-[#36302A] font-semibold hover:underline"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Login here
                                </motion.button>
                            </motion.p>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Auth;