
const Features = () => {
    const features = [
        {
            icon: '⚡',
            title: 'Instant Approval',
            description: 'Get your loan status predicted in seconds using our advanced machine learning models.'
        },
        {
            icon: '🛡️',
            title: 'Secure Banking',
            description: 'Your data is protected with enterprise-grade encryption and security protocols.'
        },
        {
            icon: '📊',
            title: 'Smart Insights',
            description: 'Deep dive into model metrics and understand the "why" behind every financial decision.'
        }
    ];

    return (
        <section className="features-section">
            <div className="container">
                <div className="section-header">
                    <h2>Why Choose ApexGlobal?</h2>
                    <p>We combine traditional trust with cutting-edge technology.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
