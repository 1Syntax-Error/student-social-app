-- Create feature_suggestions table
CREATE TABLE IF NOT EXISTS feature_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'planned', 'in_progress', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create suggestion_votes table
CREATE TABLE IF NOT EXISTS suggestion_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    suggestion_id UUID NOT NULL REFERENCES feature_suggestions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(suggestion_id, user_id)
);

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'wont_fix')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_user_id ON feature_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_status ON feature_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_created_at ON feature_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_suggestion_votes_suggestion_id ON suggestion_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_votes_user_id ON suggestion_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE feature_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policies for feature_suggestions
-- Everyone can read suggestions
CREATE POLICY "Anyone can view feature suggestions"
    ON feature_suggestions FOR SELECT
    USING (true);

-- Only authenticated users can create suggestions
CREATE POLICY "Authenticated users can create suggestions"
    ON feature_suggestions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own suggestions
CREATE POLICY "Users can update own suggestions"
    ON feature_suggestions FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own suggestions
CREATE POLICY "Users can delete own suggestions"
    ON feature_suggestions FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for suggestion_votes
-- Everyone can view votes
CREATE POLICY "Anyone can view suggestion votes"
    ON suggestion_votes FOR SELECT
    USING (true);

-- Only authenticated users can vote
CREATE POLICY "Authenticated users can vote"
    ON suggestion_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
    ON suggestion_votes FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for bug_reports
-- Everyone can read bug reports
CREATE POLICY "Anyone can view bug reports"
    ON bug_reports FOR SELECT
    USING (true);

-- Only authenticated users can create bug reports
CREATE POLICY "Authenticated users can create bug reports"
    ON bug_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own bug reports
CREATE POLICY "Users can update own bug reports"
    ON bug_reports FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own bug reports
CREATE POLICY "Users can delete own bug reports"
    ON bug_reports FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_feature_suggestions_updated_at
    BEFORE UPDATE ON feature_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
