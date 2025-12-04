const BackgroundMemoryWall = ({ isActive }) => {
    const [activeType, setActiveType] = React.useState('DDR');
    const [activeGpu, setActiveGpu] = React.useState('RTX3090');
    const [packets, setPackets] = React.useState([]);
    const [gpuBuffer, setGpuBuffer] = React.useState(0);
    const [gpuStatus, setGpuStatus] = React.useState('IDLE'); // IDLE, ACTIVE
    const [utilization, setUtilization] = React.useState(0);
    const [isThrottled, setIsThrottled] = React.useState(false);

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
            rate: 1000, // 4.4 TFLOPS (Baseline 1x)
            busWidth: 192,
            color: 'text-orange-400',
            bg: 'bg-orange-500'
        },
        TITANX: {
            id: 'TITANX',
            name: 'TITAN X',
            rate: 400, // 11.0 TFLOPS (~2.5x)
            busWidth: 384,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500'
        },
        RTX3090: {
            id: 'RTX3090',
            name: 'RTX 3090',
            rate: 120, // 35.6 TFLOPS (~8.1x)
            busWidth: 384,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500'
        },
        A100: {
            id: 'A100',
            name: 'NVIDIA A100',
            rate: 225, // 19.5 TFLOPS (~4.4x) - FP32 Tensor Core
            busWidth: 5120,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500'
        },
        RTX4090: {
            id: 'RTX4090',
            name: 'RTX 4090',
            rate: 53, // 82.6 TFLOPS (~18.8x)
            busWidth: 384,
            color: 'text-rose-500',
            bg: 'bg-rose-600'
        },
        RTX5090: {
            id: 'RTX5090',
            name: 'RTX 5090',
            rate: 42, // 104.8 TFLOPS (~23.8x)
            busWidth: 512,
            color: 'text-violet-500',
            bg: 'bg-violet-600'
        },
        H100: {
            id: 'H100',
            name: 'NVIDIA H100',
            rate: 86, // 51.2 TFLOPS (~11.6x) - FP32 Tensor Core
            busWidth: 5120,
            color: 'text-fuchsia-400',
            bg: 'bg-fuchsia-500'
        }
    };

    const currentMem = MEMORY_TYPES[activeType];
    const currentGpu = GPU_TYPES[activeGpu];
    
    // Dynamic Bus Width Logic:
    // A100/H100 are native HBM GPUs (5120-bit). If paired with non-HBM, they drop to standard wide bus (512-bit).
    // For other GPUs (Consumer/Pro), if paired with HBM (hypothetical), we simulate a massive bus width increase (10x).
    const isNativeHbmGpu = ['A100', 'H100'].includes(activeGpu);
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

    // Calculate throughputs in "chunks" (64-bit units) per ms
    const memChunkCount = effectiveBusWidth / 64;
    const memThroughput = (1000 / emissionInterval) * memChunkCount;
    
    const gpuConsumeChunkCount = Math.ceil(effectiveBusWidth / 256); // Matches consume logic
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
        setPackets([]);
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
            const logicalPacketCount = Math.ceil(effectiveBusWidth / 64);
            
            // Visual packets for rendering (capped for performance)
            const visualPacketCount = Math.min(12, logicalPacketCount);
            
            const newPackets = Array.from({ length: visualPacketCount }).map((_, i) => ({
                id: `${id}-${i}`,
                createdAt: Date.now(),
                type: activeType,
                lane: Math.floor(Math.random() * visualLines) // Random lane distribution
            }));

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
                // We consume 1 full "row" of data per tick (scaling with bus width)
                const consumeAmount = Math.ceil(effectiveBusWidth / 64); 
                
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
                const processingTime = GPU_TYPES[activeGpu].rate * consumeAmount * 0.33;
                
                timeoutId = setTimeout(consume, processingTime);
            } else {
                setGpuStatus('IDLE');
                // Check again quickly if idle
                timeoutId = setTimeout(consume, 100);
            }
        };

        consume();
        return () => clearTimeout(timeoutId);
    }, [isActive, activeGpu, effectiveBusWidth]);

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
            `}</style>

            {/* Memory Controls (Top) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                <div className="flex gap-3 bg-black/20 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                    {Object.values(MEMORY_TYPES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveType(t.id)}
                            data-magnetic-strength="0.25"
                            className={`magnetic-target px-6 py-3 rounded-lg text-base font-bold transition-all duration-300 ${
                                activeType === t.id 
                                    ? `${t.bg} text-white shadow-lg scale-105` 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                        className={`w-full flex-1 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-500 ${activeType === 'HBM' ? 'shadow-[0_0_30px_rgba(16,185,129,0.2)]' : ''}`}
                        contentClassName="flex flex-col items-center justify-center w-full h-full"
                    >
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
                    </LiquidGlass>

                    {/* Memory Details (Clock Only) */}
                    <div className="w-full px-4 py-3 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm flex justify-center items-center">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 mb-1 tracking-widest">CLOCK SPEED</span>
                            <span className="text-white font-mono text-lg font-bold">{currentMem.transferRate} Gbps</span>
                        </div>
                    </div>
                </div>

                {/* Data Bus */}
                <div className="flex-1 h-48 relative flex flex-col justify-center -mx-12 z-0 mt-0">
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

                                return (
                                    <div 
                                        key={i} 
                                        className="absolute inset-x-0 h-px bg-white transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                        style={{ 
                                            top: `${topPos}%`,
                                            opacity: isVisible ? baseOpacity : 0,
                                            transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                                            transformOrigin: 'center'
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
                                            marginTop: '-3px'
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Bus Label */}
                    <div className="absolute -bottom-10 w-full text-center text-[10px] text-gray-600 font-mono tracking-[0.3em]">
                        PCIE / NVLINK INTERCONNECT ({effectiveBusWidth}-BIT)
                    </div>
                </div>

                {/* GPU Module */}
                <div className="w-[35%] h-[60%] flex flex-col items-center gap-4 z-10 mt-12">
                    <LiquidGlass 
                        className={`w-full flex-1 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-300 ${gpuStatus === 'ACTIVE' ? 'shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_40px_rgba(239,68,68,0.15)]'}`}
                        contentClassName="flex flex-col items-center justify-center w-full h-full"
                    >
                        {/* Core Visual */}
                        <div className="relative z-10 flex flex-col items-center">
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
                            
                            <div className="text-xs text-gray-400 font-mono mb-4 tracking-widest">{currentGpu.name}</div>

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
                    <div className="w-full px-4 py-3 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm flex justify-between items-center -mt-4 relative z-20">
                        <div className="flex flex-col items-center w-1/2 border-r border-white/10">
                            <span className="text-[10px] text-gray-500 mb-1 tracking-widest">COMPUTE</span>
                            <span className="text-white font-mono text-sm font-bold">{(1000/currentGpu.rate).toFixed(1)}x</span>
                        </div>
                        <div className="flex flex-col items-center w-1/2">
                            <span className="text-[10px] text-gray-500 mb-1 tracking-widest">BUS WIDTH</span>
                            <span className="text-white font-mono text-sm font-bold">{effectiveBusWidth} bit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GPU Controls (Bottom) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
                <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                    {Object.values(GPU_TYPES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveGpu(t.id)}
                            data-magnetic-strength="0.25"
                            className={`magnetic-target px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                                activeGpu === t.id 
                                    ? `${t.bg} text-white shadow-lg scale-105` 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
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
