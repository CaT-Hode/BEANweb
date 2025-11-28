const ArchitectureTotal = ({ isCompressed, selection, onSelectSection, onHover }) => {
    const containerRef = React.useRef(null);
    const [hoveredSection, setHoveredSection] = React.useState(null);
    const ArrowDown = () => <div className="my-2 text-gray-600"><Icons.ArrowDown size={16} /></div>;

    const handleSelect = (section) => {
        onSelectSection(section);
    };

    const handleMouseEnter = (e, title, content, colorClass = 'text-white') => {
        if (!containerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate position relative to the container
        let x, y;
        
        if (isCompressed) {
            // If compressed, force tooltip to the right
            x = rect.right - containerRect.left + 20;
            y = rect.top - containerRect.top + (rect.height / 2);
        } else {
            // Standard behavior
            x = rect.right - containerRect.left + 15;
            y = rect.top - containerRect.top + (rect.height / 2);
            
            // Adjust if too close to right edge
            if (x + 200 > containerRect.width) {
                x = rect.left - containerRect.left - 215;
            }
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
        <div ref={containerRef} className={`w-full h-full flex flex-col ${isCompressed ? 'items-center justify-center py-8 relative' : 'items-center justify-center p-8'} relative overflow-hidden`}>
            {/* --- DATA FLOW ANIMATION OVERLAY --- */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <linearGradient id="total-flow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="20%" stopColor="white" stopOpacity="0" />
                        <stop offset="40%" stopColor="white" stopOpacity="1" />
                        <stop offset="60%" stopColor="white" stopOpacity="1" />
                        <stop offset="80%" stopColor="white" stopOpacity="0" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    <mask id="total-flow-mask">
                        <rect x="0" y="-50%" width="100%" height="50%" fill="url(#total-flow-gradient)">
                            <animate attributeName="y" from="-50%" to="100%" dur="3s" repeatCount="indefinite" />
                        </rect>
                    </mask>
                </defs>
                
                {/* Flow Lines - Only visible when NOT compressed or partially visible behind nodes */}
                {/* Removed static line as per request */}
                
                {/* Animated Flow */}
                <g className="flow-overlay" style={{ mask: 'url(#total-flow-mask)' }}>
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                </g>
            </svg>
            {isCompressed && (
                <div className="text-[10px] font-black text-gray-500 tracking-widest -rotate-90 absolute left-0.5 top-1/2 -translate-y-1/2 uppercase">TOTAL</div>
            )}

            {!isCompressed && (
                <div className="text-center mb-8 animate-fade-in">
                    <h3 className="text-2xl font-black text-white tracking-widest">BEANet</h3>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Hierarchical Binary Architecture</p>
                </div>
            )}

            <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${isCompressed ? 'scale-90 gap-4' : 'scale-100'}`}>
                {/* STEM */}
                <div 
                    onClick={() => handleSelect('stem')}
                    onMouseEnter={(e) => { setHoveredSection('stem'); handleMouseEnter(e, 'STEM Layer', 'Initial feature extraction using 4x4 convolution with stride 4, followed by Batch Norm and ReLU.', 'text-green-400'); }}
                    onMouseLeave={() => { setHoveredSection(null); handleMouseLeave(); }}
                    className={`relative rounded-2xl border-2 cursor-pointer magnetic-target transition-all duration-300 group flex flex-col items-center justify-center z-10
                        ${selection.section === 'stem' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-green-500/30 hover:border-green-500/60'}
                        ${isCompressed ? 'w-12 h-12 p-0' : 'w-64 p-4'}
                    `}
                    style={{ 
                        backgroundColor: (isCompressed && selection.section === 'stem') || hoveredSection === 'stem' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(20, 20, 25, 0.8)'
                    }}
                >
                    {isCompressed ? <span className="text-[10px] font-black tracking-widest text-green-400">STEM</span> : (
                        <>
                            <div className="text-sm text-green-400 font-black tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">STEM</div>
                            <div className="text-[10px] text-green-300/70 font-bold tracking-wider uppercase">Conv 4x4, s=4 + BN + ReLU</div>
                        </>
                    )}
                </div>

                {!isCompressed && <ArrowDown />}
                {isCompressed && <div className="w-px h-4 bg-gray-700"></div>}

                {/* STAGES 1-4 (Grouped) */}
                <div 
                    onClick={() => handleSelect('stages')}
                    onMouseEnter={(e) => { setHoveredSection('stages'); handleMouseEnter(e, 'BEAN Stages', 'Core processing stages containing stacked Efficient and Performance Processors for deep feature learning.', 'text-sky-400'); }}
                    onMouseLeave={() => { setHoveredSection(null); handleMouseLeave(); }}
                    className={`relative rounded-2xl border-2 cursor-pointer magnetic-target transition-all duration-300 group flex flex-col items-center justify-center z-10
                        ${selection.section === 'stages' ? 'border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.2)]' : 'border-sky-500/30 hover:border-sky-500/60'}
                        ${isCompressed ? 'w-12 h-32' : 'w-64 p-5 gap-3'}
                    `}
                    style={{ 
                        backgroundColor: (isCompressed && selection.section === 'stages') || hoveredSection === 'stages' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(20, 20, 25, 0.8)'
                    }}
                >
                    {isCompressed ? (
                        <div className="h-full flex flex-col items-center justify-between py-3">
                            <span className="text-[10px] font-black tracking-widest text-sky-400">S1</span>
                            <div className="w-px h-full bg-sky-500/30 border-l border-dashed border-sky-500"></div>
                            <span className="text-[10px] font-black tracking-widest text-sky-400">S4</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between w-full border-b border-sky-500/20 pb-2">
                                <div className="text-sm font-black text-sky-400 tracking-widest uppercase drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]">BEAN Blocks</div>
                                <Icons.ChevronRight size={16} className="text-sky-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="w-full space-y-1.5">
                                {['Stage 1 x N1', 'Stage 2 x N2', 'Stage 3 x N3', 'Stage 4 x N4'].map((s, i) => (
                                    <div key={i} className="w-full px-3 py-1.5 bg-sky-900/10 rounded-lg text-[10px] text-sky-200/80 font-bold tracking-wider uppercase border border-sky-500/20 text-center hover:bg-sky-900/20 transition-colors">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {!isCompressed && <ArrowDown />}
                {isCompressed && <div className="w-px h-4 bg-gray-700"></div>}

                {/* CLASSIFIER */}
                <div 
                    onClick={() => handleSelect('head')}
                    onMouseEnter={(e) => { setHoveredSection('head'); handleMouseEnter(e, 'Classifier Head', 'Final classification layer. Uses Adaptive Average Pooling, Layer Norm, and a Fully Connected layer to produce class probabilities.', 'text-yellow-400'); }}
                    onMouseLeave={() => { setHoveredSection(null); handleMouseLeave(); }}
                    className={`relative rounded-2xl border-2 cursor-pointer magnetic-target transition-all duration-300 group flex flex-col items-center justify-center z-10
                        ${selection.section === 'head' ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-yellow-500/30 hover:border-yellow-500/60'}
                        ${isCompressed ? 'w-12 h-12 p-0' : 'w-64 p-4'}
                    `}
                    style={{ 
                        backgroundColor: (isCompressed && selection.section === 'head') || hoveredSection === 'head' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(20, 20, 25, 0.8)'
                    }}
                >
                    {isCompressed ? <span className="text-[10px] font-black tracking-widest text-yellow-400">HEAD</span> : (
                        <>
                            <div className="text-sm text-yellow-400 font-black tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">Classifier</div>
                            <div className="text-[10px] text-yellow-300/70 font-bold tracking-wider uppercase">AdaptiveAvgPool + LN + FC</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
