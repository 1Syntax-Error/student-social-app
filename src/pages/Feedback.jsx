import { useState, useEffect } from 'react';
import { FaBug, FaLightbulb, FaPaperPlane, FaChartLine, FaChevronUp, FaCheck, FaClock, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Feedback() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' or 'bugs'
  const [suggestions, setSuggestions] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugSteps, setBugSteps] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      // Fetch suggestions with vote counts and user votes
      const { data: suggestionsData, error: sugError } = await supabase
        .from('feature_suggestions')
        .select(`
          *,
          profiles:user_id(username, profile_image_url),
          suggestion_votes(count)
        `)
        .order('created_at', { ascending: false });

      if (sugError) throw sugError;

      // Get user's votes if logged in
      if (user) {
        const { data: userVotes } = await supabase
          .from('suggestion_votes')
          .select('suggestion_id')
          .eq('user_id', user.id);

        const votedIds = new Set(userVotes?.map(v => v.suggestion_id) || []);

        const suggestionsWithVotes = suggestionsData?.map(suggestion => ({
          ...suggestion,
          vote_count: suggestion.suggestion_votes?.[0]?.count || 0,
          user_voted: votedIds.has(suggestion.id)
        })) || [];

        setSuggestions(suggestionsWithVotes);
      } else {
        const suggestionsWithVotes = suggestionsData?.map(suggestion => ({
          ...suggestion,
          vote_count: suggestion.suggestion_votes?.[0]?.count || 0,
          user_voted: false
        })) || [];
        setSuggestions(suggestionsWithVotes);
      }

      // Fetch bugs
      const { data: bugsData, error: bugError } = await supabase
        .from('bug_reports')
        .select('*, profiles:user_id(username, profile_image_url)')
        .order('created_at', { ascending: false });

      if (bugError) throw bugError;
      setBugs(bugsData || []);

    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (suggestionId, currentlyVoted) => {
    if (!user) {
      alert('Please sign in to vote on suggestions');
      return;
    }

    try {
      if (currentlyVoted) {
        // Remove vote
        await supabase
          .from('suggestion_votes')
          .delete()
          .eq('suggestion_id', suggestionId)
          .eq('user_id', user.id);
      } else {
        // Add vote
        await supabase
          .from('suggestion_votes')
          .insert({
            suggestion_id: suggestionId,
            user_id: user.id
          });
      }

      // Refresh suggestions
      fetchFeedback();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleSubmitSuggestion = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit suggestions');
      return;
    }

    if (!suggestionTitle.trim() || !suggestionDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('feature_suggestions')
        .insert({
          user_id: user.id,
          title: suggestionTitle.trim(),
          description: suggestionDescription.trim(),
          status: 'pending'
        });

      if (error) throw error;

      // Reset form
      setSuggestionTitle('');
      setSuggestionDescription('');

      // Refresh data
      fetchFeedback();
      alert('Suggestion submitted successfully!');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitBug = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to report bugs');
      return;
    }

    if (!bugTitle.trim() || !bugDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('bug_reports')
        .insert({
          user_id: user.id,
          title: bugTitle.trim(),
          description: bugDescription.trim(),
          steps_to_reproduce: bugSteps.trim(),
          status: 'open'
        });

      if (error) throw error;

      // Reset form
      setBugTitle('');
      setBugDescription('');
      setBugSteps('');

      // Refresh data
      fetchFeedback();
      alert('Bug report submitted successfully!');
    } catch (error) {
      console.error('Error submitting bug:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      under_review: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      planned: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      open: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      closed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    };

    const icons = {
      pending: FaClock,
      under_review: FaClock,
      planned: FaLightbulb,
      in_progress: FaChartLine,
      completed: FaCheck,
      rejected: FaTimes,
      open: FaBug,
      closed: FaCheck
    };

    const Icon = icons[status] || FaClock;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        <Icon className="mr-1" size={12} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Sort suggestions by vote count
  const sortedSuggestions = [...suggestions].sort((a, b) => b.vote_count - a.vote_count);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-dark-text-primary mb-3">
              Help Us Improve Campus Connect
            </h1>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary">
              Report bugs or suggest new features. Vote on suggestions you'd like to see implemented!
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-dark-border">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === 'suggestions'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaLightbulb size={20} />
                <span>Feature Suggestions</span>
              </div>
              {activeTab === 'suggestions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('bugs')}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === 'bugs'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaBug size={20} />
                <span>Bug Reports</span>
              </div>
              {activeTab === 'bugs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
              )}
            </button>
          </div>

          {/* Feature Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Submit Form */}
              <div className="lg:col-span-1">
                <div className="card p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
                    <FaLightbulb className="mr-2 text-primary-600 dark:text-primary-400" />
                    Submit Suggestion
                  </h2>
                  <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={suggestionTitle}
                        onChange={(e) => setSuggestionTitle(e.target.value)}
                        placeholder="Brief title for your suggestion"
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Description *
                      </label>
                      <textarea
                        value={suggestionDescription}
                        onChange={(e) => setSuggestionDescription(e.target.value)}
                        placeholder="Describe your feature suggestion in detail..."
                        rows={6}
                        className="input w-full"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !user}
                      className="btn bg-primary-600 hover:bg-primary-700 text-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane className="mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Suggestion'}
                    </button>
                    {!user && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                        Please sign in to submit suggestions
                      </p>
                    )}
                  </form>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                    All Suggestions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    {suggestions.length} total
                  </p>
                </div>

                {loading ? (
                  <div className="card p-8 text-center">
                    <p className="text-gray-500 dark:text-dark-text-secondary">Loading suggestions...</p>
                  </div>
                ) : sortedSuggestions.length === 0 ? (
                  <div className="card p-8 text-center">
                    <FaLightbulb className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-dark-text-secondary">
                      No suggestions yet. Be the first to submit one!
                    </p>
                  </div>
                ) : (
                  sortedSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="card p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start space-x-4">
                        {/* Vote Button */}
                        <button
                          onClick={() => handleVote(suggestion.id, suggestion.user_voted)}
                          disabled={!user}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                            suggestion.user_voted
                              ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 dark:border-primary-600 text-primary-600 dark:text-primary-400'
                              : 'border-gray-300 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <FaChevronUp size={24} />
                          <span className="text-sm font-bold mt-1">{suggestion.vote_count}</span>
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
                              {suggestion.title}
                            </h3>
                            {getStatusBadge(suggestion.status)}
                          </div>
                          <p className="text-gray-600 dark:text-dark-text-secondary mb-3 leading-relaxed">
                            {suggestion.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>Suggested by {suggestion.profiles?.username || 'Anonymous'}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Bug Reports Tab */}
          {activeTab === 'bugs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Submit Form */}
              <div className="lg:col-span-1">
                <div className="card p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
                    <FaBug className="mr-2 text-red-600 dark:text-red-400" />
                    Report Bug
                  </h2>
                  <form onSubmit={handleSubmitBug} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={bugTitle}
                        onChange={(e) => setBugTitle(e.target.value)}
                        placeholder="Brief description of the bug"
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Description *
                      </label>
                      <textarea
                        value={bugDescription}
                        onChange={(e) => setBugDescription(e.target.value)}
                        placeholder="What happened? What did you expect to happen?"
                        rows={4}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Steps to Reproduce (Optional)
                      </label>
                      <textarea
                        value={bugSteps}
                        onChange={(e) => setBugSteps(e.target.value)}
                        placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                        rows={4}
                        className="input w-full"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !user}
                      className="btn bg-red-600 hover:bg-red-700 text-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaBug className="mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Bug Report'}
                    </button>
                    {!user && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                        Please sign in to report bugs
                      </p>
                    )}
                  </form>
                </div>
              </div>

              {/* Bugs List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                    All Bug Reports
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    {bugs.length} total
                  </p>
                </div>

                {loading ? (
                  <div className="card p-8 text-center">
                    <p className="text-gray-500 dark:text-dark-text-secondary">Loading bug reports...</p>
                  </div>
                ) : bugs.length === 0 ? (
                  <div className="card p-8 text-center">
                    <FaBug className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-dark-text-secondary">
                      No bug reports yet. Great job!
                    </p>
                  </div>
                ) : (
                  bugs.map((bug) => (
                    <div key={bug.id} className="card p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
                          {bug.title}
                        </h3>
                        {getStatusBadge(bug.status)}
                      </div>
                      <p className="text-gray-600 dark:text-dark-text-secondary mb-3 leading-relaxed">
                        {bug.description}
                      </p>
                      {bug.steps_to_reproduce && (
                        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2">
                            Steps to Reproduce:
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-dark-text-secondary whitespace-pre-line">
                            {bug.steps_to_reproduce}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>Reported by {bug.profiles?.username || 'Anonymous'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
