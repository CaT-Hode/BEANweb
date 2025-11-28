

const Wire = ({ vertical }) => vertical ? 
    <div className="w-px h-6 bg-gray-700 relative overflow-hidden mx-auto"><div className="absolute inset-0 bg-sky-400 animate-[fade-in_1.5s_infinite]"></div></div> :
    <div className="h-px w-6 bg-gray-700 relative overflow-hidden self-center"><div className="absolute inset-0 bg-sky-400 animate-[flow-dash_1.5s_infinite]"></div></div>;
