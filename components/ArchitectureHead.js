

const ArchitectureHead = ({ onHover }) => {
    const containerRef = React.useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: Math.max(containerRef.current.offsetHeight, 600)
                });
            }
        };

        updateDimensions();
        const observer = new ResizeObserver(updateDimensions);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = (p) => p * height;

    const pos = {
        input: 0.05,
        pool: 0.18,
        flatten: 0.31,
        ln: 0.42,
        linear: 0.55,
        output: 0.68
    };

    const strokeColor = "#4b5563"; // gray-600
    const activeColor = "#eab308"; // yellow-500
    const strokeWidth = 2;

    const nodeBaseStyle = {
        backgroundColor: 'rgba(20, 20, 25, 0.8)',
        border: '3px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    };

    const handleMouseEnter = (e, title, content, colorClass = 'text-white') => {
        if (!containerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        let x = rect.right - containerRect.left + 15;
        let y = rect.top - containerRect.top + (rect.height / 2);
        
        if (x + 200 > containerRect.width) {
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

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col bg-transparent relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 z-30 bg-transparent shrink-0">
                <div>
                    <div className="text-[10px] text-yellow-400 font-medium tracking-[0.3em] mb-2 uppercase opacity-80">Output Processing</div>
                    <h3 className="text-3xl font-thin text-white tracking-[0.2em]">CLASSIFIER HEAD</h3>
                </div>
            </div>

            {/* Diagram Container */}
            <div className="flex-1 relative w-full h-full overflow-hidden font-sans select-none">
                {width > 0 && (
                    <div className="relative w-full" style={{ height: height }}>
                        
                        {/* --- SVG Connections --- */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <defs>
                                <linearGradient id="head-flow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                                    <stop offset="20%" stopColor="white" stopOpacity="0" />
                                    <stop offset="40%" stopColor="white" stopOpacity="1" />
                                    <stop offset="60%" stopColor="white" stopOpacity="1" />
                                    <stop offset="80%" stopColor="white" stopOpacity="0" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                                <mask id="head-flow-mask">
                                    <rect x="0" y="-50%" width="100%" height="50%" fill="url(#head-flow-gradient)">
                                        <animate attributeName="y" from="-50%" to="100%" dur="4s" repeatCount="indefinite" />
                                    </rect>
                                </mask>
                            </defs>

                            {/* Static Lines */}
                            <g style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.15))' }}>
                                <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.pool)} stroke={strokeColor} strokeWidth={strokeWidth} />
                                <line x1={cx} y1={cy(pos.pool)} x2={cx} y2={cy(pos.flatten)} stroke={strokeColor} strokeWidth={strokeWidth} />
                                <line x1={cx} y1={cy(pos.flatten)} x2={cx} y2={cy(pos.ln)} stroke={strokeColor} strokeWidth={strokeWidth} />
                                <line x1={cx} y1={cy(pos.ln)} x2={cx} y2={cy(pos.linear)} stroke={strokeColor} strokeWidth={strokeWidth} />
                                <line x1={cx} y1={cy(pos.linear)} x2={cx} y2={cy(pos.output)} stroke={strokeColor} strokeWidth={strokeWidth} />
                            </g>

                            {/* Animated Flow */}
                            <g className="flow-overlay" style={{ pointerEvents: 'none', color: activeColor, mask: 'url(#head-flow-mask)', filter: 'drop-shadow(0 0 8px currentColor)' }} stroke="currentColor" strokeWidth="4" fill="none">
                                <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.pool)} />
                                <line x1={cx} y1={cy(pos.pool)} x2={cx} y2={cy(pos.flatten)} />
                                <line x1={cx} y1={cy(pos.flatten)} x2={cx} y2={cy(pos.ln)} />
                                <line x1={cx} y1={cy(pos.ln)} x2={cx} y2={cy(pos.linear)} />
                                <line x1={cx} y1={cy(pos.linear)} x2={cx} y2={cy(pos.output)} />
                            </g>
                        </svg>

                        {/* --- Nodes --- */}

                        {/* Input Node */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-full h-8 cursor-help z-20"
                            style={{ top: cy(pos.input) - 16 }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Feature Maps', 'Output from the final BEAN stage.', 'text-yellow-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] z-20"></div>
                            <span className="absolute left-[calc(50%+20px)] text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Feature Maps</span>
                            {/* Glow Overlay */}
                            <div className="absolute left-[calc(50%+20px)] flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase whitespace-nowrap opacity-0" style={{ mask: 'url(#head-flow-mask)', filter: 'drop-shadow(0 0 8px white)' }}>Feature Maps</span>
                            </div>
                        </div>

                        {/* Pooling Module */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-60 p-4 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300 cursor-help z-10"
                            style={{
                                top: cy(pos.pool) - 48,
                                ...nodeBaseStyle,
                                border: '2px solid rgba(234, 179, 8, 0.4)',
                                boxShadow: '0 0 30px rgba(234, 179, 8, 0.15), inset 0 0 20px rgba(234, 179, 8, 0.05)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'AdaptiveAvgPool2d', 'Reduces spatial dimensions to 1x1 for each channel.', 'text-yellow-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="text-base font-black text-yellow-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">AdaptiveAvgPool2d</div>
                            <div className="text-[10px] text-yellow-300/60 font-bold tracking-wider uppercase mt-2">Output: 1x1</div>
                        </div>

                        {/* Flatten */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-48 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300 cursor-help z-10"
                            style={{
                                top: cy(pos.flatten) - 24,
                                ...nodeBaseStyle
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Flatten', 'Reshapes the tensor into a vector.', 'text-gray-300')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-gray-200 text-xs font-black tracking-widest uppercase">Flatten</span>
                        </div>

                        {/* LayerNorm */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-48 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300 cursor-help z-10"
                            style={{
                                top: cy(pos.ln) - 24,
                                ...nodeBaseStyle
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'LayerNorm', 'Normalizes the vector for stable classification.', 'text-gray-300')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-gray-200 text-xs font-black tracking-widest uppercase">LayerNorm</span>
                        </div>

                        {/* Linear */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-60 p-4 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300 cursor-help z-10"
                            style={{
                                top: cy(pos.linear) - 48,
                                ...nodeBaseStyle,
                                border: '2px solid rgba(234, 179, 8, 0.4)',
                                boxShadow: '0 0 30px rgba(234, 179, 8, 0.15), inset 0 0 20px rgba(234, 179, 8, 0.05)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Linear (FC)', 'Fully Connected layer. Maps features to class scores.', 'text-yellow-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="text-base font-black text-yellow-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">Linear (FC)</div>
                            <div className="text-[10px] text-yellow-300/60 font-bold tracking-wider uppercase mt-2">Output: Num Classes</div>
                        </div>

                        {/* Output Node */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-full h-8 cursor-help z-20"
                            style={{ top: cy(pos.output) - 16 }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Probabilities', 'Final class probabilities (after Softmax).', 'text-yellow-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] z-20"></div>
                            <span className="absolute left-[calc(50%+20px)] text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Probabilities</span>
                            {/* Glow Overlay */}
                            <div className="absolute left-[calc(50%+20px)] flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase whitespace-nowrap opacity-0" style={{ mask: 'url(#head-flow-mask)', filter: 'drop-shadow(0 0 8px white)' }}>Probabilities</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};
