import { FiLoader } from 'react-icons/fi';

export default function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen bg-background dark:bg-dark-bg">
      <div className="text-center">
        <FiLoader size={48} className="text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-dark-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
