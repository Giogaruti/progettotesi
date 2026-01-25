import React, { useState, useEffect, useRef } from 'react';
import { MapView, useMapData, useMap, Navigation, useMapViewEvent } from '@mappedin/react-sdk';
import { BlueDot } from '@mappedin/blue-dot';
import { useDynamicFocus } from '@mappedin/dynamic-focus/react';

const options = {
    key: "mik_PR3UXAsnl3a6LnTRK511b0726",
    secret: "mis_e9JbalSWHAgWYLbTTirFvRXBrfjWexqvo14akJw9yzi98161136",
    mapId: "689f7c80dc0905000b1393fe",
};

const UNIBO_RED = "#bb2e29";
const UNIBO_WHITE = "#ffffff";
const UNIBO_BLACK = "#000000";

// --- LISTE STANZE PER EDIFICIO ---
const STANZE_E1 = ["Aula 0.4", "Aula 0.5", "Aula 0.6", "Aula 0.7", "Aula 0.8", "Aula 2.8", "Aula 3.4", "Lab 0", "Lab 2", "Lab 4", "Lab 5", "Lab 9", "Sala studio 0.3", "Sala studio 0.4", "Bar"]; 
const STANZE_E2 = ["Aula 4.1", "Aula 4.2", "Mensa"]; 
const STANZE_E3 = ["Aula I", "Aula II", "Aula III", "Aula IX", "Aula V", "Aula VI", "Aula VII", "Aula VIII"];
const STANZE_E4 = ["Aula 8.1"];

// --- CATEGORIE PERSONALIZZATE ---
const CATEGORIES = [
    { 
        id: 'aule', 
        label: 'Aule', 
        icon: '📖', 
        items: [
            "Aula 0.4", "Aula 0.5", "Aula 0.6", "Aula 0.7", "Aula 0.8", 
            "Aula 2.8", "Aula 3.4", "Aula 4.1", "Aula 4.2", "Aula 8.1",
            "Aula I", "Aula II", "Aula III", "Aula V", "Aula VI", "Aula VII", "Aula VIII", "Aula IX"
        ] 
    },
    { id: 'lab', label: 'Laboratori', icon: '💻', items: ["Lab 0", "Lab 2", "Lab 4", "Lab 5", "Lab 9"] },
    { id: 'ristoro', label: 'Ristoro', icon: '☕', items: ["Bar", "Mensa"] },
    { id: 'servizi', label: 'Servizi', icon: '🚻', items: ["Sala studio 0.3", "Sala studio 0.4", "Biblioteca Dore", "Toilette M", "Toilette F", "Toilette M+H"] },
    { id: 'trasporti', label: 'Trasporti', icon: '🚌', items: ["Porta Saragozza - Risorgimento #7001", "Porta Saragozza - Risorgimento #7002", "Porta Saragozza - Villa Cassarini #44", "Porta Saragozza - Villa Cassarini #47", "Aldini #42", "Aldini #49", "Nosadella #756", "Nosadella #759", "Porta Saragozza - Frassinago #711", "Taxi", "Rastrelliera", "Riparazione bici"] },
    { id: 'aree_verdi', label: 'Aree Verdi', icon: '🌳', items: ["Giardino di Villa Cassarini", "Parco di Ingegneria"] }
];

// --- MAPPATURA COLORI PASTELLO SOFT ---
const BUILDING_INTERACTION = {
    'fc_94b7a4dd7fee1f8f': { name: "E1 + E2", color: "#B3D9D9" }, 
    'fc_94b7a4dd7fee1f8a': { name: "E1 + E2", color: "#B3D1C6" }, 
    'fc_7a4dd7fee1f8f330': { name: "E3", color: "#F9D0C2" },      
    'fc_dd7fee1f8f330c42': { name: "E4", color: "#C2C9E0" },      
    'default': "#B3E8FF"                                         
};

function SmartWayfinding({ blueDotInstance }) {
    const { mapView, mapData } = useMap();
    const [startQuery, setStartQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");
    const [suggestions, setSuggestions] = useState({ start: [], dest: [] });
    const [directions, setDirections] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [panelState, setPanelState] = useState('partial');
    const [activeCategory, setActiveCategory] = useState(null);
    const [choiceModal, setChoiceModal] = useState(null); 

    const dragStartY = useRef(0);
    const isDragging = useRef(false);

    useMapViewEvent("click", (event) => {
        // 1. Se clicco sulla mappa e il pannello è FULL, diventa PARTIAL
        if (panelState === 'full') {
            setPanelState('partial');
            setActiveCategory(null);
        }

        const space = event.spaces?.[0];
        const poi = event.pointsOfInterest?.[0];
        const target = poi || space;

        if (target && target.name) {
            setSelectedRoom({
                name: target.name,
                description: target.locationProfiles?.[0]?.description || (poi ? "Punto di interesse esterno." : ""),
                image: target.locationProfiles?.[0]?.logoImage || null,
                target: target
            });
            mapView.Camera.focusOn(target);
        } else {
            setSelectedRoom(null);
        }
    });

    useMapViewEvent("click", (event) => {
        const space = event.spaces?.[0];
        const poi = event.pointsOfInterest?.[0];
        const target = poi || space;

        if (target && target.name) {
            const profile = target.locationProfiles?.[0];
            setSelectedRoom({
                name: target.name,
                description: profile?.description || (poi ? "Punto di interesse esterno." : ""),
                image: profile?.logoImage || null,
                target: target
            });
            mapView.Camera.focusOn(target);
            if (panelState === 'full') setPanelState('partial');
        } else {
            setSelectedRoom(null);
        }
    });

    const getSuggestions = async (query, type) => {
        if (!query || query.length < 2) {
            setSuggestions(prev => ({ ...prev, [type]: [] }));
            return;
        }
        try {
            const results = await mapData.Search.query(query);
            const places = results.places?.map(p => p.item.name) || [];
            setSuggestions(prev => ({ ...prev, [type]: [...new Set(places)] }));
        } catch (e) {
            if (e.name !== 'AbortError') console.error(e);
        }
    };

    const startNavigation = async (startName, destName) => {
        const allSpaces = mapData.getByType("space");
        const allPois = mapData.getByType("point-of-interest");
        const destination = allSpaces.find(s => s.name === destName) || allPois.find(p => p.name === destName);
        let departure = startName === "Mia Posizione" 
            ? blueDotInstance?.position?.coordinate 
            : (allSpaces.find(s => s.name === startName) || allPois.find(p => p.name === startName));

        if (departure && destination) {
            try {
                const result = await mapData.getDirections(departure, destination);
                if (result) {
                    setDirections(result);
                    mapView.Camera.focusOn(result.coordinates);
                    setPanelState('partial');
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.error(e);
            }
        }
        setSuggestions({ start: [], dest: [] });
    };

    const handleLocationChoice = (name) => {
        const allSpaces = mapData.getByType("space");
        const allPois = mapData.getByType("point-of-interest");
        const target = allSpaces.find(s => s.name === name) || allPois.find(p => p.name === name);
        
        if (target) {
            mapView.Camera.focusOn(target);
            setChoiceModal({ name, target });
        }
    };

    const clearRoute = () => {
        setDirections(null);
        setStartQuery("");
        setDestQuery("");
        setSelectedRoom(null);
        setSuggestions({ start: [], dest: [] });
    };

    const handleDragStart = (y) => {
        dragStartY.current = y;
        isDragging.current = true;
    };

    const handleDragEnd = (y) => {
        if (!isDragging.current) return;
        const deltaY = dragStartY.current - y;
        isDragging.current = false;
        if (deltaY > 50) {
            if (panelState === 'closed') setPanelState('partial');
            else if (panelState === 'partial') setPanelState('full');
        } else if (deltaY < -50) {
            if (panelState === 'full') {
                if (activeCategory) setActiveCategory(null);
                else setPanelState('partial');
            }
            else if (panelState === 'partial') setPanelState('closed');
        }
    };

    return (
        <div className="mobile-interface-container">
            <style>{`
                .mobile-interface-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; font-family: -apple-system, sans-serif; }
                .top-details-overlay { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: white; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 2000; pointer-events: auto; overflow: hidden; animation: slideDown 0.3s ease-out; }
                @keyframes slideDown { from { transform: translate(-50%, -100%); } to { transform: translate(-50%, 0); } }
                .top-details-content { padding: 15px; display: flex; align-items: center; gap: 15px; }
                .top-details-img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; background: #f0f0f0; }
                .top-details-info { flex: 1; }
                .top-details-info h3 { margin: 0; font-size: 18px; color: ${UNIBO_BLACK} !important; }
                .top-details-info p { margin: 3px 0 0; font-size: 13px; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .top-close-btn { background: #f0f0f0; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; color: ${UNIBO_BLACK}; }

                .bottom-sheet { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 20px; box-shadow: 0 -5px 20px rgba(0,0,0,0.1); z-index: 1000; pointer-events: auto; transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); display: flex; flex-direction: column; }
                .bottom-sheet.closed { transform: translateY(calc(100% - 45px)); }
                .bottom-sheet.partial { transform: translateY(calc(100% - 250px)); } /* Altezza aumentata per far spazio al tasto annulla */
                .bottom-sheet.full { transform: translateY(0); height: 75vh; }

                .drag-handle-container { width: 100%; height: 40px; display: flex; justify-content: center; align-items: center; cursor: grab; user-select: none; flex-shrink: 0; }
                .drag-handle { width: 40px; height: 5px; background: rgba(0,0,0,0.1); border-radius: 10px; }

                .search-section { padding: 0 16px 15px; flex-shrink: 0; }
                .search-input-wrapper { background: rgba(118, 118, 128, 0.12); border-radius: 12px; display: flex; align-items: center; padding: 10px 12px; margin-bottom: 8px; position: relative; }
                .search-input-wrapper input { background: transparent; border: none; width: 100%; font-size: 16px; outline: none; color: ${UNIBO_BLACK} !important; margin-left: 8px; padding-right: 30px; }
                .clear-input-btn { position: absolute; right: 12px; background: #bbb; color: white; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                
                .btn-nav { width: 100%; padding: 12px; background: ${UNIBO_RED}; color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; }

                .categories-section { padding: 10px 16px; overflow-y: auto; flex-grow: 1; }
                .categories-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px; }
                .category-item { background: white; padding: 15px 5px; border-radius: 15px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); cursor: pointer; }
                .category-icon { font-size: 24px; margin-bottom: 5px; display: block; }
                .category-label { font-size: 12px; font-weight: 600; color: ${UNIBO_BLACK} !important; }

                .subcategory-list { list-style: none; padding: 0; margin: 10px 0; border-top: 1px solid #eee; }
                .subcategory-item { padding: 14px; border-bottom: 1px solid #eee; color: ${UNIBO_BLACK} !important; font-weight: 500; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
                .back-btn { background: none; border: none; color: ${UNIBO_RED}; font-weight: 700; cursor: pointer; margin-bottom: 15px; display: flex; align-items: center; }

                /* MODALE SCELTA FIX CONTRASTO */
                .choice-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 3000; width: 280px; text-align: center; pointer-events: auto; }
                .choice-modal h3 { color: ${UNIBO_BLACK} !important; margin-bottom: 10px; }
                .choice-modal p { color: #555 !important; margin-bottom: 20px; }
                .choice-btn { width: 100%; padding: 14px; margin: 8px 0; border-radius: 12px; border: 1px solid #ddd; background: #fff; font-weight: 600; cursor: pointer; color: ${UNIBO_BLACK} !important; }
                .choice-btn.primary { background: ${UNIBO_RED}; color: #fff !important; border: none; }

                .autocomplete-list { background: white; border-radius: 12px; margin-top: 5px; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .autocomplete-item { padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; color: ${UNIBO_BLACK} !important; font-size: 15px; }
            `}</style>

            {choiceModal && (
                <div className="choice-modal">
                    <h3>{choiceModal.name}</h3>
                    <p>Usa questa posizione come:</p>
                    <button className="choice-btn primary" onClick={() => { setDestQuery(choiceModal.name); setChoiceModal(null); }}>🏁 Destinazione</button>
                    <button className="choice-btn" onClick={() => { setStartQuery(choiceModal.name); setChoiceModal(null); }}>🔍 Punto di partenza</button>
                    <button className="choice-btn" style={{border: 'none', color: '#888 !important'}} onClick={() => setChoiceModal(null)}>Annulla</button>
                </div>
            )}

            {selectedRoom && (
                <div className="top-details-overlay">
                    <div className="top-details-content">
                        {selectedRoom.image && <img src={selectedRoom.image} className="top-details-img" alt="" />}
                        <div className="top-details-info">
                            <h3>{selectedRoom.name}</h3>
                            <p>{selectedRoom.description || "Tocca per ottenere indicazioni stradali."}</p>
                        </div>
                        <button className="top-close-btn" onClick={() => setSelectedRoom(null)}>✕</button>
                    </div>
                    <div style={{padding: '0 15px 15px'}}>
                        <button className="btn-nav" onClick={() => { setDestQuery(selectedRoom.name); startNavigation(startQuery || "Mia Posizione", selectedRoom.name); setSelectedRoom(null); }}>Portami qui</button>
                    </div>
                </div>
            )}

            <div 
                className={`bottom-sheet ${panelState}`}
                onMouseDown={(e) => handleDragStart(e.clientY)}
                onMouseUp={(e) => handleDragEnd(e.clientY)}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
                onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientY)}
            >
                <div className="drag-handle-container">
                    <div className="drag-handle"></div>
                </div>

                <div className="search-section">
                    <div className="search-input-wrapper">
                        <span>🔍</span>
                        <input placeholder="Da: Mia Posizione" value={startQuery} onFocus={() => setPanelState('full')} onChange={(e) => { setStartQuery(e.target.value); getSuggestions(e.target.value, 'start'); }} />
                        {startQuery && <button className="clear-input-btn" onClick={() => {setStartQuery(""); setSuggestions(p => ({...p, start:[]}));}}>✕</button>}
                    </div>
                    {suggestions.start.length > 0 && panelState === 'full' && (
                        <div className="autocomplete-list" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="autocomplete-item" style={{color: UNIBO_RED, fontWeight: 'bold'}} onClick={() => { setStartQuery("Mia Posizione"); setSuggestions(p => ({...p, start:[]})); }}>📍 Mia Posizione</div>
                            {suggestions.start.map(s => <div key={s} className="autocomplete-item" onClick={() => { setStartQuery(s); setSuggestions(p => ({...p, start:[]})); }}>{s}</div>)}
                        </div>
                    )}

                    <div className="search-input-wrapper">
                        <span>🏁</span>
                        <input placeholder="A: Destinazione..." value={destQuery} onFocus={() => setPanelState('full')} onChange={(e) => { setDestQuery(e.target.value); getSuggestions(e.target.value, 'dest'); }} />
                        {destQuery && <button className="clear-input-btn" onClick={() => {setDestQuery(""); setSuggestions(p => ({...p, dest:[]}));}}>✕</button>}
                    </div>
                    {suggestions.dest.length > 0 && panelState === 'full' && (
                        <div className="autocomplete-list" onMouseDown={(e) => e.stopPropagation()}>
                            {suggestions.dest.map(s => <div key={s} className="autocomplete-item" onClick={() => { setDestQuery(s); setSuggestions(p => ({...p, dest:[]})); }}>{s}</div>)}
                        </div>
                    )}

                    <button className="btn-nav" onClick={() => startNavigation(startQuery, destQuery)}>Inizia Navigazione</button>
                    
                    {/* Pulsante annulla percorso ora sempre presente se c'è una rotta */}
                    {directions && (
                        <button 
                            style={{width:'100%', background:'none', border:'none', color:'#ff3b30', marginTop:'12px', fontWeight:'700', cursor: 'pointer', fontSize: '15px'}} 
                            onClick={clearRoute}
                        >
                            Annulla percorso
                        </button>
                    )}
                </div>

                <div className="categories-section" style={{display: panelState === 'full' ? 'block' : 'none'}}>
                    {!activeCategory ? (
                        <>
                            <h4 style={{margin: '10px 0', color: UNIBO_BLACK}}>Esplora Categorie</h4>
                            <div className="categories-grid">
                                {CATEGORIES.map(cat => (
                                    <div key={cat.id} className="category-item" onClick={() => setActiveCategory(cat)}>
                                        <span className="category-icon">{cat.icon}</span>
                                        <span className="category-label">{cat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div onMouseDown={(e) => e.stopPropagation()}>
                            <button className="back-btn" onClick={() => setActiveCategory(null)}>← Torna alle categorie</button>
                            <h4 style={{margin: '0 0 10px', color: UNIBO_BLACK}}>{activeCategory.icon} {activeCategory.label}</h4>
                            <div className="subcategory-list">
                                {activeCategory.items.map(item => (
                                    <div key={item} className="subcategory-item" onClick={() => handleLocationChoice(item)}>
                                        {item} <span style={{opacity: 0.3}}>📍</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {directions && (
                <Navigation 
                    directions={directions} 
                    options={{ 
                        pathOptions: { visibleThroughGeometry: true, color: UNIBO_RED, width: 0.5, displayArrowsOnPath: true, animateArrowsOnPath: true },
                        avatarOptions: { color: UNIBO_RED },
                        createMarkers: {
                            departure: (i) => mapView.Markers.add(i.coordinate, `<div style="font-size:20px; color:${UNIBO_RED}">🔵</div>`),
                            destination: (i) => mapView.Markers.add(i.coordinate, `<div style="font-size:24px">🏁</div>`),
                            connection: (i) => mapView.Markers.add(i.coordinate, `<div style="font-size:18px">🚪</div>`)
                        }
                    }} 
                />
            )}
        </div>
    );
}

function MapManagers({ onBlueDotInit }) {
    const { mapView, mapData } = useMap();
    const dynamicFocus = useDynamicFocus();

    useEffect(() => {
        if (!mapView || !mapData) return;
        mapView.updateState('space', null);
        mapView.updateState('facade', null);
        mapView.updateState('point-of-interest', { interactive: true, visible: true });

        mapData.getByType('facade').forEach((facade) => {
            const config = BUILDING_INTERACTION[facade.id] || BUILDING_INTERACTION.default;
            mapView.updateState(facade, { interactive: true, hoverColor: config.color });
        });

        mapData.getByType('space').forEach((space) => {
            const name = space.name || "";
            const isHallway = name.toLowerCase().includes("hallway") || name.toLowerCase().includes("corridoio");
            const hasName = name.trim() !== "";
            let roomColor = BUILDING_INTERACTION.default.color || BUILDING_INTERACTION.default;
            if (STANZE_E1.includes(name)) roomColor = BUILDING_INTERACTION['fc_94b7a4dd7fee1f8f'].color;
            else if (STANZE_E2.includes(name)) roomColor = BUILDING_INTERACTION['fc_94b7a4dd7fee1f8a'].color;
            else if (STANZE_E3.includes(name)) roomColor = BUILDING_INTERACTION['fc_7a4dd7fee1f8f330'].color;
            else if (STANZE_E4.includes(name)) roomColor = BUILDING_INTERACTION['fc_dd7fee1f8f330c42'].color;

            if (isHallway) mapView.updateState(space, { color: '#f5f5f5', interactive: false });
            else if (!hasName) mapView.updateState(space, { interactive: true, color: '#ffffff', hoverColor: '#eeeeee' });
            else mapView.updateState(space, { interactive: true, color: '#ffffff', hoverColor: roomColor });
        });

        const groundFloor = mapData.getByType('floor').find(f => f.elevation === 0);
        if (groundFloor) mapView.setFloor(groundFloor.id);
        if (!dynamicFocus.isEnabled) dynamicFocus.enable({ autoFocus: true, setFloorOnFocus: true, indoorZoomThreshold: 18 });
        mapView.updateState('wall', { visible: true, opacity: 1 });
        if (mapView.__EXPERIMENTAL__auto) mapView.__EXPERIMENTAL__auto();
        
        const bd = new BlueDot(mapView);
        bd.enable({ watchDevicePosition: true, color: UNIBO_RED });
        bd.update({ latitude: 44.487583, longitude: 11.329956, accuracy: 10, floorOrFloorId: groundFloor?.id });
        onBlueDotInit(bd);
        return () => { bd.disable(); if (dynamicFocus.isEnabled) dynamicFocus.destroy(); };
    }, [mapView, mapData, dynamicFocus, onBlueDotInit]);
    return null;
}

export default function App() {
    const { isLoading, error, mapData } = useMapData(options);
    const [blueDot, setBlueDot] = useState(null);
    if (isLoading) return <div style={{ padding: '20px' }}>Caricamento...</div>;
    if (error) return <div style={{ color: UNIBO_RED, padding: '20px' }}>Errore: {error.message}</div>;
    return (
        <div style={{ width: '100%', height: '100vh', margin: 0, position: 'relative', overflow: 'hidden' }}>
            {mapData && (
                <MapView mapData={mapData} style={{ width: '100%', height: '100%' }}>
                    <MapManagers onBlueDotInit={setBlueDot} />
                    <SmartWayfinding blueDotInstance={blueDot} />
                </MapView>
            )}
        </div>
    );
}