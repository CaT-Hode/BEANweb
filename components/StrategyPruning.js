
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
