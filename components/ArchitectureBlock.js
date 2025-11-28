const ArchitectureBlock = ({ isCompressed, selection, onSelectProcessor, onHover }) => {
    const containerRef = React.useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
    const [isMounted, setIsMounted] = React.useState(false);
    const [isExpansionHovered, setIsExpansionHovered] = React.useState(false);

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: Math.max(containerRef.current.offsetHeight, 500)
                });
            }
        };

        updateDimensions();
        const observer = new ResizeObserver(updateDimensions);
        if (containerRef.current) observer.observe(containerRef.current);

        // Set mounted after a brief delay to allow initial render without transitions
        const timer = setTimeout(() => setIsMounted(true), 100);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, []);

    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = (p) => p * height;

    // Vertical Positions (%) - Rescaled to fill container
    // Vertical Positions (%) - Rescaled to fill container
    const pos = {
        input: 0.15,
        attSplit: 0.19,
        attProc: 0.25,
        attMul: 0.32,
        attBn: 0.38,
        attAdd: 0.44,
        divider: 0.48,
        ffnInput: 0.50,
        avgPool: 0.52,
        ffnSplit: 0.59,
        ffnProc: 0.66,
        ffnBn: 0.75,
        ffnAdd: 0.84,
        concat: 0.87,
        output: 0.94
    };

    const strokeColor = "#4b5563"; // gray-600
    const dashedColor = "#6b7280"; // gray-500
    const strokeWidth = 2;
    
    const handleMouseEnter = (e, title, content, colorClass = 'text-white', forceRight = false, yOffset = 0) => {
        if (!containerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate position relative to the container
        // Position to the right of the element by default
        let x = rect.right - containerRect.left + 15;
        let y = rect.top - containerRect.top + (rect.height / 2) + yOffset;
        
        // Adjust if too close to right edge, unless forced to right
        if (!forceRight && (x + 200 > containerRect.width)) {
            x = rect.left - containerRect.left - 215;
        }

        if (onHover) {
            onHover({ x, y, title, content, colorClass });
        }
    };

    const handleMouseLeave = () => {
        if (onHover) {
            onHover(null);
        }
    };

    const handleSelect = (proc) => {
        onSelectProcessor(proc);
    };

    // Node Dimensions
    const procW = 140;
    const procH = 64;
    const bnW = 110;
    const bnH = 38;
    const poolH = 48;
    const concatW = 120;
    const concatH = 48;

    // Branch Offsets
    const branchOffset = 90; 

    // Compressed View Positioning (Center)
    // Layout Stack (Top to Bottom):
    // Input Text (14)
    // Gap (4)
    // Line (16)
    // Gap (4)
    // Zap Icon (48)
    // Gap (4)
    // Line (16)
    // Gap (4)
    // Pool Text (14)
    // Gap (4)
    // Line (16)
    // Gap (4)
    // FFN Icon (48)
    // Gap (4)
    // Line (16)
    // Gap (4)
    // Out Text (14)
    
    // Total Stack Height Calculation:
    // 14 + 4 + 16 + 4 + 48 + 4 + 16 + 4 + 14 + 4 + 16 + 4 + 48 + 4 + 16 + 4 + 14 = 234px
    const stackHeight = 234;
    const compX = width / 2; // Center X

    // We want to center this stack vertically.
    // Center Y = height / 2
    // Top of Stack = (height / 2) - (stackHeight / 2)
    const stackTop = (height / 2) - (stackHeight / 2);

    // Attention Box Target (Zap Icon is 2nd element)
    // Top to Zap Center = 14 + 4 + 16 + 4 + 24 = 62
    const attBoxTargetCenterY = stackTop + 62;

    // FFN Box Target (FFN Icon is further down)
    // Top to FFN Center = 62 + 24 + 4 + 16 + 4 + 14 + 4 + 16 + 4 + 24 = 172
    const ffnBoxTargetCenterY = stackTop + 172;

    // --- Coordinate Calculations (Center-Anchored) ---
    // We use Center Y positioning + translateY(-50%) to achieve "shrink to center" animation.
    
    // Expanded State Centers

    const attTopExp = cy(pos.attSplit) - 20;
    const attHeightExp = cy(pos.attAdd) - cy(pos.attSplit) + 45;
    const attCenterExp = attTopExp + attHeightExp / 2;

    const ffnTopExp = cy(pos.ffnSplit) - 20;
    const ffnHeightExp = cy(pos.concat) - cy(pos.ffnSplit) + 50;
    const ffnCenterExp = ffnTopExp + ffnHeightExp / 2;


    // Transition Logic
    const noTransition = 'none';
    
    // Expand: Move and Expand Simultaneously (0-1000ms) - Smoother ease-in-out
    const expandTransition = 'top 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, left 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, width 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, height 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity 600ms linear, border-color 600ms linear, background-color 600ms linear';
    
    // Compress: Shrink and Move Simultaneously (0-1000ms)
    const compressTransition = 'opacity 600ms linear, width 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, height 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, left 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, top 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 600ms linear, background-color 600ms linear';

    const currentTransition = !isMounted && !isCompressed ? noTransition : (isCompressed ? compressTransition : expandTransition);

    return (
        <div className="w-full h-full flex flex-col bg-transparent relative overflow-hidden">
            <style>{`
                @keyframes flash-input {
                    0% { opacity: 0; }
                    15%, 25% { opacity: 1; filter: drop-shadow(0 0 10px #38bdf8) drop-shadow(0 0 20px #38bdf8); }
                    35%, 100% { opacity: 0; }
                }
                @keyframes flash-output {
                    0%, 70% { opacity: 0; }
                    80% { opacity: 1; filter: drop-shadow(0 0 10px #c084fc) drop-shadow(0 0 20px #c084fc); }
                    90%, 100% { opacity: 0; }
                }
            `}</style>
            {/* Header - Moved to Background */}
            <div className={`absolute top-6 left-6 z-0 pointer-events-none transition-opacity duration-300 ${isCompressed ? 'opacity-0' : 'opacity-100'}`}>
                <div>
                    <div className="text-[10px] text-sky-400 font-medium tracking-[0.3em] mb-2 uppercase opacity-80">Core Processing</div>
                    <h3 className="text-3xl font-thin text-white tracking-[0.2em]">BEAN BLOCK</h3>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
            
            {/* --- ANIMATED BACKGROUND BOXES (Shared) --- */}
            {/* Attention Box */}
            <div 
                onClick={() => isCompressed && handleSelect('efficient')}
                className={`absolute z-10 
                    ${isCompressed 
                        ? `rounded-xl border-2 cursor-pointer magnetic-target ${selection.processor === 'efficient' ? 'border-sky-500 bg-sky-900/20 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-sky-500/30 bg-sky-900/10'}`
                        : 'rounded-3xl border-2 border-dashed border-sky-500/30 bg-sky-900/5 shadow-[0_0_30px_rgba(14,165,233,0.15)] pointer-events-none'
                    }
                `}
                style={{ 
                    left: isCompressed ? (compX - 24) : 8,
                    width: isCompressed ? 48 : (width - 16),
                    top: isCompressed ? attBoxTargetCenterY : attCenterExp, 
                    height: isCompressed ? 48 : attHeightExp,
                    transform: 'translateY(-50%)',
                    opacity: 1,
                    transition: currentTransition
                }}
                onMouseEnter={(e) => isCompressed && handleMouseEnter(e, 'Attention Stage', 'Focuses on spatial and channel-wise dependencies using Efficient Processor.', 'text-sky-400', true)}
                onMouseLeave={handleMouseLeave}
            >
                {/* Expanded Label */}
                <div 
                    className={`absolute top-1/2 -translate-y-1/2 right-4 z-10 transition-opacity duration-500 ${isCompressed ? 'opacity-0 delay-0' : 'opacity-100 delay-[400ms]'}`}
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    <span className="text-sky-500 font-black text-xl tracking-widest uppercase drop-shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-pulse whitespace-nowrap">Attention</span>
                </div>

                {/* Compressed Icon */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCompressed ? 'opacity-100 delay-100' : 'opacity-0 delay-0'}`}>
                    <Icons.Zap size={20} className="text-sky-400" />
                </div>
            </div>

            {/* FFN Box */}
            <div 
                onClick={() => isCompressed && handleSelect('performance')}
                className={`absolute z-10 
                    ${isCompressed 
                        ? `rounded-xl border-2 cursor-pointer magnetic-target ${selection.processor === 'performance' ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-purple-500/30 bg-purple-900/10'}`
                        : 'rounded-3xl border-2 border-dashed border-purple-500/30 bg-purple-900/5 shadow-[0_0_30px_rgba(168,85,247,0.15)] pointer-events-none'
                    }
                `}
                style={{ 
                    left: isCompressed ? (compX - 24) : 8,
                    width: isCompressed ? 48 : (width - 16),
                    top: isCompressed ? ffnBoxTargetCenterY : ffnCenterExp, 
                    height: isCompressed ? 48 : ffnHeightExp,
                    transform: 'translateY(-50%)',
                    opacity: 1,
                    transition: currentTransition
                }}
                onMouseEnter={(e) => isCompressed && handleMouseEnter(e, 'FFN Stage', 'Feed-Forward Network stage using Performance Processor for feature transformation.', 'text-purple-400', true)}
                onMouseLeave={handleMouseLeave}
            >
                {/* Expanded Label */}
                <div 
                    className={`absolute top-1/2 -translate-y-1/2 right-4 z-10 transition-opacity duration-500 ${isCompressed ? 'opacity-0 delay-0' : 'opacity-100 delay-[400ms]'}`}
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    <span className="text-purple-500 font-black text-xl tracking-widest uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse whitespace-nowrap">FFN</span>
                </div>

                {/* Compressed Icon */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCompressed ? 'opacity-100 delay-100' : 'opacity-0 delay-0'}`}>
                    <Icons.Cpu size={20} className="text-purple-400" />
                </div>
            </div>


            {/* Compressed View (Vertical Summary) - Center */}
            <div 
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-300 ease-out z-30 bg-transparent pointer-events-none
                    ${isCompressed ? 'opacity-100 delay-[1000ms]' : 'opacity-0 delay-0'}
                `}
            >
                {/* Block Label at Left Center */}
                <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 tracking-widest -rotate-90 whitespace-nowrap uppercase">BLOCK</div>

                <div className="flex flex-col items-center gap-1 pointer-events-none">
                    
                    {/* Input Text */}
                    <div className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Input</div>
                    <div className="w-px h-4 bg-gray-700"></div>

                    {/* Enhancement Icon Placeholder */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center opacity-0 pointer-events-none">
                        <Icons.Zap size={20} />
                    </div>

                    <div className="w-px h-4 bg-gray-700"></div>
                    <div className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Pool</div>
                    <div className="w-px h-4 bg-gray-700"></div>

                    {/* FFN Icon Placeholder */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center opacity-0 pointer-events-none">
                        <Icons.Cpu size={20} />
                    </div>

                    <div className="w-px h-4 bg-gray-700"></div>
                    <div className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Out</div>
                </div>
            </div>

            {/* Expanded View (Diagram) */}
            <div 
                ref={containerRef}
                className={`absolute inset-0 w-full h-full overflow-y-auto no-scrollbar`}
            >
                {width > 0 && (
                <div className="relative w-full" style={{ height: height }}>
                    
                    {/* --- Content Wrapper for Fade Effect --- */}
                    <div className={`transition-opacity duration-300 ease-in-out ${!isCompressed ? 'opacity-100 delay-[400ms]' : 'opacity-0 delay-0 pointer-events-none'}`}>
                        {/* --- SVG Connections --- */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            <defs>
                                {/* Markers Removed for Clean Pass-Through Look, except for Output */}
                                <marker id="arrow-block" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,3 L3,1.5 z" fill={strokeColor} />
                                </marker>
                            </defs>

                            {/* --- ATTENTION SECTION --- */}
                            <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.attSplit)} stroke={strokeColor} strokeWidth={strokeWidth} />
                            
                            {/* Split to Efficient (Left) */}
                            <path d={`M ${cx} ${cy(pos.attSplit)} L ${cx-branchOffset} ${cy(pos.attSplit)} L ${cx-branchOffset} ${cy(pos.attProc)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                            
                            {/* Split to DPReLU (Right) */}
                            <path d={`M ${cx} ${cy(pos.attSplit)} L ${cx+branchOffset} ${cy(pos.attSplit)} L ${cx+branchOffset} ${cy(pos.attProc)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* Efficient to Multiply */}
                            <path d={`M ${cx-branchOffset} ${cy(pos.attProc)} L ${cx-branchOffset} ${cy(pos.attMul)} L ${cx} ${cy(pos.attMul)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* DPReLU to Multiply */}
                            <path d={`M ${cx+branchOffset} ${cy(pos.attProc)} L ${cx+branchOffset} ${cy(pos.attMul)} L ${cx} ${cy(pos.attMul)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* DPReLU to Add (Residual) */}
                            <path d={`M ${cx+branchOffset} ${cy(pos.attProc)} L ${cx+branchOffset} ${cy(pos.attAdd)} L ${cx} ${cy(pos.attAdd)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* Multiply to BN */}
                            <line x1={cx} y1={cy(pos.attMul)} x2={cx} y2={cy(pos.attBn)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* BN to Add */}
                            <line x1={cx} y1={cy(pos.attBn)} x2={cx} y2={cy(pos.attAdd)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* Add to Divider */}
                            <line x1={cx} y1={cy(pos.attAdd)} x2={cx} y2={cy(pos.divider)} stroke={strokeColor} strokeWidth={strokeWidth} />


                            {/* --- FFN SECTION --- */}
                            <line x1={cx} y1={cy(pos.divider)} x2={cx} y2={cy(pos.avgPool)} stroke={dashedColor} strokeWidth={strokeWidth} strokeDasharray="4 4" />
                            <line x1={cx} y1={cy(pos.avgPool)} x2={cx} y2={cy(pos.ffnSplit)} stroke={dashedColor} strokeWidth={strokeWidth} strokeDasharray="4 4" />

                            {/* Split to Perf (Left - Main) */}
                            <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx-branchOffset} ${cy(pos.ffnSplit)} L ${cx-branchOffset} ${cy(pos.ffnProc)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* Split to Perf* (Right - Expansion - Dashed) */}
                            <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx+branchOffset} ${cy(pos.ffnSplit)} L ${cx+branchOffset} ${cy(pos.ffnProc)}`} fill="none" stroke={dashedColor} strokeWidth={strokeWidth} strokeDasharray="4 4" />

                            {/* Perf to BN (Left) */}
                            <line x1={cx-branchOffset} y1={cy(pos.ffnProc)} x2={cx-branchOffset} y2={cy(pos.ffnBn)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* Perf* to BN* (Right) */}
                            <line x1={cx+branchOffset} y1={cy(pos.ffnProc)} x2={cx+branchOffset} y2={cy(pos.ffnBn)} stroke={dashedColor} strokeWidth={strokeWidth} strokeDasharray="4 4" />

                            {/* BN to Add (Left) */}
                            <line x1={cx-branchOffset} y1={cy(pos.ffnBn)} x2={cx-branchOffset} y2={cy(pos.ffnAdd)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* BN* to Add* (Right) */}
                            <line x1={cx+branchOffset} y1={cy(pos.ffnBn)} x2={cx+branchOffset} y2={cy(pos.ffnAdd)} stroke={dashedColor} strokeWidth={strokeWidth} strokeDasharray="4 4" />

                            {/* AvgPool Residual to Add (Left) */}
                            {/* Route Wide: cx -> Left (branchOffset+60) -> Down -> Add Left */}
                            <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx-branchOffset-80} ${cy(pos.ffnSplit)} L ${cx-branchOffset-80} ${cy(pos.ffnAdd)} L ${cx-branchOffset} ${cy(pos.ffnAdd)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* AvgPool Residual to Add* (Right) */}
                            {/* Route Wide: cx -> Right (branchOffset+60) -> Down -> Add* Right */}
                            <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx+branchOffset+80} ${cy(pos.ffnSplit)} L ${cx+branchOffset+80} ${cy(pos.ffnAdd)} L ${cx+branchOffset} ${cy(pos.ffnAdd)}`} fill="none" stroke={dashedColor} strokeWidth={strokeWidth} strokeDasharray="4 4" />

                            {/* Add to Concat (Left) */}
                            <path d={`M ${cx-branchOffset} ${cy(pos.ffnAdd)} L ${cx-branchOffset} ${cy(pos.concat)} L ${cx} ${cy(pos.concat)}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* Add* to Concat (Right) */}
                            <path d={`M ${cx+branchOffset} ${cy(pos.ffnAdd)} L ${cx+branchOffset} ${cy(pos.concat)} L ${cx} ${cy(pos.concat)}`} fill="none" stroke={dashedColor} strokeWidth={strokeWidth} strokeDasharray="4 4" />

                            {/* Concat to Output */}
                            <line x1={cx} y1={cy(pos.concat)} x2={cx} y2={cy(pos.output)-3} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd="url(#arrow-block)" />

                            {/* --- DATA FLOW ANIMATION OVERLAY (Sharper Flow) --- */}
                            <defs>
                                <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                                    <stop offset="20%" stopColor="white" stopOpacity="0" />
                                    <stop offset="40%" stopColor="white" stopOpacity="1" />
                                    <stop offset="60%" stopColor="white" stopOpacity="1" />
                                    <stop offset="80%" stopColor="white" stopOpacity="0" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                                
                                <mask id="flow-mask">
                                    <rect x="0" y="-50%" width="100%" height="50%" fill="url(#flow-gradient)">
                                        <animate 
                                            key={`${isCompressed ? 'compressed' : 'expanded'}-${Date.now()}`}
                                            attributeName="y" 
                                            from="-40%" 
                                            to="100%" 
                                            dur="4s" 
                                            repeatCount="indefinite" 
                                        />
                                    </rect>
                                </mask>

                                {/* Flow Markers */}
                                <marker id="arrow-flow-purple" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,3 L3,1.5 z" fill="#c084fc" />
                                </marker>
                            </defs>

                            <g className="flow-overlay" style={{ pointerEvents: 'none' }} mask="url(#flow-mask)">
                                {/* ATTENTION FLOW (Sky Blue) */}
                                <g className="text-sky-400" stroke="currentColor" strokeWidth="4" fill="none" style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>
                                    <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.attSplit)} />
                                    <path d={`M ${cx} ${cy(pos.attSplit)} L ${cx-branchOffset} ${cy(pos.attSplit)} L ${cx-branchOffset} ${cy(pos.attProc)}`} />
                                    <path d={`M ${cx} ${cy(pos.attSplit)} L ${cx+branchOffset} ${cy(pos.attSplit)} L ${cx+branchOffset} ${cy(pos.attProc)}`} />
                                    <path d={`M ${cx-branchOffset} ${cy(pos.attProc)} L ${cx-branchOffset} ${cy(pos.attMul)} L ${cx} ${cy(pos.attMul)}`} />
                                    <path d={`M ${cx+branchOffset} ${cy(pos.attProc)} L ${cx+branchOffset} ${cy(pos.attMul)} L ${cx} ${cy(pos.attMul)}`} />
                                    <path d={`M ${cx+branchOffset} ${cy(pos.attProc)} L ${cx+branchOffset} ${cy(pos.attAdd)} L ${cx} ${cy(pos.attAdd)}`} />
                                    <line x1={cx} y1={cy(pos.attMul)} x2={cx} y2={cy(pos.attBn)} />
                                    <line x1={cx} y1={cy(pos.attBn)} x2={cx} y2={cy(pos.attAdd)} />
                                    <line x1={cx} y1={cy(pos.attAdd)} x2={cx} y2={cy(pos.divider)} />
                                </g>

                                {/* FFN FLOW (Purple) */}
                                <g className="text-purple-400" stroke="currentColor" strokeWidth="4" fill="none" style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>
                                    <line x1={cx} y1={cy(pos.divider)} x2={cx} y2={cy(pos.avgPool)} />
                                    <line x1={cx} y1={cy(pos.avgPool)} x2={cx} y2={cy(pos.ffnSplit)} />
                                    <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx-branchOffset} ${cy(pos.ffnSplit)} L ${cx-branchOffset} ${cy(pos.ffnProc)}`} />
                                    <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx+branchOffset} ${cy(pos.ffnSplit)} L ${cx+branchOffset} ${cy(pos.ffnProc)}`} />
                                    <line x1={cx-branchOffset} y1={cy(pos.ffnProc)} x2={cx-branchOffset} y2={cy(pos.ffnBn)} />
                                    <line x1={cx+branchOffset} y1={cy(pos.ffnProc)} x2={cx+branchOffset} y2={cy(pos.ffnBn)} />
                                    <line x1={cx-branchOffset} y1={cy(pos.ffnBn)} x2={cx-branchOffset} y2={cy(pos.ffnAdd)} />
                                    <line x1={cx+branchOffset} y1={cy(pos.ffnBn)} x2={cx+branchOffset} y2={cy(pos.ffnAdd)} />
                                    <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx-branchOffset-80} ${cy(pos.ffnSplit)} L ${cx-branchOffset-80} ${cy(pos.ffnAdd)} L ${cx-branchOffset} ${cy(pos.ffnAdd)}`} />
                                    <path d={`M ${cx} ${cy(pos.ffnSplit)} L ${cx+branchOffset+80} ${cy(pos.ffnSplit)} L ${cx+branchOffset+80} ${cy(pos.ffnAdd)} L ${cx+branchOffset} ${cy(pos.ffnAdd)}`} />
                                    <path d={`M ${cx-branchOffset} ${cy(pos.ffnAdd)} L ${cx-branchOffset} ${cy(pos.concat)} L ${cx} ${cy(pos.concat)}`} />
                                    <path d={`M ${cx+branchOffset} ${cy(pos.ffnAdd)} L ${cx+branchOffset} ${cy(pos.concat)} L ${cx} ${cy(pos.concat)}`} />
                                    <line x1={cx} y1={cy(pos.concat)} x2={cx} y2={cy(pos.output)} markerEnd="url(#arrow-flow-purple)" />
                                </g>
                            </g>
                        </svg>

                        {/* --- EXPANSION BRANCH GROUP (Dashed) --- */}
                        <div 
                            className="absolute z-10 cursor-help"
                            style={{ 
                                top: cy(pos.avgPool) - 40, 
                                height: cy(pos.concat) - cy(pos.avgPool) + 90,
                                left: cx + branchOffset - 85,
                                width: 170
                            }}
                            onMouseEnter={(e) => {
                                setIsExpansionHovered(true);
                                handleMouseEnter(e, 'Expansion Branch', 'This parallel branch is utilized exclusively in the initial block of each stage (excluding Stage 1) to facilitate channel expansion and spatial downsampling.', 'text-gray-400', true, -150);
                            }}
                            onMouseLeave={() => {
                                setIsExpansionHovered(false);
                                handleMouseLeave();
                            }}
                        />

                        {/* --- NODES (z-20) --- */}

                        {/* Input */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 px-4 py-1 z-40 cursor-help"  
                            style={{ top: cy(pos.input) - 25 }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Input Tensor', 'The feature map entering the block.', 'text-sky-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-sm font-black text-sky-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]">Input</span>
                            {/* Glow Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-sm font-black text-white tracking-widest uppercase" style={{ animation: 'flash-input 4s infinite linear' }}>Input</span>
                            </div>
                        </div>

                        {/* Efficient Processor (Left) */}
                        <div 
                            onClick={() => handleSelect('efficient')}
                            className="absolute w-[140px] h-16 border-2 border-sky-500 rounded-2xl flex items-center justify-center z-20 cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-300 magnetic-target" 
                            style={{ 
                                top: cy(pos.attProc) - procH/2, 
                                left: cx - branchOffset - procW/2,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                            }} 
                            onMouseEnter={(e) => handleMouseEnter(e, 'Efficient Processor', 'Uses depthwise convolutions and adaptive binary weights to process features efficiently.', 'text-sky-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sky-400 font-black text-sm tracking-widest uppercase drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]">Efficient</span>
                                <span className="text-sky-300/60 text-xs font-bold tracking-[0.2em] uppercase">Processor</span>
                            </div>
                        </div>

                        {/* DPReLU (Right) */}
                        <div 
                            className="absolute w-32 h-10 border-[1.5px] border-gray-500/50 rounded-xl flex items-center justify-center z-20 shadow-[0_0_15px_rgba(75,85,99,0.2)] hover:border-gray-400 transition-colors cursor-help hover:scale-105" 
                            style={{ 
                                top: cy(pos.attProc) - 20, 
                                left: cx + branchOffset - 64,
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'DPReLU', 'Dynamic Parametric ReLU. An activation function that adapts its slope based on the input.', 'text-gray-200')}
                            onMouseLeave={handleMouseLeave}
                        > 
                            <span className="text-gray-200 text-sm font-black tracking-widest uppercase">DPReLU</span>
                        </div>

                        {/* Multiply */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:scale-110 cursor-help transition-transform" 
                            style={{ 
                                top: cy(pos.attMul) - 16,
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Element-wise Multiply', 'Modulates the features using the attention weights or scaling factors.', 'text-white')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Icons.X size={14} className="text-white" />
                        </div>

                        {/* BN */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-28 h-9 border-[1.5px] border-gray-500/50 rounded-xl flex items-center justify-center z-20 shadow-[0_0_10px_rgba(75,85,99,0.2)] hover:border-gray-400 transition-colors cursor-help hover:scale-105" 
                            style={{ 
                                top: cy(pos.attBn) - bnH/2,
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Batch Normalization', 'Normalizes activations to stabilize training.', 'text-gray-300')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-gray-300 text-sm font-black tracking-widest">BN</span>
                        </div>

                        {/* Add */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:scale-110 cursor-help transition-transform" 
                            style={{ 
                                top: cy(pos.attAdd) - 16,
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Element-wise Add', 'Residual connection. Fuses processed features with the original or parallel branch.', 'text-white')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Icons.Plus size={14} className="text-white" />
                        </div>


                        {/* AvgPool* */}
                        <div 
                            className={`absolute left-1/2 -translate-x-1/2 w-36 h-12 border-[1.5px] border-dashed border-gray-500/60 rounded-xl flex items-center justify-center z-20 hover:border-gray-400 transition-all duration-300 cursor-help hover:scale-105 ${isExpansionHovered ? 'shadow-[0_0_15px_rgba(107,114,128,0.5)] border-gray-400 bg-gray-800/40' : ''}`}
                            style={{ 
                                top: cy(pos.avgPool) - poolH/2,
                                backgroundColor: isExpansionHovered ? 'rgba(30, 30, 35, 0.9)' : 'rgba(20, 20, 25, 0.8)',
                                boxShadow: isExpansionHovered ? '0 0 20px rgba(107,114,128,0.4)' : '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Average Pooling', 'Reduces spatial dimensions (if stride=2) or acts as a placeholder.', 'text-gray-300')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={`text-sm font-black tracking-widest uppercase italic transition-colors ${isExpansionHovered ? 'text-white' : 'text-gray-300'}`}>AvgPool*</span>
                        </div>

                        {/* Performance Processor (Left) */}
                        <div 
                            onClick={() => handleSelect('performance')}
                            className="absolute w-[140px] h-16 border-2 border-purple-500 rounded-2xl flex items-center justify-center z-20 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 magnetic-target" 
                            style={{ 
                                top: cy(pos.ffnProc) - procH/2, 
                                left: cx - branchOffset - procW/2,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Performance Processor', 'Uses dense convolutions and expansion to extract rich features.', 'text-purple-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-purple-400 font-black text-sm tracking-widest uppercase drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">Performance</span>
                                <span className="text-purple-300/60 text-xs font-bold tracking-[0.2em] uppercase">Processor</span>
                            </div>
                        </div>

                        {/* Performance Processor* (Right - Dashed) */}
                        <div 
                            onClick={() => handleSelect('performance')}
                            className={`absolute w-[140px] h-16 border-2 border-dashed border-purple-500/50 rounded-2xl flex items-center justify-center z-20 cursor-pointer hover:scale-105 transition-all duration-300 ${isExpansionHovered ? 'shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-400 bg-purple-900/30' : ''}`}
                            style={{ 
                                top: cy(pos.ffnProc) - procH/2, 
                                left: cx + branchOffset - procW/2,
                                backgroundColor: isExpansionHovered ? 'rgba(20, 10, 30, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                boxShadow: isExpansionHovered ? '0 0 25px rgba(168,85,247,0.3)' : '0 8px 16px rgba(0, 0, 0, 0.2)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Performance Processor*', 'Expansion branch for channel adaptation (if needed).', 'text-purple-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                <span className={`font-black text-sm tracking-widest uppercase transition-colors ${isExpansionHovered ? 'text-purple-300' : 'text-purple-400/70'}`}>Performance</span>
                                <span className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${isExpansionHovered ? 'text-purple-300' : 'text-purple-400/40'}`}>Processor*</span>
                            </div>
                        </div>

                        {/* BN (Left) */}
                        <div 
                            className="absolute w-28 h-9 border-[1.5px] border-gray-500/50 rounded-xl flex items-center justify-center z-20 shadow-[0_0_10px_rgba(75,85,99,0.2)] hover:border-gray-400 transition-colors cursor-help hover:scale-105" 
                            style={{ 
                                top: cy(pos.ffnBn) - bnH/2, 
                                left: cx - branchOffset - bnW/2,
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Batch Normalization', 'Normalizes activations to stabilize training.', 'text-gray-300')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-gray-300 text-sm font-black tracking-widest">BN</span>
                        </div>

                        {/* BN* (Right) */}
                        <div 
                            className={`absolute w-28 h-9 border-[1.5px] border-dashed border-gray-600/50 rounded-xl flex items-center justify-center z-20 hover:border-gray-400 transition-all duration-300 cursor-help hover:scale-105 ${isExpansionHovered ? 'shadow-[0_0_15px_rgba(156,163,175,0.5)] border-gray-400 bg-gray-800/40' : ''}`}
                            style={{ 
                                top: cy(pos.ffnBn) - bnH/2, 
                                left: cx + branchOffset - bnW/2,
                                backgroundColor: isExpansionHovered ? 'rgba(30, 30, 35, 0.9)' : 'rgba(20, 20, 25, 0.8)',
                                boxShadow: isExpansionHovered ? '0 0 15px rgba(156,163,175,0.3)' : '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Batch Normalization*', 'Normalizes activations (expansion branch).', 'text-gray-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={`text-sm font-black tracking-widest transition-colors ${isExpansionHovered ? 'text-white' : 'text-gray-400'}`}>BN*</span>
                        </div>

                        {/* Add (Left) */}
                        <div 
                            className="absolute w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:scale-110 cursor-help transition-transform" 
                            style={{ 
                                top: cy(pos.ffnAdd) - 16, 
                                left: cx - branchOffset - 16,
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Element-wise Add', 'Residual connection. Fuses processed features.', 'text-white')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Icons.Plus size={14} className="text-white" />
                        </div>

                        {/* Add* (Right) */}
                        <div 
                            className={`absolute w-8 h-8 border-2 border-dashed border-gray-500/60 rounded-full flex items-center justify-center z-20 hover:scale-110 cursor-help transition-all duration-300 ${isExpansionHovered ? 'shadow-[0_0_15px_rgba(156,163,175,0.5)] border-gray-300 bg-gray-700/50' : ''}`}
                            style={{ 
                                top: cy(pos.ffnAdd) - 16, 
                                left: cx + branchOffset - 16,
                                backgroundColor: isExpansionHovered ? 'rgba(40, 40, 45, 0.9)' : 'rgba(20, 20, 25, 0.8)',
                                boxShadow: isExpansionHovered ? '0 0 15px rgba(156,163,175,0.3)' : '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Element-wise Add*', 'Residual connection (expansion branch).', 'text-gray-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Icons.Plus size={14} className={`transition-colors ${isExpansionHovered ? 'text-white' : 'text-gray-400'}`} />
                        </div>

                        {/* Concat* */}
                        <div 
                            className={`absolute left-1/2 -translate-x-1/2 w-[120px] h-12 border-[1.5px] border-dashed border-white/40 rounded-full flex items-center justify-center z-20 hover:border-white transition-all duration-300 cursor-help hover:scale-105 ${isExpansionHovered ? 'shadow-[0_0_20px_rgba(255,255,255,0.3)] border-white bg-white/10' : ''}`}
                            style={{ 
                                top: cy(pos.concat) - concatH/2,
                                backgroundColor: isExpansionHovered ? 'rgba(30, 30, 35, 0.9)' : 'rgba(20, 20, 25, 0.8)',
                                boxShadow: isExpansionHovered ? '0 0 20px rgba(255,255,255,0.2)' : '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Concatenation', 'Merges features from different branches or stages.', 'text-white')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={`text-sm font-black tracking-widest uppercase transition-colors ${isExpansionHovered ? 'text-white' : 'text-white/80'}`}>Concat*</span>
                        </div>

                        {/* Output */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 px-4 py-1 z-20 cursor-help" 
                            style={{ top: cy(pos.output) + 5 }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Output Tensor', 'The final processed feature map leaving the block.', 'text-purple-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-base font-black text-purple-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">Output</span>
                            {/* Glow Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-base font-black text-white tracking-widest uppercase" style={{ animation: 'flash-output 4s infinite linear' }}>Output</span>
                            </div>
                        </div>
                    </div>

                </div>
                )}</div>
            </div>
        </div>
    );
};
