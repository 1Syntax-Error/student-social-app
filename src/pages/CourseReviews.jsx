import { useState } from 'react';
import { FiStar, FiThumbsUp, FiMessageSquare, FiBook, FiFilter } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { COURSES } from '../utils/constants';

const mockReviews = [
  {
    id: 1,
    course: 'CS 101 - Introduction to Computer Science',
    professor: 'Dr. Sarah Mitchell',
    rating: 5,
    difficulty: 3,
    workload: 'Moderate',
    semester: 'Fall 2024',
    review: 'Excellent introduction to programming! Dr. Mitchell explains concepts clearly and the projects are really interesting.',
    helpful: 45,
    author: 'Anonymous',
    date: '2025-01-15'
  },
  {
    id: 2,
    course: 'MATH 201 - Calculus II',
    professor: 'Prof. James Chen',
    rating: 4,
    difficulty: 4,
    workload: 'Heavy',
    semester: 'Fall 2024',
    review: 'Challenging but rewarding. Prof. Chen holds great office hours. Make sure to do all the practice problems!',
    helpful: 32,
    author: 'Anonymous',
    date: '2025-01-10'
  },
  {
    id: 3,
    course: 'PSYCH 101 - Introduction to Psychology',
    professor: 'Dr. Emily Rodriguez',
    rating: 5,
    difficulty: 2,
    workload: 'Light',
    semester: 'Fall 2024',
    review: 'Fascinating course with engaging lectures. Dr. Rodriguez is passionate about the subject and it shows.',
    helpful: 56,
    author: 'Anonymous',
    date: '2025-01-12'
  },
  {
    id: 4,
    course: 'PHYS 101 - Physics I',
    professor: 'Prof. Michael Thompson',
    rating: 3,
    difficulty: 5,
    workload: 'Very Heavy',
    semester: 'Fall 2024',
    review: 'Very difficult course. The exams are tough but the curve helps. Go to study sessions!',
    helpful: 28,
    author: 'Anonymous',
    date: '2025-01-08'
  },
  {
    id: 5,
    course: 'ENG 101 - English Composition',
    professor: 'Dr. Amanda Williams',
    rating: 4,
    difficulty: 2,
    workload: 'Moderate',
    semester: 'Fall 2024',
    review: 'Great class for improving writing skills. Dr. Williams provides detailed feedback on all assignments.',
    helpful: 40,
    author: 'Anonymous',
    date: '2025-01-14'
  }
];

export default function CourseReviews() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'helpful', 'rating'
  const [showWriteReview, setShowWriteReview] = useState(false);

  const filteredReviews = mockReviews.filter(review => {
    return !selectedCourse || review.course === selectedCourse;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    if (sortBy === 'rating') return b.rating - a.rating;
    return new Date(b.date) - new Date(a.date);
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`inline ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        size={16}
      />
    ));
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return 'text-green-600 dark:text-green-400';
    if (difficulty <= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Course Reviews
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Read reviews and share your experience with courses
            </p>
          </div>

          {/* Filter and Sort */}
          <div className="card p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                    Filter by Course
                  </label>
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="rating">Highest Rating</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowWriteReview(true)}
                className="btn btn-primary"
              >
                <FiMessageSquare className="mr-2" />
                Write Review
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 sm:space-y-6">
            {sortedReviews.map(review => (
              <div key={review.id} className="card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Rating Box */}
                  <div className="flex-shrink-0 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center md:w-32">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {review.rating.toFixed(1)}
                    </div>
                    <div className="mt-1">
                      {renderStars(review.rating)}
                    </div>
                    <div className={`text-sm font-semibold mt-2 ${getDifficultyColor(review.difficulty)}`}>
                      Difficulty: {review.difficulty}/5
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                        {review.course}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        {review.professor} • {review.semester} • Workload: {review.workload}
                      </p>
                    </div>

                    <p className="text-gray-700 dark:text-dark-text-secondary mb-4">
                      {review.review}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          <FiThumbsUp size={16} />
                          <span>{review.helpful} helpful</span>
                        </button>
                        <span className="text-gray-400 dark:text-dark-text-secondary">
                          by {review.author}
                        </span>
                      </div>
                      <span className="text-gray-400 dark:text-dark-text-secondary">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedReviews.length === 0 && (
            <div className="card p-12 text-center">
              <FiBook className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                Be the first to review this course!
              </p>
              <button onClick={() => setShowWriteReview(true)} className="btn btn-primary">
                <FiMessageSquare className="mr-2" />
                Write Review
              </button>
            </div>
          )}

          {/* Write Review Modal Placeholder */}
          {showWriteReview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Write a Review</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                  This feature will allow you to write a course review with ratings for difficulty, workload, and overall quality.
                </p>
                <button
                  onClick={() => setShowWriteReview(false)}
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
