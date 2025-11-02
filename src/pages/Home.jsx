import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiUsers, FiCalendar, FiBook, FiMessageCircle, FiTrendingUp, FiStar, FiArrowRight, FiCheckCircle, FiGlobe, FiAward } from 'react-icons/fi';
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1">
        {/* Hero section */}
        <div className="relative bg-white dark:bg-dark-surface overflow-hidden">
          {/* Mechanical Counter - Top Right */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex flex-col items-center gap-2 sm:gap-3 z-10">
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
            <div className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest font-semibold">Total Users</div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              {/* Left content */}
              <div className="mb-12 lg:mb-0">

                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-dark-text-primary mb-6 leading-tight">
                  Your Campus
                  <span className="block bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent">
                    Community Hub
                  </span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-dark-text-secondary mb-8 leading-relaxed">
                  Connect with students in your major, join study groups, discover campus events, and build meaningful academic relationships.
                </p>

                {user ? (
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Go to Dashboard
                      <FiArrowRight className="ml-2" size={20} />
                    </Link>
                    <Link
                      to="/feeds"
                      className="inline-flex items-center px-8 py-4 bg-white dark:bg-dark-bg border-2 border-gray-300 dark:border-dark-border hover:border-primary-600 dark:hover:border-primary-500 text-gray-700 dark:text-dark-text-primary font-semibold rounded-lg transition-all duration-200"
                    >
                      View Activity Feed
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/signup"
                      className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Get Started Free
                      <FiArrowRight className="ml-2" size={20} />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-8 py-4 bg-white dark:bg-dark-bg border-2 border-gray-300 dark:border-dark-border hover:border-primary-600 dark:hover:border-primary-500 text-gray-700 dark:text-dark-text-primary font-semibold rounded-lg transition-all duration-200"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start space-x-4">
              <FiAlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={28} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-4">
                  Important Privacy & Safety Notice
                </h3>
                <div className="space-y-4 text-amber-800 dark:text-amber-300">
                  <p className="leading-relaxed">
                    For your safety and privacy, <strong>never share sensitive personal information</strong> on this platform. This includes:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Never Share:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Social Security Number or Student ID</li>
                        <li>• Home address or exact location</li>
                        <li>• Personal phone number</li>
                        <li>• Financial information or bank details</li>
                        <li>• Passwords or login credentials</li>
                        <li>• Private family information</li>
                        <li>• Medical or health information</li>
                      </ul>
                    </div>

                    <div className="bg-white/50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Safety Guidelines:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Use your university email for verification only</li>
                        <li>• Meet new connections in public campus spaces</li>
                        <li>• Report suspicious or inappropriate behavior</li>
                        <li>• Be cautious about sharing class schedules</li>
                        <li>• Review your privacy settings regularly</li>
                        <li>• Block and report users who make you uncomfortable</li>
                        <li>• Trust your instincts - if something feels off, it probably is</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-sm italic leading-relaxed">
                    <strong>Remember:</strong> Only share information you would be comfortable sharing in a public academic setting, such as your major, year of study, academic interests, and campus involvement. Campus Connect is designed to help you build professional and academic connections safely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="py-20 bg-white dark:bg-dark-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-dark-text-primary mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
                Campus Connect brings together all the tools you need to thrive in your academic journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card p-8 hover:shadow-xl transition-all duration-200 group">
                <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <FiUsers className="text-primary-600 dark:text-primary-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                  Connect with Peers
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                  Find and connect with students in your major, classes, or university. Build your academic network effortlessly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-8 hover:shadow-xl transition-all duration-200 group">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <FiBook className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                  Study Groups
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                  Join or create study groups for your courses. Collaborate with classmates and ace your exams together.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-8 hover:shadow-xl transition-all duration-200 group">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <FiCalendar className="text-green-600 dark:text-green-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                  Campus Events
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                  Discover and RSVP to campus events, workshops, and social gatherings. Never miss out on opportunities.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="card p-8 hover:shadow-xl transition-all duration-200 group">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <FiMessageCircle className="text-orange-600 dark:text-orange-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                  Activity Feed
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                  Stay updated with posts, announcements, and discussions from your campus community in real-time.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="card p-8 hover:shadow-xl transition-all duration-200 group">
                <div className="p-4 bg-teal-100 dark:bg-teal-900/30 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <FiStar className="text-teal-600 dark:text-teal-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                  Course Reviews
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                  Read honest reviews from fellow students to make informed decisions about your course selections.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="card p-8 hover:shadow-xl transition-all duration-200 group">
                <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <FiAward className="text-pink-600 dark:text-pink-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                  Share Resources
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                  Access and share study materials, notes, and resources with your peers to succeed together.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 bg-gray-50 dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-dark-text-primary mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-xl text-gray-600 dark:text-dark-text-secondary">
                Join your campus community in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="card p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                    Create Your Profile
                  </h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary">
                    Sign up with your university email and set up your profile with your major and interests.
                  </p>
                </div>
                {/* Connector arrow for desktop */}
                <div className="hidden md:block absolute top-12 -right-4 text-primary-300 dark:text-primary-700">
                  <FiArrowRight size={32} />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="card p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                    Discover & Connect
                  </h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary">
                    Find students in your major, join study groups, and follow peers with similar interests.
                  </p>
                </div>
                {/* Connector arrow for desktop */}
                <div className="hidden md:block absolute top-12 -right-4 text-primary-300 dark:text-primary-700">
                  <FiArrowRight size={32} />
                </div>
              </div>

              {/* Step 3 */}
              <div className="card p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                  Engage & Grow
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  Participate in events, share resources, and build meaningful connections that last.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="py-20 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-extrabold text-white mb-6">
                Ready to Connect with Your Campus?
              </h2>
              <p className="text-xl text-primary-100 mb-10">
                Join thousands of students already building their network on Campus Connect
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-10 py-5 bg-white text-primary-600 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg"
                >
                  Get Started Free
                  <FiArrowRight className="ml-2" size={24} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-10 py-5 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200 text-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
