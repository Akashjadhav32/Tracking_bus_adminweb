import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Save, LogOut, Eye, EyeOff, Shield, Mail, UserCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  // Profile state
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'System Administrator'
  });
  
  const [originalProfile, setOriginalProfile] = useState<AdminProfile>({ ...profile });
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  
  // Password state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Profile handlers
  const handleProfileChange = (field: keyof AdminProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (profileSaved) setProfileSaved(false);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update original profile to reflect saved state
      setOriginalProfile({ ...profile });
      setIsProfileEditing(false);
      setProfileSaved(true);
      
      // TODO: Replace with actual API call
      console.log('Profile updated:', profile);
      
      // Hide success message after 3 seconds
      setTimeout(() => setProfileSaved(false), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfileCancel = () => {
    setProfile({ ...originalProfile });
    setIsProfileEditing(false);
    setProfileSaved(false);
  };

  // Password handlers
  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (passwordErrors.length > 0) {
      setPasswordErrors([]);
    }
    if (passwordSaved) setPasswordSaved(false);
  };

  const validatePassword = (): boolean => {
    const errors: string[] = [];
    
    if (!passwordData.oldPassword) {
      errors.push('Current password is required');
    }
    
    if (!passwordData.newPassword) {
      errors.push('New password is required');
    } else if (passwordData.newPassword.length < 6) {
      errors.push('New password must be at least 6 characters long');
    }
    
    if (!passwordData.confirmPassword) {
      errors.push('Please confirm your new password');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New passwords do not match');
    }
    
    if (passwordData.oldPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setPasswordSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API call
      console.log('Password change request:', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setPasswordSaved(false), 3000);
      
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminId');
    
    // Redirect to login
    navigate('/login');
  };

  const hasProfileChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 30
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const formVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      height: "auto",
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const successVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </motion.div>

      {/* Success Messages */}
      <AnimatePresence>
        {profileSaved && (
          <motion.div 
            className="bg-green-50 border border-green-200 rounded-xl p-4"
            variants={successVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-500 mr-3" />
              <p className="text-green-700 font-semibold">Profile updated successfully!</p>
            </div>
          </motion.div>
        )}
        
        {passwordSaved && (
          <motion.div 
            className="bg-green-50 border border-green-200 rounded-xl p-4"
            variants={successVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-500 mr-3" />
              <p className="text-green-700 font-semibold">Password updated successfully!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Section */}
      <motion.div 
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 mr-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <User size={24} className="text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
              <p className="text-gray-600">Update your personal information</p>
            </div>
          </div>
          
          {!isProfileEditing && (
            <motion.button
              onClick={() => setIsProfileEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-soft hover:shadow-soft-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserCircle size={16} className="mr-2" />
              Edit Profile
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isProfileEditing ? (
              <motion.input
                type="text"
                value={profile.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                placeholder="Enter your full name"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                {profile.name}
              </div>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            {isProfileEditing ? (
              <motion.input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                placeholder="Enter your email address"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 flex items-center">
                <Mail size={16} className="mr-2 text-gray-500" />
                {profile.email}
              </div>
            )}
          </motion.div>

          {/* Role Field (Read-only) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 flex items-center">
              <Shield size={16} className="mr-2" />
              {profile.role}
            </div>
          </motion.div>
        </div>

        {/* Profile Action Buttons */}
        <AnimatePresence>
          {isProfileEditing && (
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                onClick={handleProfileSave}
                disabled={profileSaving || !hasProfileChanges}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  profileSaving || !hasProfileChanges
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 shadow-soft hover:shadow-soft-lg'
                }`}
                whileHover={!profileSaving && hasProfileChanges ? { scale: 1.05 } : {}}
                whileTap={!profileSaving && hasProfileChanges ? { scale: 0.95 } : {}}
              >
                {profileSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={handleProfileCancel}
                disabled={profileSaving}
                className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!profileSaving ? { scale: 1.05 } : {}}
                whileTap={!profileSaving ? { scale: 0.95 } : {}}
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Password Reset Section */}
      <motion.div 
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex items-center mb-6">
          <motion.div 
            className="p-3 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 mr-4"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Lock size={24} className="text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
            <p className="text-gray-600">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Error Messages */}
          <AnimatePresence>
            {passwordErrors.length > 0 && (
              <motion.div 
                className="bg-red-50 border border-red-200 rounded-lg p-4"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-700 font-semibold mb-2">Please fix the following errors:</h4>
                    <ul className="text-red-600 text-sm space-y-1">
                      {passwordErrors.map((error, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                        >
                          • {error}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwordData.oldPassword}
                  onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Enter current password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.button>
              </div>
            </motion.div>

            {/* New Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Enter new password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.button>
              </div>
            </motion.div>

            {/* Confirm New Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Confirm new password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Password Requirements */}
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
              <Shield size={16} className="mr-2 text-blue-500" />
              Password Requirements:
            </h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                At least 6 characters long
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                Must be different from your current password
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                Should contain a mix of letters, numbers, and special characters
              </li>
            </ul>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={passwordSaving}
            className={`w-full md:w-auto flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              passwordSaving
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 shadow-soft hover:shadow-soft-lg'
            } focus:outline-none focus:ring-4 focus:ring-purple-200`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={!passwordSaving ? { scale: 1.05 } : {}}
            whileTap={!passwordSaving ? { scale: 0.95 } : {}}
          >
            {passwordSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Password...
              </span>
            ) : (
              <>
                <Lock size={16} className="mr-2" />
                Update Password
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Logout Section */}
      <motion.div 
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-red-400 to-red-500 mr-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <LogOut size={24} className="text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Logout</h2>
              <p className="text-gray-600">Sign out of your admin account</p>
            </div>
          </div>
          
          <motion.button
            onClick={handleLogout}
            className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 shadow-soft hover:shadow-soft-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={16} className="mr-2" />
            Logout Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;