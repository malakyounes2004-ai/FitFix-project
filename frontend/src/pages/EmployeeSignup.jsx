import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GiMuscleUp, GiHeartBeats, GiWeightLiftingUp } from 'react-icons/gi';
import { FiArrowRightCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY';

const planOptions = {
  monthly: {
    id: 'monthly',
    title: 'Monthly Plan',
    description: 'Access the full coaching suite for 30 days.',
    amount: 200,
    accent: 'from-emerald-500/70 to-cyan-500/60'
  },
  twoMonth: {
    id: 'twoMonth',
    title: '2 Month Plan',
    description: 'Lock in momentum with a focused 60-day sprint.',
    amount: 390,
    accent: 'from-amber-500/70 to-orange-500/60'
  },
  threeMonth: {
    id: 'threeMonth',
    title: '3 Month Plan',
    description: 'Transformation starter pack with milestone reviews.',
    amount: 599,
    accent: 'from-blue-500/70 to-sky-500/60'
  },
  yearly: {
    id: 'yearly',
    title: 'Yearly Plan',
    description: 'Best value. Includes VIP onboarding calls.',
    amount: 2300,
    accent: 'from-fuchsia-500/70 to-indigo-500/60'
  }
};

const initialForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  address: '',
  country: '',
  city: '',
  gender: '',
  dateOfBirth: '',
  notes: ''
};

const EmployeeSignup = () => {
  const [formData, setFormData] = useState(initialForm);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaScore, setRecaptchaScore] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  const recaptchaLoaded = useRef(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const heroIcons = useMemo(() => [GiMuscleUp, GiHeartBeats, GiWeightLiftingUp], []);

  // Load reCAPTCHA v3 dynamically
  useEffect(() => {
    if (recaptchaLoaded.current || !RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'YOUR_RECAPTCHA_SITE_KEY') {
      return;
    }
    
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          recaptchaLoaded.current = true;
        });
      } else {
        // Load reCAPTCHA script dynamically
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              recaptchaLoaded.current = true;
            });
          }
        };
        document.head.appendChild(script);
      }
    };
    
    loadRecaptcha();
  }, []);

  const executeRecaptcha = async () => {
    // Skip reCAPTCHA if not configured
    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'YOUR_RECAPTCHA_SITE_KEY') {
      console.warn('⚠️ reCAPTCHA not configured, skipping verification');
      return 0.9; // Return a default high score
    }
    
    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded. Please configure VITE_RECAPTCHA_SITE_KEY.');
    }
    
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
          .then((token) => {
            // Verify token with backend
            axios.post('http://localhost:3000/api/verify-recaptcha', { token })
              .then((response) => {
                const score = response.data.score;
                setRecaptchaScore(score);
                if (score < 0.5) {
                  reject(new Error('Your request looks suspicious. Please try again.'));
                } else {
                  resolve(score);
                }
              })
              .catch(reject);
          })
          .catch(reject);
      });
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        showNotification({ type: 'error', message: 'Please upload a PDF file only.' });
        e.target.value = '';
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        showNotification({ type: 'error', message: 'File size must be less than 10MB.' });
        e.target.value = '';
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const removeCvFile = () => {
    setCvFile(null);
    setCvFileName('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification({ type: 'error', message: 'Please fill all required fields.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute reCAPTCHA v3
      const score = await executeRecaptcha();
      
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('phone', formData.phoneNumber.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('country', formData.country.trim());
      formDataToSend.append('city', formData.city.trim());
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('notes', formData.notes || '');
      formDataToSend.append('selectedPlan', selectedPlan);
      formDataToSend.append('amount', planOptions[selectedPlan].amount.toString());
      formDataToSend.append('recaptchaScore', score.toString());
      formDataToSend.append('phoneVerified', 'false');
      formDataToSend.append('status', 'pending');
      
      // Append CV file if provided
      if (cvFile) {
        formDataToSend.append('cv', cvFile);
      }

      await axios.post('http://localhost:3000/api/employee-requests', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showNotification({
        type: 'success',
        message: 'Request submitted! Admin will review and create your account soon.'
      });

      navigate('/employee/payment-success', {
        state: {
          name: formData.fullName,
          plan: planOptions[selectedPlan].title,
          amount: planOptions[selectedPlan].amount
        }
      });
    } catch (error) {
      console.error('Employee request submission error:', error);
      const message = error.response?.data?.message || error.message || 'Unable to submit request. Please try again.';
      showNotification({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[160px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-20 space-y-14">
        <header className="text-center space-y-5">
          <p className="uppercase tracking-[0.6em] text-xs text-emerald-400">FitFix Coaches</p>
          <h1 className="text-4xl md:text-5xl font-black">Join the Elite Coaching Program</h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Submit your details, optionally verify your phone, choose your subscription, and lock your seat.
          </p>
          <div className="flex justify-center gap-6">
            {heroIcons.map((Icon, idx) => (
              <motion.div
                key={Icon.name}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2 + idx * 0.3, repeat: Infinity }}
              >
                <Icon className="text-2xl text-emerald-400" />
              </motion.div>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-10">
          <form onSubmit={handleSubmit} className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 space-y-6 backdrop-blur">
            <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>

            {[
              { name: 'fullName', label: 'Full Name', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'address', label: 'Address', type: 'text' },
              { name: 'country', label: 'Country', type: 'text' },
              { name: 'city', label: 'City', type: 'text' }
            ].map((field) => (
              <div key={field.name} className="relative">
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className={`w-full bg-black/30 border ${errors[field.name] ? 'border-rose-500/80' : 'border-slate-800'} rounded-2xl px-4 pt-5 pb-2 text-base focus:outline-none focus:border-emerald-400 transition`}
                  placeholder=" "
                />
                <label className="absolute top-2 left-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                  {field.label}
                </label>
                {errors[field.name] && <p className="text-rose-300 text-sm mt-1">{errors[field.name]}</p>}
              </div>
            ))}

            {/* Phone Number */}
            <div className="relative">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full bg-black/30 border ${errors.phoneNumber ? 'border-rose-500/80' : 'border-slate-800'} rounded-2xl px-4 pt-5 pb-2 text-base focus:outline-none focus:border-emerald-400 transition`}
                placeholder=" "
              />
              <label className="absolute top-2 left-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                Phone Number
              </label>
              {errors.phoneNumber && <p className="text-rose-300 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full bg-black/30 border ${errors.gender ? 'border-rose-500/80' : 'border-slate-800'} rounded-2xl px-4 pt-6 pb-2 text-base focus:outline-none focus:border-emerald-400 appearance-none`}
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
                <label className="absolute top-2 left-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                  Gender
                </label>
                {errors.gender && <p className="text-rose-300 text-sm mt-1">{errors.gender}</p>}
              </div>
              <div className="relative">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full bg-black/30 border ${errors.dateOfBirth ? 'border-rose-500/80' : 'border-slate-800'} rounded-2xl px-4 pt-6 pb-2 text-base focus:outline-none focus:border-emerald-400`}
                />
                <label className="absolute top-2 left-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                  Date of Birth
                </label>
                {errors.dateOfBirth && <p className="text-rose-300 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
            </div>

            <div className="relative">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full bg-black/30 border border-slate-800 rounded-2xl px-4 pt-6 pb-2 text-base focus:outline-none focus:border-emerald-400 resize-none"
                placeholder=" "
              />
              <label className="absolute top-2 left-4 text-xs uppercase tracking-[0.3em] text-slate-500">Notes (optional)</label>
            </div>

            {/* CV Upload Field */}
            <div className="relative">
              <div className="w-full bg-black/30 border border-slate-800 rounded-2xl px-4 pt-6 pb-2 focus-within:border-emerald-400 transition">
                <label className="absolute top-2 left-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                  CV Upload (PDF, optional)
                </label>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl cursor-pointer hover:bg-emerald-500/30 transition text-sm font-semibold"
                  >
                    Choose File
                  </label>
                  {cvFileName && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-slate-300 truncate">{cvFileName}</span>
                      <button
                        type="button"
                        onClick={removeCvFile}
                        className="ml-2 text-rose-400 hover:text-rose-300 text-sm flex items-center gap-1"
                        title="Remove CV"
                      >
                        <FiX className="text-sm" />
                        Remove
                      </button>
                    </div>
                  )}
                  {!cvFileName && (
                    <span className="text-sm text-slate-500">No file selected</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-semibold rounded-2xl py-4 flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/40 hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
              {!isSubmitting && <FiArrowRightCircle className="text-xl" />}
            </button>
            <p className="text-xs text-slate-400 text-center">
              Note: Phone verification is optional. You can submit without verifying your phone number.
            </p>
          </form>

          <div className="space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-400 mb-3">Choose your subscription plan</p>
              <div className="grid gap-4">
                {Object.values(planOptions).map((plan) => (
                  <motion.button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    whileHover={{ scale: 1.01 }}
                    className={`relative text-left p-6 rounded-3xl border transition ${
                      selectedPlan === plan.id
                        ? 'border-transparent bg-gradient-to-br ' + plan.accent + ' shadow-lg shadow-emerald-500/30'
                        : 'border-slate-800 bg-black/40 hover:border-emerald-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-white/70">{plan.title}</p>
                        <p className="text-3xl font-bold mt-2">${plan.amount}</p>
                        <p className="text-slate-200 mt-2">{plan.description}</p>
                      </div>
                      {selectedPlan === plan.id && (
                        <span className="w-10 h-10 rounded-full bg-black/20 border border-white/30 flex items-center justify-center">
                          <FiCheckCircle className="text-2xl" />
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-800 p-8 min-h-[220px] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 blur-3xl bg-gradient-to-r from-emerald-500 to-cyan-500" />
              <div className="relative z-10 space-y-3">
                <h3 className="text-2xl font-semibold">What happens next?</h3>
                <ul className="space-y-3 text-slate-200">
                  <li>1. Fill in your personal information.</li>
                  <li>2. (Optional) Verify your phone number with OTP.</li>
                  <li>3. Pick the subscription that matches your goals.</li>
                  <li>4. Submit your request for admin review.</li>
                  <li>5. Admin approves and creates your account.</li>
                  <li>6. You receive login credentials via email.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSignup;
