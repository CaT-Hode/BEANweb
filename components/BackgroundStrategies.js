
// --- StrategyPruning ---
const StrategyPruning = ({ isActive }) => {
    // Visual: High-fidelity Neural Network with Pruning Animation
    // Improvements: Retina support, Data flow on active paths, Clearer pruning visualization
    
    const [sparsity, setSparsity] = React.useState(0);
    const canvasRef = React.useRef(null);
    const containerRef = React.useRef(null);
    
    // Graph Data
    const graph = React.useMemo(() => {
        const layers = [4, 6, 6, 6, 4]; // Layer structure
        const nodes = [];
        const edges = [];
        
        let nodeId = 0;
        layers.forEach((count, lIdx) => {
            const x = (lIdx + 0.5) / layers.length; // 0.1 to 0.9 range
            for(let i=0; i<count; i++) {
                // Centered y distribution
                const span = 0.8; 
                const spacing = span / (count - 1 || 1);
                const y = 0.5 - (span/2) + i * spacing;
                
                nodes.push({ id: nodeId++, x, y, layer: lIdx });
            }
        });

        // Fully connected
        nodes.forEach(src => {
            nodes.forEach(dst => {
                if (dst.layer === src.layer + 1) {
                    // Weight importance - use a structured random to ensure some paths stay strong
                    const importance = Math.random();
                    edges.push({ 
                        src: src, 
                        dst: dst, 
                        weight: importance, 
                        // Base opacity for "active" state
                        baseOpacity: 0.2 + Math.random() * 0.6 
                    });
                }
            });
        });
        
        return { nodes, edges };
    }, []);

    // Particles Data for flow animation
    const particles = React.useRef([]);

    // Animation Loop
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        
        const ctx = canvas.getContext('2d');
        let frameId;
        
        // High DPI Setup
        const resize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);
            return { w: rect.width, h: rect.height };
        };
        
        let { w, h } = resize();

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);
            
            // Draw Edges
            const threshold = sparsity / 100;
            
            graph.edges.forEach(e => {
                const isPruned = e.weight < threshold;
                
                ctx.beginPath();
                ctx.moveTo(e.src.x * w, e.src.y * h);
                ctx.lineTo(e.dst.x * w, e.dst.y * h);
                
                if (!isPruned) {
                    // Active Connection: Bright Yellow/Gold
                    ctx.strokeStyle = `rgba(250, 204, 21, ${e.baseOpacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([]);
                } else {
                    // Pruned Connection: Faint Gray, Dashed, Thinner
                    // Only show if close to threshold to show "pruning happening"
                    // or show very faintly to indicate "ghost" connection
                    const fade = Math.max(0, 1 - (threshold - e.weight) * 5); // Rapidly fade out after being pruned
                    if (fade > 0) {
                        ctx.strokeStyle = `rgba(100, 100, 100, ${fade * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.setLineDash([2, 4]);
                    } else {
                        ctx.strokeStyle = 'transparent';
                    }
                }
                ctx.stroke();
            });

            // Draw Particles (Data Flow)
            // Spawn new particles randomly on INPUT layer active edges
            if (Math.random() < 0.2) { // Spawn rate
                const activeStartEdges = graph.edges.filter(e => e.src.layer === 0 && e.weight >= threshold);
                if (activeStartEdges.length > 0) {
                    const edge = activeStartEdges[Math.floor(Math.random() * activeStartEdges.length)];
                    particles.current.push({
                        activeEdge: edge,
                        t: 0,
                        speed: 0.02 + Math.random() * 0.02
                    });
                }
            }
            
            // Update & Draw Particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.t += p.speed;
                
                // Draw
                const e = p.activeEdge;
                // If edge became pruned while particle was moving, kill particle
                if (e.weight < threshold) {
                    particles.current.splice(i, 1);
                    continue;
                }
                
                const px = e.src.x * w + (e.dst.x * w - e.src.x * w) * p.t;
                const py = e.src.y * h + (e.dst.y * h - e.src.y * h) * p.t;
                
                const size = 2; // Fixed small size
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                
                // Glow
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Move to next layer?
                if (p.t >= 1) {
                    // Find next edge from current dst
                    const nextEdges = graph.edges.filter(edge => edge.src === e.dst && edge.weight >= threshold);
                    if (nextEdges.length > 0) {
                        p.activeEdge = nextEdges[Math.floor(Math.random() * nextEdges.length)];
                        p.t = 0;
                    } else {
                        // End of line
                        particles.current.splice(i, 1);
                    }
                }
            }

            // Draw Nodes
            graph.nodes.forEach(n => {
                const isActive = graph.edges.some(e => (e.src === n || e.dst === n) && e.weight >= threshold);
                
                ctx.beginPath();
                ctx.arc(n.x * w, n.y * h, isActive ? 4 : 2, 0, Math.PI * 2);
                ctx.fillStyle = isActive ? '#fff' : '#444'; // Dim inactive nodes
                ctx.fill();
                
                if (isActive) {
                    ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });
            
            frameId = requestAnimationFrame(render);
        };
        
        window.addEventListener('resize', () => {
             const dims = resize();
             w = dims.w;
             h = dims.h;
        });
        
        render();
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [graph, sparsity]);

    // Auto-animate sparsity if active
    React.useEffect(() => {
        if (!isActive) return;
        let dir = 1;
        const interval = setInterval(() => {
            setSparsity(prev => {
                let next = prev + 0.3 * dir; // Slower, smoother animation
                if (next > 75) { dir = -1; next = 75; }
                if (next < 5) { dir = 1; next = 5; }
                return next;
            });
        }, 30); // Higher framerate logic update
        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div className="w-full h-full flex flex-col p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden">
             {/* Header */}
            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h2 className="text-4xl font-black text-yellow-400 flex items-center gap-3">
                        <Icons.Scissors size={32} />
                        Network Pruning
                    </h2>
                    <p className="text-gray-400 mt-2 max-w-lg">
                        Smartly eliminates unimportant weights. Notice how data (white particles) continues to flow efficiently even as connections (yellow lines) are removed.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-1">Compression Rate</div>
                    <div className="text-5xl font-mono font-black text-white">
                        {Math.round(sparsity)}%
                    </div>
                </div>
            </div>

            {/* Visualization */}
            <div ref={containerRef} className="flex-1 relative border border-white/5 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 shadow-inner overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 block" />
                
                {/* Layer Labels */}
                <div className="absolute bottom-4 left-0 w-full flex justify-between px-12 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                    <span>Input Layer</span>
                    <span>Hidden Layers</span>
                    <span>Output Layer</span>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6 z-10 bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 w-24">DENSE MODEL</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                         {/* Background track marks */}
                         <div className="absolute inset-0 flex justify-between px-2">
                             {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-white/5" />)}
                         </div>
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-75 relative"
                            style={{ width: `${100 - sparsity}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50" />
                        </div>
                    </div>
                    <span className="text-xs font-bold text-yellow-400 w-24 text-right">SPARSE MODEL</span>
                </div>
            </div>
        </div>
    );
};

// --- StrategyDistillation ---
const StrategyDistillation = ({ isActive }) => {
    // Visual: Structured Knowledge Distillation
    // Structure: Header -> Flex Viz -> Footer (Matches StrategyPruning)
    // Features: Large Node Text, Data Pulse Animation (Before Flow), Synced Flow, Teacher/GT Footer

    const containerRef = React.useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateDimensions();
        const observer = new ResizeObserver(updateDimensions);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    const { width, height } = dimensions;

    // Layout Logic (Percentages of the VIZ Container)
    const marginX = width * 0.1;
    const branchX = width * 0.25;
    const teacherX = width * 0.55; 
    const studentX = width * 0.55; 
    const lossX = width * 0.85;

    const dataY = height * 0.5;
    const teacherY = height * 0.30;
    const studentY = height * 0.65;
    const lossY = height * 0.5;

    const nodeW = 160; 
    const nodeH = 60;

    // PATH GENERATION
    const getInputPath = () => {
        if (!width) return '';
        let d = `M ${marginX} ${dataY} L ${branchX} ${dataY}`;
        d += ` M ${branchX} ${dataY} L ${branchX} ${teacherY} L ${teacherX - nodeW/2} ${teacherY}`;
        d += ` M ${branchX} ${dataY} L ${branchX} ${studentY} L ${studentX - nodeW/2} ${studentY}`;
        return d;
    };

    const getTeacherOutputPath = () => {
        if (!width) return '';
        const startX = teacherX + nodeW/2;
        const startY = teacherY;
        const endX = lossX; 
        const endY = lossY - 40;
        return `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`;
    };

    const getStudentOutputPath = () => {
        if (!width) return '';
        const startX = studentX + nodeW/2;
        const startY = studentY;
        const endX = lossX;
        const endY = lossY + 40; 
        return `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`;
    };

    const getBackwardPath = () => {
        if (!width) return '';
        const startX = lossX;
        const startY = lossY + 40; 
        const turnY = studentY + nodeH/2 + 20; 
        const endX = studentX;
        const endY = studentY + nodeH/2; 
        return `M ${startX} ${startY} L ${startX} ${turnY} L ${endX} ${turnY} L ${endX} ${endY}`;
    };

    return (
        <div className="w-full h-full flex flex-col p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden">
             
             <style>{`
                /* Animation Sequence: 6s Cycle (Snappier) */
                
                /* 0. Data Pulse (0% -> 10%) */
                @keyframes data-pulse {
                    0%, 100% { 
                        box-shadow: 0 0 20px rgba(15,23,42,0.5); 
                        border-color: rgba(51, 65, 85, 0.5); 
                        background-color: rgba(15, 23, 42, 0.6); 
                    }
                    5% { 
                        box-shadow: 0 0 30px rgba(255,255,255,0.8); 
                        border-color: #fff; 
                        background-color: rgba(255, 255, 255, 0.1); 
                    }
                    10% { 
                        box-shadow: 0 0 20px rgba(15,23,42,0.5); 
                        border-color: rgba(51, 65, 85, 0.5); 
                        background-color: rgba(15, 23, 42, 0.6); 
                    }
                }

                /* 1. Forward Flow (Starts 5% -> Ends 35%) - Fast Traversal */
                @keyframes flow-forward {
                    0%, 5% { transform: translateX(-100%); } 
                    35% { transform: translateX(100%); } 
                    100% { transform: translateX(100%); }
                }

                /* 2. Loss Computation Pulse (30% -> 40%) - Instant Reaction at Arrival (35%) */
                @keyframes loss-pulse {
                    0%, 30% { 
                        box-shadow: 0 0 20px rgba(245,158,11,0.1); 
                        border-color: rgba(245,158,11,0.3); 
                        background-color: rgba(0,0,0,0.8);
                    }
                    35% { 
                        box-shadow: 0 0 60px rgba(245,158,11,1), 0 0 100px rgba(245,158,11,0.6); 
                        border-color: #fff; 
                        background-color: rgba(180, 83, 9, 0.5);
                    }
                    40%, 100% { 
                        box-shadow: 0 0 20px rgba(245,158,11,0.1); 
                        border-color: rgba(245,158,11,0.3); 
                        background-color: rgba(0,0,0,0.8);
                    }
                }

                /* 3. Backward Flow (Starts 35% -> Ends 65%) - Immediate Return */
                @keyframes flow-backward {
                    0%, 35% { transform: translateX(100%); } 
                    65%, 100% { transform: translateX(-100%); }
                }

                /* 4. Student Update (55% -> 65%) - Flashes when back-flow hits student */
                @keyframes student-learn-flash {
                    0%, 55% { box-shadow: 0 0 30px rgba(45,212,191,0.15); border-color: rgba(45,212,191,0.3); } 
                    60% { box-shadow: 0 0 60px #2dd4bf; border-color: #fff; background-color: #5eead4; } 
                    65%, 100% { box-shadow: 0 0 30px rgba(45,212,191,0.15); border-color: rgba(45,212,191,0.3); }
                }

                /* Cycle Duration Reduced to 6s for snappier feel */
                .anim-forward-mask rect { animation: flow-forward 6s infinite linear; }
                .anim-backward-mask rect { animation: flow-backward 6s infinite linear; }
                .anim-data-node { animation: data-pulse 6s infinite linear; }
                .anim-loss-node { animation: loss-pulse 6s infinite linear; }
                .anim-student-node { animation: student-learn-flash 6s infinite linear; }
             `}</style>
             
             {/* HEADER */}
             <div className="flex justify-between items-start mb-6 z-10 pointer-events-none">
                 <div>
                     <h2 className="text-4xl font-black text-blue-400 flex items-center gap-3">
                         <Icons.Zap size={32} />
                         Distillation
                     </h2>
                     <p className="text-gray-400 mt-2 max-w-lg">
                         Transfers knowledge from a large Teacher model to a compact Student model using soft target probabilities.
                     </p>
                 </div>
             </div>

             {/* MAIN VISUALIZATION CONTAINER (Flex-1) */}
             <div ref={containerRef} className="flex-1 relative border border-white/5 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 shadow-inner overflow-hidden">
                 
                 {width > 0 && (
                     <svg className="absolute inset-0 w-full h-full">
                        <defs>
                             <linearGradient id="stream-grad-smooth" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="white" stopOpacity="0" />
                                <stop offset="20%" stopColor="white" stopOpacity="0" />
                                <stop offset="50%" stopColor="white" stopOpacity="1" />
                                <stop offset="80%" stopColor="white" stopOpacity="0" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>

                             <mask id="mask-forward" className="anim-forward-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="url(#stream-grad-smooth)" />
                             </mask>

                             <mask id="mask-backward" className="anim-backward-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="url(#stream-grad-smooth)" />
                             </mask>
                             
                             <marker id="arrow-backward" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                                 <path d="M0,0 L0,4 L4,2 z" fill="#fbbf24" />
                             </marker>
                        </defs>

                        {/* STATIC BACKGROUND */}
                        <g stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none">
                            <path d={getInputPath()} />
                            <path d={getTeacherOutputPath()} />
                            <path d={getStudentOutputPath()} />
                            <path d={getBackwardPath()} strokeDasharray="4 4" stroke="rgba(251, 191, 36, 0.2)" />
                        </g>

                        {/* ANIMATED LAYERS */}
                        <g mask="url(#mask-forward)">
                            <path d={getInputPath()} stroke="#fff" strokeWidth="3" filter="drop-shadow(0 0 5px white)" fill="none" />
                            <path d={getTeacherOutputPath()} stroke="#e879f9" strokeWidth="3" filter="drop-shadow(0 0 5px #e879f9)" fill="none" />
                            <path d={getStudentOutputPath()} stroke="#2dd4bf" strokeWidth="3" filter="drop-shadow(0 0 5px #2dd4bf)" fill="none" />
                        </g>

                        <g mask="url(#mask-backward)">
                            <path d={getBackwardPath()} stroke="#fbbf24" strokeWidth="4" fill="none" markerEnd="url(#arrow-backward)" filter="drop-shadow(0 0 8px #fbbf24)" />
                        </g>
                     </svg>
                 )}

                 {/* NODES */}
                 
                 {/* DATA Node */}
                 <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_0_20px_rgba(15,23,42,0.5)] z-10 anim-data-node" 
                      style={{ left: marginX, top: dataY, width: 80, height: 50 }}>
                     <span className="text-sm font-black text-slate-200 tracking-[0.1em] uppercase">Data</span>
                 </div>

                 {/* TEACHER Node */}
                 <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-gradient-to-b from-fuchsia-950/90 to-purple-950/90 backdrop-blur-xl border border-fuchsia-500/30 rounded-3xl shadow-[0_0_30px_rgba(192,38,211,0.15)] z-10 overflow-hidden group px-2"
                      style={{ left: teacherX, top: teacherY, width: nodeW, height: nodeH }}>
                     <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>
                     {/* Complexity Viz: High Density Layers */}
                     <div className="absolute inset-0 flex items-center justify-center gap-[3px] opacity-20 transform scale-y-75">
                         {[...Array(16)].map((_, i) => (
                             <div key={i} className="w-[3px] h-full bg-fuchsia-400 rounded-sm"></div>
                         ))}
                     </div>
                     <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent opacity-50"></div>
                     <span className="text-xl font-black text-fuchsia-100 z-10 relative tracking-wider uppercase drop-shadow-lg leading-none">Teacher</span>
                 </div>

                 {/* STUDENT Node */}
                 <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-gradient-to-b from-teal-950/90 to-emerald-950/90 backdrop-blur-xl border border-teal-500/30 rounded-3xl shadow-[0_0_30px_rgba(45,212,191,0.15)] z-10 overflow-hidden anim-student-node group px-2"
                      style={{ left: studentX, top: studentY, width: nodeW, height: nodeH }}>
                     <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>
                     {/* Complexity Viz: Low Density Layers */}
                     <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-20 transform scale-y-75">
                         {[...Array(5)].map((_, i) => (
                             <div key={i} className="w-3 h-full bg-teal-400 rounded-sm"></div>
                         ))}
                     </div>
                     <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-50"></div>
                     <span className="text-xl font-black text-teal-100 z-10 relative tracking-wider uppercase drop-shadow-lg leading-none">Student</span>
                 </div>

                 {/* LOSS Node */}
                 <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.1)] z-10 px-4 anim-loss-node"
                      style={{ left: lossX, top: lossY, minWidth: 100, height: 60 }}>
                     <div className="text-[10px] font-bold font-mono text-amber-500/70 mb-0 tracking-wider">D_KL(P||Q)</div>
                     <span className="text-lg font-black text-amber-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] leading-none">Loss</span>
                 </div>
                 
                 {/* Footer: Target Comparison */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/5 rounded-xl p-4 border border-white/5 w-3/4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-fuchsia-400 w-32">TEACHER OUTPUT</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                             {/* Gradient representing the blend of Soft Targets (Teacher) and Hard Targets (Ground Truth) */}
                            <div 
                                className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-white shadow-[0_0_10px_rgba(232,121,249,0.5)] relative"
                                style={{ width: '100%', animation: 'pulse-bar 3s infinite ease-in-out' }} 
                            />
                        </div>
                        <span className="text-xs font-bold text-white w-32 text-right">GROUND TRUTH</span>
                    </div>
                </div>

             </div>

        </div>
    );
};

// --- StrategyQuantization ---
const StrategyQuantization = ({ isActive }) => {
    // Visual: Bit Compression Steam
    // FP32 blocks -> Quantizer -> INT8 blocks
    
    const [tick, setTick] = React.useState(0);
    
    React.useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 50);
        return () => clearInterval(interval);
    }, [isActive]);

    // Use tick to create flowing particles
    // We want particles to spawn, move to center, get squeezed, move out.
    // Total animation loop approx 3s (60 ticks)
    
    const particles = React.useMemo(() => {
        const p = [];
        const cycle = 60; 
        // Generate a few particles based on current tick
        for(let i=0; i<5; i++) {
             const offset = i * (cycle / 5);
             let t = (tick + offset) % cycle;
             let progress = t / cycle; // 0 to 1
             
             // Phases:
             // 0.0 - 0.4: Approach middle (FP32 size)
             // 0.4 - 0.6: Squeeze (Transition)
             // 0.6 - 1.0: Leave middle (INT8 size)
             
             let x = 0;
             let size = 32;
             let opacity = 1;
             
             if (progress < 0.45) {
                 // x from 10% to 45%
                 x = 10 + (progress / 0.45) * 35;
                 size = 32;
                 opacity = Math.min(1, progress * 5); // Fade in
             } else if (progress < 0.55) {
                 // x stays around 50%
                 x = 50; 
                 // size shrinks
                 const t2 = (progress - 0.45) / 0.1;
                 size = 32 - t2 * 24; // 32 -> 8
                 opacity = 1;
             } else {
                 // x from 55% to 90%
                 x = 50 + ((progress - 0.55) / 0.45) * 40;
                 size = 8;
                 opacity = Math.max(0, 1 - (progress - 0.8) * 5); // Fade out
             }
             
             p.push({ id: i, x, size, opacity });
        }
        return p;
    }, [tick]);

    return (
        <div className="w-full h-full flex flex-col p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h2 className="text-4xl font-black text-green-400 flex items-center gap-3">
                        <Icons.Minimize2 size={32} />
                        Quantization Strategy
                    </h2>
                    <p className="text-gray-400 mt-2 max-w-lg">
                        Reduces numerical precision of weights and activations (e.g., from 32-bit floating point to 8-bit integers) to significantly lower memory usage and increase bandwidth.
                    </p>
                </div>
            </div>

            {/* Visualization Flow */}
            <div className="flex-1 flex flex-col justify-center relative z-10">
                {/* Labels */}
                <div className="flex justify-between w-full px-12 mb-8 uppercase text-xs font-bold tracking-widest">
                    <span className="text-blue-400">Memory Input (FP32)</span>
                    <span className="text-green-400">Efficient Storage (INT8)</span>
                </div>

                <div className="relative h-48 w-full bg-white/5 rounded-2xl border border-white/5 flex items-center overflow-hidden">
                     {/* The Funnel / Quantizer Gate */}
                     <div className="absolute left-1/2 -translate-x-1/2 w-16 h-full bg-black/20 border-x border-green-500/30 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-1">
                         <div className="text-[8px] text-green-500 uppercase font-mono mb-1">Quantize</div>
                         <Icons.Minimize2 className="text-green-400 animate-pulse" size={24} />
                         <div className="h-full w-[1px] bg-green-500/20 absolute top-0"></div>
                     </div>

                     {/* Particles */}
                     {particles.map(p => (
                         <div 
                            key={p.id}
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 flex items-center justify-center font-mono font-bold text-black"
                            style={{ 
                                left: `${p.x}%`, 
                                width: `${p.size * 2}px`, 
                                height: `${p.size * 2}px`,
                                borderRadius: p.size === 32 ? '8px' : '4px',
                                backgroundColor: p.size === 32 ? '#3b82f6' : '#4ade80', // Blue -> Green
                                opacity: p.opacity,
                                boxShadow: p.size === 32 
                                    ? '0 0 20px rgba(59,130,246,0.3)' 
                                    : '0 0 10px rgba(74,222,128,0.5)',
                                fontSize: p.size === 32 ? '10px' : '0px'
                            }}
                         >
                            {p.size === 32 ? '32b' : ''}
                         </div>
                     ))}
                </div>

                {/* Stats */}
                 <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Original Size</div>
                        <div className="text-2xl text-white font-mono">100<span className="text-sm text-gray-400">MB</span></div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 text-center relative">
                        {/* Connecting Arrow Overlay */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-gray-600">→</div>
                        <div className="text-green-500 text-[10px] uppercase font-bold tracking-wider mb-1">Quantized Size</div>
                        <div className="text-2xl text-green-400 font-mono">25<span className="text-sm text-green-600/60">MB</span></div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-purple-400 text-[10px] uppercase font-bold tracking-wider mb-1">Compression</div>
                        <div className="text-2xl text-purple-400 font-black">4x</div>
                    </div>
                 </div>

            </div>
        </div>
    );
};

// Main Component
const BackgroundStrategies = ({ isActive }) => {
    // Level: 0 = 'list', 1 = 'detail'
    const [level, setLevel] = React.useState(0);
    const [selectedId, setSelectedId] = React.useState('pruning'); 
    // Animation States
    const [displayId, setDisplayId] = React.useState('pruning'); // What is currently rendered
    const [exitId, setExitId] = React.useState(null); // What is sliding out
    const [animDirection, setAnimDirection] = React.useState(null); // 'up' or 'down' relative to movement
    const [isAnimating, setIsAnimating] = React.useState(false);
    
    const [hovered, setHovered] = React.useState(null);

    const strategies = [
        {
            id: 'pruning',
            title: 'Pruning',
            icon: Icons.Scissors,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400',
            border: 'border-yellow-400',
            desc: 'Removing redundant connections to create sparse networks.',
            // Visual is now a function to handle transitions
            renderVisual: (isSmall) => (
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                    {/* Complex Visual (Fades out when small) */}
                    <div className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-gray-900/50 ${isSmall ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                             {/* Nodes */}
                            <circle cx="30" cy="30" r="4" className="fill-white" />
                            <circle cx="30" cy="70" r="4" className="fill-white" />
                            <circle cx="70" cy="20" r="4" className="fill-white" />
                            <circle cx="70" cy="50" r="4" className="fill-white" />
                            <circle cx="70" cy="80" r="4" className="fill-white" />
                            {/* Permanent Edges */}
                            <line x1="30" y1="30" x2="70" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
                            <line x1="30" y1="70" x2="70" y2="80" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
                            <line x1="30" y1="30" x2="70" y2="50" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
                            {/* Pruning Edges (Fading) */}
                            <line x1="30" y1="70" x2="70" y2="20" stroke="#facc15" strokeWidth="1.5" className="animate-[pulse_2s_ease-in-out_infinite] opacity-50" strokeDasharray="4 2" />
                            <line x1="30" y1="30" x2="70" y2="80" stroke="#facc15" strokeWidth="1.5" className="animate-[pulse_3s_ease-in-out_infinite_1s] opacity-30" strokeDasharray="4 2" />
                            <line x1="30" y1="70" x2="70" y2="50" stroke="#facc15" strokeWidth="1.5" className="animate-[pulse_2.5s_ease-in-out_infinite_0.5s] opacity-40" strokeDasharray="4 2" />
                        </svg>
                        {/* Overlay Scissors for Complex View - Centered and sized to match simple icon */}
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="text-yellow-400/80 animate-bounce">
                                 <Icons.Scissors size={24} />
                             </div>
                         </div>
                    </div>

                    {/* Simple Icon (Fades in when small) */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${isSmall ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-150 rotate-12'}`}>
                         <Icons.Scissors className="text-yellow-400" size={24} />
                    </div>
                </div>
            )
        },
        {
            id: 'distillation',
            title: 'Distillation',
            icon: Icons.Users,
            color: 'text-purple-400',
            bg: 'bg-purple-400',
            border: 'border-purple-400',
            desc: 'Transferring knowledge from a large Teacher to a small Student.',
             renderVisual: (isSmall) => (
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                    {/* Complex Visual */}
                    <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isSmall ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                         {/* Energy Flow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl" />
                        
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                             <defs>
                                <linearGradient id="grad1" x1="100%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{stopColor:'#a855f7', stopOpacity:0.8}} />
                                    <stop offset="100%" style={{stopColor:'#ffffff', stopOpacity:0.8}} />
                                </linearGradient>
                             </defs>
                             <path d="M 72 28 Q 50 50 28 72" fill="none" stroke="url(#grad1)" strokeWidth="2" strokeDasharray="3 3" className="animate-[dash_1s_linear_infinite]" />
                        </svg>
                        
                        <div className="absolute w-[36%] h-[36%]" style={{ left: '54%', top: '10%' }}>
                            <div className="w-full h-full rounded-full border border-purple-400/60 bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center">
                                <div className="w-[25%] h-[25%] bg-purple-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                        
                        <div className="absolute w-[24%] h-[24%]" style={{ left: '16%', top: '60%' }}>
                             <div className="w-full h-full rounded-full border border-white/60 bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.3)] flex items-center justify-center">
                                <div className="w-[25%] h-[25%] bg-white rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Simple Icon - Using Icons.Users as requested "two people" metaphor */}
                     <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${isSmall ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                         <Icons.Users className="text-purple-400" size={24} />
                    </div>
                </div>
            )
        },
        {
            id: 'quantization',
            title: 'Quantization',
            icon: Icons.Minimize2,
            color: 'text-green-400',
            bg: 'bg-green-400',
            border: 'border-green-400',
            desc: 'Reducing numerical precision (e.g., FP32 → INT8) to save memory.',
            renderVisual: (isSmall) => (
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                     {/* Complex Visual */}
                    <div className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center gap-2 ${isSmall ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                         {/* Smooth Gradient Bar */}
                        <div className="w-2 h-12 rounded-full bg-gradient-to-b from-green-400 to-green-900 shadow-[0_0_10px_rgba(74,222,128,0.4)]" />
                        
                        {/* Transformation Arrow */}
                        <div className="text-gray-600">→</div>
                        
                        {/* Discrete Blocks */}
                        <div className="flex flex-col gap-1 h-12 justify-center">
                            <div className="w-2 h-3 bg-green-400 rounded-sm" />
                            <div className="w-2 h-3 bg-green-600 rounded-sm" />
                            <div className="w-2 h-3 bg-green-800 rounded-sm" />
                        </div>
                    </div>

                    {/* Simple Icon - Using Icons.Minimize2 as "two arrows" metaphor */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${isSmall ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-150 -rotate-45'}`}>
                         <Icons.Minimize2 className="text-green-400" size={24} />
                    </div>
                </div>
            )
        }
    ];

    const handleSelect = (id) => {
        if (isAnimating) return; // Block input during animation

        if (level === 1 && selectedId === id) {
             // Toggle back to list
             setLevel(0);
        } else {
            if (level === 1) {
                // Determine direction
                const order = ['pruning', 'distillation', 'quantization'];
                const prevIdx = order.indexOf(selectedId);
                const currIdx = order.indexOf(id);
                const dir = currIdx > prevIdx ? 'up' : 'down'; // 'up' means content moves UP (new comes from bottom)
                
                setAnimDirection(dir);
                setExitId(selectedId);
                setDisplayId(id);
                setSelectedId(id);
                setIsAnimating(true);
                
                // Cleanup after animation
                setTimeout(() => {
                    setExitId(null);
                    setIsAnimating(false);
                }, 600); // Match CSS duration
            } else {
                // First entry from list
                setDisplayId(id);
                setSelectedId(id);
                setLevel(1);
            }
        }
    };
    
    const renderContent = (id) => {
        switch(id) {
            case 'pruning': return <StrategyPruning isActive={isActive} />;
            case 'distillation': return <StrategyDistillation isActive={isActive} />;
            case 'quantization': return <StrategyQuantization isActive={isActive} />;
            default: return null;
        }
    };

    // Layout Calculation
    // Level 0: List = 100%, Detail = 0% (hidden)
    // Level 1: List = 25%, Detail = 75%
    const listWidth = level === 0 ? '100%' : '25%';
    const detailWidth = level === 0 ? '0%' : '75%';
    const detailOpacity = level === 0 ? 0 : 1;
    
    // For list transitions
    const getCardClasses = (s) => {
        const isSelected = selectedId === s.id && level === 1;
        
        let base = `relative overflow-hidden rounded-xl border transition-all duration-500 group flex items-center cursor-pointer `;
        
        if (level === 0) {
            // Full List Mode
            base += `p-4 gap-6 hover:bg-white/5 hover:scale-[1.02] `;
             if (hovered === s.id) base += 'border-white/30 shadow-lg ';
             else base += 'bg-transparent border-white/10 ';
        } else {
            // Sidebar Mode
            base += `p-3 gap-3 mb-4 `;
            if (isSelected) base += `bg-white/10 ${s.border.replace('border-', 'border-')}/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-105 z-10 block `;
            else base += `bg-transparent border-transparent opacity-50 hover:opacity-100 scale-95 `;
        }
        
        return base;
    };


    return (
        <div className="w-full h-[600px] relative overflow-hidden flex">
            {/* List Panel */}
            <div 
                className={`relative h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col justify-center border-r border-white/5 ${level === 0 ? 'p-8' : 'pl-2 pr-6 py-8'}`}
                style={{ width: listWidth }}
            >
                {/* Back Button Removed by User Request */}
                
                <div className={`grid grid-cols-1 gap-${level === 0 ? '6' : '3'} mt-${level === 1 ? '12' : '0'}`}>
                    {strategies.map((s) => (
                        <div 
                            key={s.id}
                            onMouseEnter={() => setHovered(s.id)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => handleSelect(s.id)}
                            className={`${getCardClasses(s)} magnetic-target`}
                            data-magnetic-strength="0.1"
                        >
                             {/* Icon Container */}
                            <div className={`
                                shrink-0 rounded-lg flex items-center justify-center
                                bg-gray-900/50 border border-white/5 transition-all duration-500 relative
                                ${level === 0 ? 'w-20 h-20' : 'w-10 h-10'}
                            `}>
                                {/* New Render Visual Logic with 'isSmall' prop */}
                                {s.renderVisual(level === 1)}
                            </div>

                            {/* Text Content */}
                            <div className={`flex-1 transition-opacity duration-300 ${level === 1 && selectedId !== s.id ? 'opacity-70' : 'opacity-100'}`}>
                                <h3 className={`${level === 0 ? 'text-lg' : 'text-sm'} font-bold mb-1 flex items-center gap-2 ${s.color} whitespace-nowrap`}>
                                    {level === 0 && <s.icon size={18} />}
                                    {s.title}
                                </h3>
                                {level === 0 && (
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {s.desc}
                                    </p>
                                )}
                            </div>
                            
                            {/* Chevron for navigation */}
                            {level === 0 && (
                                <Icons.ChevronRight className="text-gray-600 group-hover:text-white transition-colors" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            <div 
                className="relative h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-black/20 overflow-hidden"
                style={{ 
                    width: detailWidth,
                    opacity: detailOpacity,
                    transform: `translateX(${level === 1 ? '0' : '50px'})`
                }}
            >
                 {level === 1 && (
                     <>
                        {/* Exiting Component */}
                        {exitId && (
                            <div 
                                className="absolute inset-0 w-full h-full p-4 z-10"
                                style={{ 
                                    animation: `slideOut-${animDirection} 0.6s cubic-bezier(0.23,1,0.32,1) forwards`
                                }}
                            >
                                {renderContent(exitId)}
                            </div>
                        )}

                        {/* Entering Component (or Static) */}
                        <div 
                            key={displayId}
                            className={`w-full h-full p-4 relative z-20 ${exitId ? '' : ''}`} // If animating, this applies entrance anim
                            style={{
                                animation: exitId 
                                    ? `slideIn-${animDirection} 0.6s cubic-bezier(0.23,1,0.32,1) forwards`
                                    : 'none'
                             }}
                        >
                            {renderContent(displayId)}
                        </div>
                     </>
                 )}
                 
                 <style>{`
                    @keyframes slideIn-up {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    @keyframes slideOut-up {
                        from { transform: translateY(0); filter: brightness(1); }
                        to { transform: translateY(-100%); filter: brightness(0.5); }
                    }
                    @keyframes slideIn-down {
                        from { transform: translateY(-100%); }
                        to { transform: translateY(0); }
                    }
                    @keyframes slideOut-down {
                        from { transform: translateY(0); filter: brightness(1); }
                        to { transform: translateY(100%); filter: brightness(0.5); }
                    }
                 `}</style>
            </div>
        </div>
    );
};
