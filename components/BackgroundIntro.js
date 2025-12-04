
const BackgroundIntro = ({ isActive }) => {
    const [step, setStep] = React.useState(0);
    
    // Detailed format specifications
    const formats = [
        { name: "FP32", bits: 32, s: 1, e: 8, m: 23, desc: "Single Precision", bandwidth: "1x" },
        { name: "TF32", bits: 19, s: 1, e: 8, m: 10, desc: "Tensor Float (NVIDIA)", bandwidth: "~1.7x" },
        { name: "FP16", bits: 16, s: 1, e: 5, m: 10, desc: "Half Precision", bandwidth: "2x" },
        { name: "BF16", bits: 16, s: 1, e: 8, m: 7, desc: "Brain Float (Google)", bandwidth: "2x" },
        { name: "FP8",  bits: 8,  s: 1, e: 4, m: 3, desc: "E4M3 / E5M2", bandwidth: "4x" },
        { name: "INT8", bits: 8,  s: 0, e: 0, m: 8, desc: "Integer Quantization", bandwidth: "4x" },
        { name: "INT4", bits: 4,  s: 0, e: 0, m: 4, desc: "4-bit Integer", bandwidth: "8x" },
        { name: "INT2", bits: 2,  s: 0, e: 0, m: 2, desc: "2-bit Integer", bandwidth: "16x" },
        { name: "Binary", bits: 1, s: 0, e: 0, m: 1, desc: "1-bit (XNOR)", bandwidth: "32x" },
    ];

    React.useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setStep(s => (s + 1) % formats.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isActive]);

    const current = formats[step];

    // Helper to render bits
    const renderBits = (fmt) => {
        const blocks = [];
        const totalWidth = 100; // %
        
        // We visualize the bits as a bar.
        // For floats: Sign (Red), Exponent (Green), Mantissa (Blue)
        // For ints: Data (Gray/White)
        
        if (fmt.s > 0) {
            blocks.push({ type: 'sign', width: (fmt.s / 32) * 100, color: 'bg-red-500', label: 'S' });
        }
        if (fmt.e > 0) {
            blocks.push({ type: 'exp', width: (fmt.e / 32) * 100, color: 'bg-green-500', label: 'Exp' });
        }
        if (fmt.m > 0) {
            // For floats, m is mantissa. For ints, we treat 'm' as the data bits for simplicity in this array structure
            // But wait, for INT8, I put m=8.
            const color = fmt.e === 0 ? 'bg-white' : 'bg-blue-500';
            const label = fmt.e === 0 ? 'Int' : 'Mantissa';
            blocks.push({ type: 'mantissa', width: (fmt.m / 32) * 100, color: color, label: label });
        }

        // Calculate empty space (reduction)
        const usedBits = fmt.s + fmt.e + fmt.m;
        const emptyBits = 32 - usedBits;
        if (emptyBits > 0) {
            blocks.push({ type: 'empty', width: (emptyBits / 32) * 100, color: 'bg-gray-800/20', label: 'Saved' });
        }

        return blocks;
    };

    const bitBlocks = renderBits(current);

    return (
        <div className="w-full h-full flex flex-col p-6 gap-6">
            
            {/* Top Section: The Bottleneck */}
            <div className="flex-1 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icons.Cpu size={120} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Icons.Zap className="text-yellow-400" size={20} />
                    The Bottleneck: IO vs Compute
                </h3>

                <div className="flex-1 flex items-center justify-center gap-12">
                    {/* Compute */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-32 bg-gradient-to-t from-sky-500/20 to-sky-500/5 rounded-lg border border-sky-500/30 flex items-end justify-center relative overflow-hidden">
                            <div className="w-full bg-sky-500/80 animate-pulse" style={{ height: '95%' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-sky-200 font-bold rotate-90">
                                100+ TFLOPS
                            </div>
                        </div>
                        <span className="text-sm text-sky-300 font-bold">Compute</span>
                    </div>

                    {/* Bottleneck Icon */}
                    <div className="flex flex-col items-center text-red-400 animate-pulse">
                        <Icons.AlertTriangle size={32} />
                        <span className="text-xs font-mono mt-1">LATENCY</span>
                    </div>

                    {/* Memory IO */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-32 bg-gradient-to-t from-red-500/20 to-red-500/5 rounded-lg border border-red-500/30 flex items-end justify-center relative overflow-hidden">
                            {/* The height of this bar represents the bottleneck */}
                            <div className="w-full bg-red-500/80" style={{ height: '15%' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-red-200 font-bold rotate-90">
                                Memory BW
                            </div>
                        </div>
                        <span className="text-sm text-red-300 font-bold">Memory I/O</span>
                    </div>
                </div>
                
                <div className="mt-4 text-center text-xs text-gray-400">
                    Data movement consumes <span className="text-red-400 font-bold">100x</span> more energy than arithmetic operations.
                </div>
            </div>

            {/* Bottom Section: Quantization Demo */}
            <div className="flex-[1.5] bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm flex flex-col relative">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Icons.Minimize2 className="text-green-400" size={20} />
                    Solution: Quantization
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                    Reducing precision to increase effective bandwidth and density.
                </p>

                {/* Format Selector / Indicator */}
                <div className="flex justify-between items-center mb-6 px-2">
                    {formats.map((f, i) => (
                        <div 
                            key={f.name}
                            onClick={() => setStep(i)}
                            className={`cursor-pointer transition-all duration-300 flex flex-col items-center gap-1 ${i === step ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70 scale-90'}`}
                        >
                            <div className={`w-3 h-3 rounded-full ${i === step ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-gray-600'}`} />
                            <span className={`text-[10px] font-mono font-bold ${i === step ? 'text-white' : 'text-gray-500'}`}>{f.name}</span>
                        </div>
                    ))}
                </div>

                {/* The Bit Bar Visualization */}
                <div className="flex-1 flex flex-col justify-center gap-4">
                    
                    {/* Format Info */}
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="text-4xl font-black text-white tracking-tighter transition-all duration-300">
                                {current.name}
                            </div>
                            <div className="text-sm text-green-400 font-mono">
                                {current.desc}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Effective Bandwidth</div>
                            <div className="text-2xl font-bold text-white font-mono">{current.bandwidth}</div>
                        </div>
                    </div>

                    {/* The Bar */}
                    <div className="h-16 w-full bg-gray-900/50 rounded-xl overflow-hidden flex relative border border-white/5 shadow-inner">
                        {bitBlocks.map((block, idx) => (
                            <div 
                                key={idx}
                                className={`${block.color} h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center relative group`}
                                style={{ width: `${block.width}%` }}
                            >
                                {block.type !== 'empty' && (
                                    <span className="text-[10px] font-bold text-black/70 opacity-0 group-hover:opacity-100 transition-opacity absolute whitespace-nowrap">
                                        {block.label}
                                    </span>
                                )}
                                {/* Grid lines for bits */}
                                {block.type !== 'empty' && (
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDBMMCAwTDAtNE0wIDBMMCA0IiBzdHJva2U9InJnYmEoMCwwLDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-20"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bit Legend */}
                    <div className="flex gap-4 mt-2 justify-center">
                        {current.s > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                                <span className="text-xs text-gray-400">Sign</span>
                            </div>
                        )}
                        {current.e > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                                <span className="text-xs text-gray-400">Exponent</span>
                            </div>
                        )}
                        {current.m > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                <span className="text-xs text-gray-400">{current.e === 0 ? 'Data' : 'Mantissa'}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-800 rounded-sm border border-gray-600"></div>
                            <span className="text-xs text-gray-400">Saved Space</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
