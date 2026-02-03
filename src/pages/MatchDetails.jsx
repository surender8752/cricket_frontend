import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { getMatchDetails, getMatchScorecard, getMatchCommentary, formatMatchDate } from '../services/cricketApi';

const MatchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [commentary, setCommentary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('scorecard');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [detailsData, commentaryData] = await Promise.all([
                getMatchDetails(id),
                getMatchCommentary(id)
            ]);
            setDetails(detailsData?.data || detailsData);
            setCommentary(commentaryData?.data || commentaryData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="main-content"><Loading message="Loading match details..." /></div>;
    if (error) return (
        <div className="main-content error-state">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchData}>Try Again</button>
            <button className="retry-btn" onClick={() => navigate('/')} style={{ marginLeft: '10px', background: 'var(--dark-700)' }}>Back Home</button>
        </div>
    );

    const res = details || {};
    const team1 = res.participants?.find(p => p.meta?.home) || res.participants?.[0];
    const team2 = res.participants?.find(p => !p.meta?.home) || res.participants?.[1];

    const venue = res.venue || {};
    const league = res.league || {};

    return (
        <div className="match-details-page">
            <main className="main-content">
                <button onClick={() => navigate('/')} className="back-btn">
                    ← Back to Matches
                </button>

                <section className="match-hero-detail">
                    <div className="series-label">{league.name || 'Cricket Series'}</div>
                    <h2>{team1?.name || 'TBA'} vs {team2?.name || 'TBA'}</h2>
                    <p className="match-desc">{res.name} • {res.type || 'Cricket'}</p>
                    <div className="match-status-bar">
                        {res.note || res.status}
                    </div>
                </section>

                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Venue</span>
                        <span className="info-value">{venue.name || 'TBA'}, {venue.city || ''}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Date</span>
                        <span className="info-value">{formatMatchDate(res.starting_at ? new Date(res.starting_at).getTime() : null)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Match ID</span>
                        <span className="info-value">#{id}</span>
                    </div>
                </div>

                <div className="details-tabs">
                    <button className={`d-tab ${activeTab === 'scorecard' ? 'active' : ''}`} onClick={() => setActiveTab('scorecard')}>Scorecard</button>
                    <button className={`d-tab ${activeTab === 'commentary' ? 'active' : ''}`} onClick={() => setActiveTab('commentary')}>Commentary</button>
                    <button className={`d-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Match Info</button>
                </div>

                {activeTab === 'scorecard' && (
                    <div className="scorecard-container">
                        {/* Sportmonks v3 Scorecard (Runs) */}
                        <div className="inning-section">
                            <div className="inning-header">
                                <h3>Match Summary</h3>
                            </div>
                            <table className="score-table">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Score</th>
                                        <th>Wickets</th>
                                        <th>Overs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {res.runs?.map((run, idx) => {
                                        const team = res.participants?.find(p => p.id === run.team_id);
                                        return (
                                            <tr key={idx}>
                                                <td>{team?.name || 'Innings ' + (idx + 1)}</td>
                                                <td>{run.score}</td>
                                                <td>{run.wickets}</td>
                                                <td>{run.overs}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Detailed Batting/Bowling if available */}
                        {res.batting?.length > 0 && (
                            <div className="inning-section">
                                <div className="inning-header"><h3>Recent Batting</h3></div>
                                <table className="score-table">
                                    <thead><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
                                    <tbody>
                                        {res.batting.slice(0, 5).map((b, idx) => (
                                            <tr key={idx}>
                                                <td>{b.player?.fullname || 'Player'}</td>
                                                <td>{b.score}</td><td>{b.balls}</td><td>{b.four_x}</td><td>{b.six_x}</td><td>{b.rate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!res.runs?.length && <div className="empty-state">No scorecard data available yet.</div>}
                    </div>
                )}

                {activeTab === 'commentary' && (
                    <div className="commentary-container">
                        {res.commentaries?.map((item, idx) => (
                            <div key={idx} className="comm-item">
                                <div className="comm-over">Ball {idx + 1}</div>
                                <div className="comm-content">
                                    <p>{item.comment}</p>
                                </div>
                            </div>
                        ))}
                        {!res.commentaries?.length && <div className="empty-state">No commentary available yet.</div>}
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="match-info-container">
                        <div className="info-card">
                            <h3>Venue Details</h3>
                            <p><strong>Ground:</strong> {venue.name}</p>
                            <p><strong>City:</strong> {venue.city}</p>
                            <p><strong>Capacity:</strong> {venue.capacity || 'TBA'}</p>
                        </div>
                        <div className="info-card">
                            <h3>Match Details</h3>
                            <p><strong>Type:</strong> {res.type}</p>
                            <p><strong>Round:</strong> {res.round}</p>
                            <p><strong>Toss Won:</strong> {res.tosswon?.name || 'TBA'}</p>
                            <p><strong>Winner:</strong> {res.winner?.name || 'TBA'}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MatchDetails;
