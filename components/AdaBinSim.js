const { useState, useEffect, useRef, useMemo } = React;

const AdaBinSim = ({ isActive }) => {
    const canvasRef = useRef(null);
    const [method, setMethod] = useState('standard');
    const particlesRef = useRef([]);
    const animationRef = useRef({ 
        mode: 'DROP', // DROP, WAIT, CLUSTER, SCATTER
        thresholdOpacity: 1,
        timer: 0,
        targetMethod: null
    });
    
    // Configuration
    const BASELINE_OFFSET = 70; 
    const VIEW_RANGE = 2;
    const PARTICLE_RADIUS = 3;
    const STACK_OVERLAP = 3.0; 
    
    // Initialization
    const generateParticles = () => {
        const ps = [];
        let z = 0; 
        while(z>=0.2 || z <=-0.2 || (z<=0.05 && z>=-0.05)) z = Math.random();
        for (let i = 0; i < 200; i++) {
            // Box-Muller N(0, 2)
            let u = 0, v = 0; 
            while(u === 0) u = Math.random(); 
            while(v === 0) v = Math.random();
            let val = Math.sqrt(-1.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * Math.sqrt(2) + z;
            
            ps.push({ 
                val, 
                x: 0, 
                y: -20 - Math.random() * 200, 
                vx: 0, 
                vy: 8 + Math.random() * 10,
                binX: 0, binY: 0, 
                jitterPhase: Math.random() * Math.PI * 2
            });
        }
        particlesRef.current = ps;
        animationRef.current.mode = 'DROP';
        animationRef.current.thresholdOpacity = 1;
    };

    // Trigger switch sequence
    const switchMethod = (newMethod) => {
        if (newMethod === method || animationRef.current.mode === 'SCATTER') return;
        
        // Start transition sequence: SCATTER -> switch method -> CLUSTER
        animationRef.current.mode = 'SCATTER';
        animationRef.current.targetMethod = newMethod;
    }

    useEffect(() => { if(isActive) generateParticles(); }, [isActive]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animId, w, h;
        
        const handleResize = () => {
            const wLogical = canvas.clientWidth;
            const hLogical = canvas.clientHeight;
            
            if (!wLogical || !hLogical) return;
            
            const dpr = window.devicePixelRatio || 1;
            w = wLogical; 
            h = hLogical;
            
            if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
                canvas.width = w * dpr; 
                canvas.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        };

        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(canvas);
        
        handleResize();

        const render = () => {
            if(!w) return;
            ctx.clearRect(0,0,w,h); 
            ctx.font = '12px JetBrains Mono, monospace';

            const floorY = h - BASELINE_OFFSET;
            const mapX = v => (v / (VIEW_RANGE * 2) + 0.5) * w;
            
            // 1. Logic Update based on Mode
            const anim = animationRef.current;
            
            // Calculate Stats & Thresholds
            let sum = 0; particlesRef.current.forEach(p=>sum+=p.val);
            const mean = sum/particlesRef.current.length;
            
            let threshold = 0, barPosNeg = 0, barPosPos = 0;
            let alpha = 0, beta = 0;
            let totalError = 0;

            // Calculate Optimal Alpha first for reference
            let sumAbsDiff = 0; 
            particlesRef.current.forEach(p => sumAbsDiff += Math.abs(p.val - mean));
            const optimalAlpha = sumAbsDiff / particlesRef.current.length;

            if (method === 'standard') {
                // Standard: Threshold = 0, Alpha = Mean(|x|)
                beta = 0;
                threshold = 0;
                let sumAbs = 0; particlesRef.current.forEach(p => sumAbs += Math.abs(p.val));
                alpha = sumAbs / particlesRef.current.length;
            } else if (method === 'adabin') {
                // AdaBin: Learnable parameters (simulated as suboptimal)
                // Assume beta converges to mean, but alpha is suboptimal (e.g., smaller)
                beta = mean;
                threshold = beta;
                alpha = optimalAlpha * 0.7; // Simulate suboptimal learning
            } else {
                // Optimized: Analytical solution
                beta = mean;
                threshold = beta;
                alpha = optimalAlpha;
            }

            barPosNeg = beta - alpha; 
            barPosPos = beta + alpha;

            // Calculate Total Error
            particlesRef.current.forEach(p => {
                const reconstructed = (p.val >= threshold) ? (beta + alpha) : (beta - alpha);
                totalError += Math.abs(p.val - reconstructed);
            });

            // Calculate counts for display
            let currentNegCount = 0;
            let currentPosCount = 0;
            particlesRef.current.forEach(p => {
                if (p.val >= threshold) currentPosCount++; else currentNegCount++;
            });

            // --- Phase Logic ---
            let settledCount = 0;

            if (anim.mode === 'DROP') {
                    particlesRef.current.forEach(p => {
                        const targetX = mapX(p.val);
                        p.x = p.x === 0 ? targetX : p.x + (targetX - p.x) * 0.1; 
                        p.y += p.vy;
                        if(p.y >= floorY) { p.y = floorY; settledCount++; }
                    });
                    if (settledCount > particlesRef.current.length * 0.95) {
                        anim.mode = 'CLUSTER'; 
                    }
            } 
            else if (anim.mode === 'SCATTER') {
                anim.thresholdOpacity = Math.max(0, anim.thresholdOpacity - 0.05);
                
                let readyToSwitch = true;
                particlesRef.current.forEach(p => {
                    const targetX = mapX(p.val);
                    const targetY = floorY;
                    
                    p.x += (targetX - p.x) * 0.15;
                    p.y += (targetY - p.y) * 0.15;
                    
                    if (Math.abs(p.x - targetX) > 1 || Math.abs(p.y - targetY) > 1) readyToSwitch = false;
                });

                if (readyToSwitch && anim.thresholdOpacity <= 0.01) {
                    setMethod(anim.targetMethod);
                    anim.mode = 'CLUSTER'; 
                }
            }
            else if (anim.mode === 'CLUSTER') {
                anim.thresholdOpacity = Math.min(1, anim.thresholdOpacity + 0.05);

                let negs = [], poss = [];
                particlesRef.current.forEach(p => {
                    if (p.val >= threshold) poss.push(p); else negs.push(p);
                });
                
                const diameter = PARTICLE_RADIUS * 2;
                
                // Negative Bin
                const negCenterX = mapX(barPosNeg);
                negs.forEach((p, i) => {
                    p.binX = negCenterX + (Math.sin(i * 123.1) * 15); 
                    p.binY = floorY - (i * diameter / STACK_OVERLAP) - PARTICLE_RADIUS; 
                });
                // Positive Bin
                const posCenterX = mapX(barPosPos);
                poss.forEach((p, i) => {
                    p.binX = posCenterX + (Math.sin(i * 321.3) * 15);
                    p.binY = floorY - (i * diameter / STACK_OVERLAP) - PARTICLE_RADIUS;
                });

                particlesRef.current.forEach(p => {
                    p.x += (p.binX - p.x) * 0.1;
                    p.y += (p.binY - p.y) * 0.1;
                    
                    if (Math.abs(p.x - p.binX) < 5 && Math.abs(p.y - p.binY) < 5) {
                        p.x += (Math.random() - 0.5) * 1.5;
                        p.y += (Math.random() - 0.5) * 1.5;
                    }
                });
            }


            // --- Drawing ---
            
            // Axes
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(w, floorY); ctx.stroke();
            const centerX = mapX(0);
            ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h); ctx.stroke();

            // Particles
            particlesRef.current.forEach(p => {
                const isPos = p.val >= threshold;
                ctx.fillStyle = isPos ? '#38bdf8' : '#6b7280';
                ctx.beginPath(); 
                ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI*2); 
                ctx.fill();
            });

            // Threshold Line & Info
            if (anim.thresholdOpacity > 0.01) {
                const splitX = mapX(threshold);
                ctx.save();
                ctx.globalAlpha = anim.thresholdOpacity;
                
                // Threshold Line
                ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h);
                let lineColor = '#9ca3af';
                if (method === 'adabin') lineColor = '#38bdf8';
                if (method === 'optimized') lineColor = '#4ade80';
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 2; ctx.setLineDash([6,6]); ctx.stroke(); 
                
                // Text Info
                ctx.textAlign = 'left';
                
                // Method Label
                ctx.font = 'bold 14px Inter';
                ctx.fillStyle = lineColor;
                let label = 'Standard';
                if (method === 'adabin') label = 'Adaptive (Learnable)';
                if (method === 'optimized') label = 'Optimized (Analytical)';
                ctx.fillText(label, splitX + 10, 30);
                
                // Alpha Value
                ctx.font = '12px JetBrains Mono';
                ctx.fillStyle = '#9ca3af';
                ctx.fillText(`α = ${alpha.toFixed(3)}`, splitX + 10, 50);

                // Total Error
                ctx.font = 'bold 12px JetBrains Mono';
                ctx.fillStyle = 'white';
                ctx.fillText(`Total Error: ${totalError.toFixed(2)}`, splitX + 10, 70);

                ctx.restore();
            }

            // --- Display Count Numbers (Only in CLUSTER mode) ---
            if (anim.mode === 'CLUSTER' && anim.thresholdOpacity > 0.8) {
                ctx.save();
                ctx.globalAlpha = anim.thresholdOpacity;
                ctx.font = 'bold 16px JetBrains Mono';
                ctx.textAlign = 'center';
                
                // Draw Neg Count
                const diameter = PARTICLE_RADIUS * 2;
                const negTopY = floorY - (currentNegCount * diameter / STACK_OVERLAP);
                ctx.fillStyle = '#9ca3af'; 
                ctx.fillText(currentNegCount, mapX(barPosNeg), negTopY - 15);

                // Draw Pos Count
                const posTopY = floorY - (currentPosCount * diameter / STACK_OVERLAP);
                ctx.fillStyle = '#38bdf8'; 
                ctx.fillText(currentPosCount, mapX(barPosPos), posTopY - 15);
                
                ctx.restore();
            }

            animId = requestAnimationFrame(render);
        };
        render(); 
        return () => { 
            cancelAnimationFrame(animId); 
            resizeObserver.disconnect();
        };
    }, [method]);

    return (
            <div className="w-full h-full flex flex-col gap-6 items-center justify-center">
                <div className="relative w-full aspect-[16/11] bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-inner flex-none">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    <div className="absolute top-4 left-4 z-10 flex bg-black/60 p-1 rounded-full border border-white/10 backdrop-blur-md">
                        <div 
                            className="absolute top-1 bottom-1 w-24 rounded-full transition-all duration-300 ease-out bg-white/10 border border-white/20"
                            style={{
                                transform: `translateX(${method === 'standard' ? '4px' : method === 'adabin' ? '100px' : '196px'})`,
                                width: '96px'
                            }}
                        ></div>
                        <button onClick={() => switchMethod('standard')} className={`relative z-10 w-24 py-2 rounded-full text-xs font-bold magnetic-target transition-colors ${method==='standard'?'text-white':'text-gray-400'}`}>Standard</button>
                        <button onClick={() => switchMethod('adabin')} className={`relative z-10 w-24 py-2 rounded-full text-xs font-bold magnetic-target transition-colors ${method==='adabin'?'text-sky-400':'text-gray-400'}`}>Adaptive</button>
                        <button onClick={() => switchMethod('optimized')} className={`relative z-10 w-24 py-2 rounded-full text-xs font-bold magnetic-target transition-colors ${method==='optimized'?'text-green-400':'text-gray-400'}`}>Optimized</button>
                    </div>
                    <button onClick={generateParticles} className="absolute bottom-4 left-4 magnetic-target p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all backdrop-blur-sm"><Icons.Refresh className="w-5 h-5 text-white"/></button>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                    Quantization Error = Σ |Full_Precision - Binary_Reconstruction|
                </div>
            </div>
    );
};
