import { Link } from 'react-router-dom';
import { colors } from '../../utils/colors';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 pt-6">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <p className={`text-sm ${colors.text.secondary}`}>
              &copy; {new Date().getFullYear()} Campus Connect
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-6 text-sm text-text-secondary">
            <Link to="#" className={`${colors.text.secondary} hover:text-primary-600`}>
              Privacy Policy
            </Link>
            <Link to="#" className={`${colors.text.secondary} hover:text-primary-600`}>
              Terms of Service
            </Link>
            <Link to="#" className={`${colors.text.secondary} hover:text-primary-600`}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}