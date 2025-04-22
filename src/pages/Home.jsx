import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { colors } from '../utils/colors';

export default function Home() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero section */}
        <div className={`${colors.card.primary} text-white py-16`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                  Connect with students at your university
                </h1>
                <p className="text-xl lg:text-2xl mb-8">
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
                      to="/explore"
                      className={`btn ${colors.sidebar.bg} ${colors.text.light} hover:bg-primary-700`}
                    >
                      Explore Students
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
        
        {/* Features section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                Connect and Collaborate
              </h2>
              <p className="mt-4 text-xl text-text-secondary">
                Campus Connect helps you build meaningful academic and professional relationships
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card p-6">
                <h3 className="text-xl font-medium text-text-primary mb-2">
                  Create Your Profile
                </h3>
                <p className="text-text-secondary">
                  Showcase your academic interests, major, and professional goals to connect with like-minded peers.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="card p-6">
                <h3 className="text-xl font-medium text-text-primary mb-2">
                  Find Students by Major
                </h3>
                <p className="text-text-secondary">
                  Easily discover and connect with students in your field of study or explore different disciplines.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="card p-6">
                <h3 className="text-xl font-medium text-text-primary mb-2">
                  Build Your Network
                </h3>
                <p className="text-text-secondary">
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
