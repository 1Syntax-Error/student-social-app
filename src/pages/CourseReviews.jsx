import { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp, FiMessageSquare, FiBook, FiFilter, FiLoader } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { COURSES } from '../utils/constants';

export default function CourseReviews() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    course: '',
    rating: 5,
    difficulty: 3,
    workload: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    reviewText: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: reviewsData, error } = await supabase
        .from('course_reviews')
        .select(`
          *,
          author:profiles!course_reviews_user_id_fkey(username),
          votes:review_votes(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const courseFull = review.course_code && review.course_name ?
      `${review.course_code} - ${review.course_name}` : review.course_code || review.course_name || '';
    return !selectedCourse || courseFull === selectedCourse;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      const aVotes = a.votes?.[0]?.count || 0;
      const bVotes = b.votes?.[0]?.count || 0;
      return bVotes - aVotes;
    }
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.created_at) - new Date(a.created_at);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      // Parse course code and name from COURSES constant
      const [courseCode, courseName] = formData.course ? formData.course.split(' - ') : ['', ''];

      const { error } = await supabase
        .from('course_reviews')
        .insert([
          {
            user_id: user.id,
            course_code: courseCode,
            course_name: courseName,
            rating: formData.rating,
            difficulty: formData.difficulty,
            workload: formData.workload || null,
            semester: formData.semester,
            year: formData.year,
            review_text: formData.reviewText || null
          }
        ]);

      if (error) throw error;

      // Reset form and close modal
      setFormData({
        course: '',
        rating: 5,
        difficulty: 3,
        workload: '',
        semester: 'Fall',
        year: new Date().getFullYear(),
        reviewText: ''
      });
      setShowWriteReview(false);

      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader size={32} className="text-primary-500 dark:text-primary-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {sortedReviews.map(review => {
                const courseFull = review.course_code && review.course_name ?
                  `${review.course_code} - ${review.course_name}` : review.course_code || review.course_name || 'Unknown Course';
                const voteCount = review.votes?.[0]?.count || 0;
                const semesterYear = review.semester && review.year ? `${review.semester} ${review.year}` : review.semester || review.year || '';

                return (
                  <div key={review.id} className="card p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Rating Box */}
                      <div className="flex-shrink-0 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center md:w-32">
                        {review.rating && (
                          <>
                            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                              {review.rating.toFixed(1)}
                            </div>
                            <div className="mt-1">
                              {renderStars(review.rating)}
                            </div>
                          </>
                        )}
                        {review.difficulty && (
                          <div className={`text-sm font-semibold mt-2 ${getDifficultyColor(review.difficulty)}`}>
                            Difficulty: {review.difficulty}/5
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                            {courseFull}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                            {review.professor_name && `${review.professor_name} • `}
                            {semesterYear}
                            {review.workload && ` • Workload: ${review.workload}`}
                          </p>
                        </div>

                        {review.review_text && (
                          <p className="text-gray-700 dark:text-dark-text-secondary mb-4">
                            {review.review_text}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                              <FiThumbsUp size={16} />
                              <span>{voteCount} helpful</span>
                            </button>
                            {review.author && (
                              <span className="text-gray-400 dark:text-dark-text-secondary">
                                by {review.author.username}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 dark:text-dark-text-secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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

          {/* Write Review Modal */}
          {showWriteReview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowWriteReview(false)}>
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 dark:text-dark-text-primary">Write a Course Review</h2>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Course *
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Select a course</option>
                      {COURSES.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  {/* Overall Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Overall Rating: {formData.rating}/5
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="focus:outline-none"
                        >
                          <FiStar
                            size={32}
                            className={`${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Difficulty: {formData.difficulty}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Easy</span>
                      <span>Moderate</span>
                      <span>Hard</span>
                    </div>
                  </div>

                  {/* Semester and Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Semester *
                      </label>
                      <select
                        required
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="input w-full"
                      >
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Fall">Fall</option>
                        <option value="Winter">Winter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  {/* Workload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Workload (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.workload}
                      onChange={(e) => setFormData({ ...formData, workload: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., Light, Moderate, Heavy"
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={formData.reviewText}
                      onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                      className="input w-full"
                      rows="5"
                      placeholder="Share your experience with this course..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowWriteReview(false)}
                      className="btn btn-secondary flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
