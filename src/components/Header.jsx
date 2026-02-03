import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <img src="/ipl-logo.png" alt="IPL Logo" className="logo-icon" />
                    <span className="logo-text">SK CrickInfo</span>
                </Link>
                <nav>
                    <ul className="nav-links">
                        <li><Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Matches</Link></li>
                        <li><Link to="/news" className={`nav-link ${location.pathname === '/news' ? 'active' : ''}`}>News</Link></li>
                        <li><a href="https://rapidapi.com/cricketapilive/api/cricbuzz-cricket" target="_blank" rel="noopener noreferrer" className="nav-link">API Docs</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
