// 9. src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  
  const navigate = useNavigate();
  const { signIn, signInWithMagicLink } = useAuth();

  const handleEmailPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!useMagicLink && !password) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (useMagicLink) {
        const { success, error } = await signInWithMagicLink(email);
        
        if (success) {
          setMagicLinkSent(true);
        } else {
          setError(error || 'Failed to send magic link');
        }
      } else {
        const { success, error } = await signIn(email, password);
        
        if (success) {
          navigate('/dashboard');
        } else {
          setError(error || 'Failed to sign in');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMethod = () => {
    setUseMagicLink(!useMagicLink);
    setError('');
  };

  if (magicLinkSent) {
    return (
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a magic link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to sign in to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600">Campus Connect</h1>
        <h2 className="text-2xl font-bold text-gray-800 mt-6">Welcome back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleEmailPassword} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="you@university.edu"
            />
          </div>
        </div>
        
        {!useMagicLink && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                <FiLogIn />
                {useMagicLink ? 'Send Magic Link' : 'Sign In'}
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={toggleAuthMethod}
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          {useMagicLink ? 'Use Password Instead' : 'Use Magic Link Instead'}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}