import React, { useEffect, useState, useRef } from "react";
import { Menu, X, Radio, Play, Mic, Users, TrendingUp, Award, Phone, Mail, Youtube, Linkedin, Instagram, Facebook, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import "../App.css";
import logo from "../assets/CorpRadioLogo - Copy.jpeg";
import footerLogo from "../assets/CorpRadioLogo - Copy.jpeg";
import businessShow from "../assets/BF Thumbnail image.png";
import jeffKahn from "../assets/Jeff Kahn.jpeg";
import charlImage from "../assets/charl1.jpeg";
import heroBg from "../assets/hero.jpeg";
import intro from "../assets/intro.png";

import introVideo from "../assets/The Business Fundamentals Show Intro.mp4";
// import fundamentalsPreview from "../assets/fundamentals-preview.mp4";
import corporatePreview from "../assets/Jeff Kahn - Corporate Show Intro.mp4";
import aiPreview from "../assets/ai-preview.m4a";


import { supabase } from '../supabaseClient'

export default function CorpRadio() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [registrationStep, setRegistrationStep] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [authForm, setAuthForm] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    industry: '',
    cellNumber: '',
    location: '',
    businessChallenge: ''
  }); const [authErrors, setAuthErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState({});

  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetErrors, setResetErrors] = useState({});
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState('');
  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("hero");
  const [publicTab, setPublicTab] = useState("fundamentals");
  const [memberTab, setMemberTab] = useState("fundamentals");
  const [currentView, setCurrentView] = useState('main');
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  // Refs to observe
  const sectionIds = ["hero", "shows", "radio", "introduction", "members", "about", "contact"]; const sectionRefs = useRef({});

  //Members only limited viewership
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const videoTimeoutRef = useRef(null);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Height of your fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Close mobile menu if it's open
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && videoWatchTime > 0) {
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
      }

      if (videoWatchTime >= 60) {
        setShowTimeoutWarning(true);
      }

      if (videoWatchTime >= 90) {
        // Lock the video after 90 seconds
        setVideoWatchTime(0);
        setShowTimeoutWarning(false);
        // Force show the lock overlay
        const memberSection = document.getElementById('members');
        if (memberSection) {
          memberSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        videoTimeoutRef.current = setTimeout(() => {
          setVideoWatchTime(prev => prev + 1);
        }, 1000);
      }
    }

    return () => {
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
      }
    };
  }, [videoWatchTime, isAuthenticated]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // If profile exists but business info is missing, update from user metadata
        if (profile && !profile.business_name && session.user.user_metadata?.business_name) {
          await supabase
            .from('profiles')
            .update({
              email: session.user.email,
              business_name: session.user.user_metadata.business_name,
              industry: session.user.user_metadata.industry,
              cell_number: session.user.user_metadata.cell_number,
              location: session.user.user_metadata.location,
              business_challenge: session.user.user_metadata.business_challenge
            })
            .eq('id', session.user.id);
        }

        setCurrentUser({
          fullName: profile?.full_name || session.user.email,
          username: session.user.email,
          email: session.user.email,
          businessName: profile?.business_name,
          industry: profile?.industry,
          cellNumber: profile?.cell_number,
          location: profile?.location,
          businessChallenge: profile?.business_challenge
        });
        setIsAuthenticated(true);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Sync business info if missing
        if (profile && !profile.business_name && session.user.user_metadata?.business_name) {
          await supabase
            .from('profiles')
            .update({
              email: session.user.email,
              business_name: session.user.user_metadata.business_name,
              industry: session.user.user_metadata.industry,
              cell_number: session.user.user_metadata.cell_number,
              location: session.user.user_metadata.location,
              business_challenge: session.user.user_metadata.business_challenge
            })
            .eq('id', session.user.id);
        }

        setCurrentUser({
          fullName: profile?.full_name || session.user.email,
          username: session.user.email,
          email: session.user.email,
          businessName: profile?.business_name,
          industry: profile?.industry,
          cellNumber: profile?.cell_number,
          location: profile?.location,
          businessChallenge: profile?.business_challenge
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
useEffect(() => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const type = hashParams.get('type');

  if (type === 'recovery' && accessToken) {
    console.log('Password recovery detected');
    
    // Set the session with the recovery token
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get('refresh_token') || ''
    }).then(() => {
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);

      // Show password reset modal
      setAuthMode('reset-password');
      setShowAuthModal(true);

      // Show success message
      setSuccessMessage('Please enter your new password below');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    });
  }
}, []);

  // Show definitions
  const shows = [
    {
      id: "fundamentals",
      title: "Business Fundamentals Show",
      host: "Lester Philander",
      desc: "Tactical episodes on Sales, Marketing, HR, Funding and small-business growth.",
      img: businessShow,
      previewVideo: introVideo,
      videoType: "youtube",
      isPublic: true,
      episodes: [
        { id: 1, title: "Sales Fundamentals", videoUrl: "https://www.youtube.com/embed/gBBbOOM2onA" },
        { id: 2, title: "Marketing Basics", videoUrl: "https://www.youtube.com/embed/64MW4JM0q2k" },
        { id: 3, title: "HR Essentials", videoUrl: "https://www.youtube.com/embed/jtRV5QSvC7U" },
        { id: 4, title: "Funding Your Business", videoUrl: "https://www.youtube.com/embed/XLEFAcI98r0" }
      ]
    },
    {
      id: "corporate",
      title: "The Corporate Show",
      host: "Jeff Kahn",
      desc: "Warm, professional interviews with CEOs & C-suite — focused on leadership and strategy.",
      img: jeffKahn,
      previewVideo: corporatePreview,
      videoType: "youtube",
      isPublic: false,
      episodes: [
        { id: 1, title: "Leadership in Crisis", videoUrl: "https://www.youtube.com/embed/wguafJWO5Rs" },
        { id: 2, title: "Building High-Performance Teams", videoUrl: "https://www.youtube.com/embed/fNEYwdWrs1I" },
        { id: 3, title: "Strategic Planning for 2025", videoUrl: "https://www.youtube.com/embed/a-_DWgHUqq0" },
        { id: 4, title: "Innovation & Disruption", videoUrl: "https://www.youtube.com/embed/BPZeMI-V-YU" }
      ]
    },

    {
      id: "ai",
      title: "The AI Advantage Show",
      host: "Charl Imalman",
      desc: "Real tools, case studies and policies for adopting AI in business workflows.",
      img: charlImage,
      previewVideo: aiPreview,
      videoType: "youtube",
      isPublic: false,
      episodes: [
        { id: 1, title: "Franchise Fundamentals", videoUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F4359229150964045&show_text=false&width=867&t=0" },
        { id: 2, title: "Acquisition Strategies", videoUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F783620987637550%2F&show_text=false&width=867&t=0" },
        { id: 3, title: "M&A Best Practices", videoUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1474116340586636%2F&show_text=true&width=867&t=0" },
        { id: 4, title: "Scaling Through Franchising", videoUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F814388837754086%2F&show_text=false&width=867&t=0" }
      ]
    },
  ];

  const [currentEpisode, setCurrentEpisode] = useState({});

  useEffect(() => {
    const currentShow = shows.find(s => s.id === publicTab);
    if (currentShow && currentShow.episodes && currentShow.episodes.length > 0) {
      setCurrentEpisode({ [publicTab]: currentShow.episodes[0] });
    }
  }, [publicTab]);

  // Auth functions
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // South African cellphone regex: starts with 06, 07, 08 followed by 8 digits
    const cellPhoneRegex = /^0[6-8][0-9]{8}$/;

    if (authMode === 'register' && registrationStep === 1) {
      // Stage 1 validation
      if (!authForm.fullName.trim()) {
        errors.fullName = 'Full name is required';
      }
      if (!authForm.username.trim()) {
        errors.username = 'Email is required';
      } else if (!emailRegex.test(authForm.username)) {
        errors.username = 'Please enter a valid email address';
      }
      if (!authForm.password) {
        errors.password = 'Password is required';
      } else if (authForm.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (authForm.password !== authForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(errors).length > 0) {
        setAuthErrors(errors);
        return;
      }

      // Move to step 2
      setRegistrationStep(2);
      setAuthErrors({});
      return;
    }

    if (authMode === 'register' && registrationStep === 2) {
      // Stage 2 validation
      if (!authForm.businessName.trim()) {
        errors.businessName = 'Business name is required';
      }
      if (!authForm.industry.trim()) {
        errors.industry = 'Industry is required';
      }
      if (!authForm.cellNumber.trim()) {
        errors.cellNumber = 'Cell number is required';
      } else if (!cellPhoneRegex.test(authForm.cellNumber.replace(/\s/g, ''))) {
        errors.cellNumber = 'Please enter a valid SA cell number (e.g., 0821234567)';
      }
      if (!authForm.location.trim()) {
        errors.location = 'Location is required';
      }
      if (!authForm.businessChallenge.trim()) {
        errors.businessChallenge = 'Please describe your current business challenge';
      }

      if (Object.keys(errors).length > 0) {
        setAuthErrors(errors);
        return;
      }
    }

    if (authMode === 'login') {
      if (!authForm.username.trim()) {
        errors.username = 'Email is required';
      } else if (!emailRegex.test(authForm.username)) {
        errors.username = 'Please enter a valid email address';
      }
      if (!authForm.password) {
        errors.password = 'Password is required';
      }

      if (Object.keys(errors).length > 0) {
        setAuthErrors(errors);
        return;
      }
    }

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authForm.username,
          password: authForm.password,
        });

        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        setCurrentUser({
          fullName: profile?.full_name || data.user.email,
          username: data.user.email,
          email: data.user.email,
          businessName: profile?.business_name,
          industry: profile?.industry,
          cellNumber: profile?.cell_number,
          location: profile?.location,
          businessChallenge: profile?.business_challenge
        });
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setAuthForm({
          fullName: '',
          username: '',
          password: '',
          confirmPassword: '',
          businessName: '',
          industry: '',
          cellNumber: '',
          location: '',
          businessChallenge: ''
        });

        setSuccessMessage(`Welcome back, ${profile?.full_name || data.user.email}! You've successfully logged in.`);
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 4000);
      }

      else {
        // Register user
        const { data, error } = await supabase.auth.signUp({
          email: authForm.username,
          password: authForm.password,
          options: {
            data: {
              full_name: authForm.fullName,
              business_name: authForm.businessName,
              industry: authForm.industry,
              cell_number: authForm.cellNumber,
              location: authForm.location,
              business_challenge: authForm.businessChallenge,
            },
            emailRedirectTo: `${window.location.origin}`
          }
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data?.user && !data.session) {
          // Email confirmation required
          setShowAuthModal(false);
          setRegistrationStep(1);
          setAuthForm({
            fullName: '',
            username: '',
            password: '',
            confirmPassword: '',
            businessName: '',
            industry: '',
            cellNumber: '',
            location: '',
            businessChallenge: ''
          });

          setSuccessMessage('Registration successful! Please check your email to confirm your account, then login.');
          setShowSuccessPopup(true);
          setTimeout(() => {
            setShowSuccessPopup(false);
            openAuthModal('login');
          }, 5000);

          return;
        }

        // If auto-confirmed (email confirmation disabled in Supabase)
        // Update profile with additional business information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            business_name: authForm.businessName,
            industry: authForm.industry,
            cell_number: authForm.cellNumber,
            location: authForm.location,
            business_challenge: authForm.businessChallenge
          })
          .eq('id', data.user.id);

        if (profileError) console.error('Profile update error:', profileError);

        setCurrentUser({
          fullName: authForm.fullName,
          username: authForm.username
        });
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setRegistrationStep(1);
        setAuthForm({
          fullName: '',
          username: '',
          password: '',
          confirmPassword: '',
          businessName: '',
          industry: '',
          cellNumber: '',
          location: '',
          businessChallenge: ''
        });

        setSuccessMessage(`Welcome, ${authForm.fullName}! You've successfully registered and logged in.`);
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 4000);
      }
    } catch (error) {
      console.error('Auth error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.message) {
        // Try to make the error message more user-friendly
        if (error.message.includes('duplicate key')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }

      setAuthErrors({ general: errorMessage });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!resetEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(resetEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setResetErrors(errors);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}`,
      });

      if (error) throw error;

      setShowResetSuccess(true);
      setResetEmail('');
      setTimeout(() => {
        setShowResetSuccess(false);
        setShowForgotPassword(false);
      }, 8000);
    } catch (error) {
      setResetErrors({ email: error.message });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!changePasswordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (changePasswordForm.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
    if (changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setChangePasswordErrors(errors);
      return;
    }

    try {
      // Supabase requires reauthentication for password changes
      // First verify the current password
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Attempt to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: changePasswordForm.currentPassword,
      });

      if (signInError) {
        setChangePasswordErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: changePasswordForm.newPassword
      });

      if (error) throw error;

      setSuccessMessage('Password changed successfully!');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 4000);

      setShowChangePassword(false);
      setChangePasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setChangePasswordErrors({});
    } catch (error) {
      setChangePasswordErrors({ general: error.message });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentView('main');
      setShowLogoutConfirm(false);

      // Show success message
      setSuccessMessage('You have been successfully logged out. See you next time!');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 4000);

      // Scroll to top after a short delay
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthErrors({ general: 'An error occurred during logout. Please try again.' });
    }
  };
 const handleResetPassword = async (e) => {
  e.preventDefault();
  const errors = {};

  if (!resetPasswordForm.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (resetPasswordForm.newPassword.length < 6) {
    errors.newPassword = 'Password must be at least 6 characters';
  }

  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    setResetPasswordErrors(errors);
    return;
  }

  try {
    console.log('Updating password...');

    // Verify we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session found. Please request a new password reset link.');
    }

    const { error } = await supabase.auth.updateUser({
      password: resetPasswordForm.newPassword
    });

    if (error) throw error;

    console.log('Password updated successfully');

    setSuccessMessage('Password reset successfully! You can now login with your new password.');
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 4000);

    // Close modal and clear form
    setShowAuthModal(false);
    setResetPasswordForm({ newPassword: '', confirmPassword: '' });
    setResetPasswordErrors({});

    // Show login modal after a brief delay
    setTimeout(() => {
      openAuthModal('login');
    }, 1000);

  } catch (error) {
    console.error('Password reset error:', error);
    setResetPasswordErrors({ general: error.message || 'Failed to reset password. Please request a new reset link.' });
  }
};
  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setAuthErrors({});
    setRegistrationStep(1);
    setAuthForm({
      fullName: '',
      username: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      industry: '',
      cellNumber: '',
      location: '',
      businessChallenge: ''
    });
  };




  useEffect(() => {
    if (currentView !== 'main') return;

    const options = { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, options);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        sectionRefs.current[id] = el;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [currentView]);

  // Contact form
  const [contact, setContact] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!contact.name.trim()) newErrors.name = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contact.email.trim() || !emailRegex.test(contact.email)) newErrors.email = true;
    if (!contact.subject.trim()) newErrors.subject = true;
    if (!contact.message.trim()) newErrors.message = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log('Sending contact form with data:', {
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
        },
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error details:', error);
        throw error;
      }

      setShowSuccess(true);
      setContact({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Failed to send message: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  // Members Dashboard Component
  const MembersDashboard = () => (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-[#001F3F] mb-2">
                Welcome Back, {currentUser?.fullName}!
              </h1>
              <p className="text-gray-600">Access all exclusive member content below</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700">Premium Member</span>
            </div>
          </div>

          {/* User Profile Info Card */}
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                Email
              </div>
              <div className="text-sm font-medium text-gray-900">{currentUser?.email}</div>
            </div>

            {currentUser?.businessName && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                  Business
                </div>
                <div className="text-sm font-medium text-gray-900">{currentUser?.businessName}</div>
              </div>
            )}

            {currentUser?.industry && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                  Industry
                </div>
                <div className="text-sm font-medium text-gray-900">{currentUser?.industry}</div>
              </div>
            )}

            {currentUser?.cellNumber && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                  Phone
                </div>
                <div className="text-sm font-medium text-gray-900">{currentUser?.cellNumber}</div>
              </div>
            )}

            {currentUser?.location && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                  Location
                </div>
                <div className="text-sm font-medium text-gray-900">{currentUser?.location}</div>
              </div>
            )}

            {currentUser?.businessChallenge && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                  Business Challenge
                </div>
                <div className="text-sm font-medium text-gray-900">{currentUser?.businessChallenge}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-[#001F3F] mb-4">Exclusive Member Shows</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Full access to all episodes, extended interviews, and bonus content.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shows.map((s) => (
              <article key={s.id} className="group rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className="h-56 bg-gray-100 overflow-hidden relative">
                  <img src={s.img} alt={s.host} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">UNLOCKED</div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{s.host}</div>
                  <h3 className="text-lg font-bold text-[#001F3F] mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{s.desc}</p>
                  <button
                    onClick={() => {
                      setMemberTab(s.id);
                      const el = document.getElementById('member-player');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-[#001F3F] cursor-pointer text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition"
                  >
                    Watch Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div id="member-player" className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                <iframe
                  title="Member episode player"
                  className="w-full h-full"
                  src={currentEpisode[memberTab]?.videoUrl || shows.find(s => s.id === memberTab)?.episodes[0]?.videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-[#001F3F]">{shows.find(s => s.id === memberTab)?.title}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-1">Hosted by {shows.find(s => s.id === memberTab)?.host}</p>
                <p className="text-lg font-semibold text-[#001F3F] mb-3">
                  Episode {currentEpisode[memberTab]?.id || 1}: {currentEpisode[memberTab]?.title || shows.find(s => s.id === memberTab)?.episodes[0]?.title}
                </p>
                <p className="text-gray-700 leading-relaxed">{shows.find(s => s.id === memberTab)?.desc}</p>
              </div>
            </div>

            <aside className="space-y-3">
              <h4 className="font-bold text-[#001F3F] mb-4">All Episodes</h4>
              {shows.find(s => s.id === memberTab)?.episodes?.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => setCurrentEpisode({ ...currentEpisode, [memberTab]: episode })}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer group ${currentEpisode[memberTab]?.id === episode.id
                    ? 'border-[#001F3F] bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-[#001F3F] hover:shadow-md'
                    }`}
                >
                  <div className={`w-16 h-12 rounded flex items-center justify-center flex-shrink-0 ${currentEpisode[memberTab]?.id === episode.id ? 'bg-[#001F3F]' : 'bg-gradient-to-br from-blue-900 to-gray-700'
                    }`}>
                    <Play className="w-5 h-5 text-white group-hover:scale-110 transition" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">Episode {episode.id}</div>
                    <div className="text-xs text-gray-500 truncate">{episode.title}</div>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
  if (currentView === 'members-dashboard' && isAuthenticated) {
    return (
      <div className="min-h-screen font-sans antialiased text-gray-900 bg-white">
        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setChangePasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                  setChangePasswordErrors({});
                }}
                className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#001F3F] mb-2">Change Password</h2>
                <p className="text-gray-600">Update your account password</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={changePasswordForm.currentPassword}
                    onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                    className={`w-full p-3 border-2 rounded-lg outline-none transition ${changePasswordErrors.currentPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'
                      }`}
                    placeholder="Enter current password"
                  />
                  {changePasswordErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{changePasswordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={changePasswordForm.newPassword}
                    onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                    className={`w-full p-3 border-2 rounded-lg outline-none transition ${changePasswordErrors.newPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'
                      }`}
                    placeholder="Enter new password"
                  />
                  {changePasswordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{changePasswordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={changePasswordForm.confirmNewPassword}
                    onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmNewPassword: e.target.value })}
                    className={`w-full p-3 border-2 rounded-lg outline-none transition ${changePasswordErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'
                      }`}
                    placeholder="Confirm new password"
                  />
                  {changePasswordErrors.confirmNewPassword && (
                    <p className="text-red-500 text-xs mt-1">{changePasswordErrors.confirmNewPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}


        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => {
                setShowAuthModal(false);
                setRegistrationStep(1);
              }} className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#001F3F] mb-2">
                  {authMode === 'login' ? 'Welcome Back' : registrationStep === 1 ? 'Create Account - Step 1' : 'Create Account - Step 2'}
                </h2>
                <p className="text-gray-600">
                  {authMode === 'login'
                    ? 'Login to access member content'
                    : registrationStep === 1
                      ? 'Personal Information'
                      : 'Business Information'}
                </p>
                {authMode === 'register' && (
                  <div className="flex justify-center gap-2 mt-4">
                    <div className={`h-2 w-16 rounded-full ${registrationStep === 1 ? 'bg-[#001F3F]' : 'bg-gray-300'}`}></div>
                    <div className={`h-2 w-16 rounded-full ${registrationStep === 2 ? 'bg-[#001F3F]' : 'bg-gray-300'}`}></div>
                  </div>
                )}
              </div>

              {authErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {authErrors.general}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && registrationStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={authForm.fullName}
                        onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.fullName ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Enter your full name"
                      />
                      {authErrors.fullName && <p className="text-red-500 text-xs mt-1">{authErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={authForm.username}
                        onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.username ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="your@email.com"
                      />
                      {authErrors.username && <p className="text-red-500 text-xs mt-1">{authErrors.username}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${authErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {authErrors.password && <p className="text-red-500 text-xs mt-1">{authErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={authForm.confirmPassword}
                          onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                          className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${authErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {authErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{authErrors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                      Continue to Business Info
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setAuthErrors({});
                        }}
                        className="text-sm cursor-pointer text-[#001F3F] hover:underline"
                      >
                        Already have an account? Login
                      </button>
                    </div>
                  </>
                )}

                {authMode === 'register' && registrationStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={authForm.businessName}
                      onChange={(e) => setAuthForm({ ...authForm, businessName: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.businessName ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="Your business name"
                    />
                    {authErrors.businessName && <p className="text-red-500 text-xs mt-1">{authErrors.businessName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Industry</label>
                    <select
                      value={authForm.industry}
                      onChange={(e) => setAuthForm({ ...authForm, industry: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.industry ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                    >
                      <option value="">Select your industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Education">Education</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Other">Other</option>
                    </select>
                    {authErrors.industry && <p className="text-red-500 text-xs mt-1">{authErrors.industry}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cell Number (SA)</label>
                    <input
                      type="tel"
                      value={authForm.cellNumber}
                      onChange={(e) => setAuthForm({ ...authForm, cellNumber: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.cellNumber ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="0821234567"
                    />
                    {authErrors.cellNumber && <p className="text-red-500 text-xs mt-1">{authErrors.cellNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={authForm.location}
                      onChange={(e) => setAuthForm({ ...authForm, location: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.location ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="City, Province"
                    />
                    {authErrors.location && <p className="text-red-500 text-xs mt-1">{authErrors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Business Challenge</label>
                    <textarea
                      value={authForm.businessChallenge}
                      onChange={(e) => setAuthForm({ ...authForm, businessChallenge: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.businessChallenge ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="Describe your main business challenge..."
                      rows={3}
                    />
                    {authErrors.businessChallenge && <p className="text-red-500 text-xs mt-1">{authErrors.businessChallenge}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationStep(1);
                        setAuthErrors({});
                      }}
                      className="flex-1 border-2 cursor-pointer border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button type="submit" className="flex-1 bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                      Complete Registration
                    </button>
                  </div>
                </>
              )}

              {authMode === 'reset-password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetPasswordErrors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {resetPasswordErrors.general}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={resetPasswordForm.newPassword}
                        onChange={(e) => {
                          setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value });
                          if (resetPasswordErrors.newPassword) {
                            setResetPasswordErrors({ ...resetPasswordErrors, newPassword: '' });
                          }
                        }}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${resetPasswordErrors.newPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Enter new password (min 6 characters)"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {resetPasswordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{resetPasswordErrors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={resetPasswordForm.confirmPassword}
                        onChange={(e) => {
                          setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value });
                          if (resetPasswordErrors.confirmPassword) {
                            setResetPasswordErrors({ ...resetPasswordErrors, confirmPassword: '' });
                          }
                        }}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${resetPasswordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {resetPasswordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{resetPasswordErrors.confirmPassword}</p>}
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
                  >
                    Reset Password
                  </button>
                </form>
              )}

                {authMode === 'login' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={authForm.username}
                        onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.username ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="your@email.com"
                      />
                      {authErrors.username && <p className="text-red-500 text-xs mt-1">{authErrors.username}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${authErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {authErrors.password && <p className="text-red-500 text-xs mt-1">{authErrors.password}</p>}
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAuthModal(false);
                          setShowForgotPassword(true);
                        }}
                        className="text-sm cursor-pointer text-[#001F3F] hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button type="submit" className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                      Login
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setRegistrationStep(1);
                          setAuthErrors({});
                        }}
                        className="text-sm cursor-pointer text-[#001F3F] hover:underline"
                      >
                        Don't have an account? Register
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
        <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('main')}>
                <div className="w-12 h-12 rounded-full bg-[#001F3F] flex items-center justify-center overflow-hidden">
                  <img src={logo} alt="Corp Radio logo" className="object-cover w-full h-full " />
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-[#001F3F]">Corp Radio</div>
                  <div className="text-xs text-gray-600">Members Area</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <Users className="w-4 h-4 text-[#001F3F]" />
                  <span className="text-sm font-semibold text-[#001F3F]">{currentUser?.fullName}</span>                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="text-sm cursor-pointer font-medium text-[#001F3F] hover:text-blue-800 transition"
                >
                  Change Password
                </button>
                <button onClick={() => setCurrentView('main')} className="text-sm cursor-pointer font-medium text-gray-600 hover:text-[#001F3F] transition">
                  Back to Home
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-2 cursor-pointer bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        <MembersDashboard />
      </div>
    );
  }

  // Legal Modal Component
  const LegalModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={() => setShowLegalModal(false)}
className="sticky cursor-pointer top-4 left-full -ml-10 text-gray-400 hover:text-gray-600 z-10"        >
          <X className="w-6 h-6" />
        </button>

        <div className="prose prose-sm max-w-none">
          {legalContent === 'privacy' ? (
            <>
              <h2 className="text-3xl font-bold text-[#001F3F] mb-6">Privacy Policy</h2>

              <div className="bg-blue-50 border-l-4 border-[#001F3F] p-4 mb-6">
                <h3 className="text-xl font-bold text-[#001F3F] mb-2">Your Privacy Matters to Us</h3>
              </div>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">Data Collection</h3>
              <p className="text-gray-700 mb-4">
                We collect information you provide, such as email addresses for newsletter subscriptions or account creation.
                We may also collect usage data (e.g., podcast plays, clicks, and interactions) to improve your experience.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">Use of Data</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>To provide, maintain, and improve the Service.</li>
                <li>To send updates, announcements, or promotional content (only if you opt-in).</li>
                <li>To comply with legal obligations.</li>
              </ul>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">Third-Party Services</h3>
              <p className="text-gray-700 mb-4">
                We may use third-party analytics or hosting services, who may process some of your data.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">Cookies</h3>
              <p className="text-gray-700 mb-4">
                Corp Radio uses cookies to enhance user experience, track engagement, and personalize content.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">Data Protection</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>We do not sell your personal information.</li>
                <li>You can request access, updates, or deletion of your data by contacting us.</li>
              </ul>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">Consent</h3>
              <p className="text-gray-700 mb-4">
                By continuing to use the Service, you consent to our Privacy Policy and Terms of Service.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">Contact Information</h3>
              <p className="text-gray-700">
                For questions or concerns regarding this Privacy Policy, please contact: <a href="mailto:info@corpradio.online" className="text-[#001F3F] hover:underline">info@corpradio.online</a>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-[#001F3F] mb-6">Terms of Service</h2>
              <p className="text-sm text-gray-500 mb-6">Effective Date: January 2025</p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-700 mb-4">
                By accessing or using Corp Radio ("the Service"), you agree to comply with these Terms of Service. If you do not agree, you may not access or use the Service.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">2. Eligibility</h3>
              <p className="text-gray-700 mb-4">
                Accounts are intended for users 18 years of age or older. By creating an account or using the Service, you confirm that you meet this age requirement.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">3. Nature of Content</h3>
              <p className="text-gray-700 mb-4">
                Corp Radio provides business advice, interviews, and discussions for general informational purposes only. Content may include: podcasts, radio broadcasts, written commentary, or advice shared by presenters and guests. Some scenarios discussed may be fictional, hypothetical, or generalized and may not reflect real situations.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">4. No Professional Advice</h3>
              <p className="text-gray-700 mb-4">
                The content is not personalized business advice. For specific business, legal, financial, or investment guidance, users must consult a licensed, trained, or registered professional in the relevant field. Corp Radio, Lester Philander, presenters, and affiliates are not liable for any decisions, losses, or damages resulting from the use of content from the Service.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">5. User Conduct</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You may not use the Service for unlawful purposes or to violate any applicable laws.</li>
                <li>Users must not post harmful, threatening, abusive, defamatory, or infringing content.</li>
                <li>Accounts may be suspended or terminated for violations of these Terms.</li>
              </ul>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">6. Intellectual Property</h3>
              <p className="text-gray-700 mb-4">
                All content, including audio, video, graphics, and written material, is owned or licensed by Corp Radio. Users may stream or download content for personal, non-commercial use only. Reproduction, distribution, or modification without permission is prohibited.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">7. Third-Party Links and Advertisements</h3>
              <p className="text-gray-700 mb-4">
                The Service may include links to third-party websites, sponsors, or advertisers. Corp Radio is not responsible for content or practices of third parties, including any losses, damages, or legal implications.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">8. Limitation of Liability</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Use at Your Own Risk:</strong> All content is provided "as is."</li>
                <li><strong>No Warranties:</strong> Corp Radio does not guarantee accuracy, completeness, or reliability of content.</li>
                <li><strong>Disclaimer of Damages:</strong> Under no circumstances shall Corp Radio, its presenters, affiliates, or partners be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Service.</li>
              </ul>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">9. Termination</h3>
              <p className="text-gray-700 mb-4">
                Corp Radio reserves the right to suspend or terminate accounts or access to the Service at any time, for any reason, including violation of these Terms.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">10. Changes to Terms</h3>
              <p className="text-gray-700 mb-4">
                Corp Radio may update these Terms at any time. Users will be notified via email or a notice on the Service. Continued use after updates constitutes acceptance of the revised Terms.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">11. Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of South Africa.
              </p>

              <h3 className="text-xl font-bold text-[#001F3F] mt-6 mb-3">12. Contact Information</h3>
              <p className="text-gray-700">
                For questions or concerns regarding these Terms, please contact: <a href="mailto:info@corpradio.online" className="text-[#001F3F] hover:underline">info@corpradio.online</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen font-sans antialiased text-gray-900 bg-white">
      {/* Success Popup */}
      {
        showSuccessPopup && (
          <div className="fixed top-24 right-4 z-[70] animate-slide-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 border-l-4 border-green-500 max-w-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Success!</h3>
                  <p className="text-sm text-gray-600">{successMessage}</p>
                </div>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#001F3F] mb-2">Confirm Logout</h2>
              <p className="text-gray-600">Are you sure you want to logout?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border-2 cursor-pointer border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setResetErrors({});
                setShowResetSuccess(false);
              }}
              className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#001F3F]" />
              </div>
              <h2 className="text-2xl font-bold text-[#001F3F] mb-2">Forgot Password?</h2>
              <p className="text-gray-600">Enter your email to reset your password</p>
            </div>

            {showResetSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email!</h3>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <span className="font-semibold text-[#001F3F]">{resetEmail}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setResetErrors({});
                    }}
                    className={`w-full p-3 border-2 rounded-lg outline-none transition ${resetErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'
                      }`}
                    placeholder="your@email.com"
                  />
                  {resetErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{resetErrors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
                >
                  Reset Password
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setShowAuthModal(true);
                    }}
                    className="text-sm cursor-pointer text-[#001F3F] hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )
      }

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowChangePassword(false);
                setChangePasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                setChangePasswordErrors({});
              }}
              className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#001F3F] mb-2">Change Password</h2>
              <p className="text-gray-600">Update your account password</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                  className={`w-full p-3 border-2 rounded-lg outline-none transition ${changePasswordErrors.currentPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'
                    }`}
                  placeholder="Enter current password"
                />
                {changePasswordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{changePasswordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                  className={`w-full p-3 border-2 rounded-lg outline-none transition ${changePasswordErrors.newPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'
                    }`}
                  placeholder="Enter new password"
                />
                {changePasswordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{changePasswordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={changePasswordForm.confirmNewPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmNewPassword: e.target.value })}
                  className={`w-full p-3 border-2 rounded-lg outline-none transition ${changePasswordErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'
                    }`}
                  placeholder="Confirm new password"
                />
                {changePasswordErrors.confirmNewPassword && (
                  <p className="text-red-500 text-xs mt-1">{changePasswordErrors.confirmNewPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Video Popup */}
      {showVideoPopup && selectedShow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col relative">
            <button
              onClick={() => {
                setShowVideoPopup(false);
                setSelectedShow(null);
              }}
              className="absolute cursor-pointer -top-12 right-0 text-white hover:text-gray-300 transition z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="p-4 sm:p-6 flex flex-col gap-3 h-full">
              {/* Header */}
              <div className="flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold text-[#001F3F] mb-1">{selectedShow.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Hosted by {selectedShow.host}</p>
              </div>

              <div className="flex-shrink-0 w-full">
                <video className="w-full rounded-xl bg-black" style={{ maxHeight: '50vh' }} controls autoPlay>
                  <source src={selectedShow.previewVideo || introVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              {/* Description and Button */}
              <div className="flex-shrink-0">
                <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-2">{selectedShow.desc}</p>
                <button
                  onClick={() => {
                    setShowVideoPopup(false);
                    setSelectedShow(null);
                  }}
                  className="w-full bg-[#001F3F] cursor-pointer text-white py-2.5 rounded-lg font-bold hover:bg-blue-900 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => {
              setShowAuthModal(false);
              setRegistrationStep(1);
            }} className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#001F3F] mb-2">
                {authMode === 'login' ? 'Welcome Back' : authMode === 'reset-password' ? 'Reset Your Password' : registrationStep === 1 ? 'Create Account - Step 1' : 'Create Account - Step 2'}
              </h2>
              <p className="text-gray-600">
                {authMode === 'login'
                  ? 'Login to access member content'
                  : authMode === 'reset-password'
                    ? 'Enter your new password'
                    : registrationStep === 1
                      ? 'Personal Information'
                      : 'Business Information'}
              </p>
              {authMode === 'register' && (
                <div className="flex justify-center gap-2 mt-4">
                  <div className={`h-2 w-16 rounded-full ${registrationStep === 1 ? 'bg-[#001F3F]' : 'bg-gray-300'}`}></div>
                  <div className={`h-2 w-16 rounded-full ${registrationStep === 2 ? 'bg-[#001F3F]' : 'bg-gray-300'}`}></div>
                </div>
              )}
            </div>

            {authErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {authErrors.general}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && registrationStep === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.fullName ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="Enter your full name"
                    />
                    {authErrors.fullName && <p className="text-red-500 text-xs mt-1">{authErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.username ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="your@email.com"
                    />
                    {authErrors.username && <p className="text-red-500 text-xs mt-1">{authErrors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${authErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {authErrors.password && <p className="text-red-500 text-xs mt-1">{authErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${authErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {authErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{authErrors.confirmPassword}</p>}
                  </div>

                  <button type="submit" className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                    Continue to Business Info
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthErrors({});
                      }}
                      className="text-sm cursor-pointer text-[#001F3F] hover:underline"
                    >
                      Already have an account? Login
                    </button>
                  </div>
                </>
              )}

              {authMode === 'register' && registrationStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={authForm.businessName}
                      onChange={(e) => setAuthForm({ ...authForm, businessName: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.businessName ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="Your business name"
                    />
                    {authErrors.businessName && <p className="text-red-500 text-xs mt-1">{authErrors.businessName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Industry</label>
                    <select
                      value={authForm.industry}
                      onChange={(e) => setAuthForm({ ...authForm, industry: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.industry ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                    >
                      <option value="">Select your industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Education">Education</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Other">Other</option>
                    </select>
                    {authErrors.industry && <p className="text-red-500 text-xs mt-1">{authErrors.industry}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cell Number (SA)</label>
                    <input
                      type="tel"
                      value={authForm.cellNumber}
                      onChange={(e) => setAuthForm({ ...authForm, cellNumber: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.cellNumber ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="0821234567"
                    />
                    {authErrors.cellNumber && <p className="text-red-500 text-xs mt-1">{authErrors.cellNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={authForm.location}
                      onChange={(e) => setAuthForm({ ...authForm, location: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.location ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="City, Province"
                    />
                    {authErrors.location && <p className="text-red-500 text-xs mt-1">{authErrors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Business Challenge</label>
                    <textarea
                      value={authForm.businessChallenge}
                      onChange={(e) => setAuthForm({ ...authForm, businessChallenge: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.businessChallenge ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="Describe your main business challenge..."
                      rows={3}
                    />
                    {authErrors.businessChallenge && <p className="text-red-500 text-xs mt-1">{authErrors.businessChallenge}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationStep(1);
                        setAuthErrors({});
                      }}
                      className="flex-1 border-2 cursor-pointer border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button type="submit" className="flex-1 bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                      Complete Registration
                    </button>
                  </div>
                </>
              )}

              {authMode === 'reset-password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetPasswordErrors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {resetPasswordErrors.general}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={resetPasswordForm.newPassword}
                        onChange={(e) => {
                          setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value });
                          if (resetPasswordErrors.newPassword) {
                            setResetPasswordErrors({ ...resetPasswordErrors, newPassword: '' });
                          }
                        }}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${resetPasswordErrors.newPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Enter new password (min 6 characters)"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {resetPasswordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{resetPasswordErrors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={resetPasswordForm.confirmPassword}
                        onChange={(e) => {
                          setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value });
                          if (resetPasswordErrors.confirmPassword) {
                            setResetPasswordErrors({ ...resetPasswordErrors, confirmPassword: '' });
                          }
                        }}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${resetPasswordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {resetPasswordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{resetPasswordErrors.confirmPassword}</p>}
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
                  >
                    Reset Password
                  </button>
                </form>
              )}

              {authMode === 'login' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg outline-none transition ${authErrors.username ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                      placeholder="your@email.com"
                    />
                    {authErrors.username && <p className="text-red-500 text-xs mt-1">{authErrors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        className={`w-full p-3 border-2 rounded-lg outline-none transition pr-10 ${authErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#001F3F]'}`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {authErrors.password && <p className="text-red-500 text-xs mt-1">{authErrors.password}</p>}
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthModal(false);
                        setShowForgotPassword(true);
                      }}
                      className="text-sm cursor-pointer text-[#001F3F] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className="w-full bg-[#001F3F] cursor-pointer text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                    Login
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setRegistrationStep(1);
                        setAuthErrors({});
                      }}
                      className="text-sm cursor-pointer text-[#001F3F] hover:underline"
                    >
                      Don't have an account? Register
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => scrollTo("hero")}>
              <div className="w-12 h-12 rounded-full bg-[#001F3F] flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Corp Radio logo" className="object-cover w-full h-full " />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-[#001F3F]">Corp Radio</div>
                <div className="text-xs text-gray-600">Tuned Into The Business Frequency</div>
              </div>
            </div>

            <nav className="hidden md:!flex items-center gap-2">
              {[
                { label: "Shows", id: "shows" },
                { label: "Public Episodes", id: "radio" },
                { label: "Introduction", id: "introduction" },
                { label: "About", id: "about" },
                { label: "Contact", id: "contact" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`text-sm cursor-pointer font-medium px-4 py-2 transition-all border-b-2 ${active === link.id
                    ? "text-[#001F3F] border-[#001F3F]"
                    : "text-gray-600 border-transparent hover:text-[#001F3F] hover:border-[#001F3F]"
                    }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:!flex items-center gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setCurrentView('members-dashboard')}
                    className="flex items-center cursor-pointer gap-2 text-sm font-semibold text-[#001F3F] hover:text-blue-800 transition"
                  >
                    <Users className="w-4 h-4" />
                    {currentUser?.fullName}
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center cursor-pointer gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-semibold">Logout</span>
                  </button>
                </>
              ) : (
                <>

                  <button
                    onClick={() => openAuthModal('login')}
                    className="bg-[#001F3F] text-white cursor-pointer text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-900 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="bg-[#001F3F] text-white cursor-pointer text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-900 transition"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            <button className="md:hidden cursor-pointer p-2 rounded-md text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen((s) => !s)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <button className="text-left px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-50 rounded" onClick={() => { scrollTo("shows"); setMenuOpen(false); }}>Shows</button>
                <button className="text-left px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-50 rounded" onClick={() => { scrollTo("radio"); setMenuOpen(false); }}>Public Episodes</button>
                <button className="text-left px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-50 rounded" onClick={() => { scrollTo("introduction"); setMenuOpen(false); }}>Introduction</button>
                <button className="text-left px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-50 rounded" onClick={() => { scrollTo("about"); setMenuOpen(false); }}>About</button>
                <button className="text-left px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-50 rounded" onClick={() => { scrollTo("contact"); setMenuOpen(false); }}>Contact</button>
                <div className="flex gap-3 px-3 pt-4">
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => setCurrentView('members-dashboard')} className="flex-1 bg-[#001F3F] cursor-pointer text-white rounded-lg py-2.5 font-semibold">
                        Dashboard
                      </button>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex-1 border-2 cursor-pointer border-red-600 text-red-600 rounded-lg py-2.5 font-semibold"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* <button onClick={() => scrollTo("contact")} className="flex-1 bg-[#001F3F] cursor-pointer text-white rounded-lg py-2.5 font-semibold">
                        Advertise
                      </button> */}
                      <button onClick={() => openAuthModal('login')} className="flex-1 border-2 cursor-pointer border-[#001F3F] text-[#001F3F] rounded-lg py-2.5 font-semibold">
                        Login
                      </button>
                      <button onClick={() => openAuthModal('register')} className="flex-1 border-2 cursor-pointer border-[#001F3F] text-[#001F3F] rounded-lg py-2.5 font-semibold">
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <section id="hero" className="relative pt-20 min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,31,63,0.75), rgba(0,31,63,0.85)),url(${heroBg})` }}
        />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Founded 2025 • South Africa</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6">
              Your Business Growth,<br />
              <span className="text-gray-200">One Podcast at a Time</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              Premium content, mentorship and networking for CEOs, founders and senior leaders—actionable episodes you can use today.
            </p>
            <div className="flex flex-row lg:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => scrollTo("introduction")}
                className="bg-white cursor-pointer text-[#001F3F] px-8 py-4 rounded-lg font-bold shadow-xl hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Welcome to Corp Radio
              </button>
              <button
                onClick={() => isAuthenticated ? setCurrentView('members-dashboard') : openAuthModal('register')}
                className="border-2 cursor-pointer border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-[#001F3F] transition-all"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Become a Member (Free)'}
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-12 text-white">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">100+</div>
                <div className="text-sm text-gray-300">High-value guests</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-sm text-gray-300">Episodes & growing</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">4</div>
                <div className="text-sm text-gray-300">Expert shows</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="shows" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#001F3F] mb-4">
              Our Shows
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Short, high-value series hosted by experienced presenters—tailored to
              business outcomes.
            </p>
          </div>

          {/* Centered grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {shows.map((s) => (
              <article
                key={s.id}
                className="group rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white w-full max-w-sm"
              >
                <div className="h-56 bg-gray-100 overflow-hidden relative">
                  <img
                    src={s.img}
                    alt={s.host}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {!s.isPublic && !isAuthenticated && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      LOCKED
                    </div>
                  )}
                  {!s.isPublic && isAuthenticated && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">UNLOCKED</div>
                  )}
                  {s.isPublic && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">FREE</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                    {s.host}
                  </div>
                  <h3 className="text-lg font-bold text-[#001F3F] mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {s.desc}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {/* Listen button is ALWAYS accessible - shows preview video */}
                    <button
                      onClick={() => {
                        setSelectedShow(s);
                        setShowVideoPopup(true);
                      }}
                      className="flex-1 cursor-pointer text-sm font-semibold text-[#001F3F] hover:bg-blue-50 py-2 rounded transition"
                    >
                      Listen
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="radio" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#001F3F] mb-2">Radio Shows — Public Access</h2>
              <p className="text-gray-600 text-lg">Select a show and listen to long-form episodes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {shows.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPublicTab(s.id)}
                  className={`px-5 cursor-pointer py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${publicTab === s.id
                    ? "bg-[#001F3F] text-white shadow-lg"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#001F3F]"
                    }`}
                >
                  {s.title.replace("Show", "Show").trim()}
                  {!s.isPublic && !isAuthenticated && <Lock className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 lg:p-8 relative">
            {!shows.find(s => s.id === publicTab)?.isPublic && !isAuthenticated && (
              <div className="absolute inset-0 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                  <div className="w-20 h-20 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#001F3F] mb-3">Member Content</h3>
                  <p className="text-gray-600 mb-6">Login or register for free to access this show and all exclusive content.</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="bg-[#001F3F] cursor-pointer text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 transition"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="border-2 cursor-pointer border-[#001F3F] text-[#001F3F] px-6 py-3 rounded-lg font-bold hover:bg-[#001F3F] hover:!text-white transition"
                    >
                      Register Free
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={(!shows.find(s => s.id === publicTab)?.isPublic && !isAuthenticated) ? 'opacity-30 pointer-events-none' : ''}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    {shows.find(s => s.id === publicTab)?.videoType === 'facebook' ? (
                      <iframe
                        title="Public episode player"
                        className="w-full h-full"
                        src={currentEpisode[publicTab]?.videoUrl || shows.find(s => s.id === publicTab)?.episodes[0]?.videoUrl}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <iframe
                        title="Public episode player"
                        className="w-full h-full"
                        src={currentEpisode[publicTab]?.videoUrl || shows.find(s => s.id === publicTab)?.episodes[0]?.videoUrl}
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-2xl font-bold text-[#001F3F]">{shows.find(s => s.id === publicTab)?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-1">Hosted by {shows.find(s => s.id === publicTab)?.host}</p>
                    <p className="text-lg font-semibold text-[#001F3F] mb-3">
                      Episode {currentEpisode[publicTab]?.id || 1}: {currentEpisode[publicTab]?.title || shows.find(s => s.id === publicTab)?.episodes[0]?.title}
                    </p>
                    <p className="text-gray-700 leading-relaxed">{shows.find(s => s.id === publicTab)?.desc}</p>
                  </div>
                </div>

                <aside className="space-y-3">
                  <h4 className="font-bold text-[#001F3F] mb-4">Episodes</h4>
                  {shows.find(s => s.id === publicTab)?.episodes?.map((episode) => (
                    <div
                      key={episode.id}
                      onClick={() => setCurrentEpisode({ ...currentEpisode, [publicTab]: episode })}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer group ${currentEpisode[publicTab]?.id === episode.id
                        ? 'border-[#001F3F] bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-[#001F3F] hover:shadow-md'
                        }`}
                    >
                      <div className={`w-16 h-12 rounded flex items-center justify-center flex-shrink-0 ${currentEpisode[publicTab]?.id === episode.id ? 'bg-[#001F3F]' : 'bg-gradient-to-br from-blue-900 to-gray-700'
                        }`}>
                        <Play className="w-5 h-5 text-white group-hover:scale-110 transition" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">Episode {episode.id}</div>
                        <div className="text-xs text-gray-500 truncate">{episode.title}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button
                      onClick={() => scrollTo('contact')}
                      className="w-full cursor-pointer bg-[#001F3F] text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition shadow-md"
                    >
                      Want to be a guest?
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section id="members" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Award className="mx-auto text-[#001F3F] w-16 h-16 mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-[#001F3F] mb-4">Members Only Content</h2>
              <p className="text-gray-600 text-lg mb-8">Extended interviews, exclusive resources and behind-the-scenes content. Join our community for free.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => isAuthenticated ? setCurrentView('members-dashboard') : openAuthModal('register')}
                  className="bg-[#001F3F] cursor-pointer text-white px-8 py-4 rounded-lg font-bold shadow-xl hover:bg-blue-900 transition-all transform hover:scale-105"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Become a Member (Free)'}
                </button>
                {!isAuthenticated && (
                  <button
                    onClick={() => openAuthModal('login')}
                    className="border-2 cursor-pointer border-[#001F3F] text-[#001F3F] px-8 py-4 rounded-lg font-bold hover:bg-[#001F3F] hover:!text-white transition-all transform hover:scale-105"
                  >
                    Already a Member? Login
                  </button>
                )}
              </div>
            </div>

            <div className="max-w-5xl mx-auto relative">
              {!isAuthenticated && videoWatchTime >= 30 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <Lock className="w-16  from-black/80 via-black/20 h-16 text-white mx-auto mb-4" />
                    <p className="text-white text-xl font-bold mb-2">Preview Time Expired</p>
                    <p className="text-white text-sm mb-4">Register now to continue watching</p>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="bg-white cursor-pointer text-[#001F3F] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
                    >
                      Register to Continue
                    </button>
                  </div>
                </div>
              )}

              {!isAuthenticated && videoWatchTime > 0 && videoWatchTime < 30 && showTimeoutWarning && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">{10 - videoWatchTime}s remaining - Register to continue</span>
                </div>
              )}

              <div className={`aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ${!isAuthenticated && videoWatchTime >= 30 ? 'blur-sm pointer-events-none' : ''}`}>
                <iframe
                  title="Members sample"
                  className="w-full h-full"
                  src={shows.find(s => s.id === memberTab)?.episodes[3]?.videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => {
                    if (!isAuthenticated) {
                      setVideoWatchTime(1); // Start the timer when video loads
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}
      <section id="introduction" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Free Preview - No Login Required</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#001F3F] mb-4">Welcome to Corp Radio</h2>
            <p className="text-gray-600 text-lg mb-8">Get a taste of what we offer with this free introduction video. See how our content can help transform your business.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                className="w-full h-full"
                controls
                poster={intro}
              >
                <source src={introVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-700 mb-6">Ready to access our full library of exclusive content?</p>
              <button
                onClick={() => isAuthenticated ? setCurrentView('members-dashboard') : openAuthModal('register')}
                className="bg-[#001F3F] cursor-pointer text-white px-8 py-4 rounded-lg font-bold shadow-xl hover:bg-blue-900 transition-all transform hover:scale-105"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Register Free - Unlock All Content'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-[#001F3F] mb-6">About Corp Radio</h3>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Corporates and NPOs for content on Growth, Funding, Marketing, Sales and AI. With knowledgeable presenters and interviewees, Corp Radio becomes the go-to place for established and growing enterprises to get business advice, inspiration and to join a community that fosters collaboration and growth.              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Founded in 2025, Corp Radio forms part of a bigger flywheel and eco-system for entrepreneurs and NPOs. We host networking events (for members), raise funds and coach businesses bot on-air and face to face.              </p>
              <div className="space-y-4 mb-8"></div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#001F3F]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#001F3F] mb-1">Business Growth Strategies</h4>
                    <p className="text-sm text-gray-600">Proven tactics and insights for scaling your business</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#001F3F]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#001F3F] mb-1">Networking & Events</h4>
                    <p className="text-sm text-gray-600">Connect with like-minded leaders and professionals</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-[#001F3F]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#001F3F] mb-1">Expert Coaching</h4>
                    <p className="text-sm text-gray-600">Access to mentorship and exclusive resources</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollTo('contact')}
                  className="bg-[#001F3F] cursor-pointer text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 transition"
                >
                  Get in Touch
                </button>
                <button
                  onClick={() => isAuthenticated ? setCurrentView('members-dashboard') : openAuthModal('register')}
                  className="border-2 cursor-pointer border-[#001F3F] text-[#001F3F] px-6 py-3 rounded-lg font-bold hover:bg-[#001F3F] hover:!text-white transition"
                >
                  Join Community
                </button>
              </div>
            </div>
            <div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop"
                  alt="Business team collaboration"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-[#001F3F] mb-4">Get in Touch</h3>
            <p className="text-gray-600 text-lg">Questions about shows, partnerships or memberships? We'd love to hear from you.</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-6 h-full">
                <div className="bg-gradient-to-br from-[#001F3F] to-blue-900 p-8 rounded-2xl shadow-xl text-white flex-grow">
                  <h4 className="font-bold text-2xl mb-6">Contact Information</h4>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-200 mb-1">Phone</div>
                        <a href="tel:0612019633" className="font-semibold text-lg hover:text-gray-200 transition">061 201 9633</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-200 mb-1">Email</div>
                        <a href="mailto:info@corpradio.online" className="font-semibold text-lg hover:text-gray-200 transition break-all">info@corpradio.online</a>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <div className="text-sm text-gray-200 mb-4">Follow Us on Social Media</div>
                    <div className="flex gap-3">
                      <a href="http://www.youtube.com/@CorpradioZA" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition transform hover:scale-110">
                        <Youtube className="w-6 h-6" />
                      </a>
                      <a href="https://www.linkedin.com/company/corp-radio/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition transform hover:scale-110">
                        <Linkedin className="w-6 h-6" />
                      </a>
                      <a href="https://www.instagram.com/corp_radio?igsh=bG5rbzZkNDcwMHFr" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition transform hover:scale-110">
                        <Instagram className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#001F3F] to-blue-900 p-6 rounded-xl shadow-md text-white">
                  <h5 className="font-bold mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Business Hours
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="font-medium">Monday - Friday:</span>
                      <span className="font-semibold">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="font-medium">Saturday:</span>
                      <span className="font-semibold">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Sunday:</span>
                      <span className="font-semibold text-gray-400">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
                <h4 className="font-bold text-[#001F3F] mb-4 text-2xl">Send us a Message</h4>
                <p className="text-gray-600 mb-4">Fill out the form below and we'll get back to you within 24 hours.</p>
                {showSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h5 className="font-bold text-green-800 mb-1">Message Sent Successfully!</h5>
                      <p className="text-sm text-green-700">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={contact.name}
                      onChange={onChange}
                      placeholder="John Doe"
                      className={`w-full p-2 rounded-lg border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F3F] focus:ring-2 focus:ring-blue-100 outline-none transition`}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={contact.email}
                      onChange={onChange}
                      placeholder="john@company.com"
                      className={`w-full p-2 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F3F] focus:ring-2 focus:ring-blue-100 outline-none transition`}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      value={contact.subject}
                      onChange={onChange}
                      placeholder="Partnership Inquiry"
                      className={`w-full p-2 rounded-lg border-2 ${errors.subject ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F3F] focus:ring-2 focus:ring-blue-100 outline-none transition`}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={contact.message}
                      onChange={onChange}
                      rows={3}
                      placeholder="Tell us about your inquiry..."
                      className={`w-full p-4 rounded-lg border-2 ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F3F] focus:ring-2 focus:ring-blue-100 outline-none transition`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#001F3F] cursor-pointer text-white p-4 rounded-lg font-bold hover:bg-blue-900 transition shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <span>Send Message</span>
                    <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    <span className="text-red-500">*</span> Required fields. We respect your privacy and will never share your information.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showLegalModal && <LegalModal />}

      <footer className="bg-[#001F3F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#001F3F] flex items-center justify-center overflow-hidden">
                  <img src={footerLogo} alt="Corp Radio logo" className="object-cover w-full h-full" />
                </div>
                <div>
                  <div className="font-bold text-lg">Corp Radio</div>
                  <div className="text-xs text-gray-300">Founded 2025</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Empowering entrepreneurs and corporate professionals with actionable business knowledge.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => scrollTo('shows')} className="block text-gray-300 cursor-pointer hover:text-white text-sm transition">Our Shows</button>
                <button onClick={() => scrollTo('radio')} className="block text-gray-300 cursor-pointer hover:text-white text-sm transition">Public Episodes</button>
                <button onClick={() => scrollTo('members')} className="block text-gray-300 cursor-pointer hover:text-white text-sm transition">Members Area</button>
                <button onClick={() => scrollTo('about')} className="block text-gray-300 cursor-pointer hover:text-white text-sm transition">About Us</button>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shows</h4>
              <div className="space-y-2">
                {shows.map((show) => (
                  <button
                    key={show.id}
                    onClick={() => scrollTo('shows')}
                    className="block text-gray-300 cursor-pointer hover:text-white text-sm transition"
                  >
                    {show.title}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-3 text-sm">
                <p className="text-gray-300 hover:text-white transition">
                  <a href="tel:0612019633">061 201 9633</a>
                </p>
                <p className="text-gray-300 hover:text-white transition">
                  <a href="mailto:info@corpradio.online">info@corpradio.online</a>
                </p>
                <div className="flex gap-3 pt-2">
                  <a href="http://www.youtube.com/@CorpradioZA" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/company/corp-radio/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://www.instagram.com/corp_radio?igsh=bG5rbzZkNDcwMHFr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                © 2025 Corp Radio. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm">
                <button
                  onClick={() => {
                    setLegalContent('privacy');
                    setShowLegalModal(true);
                  }}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => {
                    setLegalContent('terms');
                    setShowLegalModal(true);
                  }}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
