import { useEffect, useState } from 'react';

const DURATION = 4000; // ms visible before exit animation starts

function SplashScreen({ onFinish }) {
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);
    const [subtitleIdx, setSubtitleIdx] = useState(0);

    const subtitles = [
        'AI-Powered Predictions',
        'Machine Learning at Scale',
        'Instant Loan Decisions',
    ];

    // Progress bar fills over DURATION ms
    useEffect(() => {
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const pct = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(pct);
            if (pct < 100) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, []);

    // Cycle subtitle text
    useEffect(() => {
        const id = setInterval(() => {
            setSubtitleIdx(i => (i + 1) % subtitles.length);
        }, 1300);
        return () => clearInterval(id);
    }, []);

    // Trigger exit then call onFinish
    useEffect(() => {
        const exitTimer = setTimeout(() => setExiting(true), DURATION);
        const doneTimer = setTimeout(() => onFinish(), DURATION + 700);
        return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
    }, [onFinish]);

    // Generate deterministic particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 47 + 13) % 100}%`,
        top: `${(i * 31 + 7) % 100}%`,
        delay: `${(i * 0.3) % 3}s`,
        size: `${6 + (i % 5) * 4}px`,
        duration: `${4 + (i % 4)}s`,
    }));

    return (
        <div className={`splash-root ${exiting ? 'splash-exit' : ''}`}>
            {/* Animated background orbs - more variety */}
            <div className="splash-orb splash-orb-1" />
            <div className="splash-orb splash-orb-2" />
            <div className="splash-orb splash-orb-3" />
            <div className="splash-orb splash-orb-4" />

            {/* Floating particles */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className="splash-particle"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}

            <div className="splash-container">
                <div className="splash-card">
                    <div className="splash-card-inner">
                        <div className="splash-top-bar">
                            <span className="splash-status-dot"></span>
                            <span className="splash-status-text">System Active</span>
                            <span className="splash-version">v2.0.4</span>
                        </div>

                        {/* Main brand area */}
                        <div className="splash-brand">
                            <div className="splash-icon-wrap">
                                <div className="splash-icon-ring" />
                                <div className="splash-icon">
                                    <img src="/logo.png" alt="Logo" />
                                </div>
                            </div>

                            <div className="splash-text-wrap">
                                <h1 className="splash-title">
                                    <span>Loan</span>
                                    <span className="splash-title-accent"> Predict</span>
                                    <span> AI</span>
                                </h1>
                                <p className="splash-subtitle" key={subtitleIdx}>
                                    {subtitles[subtitleIdx]}
                                </p>
                            </div>
                        </div>

                        {/* Tech ecosystem */}
                        <div className="splash-ecosystem">
                            <div className="splash-badges">
                                {['React 19', 'Flask 3.0', 'scikit-learn', 'PyTorch'].map(t => (
                                    <span key={t} className="splash-badge">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Loading dynamics */}
                        <div className="splash-footer">
                            <div className="splash-loading-meta">
                                <span className="splash-loading-label">Initializing Neural Networks</span>
                                <span className="splash-loading-percent">{Math.round(progress)}%</span>
                            </div>
                            <div className="splash-progress-track">
                                <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="splash-loading-msg">
                                {progress < 30 ? 'Allocating system resources...' :
                                    progress < 60 ? 'Loading pre-trained model weights...' :
                                        progress < 90 ? 'Optimizing inference engine...' : 'Finalizing secure connection...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SplashScreen;
