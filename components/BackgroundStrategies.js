
const BackgroundStrategies = ({ isActive }) => {
    const [hovered, setHovered] = React.useState(null);

    const strategies = [
        {
            id: 'pruning',
            title: 'Pruning',
            icon: Icons.Scissors,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400',
            desc: 'Removing redundant connections to create sparse networks.',
            visual: (
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Network Graph */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        {/* Nodes */}
                        <circle cx="20" cy="20" r="4" className="fill-white" />
                        <circle cx="20" cy="80" r="4" className="fill-white" />
                        <circle cx="80" cy="50" r="4" className="fill-white" />
                        
                        {/* Edges - Some solid, some dashed/fading */}
                        <line x1="20" y1="20" x2="80" y2="50" stroke="white" strokeWidth="2" />
                        <line x1="20" y1="80" x2="80" y2="50" stroke="white" strokeWidth="2" strokeDasharray="4 4" className="opacity-30" />
                        
                        {/* Scissors Icon Overlay */}
                        <foreignObject x="35" y="60" width="20" height="20">
                            <div className="text-yellow-400 animate-bounce">
                                <Icons.Scissors size={20} />
                            </div>
                        </foreignObject>
                    </svg>
                </div>
            )
        },
        {
            id: 'distillation',
            title: 'Distillation',
            icon: Icons.Users,
            color: 'text-purple-400',
            bg: 'bg-purple-400',
            desc: 'Transferring knowledge from a large "Teacher" to a small "Student".',
            visual: (
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Teacher */}
                    <div className="absolute top-0 right-0 w-12 h-12 rounded-full border-2 border-purple-500/50 flex items-center justify-center bg-purple-900/20">
                        <span className="text-[8px] text-purple-300">Teacher</span>
                    </div>
                    {/* Student */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center bg-white/10">
                        <span className="text-[6px] text-white">Student</span>
                    </div>
                    {/* Flow */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path d="M 60 20 Q 40 40 30 70" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                    </svg>
                    <style>{`
                        @keyframes dash {
                            to { stroke-dashoffset: -8; }
                        }
                    `}</style>
                </div>
            )
        },
        {
            id: 'quantization',
            title: 'Quantization',
            icon: Icons.Minimize2,
            color: 'text-green-400',
            bg: 'bg-green-400',
            desc: 'Reducing numerical precision (e.g., FP32 → INT8) to save memory.',
            visual: (
                <div className="relative w-24 h-24 flex items-center justify-center gap-2">
                    {/* High Res Block */}
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur-[1px] opacity-50 scale-75"></div>
                    <Icons.ArrowRight className="text-gray-500 w-4 h-4" />
                    {/* Low Res Block */}
                    <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-0.5">
                        <div className="bg-green-500"></div>
                        <div className="bg-green-500/80"></div>
                        <div className="bg-green-500/60"></div>
                        <div className="bg-green-500/40"></div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="w-full h-full flex flex-col justify-center p-8">
            <div className="grid grid-cols-1 gap-6">
                {strategies.map((s) => (
                    <div 
                        key={s.id}
                        onMouseEnter={() => setHovered(s.id)}
                        onMouseLeave={() => setHovered(null)}
                        className={`
                            relative overflow-hidden rounded-xl border transition-all duration-500 group
                            ${hovered === s.id ? 'bg-white/10 border-white/30 scale-105 shadow-2xl z-10' : 'bg-white/5 border-white/10 scale-100'}
                            flex items-center p-4 gap-6 cursor-default
                        `}
                    >
                        {/* Icon/Visual Container */}
                        <div className={`
                            w-20 h-20 shrink-0 rounded-lg flex items-center justify-center
                            bg-gray-900/50 border border-white/5
                            ${hovered === s.id ? 'scale-110' : ''} transition-transform duration-500
                        `}>
                            {s.visual}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 ${s.color}`}>
                                <s.icon size={18} />
                                {s.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {s.desc}
                            </p>
                        </div>

                        {/* Background Glow */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r from-transparent via-${s.bg.replace('bg-', '')} to-transparent`} />
                    </div>
                ))}
            </div>
        </div>
    );
};
