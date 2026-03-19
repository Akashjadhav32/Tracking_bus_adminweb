import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Plus, UserX, UserCheck, Truck, User, Route as RouteIcon, ToggleLeft, ToggleRight, AlertTriangle, Trash2 } from 'lucide-react';
import { Bus as BusType, BusFormData, Driver, Route } from '../types';
import { busesAPI, routesAPI } from '../services/api';
import driversData from '../data/drivers.json';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const BusManagement: React.FC = () => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [breakdownBuses, setBreakdownBuses] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<BusFormData>({
    busNumber: '',
    driverUsername: '',
    routeName: '',
    status: 'active'
  });

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    setDrivers(driversData);

    // Initialize Socket.IO for real-time breakdown alerts
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Admin Panel connected to Socket.IO');
    });

    socket.on('bus:breakdown', (data: any) => {
      console.log('Breakdown alert received:', data);
      setBreakdownBuses(prev => new Set(prev).add(data.busId));
      // Show notification (optional)
      alert(`⚠️ Breakdown Alert: Bus ${data.busNumber} reported a breakdown!`);
    });

    socket.on('bus:breakdown:resolved', (data: any) => {
      console.log('Breakdown resolved:', data);
      setBreakdownBuses(prev => {
        const updated = new Set(prev);
        updated.delete(data.busId);
        return updated;
      });
      // Refetch buses to sync database state
      fetchBuses();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await busesAPI.getAllBuses();
      // Transform backend data to match frontend interface
      const transformedBuses = Array.isArray(response) ? response.map((bus: any) => ({
        busId: bus.busId,
        busNumber: bus.busNumber,
        capacity: bus.capacity,
        driverId: bus.driverId,
        routeId: bus.routeId,
        status: bus.status,
        breakdownStatus: bus.breakdownStatus || false,
        _id: bus._id,
        createdAt: bus.createdAt,
        updatedAt: bus.updatedAt,
        __v: bus.__v
      })) : [];
      setBuses(transformedBuses);
      // Update breakdown status from bus data
      const brokenDownBuses = transformedBuses
        .filter((bus: any) => bus.breakdownStatus)
        .map((bus: any) => bus.busId);
      setBreakdownBuses(new Set(brokenDownBuses));
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      setError('Failed to load buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await routesAPI.getAllRoutes();
      const transformedRoutes = Array.isArray(response) ? response.map((route: any) => ({
        routeId: route._id,
        routeName: route.routeName,
        stops: route.stops,
        _id: route._id,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt,
        __v: route.__v
      })) : [];
      setRoutes(transformedRoutes);
    } catch (error: any) {
      console.error('Error fetching routes:', error);
    }
  };
  const activeBuses = buses.filter(bus => bus.status === 'active');
  const inactiveBuses = buses.filter(bus => bus.status === 'inactive');

  // Get available drivers (not assigned to any active bus)
  const availableDrivers = drivers.filter(driver =>
    !buses.some(bus => bus.driverId === driver.driverId && bus.status === 'active')
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await busesAPI.createBus(formData);

      if (response.success) {
        const newBus: BusType = {
          busId: response.bus.busId,
          busNumber: response.bus.busNumber,
          capacity: response.bus.capacity,
          driverId: response.bus.driverId,
          routeId: response.bus.routeId,
          status: response.bus.status,
          _id: response.bus._id,
          createdAt: response.bus.createdAt,
          updatedAt: response.bus.updatedAt,
          __v: response.bus.__v
        };

        setBuses(prev => [...prev, newBus]);
        setFormData({
          busNumber: '',
          driverUsername: '',
          routeName: '',
          status: 'active'
        });

        alert('Bus registered successfully!');
      } else {
        setError(response.message || 'Failed to register bus');
      }
    } catch (error: any) {
      console.error('Error registering bus:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to register bus. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBusStatus = async (busId: string) => {
    const bus = buses.find(b => b.busId === busId);
    if (!bus) return;

    const newStatus = bus.status === 'active' ? 'inactive' : 'active';

    try {
      // Update in database via API
      await busesAPI.updateBusStatus(busId, newStatus);

      // Update local state after successful API call
      setBuses(prev => prev.map(b =>
        b.busId === busId
          ? { ...b, status: newStatus }
          : b
      ));
    } catch (error) {
      console.error('Failed to update bus status:', error);
      alert('Failed to update bus status. Please try again.');
    }
  };

  const deleteBus = async (busId: string, busNumber: string) => {
    if (!confirm(`Are you sure you want to delete bus ${busNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await busesAPI.deleteBus(busId);
      setBuses(prev => prev.filter(b => b.busId !== busId));
      alert('Bus deleted successfully!');
    } catch (error) {
      console.error('Failed to delete bus:', error);
      alert('Failed to delete bus. Please try again.');
    }
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'Not assigned';
    const driver = drivers.find(d => d.driverId === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const getRouteName = (routeId: string | null) => {
    if (!routeId) return 'Not assigned';
    const route = routes.find(r => r.routeId === routeId);
    return route ? route.routeName : 'Unknown Route';
  };

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

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Management</h1>
        <p className="text-gray-600">Register new buses and manage existing fleet</p>
      </motion.div>

      {/* Bus Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Total Buses
              </p>
              <motion.p
                className="text-3xl font-bold text-gray-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {buses.length}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Bus size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Active Buses
              </p>
              <motion.p
                className="text-3xl font-bold text-green-600 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {activeBuses.length}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <UserCheck size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Inactive Buses
              </p>
              <motion.p
                className="text-3xl font-bold text-red-500 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {inactiveBuses.length}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-400 to-red-500">
              <UserX size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Bus Form */}
      <motion.div
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        variants={formVariants}
      >
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Register New Bus
        </motion.h2>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bus Number Input */}
            <div>
              <label htmlFor="busNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Bus Number
              </label>
              <input
                type="text"
                id="busNumber"
                name="busNumber"
                value={formData.busNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                placeholder="MH12 AB 1234"
              />
            </div>

            {/* Driver Username Input */}
            <div>
              <label htmlFor="driverUsername" className="block text-sm font-medium text-gray-700 mb-2">
                Driver Username
              </label>
              <input
                type="text"
                id="driverUsername"
                name="driverUsername"
                value={formData.driverUsername}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                placeholder="driver_num_1"
              />
            </div>

            {/* Route Name Input */}
            <div>
              <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-2">
                Route Name
              </label>
              <input
                type="text"
                id="routeName"
                name="routeName"
                value={formData.routeName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                placeholder="route1"
              />
            </div>

            {/* Status Selection */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Info Notice */}
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-blue-700 text-sm">
              <strong className="text-blue-800">Note:</strong> Make sure the driver username and route name exist in the system.
              The bus will be automatically assigned to the specified driver and route.
            </p>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-auto flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform ${isSubmitting
              ? 'bg-blue-600 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95'
              } focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-blue-300/40`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={!isSubmitting ? { scale: 1.05 } : {}}
            whileTap={!isSubmitting ? { scale: 0.95 } : {}}
          >
            <Plus size={20} className="mr-2" />
            {isSubmitting ? 'Registering Bus...' : 'Register Bus'}
          </motion.button>
        </form>
      </motion.div>

      {/* Bus Cards Grid */}
      <motion.div
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        variants={itemVariants}
      >
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          Fleet Overview ({buses.length} buses)
        </motion.h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          buses.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {buses.map((bus, index) => (
                <motion.div
                  key={bus.busId}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all duration-300"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Bus Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                        <Truck size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{bus.busNumber}</h3>
                        <p className="text-gray-600 text-sm">ID: {bus.busId}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Status Toggle */}
                      <motion.button
                        onClick={() => toggleBusStatus(bus.busId)}
                        className={`flex items-center transition-all duration-300 ${bus.status === 'active' ? 'text-green-500' : 'text-gray-400'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={bus.status === 'active' ? 'Deactivate Bus' : 'Activate Bus'}
                      >
                        {bus.status === 'active' ? (
                          <ToggleRight size={24} />
                        ) : (
                          <ToggleLeft size={24} />
                        )}
                      </motion.button>

                      {/* Delete Button */}
                      <motion.button
                        onClick={() => deleteBus(bus.busId, bus.busNumber)}
                        className="flex items-center transition-all duration-300 text-red-500 hover:text-red-700"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete Bus"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Breakdown Alert Badge */}
                  {(breakdownBuses.has(bus.busId) || bus.breakdownStatus) && (
                    <motion.div
                      className="mt-3 bg-red-50 border-2 border-red-500 rounded-lg p-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-2">
                        <AlertTriangle size={18} className="text-red-600 animate-pulse" />
                        <div>
                          <p className="text-red-700 font-bold text-sm">⚠️ BREAKDOWN ALERT</p>
                          <p className="text-red-600 text-xs">This bus has reported a breakdown</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Bus Details */}
                  <div className="space-y-3">
                    {/* Capacity */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Capacity</span>
                      <span className="text-gray-800 font-semibold">{bus.capacity} seats</span>
                    </div>

                    {/* Driver */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm flex items-center">
                        <User size={14} className="mr-1" />
                        Driver
                      </span>
                      {bus.driverId ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                          Assigned
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </div>

                    {/* Route */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm flex items-center">
                        <RouteIcon size={14} className="mr-1" />
                        Route
                      </span>
                      {bus.route || bus.routeId ? (
                        <div className="text-right">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-semibold block mb-1">
                            {bus.route?.routeName || getRouteName(bus.routeId)}
                          </span>
                          {bus.route && (
                            <span className="text-xs text-gray-500">
                              {bus.route.stops.length} stops
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600 text-sm">Status</span>
                      <motion.span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${bus.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                          }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bus size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-600 text-lg">No buses found</p>
              <p className="text-gray-500 text-sm mt-1">Register your first bus using the form above</p>
            </motion.div>
          )
        )}
      </motion.div>
    </motion.div>
  );
};

export default BusManagement;