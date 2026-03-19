import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFooter?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  variant?: 'default' | 'danger' | 'success';
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  size = 'md',
  showFooter = true,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled = false,
  submitLoading = false,
  variant = 'default',
  className = ''
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      default:
        return 'max-w-2xl';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          border: 'border-red-500',
          header: 'border-red-500/30',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          border: 'border-green-500',
          header: 'border-green-500/30',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          border: 'border-red-600',
          header: 'border-red-600/30',
          button: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const variantClasses = getVariantClasses();

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.1,
        ease: 'easeOut'
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full ${getSizeClasses()} max-h-[90vh] bg-gray-900 border-2 ${variantClasses.border} rounded-xl shadow-2xl overflow-hidden ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${variantClasses.header}`}>
              <motion.h2 
                className="text-2xl font-bold text-white flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {variant === 'danger' && <AlertCircle size={24} className="mr-3 text-red-400" />}
                {title}
              </motion.h2>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-red-600/20 transition-all duration-200"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Content */}
            <motion.div 
              className="p-6 max-h-[60vh] overflow-y-auto"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {children}
            </motion.div>

            {/* Footer */}
            {showFooter && (
              <motion.div 
                className={`flex items-center justify-end space-x-4 p-6 border-t ${variantClasses.header} bg-gray-800/50`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={submitLoading}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!submitLoading ? { scale: 1.05 } : {}}
                  whileTap={!submitLoading ? { scale: 0.95 } : {}}
                >
                  {cancelLabel}
                </motion.button>
                
                {onSubmit && (
                  <motion.button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitDisabled || submitLoading}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${variantClasses.button} disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg hover:shadow-red-600/30`}
                    whileHover={!submitDisabled && !submitLoading ? { scale: 1.05 } : {}}
                    whileTap={!submitDisabled && !submitLoading ? { scale: 0.95 } : {}}
                  >
                    {submitLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {submitLabel}
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;