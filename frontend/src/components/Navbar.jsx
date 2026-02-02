
const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <a href="/" className="nav-logo">
                    <span style={{ color: 'var(--accent)' }}>🏦</span> ApexGlobal
                </a>

                <div className="nav-links">
                    <a href="#home" className="nav-link">Personal Banking</a>
                    <a href="#business" className="nav-link">Business</a>
                    <a href="#loans" className="nav-link">Loans</a>
                    <a href="#invest" className="nav-link">Invest</a>
                    <a href="#support" className="nav-link">Support</a>
                </div>

                <div className="nav-actions">
                    <button className="btn btn-outline" style={{ padding: '0.6rem 1.4rem' }}>Login</button>
                    <button className="btn btn-primary" style={{ padding: '0.6rem 1.4rem' }}>Open Account</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
