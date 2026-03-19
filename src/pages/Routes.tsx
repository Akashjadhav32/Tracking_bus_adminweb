import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronRight, Trash2, MapPin, Route as RouteIcon } from 'lucide-react';
import { Route, Stop } from '../types';
import SearchableSelect from '../components/SearchableSelect';
import placesData from '../data/places.json';
import { routesAPI } from '../services/api';

interface RouteFormData {
  routeName: string;
  stops: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

const Routes: React.FC = () => {
  const [formData, setFormData] = useState<RouteFormData>({
    routeName: '',
    stops: [{ name: '', latitude: 0, longitude: 0 }]
  });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());
  const [places] = useState<Array<{name: string; latitude: number; longitude: number}>>(placesData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routesAPI.getAllRoutes();
      // Transform backend data to match frontend interface
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
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, routeName: value }));
  };

  const handleStopChange = (index: number, stopName: string) => {
    const selectedPlace = places.find(place => place.name === stopName);
    if (selectedPlace) {
      const newStops = [...formData.stops];
      newStops[index] = {
        name: selectedPlace.name,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude
      };
      setFormData(prev => ({ ...prev, stops: newStops }));
    }
  };

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, { name: '', latitude: 0, longitude: 0 }]
    }));
  };

  const removeStop = (index: number) => {
    if (formData.stops.length > 1) {
      const newStops = formData.stops.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, stops: newStops }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Filter out empty stops
    const validStops = formData.stops.filter(stop => stop.name !== '');
    
    if (formData.routeName && validStops.length > 0) {
      try {
        // Generate dynamic stopIds
        const stopsWithIds = validStops.map((stop, index) => ({
          stopId: `stop${index + 1}`,
          name: stop.name,
          latitude: stop.latitude,
          longitude: stop.longitude
        }));
        
        const routeData = {
          routeName: formData.routeName,
          stops: stopsWithIds
        };
        
        const response = await routesAPI.createRoute(routeData);
        
        if (response.success) {
          // Transform and add new route to state
          const newRoute: Route = {
            routeId: response.route._id,
            routeName: response.route.routeName,
            stops: response.route.stops,
            _id: response.route._id,
            createdAt: response.route.createdAt,
            updatedAt: response.route.updatedAt,
            __v: response.route.__v
          };
          
          setRoutes(prev => [...prev, newRoute]);
          
          // Reset form
          setFormData({
            routeName: '',
            stops: [{ name: '', latitude: 0, longitude: 0 }]
          });
          
          alert('Route created successfully!');
        } else {
          setError(response.message || 'Failed to create route');
        }
      } catch (error: any) {
        console.error('Error creating route:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Failed to create route. Please try again.');
        }
      }
    } else {
      setError('Please fill in route name and at least one stop.');
    }
    
    setIsSubmitting(false);
  };

  const toggleRouteExpansion = (routeId: string) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(routeId)) {
      newExpanded.delete(routeId);
    } else {
      newExpanded.add(routeId);
    }
    setExpandedRoutes(newExpanded);
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

  const stopRowVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const expandedRowVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
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
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Route Management</h1>
        <p className="text-neutral-600">Create new routes and manage existing ones</p>
      </motion.div>

      {/* Stats Cards */}
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
                Total Routes
              </p>
              <motion.p 
                className="text-3xl font-bold text-neutral-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {routes.length}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-info-500 to-info-600">
              <RouteIcon size={24} className="text-white" />
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
                Total Stops
              </p>
              <motion.p 
                className="text-3xl font-bold text-neutral-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {routes.reduce((total, route) => total + route.stops.length, 0)}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-success-500 to-success-600">
              <MapPin size={24} className="text-white" />
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
                Avg Stops/Route
              </p>
              <motion.p 
                className="text-3xl font-bold text-neutral-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {routes.length > 0 ? Math.round(routes.reduce((total, route) => total + route.stops.length, 0) / routes.length) : 0}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-warning-500 to-warning-600">
              <Plus size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Route Form */}
      <motion.div 
        className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
        variants={itemVariants}
      >
        <motion.h2 
          className="text-2xl font-bold text-neutral-800 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Create New Route
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
          {/* Route Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label htmlFor="routeName" className="block text-sm font-medium text-neutral-700 mb-2">
              Route Name
            </label>
            <input
              type="text"
              id="routeName"
              value={formData.routeName}
              onChange={(e) => handleRouteNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-info-400 focus:ring-2 focus:ring-info-200 transition-all duration-300"
              placeholder="Enter route name (e.g., Connaught Place to Noida Sec-62)"
              required
            />
          </motion.div>

          {/* Stops Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-neutral-700">
                Route Stops
              </label>
              <motion.button
                type="button"
                onClick={addStop}
                className="flex items-center px-4 py-2 bg-info-500 text-white rounded-xl hover:bg-info-600 transition-all duration-300 text-sm font-semibold shadow-soft hover:shadow-soft-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} className="mr-2" />
                Add Stop
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {formData.stops.map((stop, index) => (
                  <motion.div 
                    key={index} 
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200"
                    variants={stopRowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    {/* Stop Selection */}
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Stop Name</label>
                      <SearchableSelect
                        options={places.map(place => ({
                          value: place.name,
                          label: place.name
                        }))}
                        value={stop.name}
                        onChange={(value) => handleStopChange(index, value)}
                        placeholder="Select a stop"
                        required
                      />
                    </div>

                    {/* Latitude */}
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Latitude</label>
                      <input
                        type="number"
                        value={stop.latitude || ''}
                        disabled
                        className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-500 text-sm cursor-not-allowed"
                        step="any"
                      />
                    </div>

                    {/* Longitude */}
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Longitude</label>
                      <input
                        type="number"
                        value={stop.longitude || ''}
                        disabled
                        className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-500 text-sm cursor-not-allowed"
                        step="any"
                      />
                    </div>

                    {/* Stop Order */}
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Stop Order</label>
                      <div className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600 text-sm text-center">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex items-end">
                      <motion.button
                        type="button"
                        onClick={() => removeStop(index)}
                        disabled={formData.stops.length === 1}
                        className={`w-full p-2 rounded-lg transition-all duration-300 ${
                          formData.stops.length === 1
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'bg-error-500 text-white hover:bg-error-600 shadow-soft hover:shadow-soft-lg'
                        }`}
                        whileHover={formData.stops.length > 1 ? { scale: 1.05 } : {}}
                        whileTap={formData.stops.length > 1 ? { scale: 0.95 } : {}}
                      >
                        <Trash2 size={16} className="mx-auto" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                isSubmitting
                  ? 'bg-info-600 cursor-not-allowed'
                  : 'bg-info-500 hover:bg-info-600 hover:scale-105 active:scale-95'
              } focus:outline-none focus:ring-4 focus:ring-info-200 shadow-soft-lg hover:shadow-info-300/40`}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Route...
                </span>
              ) : (
                <>
                  <Plus size={20} className="inline mr-2" />
                  Create Route
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Route List */}
      <motion.div 
        className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
        variants={itemVariants}
      >
        <motion.h2 
          className="text-2xl font-bold text-neutral-800 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          Existing Routes
        </motion.h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info-600"></div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Route</th>
                <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Route Name</th>
                <th className="text-left py-3 px-4 text-neutral-700 font-semibold"># Stops</th>
                <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Created</th>
                <th className="text-left py-3 px-4 text-neutral-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {routes.map((route, index) => (
                  <React.Fragment key={route.routeId}>
                    <motion.tr 
                      className="border-b border-neutral-100 hover:bg-info-50 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.03)' }}
                    >
                      <td className="py-3 px-4 text-neutral-800 font-mono text-sm">{route._id?.slice(-8) || route.routeId}</td>
                      <td className="py-3 px-4 text-neutral-800 font-semibold">{route.routeName}</td>
                      <td className="py-3 px-4 text-neutral-800">
                        <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-sm font-semibold">
                          {route.stops.length} stops
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 text-sm">
                        {route.createdAt ? new Date(route.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <motion.button
                          onClick={() => toggleRouteExpansion(route._id || route.routeId)}
                          className="flex items-center px-4 py-2 bg-info-500 text-white rounded-xl hover:bg-info-600 transition-all duration-300 text-sm font-semibold shadow-soft hover:shadow-soft-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            animate={{ rotate: expandedRoutes.has(route._id || route.routeId) ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight size={16} className="mr-2" />
                          </motion.div>
                          {expandedRoutes.has(route._id || route.routeId) ? 'Hide Stops' : 'Show Stops'}
                        </motion.button>
                      </td>
                    </motion.tr>
                    
                    {/* Expanded Stops Table */}
                    <AnimatePresence>
                      {expandedRoutes.has(route._id || route.routeId) && (
                        <motion.tr
                          variants={expandedRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <td colSpan={5} className="py-0">
                            <motion.div 
                              className="bg-neutral-50 mx-4 mb-4 rounded-xl overflow-hidden border border-neutral-200"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200">
                                <h4 className="text-neutral-800 font-semibold">Route Stops</h4>
                              </div>
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-neutral-100">
                                    <th className="text-left py-2 px-4 text-neutral-600 text-sm">Order</th>
                                    <th className="text-left py-2 px-4 text-neutral-600 text-sm">Stop ID</th>
                                    <th className="text-left py-2 px-4 text-neutral-600 text-sm">Stop Name</th>
                                    <th className="text-left py-2 px-4 text-neutral-600 text-sm">Latitude</th>
                                    <th className="text-left py-2 px-4 text-neutral-600 text-sm">Longitude</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <AnimatePresence>
                                    {route.stops.map((stop, stopIndex) => (
                                      <motion.tr 
                                        key={stop.stopId} 
                                        className="border-b border-neutral-200 last:border-b-0 hover:bg-neutral-100/50 transition-colors duration-200"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2, delay: stopIndex * 0.05 }}
                                      >
                                        <td className="py-2 px-4 text-neutral-700 text-sm">
                                          <span className="px-2 py-1 bg-info-100 text-info-700 rounded-full text-xs font-semibold">
                                            #{stopIndex + 1}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 text-neutral-700 text-sm font-mono">{stop.stopId}</td>
                                        <td className="py-2 px-4 text-neutral-800 text-sm font-semibold">{stop.name}</td>
                                        <td className="py-2 px-4 text-neutral-700 text-sm font-mono">{stop.latitude}</td>
                                        <td className="py-2 px-4 text-neutral-700 text-sm font-mono">{stop.longitude}</td>
                                      </motion.tr>
                                    ))}
                                  </AnimatePresence>
                                </tbody>
                              </table>
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {routes.length === 0 && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="p-4 rounded-full bg-neutral-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RouteIcon size={32} className="text-neutral-400" />
              </div>
              <p className="text-neutral-600 text-lg">No routes found</p>
              <p className="text-neutral-500 text-sm mt-1">Create your first route above</p>
            </motion.div>
          )}
        </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Routes;