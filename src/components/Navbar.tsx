import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle, sidebarOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminId');
    navigate('/login');
  };

  const notifications = [
    { id: 1, message: 'New driver registered', time: '2 min ago', type: 'info' },
    { id: 2, message: 'Bus B001 maintenance due', time: '5 min ago', type: 'warning' },
    { id: 3, message: 'Route R12 completed', time: '10 min ago', type: 'success' },
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-l-info-500';
      case 'warning': return 'border-l-warning-500';
      case 'success': return 'border-l-success-500';
      default: return 'border-l-neutral-500';
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

          {/* Logo/Title */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <User size={20} className="text-white" />
              </motion.div>
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
              Bus Tracker <span className="text-blue-600">Admin</span>
            </h1>
            <h1 className="text-lg font-bold text-gray-800 sm:hidden">
              <span className="text-blue-600">Admin</span>
            </h1>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {notifications.length}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-gray-800 font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-gray-50 transition-colors duration-200`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <p className="text-gray-800 text-sm">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar */}
          <div className="relative">
            <motion.button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-gray-800 font-medium hidden sm:block">Admin</span>
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-gray-800 font-semibold">Admin User</p>
                    <p className="text-gray-600 text-sm">admin@example.com</p>
                  </div>
                  
                  <div className="py-2">
                    <motion.button
                      onClick={() => {
                        navigate('/settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                      whileHover={{ x: 4 }}
                    >
                      <Settings size={16} className="mr-3" />
                      Settings
                    </motion.button>
                    
                    <motion.button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      whileHover={{ x: 4 }}
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;