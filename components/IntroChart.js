

const IntroChart = () => {
    const [hoveredSeries, setHoveredSeries] = React.useState(null);
    const [hoveredPoint, setHoveredPoint] = React.useState(null);
    
    const minLog = Math.log10(3); 
    const maxLog = Math.log10(110);
    const mapX = (val) => ((Math.log10(val) - minLog) / (maxLog - minLog)) * 100;
    const mapY = (val) => ((val - 50) / (85 - 50)) * 100; // Adjusted Y range for better visibility of lower acc models

    const lastPos = React.useRef({ left: '50%', top: '50%' });
    if (hoveredPoint) {
        lastPos.current = {
            left: `${Math.min(Math.max(mapX(hoveredPoint.x), 10), 80)}%`,
            top: `${Math.min(100 - mapY(hoveredPoint.y) + 5, 80)}%`
        };
    }

    const series = [
        { 
            name: 'BEANet (Ours)', 
            color: '#ef4444', 
            width: 4, 
            data: [
                {x:4.09, y:66.8, label:'Nano'}, 
                {x:5.4, y:70.5, label:'Tiny'}, 
                {x:7.53, y:72.4, label:'Small'}, 
                {x:10.5, y:74.6, label:'Medium'}, 
                {x:17.0, y:77.1, label:'Large'}
            ] 
        },
        { 
            name: 'BNext', 
            color: '#94a3b8', 
            width: 2, 
            dash: '5,5', 
            data: [
                {x:5.4, y:68.4, label:'18'}, 
                {x:13.3, y:72.4, label:'Tiny'}, 
                {x:26.7, y:76.1, label:'Small'},
                {x:45.4, y:78.5, label:'Middle'},
                {x:82.3, y:80.6, label:'Large'}
            ] 
        },
        { 
            name: 'AdaBin', 
            color: '#f59e0b', 
            width: 2, 
            dash: '5,5', 
            data: [
                {x:4.35, y:66.4, label:'18'}, 
                {x:7.9, y:70.4, label:'A'}, 
                {x:17.4, y:71.6, label:'59'}
            ] 
        },
        { 
            name: 'Bi-Real', 
            color: '#3b82f6', 
            width: 2, 
            dash: '5,5', 
            data: [
                {x:4.2, y:56.4, label:'18'}, 
                {x:5.1, y:62.2, label:'34'}
            ] 
        },
        {
            name: 'ReActNet',
            color: '#10b981',
            width: 2,
            dash: '2,2',
            data: [
                {x:7.4, y:69.4, label:'A'}
            ]
        },
        {
            name: 'XNOR-Net',
            color: '#64748b',
            width: 2,
            dash: '2,2',
            data: [{x:4.2, y:51.2, label:'18'}]
        },
        {
            name: 'RAD-BNN',
            color: '#8b5cf6',
            width: 2,
            dash: '2,2',
            data: [{x:4.3, y:65.6, label:'18'}]
        },
        {
            name: 'ReCU',
            color: '#ec4899',
            width: 2,
            dash: '2,2',
            data: [{x:5.1, y:65.1, label:'34'}]
        },
        {
            name: 'APD-BNN',
            color: '#14b8a6',
            width: 2,
            dash: '2,2',
            data: [{x:5.4, y:66.8, label:'34'}]
        },
        {
            name: 'INSTA-BNN+',
            color: '#f43f5e',
            width: 2,
            dash: '2,2',
            data: [{x:8.9, y:72.2, label:'18'}]
        },
        {
            name: 'MeliusNet',
            color: '#84cc16',
            width: 2,
            dash: '2,2',
            data: [{x:17.4, y:71.0, label:'59'}]
        }
    ];

    return (
        <div className="absolute inset-0 w-full h-full p-2 flex flex-col animate-fade-in">
            <div className="flex-1 flex flex-row min-h-0 mt-4">
                <div className="w-24 relative pb-10">
                    <div className="absolute top-[68%] left+3 -translate-y-1/2 -rotate-90 whitespace-nowrap text-lg font-bold text-gray-400 font-mono tracking-widest origin-center w-full text-center">
                        ImageNet Top-1 Accuracy (%)
                    </div>
                </div>
                <div className="flex-1 relative border-l-2 border-b-2 border-gray-600 mb-10">

                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none">
                   {[50, 60, 70, 80, 85].map(v => (
                       <div key={v} className="absolute w-full h-px bg-gray-800/30" style={{bottom:`${mapY(v)}%`}}>
                           <span className="absolute -left-14 -top-3 w-12 text-right pr-2 text-sm font-bold text-gray-400 font-mono">{v}</span>
                       </div>
                   ))}
                   {[5, 10, 20, 50, 100].map(v => (
                       <div key={v} className="absolute h-full w-px bg-gray-800/30" style={{left:`${mapX(v)}%`}}>
                           <span className="absolute -bottom-8 -left-6 text-lg font-bold text-gray-400 font-mono">{v}</span>
                       </div>
                   ))}
                </div>

                {/* SVG Paths */}
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                    {series.map((s, i) => {
                        const isHovered = hoveredSeries === s.name;
                        const isDimmed = hoveredSeries && hoveredSeries !== s.name;
                        
                        return (
                            <g key={i} style={{opacity: isDimmed ? 0.1 : 1, transition:'all 0.3s'}}>
                                {/* Permanent Faint Glow */}
                                <path 
                                    d={`M ${s.data.map(p=>`${mapX(p.x)}% ${100-mapY(p.y)}%`).join(' L ')}`} 
                                    fill="none" 
                                    stroke={s.color} 
                                    strokeWidth={s.width * 3} 
                                    strokeOpacity={0.1}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{filter: 'blur(2px)'}}
                                />
                                {/* Glow Effect for Hovered Series */}
                                {isHovered && (
                                    <path 
                                        d={`M ${s.data.map(p=>`${mapX(p.x)}% ${100-mapY(p.y)}%`).join(' L ')}`} 
                                        fill="none" 
                                        stroke={s.color} 
                                        strokeWidth={s.width * 4} 
                                        strokeOpacity={0.2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="animate-pulse"
                                    />
                                )}
                                {/* Main Line */}
                                <path 
                                    d={`M ${s.data.map(p=>`${mapX(p.x)}% ${100-mapY(p.y)}%`).join(' L ')}`} 
                                    fill="none" 
                                    stroke={s.color} 
                                    strokeWidth={isHovered ? s.width * 1.5 : s.width} 
                                    strokeDasharray={s.dash} 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-lg transition-all duration-300" 
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Data Points with Expanded Hit Area */}
                {series.map((s) => s.data.map((p, i) => {
                    const isSeriesHovered = hoveredSeries === s.name;
                    const isPointHovered = hoveredPoint === p;
                    const isDimmed = hoveredSeries && hoveredSeries !== s.name;

                    return (
                        <div key={`${s.name}-${i}`} className="absolute" style={{ left:`${mapX(p.x)}%`, top:`${100-mapY(p.y)}%` }}>
                            {/* Visible Point */}
                            <div 
                                className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 border border-black transition-all duration-300
                                    ${isPointHovered ? 'w-4 h-4 ring-4 ring-white/20' : 'w-2.5 h-2.5'}
                                `}
                                style={{
                                    backgroundColor: s.color,
                                    opacity: isDimmed ? 0.1 : 1,
                                    transform: isPointHovered ? 'translate(-50%, -50%) scale(1.5)' : 'translate(-50%, -50%) scale(1)'
                                }} 
                            />
                            {/* Invisible Hit Area (Larger) */}
                            <div 
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 z-30 cursor-pointer"
                                onMouseEnter={() => { setHoveredSeries(s.name); setHoveredPoint(p); }} 
                                onMouseLeave={() => { setHoveredSeries(null); setHoveredPoint(null); }}
                            />
                        </div>
                    );
                }))}

                {/* Tooltip - Dynamic Position near Mouse/Point */}
                {/* Persistent Tooltip Background (Shared Animation State) */}
                {/* Tooltip - Dynamic Position near Mouse/Point */}
                {/* Persistent Tooltip Background (Shared Animation State) */}
                <div 
                    className="absolute z-40 min-w-[220px] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden group"
                    style={{
                        left: lastPos.current.left,
                        top: lastPos.current.top,
                        transform: hoveredSeries && hoveredPoint ? 'translateX(-10%) scale(1) translateY(0)' : 'translateX(-10%) scale(0.9) translateY(10px)',
                        opacity: hoveredSeries && hoveredPoint ? 1 : 0,
                        visibility: hoveredSeries && hoveredPoint ? 'visible' : 'hidden',
                        boxShadow: hoveredSeries ? `0 0 0 1px ${series.find(s=>s.name===hoveredSeries).color}40, 0 0 20px ${series.find(s=>s.name===hoveredSeries).color}20` : 'none'
                    }}
                >
                    {/* Edge Glow Gradient */}
                    <div 
                        className="absolute inset-0 opacity-50"
                        style={{
                            background: hoveredSeries ? `radial-gradient(circle at top left, ${series.find(s=>s.name===hoveredSeries).color}40, transparent 70%)` : 'none'
                        }}
                    />

                    <style>{`
                        @keyframes orbFloat1 {
                            0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                            33% { transform: translate(80%, 40%) scale(1.2); opacity: 0.5; }
                            66% { transform: translate(20%, 80%) scale(0.9); opacity: 0.3; }
                            100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                        }
                        @keyframes orbFloat2 {
                            0% { transform: translate(0, 0) scale(1.2); opacity: 0.4; }
                            33% { transform: translate(-60%, -40%) scale(1); opacity: 0.2; }
                            66% { transform: translate(-20%, -80%) scale(1.3); opacity: 0.5; }
                            100% { transform: translate(0, 0) scale(1.2); opacity: 0.4; }
                        }
                    `}</style>
                    
                    {/* Floating Blurred Orbs - Always Running */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                        <div className="absolute inset-[-50%]">
                            {/* Orb 1 - Top Left */}
                            <div 
                                className="absolute top-[-20%] left-[-20%] w-48 h-48 rounded-full animate-[orbFloat1_9s_ease-in-out_infinite]"
                                style={{
                                    backgroundColor: hoveredSeries ? series.find(s=>s.name===hoveredSeries).color : '#333',
                                    filter: 'blur(50px)',
                                    mixBlendMode: 'screen',
                                    transition: 'background-color 0.3s'
                                }}
                            />
                            {/* Orb 2 - Bottom Right */}
                            <div 
                                className="absolute bottom-[-20%] right-[-20%] w-56 h-56 rounded-full animate-[orbFloat2_11s_ease-in-out_infinite]"
                                style={{
                                    backgroundColor: hoveredSeries ? series.find(s=>s.name===hoveredSeries).color : '#333',
                                    filter: 'blur(60px)',
                                    mixBlendMode: 'screen',
                                    transition: 'background-color 0.3s'
                                }}
                            />
                        </div>
                    </div>

                    {/* Content Layer */}
                    <div className={`relative z-10 p-5 transition-opacity duration-200 ${hoveredSeries ? 'opacity-100' : 'opacity-0'}`}>
                        {hoveredSeries && hoveredPoint && (
                            <>
                                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                                    <div className="text-lg font-black uppercase tracking-wider" style={{color: series.find(s=>s.name===hoveredSeries).color, textShadow: `0 0 15px ${series.find(s=>s.name===hoveredSeries).color}60`}}>
                                        {hoveredSeries}
                                    </div>
                                    <div className="text-xs font-bold text-white/90 bg-white/10 px-2 py-1 rounded-md border border-white/10 shadow-sm backdrop-blur-md">{hoveredPoint.label}</div>
                                </div>
                                
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-4xl font-bold tracking-tighter text-white drop-shadow-md font-[Outfit]">{hoveredPoint.y}</span>
                                    <span className="text-sm font-light text-white/60">%</span>
                                </div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Top-1 Accuracy</div>

                                <div className="flex justify-between items-center bg-black/20 rounded-lg p-2 border border-white/5">
                                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Params</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-mono text-white font-bold">{hoveredPoint.x}</span>
                                        <span className="text-[10px] text-white/40 font-mono">M</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                </div>
            </div>
            <div className="text-center text-lg font-bold text-gray-400 font-mono tracking-[0.2em] mt-2">PARAMS (MB) - LOG SCALE</div>
        </div>
    );
};
