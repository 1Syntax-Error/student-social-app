// 25. src/pages/EditProfile.jsx
import EditProfileForm from '../components/profile/EditProfileForm';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function EditProfile() {
  const { user, loading } = useAuth();
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg">
        <p className="text-gray-600 dark:text-dark-text-secondary">Loading...</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditProfileForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}