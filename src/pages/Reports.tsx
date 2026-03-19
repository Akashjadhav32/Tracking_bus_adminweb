import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Calendar, TrendingUp, Activity, Users, Bus, Route, ChevronLeft, ChevronRight, FileText, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import logsData from '../data/logs.json';

interface LogEntry {
  logId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1000, delay = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const increment = value / (duration / 16);
      const counter = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  return <span>{count}</span>;
};

const Reports: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDateRange, setSelectedDateRange] = useState('7days');
  const logsPerPage = 8;

  useEffect(() => {
    // Load logs data
    // Add some additional dummy data to ensure we always have recent logs
    const additionalDummyLogs = [
      {
        logId: "LOG001",
        action: "Admin Login",
        performedBy: "System Admin",
        timestamp: new Date().toISOString(),
        details: "Administrator logged into the system"
      },
      {
        logId: "LOG002", 
        action: "Bus Status Updated",
        performedBy: "System",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        details: "Bus MH12 AB 1234 status changed to active"
      },
      {
        logId: "LOG003",
        action: "Driver Added",
        performedBy: "Admin",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        details: "New driver John Doe registered successfully"
      },
      {
        logId: "LOG004",
        action: "Route Created",
        performedBy: "Admin", 
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        details: "New route Mumbai Central to Andheri created"
      },
      {
        logId: "LOG005",
        action: "Emergency Alert",
        performedBy: "System",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        details: "Emergency button pressed on bus DL01 CD 5678"
      },
      {
        logId: "LOG006",
        action: "Bus Maintenance Scheduled",
        performedBy: "Admin",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        details: "Maintenance scheduled for bus UP16 EF 9012"
      },
      {
        logId: "LOG007",
        action: "Driver Status Changed",
        performedBy: "Admin",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        details: "Driver Rajesh Kumar status changed to inactive"
      },
      {
        logId: "LOG008",
        action: "Report Generated",
        performedBy: "System",
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        details: "Daily performance report generated successfully"
      }
    ];
    
    const combinedLogs = [...additionalDummyLogs, ...logsData];
    setLogs(combinedLogs);
    setFilteredLogs(combinedLogs);
  }, []);

  useEffect(() => {
    // Filter logs based on search term and date range
    let filtered = logs.filter(log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply date range filter
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedDateRange) {
      case '24hours':
        filterDate.setDate(now.getDate() - 1);
        break;
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      default:
        filterDate.setFullYear(2000); // Show all
    }

    filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
    
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, logs, selectedDateRange]);

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('Added') || action.includes('Created')) return 'bg-green-100 text-green-700 border-green-200';
    if (action.includes('Removed') || action.includes('Emergency')) return 'bg-red-100 text-red-700 border-red-200';
    if (action.includes('Updated') || action.includes('Changed')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (action.includes('Login') || action.includes('Assigned')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Prepare chart data
  const getActionsPerDay = () => {
    const actionsByDay: { [key: string]: number } = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(day => {
      actionsByDay[day] = 0;
    });

    logs.forEach(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (actionsByDay.hasOwnProperty(logDate)) {
        actionsByDay[logDate]++;
      }
    });

    return last7Days.map(day => ({
      day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      actions: actionsByDay[day]
    }));
  };

  const getDriverStatusData = () => {
    return [
      { name: 'Active Drivers', value: 28, color: '#10B981' },
      { name: 'Inactive Drivers', value: 8, color: '#F87171' },
      { name: 'On Leave', value: 4, color: '#F59E0B' },
      { name: 'Training', value: 3, color: '#8B5CF6' },
    ];
  };

  const getBusUtilizationData = () => {
    return [
      { name: 'In Service', value: 45, color: '#10B981' },
      { name: 'Maintenance', value: 8, color: '#F59E0B' },
      { name: 'Out of Service', value: 3, color: '#EF4444' },
    ];
  };

  const getRoutePerformanceData = () => {
    return [
      { route: 'Route A', onTime: 85, delayed: 15, routeId: 'R001' },
      { route: 'Route B', onTime: 92, delayed: 8, routeId: 'R002' },
      { route: 'Route C', onTime: 78, delayed: 22, routeId: 'R003' },
      { route: 'Route D', onTime: 88, delayed: 12, routeId: 'R004' },
      { route: 'Route E', onTime: 95, delayed: 5, routeId: 'R005' },
      { route: 'Route F', onTime: 82, delayed: 18, routeId: 'R006' },
    ];
  };

  const getMonthlyTrendsData = () => {
    return [
      { month: 'Jul', trips: 1240, onTime: 87, incidents: 3 },
      { month: 'Aug', trips: 1380, onTime: 89, incidents: 2 },
      { month: 'Sep', trips: 1520, onTime: 85, incidents: 5 },
      { month: 'Oct', trips: 1680, onTime: 91, incidents: 1 },
      { month: 'Nov', trips: 1450, onTime: 88, incidents: 4 },
      { month: 'Dec', trips: 1620, onTime: 93, incidents: 2 },
      { month: 'Jan', trips: 1580, onTime: 90, incidents: 3 },
    ];
  };

  const actionsPerDayData = getActionsPerDay();
  const driverStatusData = getDriverStatusData();
  const busUtilizationData = getBusUtilizationData();
  const routePerformanceData = getRoutePerformanceData();
  const monthlyTrendsData = getMonthlyTrendsData();

  const exportLogs = () => {
    const csvContent = [
      ['Log ID', 'Action', 'Performed By', 'Timestamp', 'Details'],
      ...filteredLogs.map(log => [
        log.logId,
        log.action,
        log.performedBy,
        formatTimestamp(log.timestamp),
        log.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">System activity logs and performance analytics</p>
      </motion.div>

      {/* Analytics Cards with Animated Counters */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Total Logs
              </p>
              <motion.p 
                className="text-3xl font-bold text-gray-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <AnimatedCounter value={logs.length} delay={300} />
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500">
              <Activity size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Today's Activity
              </p>
              <motion.p 
                className="text-3xl font-bold text-gray-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <AnimatedCounter 
                  value={logs.filter(log => {
                    const logDate = new Date(log.timestamp).toDateString();
                    const today = new Date().toDateString();
                    return logDate === today;
                  }).length} 
                  delay={400} 
                />
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-400 to-green-500">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Total Trips
              </p>
              <motion.p 
                className="text-3xl font-bold text-gray-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <AnimatedCounter 
                  value={1580} 
                  delay={500} 
                />
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                On-Time Rate
              </p>
              <motion.p 
                className="text-3xl font-bold text-gray-800 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <AnimatedCounter 
                  value={90} 
                  delay={600} 
                />%
              </motion.p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {/* Monthly Trends Chart */}
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 mr-4">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Monthly Trends</h3>
              <p className="text-gray-600">Trips and performance over time</p>
            </div>
          </div>
          <motion.div 
            className="h-80"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="trips" 
                  fill="#60A5FA" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={1000}
                  animationDuration={1000}
                />
                <Bar 
                  dataKey="onTime" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={1200}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Bus Utilization Chart */}
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-400 to-green-500 mr-4">
              <Bus size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Bus Utilization</h3>
              <p className="text-gray-600">Fleet status distribution</p>
            </div>
          </div>
          <motion.div 
            className="h-80"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={busUtilizationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={1200}
                  animationDuration={1000}
                >
                  {busUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-4">
            {busUtilizationData.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 text-sm">{item.name}: {item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Additional Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {/* Route Performance Chart */}
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 mr-4">
              <Route size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Route Performance</h3>
              <p className="text-gray-600">On-time vs delayed trips</p>
            </div>
          </div>
          <motion.div 
            className="h-80"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="route" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="onTime" 
                  stackId="a"
                  fill="#10B981" 
                  radius={[0, 0, 0, 0]}
                  animationBegin={1400}
                  animationDuration={1000}
                />
                <Bar 
                  dataKey="delayed" 
                  stackId="a"
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={1600}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Driver Status Chart */}
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 mr-4">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Driver Status</h3>
              <p className="text-gray-600">Current driver availability</p>
            </div>
          </div>
          <motion.div 
            className="h-80"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={driverStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={1600}
                  animationDuration={1000}
                >
                  {driverStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {driverStatusData.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 text-xs">{item.name}: {item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Logs Section */}
      <motion.div 
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 mr-4">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">System Activity Logs</h2>
              <p className="text-gray-600">Monitor all system activities</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Range Filter */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>

            {/* Export Button */}
            <motion.button
              onClick={exportLogs}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-soft hover:shadow-soft-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div 
          className="relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search logs by action, user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
        </motion.div>

        {/* Logs Table */}
        <motion.div 
          className="overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Log ID</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Action</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Performed By</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {currentLogs.map((log, index) => (
                  <motion.tr 
                    key={log.logId} 
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      scale: 1.01,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <td className="py-3 px-4 text-gray-800 font-mono text-sm">{log.logId}</td>
                    <td className="py-3 px-4">
                      <motion.span 
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getActionBadgeColor(log.action)}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {log.action}
                      </motion.span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{log.performedBy}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock size={14} className="mr-2 text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {currentLogs.length === 0 && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No logs found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search criteria' : 'No logs match the selected date range'}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <div className="text-gray-600 text-sm">
              Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-soft hover:shadow-soft-lg'
                }`}
                whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </motion.button>
              
              <span className="text-gray-700 text-sm px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <motion.button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-soft hover:shadow-soft-lg'
                }`}
                whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Reports;