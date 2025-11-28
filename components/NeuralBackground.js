const { useState, useEffect, useRef } = React;

const NeuralBackground = () => {
    const containerRef = useRef(null);
    const mouse = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalize mouse position -1 to 1
            target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };

        let frameId;
        const animate = () => {
            // Smooth interpolation (lerp) for premium feel
            mouse.current.x += (target.current.x - mouse.current.x) * 0.05;
            mouse.current.y += (target.current.y - mouse.current.y) * 0.05;

            if (containerRef.current) {
                containerRef.current.style.setProperty('--mouse-x', mouse.current.x);
                containerRef.current.style.setProperty('--mouse-y', mouse.current.y);
            }
            frameId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#000000]">
            <style>{`
                @keyframes float-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes float-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-40px, 30px) scale(1.2); }
                }
                @keyframes float-3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(20px, 40px) scale(0.85); }
                }
                @keyframes rotate-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .parallax-layer {
                    position: absolute;
                    transition: transform 0.1s linear;
                    will-change: transform;
                }
            `}</style>
            
            {/* Base Gradient - Slightly lighter for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#050508] via-[#0a0a15] to-[#050508]" />

            {/* Subtle Rotating Light Cone for Complexity */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-[0.03] animate-[rotate-slow_60s_linear_infinite]"
                 style={{ background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, white 30deg, transparent 60deg)' }} />

            {/* Orb 1: Deep Purple/Blue - Top Left - Increased Opacity & Definition */}
            <div className="parallax-layer top-[-10%] left-[-10%] w-[70vw] h-[70vw]" 
                 style={{ transform: 'translate(calc(var(--mouse-x) * -20px), calc(var(--mouse-y) * -20px))' }}>
                <div className="w-full h-full rounded-full blur-[80px] opacity-60 animate-[float-1_20s_ease-in-out_infinite]"
                     style={{ background: 'radial-gradient(circle at center, #581c87 0%, #312e81 40%, transparent 70%)' }} />
            </div>

            {/* Orb 2: Cyan/Sky - Bottom Right - Increased Opacity & Definition */}
            <div className="parallax-layer bottom-[-20%] right-[-10%] w-[80vw] h-[80vw]"
                 style={{ transform: 'translate(calc(var(--mouse-x) * -30px), calc(var(--mouse-y) * -30px))' }}>
                <div className="w-full h-full rounded-full blur-[90px] opacity-50 animate-[float-2_25s_ease-in-out_infinite]"
                     style={{ background: 'radial-gradient(circle at center, #0284c7 0%, #0369a1 40%, transparent 70%)' }} />
            </div>

            {/* Orb 3: Accent Pink/Indigo - Center/Floating - Increased Opacity */}
            <div className="parallax-layer top-[20%] left-[30%] w-[40vw] h-[40vw]"
                 style={{ transform: 'translate(calc(var(--mouse-x) * -50px), calc(var(--mouse-y) * -50px))' }}>
                <div className="w-full h-full rounded-full blur-[70px] opacity-40 animate-[float-3_18s_ease-in-out_infinite]"
                     style={{ background: 'radial-gradient(circle at center, #db2777 0%, #be185d 40%, transparent 70%)' }} />
            </div>

             {/* Orb 4: Warm Gold/Orange - Subtle Highlight - Increased Opacity */}
             <div className="parallax-layer top-[40%] right-[20%] w-[30vw] h-[30vw]"
                 style={{ transform: 'translate(calc(var(--mouse-x) * -40px), calc(var(--mouse-y) * -40px))' }}>
                <div className="w-full h-full rounded-full blur-[60px] opacity-30 animate-[float-1_22s_ease-in-out_infinite]"
                     style={{ background: 'radial-gradient(circle at center, #d97706 0%, transparent 70%)' }} />
            </div>

            {/* Noise Overlay - Slightly reduced for cleaner look */}
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        </div>
    );
};
