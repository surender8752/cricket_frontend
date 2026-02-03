import React, { useState, useEffect, useCallback } from 'react';
import { getNewsList, isDemoMode, setDemoMode } from '../services/cricketApi';
import Loading from '../components/Loading';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getNewsList();
            setNews(data?.storyList || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleTryDemo = () => {
        setDemoMode(true);
        fetchNews();
    };

    if (loading) return <div className="main-content"><Loading message="Fetching latest cricket news..." /></div>;

    return (
        <div className="news-page">
            <main className="main-content">
                <header className="page-header">
                    <h1>Latest Cricket <span className="hero-highlight">News</span></h1>
                    <p>Stay updated with the latest stories and highlights from the world of cricket.</p>
                </header>

                {error && (
                    <div className="error-state">
                        <h3>⚠️ Oops! News update failed</h3>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button className="retry-btn" onClick={fetchNews}>Try Again</button>
                            {!isDemoMode() && (
                                <button className="demo-btn" onClick={handleTryDemo}>Try Demo Mode</button>
                            )}
                        </div>
                    </div>
                )}

                {!error && (
                    <div className="news-grid">
                        {news.map((item, idx) => {
                            const story = item.story;
                            if (!story) return null;

                            return (
                                <a
                                    key={idx}
                                    href={`https://www.cricbuzz.com/cricket-news/${story.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="news-card"
                                >
                                    {story.imageId && (
                                        <div className="news-image">
                                            <img
                                                src={`https://www.cricbuzz.com/a/img/v1/400x250/i1/c${story.imageId}/i.jpg`}
                                                alt={story.hline}
                                            />
                                        </div>
                                    )}
                                    <div className="news-info">
                                        <div className="news-header-meta">
                                            <span className="news-context">{story.context}</span>
                                            {isDemoMode() && <span className="demo-tag">Demo</span>}
                                        </div>
                                        <h3 className="news-title">{story.hline}</h3>
                                        <p className="news-intro">{story.intro}</p>
                                        <div className="news-footer">
                                            <span className="news-source">{story.source}</span>
                                            <span className="news-time">
                                                {story.pubTime ? new Date(parseInt(story.pubTime)).toLocaleDateString() : 'Recent'}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}

                {!loading && !error && news.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📰</div>
                        <h3>No News Found</h3>
                        <p>We couldn't find any news stories at the moment.</p>
                        {!isDemoMode() && (
                            <button className="demo-btn" style={{ marginTop: '20px' }} onClick={handleTryDemo}>
                                Try Demo Mode
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default News;

