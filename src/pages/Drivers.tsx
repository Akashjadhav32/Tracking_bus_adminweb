import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, UserX, UserCheck, X, Copy, Eye, EyeOff, Camera, Trash2 } from 'lucide-react';
import { Driver, DriverFormData } from '../types';
import { driversAPI } from '../services/api';

interface DriverCredentials {
  username: string;
  password: string;
  name: string;
}

const Drivers: React.FC = () => {
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    phone: '',
    email: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newDriverCredentials, setNewDriverCredentials] = useState<DriverCredentials | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string>('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await driversAPI.getAllDrivers();
      // Transform backend data to match frontend interface
      const transformedDrivers = Array.isArray(response) ? response.map((driver: any) => ({
        driverId: driver.id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        username: driver.username,
        password: driver.password || '', // Now returned from GET endpoint
        status: driver.status,
        has_face_registered: driver.has_face_registered ?? false,
        assignedBusId: driver.assignedBus === 'No' ? null : driver.assignedBus,
        id: driver.id,
        assignedBus: driver.assignedBus,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt
      })) : [];
      setDrivers(transformedDrivers);
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers. Please try again.');
    }
  };

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!photoFile) {
        setError('A face photo is mandatory to enable facial recognition for this driver.');
        setIsSubmitting(false);
        return;
      }

      // Build FormData so we can include the optional photo for face registration
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('photo', photoFile);

      const response = await driversAPI.createDriver(fd);

      if (response.success) {
        // Transform backend response to match frontend interface
        const newDriver: Driver = {
          driverId: response.driver.id,
          name: response.driver.name,
          phone: response.driver.phone,
          email: response.driver.email,
          username: response.driver.username,
          password: response.password,
          status: response.driver.status,
          has_face_registered: response.driver.has_face_registered ?? false,
          assignedBusId: response.driver.assignedBus === 'No' ? null : response.driver.assignedBus,
          id: response.driver.id,
          assignedBus: response.driver.assignedBus,
        };

        // Update local state
        setDrivers(prev => [...prev, newDriver]);

        // Set credentials for popup
        setNewDriverCredentials({
          username: response.driver.username,
          password: response.password,
          name: response.driver.name
        });

        // Close modal and show credentials
        setShowModal(false);
        setShowCredentialsModal(true);

        // Reset form
        setFormData({ name: '', phone: '', email: '' });
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        setError(response.message || 'Failed to register driver');
      }

    } catch (error: any) {
      console.error('Error registering driver:', error);
      if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
        setError('Request timed out. The Face Recognition server may be starting up (cold start can take up to 60s). Please try again in a moment.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to register driver. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDriverStatus = (driverId: string) => {
    setDrivers(prev =>
      prev.map(driver =>
        driver.driverId === driverId
          ? { ...driver, status: driver.status === 'active' ? 'inactive' : 'active' }
          : driver
      )
    );

    // TODO: Implement API call to update driver status
    console.log(`Driver ${driverId} status toggled`);
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await driversAPI.deleteDriver(driverId);
      if (response.success) {
        setDrivers(prev => prev.filter(driver => driver.driverId !== driverId));
      } else {
        alert(response.message || 'Failed to delete driver');
      }
    } catch (err: any) {
      console.error('Error deleting driver:', err);
      alert(err.response?.data?.message || 'Failed to delete driver');
    }
  };

  const copyToClipboard = (text: string, field?: string) => {
    navigator.clipboard.writeText(text);
    if (field) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  const togglePasswordVisibility = (driverId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [driverId]: !prev[driverId]
    }));
  };

  const activeDrivers = drivers.filter(driver => driver.status === 'active');
  const inactiveDrivers = drivers.filter(driver => driver.status === 'inactive');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Title */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Driver Management</h1>
          <p className="text-neutral-600">Register new drivers and manage existing ones</p>
        </motion.div>

        {/* Driver Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          <motion.div
            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium uppercase tracking-wide">
                  Total Drivers
                </p>
                <motion.p
                  className="text-3xl font-bold text-neutral-800 mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {drivers.length}
                </motion.p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-info-500 to-info-600">
                <Users size={24} className="text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium uppercase tracking-wide">
                  Active Drivers
                </p>
                <motion.p
                  className="text-3xl font-bold text-success-600 mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {activeDrivers.length}
                </motion.p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-success-600 to-success-700">
                <UserCheck size={24} className="text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium uppercase tracking-wide">
                  Inactive Drivers
                </p>
                <motion.p
                  className="text-3xl font-bold text-error-500 mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {inactiveDrivers.length}
                </motion.p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-error-400 to-error-500">
                <UserX size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Add Driver Button */}
        <motion.div
          className="flex justify-end"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center px-6 py-3 bg-info-500 text-white rounded-xl font-semibold hover:bg-info-600 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-info-200 shadow-soft-lg hover:shadow-info-300/40"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} className="mr-2" />
            Add Driver
          </motion.button>
        </motion.div>

        {/* Drivers List Table */}
        <motion.div
          className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">All Drivers</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Phone</th>
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Username</th>
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Password</th>
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Face</th>
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {drivers.map((driver, index) => (
                    <motion.tr
                      key={driver.driverId}
                      className="border-b border-neutral-100 hover:bg-info-50 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.03)' }}
                    >
                      <td className="py-3 px-4 text-neutral-800 font-semibold">{driver.name}</td>
                      <td className="py-3 px-4 text-neutral-700">{driver.phone}</td>
                      <td className="py-3 px-4 text-neutral-700">{driver.email}</td>
                      <td className="py-3 px-4 text-neutral-700 font-mono text-sm">{driver.username}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-neutral-700 font-mono text-sm select-all">
                            {showPasswords[driver.driverId] ? driver.password : '••••••••'}
                          </span>
                          <motion.button
                            onClick={() => togglePasswordVisibility(driver.driverId)}
                            className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPasswords[driver.driverId] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </motion.button>
                          <motion.button
                            onClick={() => copyToClipboard(driver.password, `password-${driver.driverId}`)}
                            className={`transition-colors duration-200 ${copiedField === `password-${driver.driverId}`
                              ? 'text-success-600'
                              : 'text-neutral-500 hover:text-info-600'
                              }`}
                            title="Copy password"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Copy size={16} />
                          </motion.button>
                        </div>
                      </td>
                      {/* Face Registration Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${driver.has_face_registered
                          ? 'bg-success-100 text-success-700'
                          : 'bg-neutral-100 text-neutral-500'
                          }`}>
                          <Camera size={12} />
                          {driver.has_face_registered ? 'Registered' : 'None'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <motion.span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${driver.status === 'active'
                            ? 'bg-success-100 text-success-700'
                            : 'bg-error-100 text-error-700'
                            }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                        >
                          {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                        </motion.span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => toggleDriverStatus(driver.driverId)}
                            className={`flex items-center px-3 py-1 rounded text-sm font-semibold transition-all duration-300 ${driver.status === 'active'
                              ? 'bg-error-500 text-white hover:bg-error-600'
                              : 'bg-success-500 text-white hover:bg-success-600'
                              }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {driver.status === 'active' ? (
                              <>
                                <UserX size={14} className="mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} className="mr-1" />
                                Activate
                              </>
                            )}
                          </motion.button>

                          <motion.button
                            onClick={() => handleDeleteDriver(driver.driverId)}
                            className="flex items-center p-2 rounded text-error-600 bg-error-50 hover:bg-error-100 transition-colors duration-300"
                            title="Delete Driver"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {drivers.length === 0 && (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-neutral-600">No drivers found. Add your first driver above.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Add Driver Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-white border border-neutral-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-soft-xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-neutral-800">Add New Driver</h3>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-red-600 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-info-400 focus:ring-2 focus:ring-info-200 transition-all duration-300"
                    placeholder="Enter driver's full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-info-400 focus:ring-2 focus:ring-info-200 transition-all duration-300"
                    placeholder="+91-9876543210"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-info-400 focus:ring-2 focus:ring-info-200 transition-all duration-300"
                    placeholder="driver@example.com"
                  />
                </div>

                {/* Face Photo Upload — REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Face Photo <span className="text-red-500 font-bold">*</span>{' '}
                    <span className="text-neutral-400 font-normal">(required for facial recognition)</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors duration-200 ${
                      photoFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-300 hover:border-red-400 bg-red-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={photoPreview} alt="Preview" className="h-24 w-24 object-cover rounded-full border-2 border-green-400" />
                        <span className="text-xs text-neutral-500">{photoFile?.name}</span>
                        <span className="text-xs text-green-600 font-medium">✓ Photo ready — click to change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Camera size={28} className="text-red-400" />
                        <span className="text-sm text-red-600 font-semibold">Click to upload a face photo</span>
                        <span className="text-xs text-neutral-400">JPG, PNG up to 5MB — required to enable login</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="bg-info-50 border border-info-200 rounded-xl p-3">
                  <p className="text-neutral-700 text-sm">
                    <strong className="text-neutral-800">Note:</strong> Username and password will be automatically generated and emailed to the driver.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${isSubmitting
                      ? 'bg-info-600 cursor-not-allowed'
                      : 'bg-info-500 hover:bg-info-600'
                      }`}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering Face (up to 60s)...
                      </span>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Add Driver
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-800 rounded-xl font-semibold hover:bg-neutral-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Credentials Modal */}
      <AnimatePresence>
        {showCredentialsModal && newDriverCredentials && (
          <motion.div
            className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-white border border-neutral-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-soft-xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-neutral-800">Driver Added Successfully!</h3>
                <motion.button
                  onClick={() => setShowCredentialsModal(false)}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Driver Info */}
              <div className="mb-6">
                <p className="text-neutral-700 mb-4">
                  <span className="text-neutral-800 font-semibold">{newDriverCredentials.name}</span> has been successfully registered as a driver.
                </p>
                <p className="text-neutral-600 text-sm">
                  Please share these login credentials with the driver:
                </p>
              </div>

              {/* Credentials */}
              <div className="space-y-4 mb-6">
                {/* Username */}
                <motion.div
                  className="bg-neutral-50 border border-neutral-200 rounded-xl p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Username</label>
                      <p className="text-neutral-800 font-mono text-lg">{newDriverCredentials.username}</p>
                    </div>
                    <motion.button
                      onClick={() => copyToClipboard(newDriverCredentials.username, 'modal-username')}
                      className={`transition-colors duration-200 p-2 ${copiedField === 'modal-username'
                        ? 'text-success-600'
                        : 'text-neutral-500 hover:text-info-600'
                        }`}
                      title="Copy username"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy size={20} />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  className="bg-neutral-50 border border-neutral-200 rounded-xl p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Password</label>
                      <p className="text-neutral-800 font-mono text-lg">{newDriverCredentials.password}</p>
                    </div>
                    <motion.button
                      onClick={() => copyToClipboard(newDriverCredentials.password, 'modal-password')}
                      className={`transition-colors duration-200 p-2 ${copiedField === 'modal-password'
                        ? 'text-success-600'
                        : 'text-neutral-500 hover:text-info-600'
                        }`}
                      title="Copy password"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Warning */}
              <motion.div
                className="bg-warning-50 border border-warning-200 rounded-xl p-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-warning-700 text-sm">
                  <strong>Important:</strong> Make sure to securely share these credentials with the driver.
                  They will need these to log into the driver mobile app.
                </p>
              </motion.div>

              {/* Actions */}
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => {
                    copyToClipboard(`Username: ${newDriverCredentials.username}\nPassword: ${newDriverCredentials.password}`, 'modal-both');
                  }}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${copiedField === 'modal-both'
                    ? 'bg-success-500 text-white'
                    : 'bg-info-500 text-white hover:bg-info-600'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Copy size={16} className="mr-2" />
                  {copiedField === 'modal-both' ? 'Copied!' : 'Copy Both'}
                </motion.button>
                <motion.button
                  onClick={() => setShowCredentialsModal(false)}
                  className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-800 rounded-xl font-semibold hover:bg-neutral-300 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Drivers;