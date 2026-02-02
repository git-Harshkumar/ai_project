
const Hero = () => {
    return (
        <section className="hero" id="home">
            <div className="container">
                <div className="hero-content">
                    <h1>Modern Banking for Your Ambitions.</h1>
                    <p>
                        Experience the next generation of financial services. From instant loan approvals
                        to smart investment tools, we're here to power your dreams with AI-driven precision.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-white">Check Your Eligibility</button>
                        <button className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Learn More</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
