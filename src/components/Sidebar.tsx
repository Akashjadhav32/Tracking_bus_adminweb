import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Route, 
  Bus, 
  MapPin, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Routes', path: '/routes', icon: Route },
    { name: 'Buses', path: '/buses', icon: Bus },
    { name: 'Live Tracking', path: '/live-tracking', icon: MapPin },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarVariants = {
    open: {
      width: '16rem',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    closed: {
      width: '4rem',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 flex flex-col"
      variants={sidebarVariants}
      animate={isOpen ? 'open' : 'closed'}
      initial={false}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {isOpen && (
              <motion.h2
                className="text-xl font-bold text-gray-800"
                variants={itemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                Bus <span className="text-blue-600">Admin</span>
              </motion.h2>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={onToggle}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`group relative flex items-center transition-all duration-300 ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {/* Icon with highlight background */}
                  <motion.div
                    className={`flex-shrink-0 relative p-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 group-hover:bg-gray-100 group-hover:text-gray-900'
                    }`}
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <Icon 
                      size={20} 
                      className="transition-colors duration-200"
                    />
                  </motion.div>
                  
                  {/* Label */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        className={`ml-3 font-medium whitespace-nowrap transition-colors duration-300 ${
                          isActive ? 'text-blue-600' : ''
                        }`}
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="text-center"
              variants={itemVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <p className="text-xs text-neutral-500">
                © 2025 Bus Tracker
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;