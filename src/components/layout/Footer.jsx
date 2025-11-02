import { Link } from 'react-router-dom';
import { colors } from '../../utils/colors';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
              &copy; {new Date().getFullYear()} Campus Connect
            </p>
          </div>

          <div className="flex mt-4 md:mt-0 space-x-6 text-sm">
            <Link to="/feedback" className="text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Feedback & Bugs
            </Link>
            <Link to="#" className="text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}