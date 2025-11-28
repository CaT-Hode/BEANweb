const { useState, useEffect, useRef, useMemo } = React;

const NetworkNode = ({ type, label, subLabel, isActive, onClick }) => {
    const colors = {
        conv: 'border-sky-500 bg-sky-900/20 text-sky-300 shadow-sky-500/20',
        bn: 'border-green-500 bg-green-900/20 text-green-300 shadow-green-500/20',
        act: 'border-pink-500 bg-pink-900/20 text-pink-300 shadow-pink-500/20',
        se: 'border-yellow-500 bg-yellow-900/20 text-yellow-300 shadow-yellow-500/20',
        add: 'border-white/50 bg-white/10 text-white',
    };
    const style = colors[type] || colors.conv;
    
    return (
        <div onClick={onClick} className={`relative flex flex-col items-center justify-center w-24 h-20 rounded-lg border ${style} transition-all duration-300 cursor-pointer magnetic-target shadow-lg hover:scale-110 hover:shadow-xl ${isActive ? 'ring-2 ring-white scale-105' : 'opacity-90'}`}>
            <span className="text-[9px] uppercase tracking-wider opacity-70">{subLabel}</span>
            <span className="font-bold text-xs text-center px-1 leading-tight">{label}</span>
        </div>
    );
}
