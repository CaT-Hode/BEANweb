


const BEANetHighlights = ({ isActive, goToPage, togglePageAudio }) => {
    const [mounted, setMounted] = React.useState(false);
    const [isLandscape, setIsLandscape] = React.useState(false);
    const [gridStyle, setGridStyle] = React.useState({});
    const cardsContainerRef = React.useRef(null);
    const animationFrameRef = React.useRef(null);

    React.useEffect(() => {
        const updateLayout = () => {
            const landscape = window.innerWidth > window.innerHeight;
            setIsLandscape(landscape);
            
            if (landscape) {
                // Calculate available height (viewport height minus padding)
                const availableHeight = window.innerHeight - 100; // Increased padding for footer visibility
                const availableWidth = window.innerWidth - 64;
                
                // Calculate grid dimensions based on 16/11 aspect ratio
                const aspectRatio = 16 / 11;
                let gridWidth = availableWidth;
                let gridHeight = gridWidth / aspectRatio;
                
                // If height exceeds available, constrain by height
                if (gridHeight > availableHeight) {
                    gridHeight = availableHeight;
                    gridWidth = gridHeight * aspectRatio;
                }
                
                setGridStyle({
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                    maxWidth: '1152px' // max-w-6xl equivalent
                });
            } else {
                setGridStyle({});
            }
        };
        
        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    React.useEffect(() => {
        if (isActive) {
            // Delay to allow header to collapse before animating in
            const timer = setTimeout(() => setMounted(true), 600);
            return () => clearTimeout(timer);
        } else {
            setMounted(false);
        }
    }, [isActive]);

    const cards = [
        {
            id: 'accuracy',
            col: 'col-span-2',
            row: 'row-span-1',
            offset: { x: -60, y: -80 },
            bgGradient: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(52,211,153,0.15) 100%)',
            content: (
                <div className="flex items-center justify-center h-full gap-8 px-4">
                    {/* ImageNet */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">77.1%</div>
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">ImageNet</div>
                        <div className="text-[9px] text-green-400 font-mono bg-green-900/20 px-2 py-0.5 rounded border border-green-500/30">
                            Top-1 SOTA
                        </div>
                    </div>
                    {/* Divider */}
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                    {/* CIFAR-10 */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">93.80%</div>
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">CIFAR-10</div>
                        <div className="text-[9px] text-emerald-400 font-mono">Top-1 Accuracy</div>
                    </div>
                </div>
            )
        },
        {
            id: 'bw',
            col: 'col-span-1',
            row: 'row-span-1',
            offset: { x: 40, y: -100 },
            bgColor: 'rgba(14,165,233,0.12)',
            content: (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="text-4xl font-black text-sky-400 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">32×</div>
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-widest text-center">Bandwidth</div>
                    <div className="text-[10px] text-gray-500 font-mono">FP32 vs Binary</div>
                </div>
            )
        },
        {
            id: 'sota',
            col: 'col-span-1',
            row: 'row-span-1',
            offset: { x: 80, y: -80 },
            bgColor: 'rgba(248,113,113,0.12)',
            content: (
                <div className="flex flex-col items-center justify-center h-full gap-1">
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">+</span>
                        <span className="text-4xl font-black text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]">2.3%</span>
                    </div>
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-widest text-center">vs ReActNet</div>
                    <div className="text-[10px] text-gray-500">Accuracy Boost</div>
                </div>
            )
        },
        {
            id: 'block',
            col: 'col-span-1',
            row: 'row-span-2',
            offset: { x: -100, y: 0 },
            bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(251,191,36,0.15) 100%)',
            content: (
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Ultra-minimal Abstract Architecture - No text, pure geometry */}
                    {/* Maximized size to fill the module */}
                    <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 80 120" preserveAspectRatio="xMidYMid meet" style={{overflow: 'visible'}}>
                        <defs>
                            {/* Flow animation gradient */}
                            <linearGradient id="aceFlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="white" stopOpacity="0" />
                                <stop offset="30%" stopColor="white" stopOpacity="1" />
                                <stop offset="70%" stopColor="white" stopOpacity="1" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                            <mask id="aceFlowMask">
                                <rect x="-20" y="-50" width="120" height="50" fill="url(#aceFlowGrad)">
                                    <animate attributeName="y" from="-50" to="140" dur="6s" repeatCount="indefinite" />
                                </rect>
                            </mask>
                            {/* Second flow for shortcut paths */}
                            <mask id="aceFlowMask2">
                                <rect x="-20" y="-50" width="120" height="50" fill="url(#aceFlowGrad)">
                                    <animate attributeName="y" from="-50" to="140" dur="6s" begin="1s" repeatCount="indefinite" />
                                </rect>
                            </mask>
                        </defs>
                        
                        {/* Static structure - minimal lines */}
                        {/* Main vertical spine */}
                        <line x1="40" y1="10" x2="40" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                        
                        {/* Processor 1 - Circle (Efficient) */}
                        <circle cx="40" cy="35" r="12" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.3)" strokeWidth="1" />
                        
                        {/* Processor 2 - Circle (Performance) */}
                        <circle cx="40" cy="75" r="12" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="3 2" />
                        
                        {/* Shortcut 1 - smooth left arc (bypasses processor 1) - taller arc */}
                        <path d="M 40 18 C 8 18 8 55 40 55" fill="none" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" strokeDasharray="3 2" />
                        
                        {/* Shortcut 2 - smooth right arc (bypasses processor 2) - taller arc */}
                        <path d="M 40 55 C 72 55 72 95 40 95" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" strokeDasharray="3 2" />
                        
                        {/* Add nodes */}
                        <circle cx="40" cy="55" r="3" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.5)" strokeWidth="0.5" />
                        <circle cx="40" cy="95" r="3" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.5)" strokeWidth="0.5" />
                        
                        {/* Animated main flow - glowing data stream */}
                        {/* Glow layer - not masked, always visible but faint */}
                        <g stroke="#38bdf8" strokeWidth="4" fill="none" opacity="0.3" style={{filter: 'blur(3px)'}}>
                            <line x1="40" y1="10" x2="40" y2="110" />
                            <circle cx="40" cy="35" r="12" />
                            <circle cx="40" cy="75" r="12" />
                        </g>
                        
                        {/* Animated flow layer - masked */}
                        <g mask="url(#aceFlowMask)" stroke="#38bdf8" strokeWidth="3" fill="none">
                            <line x1="40" y1="10" x2="40" y2="23" />
                            <circle cx="40" cy="35" r="12" strokeWidth="2.5" />
                            <line x1="40" y1="47" x2="40" y2="55" />
                            <line x1="40" y1="55" x2="40" y2="63" />
                            <circle cx="40" cy="75" r="12" strokeWidth="2.5" />
                            <line x1="40" y1="87" x2="40" y2="95" />
                            <line x1="40" y1="95" x2="40" y2="110" />
                        </g>
                        
                        {/* Shortcut glow layer - not masked */}
                        <g strokeWidth="3" fill="none" opacity="0.3" style={{filter: 'blur(3px)'}}>
                            <path d="M 40 18 C 8 18 8 55 40 55" stroke="#38bdf8" />
                            <path d="M 40 55 C 72 55 72 95 40 95" stroke="#a855f7" />
                        </g>
                        
                        {/* Animated shortcut flows - masked */}
                        <g mask="url(#aceFlowMask2)" strokeWidth="2.5" fill="none">
                            <path d="M 40 18 C 8 18 8 55 40 55" stroke="#38bdf8" />
                            <path d="M 40 55 C 72 55 72 95 40 95" stroke="#a855f7" />
                        </g>
                    </svg>
                    
                    {/* Text overlay - large stacked vertically */}
                    <div className="relative z-10 flex flex-col items-center leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                        <div className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300 tracking-tight">BEAN</div>
                        <div className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-400 tracking-tight">Block</div>
                    </div>
                </div>
            )
        },
        {
            id: 'brand',
            col: 'col-span-2',
            row: 'row-span-2',
            offset: { x: 0, y: 0 },
            delay: 200,
            style: { zIndex: 10 },
            bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(236,72,153,0.12) 25%, rgba(139,92,246,0.12) 50%, rgba(59,130,246,0.12) 75%, rgba(16,185,129,0.12) 100%)',
            content: (
                <div className="flex flex-col items-center justify-center h-full relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div 
                        className="text-8xl md:text-8xl font-black tracking-tight relative z-10 bg-clip-text text-transparent"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f97316)',
                            backgroundSize: '200% 100%',
                            animation: 'gradientShift 4s ease-in-out infinite',
                            letterSpacing: '-0.02em',
                            fontSize: !isLandscape ? 'calc(6rem * 0.98)' : undefined
                        }}
                    >
                        BEANet
                    </div>
                    <div className="text-m text-gray-500 tracking-widest mt-3 relative z-10 font-light">Binary Enhanced Adaptive Network</div>
                    <style>{`
                        @keyframes gradientShift {
                            0%, 100% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                        }
                    `}</style>
                </div>
            )
        },
        {
            id: 'exste',
            col: 'col-span-1',
            row: 'row-span-1',
            offset: { x: 100, y: -40 },
            bgGradient: 'linear-gradient(135deg, rgba(74,222,128,0.15) 0%, rgba(52,211,153,0.15) 100%)',
            content: (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Animated SVG Background - Full size */}
                    <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 60" preserveAspectRatio="none">
                        <path d="M 0 50 Q 25 45 50 30 Q 75 15 100 10" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round">
                            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M 0 50 Q 25 45 50 30 Q 75 15 100 10; M 0 48 Q 25 42 50 28 Q 75 18 100 12; M 0 50 Q 25 45 50 30 Q 75 15 100 10" />
                        </path>
                        <path d="M 0 45 Q 20 40 35 22 Q 50 5 65 22 Q 80 40 100 45" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3">
                            <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M 0 45 Q 20 40 35 22 Q 50 5 65 22 Q 80 40 100 45; M 0 48 Q 20 42 35 25 Q 50 8 65 25 Q 80 42 100 48; M 0 45 Q 20 40 35 22 Q 50 5 65 22 Q 80 40 100 45" />
                        </path>
                    </svg>
                    
                    {/* Text overlay with shadow */}
                    <div className="relative z-10 text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        ExSTE
                    </div>
                </div>
            )
        },
        {
            id: 'distill',
            col: 'col-span-1',
            row: 'row-span-1',
            offset: { x: 100, y: 40 },
            bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 100%)',
            content: (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Animated SVG Background - Full size */}
                    <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
                        <path d="M 15 12 Q 50 30 85 48" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeDasharray="5 4">
                            <animate attributeName="stroke-dashoffset" from="9" to="0" dur="4s" repeatCount="indefinite" />
                        </path>
                        <circle cx="12" cy="10" r="10" fill="rgba(168,85,247,0.2)" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5">
                            <animate attributeName="r" values="10;11;10" dur="6s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="88" cy="50" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                            <animate attributeName="r" values="8;9;8" dur="6s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                    
                    {/* Text overlay with shadow */}
                    <div className="relative z-10 text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        Distill
                    </div>
                </div>
            )
        },
        {
            id: 'arch',
            col: 'col-span-1',
            row: 'row-span-1',
            offset: { x: -80, y: 80 },
            bgGradient: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(168,85,247,0.15) 100%)',
            content: (
                <div className="relative flex flex-col items-center justify-center h-full text-center p-2 overflow-hidden">
                    <style>{`
                        @keyframes electricFlow {
                            0% { -webkit-mask-position: 250% 0; mask-position: 250% 0; }
                            100% { -webkit-mask-position: -150% 0; mask-position: -150% 0; }
                        }
                        @keyframes dataFlow {
                            0% { -webkit-mask-position: 0% 250%; mask-position: 0% 250%; }
                            100% { -webkit-mask-position: 0% -150%; mask-position: 0% -150%; }
                        }
                    `}</style>

                    {/* Background Layer: Symmetrical Icons with Flowing Light */}
                    <div className="absolute inset-0 flex flex-row justify-center items-center gap-16 pointer-events-none select-none overflow-visible">
                        
                        {/* Lightning - Left - Electric Flow */}
                        <div className="relative transform translate-x-0 shrink-0">
                             {/* Base Layer */}
                             <Icons.Zap width={60} height={60} className="text-sky-900/10" strokeWidth={1.5} />
                             {/* Highlight/Flow Layer - Expanded to prevent clip */}
                             <div className="absolute -inset-8 text-sky-400 flex items-center justify-center" style={{
                                 maskImage: 'linear-gradient(115deg, transparent 35%, black 50%, transparent 65%)',
                                 WebkitMaskImage: 'linear-gradient(115deg, transparent 35%, black 50%, transparent 65%)',
                                 maskSize: '200% 100%',
                                 WebkitMaskSize: '200% 100%',
                                 maskRepeat: 'no-repeat',
                                 WebkitMaskRepeat: 'no-repeat',
                                 animation: 'electricFlow 8s linear infinite'
                             }}>
                                 <Icons.Zap width={60} height={60} strokeWidth={2} className="drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                             </div>
                        </div>

                        {/* Chip - Right - Data Scan */}
                        <div className="relative transform translate-x-0 shrink-0">
                             {/* Base Layer */}
                             <Icons.Cpu width={60} height={60} className="text-purple-900/10" strokeWidth={1.5} />
                             {/* Highlight/Flow Layer - Expanded to prevent clip */}
                             <div className="absolute -inset-8 text-purple-400 flex items-center justify-center" style={{
                                 maskImage: 'linear-gradient(180deg, transparent 35%, black 50%, transparent 65%)',
                                 WebkitMaskImage: 'linear-gradient(180deg, transparent 35%, black 50%, transparent 65%)',
                                 maskSize: '100% 200%',
                                 WebkitMaskSize: '100% 200%',
                                 maskRepeat: 'no-repeat',
                                 WebkitMaskRepeat: 'no-repeat',
                                 animation: 'dataFlow 10s linear infinite'
                             }}>
                                 <Icons.Cpu width={60} height={60} strokeWidth={2} className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                             </div>
                        </div>
                    </div>

                    {/* Title Overlay */}
                    <div className="relative z-10 flex flex-col items-center justify-center leading-none">
                        <div className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                            ACE
                        </div>
                        <div className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-sky-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            Processor
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'adabin',
            col: 'col-span-2',
            row: 'row-span-1',
            offset: { x: 0, y: 100 },
            bgGradient: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(34,211,238,0.15) 100%)',
            content: (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* 2D Histogram Bar Chart with animated threshold splitting */}
                    <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 200 60" preserveAspectRatio="none">
                        <defs>
                            {/* Clip path for left side (red) - animated */}
                            <clipPath id="adabinLeftClip">
                                <rect x="0" y="0" width="100" height="60">
                                    <animate attributeName="width" values="100;120;100;80;100" dur="40s" repeatCount="indefinite" />
                                </rect>
                            </clipPath>
                            {/* Clip path for right side (blue) - animated, wider to ensure full coverage */}
                            <clipPath id="adabinRightClip">
                                <rect x="100" y="0" width="200" height="60">
                                    <animate attributeName="x" values="100;120;100;80;100" dur="40s" repeatCount="indefinite" />
                                </rect>
                            </clipPath>
                        </defs>
                        
                        {/* Bar positions - RED layer (clipped to left of threshold) */}
                        <g clipPath="url(#adabinLeftClip)">
                            <rect x="15" y="38" width="12" height="22" fill="rgba(244,63,94,0.5)" rx="1" />
                            <rect x="32" y="25" width="12" height="35" fill="rgba(244,63,94,0.55)" rx="1" />
                            <rect x="49" y="12" width="12" height="48" fill="rgba(244,63,94,0.6)" rx="1" />
                            <rect x="66" y="5" width="12" height="55" fill="rgba(244,63,94,0.65)" rx="1" />
                            <rect x="83" y="10" width="12" height="50" fill="rgba(244,63,94,0.6)" rx="1" />
                            <rect x="100" y="18" width="12" height="42" fill="rgba(244,63,94,0.55)" rx="1" />
                            <rect x="117" y="8" width="12" height="52" fill="rgba(244,63,94,0.6)" rx="1" />
                            <rect x="134" y="3" width="12" height="57" fill="rgba(244,63,94,0.65)" rx="1" />
                            <rect x="151" y="12" width="12" height="48" fill="rgba(244,63,94,0.55)" rx="1" />
                            <rect x="168" y="25" width="12" height="35" fill="rgba(244,63,94,0.5)" rx="1" />
                        </g>
                        
                        {/* Bar positions - BLUE layer (clipped to right of threshold) */}
                        <g clipPath="url(#adabinRightClip)">
                            <rect x="15" y="38" width="12" height="22" fill="rgba(56,189,248,0.5)" rx="1" />
                            <rect x="32" y="25" width="12" height="35" fill="rgba(56,189,248,0.55)" rx="1" />
                            <rect x="49" y="12" width="12" height="48" fill="rgba(56,189,248,0.6)" rx="1" />
                            <rect x="66" y="5" width="12" height="55" fill="rgba(56,189,248,0.65)" rx="1" />
                            <rect x="83" y="10" width="12" height="50" fill="rgba(56,189,248,0.6)" rx="1" />
                            <rect x="100" y="18" width="12" height="42" fill="rgba(56,189,248,0.55)" rx="1" />
                            <rect x="117" y="8" width="12" height="52" fill="rgba(56,189,248,0.6)" rx="1" />
                            <rect x="134" y="3" width="12" height="57" fill="rgba(56,189,248,0.65)" rx="1" />
                            <rect x="151" y="12" width="12" height="48" fill="rgba(56,189,248,0.55)" rx="1" />
                            <rect x="168" y="25" width="12" height="35" fill="rgba(56,189,248,0.5)" rx="1" />
                        </g>
                        
                        {/* Threshold line (green, dashed, animated left-right) */}
                        <line x1="100" y1="0" x2="100" y2="60" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="5 3">
                            <animate attributeName="x1" values="100;120;100;80;100" dur="40s" repeatCount="indefinite" />
                            <animate attributeName="x2" values="100;120;100;80;100" dur="40s" repeatCount="indefinite" />
                        </line>
                    </svg>
                    
                    {/* Text overlay with enhanced shadow - Larger & Multiline */}
                    <div className="relative z-10 text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-[0.9] break-words max-w-full">
                        Optimized Adaptive Binarization
                    </div>
                </div>
            )
        },
        {
            id: 'mobile',
            col: 'col-span-1',
            row: 'row-span-1',
            offset: { x: 80, y: 80 },
            bgColor: 'rgba(255,255,255,0.05)',
            content: (
                <div className="flex flex-col items-center justify-center h-full gap-1">
                     <div className="flex items-baseline gap-1 transform translate-y-2 -translate-x-2">
                        <span className="text-4xl md:text-5xl font-black text-white">4.09</span>
                        <span className="text-2xl font-bold text-gray-400">MB</span>
                     </div>
                     <div className="text-sm font-medium text-gray-400 uppercase tracking-widest text-center mt-2">Model Size</div>
                     <div className="text-[12px] text-gray-500">BEANet-Nano</div>
                </div>
            )
        }

    ];

    const animationOrder = {
        'accuracy': 0,
        'bw': 1,
        'sota': 2,
        'exste': 3,
        'distill': 4,
        'mobile': 5,
        'adabin': 6,
        'arch': 7,
        'block': 8,
        'brand': 9
    };

    const targetPages = {
        'accuracy': 0,
        'bw': 3,
        'sota': 7,
        'block': 6,
        'exste': 5,
        'distill': 2,
        'arch': 6,
        'adabin': 4,
        'mobile': 7
    };

    return (
        <div className="w-full h-full relative flex items-center justify-center p-8 z-50">
            <div 
                ref={cardsContainerRef}
                className={`grid grid-cols-4 grid-rows-4 gap-4 transition-all duration-500 ${mounted ? 'scale-100' : 'scale-95'} ${!isLandscape ? 'w-full max-w-6xl aspect-[16/11]' : ''}`}
                style={isLandscape ? gridStyle : {}}
                onMouseMove={(e) => {
                    if (!cardsContainerRef.current || animationFrameRef.current) return;
                    
                    const clientX = e.clientX;
                    const clientY = e.clientY;

                    animationFrameRef.current = requestAnimationFrame(() => {
                        if (!cardsContainerRef.current) return;
                        const cards = cardsContainerRef.current.children;
                        for (const card of cards) {
                             const rect = card.getBoundingClientRect();
                             const x = clientX - rect.left;
                             const y = clientY - rect.top;
                             card.style.setProperty('--mouse-x', `${x}px`);
                             card.style.setProperty('--mouse-y', `${y}px`);
                        }
                        animationFrameRef.current = null;
                    });
                }}
            >
                {cards.map((card, index) => (
                    <div 
                        key={card.id}
                        onClick={() => goToPage && targetPages[card.id] !== undefined && goToPage(targetPages[card.id])}
                        onDoubleClick={() => card.id === 'brand' && togglePageAudio && togglePageAudio()}
                        className={`
                            ${card.col} ${card.row} relative group
                            rounded-[1.5rem] backdrop-blur border border-white/10 
                            shadow-2xl overflow-hidden
                            transition-all duration-[1800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
                            ${(targetPages[card.id] !== undefined || card.id === 'brand') ? 'cursor-pointer hover:border-white/30' : ''}
                        `}
                        style={{
                            transform: mounted 
                                ? 'translate(0, 0) scale(1)' 
                                : `translate(${card.offset.x}px, ${card.offset.y}px) scale(1.3)`,
                            opacity: mounted ? 1 : 0,
                            zIndex: card.style?.zIndex || 1,
                            transitionDelay: `${(animationOrder[card.id] ?? index) * 80}ms`,
                            background: card.bgGradient 
                                ? undefined 
                                : (card.bgColor || 'rgba(255,255,255,0.03)')
                        }}
                    >
                         {/* Animated Gradient Background for gradient cards */}
                         {card.bgGradient && (
                             <div 
                                 className="absolute inset-0 opacity-40"
                                 style={{
                                     background: card.bgGradient,
                                     backgroundSize: '200% 200%',
                                     animation: 'gradientShift 8s ease-in-out infinite'
                                 }}
                             />
                         )}

                         {/* Spotlight Border Effect - Mouse tracking highglight */}
                         <div 
                            className="absolute inset-0 rounded-[1.5rem] pointer-events-none z-50 transition-opacity duration-300"
                            style={{
                                background: 'radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.4), transparent 100%)',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                                padding: '1px',
                            }}
                         />
                         
                         {/* Card Background Glow */}
                         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                         
                         {/* Content Container */}
                         <div className="relative w-full h-full z-10">
                            {card.content}
                         </div>
                    </div>
                ))}
            </div>
            
            {/* Disclaimer / Footer */}
            <div 
                className={`absolute bottom-3 text-[10px] text-gray-600 font-mono tracking-widest transition-all ${mounted ? 'duration-1000 delay-[2000ms] opacity-100 translate-y-0' : 'duration-300 delay-0 opacity-0 translate-y-10'}`}
            >
                Designed for Efficiency. Built for Performance.
            </div>
        </div>
    );
};
