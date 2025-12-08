
const pages = [
    {
        id: 'intro',
        title: "Binary Enhanced Adaptive Network (BEANet)",
        subtitle: "Redefining the Efficiency-Accuracy Frontier",
        content: (
            <div className="space-y-6">
                <div className="text-lg text-gray-300 border-l-4 border-red-500 pl-6 leading-relaxed">
                    Bridging the gap between binary efficiency and full-precision accuracy. BEANet achieves <span className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] font-bold text-xl">77.1%</span> ImageNet Top-1 Accuracy, challenging the dominance of ResNet-50.
                </div>
                <div className="text-sm text-gray-400 font-light">
                    By addressing the <span className="text-white font-medium">Information Bottleneck</span> in traditional BNNs, we introduce a novel hierarchical architecture that preserves feature richness while maximizing hardware efficiency.
                </div>
            </div>
        ),
        visualComp: IntroChart
    },
    {
        id: 'memory-wall',
        title: "The Memory Wall",
        subtitle: "Compute vs. Data Movement",
        content: (
            <div className="space-y-6">
                <div className="text-gray-300">
                    <p className="mb-4">
                        While GPU compute power (FLOPS) has grown exponentially (~1000x in 10 years), memory bandwidth has only improved linearly (~100x).
                    </p>
                    <p className="mb-4">
                        This creates a <span className="text-red-400 font-bold">bottleneck</span>: Powerful processors spend significant time <span className="text-white italic">waiting for data</span>.
                    </p>
                    <div className="p-4 bg-white/5 rounded-lg border-l-4 border-red-500">
                        <div className="text-sm text-gray-400">
                            "Data movement consumes <strong className="text-white">orders of magnitude</strong> more energy than arithmetic operations."
                        </div>
                    </div>
                </div>
            </div>
        ),
        visualComp: BackgroundMemoryWall
    },
    {
        id: 'strategies',
        title: "Optimization Strategies",
        subtitle: "Solving the Efficiency Puzzle",
        content: (
            <div className="space-y-6">
                <div className="text-gray-300">
                    To bridge the gap, we employ three primary strategies to reduce model size and computational cost:
                </div>
                <ul className="space-y-4">
                    <li className="flex gap-4">
                        <div className="mt-1 text-yellow-400"><Icons.Scissors size={20} /></div>
                        <div>
                            <strong className="text-white block">Pruning</strong>
                            <span className="text-sm text-gray-400">Removing unimportant neurons or connections to create sparse networks.</span>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="mt-1 text-purple-400"><Icons.Users size={20} /></div>
                        <div>
                            <strong className="text-white block">Distillation</strong>
                            <span className="text-sm text-gray-400">Training a compact "student" model to mimic a massive "teacher" model.</span>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="mt-1 text-green-400"><Icons.Minimize2 size={20} /></div>
                        <div>
                            <strong className="text-white block">Quantization</strong>
                            <span className="text-sm text-gray-400">Representing weights and activations with fewer bits (e.g., 32-bit float → 8-bit integer).</span>
                        </div>
                    </li>
                </ul>
            </div>
        ),
        visualComp: BackgroundStrategies
    },
    {
        id: 'quantization',
        title: "The Power of Quantization",
        subtitle: "From FP32 to Binary",
        content: (
            <div className="space-y-6">
                <div className="text-gray-300">
                    <p className="mb-4">
                        Quantization is the most effective way to reduce memory footprint and increase bandwidth utilization.
                    </p>
                    <p className="mb-4">
                        By moving from <span className="text-sky-400 font-mono">FP32</span> to <span className="text-green-400 font-mono">INT8</span>, we achieve <strong>4x</strong> compression.
                    </p>
                    <p>
                        <span className="text-white font-bold">Binary Neural Networks (BNNs)</span> take this to the extreme: using just <strong>1-bit</strong> values (-1, +1).
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-800/50 p-3 rounded border border-white/10 text-center">
                        <div className="text-xs text-gray-500 uppercase">FP32 Bandwidth</div>
                        <div className="text-lg font-mono text-white">1x</div>
                    </div>
                    <div className="bg-green-900/20 p-3 rounded border border-green-500/30 text-center">
                        <div className="text-xs text-green-400 uppercase">Binary Bandwidth</div>
                        <div className="text-lg font-mono text-green-400">32x</div>
                    </div>
                </div>
            </div>
        ),
        visualComp: BackgroundQuantization
    },
    {
        id: 'adabin',
        title: "Evolution of Binarization",
        subtitle: "From Standard to Optimized",
        content: (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    {/* Standard */}
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">1. Standard (XNOR-Net)</span>
                            <span className="text-xs text-gray-500 font-mono">Fixed Threshold</span>
                        </div>
                        <div className="text-center font-mono text-sm text-gray-300">
                            <Latex>{'x_b = \\alpha \\cdot \\text{Sign}(x)'}</Latex>
                        </div>
                    </div>

                    {/* Adaptive */}
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sky-400 font-bold text-xs uppercase tracking-wider">2. Adaptive (AdaBin)</span>
                            <span className="text-xs text-gray-500 font-mono">Learnable Shift</span>
                        </div>
                        <div className="text-center font-mono text-sm text-sky-200">
                            <Latex>{'x_b = \\alpha_{learn} \\cdot \\text{Sign}(x - \\beta_{learn})'}</Latex>
                        </div>
                    </div>

                    {/* Optimized */}
                    <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30 backdrop-blur-sm group hover:bg-green-900/30 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-green-400 font-bold text-xs uppercase tracking-wider">3. Optimized (Ours)</span>
                            <span className="text-xs text-green-500/80 font-mono">Analytical Optimal</span>
                        </div>
                        <div className="text-center font-mono text-sm text-green-300">
                            <Latex>{'\\alpha^* = \\text{Mean}(|x - \\bar{x}|)'}</Latex>
                        </div>
                        <div className="mt-1 text-[10px] text-center text-green-500/60">
                            Minimizes L1 Quantization Error
                        </div>
                    </div>
                </div>
            </div>
        ),
        visualComp: AdaBinSim
    },
    {
        id: 'exste',
        title: "Exponential Straight-Through Estimator (ExSTE)",
        subtitle: "Exponential Soft-Through Estimator",
        content: (
            <div className="space-y-6">
                <div className="text-gray-300">
                    Overcoming the <span className="text-red-400">gradient mismatch</span> problem. ExSTE dynamically evolves the gradient approximation during training, transitioning from Identity to Sign:
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <div className="text-center font-mono text-sm text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                        <Latex displayMode={true}>{'\\frac{\\partial y}{\\partial x} = \\frac{o \\cdot e^{-o|x|}}{1 - e^{-o}}'}</Latex>
                    </div>
                    <div className="text-center text-[10px] text-gray-500 font-mono mt-2 tracking-widest">
                        <Latex>{'\\text{Condition: } |x| \\le 1.5'}</Latex>
                    </div>
                </div>
                <div className="text-sm text-gray-400">
                    This ensures <span className="text-white font-bold">stable convergence</span> and accurate weight updates, unlocking the full potential of binary networks.
                </div>
            </div>
        ),
        visualComp: ExSTEDemo
    },
    {
        id: 'arch',
        title: "BEANet Architecture",
        subtitle: "Macro-Micro Hierarchical Design",
        content: (
            <div className="space-y-6">
                <div className="text-gray-300">
                    A dual-path topology balancing receptive field and feature density.
                </div>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
                        <span><strong className="text-white">Efficient Processor:</strong> Depthwise operations for spatial aggregation.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                        <span><strong className="text-white">Performance Processor:</strong> Dense operations for channel mixing.</span>
                    </li>
                </ul>
                <div className="text-xs text-gray-500 border-t border-white/10 pt-4 mt-2">
                    Click the interactive diagram to explore the <span className="text-white">Stem, Stages, and Processors</span> in detail.
                </div>
            </div>
        ),
        visualComp: ArchitectureUltimate
    },
    {
        id: 'results',
        title: "Experiments",
        subtitle: "SOTA Performance Validation",
        content: (
            <div className="space-y-6">
                <div className="text-gray-300">
                    Extensive benchmarking on <span className="text-white font-bold">ImageNet-1K</span> and <span className="text-white font-bold">CIFAR-10</span> confirms BEANet's superiority.
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-900/10 border border-red-500/30 rounded-lg text-center">
                        <div className="text-xs text-red-300 uppercase tracking-wider">vs ReActNet</div>
                        <div className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">+2.3%</div>
                    </div>
                    <div className="p-3 bg-sky-900/10 border border-sky-500/30 rounded-lg text-center">
                        <div className="text-xs text-sky-300 uppercase tracking-wider">vs AdaBin</div>
                        <div className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">+1.5%</div>
                    </div>
                </div>
                <div className="text-sm text-gray-400">
                    Achieving state-of-the-art accuracy with comparable FLOPs, proving that <span className="text-white italic">binary need not mean compromised</span>.
                </div>
            </div>
        ),
        visualComp: ExperimentsRevamped
    },
    {
        id: 'highlights',
        title: "", // Empty title to let the component handle it
        subtitle: "",
        content: (
            // Empty content as the visual component takes over
            <div className="hidden"></div>
        ),
        visualComp: BEANetHighlights
    }
];

const App = () => {
    const { scale, visualScale, textScale, mobileScale, textWidth } = useScale();
    const [curr, setCurr] = React.useState(0);
    const [anim, setAnim] = React.useState(false);
    // State to track layout mode
    const [isLandscape, setIsLandscape] = React.useState(true);
    const [navHover, setNavHover] = React.useState(null);
    const navRef = React.useRef(null);
    // audioRef and transitionTimeoutRef are now managed in useAudioController hook
    
    // Use the custom hook for audio management
    const { isPlaying, togglePageAudio } = useAudioController(curr);

    React.useEffect(() => {
        // Determine if we are in landscape mode based on aspect ratio > 1
        const checkLayout = () => {
            setIsLandscape((window.innerWidth / window.innerHeight) > (4 / 3));
        };
        // Initial check
        checkLayout();

        window.addEventListener('resize', checkLayout);
        return () => window.removeEventListener('resize', checkLayout);
    }, []);

    const go = (i) => {
        if (i >= 0 && i < pages.length && !anim) {
            const leavingHighlights = pages[curr].id === 'highlights';
            setAnim(true);
            
            if (leavingHighlights) {
                // Wait for Highlights fly-out animation to complete before switching
                setTimeout(() => { setCurr(i); setAnim(false); }, 2000);
            } else {
                setTimeout(() => { setCurr(i); setAnim(false); }, 500);
            }
        }
    };

    const Visual = pages[curr].visualComp;
    const isHighlights = pages[curr].id === 'highlights';

    // Conditional Style for Global Scaling
    const containerStyle = scale === 1 ? {
        width: '100%',
        minHeight: '100vh'
    } : {
        width: '1440px',
        minHeight: `${window.innerHeight / scale}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
    };

    return (
        <>
            <MagneticOrb />
            <NeuralBackground />
            <div style={containerStyle}>
                <div className={`w-full relative select-none text-[#e0e0e0] font-['Inter'] transition-all duration-500 ${isLandscape ? 'min-h-full flex flex-col' : 'min-h-full flex flex-col'}`}>

                    {/* Header */}
                    <div className={`flex z-20 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isLandscape ? 'justify-between items-center px-8 py-2 h-12' : 'flex-col items-center justify-center pt-6 pb-2 gap-4'} ${isHighlights && isLandscape ? '!h-0 !p-0 !opacity-0 -translate-y-full overflow-hidden' : 'translate-y-0 opacity-100'}`}>
                        <div className="text-3xl magnetic-target cursor-pointer apple-text-gradient" onDoubleClick={togglePageAudio}>BEANet</div>
                        <div
                            className={`flex items-center justify-center transition-all duration-300 magnetic-target ${isLandscape ? 'mr-4' : 'w-full px-4'}`}
                            data-magnetic-strength="0.1"
                            onMouseLeave={() => setNavHover(null)}
                        >
                            {pages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => go(i)}
                                    onMouseEnter={() => setNavHover(i)}
                                    className={`relative group focus:outline-none ${isLandscape ? 'py-6 px-4' : 'py-4 px-1 flex-1'}`}
                                >
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${(navHover !== null ? navHover === i : curr === i)
                                            ? (isLandscape ? 'w-24' : 'w-full') + ' bg-sky-500 shadow-[0_0_15px_#38bdf8]'
                                            : (isLandscape ? 'w-8' : 'w-full opacity-50') + ' bg-gray-700 group-hover:bg-gray-500'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content - Responsive Layout Switch */}
                    <div className={`flex-1 relative z-10 transition-all duration-500 ${isLandscape ? 'px-8 flex flex-row items-start' : 'px-0 flex flex-col pb-24'} ${isHighlights && !isLandscape ? '!pb-0' : ''}`}>

                        {/* Text Section */}
                        <div
                            className={`transition-all duration-500 ${isLandscape ? 'pr-12 h-full flex flex-col justify-start pt-12 pointer-events-none' : 'w-full mb-8 mt-4 px-8'} ${isHighlights ? '!w-0 !p-0 !m-0 opacity-0 overflow-hidden' : ''}`}
                            style={isLandscape && !isHighlights ? { width: `${textWidth}%`, transform: `scale(${textScale})`, transformOrigin: 'top left' } : {}}
                        >
                            <div className={`transition-all duration-700 transform ${anim ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}>
                                {!isHighlights && (
                                    <LiquidGlass 
                                        className="liquid-glass-capsule mb-6 !py-0 !px-4" 
                                        overlayStyle={{ background: 'rgba(14, 165, 233, 0.1)' }}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-sky-300 text-4xl font-light tracking-wide font-tall leading-none pb-1">SECTION 0{curr + 1}</span>
                                        </div>
                                    </LiquidGlass>
                                )}
                                <h1 className={`${isLandscape ? 'text-4xl' : 'text-2xl'} font-black text-white mb-4 leading-tight`}>{pages[curr].title}</h1>
                                <h2 className="text-lg font-light text-gray-400 mb-6 font-mono">{pages[curr].subtitle}</h2>
                                <div className="pointer-events-auto leading-relaxed opacity-90">{pages[curr].content}</div>
                            </div>
                        </div>

                        {/* Visual Section */}
                        <div className={`relative flex transition-all duration-500 ${isLandscape ? 'justify-end items-start flex-1 pl-4 h-full pt-0' : 'justify-center items-center w-full min-h-[50vh]'} ${isHighlights ? '!pl-0 !justify-center' : ''}`}>
                            <div className={`w-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform flex flex-col flex-shrink-0
                                    ${!isHighlights ? 'shadow-2xl border border-white/10 rounded-3xl p-1' : 'border-none shadow-none bg-transparent'}
                                    ${anim && !isHighlights ? 'opacity-0 scale-95 translate-x-20' : 'opacity-100 scale-100 translate-x-0'}
                                    ${curr === 0 ? 'aspect-[4/3] min-h-[600px]' : 'min-h-[50vh]'}
                                `}
                                style={{
                                    backdropFilter: isHighlights ? 'none' : 'blur(8px)',
                                    WebkitBackdropFilter: isHighlights ? 'none' : 'blur(8px)',
                                    backgroundColor: isHighlights ? 'transparent' : (curr === 0 ? 'rgba(20, 20, 30, 0.6)' : 'rgba(20, 20, 30, 0.35)'),
                                    transform: isLandscape ? (isHighlights ? 'scale(1)' : `scale(${visualScale})`) : `scale(${mobileScale})`,
                                    transformOrigin: isLandscape ? (isHighlights ? 'center' : 'top right') : 'top center',
                                    width: (isHighlights && !isLandscape) ? `${MOBILE_TARGET_WIDTH}px` : (isHighlights ? '100%' : (isLandscape ? '907px' : (mobileScale < 1 ? `${MOBILE_TARGET_WIDTH}px` : '100%')))
                                }}
                            >
                                <div className={`w-full flex-1 relative flex flex-col rounded-2xl`}>
                                    <div className="relative w-full flex-1 flex flex-col"> {/* Removed overflow-hidden to allow expansion */}
                                        {Visual && <Visual isActive={!anim} goToPage={go} togglePageAudio={togglePageAudio} />}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>




                </div>
            </div>

            {/* Navigation Buttons - Fixed to Viewport Bottom Right */}
            <div
                className="nav-buttons-container fixed bottom-8 right-8 flex gap-4 z-50"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'bottom right'
                }}
            >


                <LiquidGlass 
                    as="button"
                    onClick={() => go(curr - 1)} 
                    disabled={curr === 0} 
                    className="liquid-glass-btn w-20 h-20 rounded-full magnetic-target group disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center"
                >
                    <Icons.ArrowLeft className="text-white w-10 h-10 group-hover:-translate-x-1 transition-transform" />
                </LiquidGlass>

                <LiquidGlass 
                    as="button"
                    onClick={() => go(curr + 1)} 
                    disabled={curr === pages.length - 1} 
                    className="liquid-glass-btn w-20 h-20 rounded-full magnetic-target group disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center"
                >
                    <Icons.ArrowRight className="text-white w-10 h-10 group-hover:translate-x-1 transition-transform" />
                </LiquidGlass>
            </div>
        </>
    );
};
