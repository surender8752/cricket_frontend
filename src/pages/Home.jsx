import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MatchCard from '../components/MatchCard';
import Loading from '../components/Loading';
import Stats from '../components/Stats';
import {
    getLiveMatches,
    getRecentMatches,
    getUpcomingMatches,
    getCricAPIScores,
    parseMatchData,
    getApiKey,
    isDemoMode,
    setDemoMode
} from '../services/cricketApi';

const Home = () => {
    // State
    const [activeTab, setActiveTab] = useState('live');
    const [liveMatches, setLiveMatches] = useState([]);
    const [recentMatches, setRecentMatches] = useState([]);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch matches using CricAPI.com (all in one call)
    const fetchMatches = useCallback(async (type) => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all scores from cricapi.com
            const data = await getCricAPIScores();
            const allMatches = parseMatchData(data);

            // Filter matches by state
            const live = allMatches.filter(m => m.isLive);
            const recent = allMatches.filter(m => m.isCompleted);
            const upcoming = allMatches.filter(m => m.isUpcoming);

            setLiveMatches(live);
            setRecentMatches(recent);
            setUpcomingMatches(upcoming);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);


    // Initial load
    useEffect(() => {
        fetchMatches(activeTab);
    }, [activeTab, fetchMatches]);

    // Auto-refresh for live matches every 60 seconds
    useEffect(() => {
        if (activeTab !== 'live') return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchMatches('live');
            }
        }, 60000); // 60 seconds interval

        return () => clearInterval(interval);
    }, [activeTab, fetchMatches]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Get current matches based on active tab
    const getCurrentMatches = () => {
        switch (activeTab) {
            case 'live':
                return liveMatches;
            case 'recent':
                return recentMatches;
            case 'upcoming':
                return upcomingMatches;
            default:
                return [];
        }
    };

    const currentMatches = getCurrentMatches();

    return (
        <div className="home-page">
            <main className="main-content">
                {/* Hero Section */}
                <section className="hero">
                    <div className="hero-background"></div>
                    <div className="hero-overlay"></div>

                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="live-dot"></span>
                            Live Cricket Scores
                        </div>

                        <h1>
                            Track Every <span className="hero-highlight">Ball</span>.<br />
                            Never Miss a <span className="hero-highlight">Moment</span>.
                        </h1>
                        <p>
                            Real-time cricket scores from IPL, World Cup, T20, Tests & more.
                            Stay updated with live ball-by-ball commentary and match statistics.
                        </p>
                    </div>
                </section>



                {/* Stats Section */}
                <Stats
                    liveCount={liveMatches.length}
                    upcomingCount={upcomingMatches.length}
                    recentCount={recentMatches.length}
                />

                {/* Tab Navigation */}
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
                        onClick={() => handleTabChange('live')}
                    >
                        🔴 Live ({liveMatches.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => handleTabChange('upcoming')}
                    >
                        📅 Upcoming ({upcomingMatches.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
                        onClick={() => handleTabChange('recent')}
                    >
                        ✅ Recent ({recentMatches.length})
                    </button>
                </div>

                {/* Last Updated */}
                {lastUpdated && !loading && (
                    <p style={{ textAlign: 'center', color: 'var(--dark-500)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
                        Last updated: {lastUpdated}
                        {activeTab === 'live' && ' • Auto-refreshing every 60s'}
                    </p>
                )}

                {/* Loading State */}
                {loading && <Loading message="Fetching latest scores..." />}

                {/* Error State */}
                {error && !loading && (
                    <div className="error-state">
                        <h3>⚠️ {error.includes('429') ? 'Rate Limit Reached' : 'Oops! Something went wrong'}</h3>
                        <p>{error.includes('429')
                            ? "The API rate limit was reached. Please wait for a minute and try again."
                            : error}
                        </p>
                        <div className="error-actions">
                            <button className="retry-btn" onClick={() => fetchMatches(activeTab)}>
                                {error.includes('429') ? 'Wait & Retry' : 'Try Again'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && currentMatches.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🏏</div>
                        <h3>No Matches Found</h3>
                        <p>
                            {activeTab === 'live'
                                ? "There are no live matches at the moment. Check back soon!"
                                : activeTab === 'upcoming'
                                    ? "No upcoming matches scheduled."
                                    : "No recent matches found."}
                        </p>
                    </div>
                )}

                {/* Matches Grid */}
                {!loading && !error && currentMatches.length > 0 && (
                    <div className="matches-grid">
                        {currentMatches.map((match) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
