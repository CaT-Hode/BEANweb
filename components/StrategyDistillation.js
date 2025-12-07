
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
    const teacherY = height * 0.25;
    const studentY = height * 0.75;
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
             </div>

             {/* Footer: Target Comparison */}
             <div className="mt-6 z-10 bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-fuchsia-400 w-32">TEACHER OUTPUT</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                         {/* Gradient representing the blend of Soft Targets (Teacher) and Hard Targets (Ground Truth) */}
                        <div 
                            className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-white shadow-[0_0_10px_rgba(232,121,249,0.5)] relative"
                            style={{ width: '100%', animation: 'pulse-bar 3s infinite ease-in-out' }} 
                        />
                         <style>{`
                            @keyframes pulse-bar {
                                0%, 100% { opacity: 0.6; }
                                50% { opacity: 1; }
                            }
                         `}</style>
                    </div>
                    <span className="text-xs font-bold text-white w-32 text-right">GROUND TRUTH</span>
                </div>
            </div>

        </div>
    );
};
