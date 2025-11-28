

const ArchitectureProcessor = ({ selection, setLevel, onHover }) => {
    const isEfficient = selection.processor === 'efficient';
    const title = isEfficient ? 'EFFICIENT PROCESSOR' : 'PERFORMANCE PROCESSOR';
    const layerName = isEfficient ? 'ChannelEnhancementLayer' : 'DenseFeatureProcessor';
    const color = isEfficient ? 'sky' : 'purple';
    
    const containerRef = React.useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 320, height: 450 });

    React.useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                // Ensure minimum height of 400px to prevent squeezing
                const h = Math.max(entry.contentRect.height, 400);
                setDimensions({
                    width: entry.contentRect.width,
                    height: h
                });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // --- Dynamic Layout Configuration ---
    // Vertical positions as percentages (0.0 to 1.0)
    const pos = isEfficient ? {
        // Efficient Processor (Needs space for Mix Node)
        input: 0.16,
        split: 0.18,
        mainConv: 0.23,
        bn1: 0.31,
        prelu1: 0.38,
        concat: 0.45,
        enhanceConv: 0.525,
        bn2: 0.60,
        prelu2: 0.665,
        add: 0.73,
        se_gamma: 0.80, 
        mul: 0.895,      
        output: 0.95
    } : {
        // Performance Processor (Tighter)
        input: 0.16,
        split: 0.19,
        mainConv: 0.24,
        bn1: 0.34,
        prelu1: 0.42,
        concat: 0.51,
        enhanceConv: 0.60,
        bn2: 0.68,
        prelu2: 0.75,
        add: 0.82,
        se_gamma: 0.89, 
        mul: 0.89,      
        output: 0.95
    };

    const { width, height } = dimensions;
    const cx = width / 2; // Center X
    const cy = (p) => p * height; // Calculate Y based on percentage

    // Helper for smooth bezier curves
    const drawCurve = (x1, y1, x2, y2, curvature = 0.5) => {
        const cp1y = y1 + (y2 - y1) * curvature;
        const cp2y = y2 - (y2 - y1) * curvature;
        return `M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`;
    };

    const drawHorizontalCurve = (x1, y1, x2, y2) => {
        const cpx = x1 + (x2 - x1) * 0.5;
        return `M ${x1} ${y1} C ${cpx} ${y1}, ${cpx} ${y2}, ${x2} ${y2}`;
    };

    const handleMouseEnter = (e, title, content, colorClass = 'text-white', forceSide = null, width = 200) => {
        if (!containerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate position relative to the container
        // Position to the right of the element by default
        let x = rect.right - containerRect.left + 15;
        let y = rect.top - containerRect.top + (rect.height / 2);
        
        // Adjust if too close to right edge (flip to left) OR forced left
        if (forceSide === 'left' || (x + width > containerRect.width)) {
            x = rect.left - containerRect.left - (width + 15);
        }

        // Adjust if too close to bottom edge (Output node)
        if (y + 100 > containerRect.height) {
            y = rect.top - containerRect.top - 120; // Move above the element
        }

        // Call parent handler
        if (onHover) {
            onHover({ x, y, title, content, colorClass, width });
        }
    };

    const handleMouseLeave = () => {
        if (onHover) {
            onHover(null);
        }
    };

    // Style Constants
    const strokeColor = "#4b5563"; // gray-600
    const activeColor = isEfficient ? "#0ea5e9" : "#a855f7"; // sky-500 or purple-500
    const strokeWidth = 2;

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-white overflow-hidden">
            <style>{`
                @keyframes flash-input-sky {
                    0% { opacity: 0; }
                    15%, 25% { opacity: 1; filter: drop-shadow(0 0 10px #38bdf8) drop-shadow(0 0 20px #38bdf8); }
                    35%, 100% { opacity: 0; }
                }
                @keyframes flash-input-purple {
                    0% { opacity: 0; }
                    15%, 25% { opacity: 1; filter: drop-shadow(0 0 10px #c084fc) drop-shadow(0 0 20px #c084fc); }
                    35%, 100% { opacity: 0; }
                }
                @keyframes flash-output-sky {
                    0%, 70% { opacity: 0; }
                    80% { opacity: 1; filter: drop-shadow(0 0 10px #38bdf8) drop-shadow(0 0 20px #38bdf8); }
                    90%, 100% { opacity: 0; }
                }
                @keyframes flash-output-purple {
                    0%, 70% { opacity: 0; }
                    80% { opacity: 1; filter: drop-shadow(0 0 10px #c084fc) drop-shadow(0 0 20px #c084fc); }
                    90%, 100% { opacity: 0; }
                }
            `}</style>
            {/* Diagram Container - No Scrollbar */}
            <div ref={containerRef} className="flex-1 relative w-full h-full overflow-visible font-sans select-none">
                
                {/* Header - Moved to Background */}
                <div className="absolute top-6 left-6 z-0 pointer-events-none">
                    <div>
                        <div className={`text-[10px] font-medium tracking-[0.3em] mb-2 uppercase opacity-80 ${isEfficient ? 'text-sky-400' : 'text-purple-400'}`}>
                            {isEfficient ? 'Channel Enhancement' : 'Dense Feature Processing'}
                        </div>
                        <h3 className="text-3xl font-thin text-white tracking-[0.2em]">
                            {isEfficient ? 'EFFICIENT' : 'PERFORMANCE'}
                        </h3>
                    </div>
                </div>

                {/* Inner Content with Min Height */}
                {width > 0 && (
                    <div className="relative w-full" style={{ height: height }}>
                    
                    {/* --- SVG Connections --- */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        <defs>
                            {/* Markers Removed for Clean Pass-Through Look, except for Output */}
                            <marker id="arrow" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,3 L3,1.5 z" fill={strokeColor} />
                            </marker>
                        </defs>

                        {/* Static Lines Group with Glow */}
                        <g style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.15))' }}>
                            {/* 1. Input Flow */}
                            <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.mainConv)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* 2. Split to Concat (Left Side) */}
                            <path 
                                d={`M ${cx} ${cy(pos.split)} 
                                   L ${cx-110} ${cy(pos.split)} 
                                   L ${cx-110} ${cy(pos.concat)} 
                                   L ${cx} ${cy(pos.concat)}`}
                                fill="none" 
                                stroke={strokeColor} 
                                strokeWidth={strokeWidth} 
                            />

                            {/* 3. Main Branch Flow */}
                            <line x1={cx} y1={cy(pos.mainConv)} x2={cx} y2={cy(pos.bn1)} stroke={strokeColor} strokeWidth={strokeWidth} />
                            <line x1={cx} y1={cy(pos.bn1)} x2={cx} y2={cy(pos.prelu1)} stroke={strokeColor} strokeWidth={strokeWidth} />
                            
                            {/* 4. Main to Concat */}
                            <line x1={cx} y1={cy(pos.prelu1)} x2={cx} y2={cy(pos.concat)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* 5. Concat to Enhance */}
                            <line x1={cx} y1={cy(pos.concat)} x2={cx} y2={cy(pos.enhanceConv)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* 6. Enhance Branch Flow */}
                            <line x1={cx} y1={cy(pos.enhanceConv)} x2={cx} y2={cy(pos.bn2)} stroke={strokeColor} strokeWidth={strokeWidth} />
                            <line x1={cx} y1={cy(pos.bn2)} x2={cx} y2={cy(pos.prelu2)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* 7. Merge (Add) Logic */}
                            {/* Main Branch Skip Connection to Add - Polyline */}
                            {/* Start from Center of PReLU1 */}
                            <path 
                                d={`M ${cx} ${cy(pos.prelu1)} 
                                   L ${cx+120} ${cy(pos.prelu1)} 
                                   L ${cx+120} ${cy(pos.add)} 
                                   L ${cx} ${cy(pos.add)}`}
                                fill="none" 
                                stroke={strokeColor} 
                                strokeWidth={strokeWidth} 
                                strokeDasharray="4 4"
                            />
                            {/* Enhance to Add */}
                            <line x1={cx} y1={cy(pos.prelu2)} x2={cx} y2={cy(pos.add)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* 8. Post-Add to Multiply */}
                            <line x1={cx} y1={cy(pos.add)} x2={cx} y2={cy(pos.mul)} stroke={strokeColor} strokeWidth={strokeWidth} />

                            {/* 9. SE / Gamma Logic */}
                            {isEfficient ? (
                                <>
                                    {/* Input 'x' to Mixing Node */}
                                    <path 
                                        d={`M ${cx-40} ${cy(pos.input)} 
                                           L ${cx-140} ${cy(pos.input)} 
                                           L ${cx-140} ${cy(pos.add)} 
                                           L ${cx-74} ${cy(pos.add)}`}
                                        fill="none" 
                                        stroke={activeColor} 
                                        strokeWidth={strokeWidth} 
                                        strokeDasharray="2 2"
                                    />

                                    {/* Add Output to Mixing Node */}
                                    <line 
                                        x1={cx} y1={cy(pos.add)} 
                                        x2={cx-50} y2={cy(pos.add)}
                                        stroke={activeColor} 
                                        strokeWidth={strokeWidth} 
                                        strokeDasharray="4 4"
                                    />
                                    
                                    {/* Mixing Node to SE Top */}
                                    <line 
                                        x1={cx-62} y1={cy(pos.add)+12} 
                                        x2={cx-62} y2={cy(pos.se_gamma)-20} 
                                        stroke={activeColor} strokeWidth={strokeWidth} 
                                    />

                                    {/* SE Output to Multiply */}
                                    <path 
                                        d={`M ${cx-62} ${cy(pos.se_gamma)+12} 
                                           L ${cx-62} ${cy(pos.mul)} 
                                           L ${cx} ${cy(pos.mul)}`}
                                        fill="none" 
                                        stroke={activeColor} 
                                        strokeWidth={strokeWidth} 
                                    />
                                </>
                            ) : (
                                <>
                                    {/* Gamma to Multiply */}
                                    <line 
                                        x1={cx-72} y1={cy(pos.se_gamma)} 
                                        x2={cx} y2={cy(pos.mul)} 
                                        stroke={activeColor} strokeWidth={strokeWidth} 
                                    />
                                </>
                            )}

                            {/* 10. Final Output */}
                            <line x1={cx} y1={cy(pos.mul)} x2={cx} y2={cy(pos.output)-1} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd="url(#arrow)" />
                        </g>

                        {/* --- DATA FLOW ANIMATION OVERLAY (Sharper Flow) --- */}
                        <defs>
                            <linearGradient id="proc-flow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="white" stopOpacity="0" />
                                <stop offset="20%" stopColor="white" stopOpacity="0" />
                                <stop offset="40%" stopColor="white" stopOpacity="1" />
                                <stop offset="60%" stopColor="white" stopOpacity="1" />
                                <stop offset="80%" stopColor="white" stopOpacity="0" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                            
                            <mask id="proc-flow-mask">
                                <rect x="0" y="-50%" width="100%" height="50%" fill="url(#proc-flow-gradient)">
                                    <animate attributeName="y" from="-40%" to="100%" dur="4s" repeatCount="indefinite" />
                                </rect>
                            </mask>

                            {/* Flow Marker */}
                            <marker id="arrow-flow-proc" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,3 L3,1.5 z" fill={activeColor} />
                            </marker>
                        </defs>

                        <g className="flow-overlay" style={{ pointerEvents: 'none', color: activeColor, mask: 'url(#proc-flow-mask)', filter: 'drop-shadow(0 0 8px currentColor)' }} stroke="currentColor" strokeWidth="4" fill="none">
                            {/* 1. Input Flow */}
                            <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.mainConv)} />

                            {/* 2. Split to Concat */}
                            <path d={`M ${cx} ${cy(pos.split)} L ${cx-110} ${cy(pos.split)} L ${cx-110} ${cy(pos.concat)} L ${cx} ${cy(pos.concat)}`} />

                            {/* 3. Main Branch */}
                            <line x1={cx} y1={cy(pos.mainConv)} x2={cx} y2={cy(pos.bn1)} />
                            <line x1={cx} y1={cy(pos.bn1)} x2={cx} y2={cy(pos.prelu1)} />
                            
                            {/* 4. Main to Concat */}
                            <line x1={cx} y1={cy(pos.prelu1)} x2={cx} y2={cy(pos.concat)} />

                            {/* 5. Concat to Enhance */}
                            <line x1={cx} y1={cy(pos.concat)} x2={cx} y2={cy(pos.enhanceConv)} />

                            {/* 6. Enhance Branch */}
                            <line x1={cx} y1={cy(pos.enhanceConv)} x2={cx} y2={cy(pos.bn2)} />
                            <line x1={cx} y1={cy(pos.bn2)} x2={cx} y2={cy(pos.prelu2)} />

                            {/* 7. Merge (Add) Logic */}
                            {/* Skip Connection */}
                            <path d={`M ${cx} ${cy(pos.prelu1)} L ${cx+120} ${cy(pos.prelu1)} L ${cx+120} ${cy(pos.add)} L ${cx} ${cy(pos.add)}`} />
                            {/* Enhance to Add */}
                            <line x1={cx} y1={cy(pos.prelu2)} x2={cx} y2={cy(pos.add)} />

                            {/* 8. Post-Add to Multiply */}
                            <line x1={cx} y1={cy(pos.add)} x2={cx} y2={cy(pos.mul)} />

                            {/* 9. SE / Gamma Logic */}
                            {isEfficient ? (
                                <>
                                    <path d={`M ${cx-40} ${cy(pos.input)} L ${cx-140} ${cy(pos.input)} L ${cx-140} ${cy(pos.add)} L ${cx-74} ${cy(pos.add)}`} />
                                    <line x1={cx} y1={cy(pos.add)} x2={cx-50} y2={cy(pos.add)} />
                                    <line x1={cx-62} y1={cy(pos.add)+12} x2={cx-62} y2={cy(pos.se_gamma)-20} />
                                    <path d={`M ${cx-62} ${cy(pos.se_gamma)+12} L ${cx-62} ${cy(pos.mul)} L ${cx} ${cy(pos.mul)}`} />
                                </>
                            ) : (
                                <line x1={cx-72} y1={cy(pos.se_gamma)} x2={cx} y2={cy(pos.mul)} />
                            )}

                            {/* 10. Final Output */}
                            <line x1={cx} y1={cy(pos.mul)} x2={cx} y2={cy(pos.output)} markerEnd="url(#arrow-flow-proc)" />
                        </g>

                    </svg>

                    {/* --- Nodes (Absolute Positioning based on %) --- */}
                    
                    {/* Input */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 px-4 py-1 z-40 cursor-help"  
                        style={{ top: cy(pos.input) - 25 }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Input Tensor', 'The initial feature map entering the processing block. Contains raw spatial and channel information.', isEfficient ? 'text-sky-500' : 'text-purple-500')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-sm font-black tracking-widest uppercase" style={{ color: activeColor, filter: `drop-shadow(0 0 10px ${activeColor})` }}>Input</span>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-sm font-bold text-white tracking-widest uppercase" style={{ animation: `flash-input-${isEfficient ? 'sky' : 'purple'} 4s infinite linear` }}>Input</span>
                        </div>
                    </div>

                    {/* Main Conv */}
                    <div 
                        className={`absolute left-1/2 -translate-x-1/2 w-48 h-12 border-[1.5px] rounded-xl flex items-center justify-center z-10 hover:scale-105 cursor-pointer magnetic-target transition-transform ${isEfficient ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}
                        style={{ 
                            top: cy(pos.mainConv) - 24,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, isEfficient ? 'DWABConv' : 'ABConv', 'Adaptive Binary Convolution. Uses binary weights with adaptive scaling factors to achieve high efficiency while maintaining representational power.', isEfficient ? 'text-sky-400' : 'text-red-400')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className={`font-black text-base tracking-widest uppercase ${isEfficient ? 'text-sky-400 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'}`}>
                            {isEfficient ? 'DWABConv 7x7' : 'ABConv 3x3'}
                        </span>
                    </div>

                    {/* BN 1 */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-32 h-10 border-[1.5px] border-gray-500/50 rounded-xl flex items-center justify-center z-10 cursor-help hover:border-gray-400 transition-colors shadow-[0_0_10px_rgba(75,85,99,0.2)]" 
                        style={{ 
                            top: cy(pos.bn1) - 20,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Batch Normalization', 'Normalizes the activations from the previous layer to stabilize training and accelerate convergence.', 'text-gray-300')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-gray-300 text-sm font-black tracking-widest">BN</span>
                    </div>

                    {/* PReLU 1 */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-32 h-10 border-[1.5px] border-gray-500/50 rounded-xl flex items-center justify-center z-10 hover:border-gray-400 transition-colors cursor-help shadow-[0_0_10px_rgba(75,85,99,0.2)]" 
                        style={{ 
                            top: cy(pos.prelu1) - 20,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'PReLU', 'Parametric ReLU. An activation function that learns the slope for negative values, allowing the network to adaptively preserve information.', 'text-gray-300')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-gray-300 text-sm font-black tracking-widest">PReLU</span>
                    </div>

                    {/* Concat */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-32 h-10 border-[1.5px] border-gray-500/50 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-help hover:border-white transition-colors" 
                        style={{ 
                            top: cy(pos.concat) - 20,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Concatenation', 'Merges features from the identity branch and the main processing branch to preserve information flow.', 'text-white')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-white text-sm font-black tracking-widest uppercase">Concat</span>
                    </div>

                    {/* Enhance Conv */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-48 h-12 border-[1.5px] border-blue-500 rounded-xl flex items-center justify-center z-10 hover:scale-105 cursor-pointer magnetic-target transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                        style={{ 
                            top: cy(pos.enhanceConv) - 24,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'ABConv 1x1', 'Pointwise Adaptive Binary Convolution. Efficiently mixes channels using binary operations to enhance feature representation.', 'text-blue-400')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-blue-400 font-black text-base tracking-widest uppercase drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">ABConv 1x1</span>
                    </div>

                    {/* BN 2 */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-32 h-10 border-[1.5px] border-gray-500/50 rounded-xl flex items-center justify-center z-10 cursor-help hover:border-gray-400 transition-colors shadow-[0_0_10px_rgba(75,85,99,0.2)]" 
                        style={{ 
                            top: cy(pos.bn2) - 20,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Batch Normalization', 'Normalizes the activations to ensure consistent distribution before the next activation function.', 'text-gray-300')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-gray-300 text-sm font-black tracking-widest">BN</span>
                    </div>

                    {/* PReLU 2 */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-32 h-10 border-[1.5px] border-gray-500/50 rounded-xl flex items-center justify-center z-10 hover:border-gray-400 transition-colors cursor-help shadow-[0_0_10px_rgba(75,85,99,0.2)]" 
                        style={{ 
                            top: cy(pos.prelu2) - 20,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'PReLU', 'Parametric ReLU. Introduces non-linearity while preserving negative values via a learnable slope.', 'text-gray-300')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-gray-300 text-sm font-black tracking-widest">PReLU</span>
                    </div>

                    {/* Add Node */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-white/60 rounded-full flex items-center justify-center z-10 cursor-help hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                        style={{ 
                            top: cy(pos.add) - 20,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Element-wise Add', 'Residual connection. Fuses the enhanced features with the original features to facilitate gradient flow.', 'text-white')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Icons.Plus size={20} className="text-white" />
                    </div>

                    {/* SE or Gamma */}
                    {isEfficient ? (
                        <>
                            {/* Mixing Node (Plus) */}
                            {/* Moved UP to -75px */}
                            <div 
                                className="absolute w-6 h-6 border border-orange-500 rounded-full flex items-center justify-center z-10 cursor-help hover:scale-110 transition-transform shadow-[0_0_10px_rgba(249,115,22,0.4)]" 
                                style={{ 
                                    top: cy(pos.add) - 12, 
                                    left: cx - 74,
                                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                }}
                                onMouseEnter={(e) => handleMouseEnter(e, 'Mix-Add', 'Combines the original input features with the processed residual branch before the SE attention modulation.', 'text-orange-500')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Icons.Plus size={12} className="text-orange-500" />
                            </div>
                            {/* SE Module */}
                            {/* Moved DOWN to -20px */}
                            <div 
                                className="absolute w-24 h-16 border-[1.5px] border-orange-500 rounded-xl flex flex-col items-center justify-center z-10 hover:scale-105 cursor-pointer magnetic-target transition-transform shadow-[0_0_15px_rgba(249,115,22,0.2)]" 
                                style={{ 
                                    top: cy(pos.se_gamma) - 20, 
                                    left: cx - 110,
                                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                }}
                                onMouseEnter={(e) => handleMouseEnter(e, 'SE Module', (
                                    <div className="flex flex-col gap-3 min-w-[300px]">
                                        <span className="text-xs text-gray-300">Squeeze-and-Excitation block. Adaptively recalibrates channel-wise feature responses.</span>
                                        <div className="w-full h-32 p-2 flex items-center justify-center">
                                            <svg viewBox="0 0 160 60" className="w-full h-full overflow-visible">
                                                <defs>
                                                    <marker id="arrow-se" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                                                        <path d="M0,0 L0,4 L4,2 z" fill="#9ca3af" />
                                                    </marker>
                                                    <filter id="se-glow" x="-50%" y="-50%" width="200%" height="200%">
                                                        <feGaussianBlur stdDeviation="1" result="blur" />
                                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                    </filter>
                                                </defs>
                                                
                                                {/* Input */}
                                                <text x="10" y="55" fontSize="6" fill="#9ca3af" textAnchor="middle">Input</text>
                                                <rect x="5" y="10" width="10" height="30" rx="2" fill="rgba(20,20,25,0.8)" stroke="#fb923c" strokeWidth="1" filter="url(#se-glow)" />
                                                
                                                {/* Global Pool */}
                                                <path d="M 15 25 L 30 25" stroke="#4b5563" strokeWidth="1" markerEnd="url(#arrow-se)" />
                                                <rect x="30" y="18" width="14" height="14" rx="3" fill="rgba(20,20,25,0.8)" stroke="#fb923c" strokeWidth="1" filter="url(#se-glow)" />
                                                <text x="37" y="27" fontSize="4" fill="#fb923c" textAnchor="middle" fontWeight="bold">Pool</text>

                                                {/* FC1 (Squeeze) */}
                                                <path d="M 44 25 L 55 25" stroke="#4b5563" strokeWidth="1" markerEnd="url(#arrow-se)" />
                                                <rect x="55" y="20" width="10" height="10" rx="2" fill="rgba(20,20,25,0.8)" stroke="#fb923c" strokeWidth="1" filter="url(#se-glow)" />
                                                
                                                {/* ReLU */}
                                                <path d="M 65 25 L 75 25" stroke="#4b5563" strokeWidth="1" />
                                                
                                                {/* FC2 (Excite) */}
                                                <rect x="75" y="18" width="14" height="14" rx="3" fill="rgba(20,20,25,0.8)" stroke="#fb923c" strokeWidth="1" filter="url(#se-glow)" />
                                                <text x="82" y="27" fontSize="4" fill="#fb923c" textAnchor="middle" fontWeight="bold">FC</text>

                                                {/* Sigmoid */}
                                                <path d="M 89 25 L 100 25" stroke="#4b5563" strokeWidth="1" markerEnd="url(#arrow-se)" />
                                                <circle cx="105" cy="25" r="5" fill="rgba(20,20,25,0.8)" stroke="#fb923c" strokeWidth="1" filter="url(#se-glow)" />
                                                <path d="M 103 27 C 104 27, 104 23, 107 23" stroke="#fb923c" strokeWidth="1" fill="none" />

                                                {/* Scale */}
                                                <path d="M 110 25 L 125 25" stroke="#4b5563" strokeWidth="1" markerEnd="url(#arrow-se)" />
                                                <rect x="125" y="10" width="10" height="30" rx="2" fill="rgba(20,20,25,0.8)" stroke="#fb923c" strokeWidth="1" strokeDasharray="2 1" filter="url(#se-glow)" />
                                                <text x="130" y="55" fontSize="6" fill="#9ca3af" textAnchor="middle">Scale</text>
                                                
                                                {/* Skip Connection */}
                                                <path d="M 10 10 L 10 5 L 130 5 L 130 10" fill="none" stroke="#4b5563" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                                            </svg>
                                        </div>
                                    </div>
                                ), 'text-orange-400', 'left', 320)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <span className="text-orange-400 font-black text-base tracking-widest uppercase drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]">SE</span>
                                <span className="text-[10px] text-orange-300/70 font-bold tracking-wider uppercase">Module</span>
                            </div>
                        </>
                    ) : (
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-12 h-12 border-[1.5px] border-purple-500 rounded-xl flex items-center justify-center z-10 hover:scale-105 cursor-pointer magnetic-target transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                            style={{ 
                                top: cy(pos.se_gamma) - 24, 
                                left: cx - 96,
                                backgroundColor: 'rgba(10, 10, 15, 0.8)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Gamma (γ)', 'Learnable Scaling Factor. A channel-wise parameter that scales the output, helping to restore signal amplitude after binary operations.', 'text-purple-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-purple-400 font-serif italic font-bold text-lg">γ</span>
                        </div>
                    )}

                    {/* Multiply Node */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-white/60 rounded-full flex items-center justify-center z-10 cursor-help hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                        style={{ 
                            top: cy(pos.mul) - 20,
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Element-wise Multiply', 'Applies the attention weights (SE) or scaling factor (Gamma) to the feature map.', 'text-white')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Icons.X size={20} className="text-white" />
                    </div>

                    {/* Output */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 px-4 py-1 z-20 cursor-help" 
                        style={{ top: cy(pos.output) + 5 }}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Output Tensor', 'The final processed feature map, enriched and refined, ready for the next stage of the network.', isEfficient ? 'text-sky-500' : 'text-purple-500')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-sm font-black tracking-widest uppercase" style={{ color: activeColor, filter: `drop-shadow(0 0 10px ${activeColor})` }}>Output</span>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-sm font-bold text-white tracking-widest uppercase" style={{ animation: `flash-output-${isEfficient ? 'sky' : 'purple'} 4s infinite linear` }}>Output</span>
                        </div>
                    </div>

                    </div>
                )}
            </div>
        </div>
    );
};
