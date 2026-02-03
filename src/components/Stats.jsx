import React from 'react';

const Stats = ({ liveCount, upcomingCount, recentCount }) => {
    return (
        <div className="stats-section">
            <div className="stat-card">
                <div className="stat-icon">🏏</div>
                <div className="stat-value">{liveCount}</div>
                <div className="stat-label">Live Matches</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{upcomingCount}</div>
                <div className="stat-label">Upcoming</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{recentCount}</div>
                <div className="stat-label">Recent</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">60s</div>
                <div className="stat-label">Auto Refresh</div>
            </div>
        </div>
    );
};

export default Stats;
