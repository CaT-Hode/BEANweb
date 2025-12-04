
const BackgroundQuantization = ({ isActive }) => {
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
        }, 2500); // Slightly faster cycle
        return () => clearInterval(interval);
    }, [isActive]);

    const current = formats[step];

    // Helper to render bits
    const renderBits = (fmt) => {
        const blocks = [];
        
        if (fmt.s > 0) {
            blocks.push({ type: 'sign', width: (fmt.s / 32) * 100, color: 'bg-red-500', label: 'S' });
        }
        if (fmt.e > 0) {
            blocks.push({ type: 'exp', width: (fmt.e / 32) * 100, color: 'bg-green-500', label: 'Exp' });
        }
        if (fmt.m > 0) {
            const color = fmt.e === 0 ? 'bg-white' : 'bg-blue-500';
            const label = fmt.e === 0 ? 'Int' : 'Mantissa';
            blocks.push({ type: 'mantissa', width: (fmt.m / 32) * 100, color: color, label: label });
        }

        const usedBits = fmt.s + fmt.e + fmt.m;
        const emptyBits = 32 - usedBits;
        if (emptyBits > 0) {
            blocks.push({ type: 'empty', width: (emptyBits / 32) * 100, color: 'bg-gray-800/20', label: 'Saved' });
        }

        return blocks;
    };

    const bitBlocks = renderBits(current);

    return (
        <div className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden rounded-3xl border border-white/10">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8 z-10">
                <div>
                    <h3 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <Icons.Minimize2 className="text-green-400" size={32} />
                        Quantization Spectrum
                    </h3>
                    <p className="text-gray-400 font-light">
                        From standard precision to extreme compression.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Bandwidth Gain</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                        {current.bandwidth}
                    </div>
                </div>
            </div>

            {/* Main Visualization Area */}
            <div className="flex-1 flex flex-col justify-center gap-8 z-10">
                
                {/* Format Name & Description */}
                <div className="text-center">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter transition-all duration-300">
                        {current.name}
                    </div>
                    <div className="text-xl text-green-400 font-mono mt-2">
                        {current.desc}
                    </div>
                </div>

                {/* The Bit Bar */}
                <div className="w-full h-32 bg-gray-900/80 rounded-2xl overflow-hidden flex relative border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    {bitBlocks.map((block, idx) => (
                        <div 
                            key={idx}
                            className={`${block.color} h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center relative group`}
                            style={{ width: `${block.width}%` }}
                        >
                            {block.type !== 'empty' && (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">
                                        {block.label}
                                    </span>
                                    {/* Bit Count */}
                                    <span className="text-[10px] font-mono text-black/50">
                                        {Math.round((block.width / 100) * 32)} bits
                                    </span>
                                </div>
                            )}
                            
                            {/* Grid Texture */}
                            {block.type !== 'empty' && (
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDBMMCAwTDAtNE0wIDBMMCA0IiBzdHJva2U9InJnYmEoMCwwLDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-20"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Timeline / Selector */}
                <div className="flex justify-between items-center px-4 mt-4">
                    {formats.map((f, i) => (
                        <div 
                            key={f.name}
                            onClick={() => setStep(i)}
                            className={`cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 group ${i === step ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-60 scale-90'}`}
                        >
                            <div className={`w-2 h-8 rounded-full transition-colors duration-300 ${i === step ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-gray-600 group-hover:bg-gray-500'}`} />
                            <span className={`text-[10px] font-mono font-bold ${i === step ? 'text-white' : 'text-gray-500'}`}>{f.name}</span>
                        </div>
                    ))}
                </div>

            </div>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.05)_0%,transparent_70%)] pointer-events-none" />
        </div>
    );
};
