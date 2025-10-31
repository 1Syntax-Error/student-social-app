import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { colors } from '../utils/colors';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch total user count from profiles table
  useEffect(() => {
    async function fetchUserCount() {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error fetching user count:', error);
        } else {
          setTotalUsers(count || 0);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    fetchUserCount();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-16 relative">
          {/* Mechanical Counter - Top Right */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex flex-col items-center gap-2 sm:gap-3">
            <div className="bg-gray-800 p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border border-gray-700">
              {/* Counter display */}
              <div className="flex gap-1 sm:gap-2">
                {String(totalUsers).padStart(4, '0').split('').map((digit, index) => (
                  <div
                    key={index}
                    className="relative bg-black rounded-md overflow-hidden shadow-inner"
                    style={{ width: isMobile ? '24px' : '45px', height: isMobile ? '32px' : '60px' }}
                  >
                    {/* Top shadow for depth */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10"></div>

                    {/* Middle divider line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-900 -translate-y-1/2 z-20"></div>

                    {/* Number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`${isMobile ? 'text-lg' : 'text-4xl'} font-bold text-white`} style={{ fontFamily: 'Arial Black, sans-serif' }}>
                        {digit}
                      </span>
                    </div>

                    {/* Bottom reflection */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent pointer-events-none z-10"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-white/90 uppercase tracking-widest font-semibold">Total Users</div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                  Connect with students at your university
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-primary-50">
                  Build your professional network, find study partners, and connect with peers in your major.
                </p>
                {user ? (
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/dashboard"
                      className="btn btn-secondary"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      to="/feeds"
                      className={`btn ${colors.sidebar.bg} ${colors.text.light} hover:bg-primary-700`}
                    >
                      Activity Feed
                    </Link>
                  </div>
                ) : (
                  <div className="space-x-4">
                    <Link
                      to="/signup"
                      className="btn btn-secondary"
                    >
                      Join Now
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Warning Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-y border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start space-x-4">
              <FiAlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  Important Privacy Notice
                </h3>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  For your safety and privacy, <strong>never share sensitive personal information</strong> such as your Social Security number, home address, phone number, financial information, or other private details on your profile or in conversations. Only share information you would be comfortable sharing in a public academic setting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="py-16 bg-white dark:bg-dark-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary sm:text-4xl">
                Connect and Collaborate
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-dark-text-secondary">
                Campus Connect helps you build meaningful academic and professional relationships
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card p-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  Create Your Profile
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  Showcase your academic interests, major, and professional goals to connect with like-minded peers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  Find Students by Major
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  Easily discover and connect with students in your field of study or explore different disciplines.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  Build Your Network
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  Follow other students, share profiles, and expand your academic and professional connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
