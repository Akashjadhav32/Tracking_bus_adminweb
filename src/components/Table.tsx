import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

export interface TableAction {
  label: string;
  onClick: (row: any) => void;
  className?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  actions?: TableAction[];
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  actions,
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getActionButtonClass = (variant: string = 'primary') => {
    const baseClass = 'px-3 py-1 rounded text-sm font-semibold transition-all duration-200 flex items-center';
    
    switch (variant) {
      case 'secondary':
        return `${baseClass} bg-gray-600 text-white hover:bg-gray-700`;
      case 'danger':
        return `${baseClass} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${baseClass} bg-red-600 text-white hover:bg-red-700`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.2
      }
    }
  };

  if (loading) {
    return (
      <div className={`bg-black border-2 border-red-600 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black border-2 border-red-600 rounded-xl p-6 ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-red-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-300"
            />
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-red-600">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left py-4 px-4 text-gray-300 font-semibold ${
                    column.sortable ? 'cursor-pointer hover:text-white' : ''
                  } ${column.className || ''}`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && (
                      <motion.div 
                        className="ml-2"
                        whileHover={{ scale: 1.1 }}
                      >
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp size={16} className="text-red-400" />
                          ) : (
                            <ChevronDown size={16} className="text-red-400" />
                          )
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </motion.div>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {sortedData.map((row, index) => (
                <motion.tr
                  key={row.id || index}
                  className="border-b border-gray-700 hover:bg-red-600/10 transition-colors duration-200"
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  layout
                  whileHover={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`py-4 px-4 text-white ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => {
                          const Icon = action.icon;
                          return (
                            <motion.button
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={`${getActionButtonClass(action.variant)} ${action.className || ''}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {Icon && <Icon size={14} className="mr-1" />}
                              {action.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Empty State */}
        {sortedData.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4 rounded-full bg-gray-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg">{emptyMessage}</p>
            {searchTerm && (
              <p className="text-gray-500 text-sm mt-1">
                No results found for "{searchTerm}"
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Results Summary */}
      {sortedData.length > 0 && searchable && (
        <motion.div 
          className="mt-6 pt-4 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm">
            Showing {sortedData.length} of {data.length} results
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Table;