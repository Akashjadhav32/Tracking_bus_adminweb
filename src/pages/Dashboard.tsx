import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Users, Route, MapPin, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { busesAPI, routesAPI, driversAPI } from '../services/api';
import { Bus as BusType, Route as RouteType, Driver } from '../types';

interface DashboardStats {
  drivers: {
    total: number;
    active: number;
    inactive: number;
  };
  buses: {
    total: number;
    active: number;
    inactive: number;
  };
  routes: {
    total: number;
    active: number;
    inactive: number;
  };
  journeys: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface ChartData {
  busStatus: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  busesPerRoute: Array<{
    route: string;
    buses: number;
    routeId: string;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch data from all APIs
      const [busesResponse, routesResponse, driversResponse] = await Promise.all([
        busesAPI.getAllBuses().catch(() => []),
        routesAPI.getAllRoutes().catch(() => []),
        driversAPI.getAllDrivers().catch(() => [])
      ]);

      // Process buses data
      const buses: BusType[] = Array.isArray(busesResponse) ? busesResponse : [];
      const activeBuses = buses.filter(bus => bus.status === 'active');
      const inactiveBuses = buses.filter(bus => bus.status === 'inactive');

      // Process routes data
      const routes: RouteType[] = Array.isArray(routesResponse) ? routesResponse.map((route: any) => ({
        routeId: route._id,
        routeName: route.routeName,
        stops: route.stops,
        _id: route._id,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt,
        __v: route.__v
      })) : [];

      // Process drivers data
      const drivers: Driver[] = Array.isArray(driversResponse) ? driversResponse.map((driver: any) => ({
        driverId: driver.id || driver.driverId,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        username: driver.username,
        password: '',
        status: driver.status,
        assignedBusId: driver.assignedBus === 'No' ? null : driver.assignedBus,
        id: driver.id,
        assignedBus: driver.assignedBus,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt
      })) : [];

      const activeDrivers = drivers.filter(driver => driver.status === 'active');
      const inactiveDrivers = drivers.filter(driver => driver.status === 'inactive');

      // Calculate stats
      const calculatedStats: DashboardStats = {
        drivers: {
          total: drivers.length,
          active: activeDrivers.length,
          inactive: inactiveDrivers.length
        },
        buses: {
          total: buses.length,
          active: activeBuses.length,
          inactive: inactiveBuses.length
        },
        routes: {
          total: routes.length,
          active: routes.length, // Assuming all routes are active for now
          inactive: 0
        },
        journeys: {
          today: Math.floor(Math.random() * 50) + 20, // Simulated data
          thisWeek: Math.floor(Math.random() * 300) + 200,
          thisMonth: Math.floor(Math.random() * 1200) + 800
        }
      };

      // Calculate chart data
      const busStatusData = [
        { name: 'Active Buses', value: activeBuses.length, color: '#10B981' },
        { name: 'Inactive Buses', value: inactiveBuses.length, color: '#EF4444' }
      ];

      // Calculate buses per route
      const routeBusCount: { [key: string]: { name: string; count: number } } = {};
      
      buses.forEach(bus => {
        if (bus.route) {
          const routeName = bus.route.routeName;
          const routeId = bus.route._id;
          if (!routeBusCount[routeId]) {
            routeBusCount[routeId] = { name: routeName, count: 0 };
          }
          routeBusCount[routeId].count++;
        }
      });

      const busesPerRouteData = Object.entries(routeBusCount)
        .map(([routeId, data]) => ({
          route: data.name,
          buses: data.count,
          routeId: routeId
        }))
        .slice(0, 6); // Limit to 6 routes for better visualization

      const calculatedChartData: ChartData = {
        busStatus: busStatusData,
        busesPerRoute: busesPerRouteData
      };

      setStats(calculatedStats);
      setChartData(calculatedChartData);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Fallback to default data if API fails
      setStats({
        drivers: { total: 0, active: 0, inactive: 0 },
        buses: { total: 0, active: 0, inactive: 0 },
        routes: { total: 0, active: 0, inactive: 0 },
        journeys: { today: 0, thisWeek: 0, thisMonth: 0 }
      });
      setChartData({
        busStatus: [],
        busesPerRoute: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'routes':
        navigate('/routes');
        break;
      case 'drivers':
        navigate('/drivers');
        break;
      case 'buses':
        navigate('/buses');
        break;
      case 'reports':
        navigate('/reports');
        break;
      default:
        break;
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
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

  const cardHoverVariants = {
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  if (isLoading || !stats || !chartData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <motion.button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }
  const statCards = [
    {
      title: 'Total Drivers',
      value: stats.drivers.total,
      subtitle: `${stats.drivers.active} Active, ${stats.drivers.inactive} Inactive`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-400'
    },
    {
      title: 'Total Buses',
      value: stats.buses.total,
      subtitle: `${stats.buses.active} Active, ${stats.buses.inactive} Inactive`,
      icon: Bus,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-400'
    },
    {
      title: 'Total Routes',
      value: stats.routes.total,
      subtitle: `${stats.routes.active} Active, ${stats.routes.inactive} Inactive`,
      icon: Route,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-400'
    },
    {
      title: 'Today\'s Journeys',
      value: stats.journeys.today,
      subtitle: `${stats.journeys.thisWeek} This Week`,
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-400'
    }
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <motion.div 
        className="text-center py-8"
        variants={itemVariants}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Welcome, <span className="text-blue-600">Admin</span> 👋
        </motion.h1>
        <motion.p 
          className="text-gray-600 text-lg md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Manage your public transport system from this dashboard
        </motion.p>
        
        {/* Refresh Button */}
        <motion.button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Refresh Data
        </motion.button>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              className="bg-white border border-neutral-200 rounded-2xl p-6 cursor-pointer shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
              variants={itemVariants}
              whileHover="hover"
              custom={index}
            >
              <motion.div 
                className="flex items-center justify-between mb-4"
                variants={cardHoverVariants}
              >
                <div>
                  <p className="text-neutral-600 text-sm font-medium uppercase tracking-wide">
                    {card.title}
                  </p>
                  <motion.p 
                    className="text-3xl font-bold text-neutral-800 mt-2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {card.value}
                  </motion.p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <motion.div 
                  className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon size={24} className="text-white" />
                </motion.div>
              </motion.div>
              
              {/* Animated progress bar */}
              <motion.div 
                className="h-1 bg-neutral-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <motion.div 
                  className={`h-full bg-gradient-to-r ${card.color.replace('to-', 'to-').replace('from-', 'from-')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((card.value / Math.max(card.value, 10)) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {/* Pie Chart - Bus Status */}
        <motion.div 
          className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-info-500 to-info-600 mr-4"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Activity size={24} className="text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-800">Bus Status</h3>
              <p className="text-neutral-600">Active vs Inactive Buses</p>
            </div>
          </div>
          
          {chartData.busStatus.length > 0 ? (
            <motion.div 
              className="h-80"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.busStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={1000}
                    animationDuration={1000}
                  >
                    {chartData.busStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      color: '#404040',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">No bus data available</p>
            </div>
          )}
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-4">
            {chartData.busStatus.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-neutral-700 text-sm">{item.name}: {item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bar Chart - Buses per Route */}
        <motion.div 
          className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-success-500 to-success-600 mr-4"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <TrendingUp size={24} className="text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-800">Buses per Route</h3>
              <p className="text-neutral-600">Distribution across routes</p>
            </div>
          </div>
          
          {chartData.busesPerRoute.length > 0 ? (
            <motion.div 
              className="h-80"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.busesPerRoute} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="route" 
                    stroke="#737373"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#737373"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      color: '#404040',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="buses" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]}
                    animationBegin={1200}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">No route data available</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft"
        variants={itemVariants}
      >
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">Quick Actions</h3>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          variants={containerVariants}
        >
          {[
            { title: 'Add New Route', action: 'Create Route', route: 'routes', icon: Route, color: 'from-blue-500 to-blue-600' },
            { title: 'Register Driver', action: 'Add Driver', route: 'drivers', icon: Users, color: 'from-green-500 to-green-600' },
            { title: 'Add Bus', action: 'Register Bus', route: 'buses', icon: Bus, color: 'from-purple-500 to-purple-600' },
            { title: 'Generate Report', action: 'View Reports', route: 'reports', icon: TrendingUp, color: 'from-orange-500 to-orange-600' }
          ].map((item, index) => (
            <motion.button
              key={item.title}
              onClick={() => handleQuickAction(item.route)}
              className="group p-6 bg-white border-2 border-neutral-200 rounded-xl text-neutral-800 hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left relative overflow-hidden"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={24} className="text-white" />
                  </div>
                  <motion.div
                    className="w-2 h-2 bg-neutral-300 rounded-full group-hover:bg-blue-500 transition-colors duration-300"
                    whileHover={{ scale: 1.5 }}
                  />
                </div>
                
                <h4 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="text-neutral-600 text-sm group-hover:text-neutral-700 transition-colors duration-300">
                  {item.action}
                </p>
                
                {/* Arrow indicator */}
                <div className="mt-4 flex items-center text-neutral-400 group-hover:text-blue-500 transition-colors duration-300">
                  <span className="text-xs font-medium mr-2">Go to {item.action.split(' ')[0]}</span>
                  <motion.div
                    className="w-4 h-4 border-r-2 border-b-2 border-current transform rotate-[-45deg]"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;