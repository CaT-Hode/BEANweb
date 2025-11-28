

const ArchitectureUltimate = () => {
    const [level, setLevel] = React.useState(0); // 0: Total, 1: Block/Detail, 2: Processor
    const [selection, setSelection] = React.useState({ section: 'stages', processor: 'efficient' }); // section: 'stem' | 'stages' | 'head'
    const [animDir, setAnimDir] = React.useState('none'); // 'up' | 'down' | 'none'
    const [animScope, setAnimScope] = React.useState('section'); // 'section' | 'processor'
    const containerRef = React.useRef(null);

    // --- Layout Constants ---
    // Optimized for smooth morphing.
    // Level 0: Total (100%) | Block (0%) | Processor (0%)
    // Level 1: Total (20%) | Block (80%) | Processor (0%)
    // Level 2: Total (15%) | Block (25%) | Processor (60%)
    // Key: Widths and Left positions interpolate smoothly.
    const layouts = [
        // Level 0: Total View
        [
            { left: 0, width: 100, opacity: 1, zIndex: 30 },   // Panel 0 (Total)
            { left: 100, width: 80, opacity: 0, zIndex: 20 },  // Panel 1 (Block) - Hidden off-screen
            { left: 180, width: 60, opacity: 0, zIndex: 10 }   // Panel 2 (Processor) - Hidden off-screen
        ],
        // Level 1: Block/Detail View
        [
            { left: 0, width: 20, opacity: 1, zIndex: 30 },    // Panel 0 (Total) - Sidebar
            { left: 20, width: 80, opacity: 1, zIndex: 20 },   // Panel 1 (Block) - Main
            { left: 100, width: 60, opacity: 0, zIndex: 10 }   // Panel 2 (Processor) - Hidden off-screen
        ],
        // Level 2: Processor View
        [
            { left: 0, width: 15, opacity: 1, zIndex: 30 },    // Panel 0 (Total) - Sidebar Compact
            { left: 15, width: 25, opacity: 1, zIndex: 20 },   // Panel 1 (Block) - Sidebar
            { left: 40, width: 60, opacity: 1, zIndex: 10 }    // Panel 2 (Processor) - Main
        ]
    ];

    const currentLayout = layouts[level];

    const sectionOrder = ['stem', 'stages', 'head'];
    const processorOrder = ['efficient', 'performance'];

    // --- Handlers ---
    const handleSelectSection = (section) => {
        if (level > 0 && selection.section === section) {
            // Toggle off (go back to level 0)
            setLevel(0);
        } else {
            // Switch or Open
            const oldIndex = sectionOrder.indexOf(selection.section);
            const newIndex = sectionOrder.indexOf(section);
            
            let dir = 'none';
            if (level > 0 && section !== selection.section) {
                 dir = newIndex > oldIndex ? 'up' : 'down';
            }

            setAnimDir(dir);
            setAnimScope('section');
            setSelection(prev => ({ ...prev, section }));
            setLevel(1);
        }
    };

    const handleSelectProcessor = (processor) => {
        if (level > 1 && selection.processor === processor) {
            // Toggle off (go back to level 1)
            setLevel(1);
        } else {
            // Switch or Open
            const oldIndex = processorOrder.indexOf(selection.processor);
            const newIndex = processorOrder.indexOf(processor);
            
            let dir = 'none';
            if (level > 1 && processor !== selection.processor) {
                dir = newIndex > oldIndex ? 'up' : 'down';
            }

            setAnimDir(dir);
            setAnimScope('processor');
            setSelection(prev => ({ ...prev, processor }));
            setLevel(2);
        }
    };

    const [hoverInfo, setHoverInfo] = React.useState(null);

    // --- Tooltip Animation Lock ---
    const isAnimating = React.useRef(false);
    const pendingHover = React.useRef(null);

    const updateHoverInfo = (info) => {
        pendingHover.current = info;
        if (!isAnimating.current) {
            setHoverInfo(info);
        }
    };

    React.useEffect(() => {
        // Lock tooltips during level transitions
        setHoverInfo(null);
        isAnimating.current = true;
        const timer = setTimeout(() => {
            isAnimating.current = false;
            // Check if we should trigger a pending hover
            if (pendingHover.current) {
                setHoverInfo(pendingHover.current);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [level]);

    const handleProcessorHover = (info) => {
        if (!info) {
            updateHoverInfo(null);
            return;
        }

        // info contains { x, y, title, content } relative to the Processor panel
        // We need to adjust x based on the Processor panel's current left position
        // The Processor panel is at `currentLayout[2].left` percentage of the container width
        
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const panelLeftPx = (currentLayout[2].left / 100) * containerWidth;
            
            updateHoverInfo({
                ...info,
                x: panelLeftPx + info.x,
                // y is already relative to the top of the panel, which is top of container
            });
        }
    };

    const handleTotalHover = (info) => {
        if (!info) {
            updateHoverInfo(null);
            return;
        }

        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const panelLeftPx = (currentLayout[0].left / 100) * containerWidth;
            
            updateHoverInfo({
                ...info,
                x: panelLeftPx + info.x,
            });
        }
    };

    const handleBlockHover = (info) => {
        if (!info) {
            updateHoverInfo(null);
            return;
        }

        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const panelLeftPx = (currentLayout[1].left / 100) * containerWidth;
            
            updateHoverInfo({
                ...info,
                x: panelLeftPx + info.x,
            });
        }
    };

    return (
        <div ref={containerRef} 
             className="w-full relative overflow-hidden bg-transparent"
             style={{ height: level === 0 ? '600px' : (level === 1 ? '684px' : '684px') }}
        >
            <style>{`
                @keyframes slideInUpShort {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes slideInDownShort {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes borderSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes borderSpinRev {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes pulseOpacity {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-slide-in-up { animation: slideInUpShort 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-in-down { animation: slideInDownShort 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            {/* Global Tooltip - Premium Apple Style */}
            {hoverInfo && (
                <div 
                    className="absolute z-[9999] pointer-events-none transition-all duration-100 ease-out"
                    style={{ 
                        left: hoverInfo.x, 
                        top: hoverInfo.y,
                        transform: 'translateY(-50%)' 
                    }}
                >
                    {/* Glass Container - Simple & Clean */}
                    <div 
                        className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-slide-in-up border border-white/10"
                        style={{ 
                            backgroundColor: 'rgba(10, 10, 15, 0.1)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        }}
                    >
                        <div className="relative p-4 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
                            {/* Header */}
                            <div className="mb-2">
                                <h4 className={`text-lg font-black tracking-widest uppercase ${hoverInfo.colorClass || 'text-white'} drop-shadow-md font-sf-pro`}>
                                    {hoverInfo.title}
                                </h4>
                            </div>
                            
                            {/* Description */}
                            <div 
                                className="text-[14px] text-gray-200 leading-relaxed font-light tracking-wide drop-shadow-md"
                                style={{ maxWidth: hoverInfo.width ? `${hoverInfo.width}px` : '200px' }}
                            >
                                {hoverInfo.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Panel 0: Total */}
            <div 
                className="absolute top-0 bottom-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-white/5 bg-transparent overflow-y-auto no-scrollbar"
                style={{ 
                    left: `${currentLayout[0].left}%`, 
                    width: `${currentLayout[0].width}%`, 
                    opacity: currentLayout[0].opacity,
                    zIndex: currentLayout[0].zIndex 
                }}
            >
                <ArchitectureTotal 
                    isCompressed={level > 0} 
                    selection={selection} 
                    onSelectSection={handleSelectSection}
                    onHover={handleTotalHover}
                />
            </div>

            {/* Panel 1: Block or Stem/Head Detail */}
            <div 
                className="absolute top-0 bottom-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-white/5 bg-transparent overflow-y-auto no-scrollbar"
                style={{ 
                    left: `${currentLayout[1].left}%`, 
                    width: `${currentLayout[1].width}%`, 
                    opacity: currentLayout[1].opacity,
                    zIndex: currentLayout[1].zIndex
                }}
            >
                <div key={selection.section} className={`w-full h-full ${animScope === 'section' ? (animDir === 'up' ? 'animate-slide-in-up' : (animDir === 'down' ? 'animate-slide-in-down' : '')) : ''}`}>
                    {selection.section === 'stages' ? (
                        <ArchitectureBlock 
                            isCompressed={level > 1} 
                            selection={selection} 
                            onSelectProcessor={handleSelectProcessor}
                            onHover={handleBlockHover}
                        />
                    ) : selection.section === 'stem' ? (
                        <ArchitectureStem onHover={handleBlockHover} />
                    ) : (
                        <ArchitectureHead onHover={handleBlockHover} />
                    )}
                </div>
            </div>

            {/* Panel 2: Processor (Only for Stages) */}
            <div 
                className="absolute top-0 bottom-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-transparent overflow-y-auto no-scrollbar"
                style={{ 
                    left: `${currentLayout[2].left}%`, 
                    width: `${currentLayout[2].width}%`, 
                    opacity: currentLayout[2].opacity,
                    zIndex: currentLayout[2].zIndex
                }}
            >
                {selection.section === 'stages' && (
                    <div key={selection.processor} className={`w-full h-full ${animScope === 'processor' ? (animDir === 'up' ? 'animate-slide-in-up' : (animDir === 'down' ? 'animate-slide-in-down' : '')) : ''}`}>
                        <ArchitectureProcessor 
                            selection={selection} 
                            setLevel={setLevel} 
                            onHover={handleProcessorHover}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

