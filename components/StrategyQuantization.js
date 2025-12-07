
const StrategyQuantization = ({ isActive }) => {
    // Visual: Bit Compression Steam
    // FP32 blocks -> Quantizer -> INT8 blocks
    
    const [tick, setTick] = React.useState(0);
    
    React.useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 50);
        return () => clearInterval(interval);
    }, [isActive]);

    // Use tick to create flowing particles
    // We want particles to spawn, move to center, get squeezed, move out.
    // Total animation loop approx 3s (60 ticks)
    
    const particles = React.useMemo(() => {
        const p = [];
        const cycle = 60; 
        // Generate a few particles based on current tick
        for(let i=0; i<5; i++) {
             const offset = i * (cycle / 5);
             let t = (tick + offset) % cycle;
             let progress = t / cycle; // 0 to 1
             
             // Phases:
             // 0.0 - 0.4: Approach middle (FP32 size)
             // 0.4 - 0.6: Squeeze (Transition)
             // 0.6 - 1.0: Leave middle (INT8 size)
             
             let x = 0;
             let size = 32;
             let opacity = 1;
             
             if (progress < 0.45) {
                 // x from 10% to 45%
                 x = 10 + (progress / 0.45) * 35;
                 size = 32;
                 opacity = Math.min(1, progress * 5); // Fade in
             } else if (progress < 0.55) {
                 // x stays around 50%
                 x = 50; 
                 // size shrinks
                 const t2 = (progress - 0.45) / 0.1;
                 size = 32 - t2 * 24; // 32 -> 8
                 opacity = 1;
             } else {
                 // x from 55% to 90%
                 x = 50 + ((progress - 0.55) / 0.45) * 40;
                 size = 8;
                 opacity = Math.max(0, 1 - (progress - 0.8) * 5); // Fade out
             }
             
             p.push({ id: i, x, size, opacity });
        }
        return p;
    }, [tick]);

    return (
        <div className="w-full h-full flex flex-col p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h2 className="text-4xl font-black text-green-400 flex items-center gap-3">
                        <Icons.Minimize2 size={32} />
                        Quantization Strategy
                    </h2>
                    <p className="text-gray-400 mt-2 max-w-lg">
                        Reduces numerical precision of weights and activations (e.g., from 32-bit floating point to 8-bit integers) to significantly lower memory usage and increase bandwidth.
                    </p>
                </div>
            </div>

            {/* Visualization Flow */}
            <div className="flex-1 flex flex-col justify-center relative z-10">
                {/* Labels */}
                <div className="flex justify-between w-full px-12 mb-8 uppercase text-xs font-bold tracking-widest">
                    <span className="text-blue-400">Memory Input (FP32)</span>
                    <span className="text-green-400">Efficient Storage (INT8)</span>
                </div>

                <div className="relative h-48 w-full bg-white/5 rounded-2xl border border-white/5 flex items-center overflow-hidden">
                     {/* The Funnel / Quantizer Gate */}
                     <div className="absolute left-1/2 -translate-x-1/2 w-16 h-full bg-black/20 border-x border-green-500/30 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-1">
                         <div className="text-[8px] text-green-500 uppercase font-mono mb-1">Quantize</div>
                         <Icons.Minimize2 className="text-green-400 animate-pulse" size={24} />
                         <div className="h-full w-[1px] bg-green-500/20 absolute top-0"></div>
                     </div>

                     {/* Particles */}
                     {particles.map(p => (
                         <div 
                            key={p.id}
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 flex items-center justify-center font-mono font-bold text-black"
                            style={{ 
                                left: `${p.x}%`, 
                                width: `${p.size * 2}px`, 
                                height: `${p.size * 2}px`,
                                borderRadius: p.size === 32 ? '8px' : '4px',
                                backgroundColor: p.size === 32 ? '#3b82f6' : '#4ade80', // Blue -> Green
                                opacity: p.opacity,
                                boxShadow: p.size === 32 
                                    ? '0 0 20px rgba(59,130,246,0.3)' 
                                    : '0 0 10px rgba(74,222,128,0.5)',
                                fontSize: p.size === 32 ? '10px' : '0px'
                            }}
                         >
                            {p.size === 32 ? '32b' : ''}
                         </div>
                     ))}
                </div>

                {/* Stats */}
                 <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Original Size</div>
                        <div className="text-2xl text-white font-mono">100<span className="text-sm text-gray-400">MB</span></div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 text-center relative">
                        {/* Connecting Arrow Overlay */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-gray-600">→</div>
                        <div className="text-green-500 text-[10px] uppercase font-bold tracking-wider mb-1">Quantized Size</div>
                        <div className="text-2xl text-green-400 font-mono">25<span className="text-sm text-green-600/60">MB</span></div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-purple-400 text-[10px] uppercase font-bold tracking-wider mb-1">Compression</div>
                        <div className="text-2xl text-purple-400 font-black">4x</div>
                    </div>
                 </div>

            </div>
        </div>
    );
};
