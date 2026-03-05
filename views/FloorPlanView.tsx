import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Map, Search, Navigation, Info, Maximize2, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Zone = 'cardio' | 'freeweights' | 'machines' | 'studio' | 'lockers' | 'reception';

interface ZoneData {
    id: Zone;
    name: string;
    color: string;
    items: string[];
    description: string;
}

const ZONES: Record<Zone, ZoneData> = {
    reception: { id: 'reception', name: 'Reception & Entry', color: 'fill-purple-500/20 stroke-purple-500', items: ['Check-in kiosk', 'Towels', 'Protein Bar'], description: 'Main entrance and welcome desk.' },
    cardio: { id: 'cardio', name: 'Cardio Zone', color: 'fill-blue-500/20 stroke-blue-500', items: ['Treadmills', 'Ellipticals', 'Stair Climbers', 'Rowing Machines'], description: 'High intensity cardio equipment area.' },
    freeweights: { id: 'freeweights', name: 'Free Weights', color: 'fill-red-500/20 stroke-red-500', items: ['Dumbbells', 'Barbells', 'Squat Racks', 'Benches'], description: 'Heavy lifting and free weight area.' },
    machines: { id: 'machines', name: 'Machines & Cables', color: 'fill-orange-500/20 stroke-orange-500', items: ['Leg Press', 'Lat Pulldown', 'Cable Crossover', 'Smith Machine'], description: 'Targeted resistance training machines.' },
    studio: { id: 'studio', name: 'Studio A', color: 'fill-green-500/20 stroke-green-500', items: ['Yoga Mats', 'Kettlebells', 'Steps', 'Resistance Bands'], description: 'Open space for classes and stretching.' },
    lockers: { id: 'lockers', name: 'Locker Rooms', color: 'fill-gray-500/20 stroke-gray-500', items: ['Lockers', 'Showers', 'Restrooms'], description: 'Changing rooms and personal storage.' },
};

const FloorPlanView: React.FC = () => {
    const { language } = useApp();
    const t = TRANSLATIONS[language];

    const [searchQuery, setSearchQuery] = useState('');
    const [activeZone, setActiveZone] = useState<Zone | null>(null);

    // Simple search logic
    const highlightedZones = React.useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        const matches: Zone[] = [];
        (Object.keys(ZONES) as Zone[]).forEach(key => {
            const zone = ZONES[key];
            if (zone.name.toLowerCase().includes(query) || zone.items.some(i => i.toLowerCase().includes(query))) {
                matches.push(key);
            }
        });
        return matches;
    }, [searchQuery]);

    const getZoneClass = (zoneId: Zone) => {
        const base = 'transition-all duration-300 cursor-pointer hover:opacity-100 ';
        const isActive = activeZone === zoneId;
        const isHighlighted = highlightedZones.includes(zoneId);

        if (isActive) return base + ZONES[zoneId].color + ' opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] stroke-[3px] scale-[1.01] origin-center';
        if (searchQuery && !isHighlighted) return base + 'fill-white/5 stroke-white/10 opacity-30';
        if (isHighlighted) return base + ZONES[zoneId].color + ' opacity-100 animate-pulse stroke-[2px]';

        return base + ZONES[zoneId].color + ' opacity-70 stroke-[1px]';
    };

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12 w-full max-w-6xl mx-auto h-[calc(100vh-100px)] min-h-[800px]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Navigation</h2>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1 flex items-center gap-3">
                        <Map className="text-blue-500" size={32} /> Gym Locator<span className="blue-gradient text-3xl lg:text-5xl">.</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full flex-1">

                {/* Left Column: Map */}
                <div className="lg:col-span-3 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-4 lg:p-8 shadow-2xl relative overflow-hidden flex flex-col">

                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="relative mb-6 z-10">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search for equipment (e.g., Treadmill, Dumbbells)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all font-bold text-white shadow-lg"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <Crosshair size={18} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-[#111] rounded-3xl border border-white/5 relative overflow-hidden p-4 sm:p-8 flex items-center justify-center min-h-[400px]">
                        {/* Minimalist 2D SVG Map */}
                        <svg viewBox="0 0 800 600" className="w-full h-full max-h-full drop-shadow-2xl">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {/* Building Outline */}
                            <rect x="50" y="50" width="700" height="500" rx="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />

                            {/* Reception */}
                            <g onClick={() => setActiveZone('reception')}>
                                <rect x="350" y="450" width="100" height="100" rx="10" className={getZoneClass('reception')} />
                                <text x="400" y="505" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" className="pointer-events-none">Entry</text>
                            </g>

                            {/* Locker Rooms */}
                            <g onClick={() => setActiveZone('lockers')}>
                                <rect x="50" y="400" width="200" height="150" rx="10" className={getZoneClass('lockers')} />
                                <text x="150" y="480" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" className="pointer-events-none">Lockers</text>
                            </g>

                            {/* Cardio Zone */}
                            <g onClick={() => setActiveZone('cardio')}>
                                <rect x="50" y="50" width="700" height="150" rx="10" className={getZoneClass('cardio')} />
                                <text x="400" y="130" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle" className="pointer-events-none uppercase tracking-widest">Cardio Zone</text>
                                {/* Decorative lines for treadmills */}
                                <rect x="100" y="80" width="30" height="60" rx="5" fill="rgba(255,255,255,0.1)" className="pointer-events-none" />
                                <rect x="150" y="80" width="30" height="60" rx="5" fill="rgba(255,255,255,0.1)" className="pointer-events-none" />
                                <rect x="200" y="80" width="30" height="60" rx="5" fill="rgba(255,255,255,0.1)" className="pointer-events-none" />
                                <rect x="250" y="80" width="30" height="60" rx="5" fill="rgba(255,255,255,0.1)" className="pointer-events-none" />
                            </g>

                            {/* Free Weights */}
                            <g onClick={() => setActiveZone('freeweights')}>
                                <rect x="450" y="220" width="300" height="200" rx="10" className={getZoneClass('freeweights')} />
                                <text x="600" y="325" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle" className="pointer-events-none uppercase tracking-widest">Free Weights</text>
                                <circle cx="550" cy="280" r="15" fill="rgba(255,255,255,0.1)" className="pointer-events-none" />
                                <circle cx="650" cy="280" r="15" fill="rgba(255,255,255,0.1)" className="pointer-events-none" />
                            </g>

                            {/* Machines */}
                            <g onClick={() => setActiveZone('machines')}>
                                <rect x="50" y="220" width="380" height="160" rx="10" className={getZoneClass('machines')} />
                                <text x="240" y="305" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle" className="pointer-events-none uppercase tracking-widest">Machines</text>
                            </g>

                            {/* Studio A */}
                            <g onClick={() => setActiveZone('studio')}>
                                <rect x="500" y="440" width="250" height="110" rx="10" className={getZoneClass('studio')} />
                                <text x="625" y="500" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" className="pointer-events-none uppercase tracking-widest">Studio A</text>
                            </g>

                        </svg>

                        {/* Hint Overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 pointer-events-none">
                            <Maximize2 size={14} className="text-gray-400" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tap a zone for details</span>
                        </div>

                    </div>
                </div>

                {/* Right Column: Zone Info Panel */}
                <div className="flex flex-col gap-4 h-full">
                    <AnimatePresence mode="wait">
                        {activeZone ? (
                            <motion.div
                                key={activeZone}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-full relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-full h-2 ${ZONES[activeZone].color.split(' ')[0].replace('fill-', 'bg-').replace('/20', '')}`} />

                                <div className="flex items-start justify-between mb-6 mt-2">
                                    <h2 className="text-2xl font-black text-white">{ZONES[activeZone].name}</h2>
                                    <button onClick={() => setActiveZone(null)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full cursor-pointer z-10 relative">
                                        <Crosshair size={18} />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-400 font-medium mb-8 leading-relaxed">
                                    {ZONES[activeZone].description}
                                </p>

                                <div className="flex bg-white/5 px-4 py-2 rounded-xl items-center gap-2 mb-4 w-fit border border-white/5">
                                    <Navigation size={14} className="text-blue-400" />
                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Available Equipment</span>
                                </div>

                                <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1">
                                    {ZONES[activeZone].items.map((item, idx) => {
                                        const isSearched = searchQuery && item.toLowerCase().includes(searchQuery.toLowerCase());
                                        return (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-2xl flex items-center justify-between transition-colors border ${isSearched ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black border-white/5'}`}
                                            >
                                                <span className={`${isSearched ? 'text-blue-400 font-black' : 'text-gray-300 font-bold'}`}>{item}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all">
                                    Navigate Here
                                </button>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#111] border border-white/5 border-dashed rounded-[2.5rem] p-6 shadow-xl flex flex-col items-center justify-center h-full opacity-50"
                            >
                                <Map size={48} className="text-gray-600 mb-4" />
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center">Select a zone on the map <br />to view details</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default FloorPlanView;
