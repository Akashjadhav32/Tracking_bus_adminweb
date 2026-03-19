import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MapPin, Navigation, Clock, Gauge, X, Bus, Activity, AlertTriangle } from 'lucide-react';
import { busesAPI } from '../services/api';
import { io } from 'socket.io-client';

interface LiveBus {
  busId: string;
  busNumber: string;
  driverName: string;
  latitude: number | null;
  longitude: number | null;
  currentStop: string;
  routeId: string;
  status: 'moving' | 'stopped' | 'idle';
  speed: number;
  lastUpdated: string;
  breakdownStatus: boolean;
}

const LiveTracking: React.FC = () => {
  const [buses, setBuses] = useState<LiveBus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<LiveBus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBuses = async () => {
    setIsRefreshing(true);
    try {
      const data = await busesAPI.getAllBuses();

      const formattedBuses = data.map((b: any) => {
        let lat = null;
        let lng = null;

        // Use breakdown location if active
        if (b.breakdownStatus && b.breakdownLocation && b.breakdownLocation.lat && b.breakdownLocation.lng) {
          lat = b.breakdownLocation.lat;
          lng = b.breakdownLocation.lng;
        } else if (b.route && b.route.stops && b.route.stops.length > 0) {
          // Alternatively, use the first stop of the route as a fallback placeholder 
          lat = b.route.stops[0].lat;
          lng = b.route.stops[0].lng;
        }

        return {
          busId: b.busId,
          busNumber: b.busNumber,
          driverName: b.driverId ? 'Assigned' : 'Unassigned', // Backend currently just gives ID, would need driver API to get name
          latitude: lat,
          longitude: lng,
          currentStop: b.route?.stops?.[0]?.name || 'Unknown',
          routeId: b.route?.routeName || b.routeId,
          status: b.status === 'active' ? (b.breakdownStatus ? 'stopped' : 'moving') : 'idle',
          speed: b.breakdownStatus ? 0 : 45, // Placeholder speed
          lastUpdated: b.updatedAt,
          breakdownStatus: b.breakdownStatus
        };
      });

      setBuses(formattedBuses);
    } catch (err) {
      console.error('Failed to fetch buses', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuses();

    // Setup Socket.IO for real-time breakdown updates
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://akash123-071-tracking-backend.hf.space');

    socket.on('connect', () => {
      console.log('Connected to real-time tracking server');
    });

    socket.on('bus:breakdown', (data) => {
      console.warn('BREAKDOWN ALERT:', data);
      const newLat = data.location?.lat || null;
      const newLng = data.location?.lng || null;

      setBuses(prev => prev.map(bus => {
        if (bus.busId === data.busId) {
          return {
            ...bus,
            breakdownStatus: true,
            status: 'stopped',
            speed: 0,
            latitude: newLat !== null ? newLat : bus.latitude,
            longitude: newLng !== null ? newLng : bus.longitude,
            lastUpdated: new Date().toISOString()
          };
        }
        return bus;
      }));
    });

    socket.on('bus:breakdown:resolved', (data) => {
      console.log('BREAKDOWN RESOLVED:', data);
      setBuses(prev => prev.map(bus => {
        if (bus.busId === data.busId) {
          return {
            ...bus,
            breakdownStatus: false,
            status: 'moving',
            lastUpdated: new Date().toISOString()
          };
        }
        return bus;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = buses;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bus => bus.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bus =>
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.currentStop.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBuses(filtered);
  }, [buses, statusFilter, searchTerm]);

  const handleRefresh = async () => {
    await fetchBuses();
  };

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const formatCoordinate = (coord: number | null) => {
    if (coord === null || coord === undefined) return 'N/A';
    return coord.toFixed(4);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: 20, scale: 0.98, transition: { duration: 0.2 } }
  };

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Bus Tracking</h1>
        <p className="text-gray-600">Monitor real-time bus locations and breakdown status</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Total Buses
              </p>
              <motion.p className="text-3xl font-bold text-gray-800 mt-2" variants={statsVariants}>
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
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Active / Moving
              </p>
              <motion.p className="text-3xl font-bold text-green-600 mt-2" variants={statsVariants}>
                {buses.filter(b => b.status === 'moving').length}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <Navigation size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium uppercase tracking-wide">
                Breakdown Alerts
              </p>
              <motion.p className="text-3xl font-bold text-red-600 mt-2" variants={statsVariants}>
                {buses.filter(b => b.breakdownStatus).length}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
              <AlertTriangle size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Idle
              </p>
              <motion.p className="text-3xl font-bold text-yellow-600 mt-2" variants={statsVariants}>
                {buses.filter(b => b.status === 'idle').length}
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        variants={itemVariants}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Live Bus Tracker Hub</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bus or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Status</option>
              <option value="moving">Moving</option>
              <option value="stopped">Stopped / Broken</option>
              <option value="idle">Idle</option>
            </select>

            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 ${isRefreshing ? 'bg-blue-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95'
                } shadow-lg`}
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Bus Table */}
      <motion.div
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        variants={itemVariants}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-gray-700 font-semibold">Bus Number</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold">Coord Target</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold">Status / Details</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold">Speed</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredBuses.map((bus, index) => (
                  <motion.tr
                    key={bus.busId}
                    className={`border-b border-gray-100 transition-colors duration-200 ${bus.breakdownStatus ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-blue-50'}`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    layout
                  >
                    {/* Bus Number */}
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${bus.breakdownStatus ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                          {bus.breakdownStatus ? <AlertTriangle size={16} className="text-white" /> : <Bus size={16} className="text-white" />}
                        </div>
                        <div>
                          <p className="text-gray-800 font-bold">{bus.busNumber}</p>
                          <p className="text-gray-600 text-xs">Route: {bus.routeId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Target DB Cords */}
                    <td className="py-4 px-4">
                      <span className={`font-mono text-sm font-bold ${bus.breakdownStatus ? 'text-red-700' : 'text-gray-600'}`}>
                        Lat: {formatCoordinate(bus.latitude)}
                        <br />
                        Lng: {formatCoordinate(bus.longitude)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {bus.breakdownStatus ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                          <AlertTriangle size={12} className="mr-1" />
                          BREAKDOWN DETECTED!
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bus.status === 'moving' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                        </span>
                      )}
                    </td>

                    {/* Speed */}
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Gauge size={14} className="mr-2 text-gray-500" />
                        <span className="text-gray-800 font-semibold">{bus.speed} km/h</span>
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2 text-gray-500" />
                        <span className="text-gray-600 text-sm">
                          {formatLastUpdated(bus.lastUpdated)}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredBuses.length === 0 && !isRefreshing && (
            <div className="text-center py-12">
              <Activity size={32} className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No buses trackable</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LiveTracking;