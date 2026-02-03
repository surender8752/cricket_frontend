import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

// Get API key from localStorage
export const getApiKey = () => {
    return localStorage.getItem('cricket_api_key') || '';
};

export const saveApiKey = (key) => {
    localStorage.setItem('cricket_api_key', key);
};

export const clearApiKey = () => {
    localStorage.removeItem('cricket_api_key');
};

export const isDemoMode = () => {
    return localStorage.getItem('cricket_demo_mode') === 'true';
};

export const setDemoMode = (enabled) => {
    localStorage.setItem('cricket_demo_mode', enabled);
};

// --- MOCK DATA (Legacy) ---
const MOCK_MATCHES = {
    data: [
        {
            id: 101,
            name: "India vs Australia T20",
            status: "Finished",
            starting_at: new Date().toISOString(),
            league: { name: "International T20" },
            venue: { name: "Wankhede Stadium", city: "Mumbai" },
            participants: [
                { name: "India", code: "IND", image_path: "https://cdn.sportmonks.com/images/cricket/teams/1/1.png", meta: { home: true } },
                { name: "Australia", code: "AUS", image_path: "https://cdn.sportmonks.com/images/cricket/teams/2/2.png", meta: { home: false } }
            ],
            runs: [
                { team_id: 1, score: 184, wickets: 4, overs: 20 },
                { team_id: 2, score: 182, wickets: 8, overs: 20 }
            ]
        }
    ]
};

// --- API Calls ---

export const getLiveMatches = async () => {
    if (isDemoMode()) return MOCK_MATCHES;
    try {
        const response = await axios.get(`${API_BASE_URL}/matches/live`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch live matches.');
    }
};

export const getRecentMatches = async () => {
    if (isDemoMode()) return MOCK_MATCHES;
    try {
        const response = await axios.get(`${API_BASE_URL}/matches/recent`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch recent matches.');
    }
};

export const getUpcomingMatches = async () => {
    if (isDemoMode()) return MOCK_MATCHES;
    try {
        const response = await axios.get(`${API_BASE_URL}/matches/upcoming`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch upcoming matches.');
    }
};

export const getMatchDetails = async (matchId) => {
    if (isDemoMode()) return { data: MOCK_MATCHES.data[0] };
    try {
        const response = await axios.get(`${API_BASE_URL}/match/${matchId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch match details.');
    }
};

export const getMatchScorecard = async (matchId) => {
    if (isDemoMode()) return { data: MOCK_MATCHES.data[0] };
    try {
        const response = await axios.get(`${API_BASE_URL}/match/${matchId}/scorecard`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch scorecard.');
    }
};

export const getMatchCommentary = async (matchId) => {
    if (isDemoMode()) return { data: { commentaries: [] } };
    try {
        const response = await axios.get(`${API_BASE_URL}/match/${matchId}/commentary`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch commentary.');
    }
};

export const getNewsList = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/news`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch news.');
    }
};

// CricAPI.com - Get all scores (Live, Recent, Upcoming in one call)
export const getCricAPIScores = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cricapi/scores`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch cricket scores.');
    }
};

// --- DATA PARSERS ---

export const parseMatchData = (apiData) => {
    if (!apiData) return [];

    // CricAPI.com Format (Free API) - Priority format
    // Response: { apikey, data: [{id, dateTimeGMT, matchType, status, ms, t1, t2, t1s, t2s, t1img, t2img, series}] }
    if (apiData.data && Array.isArray(apiData.data) && apiData.data[0]?.t1 && apiData.data[0]?.t2) {
        return apiData.data.map(match => {
            // Parse score strings like "184/4 (20)" or ""
            const parseScore = (scoreStr) => {
                if (!scoreStr || scoreStr === '') return { runs: '', wickets: '', overs: '' };
                const parts = scoreStr.match(/(\d+)\/(\d+)\s*\(([^)]+)\)/);
                if (parts) {
                    return {
                        runs: parts[1],
                        wickets: parts[2],
                        overs: parts[3]
                    };
                }
                return { runs: scoreStr, wickets: '', overs: '' };
            };

            const team1Score = parseScore(match.t1s);
            const team2Score = parseScore(match.t2s);

            // Determine match state
            const isLive = match.ms === 'live';
            const isCompleted = match.ms === 'result';
            const isUpcoming = match.ms === 'fixture';

            return {
                id: match.id,
                matchDesc: `${match.t1} vs ${match.t2}`,
                matchFormat: match.matchType?.toUpperCase() || 'T20',
                status: match.status || '',
                state: match.ms || '',
                seriesName: match.series || 'Cricket Series',
                venue: '',
                city: '',
                startDate: match.dateTimeGMT ? new Date(match.dateTimeGMT).getTime() : null,
                team1: {
                    name: match.t1,
                    shortName: match.t1.match(/\[([^\]]+)\]/)?.[1] || match.t1.substring(0, 3).toUpperCase(),
                    logo: match.t1img || '',
                    score: team1Score.runs,
                    wickets: team1Score.wickets,
                    overs: team1Score.overs
                },
                team2: {
                    name: match.t2,
                    shortName: match.t2.match(/\[([^\]]+)\]/)?.[1] || match.t2.substring(0, 3).toUpperCase(),
                    logo: match.t2img || '',
                    score: team2Score.runs,
                    wickets: team2Score.wickets,
                    overs: team2Score.overs
                },
                isLive,
                isCompleted,
                isUpcoming
            };
        });
    }

    // CricAPI Format (RapidAPI)
    if (apiData.data && Array.isArray(apiData.data) && apiData.data[0]?.teams) {
        return apiData.data.map(match => {
            // CricAPI uses 'teams' array
            const teams = match.teams || match.teamInfo || [];
            const team1 = teams[0] || {};
            const team2 = teams[1] || {};

            // Parse scores
            const score = match.score || [];
            const team1Score = score[0] || {};
            const team2Score = score[1] || {};

            return {
                id: match.id || match.match_id,
                matchDesc: match.name || match.matchType || 'Cricket Match',
                matchFormat: match.matchType || 'Cricket',
                status: match.status || match.matchStatus || '',
                state: match.matchStatus || '',
                seriesName: match.series || match.seriesName || 'Cricket Series',
                venue: match.venue || 'TBA',
                city: '',
                startDate: match.dateTimeGMT ? new Date(match.dateTimeGMT).getTime() : null,
                team1: {
                    name: team1.name || team1.teamName || 'Team 1',
                    shortName: team1.shortName || team1.name?.substring(0, 3).toUpperCase() || 'T1',
                    logo: team1.img || team1.logo,
                    score: team1Score.r || team1Score.runs || '-',
                    wickets: team1Score.w || team1Score.wickets || '-',
                    overs: team1Score.o || team1Score.overs || ''
                },
                team2: {
                    name: team2.name || team2.teamName || 'Team 2',
                    shortName: team2.shortName || team2.name?.substring(0, 3).toUpperCase() || 'T2',
                    logo: team2.img || team2.logo,
                    score: team2Score.r || team2Score.runs || '-',
                    wickets: team2Score.w || team2Score.wickets || '-',
                    overs: team2Score.o || team2Score.overs || ''
                },
                isLive: match.matchStarted && !match.matchEnded,
                isCompleted: match.matchEnded || false,
                isUpcoming: !match.matchStarted || false
            };
        });
    }

    // Legacy Sportmonks/EntitySport Format (Fallback)
    if (apiData.response?.items) {
        return apiData.response.items.map(item => ({
            id: item.match_id,
            matchDesc: item.short_title || '',
            matchFormat: item.format_str || 'Cricket',
            status: item.status_note || '',
            state: item.status_str || '',
            seriesName: item.competition?.title || 'Cricket Series',
            venue: item.venue?.name || 'TBA',
            city: item.venue?.location || '',
            startDate: item.date_start ? new Date(item.date_start).getTime() : null,
            team1: {
                name: item.teama?.name || 'Team 1',
                shortName: item.teama?.short_name || 'T1',
                logo: item.teama?.logo_url,
                score: item.teama?.scores || '-',
                wickets: item.teama?.wickets || '-',
                overs: item.teama?.overs || ''
            },
            team2: {
                name: item.teamb?.name || 'Team 2',
                shortName: item.teamb?.short_name || 'T2',
                logo: item.teamb?.logo_url,
                score: item.teamb?.scores || '-',
                wickets: item.teamb?.wickets || '-',
                overs: item.teamb?.overs || ''
            },
            isLive: item.status === 2,
            isCompleted: item.status === 3,
            isUpcoming: item.status === 1
        }));
    }

    return [];
};

export const formatMatchDate = (timestamp) => {
    if (!timestamp) return 'TBA';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getTimeRemaining = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date().getTime();
    const diff = timestamp - now;
    if (diff <= 0) return 'Started';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};
