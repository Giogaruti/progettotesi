import React, { useState, useEffect } from 'react';
import { MapView, useMapData, useMap, Navigation } from '@mappedin/react-sdk';
import { BlueDot } from '@mappedin/blue-dot';
import { useDynamicFocus } from '@mappedin/dynamic-focus/react';

const options = {
    key: "mik_PR3UXAsnl3a6LnTRK511b0726",
    secret: "mis_e9JbalSWHAgWYLbTTirFvRXBrfjWexqvo14akJw9yzi98161136",
    mapId: "689f7c80dc0905000b1393fe",
};

const UNIBO_RED = "#a41815";
const UNIBO_WHITE = "#ffffff";
const UNIBO_BLACK = "#000000";

function SmartWayfinding({ blueDotInstance }) {
    const { mapView, mapData } = useMap();
    const [startQuery, setStartQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");
    const [suggestions, setSuggestions] = useState({ start: [], dest: [] });
    const [directions, setDirections] = useState(null);

    const getSuggestions = async (query, type) => {
        if (query.length < 2) {
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
        const destination = allSpaces.find(s => s.name === destName);
        let departure = startName === "Mia Posizione" ? blueDotInstance?.position?.coordinate : allSpaces.find(s => s.name === startName);

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

    return (
        <div className="ui-container">
            <style>{`
                /* Layout base (Desktop) */
                .ui-container {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    z-index: 10;
                    background: ${UNIBO_WHITE};
                    padding: 15px;
                    border-radius: 8px;
                    width: 300px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    border-top: 5px solid ${UNIBO_RED};
                }

                /* Mobile Optimization */
                @media (max-width: 600px) {
                    .ui-container {
                        top: auto;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        border-radius: 20px 20px 0 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    input {
                        font-size: 16px !important; /* Evita zoom automatico iOS */
                        padding: 12px !important;
                    }
                    .btn-nav {
                        padding: 15px !important;
                    }
                }

                .autocomplete-list { position: absolute; background: ${UNIBO_WHITE}; width: 100%; border: 1px solid ${UNIBO_BLACK}; z-index: 11; max-height: 180px; overflow-y: auto; left:0; }
                .autocomplete-item { padding: 12px; cursor: pointer; color: ${UNIBO_BLACK}; border-bottom: 1px dotted #ccc; }
                .autocomplete-item:hover { background: ${UNIBO_RED}; color: ${UNIBO_WHITE} !important; }
                input { width: 100%; padding: 10px; border: 1px solid #ccc; margin-bottom: 8px; box-sizing: border-box; border-radius: 4px; }
                .btn-nav { width: 100%; padding: 12px; background: ${UNIBO_RED}; color: ${UNIBO_WHITE}; border: none; cursor: pointer; font-weight: bold; border-radius: 4px; }
                
                .custom-png-marker { width: 30px; height: 30px; }
                .custom-png-marker img { width: 100%; height: auto; }
            `}</style>
            
            <input placeholder="Partenza" value={startQuery} onChange={(e) => { setStartQuery(e.target.value); getSuggestions(e.target.value, 'start'); }} />
            {suggestions.start.length > 0 && (
                <div className="autocomplete-list">
                    <div className="autocomplete-item" style={{ fontWeight: 'bold', color: UNIBO_RED }} onClick={() => { setStartQuery("Mia Posizione"); setSuggestions(p => ({ ...p, start: [] })); }}>📍 Mia Posizione</div>
                    {suggestions.start.map(s => <div key={s} className="autocomplete-item" onClick={() => { setStartQuery(s); setSuggestions(p => ({ ...p, start: [] })); }}>{s}</div>)}
                </div>
            )}

            <input placeholder="Destinazione" value={destQuery} onChange={(e) => { setDestQuery(e.target.value); getSuggestions(e.target.value, 'dest'); }} />
            {suggestions.dest.length > 0 && (
                <div className="autocomplete-list">
                    {suggestions.dest.map(s => <div key={s} className="autocomplete-item" onClick={() => { setDestQuery(s); setSuggestions(p => ({ ...p, dest: [] })); }}>{s}</div>)}
                </div>
            )}

            <button className="btn-nav" onClick={() => startNavigation(startQuery, destQuery)}>Naviga</button>
            {directions && <button style={{ width: '100%', marginTop: '8px', background: UNIBO_BLACK, color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }} onClick={() => setDirections(null)}>Cancella</button>}

            {directions && (
                <Navigation 
                    directions={directions} 
                    options={{ 
                        pathOptions: { 
                            visibleThroughGeometry: true,
                            color: UNIBO_RED,
                            width: 0.3,
                            displayArrowsOnPath: true,
                            animateArrowsOnPath: true
                        },
                        avatarOptions: { color: UNIBO_RED },
                        createMarkers: {
                            departure: (instruction) => mapView.Markers.add(instruction.coordinate, `<div class="custom-png-marker"><img src="https://img.icons8.com/ios-filled/50/000000/marker.png" /></div>`),
                            destination: (instruction) => mapView.Markers.add(instruction.coordinate, `<div class="custom-png-marker"><img src="https://img.icons8.com/ios-filled/50/a41815/flag.png" /></div>`),
                            connection: (instruction) => mapView.Markers.add(instruction.coordinate, `<div class="custom-png-marker" style="width:20px;"><img src="https://img.icons8.com/ios-filled/50/808080/door.png" /></div>`)
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

        const groundFloor = mapData.getByType('floor').find(f => f.elevation === 0) || mapData.getByType('floor')[0];
        if (groundFloor) { mapView.setFloor(groundFloor.id); }

        if (!dynamicFocus.isEnabled) {
            dynamicFocus.enable({ autoFocus: true, setFloorOnFocus: true, indoorZoomThreshold: 18 });
        }

        mapData.getByType('space').forEach((space) => {
            mapView.updateState(space, {
                color: '#f5f5f5', 
                interactive: true,
                hoverColor: UNIBO_RED,
                hoverOpacity: 0.4
            });
        });

        mapView.updateState('wall', { visible: true, opacity: 1 });
        if (mapView.__EXPERIMENTAL__auto) { mapView.__EXPERIMENTAL__auto(); }

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

    if (isLoading) return <div style={{ padding: '20px' }}>Alma Mater Studiorum...</div>;
    if (error) return <div style={{ color: UNIBO_RED, padding: '20px' }}>Errore: {error.message}</div>;

    return (
        <div style={{ width: '100%', height: '100vh', margin: 0, position: 'relative' }}>
            {mapData && (
                <MapView mapData={mapData} style={{ width: '100%', height: '100%' }}>
                    <MapManagers onBlueDotInit={setBlueDot} />
                    <SmartWayfinding blueDotInstance={blueDot} />
                </MapView>
            )}
        </div>
    );
}