const { useState, useEffect, useRef } = React;

const ArchitectureStem = ({ onHover }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
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
        conv: 0.18,
        bn: 0.31,
        relu: 0.44,
        output: 0.57
    };

    const strokeColor = "#4b5563"; // gray-600
    const activeColor = "#22c55e"; // green-500
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
                    <div className="text-[10px] text-green-400 font-medium tracking-[0.3em] mb-2 uppercase opacity-80">Input Processing</div>
                    <h3 className="text-3xl font-thin text-white tracking-[0.2em]">STEM</h3>
                </div>
            </div>

            {/* Diagram Container */}
            <div className="flex-1 relative w-full h-full overflow-hidden font-sans select-none">
                {width > 0 && (
                    <div className="relative w-full" style={{ height: height }}>
                        
                        {/* --- SVG Connections --- */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <defs>
                                <linearGradient id="stem-flow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                                    <stop offset="20%" stopColor="white" stopOpacity="0" />
                                    <stop offset="40%" stopColor="white" stopOpacity="1" />
                                    <stop offset="60%" stopColor="white" stopOpacity="1" />
                                    <stop offset="80%" stopColor="white" stopOpacity="0" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                                <mask id="stem-flow-mask">
                                    <rect x="0" y="-50%" width="100%" height="50%" fill="url(#stem-flow-gradient)">
                                        <animate attributeName="y" from="-50%" to="100%" dur="4s" repeatCount="indefinite" />
                                    </rect>
                                </mask>
                                {/* Flow Marker */}
                                <marker id="arrow-flow-stem" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,3 L3,1.5 z" fill="#22c55e" />
                                </marker>
                            </defs>

                            {/* Static Lines */}
                            <g style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.15))' }}>
                                <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.conv)} stroke={strokeColor} strokeWidth={strokeWidth} />
                                <line x1={cx} y1={cy(pos.conv)} x2={cx} y2={cy(pos.bn)} stroke={strokeColor} strokeWidth={strokeWidth} />
                                <line x1={cx} y1={cy(pos.bn)} x2={cx} y2={cy(pos.relu)} stroke={strokeColor} strokeWidth={strokeWidth} />
                                <line x1={cx} y1={cy(pos.relu)} x2={cx} y2={cy(pos.output)} stroke={strokeColor} strokeWidth={strokeWidth} />
                            </g>

                            {/* Animated Flow */}
                            <g className="flow-overlay" style={{ pointerEvents: 'none', color: activeColor, mask: 'url(#stem-flow-mask)', filter: 'drop-shadow(0 0 8px currentColor)' }} stroke="currentColor" strokeWidth="4" fill="none">
                                <line x1={cx} y1={cy(pos.input)} x2={cx} y2={cy(pos.conv)} />
                                <line x1={cx} y1={cy(pos.conv)} x2={cx} y2={cy(pos.bn)} />
                                <line x1={cx} y1={cy(pos.bn)} x2={cx} y2={cy(pos.relu)} />
                                <line x1={cx} y1={cy(pos.relu)} x2={cx} y2={cy(pos.output)} markerEnd="url(#arrow-flow-stem)" />
                            </g>
                        </svg>

                        {/* --- Nodes --- */}

                        {/* Input Node */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-full h-8 cursor-help z-20"
                            style={{ top: cy(pos.input) - 16 }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Image Input', 'Raw input image tensor (e.g., 224x224x3).', 'text-green-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20"></div>
                            <span className="absolute left-[calc(50%+20px)] text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Image Input</span>
                            {/* Glow Overlay */}
                            <div className="absolute left-[calc(50%+20px)] flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase whitespace-nowrap opacity-0" style={{ mask: 'url(#stem-flow-mask)', filter: 'drop-shadow(0 0 8px white)' }}>Image Input</span>
                            </div>
                        </div>

                        {/* Conv2d Module */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-60 p-4 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300 cursor-help z-10"
                            style={{
                                top: cy(pos.conv) - 48, // Approx half height
                                ...nodeBaseStyle,
                                border: '2px solid rgba(34, 197, 94, 0.4)',
                                boxShadow: '0 0 30px rgba(34, 197, 94, 0.15), inset 0 0 20px rgba(34, 197, 94, 0.05)'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Conv2d 4x4', 'Primary feature extraction. Reduces spatial dimensions by 4x using a stride of 4.', 'text-green-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="text-base font-black text-green-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">Conv2d 4x4</div>
                            <div className="text-[10px] text-green-300/60 font-bold tracking-wider uppercase mt-2">Stride=4, Padding=0</div>
                        </div>

                        {/* BatchNorm */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-48 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300 cursor-help z-10"
                            style={{
                                top: cy(pos.bn) - 24,
                                ...nodeBaseStyle
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'BatchNorm2d', 'Normalizes the output of the convolution to stabilize training.', 'text-gray-300')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-gray-200 text-xs font-black tracking-widest uppercase">BatchNorm2d</span>
                        </div>

                        {/* ReLU */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-48 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300 cursor-help z-10"
                            style={{
                                top: cy(pos.relu) - 24,
                                ...nodeBaseStyle
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'ReLU', 'Rectified Linear Unit. Introduces non-linearity.', 'text-gray-300')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="text-gray-200 text-xs font-black tracking-widest uppercase">ReLU</span>
                        </div>

                        {/* Output Node */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-full h-8 cursor-help z-20"
                            style={{ top: cy(pos.output) - 16 }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Stem Features', 'Initial feature maps passed to the first BEAN stage.', 'text-green-400')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20"></div>
                            <span className="absolute left-[calc(50%+20px)] text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Features</span>
                            {/* Glow Overlay */}
                            <div className="absolute left-[calc(50%+20px)] flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase whitespace-nowrap opacity-0" style={{ mask: 'url(#stem-flow-mask)', filter: 'drop-shadow(0 0 8px white)' }}>Features</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};
