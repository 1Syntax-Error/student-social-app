// 23. src/pages/Explore.jsx
import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { MAJORS } from '../utils/constants';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import UserList from '../components/social/UserList';

export default function Explore() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMajor('');
  };
  
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Redirect if not logged in (handled by router)
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-dark-border mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Explore Students
            </h1>
            
            {/* Search and filter section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                {/* Search input */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {/* Filter toggle button (mobile) */}
                <div className="flex md:hidden">
                  <button
                    onClick={toggleFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FiFilter className="mr-2" />
                    {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
                
                {/* Major filter (desktop) */}
                <div className="hidden md:block md:w-1/3">
                  <select
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Majors</option>
                    {MAJORS.map(major => (
                      <option key={major} value={major}>
                        {major}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Clear filters button (desktop) */}
                <div className="hidden md:block">
                  <button
                    onClick={clearFilters}
                    disabled={!searchTerm && !selectedMajor}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX className="mr-2" />
                    Clear
                  </button>
                </div>
              </div>
              
              {/* Mobile filter dropdown */}
              {isFilterOpen && (
                <div className="md:hidden mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="mb-4">
                    <label htmlFor="mobile-major-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Major
                    </label>
                    <select
                      id="mobile-major-filter"
                      value={selectedMajor}
                      onChange={(e) => setSelectedMajor(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Majors</option>
                      {MAJORS.map(major => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={clearFilters}
                    disabled={!searchTerm && !selectedMajor}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX className="mr-2" />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Active filters display */}
            {(searchTerm || selectedMajor) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                
                {searchTerm && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                      aria-label="Clear search"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}
                
                {selectedMajor && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    Major: {selectedMajor}
                    <button
                      onClick={() => setSelectedMajor('')}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                      aria-label="Clear major filter"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* User list */}
            <UserList 
              filter={{ major: selectedMajor }} 
              searchTerm={searchTerm}
              maxUsers={24}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}