// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2 } from 'lucide-react';
import logo from '../assets/logo.png';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Bypass straight to portal for now
    navigate('/developer-portal'); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] font-sans px-4">
      
      {/* Centered Auth Card - Google Workspace Style */}
      <div className="w-full max-w-[450px] bg-white border border-[#dadce0] rounded-lg p-10 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
        
        {/* Back Button */}
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Back
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-12 h-12 mb-4">
            <img src={logo} alt="Realtii" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-normal text-[#202124] mb-2">
            {activeTab === 'login' ? 'Sign in' : 'Create an account'}
          </h1>
          <p className="text-[#5f6368] text-base text-center">
            {activeTab === 'login' 
              ? 'Continue to Developer Console' 
              : 'Apply for API access'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${activeTab === 'login' ? 'text-[#1a73e8]' : 'text-[#5f6368] hover:text-[#202124]'}`}
          >
            Sign In
            {activeTab === 'login' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#1a73e8]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('signup')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${activeTab === 'signup' ? 'text-[#1a73e8]' : 'text-[#5f6368] hover:text-[#202124]'}`}
          >
            Sign Up
            {activeTab === 'signup' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#1a73e8]"></div>}
          </button>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {activeTab === 'signup' && (
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  required 
                  className="block w-full pl-11 pr-3 py-3 border border-[#dadce0] rounded text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors text-base" 
                  placeholder="Company Name" 
                />
              </div>
            </div>
          )}

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="email" 
                required 
                className="block w-full pl-11 pr-3 py-3 border border-[#dadce0] rounded text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors text-base" 
                placeholder="Work Email" 
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="password" 
                required 
                className="block w-full pl-11 pr-3 py-3 border border-[#dadce0] rounded text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors text-base" 
                placeholder="Password" 
              />
            </div>
          </div>

          {activeTab === 'login' && (
            <div className="flex justify-start">
              <button type="button" className="text-sm font-medium text-[#1a73e8] hover:text-[#1557b0]">
                Forgot password?
              </button>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded text-sm font-medium transition-colors shadow-sm w-full"
            >
              {activeTab === 'login' ? 'Next' : 'Create Account'}
            </button>
          </div>
        </form>
        
      </div>
      
      {/* Footer Links */}
      <div className="mt-8 flex space-x-6 text-xs text-[#5f6368]">
        <a href="#" className="hover:text-[#202124]">Help</a>
        <a href="#" className="hover:text-[#202124]">Privacy</a>
        <a href="#" className="hover:text-[#202124]">Terms</a>
      </div>
    </div>
  );
};