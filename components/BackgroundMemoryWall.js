const BackgroundMemoryWall = ({ isActive }) => {
    const [activeType, setActiveType] = React.useState('DDR');
    const [activeGpu, setActiveGpu] = React.useState('RTX3090');
    const [packets, setPackets] = React.useState([]);
    const [gpuBuffer, setGpuBuffer] = React.useState(0);
    const [gpuStatus, setGpuStatus] = React.useState('IDLE'); // IDLE, ACTIVE
    const [utilization, setUtilization] = React.useState(0);
    const [isThrottled, setIsThrottled] = React.useState(false);
    const [precision, setPrecision] = React.useState('FP32');

    const packetIdCounter = React.useRef(0);
    const bufferRef = React.useRef(0);
    const historyRef = React.useRef([]); // Store last 10s of status

    const MEMORY_TYPES = {

        DDR: { 
            id: 'DDR',
            name: 'DDR4', 
            transferRate: 3.2, // Gbps
            color: 'text-sky-400', 
            glow: 'shadow-[0_0_15px_rgba(56,189,248,0.5)]',
            bg: 'bg-sky-500' 
        },
        DDR5: { 
            id: 'DDR5',
            name: 'DDR5', 
            transferRate: 6.4, // Gbps
            color: 'text-blue-400', 
            glow: 'shadow-[0_0_15px_rgba(96,165,250,0.5)]',
            bg: 'bg-blue-500' 
        },
        GDDR5: { 
            id: 'GDDR5',
            name: 'GDDR5', 
            transferRate: 8, // Gbps
            color: 'text-indigo-400', 
            glow: 'shadow-[0_0_15px_rgba(129,140,248,0.5)]',
            bg: 'bg-indigo-500' 
        },
        GDDR: { 
            id: 'GDDR',
            name: 'GDDR6', 
            transferRate: 20, // Gbps
            color: 'text-purple-400', 
            glow: 'shadow-[0_0_15px_rgba(192,132,252,0.5)]',
            bg: 'bg-purple-500' 
        },
        GDDR7: { 
            id: 'GDDR7',
            name: 'GDDR7', 
            transferRate: 28, // Gbps
            color: 'text-pink-400', 
            glow: 'shadow-[0_0_15px_rgba(244,114,182,0.5)]',
            bg: 'bg-pink-500' 
        },
        HBM: { 
            id: 'HBM',
            name: 'HBM3', 
            transferRate: 6.4, // Gbps (per pin, but massive width)
            color: 'text-emerald-400', 
            glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]',
            bg: 'bg-emerald-500' 
        }
    };
    const GPU_TYPES = {
        GTX1060: {
            id: 'GTX1060',
            name: 'GTX 1060',
            rate: 1000, 
            rateFP16: 64700, // 0.068 TFLOPS (TPU)
            busWidth: 192,
            color: 'text-orange-400',
            bg: 'bg-orange-500'
        },
        RTX2080Ti: {
            id: 'RTX2080Ti',
            name: 'RTX 2080 Ti',
            rate: 325,
            rateFP16: 164, // 26.9 TFLOPS (TPU)
            busWidth: 352,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500'
        },
        RTX3090: {
            id: 'RTX3090',
            name: 'RTX 3090',
            rate: 123,
            rateFP16: 124, // 35.6 TFLOPS (TPU)
            busWidth: 384,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500'
        },
        A100: {
            id: 'A100',
            name: 'NVIDIA A100',
            rate: 224,
            rateFP16: 14, // 312 TFLOPS (TPU Tensor)
            busWidth: 5120,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500'
        },
        RTX4090: {
            id: 'RTX4090',
            name: 'RTX 4090',
            rate: 53,
            rateFP16: 53, // 82.6 TFLOPS (TPU)
            busWidth: 384,
            color: 'text-rose-500',
            bg: 'bg-rose-600'
        },
        RTX5090: {
            id: 'RTX5090',
            name: 'RTX 5090',
            rate: 42,
            rateFP16: 42, // Speculative 1:1 like 4090
            busWidth: 512,
            color: 'text-violet-500',
            bg: 'bg-violet-600'
        },
        H100: {
            id: 'H100',
            name: 'NVIDIA H100',
            rate: 85,
            rateFP16: 21, // 204.9 TFLOPS (TPU)
            busWidth: 5120,
            color: 'text-fuchsia-400',
            bg: 'bg-fuchsia-500'
        },
        B200: {
            id: 'B200',
            name: 'NVIDIA B200',
            rate: 30, // ~149 TFLOPS FP32 (Dual Die)
            rateFP16: 2, // ~2382 TFLOPS FP16 (Dual Die)
            busWidth: 8192, // 8192-bit HBM3e
            color: 'text-gray-200',
            bg: 'bg-gray-700'
        }
    };

    const currentMem = MEMORY_TYPES[activeType];
    const currentGpu = GPU_TYPES[activeGpu];
    
    // Dynamic Bus Width Logic:
    // A100/H100/B200 are native HBM GPUs. If paired with non-HBM, they drop to standard wide bus (512-bit).
    // For other GPUs (Consumer/Pro), if paired with HBM (hypothetical), we simulate a massive bus width increase (10x).
    const isNativeHbmGpu = ['A100', 'H100', 'B200'].includes(activeGpu);
    let effectiveBusWidth;

    if (isNativeHbmGpu) {
        effectiveBusWidth = (activeType === 'HBM') ? currentGpu.busWidth : 512;
    } else {
        effectiveBusWidth = (activeType === 'HBM') ? currentGpu.busWidth * 10 : currentGpu.busWidth;
    }

    // Calculate Bandwidth: (Transfer Rate * Bus Width) / 8 bits per byte
    const bandwidth = (currentMem.transferRate * effectiveBusWidth) / 8;
    
    // Visual Lines: 1 line per 192 bits
    // Cap at 80 lines
    const visualLines = Math.min(80, Math.ceil(effectiveBusWidth / 192));

    // Calculate emission interval based strictly on transfer rate (clock frequency)
    // Base constant 4000 ensures reasonable visual speed (slower generation)
    const emissionInterval = 4000 / currentMem.transferRate;

    // Calculate throughputs in "chunks" (64-bit for FP32, 32-bit for FP16) per ms
    const chunkDivisor = precision === 'FP16' ? 32 : 64;
    const memChunkCount = effectiveBusWidth / chunkDivisor;
    const memThroughput = (1000 / emissionInterval) * memChunkCount;
    
    const gpuConsumeChunkCount = Math.ceil(effectiveBusWidth / (chunkDivisor * 4)); // Matches consume logic scale
    const gpuThroughput = (1000 / currentGpu.rate) * gpuConsumeChunkCount * 4; // *4 because consumeAmount is ~1/4 of visual lines

    // Utilization = How much of the GPU's capacity is being fed?
    // If Mem > GPU, Util = 100%
    // If Mem < GPU, Util = Mem / GPU
    const utilizationValue = Math.min(100, (memThroughput / gpuThroughput) * 100);

    // Reset state on configuration change
    React.useEffect(() => {
        bufferRef.current = 0;
        setGpuBuffer(0);
        setGpuStatus('IDLE');

        historyRef.current = [];
    }, [activeType, activeGpu]);

    // Memory Emission Loop
    React.useEffect(() => {
        if (!isActive) return;

        const emitPacket = () => {
            // Buffer cap scales with bus width
            const bufferCap = Math.max(50, Math.ceil(effectiveBusWidth / 10));
            
            // Dynamic Throttling:
            // If buffer is getting full (GPU is bottleneck), don't stop completely.
            // Instead, slow down emission to match GPU consumption rate.
            if (bufferRef.current >= bufferCap * 0.8) {
                // Calculate ratio of GPU consumption to Memory production
                // If GPU is slower (ratio < 1), we emit with that probability
                const throttleRatio = gpuThroughput / memThroughput;
                
                // If memory is much faster than GPU, we skip frames to match speed
                if (Math.random() > throttleRatio) {
                    return; 
                }
            }

            const id = packetIdCounter.current++;
            const travelTime = 1000; // 1s travel time
            
            // Logical packets for simulation (full bus width)
            const chunkDivisor = precision === 'FP16' ? 32 : 64;
            const logicalPacketCount = Math.ceil(effectiveBusWidth / chunkDivisor);
            
            // Visual packets for rendering (capped for performance)
            const visualPacketCount = Math.min(12, Math.ceil(effectiveBusWidth / 64)); // Keep base count same, duplicate for FP16
            
            const newPackets = [];
            for (let i = 0; i < visualPacketCount; i++) {
                const lane = Math.floor(Math.random() * visualLines);
                const basePacket = {
                    id: `${id}-${i}`,
                    createdAt: Date.now(),
                    type: activeType,
                    lane: lane,
                    delay: '0s'
                };
                newPackets.push(basePacket);

                // For IFP16, add a "buddy" packet to simulate double density/columns
                if (precision === 'FP16') {
                    newPackets.push({
                        ...basePacket,
                        id: `${id}-${i}-buddy`,
                        delay: '0.08s' // Slight delay to create "column" look
                    });
                }
            }

            setPackets(prev => [...prev, ...newPackets]);

            // Schedule arrival
            setTimeout(() => {
                setPackets(prev => prev.filter(p => !p.id.startsWith(`${id}-`)));
                bufferRef.current += logicalPacketCount; 
                setGpuBuffer(bufferRef.current);
            }, travelTime);
        };

        const interval = setInterval(emitPacket, emissionInterval);
        return () => clearInterval(interval);
    }, [activeType, activeGpu, isActive, gpuThroughput, memThroughput, effectiveBusWidth, visualLines, emissionInterval]);

    // GPU Consumption Loop
    React.useEffect(() => {
        if (!isActive) return;

        let timeoutId;
        const consume = () => {
            if (bufferRef.current > 0) {
                // Consume logic: More data = longer processing time (but parallel GPUs process faster)
                // We consume 1 full "row" of data per tick (scaling with bus width and precision)
                const consumeAmount = Math.ceil(effectiveBusWidth / (precision === 'FP16' ? 32 : 64)); 
                
                bufferRef.current = Math.max(0, bufferRef.current - consumeAmount);
                setGpuBuffer(bufferRef.current);
                setGpuStatus('ACTIVE');

                // Processing time scales with the amount of data, but faster GPUs have lower base rates
                // Base rate is for a "standard" chunk. Larger chunks take longer, but wide GPUs handle them better.
                // Here we assume the rate defined in GPU_TYPES is for a standard workload unit.
                // Since we are consuming 'consumeAmount' chunks, the time taken is proportional.
                // Processing time scales linearly with the amount of data (consumeAmount).
                // If data increases 10x (e.g. HBM), computation takes 10x longer.
                // Multiplier 0.3 adjusts the base duration to be reasonable.
                const activeRate = precision === 'FP32' ? GPU_TYPES[activeGpu].rate : GPU_TYPES[activeGpu].rateFP16;
                const processingTime = activeRate * consumeAmount * 0.25;
                
                timeoutId = setTimeout(consume, processingTime);
            } else {
                setGpuStatus('IDLE');
                // Check again quickly if idle
                timeoutId = setTimeout(consume, 100);
            }
        };

        consume();
        return () => clearTimeout(timeoutId);
    }, [isActive, activeGpu, effectiveBusWidth, precision]);

    // Utilization Calculation Loop (5s window)
    React.useEffect(() => {
        if (!isActive) return;

        const sampleRate = 100; // Sample every 100ms
        const windowSize = 5000 / sampleRate; // 5s window

        const sample = () => {
            historyRef.current.push(gpuStatus === 'ACTIVE' ? 1 : 0);
            if (historyRef.current.length > windowSize) {
                historyRef.current.shift();
            }
            
            const activeCount = historyRef.current.reduce((a, b) => a + b, 0);
            setUtilization((activeCount / historyRef.current.length) * 100);
        };

        const interval = setInterval(sample, sampleRate);
        return () => clearInterval(interval);
    }, [isActive, gpuStatus]);

    return (
        <div className="w-full h-[200%] flex flex-col p-6 relative overflow-hidden select-none font-sans">
            <style>{`
                @keyframes travel {
                    0% { left: 0%; opacity: 0; transform: scale(0.5); }
                    10% { opacity: 1; transform: scale(1); }
                    90% { opacity: 1; transform: scale(1); }
                    100% { left: 100%; opacity: 0; transform: scale(0.5); }
                }
                .packet-anim {
                    animation: travel 1s linear forwards;
                }
                @keyframes switch-entry {
                    0% { opacity: 0; transform: scale(0.9); filter: blur(5px); }
                    100% { opacity: 1; transform: scale(1); filter: blur(0); }
                }
                .switch-anim {
                    animation: switch-entry 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>

            {/* Memory Controls (Top) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                <div className="flex gap-3 bg-black/20 p-2 rounded-full border border-white/10 backdrop-blur-md">
                    {Object.values(MEMORY_TYPES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveType(t.id)}
                            data-magnetic-strength="0.25"
                            className={`magnetic-target px-8 py-3 rounded-full text-sm font-mono font-bold tracking-[0.2em] transition-all duration-300 ${
                                activeType === t.id 
                                    ? `bg-gradient-to-r ${t.bg} to-white/20 text-white shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105 border border-white/20` 
                                    : 'bg-black/40 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20'
                            }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Visualization Area */}
            <div className="flex-1 relative z-10 flex items-center justify-center gap-0 px-8 py-16">
                
                {/* Memory Module */}
                <div className="w-[35%] h-[70%] flex flex-col items-center gap-4 z-10 mt-12">
                    <LiquidGlass 
                        className={`w-full flex-1 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-500 -translate-y-[10%] ${activeType === 'HBM' ? 'shadow-[0_0_30px_rgba(16,185,129,0.2)]' : ''}`}
                        contentClassName="flex flex-col items-center justify-center w-full h-full"
                    >
                        <div key={activeType} className="flex flex-col items-center w-full switch-anim">
                            {/* Memory Banks Visual */}
                            <div className="flex flex-col gap-2 mb-6 scale-90">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`w-24 h-4 rounded-sm border border-white/20 ${activeType === 'HBM' ? 'bg-emerald-500/50' : (activeType === 'GDDR7' ? 'bg-pink-500/50' : (activeType === 'GDDR' ? 'bg-purple-500/50' : (activeType === 'DDR5' ? 'bg-blue-500/50' : (activeType === 'GDDR5' ? 'bg-indigo-500/50' : 'bg-sky-500/50'))))} transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                                ))}
                            </div>

                            <div className={`text-4xl font-black ${currentMem.color} mb-2 transition-colors duration-300`}>
                                {currentMem.name}
                            </div>
                            <div className="text-xs text-gray-400 font-mono tracking-widest">SYSTEM MEMORY</div>
                        </div>
                    </LiquidGlass>

                    {/* Memory Details (Clock Only) */}
                    <div className="w-auto min-w-[120px] px-6 py-2 bg-black/40 rounded-full border border-white/10 backdrop-blur-md flex justify-center items-center shadow-lg">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 mb-0.5 tracking-widest font-bold">CLOCK SPEED</span>
                            <span className="text-white font-mono text-base font-bold">{currentMem.transferRate} Gbps</span>
                        </div>
                    </div>
                </div>

                {/* Data Bus */}
                <div className="flex-1 h-48 relative flex flex-col justify-center -mx-12 z-0 mt-0 -translate-y-[10%]">
                    {/* Throttling Glow Background */}
                    <div className={`absolute inset-0 bg-amber-500/5 transition-opacity duration-500 rounded-xl ${isThrottled ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transition-opacity duration-500 ${isThrottled ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`absolute inset-x-0 h-px bottom-0 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transition-opacity duration-500 ${isThrottled ? 'opacity-100' : 'opacity-0'}`} />
                    {/* Bandwidth Display (Above Bus) */}
                    <div className="absolute -top-16 w-full text-center">
                        <div className="text-xs text-gray-500 font-mono mb-1 tracking-widest">MEMORY BANDWIDTH</div>
                        <div className={`text-3xl font-black ${currentMem.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`}>
                            {bandwidth >= 1000 ? `${(bandwidth/1000).toFixed(1)} TB/s` : `${Math.round(bandwidth)} GB/s`}
                        </div>
                    </div>

                    {/* Bus Visualization Wrapper with Mask */}
                    <div className="absolute inset-0 pointer-events-none" style={{ 
                        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                    }}>
                        {/* Bus Lines */}
                        <div className="absolute inset-0 flex flex-col justify-center items-center">
                            {Array.from({ length: 80 }).map((_, i) => {
                                // Fixed pool of 80 lines for smooth transitions
                                const isVisible = i < visualLines;
                                
                                // Dynamic opacity based on density (only for visible lines)
                                const isDense = visualLines > 20;
                                const baseOpacity = isDense ? 0.15 : 0.3;
                                
                                // Center-out expansion logic
                                // Use current visualLines for calculation so hidden lines follow the pattern
                                const effectiveCount = visualLines || 1;
                                const spread = Math.min(60, effectiveCount * 2); 
                                const step = spread / effectiveCount;
                                const fromCenterIndex = Math.ceil(i / 2);
                                const direction = i % 2 === 0 ? 1 : -1;
                                const topPos = 50 + (fromCenterIndex * step * direction);
                                
                                // Staggered delay for wave effect
                                const delay = fromCenterIndex * 15;

                                return (
                                    <div 
                                        key={i} 
                                        className="absolute inset-x-0 h-px bg-white transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                        style={{ 
                                            top: `${topPos}%`,
                                            opacity: isVisible ? baseOpacity : 0,
                                            transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                                            transformOrigin: 'center',
                                            transitionDelay: `${delay}ms`
                                        }} 
                                    />
                                );
                            })}
                        </div>
                        
                        {/* Flow Particles */}
                        <div className="absolute inset-0 overflow-hidden">
                            {packets.map(p => {
                                // Recalculate position to match lines (Center-out logic)
                                const spread = Math.min(60, visualLines * 2);
                                const step = spread / (visualLines || 1);
                                const fromCenterIndex = Math.ceil(p.lane / 2);
                                const direction = p.lane % 2 === 0 ? 1 : -1;
                                const topPos = 50 + (fromCenterIndex * step * direction);
                                
                                return (
                                    <div
                                        key={p.id}
                                        className={`absolute left-0 w-1.5 h-1.5 rounded-full ${MEMORY_TYPES[p.type].bg} shadow-[0_0_5px_white] packet-anim transition-all duration-500 ease-out`}
                                        style={{ 
                                            top: `${topPos}%`,
                                            marginTop: '-3px',
                                            animationDelay: p.delay || '0s'
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    
                    {/* Bus Label */}
                    <div className="absolute -bottom-30 w-full flex flex-col items-center">
                        <div className="text-white text-l font-bold tracking-[0.2em] font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                            {effectiveBusWidth} <span className="text-m text-white/60 ml-1">BIT</span>
                        </div>
                    </div>
                </div>



                {/* Precision Toggle (Centered on Axis) */}
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
                     <div className="flex flex-col items-center justify-center p-4">
                        <div className="flex bg-black/80 rounded-full p-2 relative ring-1 ring-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] cursor-pointer magnetic-target backdrop-blur-2xl" data-magnetic-strength="0.3" onClick={() => setPrecision(p => p === 'FP32' ? 'FP16' : 'FP32')}>
                            <div className={`absolute inset-y-2 w-[calc(50%-8px)] rounded-full transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) ${precision === 'FP16' ? 'left-[calc(50%)] bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]' : 'left-2 bg-gradient-to-r from-white/20 to-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15)]'}`} />
                            <div className={`text-s font-mono font-bold tracking-[0.2em] px-8 py-3 z-10 transition-all duration-300 ${precision === 'FP32' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-600'}`}>FP32</div>
                            <div className={`text-s font-mono font-bold tracking-[0.2em] px-8 py-3 z-10 transition-all duration-300 ${precision === 'FP16' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-600'}`}>FP16</div>
                        </div>
                     </div>
                </div>

                {/* GPU Module */}
                <div className="w-[35%] h-[60%] flex flex-col items-center gap-4 z-10 mt-12">
                    <LiquidGlass 
                        className={`w-full flex-1 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-300 -translate-y-[10%] ${gpuStatus === 'ACTIVE' ? 'shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_40px_rgba(239,68,68,0.15)]'}`}
                        contentClassName="flex flex-col items-center justify-center w-full h-full"
                    >
                        {/* Core Visual */}
                        <div key={activeGpu} className="relative z-10 flex flex-col items-center switch-anim">
                            <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center mb-4 transition-all duration-200 ${
                                gpuStatus === 'ACTIVE' 
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                                    : 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                            }`}>
                                <Icons.Cpu className={`w-12 h-12 transition-colors duration-200 ${gpuStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`} />
                            </div>

                            <div className={`text-2xl font-black tracking-wider mb-2 transition-colors duration-200 ${gpuStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-500'}`}>
                                {gpuStatus === 'ACTIVE' ? 'COMPUTING' : 'STALLED'}
                            </div>
                            
                            <div className={`text-xl font-black ${currentGpu.color} mb-4 tracking-widest transition-colors duration-300`}>{currentGpu.name}</div>

                            {/* Utilization Bar */}
                            <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-200 ${gpuStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ width: `${utilization}%` }}
                                />
                            </div>
                            <div className="flex justify-between w-32 mt-1">
                                <span className="text-[8px] text-gray-500 font-bold">UTILIZATION</span>
                                <span className={`text-[8px] font-mono font-bold ${gpuStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {Math.round(utilization)}%
                                </span>
                            </div>
                        </div>
                    </LiquidGlass>

                    {/* GPU Stats (Below Module) */}
                    <div className="w-auto min-w-[120px] px-6 py-2 bg-black/40 rounded-full border border-white/10 backdrop-blur-md flex justify-center items-center -mt-6 relative z-20 shadow-lg">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 mb-0.5 tracking-widest font-bold">COMPUTE</span>
                            <span className="text-white font-mono text-base font-bold">
                                {(1000/(precision === 'FP32' ? currentGpu.rate : currentGpu.rateFP16)).toFixed(1)}x
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GPU Controls (Bottom) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
                <div className="flex gap-2 bg-black/20 p-1 rounded-full border border-white/10 backdrop-blur-md">
                    {Object.values(GPU_TYPES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveGpu(t.id)}
                            data-magnetic-strength="0.25"
                            className={`magnetic-target px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-[0.15em] transition-all duration-300 ${
                                activeGpu === t.id 
                                    ? `bg-gradient-to-r ${t.bg} to-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105 border border-white/20` 
                                    : 'bg-black/40 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20'
                            }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
