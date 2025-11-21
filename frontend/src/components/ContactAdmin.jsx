import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ContactAdmin = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleBack = () => {
    navigate('/login');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:malakyounes667@gmail.com?subject=Account Request - FitFix';
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+96178961123';
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className={`w-full max-w-2xl transition-all duration-700 relative z-10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-emerald-400 hover:text-emerald-300 font-medium transition-all duration-200 hover:translate-x-[-4px]"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Login
        </button>

        {/* Main Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section with Animation */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-5"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4 animate-bounce">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Need an Account?</h1>
              <p className="text-gray-300 text-lg">We're here to help you get started!</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Friendly Message */}
            <div className="mb-8 text-center">
              <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
                <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl text-gray-200 leading-relaxed">
                We are here to help you. You can reach out to the admin for assistance.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4 mb-8">
              {/* Email Card */}
              <div 
                onClick={handleEmailClick}
                className="group bg-gray-800/80 rounded-2xl p-6 border-2 border-transparent hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-900 rounded-full p-4 group-hover:bg-emerald-500/20 transition-colors duration-300">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-400 mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      malakyounes667@gmail.com
                    </p>
                  </div>
                  <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div 
                onClick={handlePhoneClick}
                className="group bg-gray-800/80 rounded-2xl p-6 border-2 border-transparent hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-900 rounded-full p-4 group-hover:bg-emerald-500/20 transition-colors duration-300">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-400 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      +961 78 961 123
                    </p>
                  </div>
                  <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-800/60 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-white">Quick Tip:</span> Click on any contact method above to get in touch instantly!
              </p>
            </div>
          </div>

          {/* Footer with Animation */}
          <div className="bg-gray-900 px-8 py-6 text-center border-t border-gray-800">
            <p className="text-sm text-gray-300">
              We'll get back to you as soon as possible! 💪
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500/20 rounded-full opacity-30 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-teal-500/20 rounded-full opacity-30 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
};

export default ContactAdmin;

