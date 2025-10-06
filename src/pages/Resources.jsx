import { useState } from 'react';
import { FiFile, FiDownload, FiUpload, FiSearch, FiFilter, FiFolder, FiFileText, FiImage } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { COURSES } from '../utils/constants';

const mockResources = [
  {
    id: 1,
    title: 'Calculus II Midterm Study Guide',
    course: 'MATH 201 - Calculus II',
    type: 'PDF',
    size: '2.4 MB',
    downloads: 156,
    uploadedBy: 'Sarah Johnson',
    date: '2025-01-15',
    description: 'Comprehensive study guide covering chapters 1-5'
  },
  {
    id: 2,
    title: 'CS 101 Final Project Sample',
    course: 'CS 101 - Introduction to Computer Science',
    type: 'ZIP',
    size: '5.8 MB',
    downloads: 89,
    uploadedBy: 'Mike Chen',
    date: '2025-01-12',
    description: 'Example final project with full source code and documentation'
  },
  {
    id: 3,
    title: 'Psychology Research Paper Template',
    course: 'PSYCH 101 - Introduction to Psychology',
    type: 'DOCX',
    size: '125 KB',
    downloads: 234,
    uploadedBy: 'Emma Davis',
    date: '2025-01-10',
    description: 'APA format template for psychology research papers'
  },
  {
    id: 4,
    title: 'Physics I Formula Sheet',
    course: 'PHYS 101 - Physics I',
    type: 'PDF',
    size: '1.2 MB',
    downloads: 312,
    uploadedBy: 'Alex Turner',
    date: '2025-01-08',
    description: 'All important formulas and constants for Physics I'
  },
  {
    id: 5,
    title: 'English Composition Essay Examples',
    course: 'ENG 101 - English Composition',
    type: 'PDF',
    size: '3.1 MB',
    downloads: 178,
    uploadedBy: 'Lisa Brown',
    date: '2025-01-14',
    description: 'Collection of A-grade essays with professor feedback'
  },
  {
    id: 6,
    title: 'Chemistry Lab Report Template',
    course: 'CHEM 101 - General Chemistry',
    type: 'DOCX',
    size: '280 KB',
    downloads: 145,
    uploadedBy: 'David Kim',
    date: '2025-01-11',
    description: 'Standard lab report format with examples'
  }
];

export default function Resources() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fileTypes = ['All', 'PDF', 'DOCX', 'ZIP', 'PPTX', 'Image'];

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || resource.course === selectedCourse;
    const matchesType = !selectedType || selectedType === 'All' || resource.type === selectedType;
    return matchesSearch && matchesCourse && matchesType;
  });

  const getFileIcon = (type) => {
    if (type === 'PDF' || type === 'DOCX') return <FiFileText className="text-blue-500" size={24} />;
    if (type === 'ZIP') return <FiFolder className="text-yellow-500" size={24} />;
    if (type === 'Image') return <FiImage className="text-green-500" size={24} />;
    return <FiFile className="text-gray-500" size={24} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Study Resources
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Share and access study materials, notes, and resources
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input"
                  />
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-primary whitespace-nowrap"
                >
                  <FiUpload className="mr-2" />
                  Upload Resource
                </button>
              </div>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input"
              >
                <option value="">All Courses</option>
                {COURSES.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <div className="flex gap-2 flex-wrap">
                {fileTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type === 'All' ? '' : type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      (type === 'All' && !selectedType) || selectedType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-border/80'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredResources.map(resource => (
              <div key={resource.id} className="card p-4 sm:p-6 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1 truncate">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-accent-teal mb-1">{resource.course}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      {resource.type} • {resource.size}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4 flex-1">
                  {resource.description}
                </p>

                <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-auto">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-text-secondary mb-3">
                    <span>By {resource.uploadedBy}</span>
                    <span>{new Date(resource.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      <FiDownload className="inline mr-1" />
                      {resource.downloads} downloads
                    </span>
                    <button className="btn btn-primary text-sm py-1.5 px-3">
                      <FiDownload className="mr-1" size={14} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="card p-12 text-center">
              <FiFile className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                No resources found
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                Be the first to share a resource for this course!
              </p>
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                <FiUpload className="mr-2" />
                Upload Resource
              </button>
            </div>
          )}

          {/* Upload Modal Placeholder */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Upload Resource</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                  This feature will allow you to upload study materials, notes, and other educational resources to share with classmates.
                </p>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
