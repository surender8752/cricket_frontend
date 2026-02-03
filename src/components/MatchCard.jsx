import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMatchDate, getTimeRemaining } from '../services/cricketApi';

const MatchCard = ({ match }) => {
    const navigate = useNavigate();

    // Format score display
    const formatScore = (team) => {
        if (team.score === '-' && team.wickets === '-') {
            return 'Yet to bat';
        }

        let score = `${team.score}/${team.wickets}`;

        // Add second innings if exists
        if (team.innings2) {
            score = `${team.score}/${team.wickets} & ${team.innings2.runs}/${team.innings2.wickets}`;
        }

        return score;
    };

    // Get overs display
    const getOvers = (team) => {
        if (team.innings2) {
            return team.innings2.overs;
        }
        if (team.overs) {
            return team.overs;
        }
        return '';
    };

    // Get status class
    const getStatusClass = () => {
        if (match.isLive) return 'live';
        if (match.isCompleted) return 'completed';
        return 'upcoming';
    };

    const handleCardClick = () => {
        navigate(`/match/${match.id}`);
    };

    return (
        <div
            className={`match-card ${match.isLive ? 'live' : ''}`}
            onClick={handleCardClick}
            style={{ cursor: 'pointer' }}
        >
            {/* Match Header */}
            <div className="match-header">
                <span className="match-series">{match.seriesName}</span>
                <span className={`match-status ${getStatusClass()}`}>
                    {match.isLive && <span className="status-dot"></span>}
                    {match.isLive ? 'LIVE' : match.isCompleted ? 'RESULT' : 'UPCOMING'}
                </span>
            </div>

            {/* Teams Section */}
            <div className="teams">
                {/* Team 1 */}
                <div className="team">
                    <div className="team-info">
                        <div className="team-flag">
                            {match.team1.shortName.substring(0, 2)}
                        </div>
                        <span className={`team-name ${match.isLive ? 'batting' : ''}`}>
                            {match.team1.name}
                        </span>
                    </div>
                    <div className="team-score">
                        <span className="score">{formatScore(match.team1)}</span>
                        {getOvers(match.team1) && (
                            <span className="overs-badge">
                                {getOvers(match.team1)} <span className="ov-unit">ov</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Team 2 */}
                <div className="team">
                    <div className="team-info">
                        <div className="team-flag">
                            {match.team2.shortName.substring(0, 2)}
                        </div>
                        <span className="team-name">
                            {match.team2.name}
                        </span>
                    </div>
                    <div className="team-score">
                        <span className="score">{formatScore(match.team2)}</span>
                        {getOvers(match.team2) && (
                            <span className="overs-badge">
                                {getOvers(match.team2)} <span className="ov-unit">ov</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Match Status/Result */}
            {match.status && (
                <div className={`match-result-bar ${match.isLive ? 'live' : match.isCompleted ? 'completed' : 'upcoming'}`}>
                    {match.status}
                </div>
            )}

            {/* Match Info */}
            <div className="match-info">
                <div className="match-venue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {match.venue}{match.city && `, ${match.city}`}
                </div>
                <span className="match-time">
                    {match.isUpcoming ? getTimeRemaining(match.startDate) : formatMatchDate(match.startDate)}
                </span>
            </div>

            <div className="card-footer" style={{ marginTop: 'var(--space-md)', textAlign: 'right', fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: '600' }}>
                View Scorecard →
            </div>
        </div>
    );
};

export default MatchCard;
