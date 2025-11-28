const { useState, useEffect, useRef, useMemo } = React;

const ExperimentsRevamped = () => {
    const [tab, setTab] = useState('imagenet');
    const [imgScale, setImgScale] = useState('Nano'); // Nano, Tiny, Small, Medium, Large
    const [expandedItem, setExpandedItem] = useState(null); // { type, index }
    const [expandedSection, setExpandedSection] = useState(null); // 'structural' or 'optimization'

    // Data extracted from Table II
    const imagenetData = {
        'Nano': [
            { name: 'XNOR-Net', params: 4.2, ops: 1.47, acc: 51.2 },
            { name: 'Bi-Real-18', params: 4.2, ops: 1.65, acc: 56.4 },
            { name: 'RAD-BNN-18', params: 4.3, ops: 1.74, acc: 65.6 },
            { name: 'AdaBin-18', params: 4.35, ops: 1.70, acc: 66.4 },
            { name: 'BEANet-nano', params: 4.09, ops: 0.34, acc: 66.8, highlight: true, badge: 'SOTA' }
        ],
        'Tiny': [
            { name: 'Bi-Real-34', params: 5.1, ops: 1.94, acc: 62.2 },
            { name: 'ReCU-34', params: 5.1, ops: 1.94, acc: 65.1 },
            { name: 'APD-BNN-34', params: 5.4, ops: 1.94, acc: 66.8 },
            { name: 'BNext-18', params: 5.4, ops: 1.64, acc: 68.4 },
            { name: 'BEANet-tiny', params: 5.4, ops: 0.51, acc: 70.5, highlight: true, badge: 'SOTA' }
        ],
        'Small': [
            { name: 'ReActNet-A', params: 7.4, ops: 0.87, acc: 69.4 },
            { name: 'AdaBin-A', params: 7.9, ops: 0.88, acc: 70.4 },
            { name: 'INSTA-BNN+', params: 8.9, ops: 0.96, acc: 72.2 },
            { name: 'BEANet-small', params: 7.53, ops: 0.71, acc: 72.4, highlight: true, badge: 'SOTA' }
        ],
        'Medium': [
            { name: 'BNext-T', params: 13.3, ops: 0.89, acc: 72.4 },
            { name: 'BEANet-medium', params: 10.5, ops: 1.08, acc: 74.6, highlight: true, badge: 'SOTA' }
        ],
        'Large': [
            { name: 'MeliusNet-59', params: 17.4, ops: 5.32, acc: 71.0 },
            { name: 'AdaBin-59', params: 17.4, ops: 5.34, acc: 71.6 },
            { name: 'BNext-S', params: 26.7, ops: 1.90, acc: 76.1 },
            { name: 'BEANet-large', params: 17.0, ops: 1.86, acc: 77.1, highlight: true, badge: 'SOTA' }
        ]
    };

    // Data from Table III & IV
    const cifarData = [
        { 
            title: "ResNet-20 (CIFAR-10)", 
            data: [
                { name: "DSQ", acc: 84.1 },
                { name: "IR-Net", acc: 86.5 },
                { name: "BiPer", acc: 87.5 },
                { name: "AdaBin", acc: 88.2 },
                { name: "BEANet", acc: 88.52, highlight: true }
            ]
        },
        { 
            title: "STE Variants (ResNet-18)", 
            data: [
                { name: "Piecewise", acc: 85.81 },
                { name: "EDE", acc: 89.35 },
                { name: "ReSTE", acc: 89.56 },
                { name: "ExSTE (Ours)", acc: 90.37, highlight: true }
            ]
        }
    ];

    // Data from Table V (Component Impact - Negative Deltas)
    // Baseline: BEANet-nano (Stage 3) = 63.96%
    const componentImpact = [
        { name: "Replace ABConv w/ BConv", delta: -2.23, desc: "Standard Binary Conv" },
        { name: "Replace Float SE w/ Binary SE", delta: -2.18, desc: "Quantized SE" },
        { name: "Remove SE Module", delta: -1.76, desc: "No Channel Attn" },
        { name: "Use SPR instead of SE", delta: -0.87, desc: "Complex Attn Module" },
        { name: "Pre-norm Architecture", delta: -0.64, desc: "BN before Conv" },
        { name: "Pre-Pool Downsampling", delta: -0.57, desc: "Early Pooling" },
        { name: "Replace Hybrid Act w/ PReLU", delta: -0.36, desc: "Less Flexible Act" },
    ];

    // Data from Table VI (Optimization Gains - Positive Deltas)
    const trainingGains = [
        { name: "Baseline (CE Loss)", val: 62.19, delta: 0 },
        { name: "+ Distillation", val: 63.44, delta: 1.25 },
        { name: "+ GT Correction", val: 63.58, delta: 0.14 },
        { name: "+ Cosine Weight", val: 63.96, delta: 0.38 },
        { name: "+ Long Training (512ep)", val: 66.83, delta: 2.87 }
    ];

    return (
        <div className="w-full flex flex-col gap-6 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <style>{`
                @keyframes slideInUpShort {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in-up { animation: slideInUpShort 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
                
                @keyframes shimmer {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    100% { transform: translateX(250%) skewX(-20deg); }
                }
                .animate-shimmer { animation: shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            `}</style>
            <div className="relative flex p-1 bg-white/5 rounded-full self-start backdrop-blur-sm border border-white/10 w-full max-w-md">
                {/* Liquid Glass Background */}
                <div 
                    className="absolute top-1 bottom-1 rounded-full bg-sky-600 shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] backdrop-blur-md"
                    style={{
                        width: 'calc((100% - 8px) / 3)',
                        left: tab === 'imagenet' ? '4px' : tab === 'cifar' ? 'calc(4px + (100% - 8px) / 3)' : 'calc(4px + 2 * (100% - 8px) / 3)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full"></div>
                </div>

                {['imagenet', 'cifar', 'ablation'].map((key, idx) => (
                    <button 
                        key={key} 
                        onClick={()=>setTab(key)} 
                        className={`relative z-10 flex-1 flex items-center justify-center px-6 py-2 rounded-full text-sm font-bold uppercase transition-colors duration-300 magnetic-target ${tab===key ? 'text-white text-shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        {key}
                    </button>
                ))}
            </div>
            
            <div key={tab} className="w-full bg-black/20 border border-white/5 rounded-2xl p-6 relative animate-slide-in-up">
                
                {/* IMAGENET TAB */}
                {tab === 'imagenet' && (
                    <div className="animate-fade-in">
                        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto">
                            {Object.keys(imagenetData).map(scaleKey => (
                                <button 
                                    key={scaleKey} 
                                    onClick={()=>setImgScale(scaleKey)}
                                    className={`px-4 py-1 rounded-full text-xs font-mono transition-colors magnetic-target ${imgScale===scaleKey ? 'bg-white text-black font-bold' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {scaleKey}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-12 gap-4 text-[10px] text-gray-500 uppercase font-mono mb-2 px-2">
                            <div className="col-span-3">Model</div>
                            <div className="col-span-2 text-right">Params (MB)</div>
                            <div className="col-span-2 text-right">OPs ($10^8$)</div>
                            <div className="col-span-5 pl-4">Top-1 Accuracy (%)</div>
                        </div>

                        <div key={imgScale} className="flex flex-col gap-3">
                            {imagenetData[imgScale].map((d, i) => (
                                <div key={i} 
                                     className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg border ${d.highlight ? 'border-sky-500/50 bg-sky-900/10' : 'border-transparent bg-white/5'} hover:bg-white/10 transition-all magnetic-target group animate-slide-in-up`}
                                     style={{animationDelay: `${i * 100}ms`}}
                                >
                                    <div className={`col-span-3 text-xs ${d.highlight ? 'text-sky-400 font-bold' : 'text-gray-300'}`}>
                                        {d.name} {d.badge && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded font-bold">{d.badge}</span>}
                                    </div>
                                    <div className="col-span-2 text-right text-xs font-mono text-gray-400">{d.params}</div>
                                    <div className="col-span-2 text-right text-xs font-mono text-gray-400">{d.ops}</div>
                                    <div className="col-span-5 pl-4 relative h-6">
                                            <div className="h-full bg-gray-800 rounded-sm overflow-hidden relative">
                                                <div 
                                                className={`h-full flex items-center justify-end pr-2 transition-all duration-1000 ${d.highlight ? 'bg-sky-500' : 'bg-gray-600 group-hover:bg-gray-500'}`} 
                                                style={{width: `${(d.acc/80)*100}%`}}
                                                >
                                                    <span className="text-[10px] text-white font-bold drop-shadow-md">{d.acc}%</span>
                                                </div>
                                            </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[10px] text-gray-500 text-center">Data Source: Table II of BEANet Paper. OPs = FLOPs + 1/64 BOPs.</p>
                    </div>
                )}

                {/* CIFAR TAB */}
                {tab === 'cifar' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in h-full content-start">
                        {cifarData.map((section, idx) => (
                            <div key={idx} className="flex flex-col gap-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    {section.title}
                                </h3>
                                <div className="grid gap-3">
                                    {section.data.map((d, i) => (
                                        <div key={i} 
                                             className={`relative p-3 rounded-xl border backdrop-blur-sm transition-all duration-500 magnetic-target group animate-fade-in-up
                                                ${d.highlight ? 'bg-sky-900/20 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                             `}
                                             style={{animationDelay: `${i * 100}ms`}}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-xs font-bold ${d.highlight ? 'text-sky-300' : 'text-gray-400'}`}>{d.name}</span>
                                                <span className={`text-xs font-mono ${d.highlight ? 'text-white font-black' : 'text-gray-500'}`}>{d.acc}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${d.highlight ? 'bg-gradient-to-r from-sky-500 to-sky-300 shadow-[0_0_10px_#0ea5e9]' : 'bg-gray-600 group-hover:bg-gray-500'}`}
                                                    style={{width: `${(d.acc/92)*100}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <div className="p-4 border border-yellow-500/30 bg-yellow-900/10 rounded-xl flex items-start gap-3 animate-fade-in-up" style={{animationDelay: '600ms'}}>
                                <Icons.Zap className="text-yellow-400 shrink-0 mt-0.5" size={16} />
                                <div>
                                    <p className="text-xs text-yellow-200 mb-1 font-bold">Insight: ExSTE Stability</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">ExSTE achieves <span className="text-white font-bold">90.37%</span> on ResNet-18, outperforming ReSTE and EDE by providing a smoother gradient transition from Identity to Sign function.</p>
                                </div>
                            </div>
                        </div>
                        </div>
                )}

                {/* ABLATION TAB (VERTICAL LAYOUT) */}
                {tab === 'ablation' && (
                    <div className="w-full h-full flex flex-col gap-4 p-2 overflow-y-auto no-scrollbar animate-fade-in-up">
                        
                        {/* Section 1: Structural Dependencies */}
                        {/* Section 1: Structural Dependencies */}
                        <div className="flex flex-col bg-white/5 rounded-2xl border border-white/5 overflow-hidden shrink-0 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                            {/* Section Header */}
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'structural' ? null : 'structural')}
                                className="flex items-center justify-between p-4 w-full text-left hover:bg-white/5 transition-colors magnetic-target"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                                        <Icons.Layers size={18} className="text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-wider uppercase">Structural Dependencies</h3>
                                        <p className="text-[10px] text-red-300/70 font-mono">COMPONENT CRITICALITY ANALYSIS</p>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 ${expandedSection === 'structural' ? 'rotate-180' : ''}`}>
                                    <Icons.ChevronDown className="text-gray-400" />
                                </div>
                            </button>

                            {/* Section Content */}
                            <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${expandedSection === 'structural' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 pt-0 space-y-2">
                                    {componentImpact.map((item, idx) => {
                                        const isExpanded = expandedItem?.type === 'structural' && expandedItem?.index === idx;
                                        const isDimmed = expandedItem && !isExpanded;
                                        const intensity = Math.min(Math.abs(item.delta) / 2.5, 1); 

                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => setExpandedItem(isExpanded ? null : {type: 'structural', index: idx})}
                                                className={`relative rounded-xl border transition-all duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer magnetic-target group/item overflow-hidden
                                                    ${isExpanded ? 'h-40 bg-red-950/30 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.15)] z-10 scale-[1.02] my-4' : 'h-14 bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'}
                                                    ${isDimmed ? 'opacity-30 grayscale scale-95 blur-[1px]' : 'opacity-100'}
                                                `}
                                            >
                                                {/* Shimmer Effect */}
                                                {isExpanded && (
                                                    <div className="absolute inset-0 z-0 pointer-events-none">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-shimmer w-[50%] h-full"></div>
                                                    </div>
                                                )}

                                                {/* Background Gradient */}
                                                <div 
                                                    className={`absolute top-0 right-0 bottom-0 bg-gradient-to-l from-red-900/20 to-transparent transition-all duration-1000 ${isExpanded ? 'w-full opacity-20' : 'opacity-100'}`}
                                                    style={{ width: isExpanded ? '100%' : `${intensity * 100}%` }}
                                                ></div>

                                                <div className="relative z-10 p-3 h-full flex flex-col">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className={`font-bold transition-all duration-500 ${isExpanded ? 'text-lg text-white' : 'text-xs text-gray-200'}`}>
                                                                {item.name}
                                                            </span>
                                                            {!isExpanded && (
                                                                <span className="text-[9px] text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                                                    {item.desc}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col items-end">
                                                            <span className={`font-mono font-black text-red-400 transition-all duration-500 ${isExpanded ? 'text-2xl drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-sm'}`}>
                                                                {item.delta}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Content */}
                                                    <div className={`mt-4 space-y-3 transition-all duration-700 delay-100 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                                        <div className="text-xs text-gray-300 leading-relaxed border-l-2 border-red-500/50 pl-3">
                                                            {item.desc}. Removing or altering this component results in a significant performance drop, highlighting its critical role in the BEANet architecture.
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] font-mono text-gray-500 uppercase">Impact Level</div>
                                                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-red-600 to-red-400" style={{width: `${intensity*100}%`}}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Optimization Trajectory */}
                        {/* Section 2: Optimization Trajectory */}
                        <div className="flex flex-col bg-white/5 rounded-2xl border border-white/5 overflow-hidden shrink-0 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                            {/* Section Header */}
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'optimization' ? null : 'optimization')}
                                className="flex items-center justify-between p-4 w-full text-left hover:bg-white/5 transition-colors magnetic-target"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                                        <Icons.TrendingUp size={18} className="text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-wider uppercase">Optimization Trajectory</h3>
                                        <p className="text-[10px] text-green-300/70 font-mono">ACCURACY EVOLUTION LOG</p>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 ${expandedSection === 'optimization' ? 'rotate-180' : ''}`}>
                                    <Icons.ChevronDown className="text-gray-400" />
                                </div>
                            </button>

                            {/* Section Content */}
                            <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${expandedSection === 'optimization' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 pt-0 pl-8 relative space-y-4">
                                    {/* Continuous Line */}
                                    <div className="absolute left-[27px] top-0 bottom-8 w-0.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-green-500/20 via-green-400 to-green-500 animate-[flow-dash_3s_linear_infinite] h-[200%]"></div>
                                    </div>

                                    {trainingGains.map((step, idx) => {
                                        const isLast = idx === trainingGains.length - 1;
                                        const isExpanded = expandedItem?.type === 'optimization' && expandedItem?.index === idx;
                                        const isDimmed = expandedItem && !isExpanded;

                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => setExpandedItem(isExpanded ? null : {type: 'optimization', index: idx})}
                                                className={`relative flex items-start gap-4 group cursor-pointer magnetic-target transition-all duration-500
                                                    ${isDimmed ? 'opacity-30 grayscale blur-[1px]' : 'opacity-100'}
                                                `}
                                            >
                                                {/* Node */}
                                                <div className={`relative z-10 w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-500 mt-3
                                                    ${isLast ? 'bg-green-500 border-white shadow-[0_0_15px_#22c55e]' : 'bg-gray-900 border-green-500/30 group-hover:border-green-400'}
                                                    ${isExpanded ? 'scale-125 border-white' : ''}
                                                `}>
                                                    <div className={`w-2 h-2 rounded-full ${isLast ? 'bg-white animate-pulse' : 'bg-green-500'}`}></div>
                                                </div>

                                                {/* Card */}
                                                <div className={`flex-1 rounded-xl border backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden
                                                    ${isExpanded ? 'h-32 bg-green-900/20 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'h-12 bg-white/5 border-white/5 hover:bg-white/10'}
                                                    ${isLast && !isExpanded ? 'bg-green-500/10 border-green-500/30' : ''}
                                                `}>
                                                    <div className="p-3 h-full flex flex-col">
                                                        <div className="flex justify-between items-center">
                                                            <div className={`font-bold transition-all ${isExpanded ? 'text-base text-white' : 'text-xs text-gray-300'}`}>
                                                                {step.name}
                                                            </div>
                                                            <div className={`font-mono font-black transition-all ${isExpanded ? 'text-xl text-green-400' : 'text-sm text-gray-400'}`}>
                                                                {step.val}%
                                                            </div>
                                                        </div>

                                                        {/* Expanded Content */}
                                                        <div className={`mt-3 space-y-2 transition-all duration-500 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                                            <div className="flex justify-between text-[10px] text-gray-400 font-mono uppercase">
                                                                <span>Contribution</span>
                                                                <span className="text-green-400">+{step.delta}%</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-green-600 to-green-400"
                                                                    style={{ width: `${((step.val - 60) / 20) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
