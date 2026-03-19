import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Bus, Lock, Mail } from 'lucide-react';
import { authAPI } from '../services/api';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.loginSuccess) {
        // Success: Store admin status and redirect
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminId', response.adminId || '');
        localStorage.setItem('token', 'admin-token-' + Date.now());
        navigate('/dashboard');
      } else {
        // Failure: Show error message
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white to-green-100/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/50 to-green-50/30"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Glassmorphism login card */}
          <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-2xl p-8 sm:p-10 transform transition-all duration-500 hover:shadow-blue-200/30 hover:border-blue-300/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <Bus size={32} className="text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                Admin Portal
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Public Transport Management System
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 sm:py-4 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 sm:py-4 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 backdrop-blur-sm border border-red-200 rounded-xl p-4 transition-all duration-300">
                  <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-white text-base sm:text-lg transition-all duration-300 transform ${
                  isLoading
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-300/40'
                } focus:outline-none focus:ring-4 focus:ring-blue-200`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            {/* Test Credentials Helper */}
            <div className="mt-8 p-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-600 text-center mb-2 font-medium">Test Credentials:</p>
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-700 font-mono">admin12@gmail.com</p>
                <p className="text-xs text-gray-700 font-mono">Admin@12</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              © 2025 Public Transport Admin Portal
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;