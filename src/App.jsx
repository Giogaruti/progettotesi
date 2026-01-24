import React, { useState, useEffect } from 'react';
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

    // Gestore click esteso anche a POI (bus, bici, ecc.)
    useMapViewEvent("click", (event) => {
        const space = event.spaces?.[0];
        const poi = event.pointsOfInterest?.[0];

        if (poi) {
            // Se clicco un'icona (POI)
            setSelectedRoom({
                name: poi.name,
                description: poi.description || "Punto di interesse esterno.",
                image: poi.logoImage || null,
                target: poi
            });
            mapView.Camera.focusOn(poi);
        } else if (space && space.name) {
            // Se clicco una stanza (Space)
            const profile = space.locationProfiles?.[0];
            setSelectedRoom({
                name: space.name,
                description: profile?.description || "",
                image: profile?.logoImage || null,
                target: space
            });
            mapView.Camera.focusOn(space);
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
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.error(e);
            }
        }
        setSuggestions({ start: [], dest: [] });
    };

    const clearRoute = () => {
        setDirections(null);
        setStartQuery("");
        setDestQuery("");
        setSelectedRoom(null);
    };

    return (
        <div className="apple-maps-panel">
            <style>{`
                /* Pannello Ricerca (Basso Sinistra) */
                .apple-maps-panel { 
                    position: absolute; bottom: 20px; left: 20px; z-index: 10; 
                    background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(25px); 
                    -webkit-backdrop-filter: blur(25px); padding: 8px 16px 24px 16px; 
                    border-radius: 24px; width: 350px; box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
                }

                /* Pannello Dettagli (Alto Destra) - NON si sovrappone alla ricerca */
                .room-details-overlay {
                    position: absolute; top: 20px; right: 20px; z-index: 11;
                    background: white; width: 320px; border-radius: 20px;
                    overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    font-family: -apple-system, sans-serif;
                }

                .room-details-body { padding: 16px; }
                .room-img-header { width: 100%; height: 180px; object-fit: cover; background: #eee; }
                .room-title-h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px 0; color: ${UNIBO_BLACK}; }
                .room-text-p { font-size: 14px; color: #555; line-height: 1.5; margin-bottom: 16px; }

                .panel-handle { width: 36px; height: 5px; background: rgba(0, 0, 0, 0.1); border-radius: 10px; margin: 0 auto 16px auto; }

                .search-input-wrapper { background: rgba(118, 118, 128, 0.12); border-radius: 12px; margin-bottom: 8px; display: flex; align-items: center; padding: 10px 14px; transition: background 0.2s; }
                .search-input-wrapper input { background: transparent; border: none; width: 100%; font-size: 17px; outline: none; color: #000; margin-left: 8px; }

                .btn-nav { width: 100%; padding: 14px; background: ${UNIBO_RED}; color: white; border: none; cursor: pointer; font-weight: 600; border-radius: 14px; font-size: 17px; margin-top: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .btn-nav:active { transform: scale(0.97); opacity: 0.9; }

                .autocomplete-list { background: white; border-radius: 14px; margin-top: -4px; margin-bottom: 12px; max-height: 220px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .autocomplete-item { padding: 14px; cursor: pointer; border-bottom: 0.5px solid rgba(0,0,0,0.05); font-size: 16px; color: ${UNIBO_BLACK} !important; display: flex; align-items: center; }
                .autocomplete-item:hover { background: rgba(0, 122, 255, 0.05); }

                .close-overlay { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.4); color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 12; }
            `}</style>
            
            {selectedRoom && (
                <div className="room-details-overlay">
                    <div className="close-overlay" onClick={() => setSelectedRoom(null)}>✕</div>
                    {selectedRoom.image && <img src={selectedRoom.image} className="room-img-header" alt={selectedRoom.name} />}
                    <div className="room-details-body">
                        <h2 className="room-title-h2">{selectedRoom.name}</h2>
                        {selectedRoom.description && <p className="room-text-p">{selectedRoom.description}</p>}
                        <button className="btn-nav" onClick={() => {
                            setDestQuery(selectedRoom.name);
                            startNavigation(startQuery || "Mia Posizione", selectedRoom.name);
                            setSelectedRoom(null);
                        }}>📍 Portami qui</button>
                    </div>
                </div>
            )}

            <div className="panel-handle"></div>

            <div className="search-input-wrapper">
                <span style={{opacity: 0.5}}>🔍</span>
                <input placeholder="Da: Cerca posizione..." value={startQuery} onChange={(e) => { setStartQuery(e.target.value); getSuggestions(e.target.value, 'start'); }} />
            </div>
            {suggestions.start.length > 0 && (
                <div className="autocomplete-list">
                    <div className="autocomplete-item" style={{ color: UNIBO_RED, fontWeight: '600' }} onClick={() => { setStartQuery("Mia Posizione"); setSuggestions(p => ({ ...p, start: [] })); }}>
                        <span style={{marginRight: '10px'}}>📍</span> Usa la mia posizione
                    </div>
                    {suggestions.start.map(s => (
                        <div key={s} className="autocomplete-item" onClick={() => { setStartQuery(s); setSuggestions(p => ({ ...p, start: [] })); }}>
                            <span style={{marginRight: '10px', opacity: 0.4}}>🏢</span> {s}
                        </div>
                    ))}
                </div>
            )}

            <div className="search-input-wrapper">
                <span style={{opacity: 0.5}}>🏁</span>
                <input placeholder="A: Destinazione..." value={destQuery} onChange={(e) => { setDestQuery(e.target.value); getSuggestions(e.target.value, 'dest'); }} />
            </div>
            {suggestions.dest.length > 0 && (
                <div className="autocomplete-list">
                    {suggestions.dest.map(s => (
                        <div key={s} className="autocomplete-item" onClick={() => { setDestQuery(s); setSuggestions(p => ({ ...p, dest: [] })); }}>
                            <span style={{marginRight: '10px', opacity: 0.4}}>📍</span> {s}
                        </div>
                    ))}
                </div>
            )}

            <button className="btn-nav" onClick={() => startNavigation(startQuery, destQuery)}>Indicazioni</button>
            
            {directions && (
                <button style={{ width: '100%', marginTop: '12px', background: 'transparent', color: '#FF3B30', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }} onClick={clearRoute}>
                    Cancella percorso
                </button>
            )}

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
        
        // Rende interattivi anche i POI
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

            if (isHallway) {
                mapView.updateState(space, { color: '#f5f5f5', interactive: false });
            } else if (!hasName) {
                mapView.updateState(space, { interactive: true, color: '#ffffff', hoverColor: '#eeeeee' });
            } else {
                mapView.updateState(space, { interactive: true, color: '#ffffff', hoverColor: roomColor });
            }
        });

        const floors = mapData.getByType('floor');
        const groundFloor = floors.find(f => f.elevation === 0) || floors[0];
        if (groundFloor) mapView.setFloor(groundFloor.id);
        
        if (!dynamicFocus.isEnabled) {
            dynamicFocus.enable({ autoFocus: true, setFloorOnFocus: true, indoorZoomThreshold: 18 });
        }

        mapView.updateState('wall', { visible: true, opacity: 1 });
        if (mapView.__EXPERIMENTAL__auto) mapView.__EXPERIMENTAL__auto();

        const bd = new BlueDot(mapView);
        bd.enable({ watchDevicePosition: true, color: UNIBO_RED });
        bd.update({ latitude: 44.487583, longitude: 11.329956, accuracy: 10, floorOrFloorId: groundFloor?.id });
        onBlueDotInit(bd);

        return () => {
            bd.disable();
            if (dynamicFocus.isEnabled) dynamicFocus.destroy();
        };
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