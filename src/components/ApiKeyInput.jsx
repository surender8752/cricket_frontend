import React, { useState, useEffect } from 'react';
import { getApiKey, saveApiKey, isDemoMode, setDemoMode as saveDemoMode } from '../services/cricketApi';

const ApiKeyInput = ({ onKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [demoMode, setDemoMode] = useState(isDemoMode());

    useEffect(() => {
        const savedKey = getApiKey();
        if (savedKey) {
            setApiKey(savedKey);
            setIsSaved(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (apiKey.trim()) {
            saveApiKey(apiKey.trim());
            setIsSaved(true);
            saveDemoMode(false);
            setDemoMode(false);
            onKeySubmit?.(apiKey.trim());
        }
    };

    const handleClear = () => {
        setApiKey('');
        setIsSaved(false);
        localStorage.removeItem('cricket_api_key');
        onKeySubmit?.(null);
    };

    const toggleDemoMode = () => {
        const newMode = !demoMode;
        setDemoMode(newMode);
        saveDemoMode(newMode);
        if (newMode) {
            setIsSaved(false);
            setApiKey('');
            localStorage.removeItem('cricket_api_key');
            onKeySubmit?.('demo'); // Trigger refresh with demo data
        } else {
            onKeySubmit?.(null);
        }
    };

    return (
        <div className={`api-key-section ${demoMode ? 'demo-active' : ''}`}>
            <div className="api-key-header">
                <h3>🔑 API Configuration</h3>
                {demoMode && <span className="demo-badge">Demo Mode Active</span>}
            </div>

            <p>
                Enter your RapidAPI key to access real-time scores from around the world.
                {isSaved && <span className="key-status-success">✓ Key saved!</span>}
            </p>

            <form onSubmit={handleSubmit} className="api-key-input-group">
                <input
                    type="password"
                    className="api-key-input"
                    placeholder="Enter your RapidAPI key..."
                    value={apiKey}
                    onChange={(e) => {
                        setApiKey(e.target.value);
                        setIsSaved(false);
                    }}
                    disabled={demoMode}
                />
                <button type="submit" className="save-key-btn" disabled={demoMode || !apiKey.trim()}>
                    {isSaved ? 'Update' : 'Save Key'}
                </button>
            </form>

            <div className="api-key-footer">
                <div className="footer-links">
                    <a
                        href="https://rapidapi.com/cricketapilive/api/cricbuzz-cricket"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="api-key-link"
                    >
                        → Get your free API key
                    </a>
                    {isSaved && (
                        <button type="button" className="clear-key-btn" onClick={handleClear}>
                            Clear Saved Key
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className={`demo-toggle-btn ${demoMode ? 'active' : ''}`}
                    onClick={toggleDemoMode}
                >
                    {demoMode ? 'Switch to Live Mode' : 'Try with Demo Data'}
                </button>
            </div>
        </div>
    );
};

export default ApiKeyInput;

