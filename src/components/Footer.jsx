import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <p className="footer-copyright">
                    © {currentYear} SK™. All Rights Reserved.
                </p>
                <p className="footer-credits">
                    Designed & Developed by <span className="footer-brand">SK™</span> with <span className="footer-heart">❤️</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
