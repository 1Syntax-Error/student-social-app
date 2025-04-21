// 20. src/pages/Login.jsx
import LoginForm from '../components/auth/LoginForm';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-md w-full mx-auto px-4 sm:px-6">
          <LoginForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}