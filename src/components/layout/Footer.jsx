import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();
  
  return (
    <footer className="bg-white dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 dark:border-dark-border pt-6">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-dark-secondary">
              &copy; {new Date().getFullYear()} Campus Connect
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-6 text-sm text-gray-500 dark:text-dark-secondary">
            <Link to="#" className="hover:text-primary-600 dark:hover:text-primary-400">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-primary-600 dark:hover:text-primary-400">
              Terms of Service
            </Link>
            <Link to="#" className="hover:text-primary-600 dark:hover:text-primary-400">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}