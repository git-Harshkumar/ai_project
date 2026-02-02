
const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <a href="/" className="nav-logo" style={{ color: 'white', marginBottom: '1.5rem', display: 'inline-block' }}>
                            <span style={{ color: 'var(--accent)' }}>🏦</span> ApexGlobal
                        </a>
                        <p style={{ color: '#94a3b8', maxWidth: '300px' }}>
                            Redefining the future of banking through artificial intelligence and
                            unwavering commitment to our clients' success since 1995.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h3>Banking</h3>
                        <ul className="footer-links">
                            <li><a href="#">Checking Accounts</a></li>
                            <li><a href="#">Savings & CDs</a></li>
                            <li><a href="#">Credit Cards</a></li>
                            <li><a href="#">Mortgages</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3>Support</h3>
                        <ul className="footer-links">
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Security</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3>Corporate</h3>
                        <ul className="footer-links">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Investors</a></li>
                            <li><a href="#">Social Responsibility</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 ApexGlobal Bank N.A. Member FDIC. Equal Housing Lender 🏠</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
