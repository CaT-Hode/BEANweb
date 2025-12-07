
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
