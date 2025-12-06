
const BackgroundQuantization = ({ isActive }) => {
    const [step, setStep] = React.useState(0);
    
    // Detailed format specifications
    const formats = [
        { name: "FP32", bits: 32, s: 1, e: 8, m: 23, desc: "Single Precision", bandwidth: "1x" },
        { name: "TF32", bits: 19, s: 1, e: 8, m: 10, desc: "Tensor Float (NVIDIA)", bandwidth: "~1.7x" },
        { name: "FP16", bits: 16, s: 1, e: 5, m: 10, desc: "Half Precision", bandwidth: "2x" },
        { name: "BF16", bits: 16, s: 1, e: 8, m: 7, desc: "Brain Float (Google)", bandwidth: "2x" },
        { name: "FP8",  bits: 8,  s: 1, e: 4, m: 3, desc: "E4M3 / E5M2", bandwidth: "4x" },
        { name: "INT8", bits: 8,  s: 0, e: 0, m: 8, desc: "Integer Quantization", bandwidth: "4x" },
        { name: "INT4", bits: 4,  s: 0, e: 0, m: 4, desc: "4-bit Integer", bandwidth: "8x" },
        { name: "INT2", bits: 2,  s: 0, e: 0, m: 2, desc: "2-bit Integer", bandwidth: "16x" },
        { name: "Trinary", bits: 1.58, s: 0, e: 0, m: 2, desc: "1.58-bit {-1, 0, 1}", bandwidth: "~20x" },
        { name: "Binary", bits: 1, s: 0, e: 0, m: 1, desc: "1-bit (XNOR)", bandwidth: "32x" },
    ];

    React.useEffect(() => {
        if (!isActive) return;
        // Auto-switch every 8 seconds
        // Using setTimeout with [step] dependency ensures it resets whenever step changes (auto or manual)
        const timer = setTimeout(() => {
            setStep(s => (s + 1) % formats.length);
        }, 8000); 
        return () => clearTimeout(timer);
    }, [isActive, step]);

    const current = formats[step];



    // 1. Generate Static 64x64 Random Matrix (Normal Distribution)
    // Run once on mount
    const matrixData = React.useMemo(() => {
        const size = 64;
        const data = [];
        for (let i = 0; i < size * size; i++) {
            // Box-Muller transform for normal distribution
            let u = 0, v = 0;
            while(u === 0) u = Math.random();
            while(v === 0) v = Math.random();
            let value = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            
            data.push(value);
        }
        return data;
    }, []);

    // 3. Process Matrix & Calculate L2 Loss with Realistic Asymmetric Quantization (Robust)
    const { quantizedMatrix, l2Loss, scaleFactor, zeroPoint } = React.useMemo(() => {
        let totalSquaredError = 0;
        const qData = [];
        
        // A. Calculate Statistics for Scaling (Percentile-based for robustness)
        // Sort data to find robust min/max (Clipping outliers)
        // Copy array to avoid mutating original source if it were state (it's memoized new array here so safe-ish, but slice is safer)
        const sortedData = [...matrixData].sort((a, b) => a - b);
        const N = sortedData.length;
        
        // Use 1% and 99% percentiles to ignore outliers
        // This dramatically improves INT2/INT4 performance on Normal distributions
        const pMin = sortedData[Math.floor(N * 0.01)]; // 1st percentile
        const pMax = sortedData[Math.floor(N * 0.99)]; // 99th percentile
        
        // Calculate Mean Abs for Binary
        let meanAbs = 0;
        matrixData.forEach(val => meanAbs += Math.abs(val));
        meanAbs /= N;

        // B. Determine Parameters (Asymmetric Quantization)
        let s = 1;
        let z = 0;
        let qType = 'float';
        let minBound = -Infinity;
        let maxBound = Infinity;

        if (current.name.includes("INT")) {
            qType = 'int';
            const n = current.bits;
            // Intervals = 2^n - 1
            const qLevels = Math.pow(2, n) - 1; 
            
            // Use Robust Range
            let lower = pMin;
            let upper = pMax;
            
            // Ensure range isn't zero
            if (upper <= lower) {
                upper = lower + 1e-5;
            }

            s = (upper - lower) / qLevels;
            z = Math.round(-lower / s);
            
            const maxInt = Math.pow(2, n) - 1;
            z = Math.max(0, Math.min(maxInt, z)); 
            
        } else if (current.name === "Binary") {
            qType = 'binary';
            s = meanAbs;
        } else if (current.name === "Trinary") {
            qType = 'trinary';
            // BitNet b1.58 scaling: Average Absolute Value
            s = meanAbs;
        }

        // C. Quantize Loop
        matrixData.forEach(val => {
            let qVal = val;
            
            if (qType === 'int') {
                const n = current.bits;
                const maxInt = Math.pow(2, n) - 1;
                
                // Quantize
                let x_q = Math.round(val / s + z);
                
                // Clamp to [0, 2^n - 1]
                x_q = Math.max(0, Math.min(maxInt, x_q));
                
                // Dequantize
                qVal = s * (x_q - z);

            } else if (qType === 'binary') {
                const bin = val >= 0 ? 1 : -1;
                qVal = bin * s;

            } else if (qType === 'trinary') {
                // BitNet b1.58 Logic:
                // Scale by s (mean abs), then round to {-1, 0, 1}
                // Actually: x_quant = round(clamp(x / s, -1, 1))
                // Then dequantize: x_approx = x_quant * s
                
                let x_scaled = val / s;
                let x_rounded = Math.round(x_scaled);
                // Clamp to {-1, 0, 1}
                x_rounded = Math.max(-1, Math.min(1, x_rounded));
                
                qVal = x_rounded * s;

            } else {
                const scale = Math.pow(2, current.m);
                qVal = Math.round(val * scale) / scale;
            }

            const diff = val - qVal;
            totalSquaredError += diff * diff;
            qData.push(qVal);
        });

        const l2 = Math.sqrt(totalSquaredError);
        
        return { quantizedMatrix: qData, l2Loss: l2, scaleFactor: s, zeroPoint: z };
    }, [matrixData, current]);

    // Color mapper for grayscale heatmap
    const getColor = (val) => {
        // Map value to grayscale. Assuming range approx [-3, 3]
        // -3 -> Black (0), 3 -> White (255)
        // Or closer to standard "images": 0..1 -> 0..255?
        // Since it's a normal distribution [-3, 3], let's map roughly to 0-1 range.
        
        let norm = (val + 3) / 6;
        norm = Math.max(0, Math.min(1, norm));
        
        // Convert to percentage for lightness
        const lightness = Math.floor(norm * 100);
        return `hsl(0, 0%, ${lightness}%)`;
    };

    // Helper to render bits
    const renderBits = (fmt) => {
        const blocks = [];
        
        if (fmt.s > 0) {
            blocks.push({ 
                type: 'sign', 
                width: (fmt.s / 32) * 100, 
                color: 'bg-red-500', 
                textColor: 'text-red-400',
                glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
                label: 'S' 
            });
        }
        if (fmt.e > 0) {
            blocks.push({ 
                type: 'exp', 
                width: (fmt.e / 32) * 100, 
                color: 'bg-green-500', 
                textColor: 'text-green-400',
                glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]',
                label: 'Exponent' 
            });
        }
        if (fmt.m > 0) {
            const isInt = fmt.e === 0;
            const color = isInt ? 'bg-white' : 'bg-blue-500';
            const textColor = isInt ? 'text-white' : 'text-blue-400';
            const glow = isInt ? 'shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'shadow-[0_0_15px_rgba(59,130,246,0.4)]';
            const label = isInt ? 'Integer' : 'Mantissa';
            
            blocks.push({ 
                type: 'mantissa', 
                width: (fmt.m / 32) * 100, 
                color: color, 
                textColor: textColor,
                glow: glow,
                label: label 
            });
        }

        const usedBits = fmt.s + fmt.e + fmt.m;
        const emptyBits = 32 - usedBits;
        if (emptyBits > 0) {
            blocks.push({ 
                type: 'empty', 
                width: (emptyBits / 32) * 100, 
                color: 'bg-gray-800/30', 
                textColor: 'text-gray-600',
                glow: '',
                label: 'Unused' 
            });
        }

        return blocks;
    };

    const bitBlocks = renderBits(current);

    const mainRef = React.useRef(null);
    
    // Split State for Smooth Motion + Throttled Data
    // Physics-based tooltip movement
    const [renderPos, setRenderPos] = React.useState(null);
    const targetPos = React.useRef(null);
    const currentPos = React.useRef(null);
    const velocity = React.useRef({ x: 0, y: 0 });
    const rafId = React.useRef(null);

    // RESTORED: Tooltip Content State and Throttle Refs
    const [tooltipContent, setTooltipContent] = React.useState(null);
    const lastContentUpdate = React.useRef(0);
    const contentUpdateTimer = React.useRef(null);

    // Spring constants
    const STIFFNESS = 0.2;
    const DAMPING = 0.6;

    // Animation Loop
    const animate = React.useCallback(() => {
        if (!targetPos.current) {
            rafId.current = null;
            return;
        }

        if (!currentPos.current) {
            currentPos.current = { ...targetPos.current };
            setRenderPos({ ...currentPos.current });
        }

        const target = targetPos.current;
        const current = currentPos.current;
        const vel = velocity.current;

        // Spring Force: F = -k * (x - target)
        const fx = (target.x - current.x) * STIFFNESS;
        const fy = (target.y - current.y) * STIFFNESS;

        // Apply force to velocity with damping
        vel.x = (vel.x + fx) * DAMPING;
        vel.y = (vel.y + fy) * DAMPING;

        // Update position
        current.x += vel.x;
        current.y += vel.y;

        // Stop if close enough
        if (Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1 && Math.abs(vel.x) < 0.1 && Math.abs(vel.y) < 0.1) {
            current.x = target.x;
            current.y = target.y;
            setRenderPos({ ...current });
            // Don't stop loop if we are still hovering, just clamp. 
            // Actually, we can keep running or stop. Let's keep running if target exists.
        } else {
             setRenderPos({ ...current });
        }
        
        rafId.current = requestAnimationFrame(animate);
    }, []);

    const handleCellHover = React.useCallback((pos, content) => {
        // 1. Update Target Position for Physics Loop
        targetPos.current = pos;
        if (!rafId.current) {
            // Start loop if not running
            rafId.current = requestAnimationFrame(animate);
        }

        // 2. Throttle Content Update (0.2s interval)
        const now = Date.now();
        if (now - lastContentUpdate.current > 200) {
            setTooltipContent(content);
            lastContentUpdate.current = now;
            if (contentUpdateTimer.current) clearTimeout(contentUpdateTimer.current);
        } else {
            if (contentUpdateTimer.current) clearTimeout(contentUpdateTimer.current);
            contentUpdateTimer.current = setTimeout(() => {
                setTooltipContent(content);
                lastContentUpdate.current = Date.now();
            }, 200);
        }
    }, [animate]);

    const handleMouseLeave = React.useCallback(() => {
        targetPos.current = null;
        setRenderPos(null);
        setTooltipContent(null);
        if (contentUpdateTimer.current) clearTimeout(contentUpdateTimer.current);
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
        // Reset physics
        currentPos.current = null;
        velocity.current = { x: 0, y: 0 };
    }, []);
    return (
        <div ref={mainRef} className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden rounded-3xl border border-white/10">
            
            {/* Header */}
            {/* Header: Format Name & Bandwidth */}
            <div className="flex justify-between items-end mb-2 z-10 min-h-[80px]">
                <div>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter leading-none transition-all duration-300">
                        {current.name}
                    </div>
                    <div className="text-lg text-green-400 font-mono mt-1 font-bold tracking-wide">
                        {current.desc}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Bandwidth Gain</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                        {current.bandwidth}
                    </div>
                </div>
            </div>

            {/* Main Visualization Area */}
            <div className="flex-1 flex flex-col justify-start gap-4 z-10">

                {/* The Bit Bar - Redesigned */}
                <div className="w-full flex items-end gap-1 h-32 relative mt-4"> 
                    {/* H-32 allocates space for the labels above + the bar which will be shorter */}
                    {bitBlocks.map((block, idx) => (
                        <div 
                            key={idx}
                            className={`flex flex-col justify-end transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative`}
                            style={{ width: `${block.width}%` }}
                        >
                            {/* Label Above */}
                            {block.type !== 'empty' && (
                                <div className={`mb-3 flex flex-col items-start min-w-max transition-opacity duration-300`}> 
                                    {/* Using min-w-max and absolute positioning if needed for small blocks, but flex usually handles it. 
                                        If block is too small, we might hide label or adjust. 
                                        For now, overflow hidden might clip. */}
                                    <div className={`${block.type === 'sign' ? 'text-3xl translate-x translate-y' : 'text-sm'} font-black uppercase tracking-widest ${block.textColor} drop-shadow-md`}>
                                        {block.label}
                                    </div>
                                    {block.type !== 'sign' && (
                                        <div className={`text-2xl font-mono font-bold ${block.textColor} opacity-80 leading-none`}>
                                            {Math.round((block.width / 100) * 32)} <span className="text-xs font-sans font-medium opacity-60">bits</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* The Bar Itself */}
                            <div className={`w-full ${block.color} ${block.glow} h-12 rounded-lg relative overflow-hidden transition-all duration-300 border border-white/10`}>
                                {/* Texture Pattern */}
                                {block.type !== 'empty' && (
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-30"></div>
                                )}
                                {/* Inner Shine */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quantization Simulation Data */}

                {/* Matrix Visualization & Stats */}
                <div className="flex gap-8 w-full items-stretch h-[280px]">
                    
                    {/* Matrix Visual - Square Container */}
                    <div 
                        className="aspect-square h-full bg-black/50 border border-white/10 rounded-2xl p-2 overflow-hidden group shadow-2xl shadow-black/50 relative"
                        onMouseLeave={handleMouseLeave}
                    >
                         {/* 64x64 CSS Grid */}
                         <div className="w-full h-full grid grid-cols-[repeat(64,minmax(0,1fr))] grid-rows-[repeat(64,minmax(0,1fr))] gap-[1px]">
                            {quantizedMatrix.map((val, idx) => (
                                <div 
                                    key={idx}
                                    className="w-full h-full rounded-[0.5px]" 
                                    style={{ backgroundColor: getColor(val) }}
                                    onMouseEnter={(e) => {
                                        // Calculate position relative to the MAIN COMPONENT container to avoid clipping by inner divs
                                        if (mainRef.current) {
                                            const mainRect = mainRef.current.getBoundingClientRect();
                                            const cellRect = e.currentTarget.getBoundingClientRect();
                                            
                                            handleCellHover(
                                                {
                                                    x: cellRect.right - mainRect.left,
                                                    y: cellRect.top - mainRect.top
                                                },
                                                {
                                                    idx,
                                                    val: matrixData[idx],
                                                    qVal: val
                                                }
                                            );
                                        }
                                    }}
                                />
                            ))}
                         </div>
                        
                    </div>

                    {/* L2 Loss Stats Panel */}
                    <div className="flex-1 flex flex-col gap-4 justify-center">
                         <div className="bg-white/5 rounded-2xl p-6 border border-red-500/20 backdrop-blur-md shadow-xl flex flex-col items-center flex-1 justify-center">
                             <div className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-2">Total L2 Loss</div>
                             <div className="font-mono text-3xl font-black text-red-400 tracking-tighter">
                                {l2Loss.toFixed(4)}
                             </div>
                             <div className="w-full h-1 bg-gray-800 mt-3 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-red-500 transition-all duration-300"
                                    style={{ width: `${Math.min(100, (l2Loss / 39) * 100)}%` }} 
                                />
                             </div>
                             <div className="text-[10px] text-gray-500 mt-2 text-center w-full">
                                Euclidean Distance
                             </div>
                         </div>
                         
                         <div className="flex flex-col gap-2">
                             <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                 <span>Params</span>
                                 <span>4096</span>
                             </div>
                             <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                 <span>Distribution</span>
                                 <span>Normal</span>
                             </div>
                             {(current.name.includes("INT") || current.name === "Binary" || current.name === "Trinary") && (
                                 <div className="flex flex-col gap-1 border-t border-gray-800 pt-2 mt-1">
                                     <div className="flex justify-between text-[10px] text-blue-400 uppercase tracking-wider font-bold">
                                         <span>Scale</span>
                                         <span className="font-mono">{scaleFactor.toFixed(4)}</span>
                                     </div>
                                     {current.name.includes("INT") && (
                                         <div className="flex justify-between text-[10px] text-purple-400 uppercase tracking-wider font-bold">
                                             <span>Zero Pt</span>
                                             <span className="font-mono">{zeroPoint}</span>
                                         </div>
                                     )}
                                 </div>
                             )}
                         </div>
                    </div>
                </div>

                {/* Timeline / Selector */}
                <div className="flex items-center px-4 mt-4 w-full relative z-10">
                    {/* Define Keyframes locally/inline if needed, or rely on global/previous def. Since we removed the bottom one, we need to add the style back here or globally. */}
                    <style>{`
                        @keyframes fillUp {
                            from { height: 0%; }
                            to { height: 100%; }
                        }
                        @keyframes deplete {
                            from { height: 100%; }
                            to { height: 0%; }
                        }
                    `}</style>
                    {formats.map((f, i) => (
                        <React.Fragment key={f.name}>
                            <div 
                                onClick={() => setStep(i)}
                                className={`cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 group z-10 flex-none magnetic-target ${i === step ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-100 scale-90'}`}
                                data-magnetic-strength="0.2"
                            >
                                <div className={`w-2 h-8 rounded-full relative overflow-hidden bg-gray-700`}>
                                    {/* Static base for inactive or background */}
                                    
                                    {/* Active Progress Overlay */}
                                    {i === step && (
                                        <div 
                                            className="absolute bottom-0 left-0 w-full bg-green-400 shadow-[0_0_10px_#4ade80]"
                                            style={{ 
                                                // Animation Sequence:
                                                // 1. Fill Up (0.5s) - Entrance
                                                // 2. Deplete (7.5s) - Timer (starts after 0.5s)
                                                // Total roughly 8s.
                                                animation: isActive 
                                                    ? 'fillUp 0.5s ease-out forwards, deplete 7.5s linear 0.5s forwards' 
                                                    : 'fillUp 0.5s ease-out forwards' // If paused/static, just fill and stay? Adjust if needed. 
                                            }}
                                        />
                                    )}
                                </div>
                                <span className={`text-[10px] font-mono font-bold ${i === step ? 'text-white' : 'text-gray-500'}`}>{f.name}</span>
                            </div>

                            {/* Connector (Static) */}
                            {i < formats.length - 1 && (
                                <div className="flex-1 h-[2px] bg-gray-800 mx-1 rounded-full self-center mb-4" />
                            )}
                        </React.Fragment>
                    ))}
                </div>

            </div>

            {/* Hover Tooltip - Moved to Root to avoid clipping and enable smooth movement */}
            {renderPos && tooltipContent && (
                <div 
                    className="absolute z-50 pointer-events-none"
                    style={{ 
                        left: renderPos.x, 
                        top: renderPos.y,
                        transform: 'translate(10px, -10px)' // Offset to top-right
                    }}
                >
                    <div 
                        className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 min-w-[200px]"
                        style={{ 
                            backgroundColor: 'rgba(10, 10, 15, 0.3)', // Darker background
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        }}
                    >
                        <div className="relative p-4 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)] flex flex-col gap-2">
                            <div className="mb-1">
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-gray-400 drop-shadow-md font-sans">
                                    Matrix Value <span className="text-gray-600 font-mono ml-1">#{tooltipContent.idx}</span>
                                </h4>
                            </div>
                            
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <span className="text-gray-400 text-xs font-light">Original</span>
                                <span className="font-mono text-white font-bold">{tooltipContent.val.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-green-400 text-xs font-light">Quantized</span>
                                <span className="font-mono text-green-300 font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">{tooltipContent.qVal.toFixed(6)}</span>
                            </div>
                            
                            {(current.name.includes("INT") || current.name === "Binary" || current.name === "Trinary") && (
                                <div className="flex justify-between items-end border-t border-white/10 pt-2 mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-blue-400 text-[8px] uppercase tracking-wider font-bold">Scale</span>
                                        <span className="font-mono text-blue-300 text-xs">{scaleFactor.toFixed(4)}</span>
                                    </div>
                                    {current.name.includes("INT") && (
                                        <div className="flex flex-col text-right">
                                            <span className="text-purple-400 text-[8px] uppercase tracking-wider font-bold">Zero Pt</span>
                                            <span className="font-mono text-purple-300 text-xs">{zeroPoint}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.05)_0%,transparent_70%)] pointer-events-none" />
        </div>
    );
};
