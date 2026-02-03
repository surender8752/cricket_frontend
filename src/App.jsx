import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MatchDetails from './pages/MatchDetails';
import News from './pages/News';

const App = () => {
    return (
        <div className="app">
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/news" element={<News />} />
                <Route path="/match/:id" element={<MatchDetails />} />
            </Routes>
            <Footer />
        </div>
    );
};

export default App;
