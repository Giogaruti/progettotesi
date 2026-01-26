import React, { useState, useEffect, useRef } from "react";
import {
  MapView,
  useMapData,
  useMap,
  Navigation,
  useMapViewEvent,
} from "@mappedin/react-sdk";
import { BlueDot } from "@mappedin/blue-dot";
import { useDynamicFocus } from "@mappedin/dynamic-focus/react";
import { Share } from "lucide-react";

const options = {
  key: "mik_PR3UXAsnl3a6LnTRK511b0726",
  secret: "mis_e9JbalSWHAgWYLbTTirFvRXBrfjWexqvo14akJw9yzi98161136",
  mapId: "689f7c80dc0905000b1393fe",
};

const UNIBO_RED = "#bb2e29";
const UNIBO_WHITE = "#ffffff";
const UNIBO_BLACK = "#000000";

// --- LISTE STANZE PER EDIFICIO ---
const STANZE_E1 = [
  "Aula 0.4",
  "Aula 0.5",
  "Aula 0.6",
  "Aula 0.7",
  "Aula 0.8",
  "Aula 2.8",
  "Aula 3.4",
  "Lab 0",
  "Lab 2",
  "Lab 4",
  "Lab 5",
  "Lab 9",
  "Sala studio 0.3",
  "Sala studio 0.4",
  "Bar",
];
const STANZE_E2 = ["Aula 4.1", "Aula 4.2", "Mensa"];
const STANZE_E3 = [
  "Aula I",
  "Aula II",
  "Aula III",
  "Aula IX",
  "Aula V",
  "Aula VI",
  "Aula VII",
  "Aula VIII",
];
const STANZE_E4 = ["Aula 8.1"];

// --- CATEGORIE PERSONALIZZATE ---
const CATEGORIES = [
  {
    id: "aule",
    label: "Aule",
    icon: "📖",
    items: [
      "Aula 0.4",
      "Aula 0.5",
      "Aula 0.6",
      "Aula 0.7",
      "Aula 0.8",
      "Aula 2.8",
      "Aula 3.4",
      "Aula 4.1",
      "Aula 4.2",
      "Aula 8.1",
      "Aula I",
      "Aula II",
      "Aula III",
      "Aula V",
      "Aula VI",
      "Aula VII",
      "Aula VIII",
      "Aula IX",
    ],
  },
  {
    id: "lab",
    label: "Laboratori",
    icon: "💻",
    items: ["Lab 0", "Lab 2", "Lab 4", "Lab 5", "Lab 9"],
  },
  { id: "ristoro", label: "Ristoro", icon: "☕", items: ["Bar", "Mensa"] },
  {
    id: "servizi",
    label: "Servizi",
    icon: "🚻",
    items: [
      "Sala studio 0.3",
      "Sala studio 0.4",
      "Biblioteca Dore",
      "Toilette M",
      "Toilette F",
      "Toilette M+H",
    ],
  },
  {
    id: "trasporti",
    label: "Trasporti",
    icon: "🚌",
    items: [
      "Porta Saragozza - Risorgimento #7001",
      "Porta Saragozza - Risorgimento #7002",
      "Porta Saragozza - Villa Cassarini #44",
      "Porta Saragozza - Villa Cassarini #47",
      "Aldini #42",
      "Aldini #49",
      "Nosadella #756",
      "Nosadella #759",
      "Porta Saragozza - Frassinago #711",
      "Taxi",
      "Rastrelliera",
      "Riparazione bici",
    ],
  },
  {
    id: "aree_verdi",
    label: "Aree Verdi",
    icon: "🌳",
    items: ["Giardino di Villa Cassarini", "Parco di Ingegneria"],
  },
];

const PIANI_COLORS = {
  m_73346441c6056802: "#B3D9D9",
  m_544bceedfc4cb202: "#B3D9D9",
  m_a0070fa062fa8917: "#B3D9D9",
  m_0ae87446ce0bdede: "#B3D9D9",
  m_eeb2b5535b557a02: "#F9D0C2",
  m_bdf57ffb0970378d: "#F9D0C2",
  m_2d3eafe67300025c: "#F9D0C2",
  m_c7f3cbbb678828aa: "#C2C9E0",
  m_5dceea4b2fb7f7e2: "#C2C9E0",
  default: "#ffffff",
};

// --- MAPPATURA COLORI PASTELLO SOFT ---
const BUILDING_INTERACTION = {
  fc_94b7a4dd7fee1f8f: { name: "E1 + E2", color: "#B3D9D9" },
  fc_94b7a4dd7fee1f8a: { name: "E1 + E2", color: "#B3D1C6" },
  fc_7a4dd7fee1f8f330: { name: "E3", color: "#F9D0C2" },
  fc_dd7fee1f8f330c42: { name: "E4", color: "#C2C9E0" },
  default: "#B3E8FF",
};

function SmartWayfinding({ blueDotInstance }) {
  const { mapView, mapData } = useMap();
  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ start: [], dest: [] });
  const [directions, setDirections] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [panelState, setPanelState] = useState("partial");
  const [activeCategory, setActiveCategory] = useState(null);
  const [choiceModal, setChoiceModal] = useState(null);
  const [isImageFull, setIsImageFull] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  // Legge l'URL all'avvio per aprire una stanza specifica
  useEffect(() => {
    if (mapData && mapView) {
      const params = new URLSearchParams(window.location.search);
      const roomName = params.get("room");
      if (roomName) {
        const allSpaces = mapData.getByType("space");
        const allPois = mapData.getByType("point-of-interest");
        const target =
          allSpaces.find((s) => s.name === roomName) ||
          allPois.find((p) => p.name === roomName);

        if (target) {
          // Piccolo timeout per attendere che la mappa sia pronta al rendering
          setTimeout(() => {
            const profile = target.locationProfiles?.[0];
            setSelectedRoom({
              name: target.name,
              description: profile?.description || "",
              image:
                profile?.images?.[0]?.url || profile?.logoImage?.url || null,
              target: target,
            });
            mapView.Camera.focusOn(target);
          }, 1000);
        }
      }
    }
  }, [mapData, mapView]);

  const handleFocusStart = () => {
  setPanelState("full");
  // Se il campo è vuoto, mostriamo subito l'opzione posizione
  if (!startQuery) {
    setSuggestions((prev) => ({ 
      ...prev, 
      start: ["Mia Posizione"] 
    }));
  }
};

  const handleShare = (e) => {
    e.stopPropagation();
    if (!selectedRoom) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?room=${encodeURIComponent(selectedRoom.name)}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000); // Scompare dopo 2 secondi
    });
  };

  useMapViewEvent("click", (event) => {
    // 1. Priorità assoluta al POI (Point of Interest)
    const poi = event.pointsOfInterest?.[0];
    const space = event.spaces?.[0];
    const target = poi || space;

    console.log("--- DEBUG CLICK ---");
    console.log("Target identificato:", target?.name, target);

    if (panelState === "full") {
      setPanelState("partial");
      setActiveCategory(null);
    }

    // Verifichiamo che il target abbia un nome e non sia un'area generica
    if (target && target.name && target.name.trim() !== "") {
      const profile = target.locationProfiles?.[0];

      setSelectedRoom({
        name: target.name,
        // Fallback per la descrizione se il profilo è vuoto
        description:
          profile?.description || (poi ? "Punto di interesse esterno." : ""),
        // Utilizzo dell'array images[0] come da tuo log console precedente
        image: profile?.images?.[0]?.url || profile?.logoImage?.url || null,
        target: target,
      });
      mapView.Camera.focusOn(target);
    } else {
      // Se clicco sul vuoto, chiudo il popup
      setSelectedRoom(null);
    }
  });

  const getSuggestions = async (query, type) => {
    if (!query || query.length < 2) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }
    try {
      const results = await mapData.Search.query(query);
      const places = results.places?.map((p) => p.item.name) || [];
      setSuggestions((prev) => ({ ...prev, [type]: [...new Set(places)] }));
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
    }
  };

  const startNavigation = async (startName, destName) => {
    const allSpaces = mapData.getByType("space");
    const allPois = mapData.getByType("point-of-interest");
    
    const destination =
      allSpaces.find((s) => s.name === destName) ||
      allPois.find((p) => p.name === destName);

    let departure;
    
    if (startName === "Mia Posizione" || startName === "📍 Mia Posizione") {
      // 1. Prova a usare la posizione REALE del sensore
      departure = blueDotInstance?.position;
      
      // 2. Se il sensore fallisce (errore code 2), usa Bologna come fallback
      if (!departure) {
          console.warn("GPS non disponibile. Uso fallback coordinate Bologna.");
          const groundFloor = mapData.getByType("floor").find((f) => f.elevation === 0);
          departure = {
            coordinate: { latitude: 44.487583, longitude: 11.330114 },
            floorId: groundFloor?.id
          };
      }
    } else {
      departure = allSpaces.find((s) => s.name === startName) ||
                  allPois.find((p) => p.name === startName);
    }

    if (departure && destination) {
      try {
        const result = await mapData.getDirections(departure, destination);
        if (result) {
          setDirections(result);
          mapView.Camera.focusOn(result.coordinates);
          setPanelState("partial");
        }
      } catch (e) {
        console.error("Percorso non trovato:", e);
      }
    }
    setSuggestions({ start: [], dest: [] });
  };

  const handleLocationChoice = (name) => {
    const allSpaces = mapData.getByType("space");
    const allPois = mapData.getByType("point-of-interest");
    const target =
      allSpaces.find((s) => s.name === name) ||
      allPois.find((p) => p.name === name);

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
      if (panelState === "closed") setPanelState("partial");
      else if (panelState === "partial") setPanelState("full");
    } else if (deltaY < -50) {
      if (panelState === "full") {
        if (activeCategory) setActiveCategory(null);
        else setPanelState("partial");
      } else if (panelState === "partial") setPanelState("closed");
    }
  };

  const swapLocations = () => {
    const temp = startQuery;
    setStartQuery(destQuery);
    setDestQuery(temp);
    // Opzionale: pulisce i suggerimenti durante lo scambio
    setSuggestions({ start: [], dest: [] });
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

                .bottom-sheet { 
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        background: rgba(255, 255, 255, 0.95); 
        backdrop-filter: blur(20px); 
        -webkit-backdrop-filter: blur(20px); 
        border-top-left-radius: 20px; 
        border-top-right-radius: 20px; 
        box-shadow: 0 -5px 25px rgba(0,0,0,0.2); 
        z-index: 1000; 
        pointer-events: auto; 
        
        /* Altezza fissa per l'animazione fluida */
        height: 60vh; 
        
        /* Animiamo solo il transform, che è super fluido e performante */
        transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        display: flex; 
        flex-direction: column; 
    }

    /* STATO FULL: La barra è al suo posto (altezza 60vh) */
    .bottom-sheet.full { 
        transform: translateY(0); 
    }

    /* STATO PARTIAL: Spostiamo la barra verso il basso finché non restano fuori 
       solo gli input (circa 250px-300px). 
       Usiamo un calcolo basato sull'altezza della barra (60vh) */
    .bottom-sheet.partial { 
        /* 60vh è l'altezza totale. Sottraiamo lo spazio che vogliamo mostrare (es. 260px) */
        transform: translateY(calc(60vh - 260px)); 
    } 

    /* STATO CLOSED: Nascondiamo quasi tutto */
    .bottom-sheet.closed { 
        transform: translateY(calc(60vh - 45px)); 
    }

    /* Gestione dello scroll: le categorie devono scrollare solo in FULL */
    .categories-section {
        flex: 1;
        overflow-y: auto;
        /* Evitiamo lo scroll se non siamo in modalità full */
        display: ${panelState === "full" ? "block" : "none"};
    }

                .drag-handle-container { width: 100%; height: 40px; display: flex; justify-content: center; align-items: center; cursor: grab; user-select: none; flex-shrink: 0; }
                .drag-handle { width: 40px; height: 5px; background: rgba(0,0,0,0.1); border-radius: 10px; }

                .search-section { 
    padding: 0 16px 15px; 
    flex-shrink: 0; 
    position: relative; 
}
                .search-input-wrapper { background: rgba(118, 118, 128, 0.12); border-radius: 12px; display: flex; align-items: center; padding: 10px 12px; margin-bottom: 8px; position: relative; }
                .search-input-wrapper input { background: transparent; border: none; width: 100%; font-size: 16px; outline: none; color: ${UNIBO_BLACK} !important; margin-left: 8px; padding-right: 30px; }
                .clear-input-btn { position: absolute; right: 12px; background: #bbb; color: white; border: none; padding: 0; border-radius: 100%; width: 20px; height: 18px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                
                .btn-nav { width: 100%; padding: 12px; background: ${UNIBO_RED}; color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; }

                .categories-section { padding: 10px 16px; overflow-y: auto; flex-grow: 1; }
                .categories-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px; }
                .category-item { background: white; padding: 15px 5px; border-radius: 15px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); cursor: pointer; }
                .category-icon { font-size: 24px; margin-bottom: 5px; display: block; }
                .category-label { font-size: 12px; font-weight: 600; color: ${UNIBO_BLACK} !important; }

                .subcategory-list { list-style: none; padding: 0; margin: 10px 0; border-top: 1px solid #eee; }
                .subcategory-item { padding: 14px; border-bottom: 1px solid #eee; color: ${UNIBO_BLACK} !important; font-weight: 500; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
                .back-btn { background: none; border: none; color: ${UNIBO_RED}; font-weight: 700; cursor: pointer; margin-bottom: 15px; display: flex; align-items: center; }

                .choice-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 3000; width: 280px; text-align: center; pointer-events: auto; }
                .choice-modal h3 { color: ${UNIBO_BLACK} !important; margin-bottom: 10px; }
                .choice-modal p { color: #555 !important; margin-bottom: 20px; }
                .choice-btn { width: 100%; padding: 14px; margin: 8px 0; border-radius: 12px; border: 1px solid #ddd; background: #fff; font-weight: 600; cursor: pointer; color: ${UNIBO_BLACK} !important; }
                .choice-btn.primary { background: ${UNIBO_RED}; color: #fff !important; border: none; }

                .autocomplete-list { 
    position: absolute; /* Non sposta più il contenuto sotto */
    background: white; 
    border-radius: 12px; 
    margin-top: 2px; 
    max-height: 200px; 
    overflow-y: auto; 
    box-shadow: 0 8px 25px rgba(0,0,0,0.2); 
    z-index: 100; /* Sta sopra a tutto */
    width: calc(100% - 32px); /* Adatta alla larghezza della sezione */
    left: 16px;
}
                .autocomplete-item { padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; color: ${UNIBO_BLACK} !important; font-size: 15px; }
                
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        85% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -100%); }
    }
            `}</style>

      {choiceModal && (
        <div className="choice-modal">
          <h3>{choiceModal.name}</h3>
          <p>Usa questa posizione come:</p>
          <button
            className="choice-btn primary"
            onClick={() => {
              setDestQuery(choiceModal.name);
              setChoiceModal(null);
            }}
          >
            🏁 Destinazione
          </button>
          <button
            className="choice-btn"
            onClick={() => {
              setStartQuery(choiceModal.name);
              setChoiceModal(null);
            }}
          >
            🔍 Punto di partenza
          </button>
        </div>
      )}

      {selectedRoom && (
        <>
          {/* Visualizzazione Full Screen (lasciare quella esistente) */}
          {isImageFull && selectedRoom.image && (
            <div onClick={() => setIsImageFull(false)}>
              <img
                src={selectedRoom.image}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div
            className="top-details-overlay"
            style={{
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedRoom.image && (
              <div
                onClick={() => setIsImageFull(true)}
                style={{
                  width: "100%",
                  height: "180px",
                  overflow: "hidden",
                  background: "#eee",
                  cursor: "zoom-in",
                  flexShrink: 0,
                }}
              >
                <img
                  src={selectedRoom.image}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt={selectedRoom.name}
                />
              </div>
            )}

            <div
              className="top-details-content"
              style={{
                padding: "15px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="top-details-info">
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    color: UNIBO_BLACK,
                    fontSize: "20px",
                  }}
                >
                  {selectedRoom.name}
                </h3>
                {selectedRoom.description && (
                  <p
                    style={{
                      margin: "0 0 15px 0",
                      fontSize: "14px",
                      color: "#555",
                      lineHeight: "1.4",
                    }}
                  >
                    {selectedRoom.description}
                  </p>
                )}
              </div>

              {/* CONTENITORE BOTTONI: Portami qui + Condividi */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginTop: "auto",
                  width: "100%",
                }}
              >
                <button
                  className="btn-nav"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setDestQuery(selectedRoom.name);
                    startNavigation(
                      selectedRoom.name,
                    );
                    setSelectedRoom(null);
                  }}
                >
                  Portami qui
                </button>

                <button
                  onClick={handleShare}
                  style={{
                    width: "45px",
                    height: "45px",
                    padding: "10px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#f0f0f0", // Sfondo nero
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Share
                    size={50}
                    color="#212121" // DEVE essere bianco per vedersi sul nero
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </div>
            {showToast && (
              <div
                style={{
                  position: "fixed",
                  bottom: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.8)",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  zIndex: 10000,
                  fontSize: "14px",
                  fontWeight: "500",
                  pointerEvents: "none",
                  animation: "fadeInOut 2s ease",
                  width: "50%",
                  textAlign: "center",
                }}
              >
                Link copiato negli appunti
              </div>
            )}
          </div>
        </>
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
          <div style={{ position: "relative" }}>
            {/* INPUT PARTENZA */}
            <div className="search-input-wrapper">
              <span>🔍</span>
              <input
  placeholder="Da: Mia Posizione"
  value={startQuery}
  onFocus={handleFocusStart} // <--- Usa la nuova funzione
  onChange={(e) => {
    setStartQuery(e.target.value);
    getSuggestions(e.target.value, "start");
  }}
/>
              {startQuery && (
                <button
                  className="clear-input-btn"
                  onClick={() => {
                    setStartQuery("");
                    setSuggestions((p) => ({ ...p, start: [] }));
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Suggerimenti Partenza (Coprono lo Swap perché hanno zIndex 100) */}
            {suggestions.start.length > 0 && panelState === "full" && (
              <div
                className="autocomplete-list"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {suggestions.start.map((s) => (
                  <div
                    key={s}
                    className="autocomplete-item"
                    onClick={() => {
                      setStartQuery(s);
                      setSuggestions((p) => ({ ...p, start: [] }));
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}

            {/* BOTTONE SWAP (zIndex basso per finire sotto i suggerimenti) */}
            <button
              onClick={swapLocations}
              style={{
                position: "absolute",
                right: "45px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 5 /* Più basso di autocomplete-list */,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                color: "#000000",
              }}
            >
              ⇅
            </button>

            {/* INPUT DESTINAZIONE */}
            <div className="search-input-wrapper">
              <span>🏁</span>
              <input
                placeholder="A: Destinazione..."
                value={destQuery}
                onFocus={() => setPanelState("full")}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  getSuggestions(e.target.value, "dest");
                }}
              />
              {destQuery && (
                <button
                  className="clear-input-btn"
                  onClick={() => {
                    setDestQuery("");
                    setSuggestions((p) => ({ ...p, dest: [] }));
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Suggerimenti Destinazione */}
            {suggestions.dest.length > 0 && panelState === "full" && (
              <div
                className="autocomplete-list"
                onMouseDown={(e) => e.stopPropagation()}
                style={{ top: "100%" }}
              >
                {suggestions.dest.map((s) => (
                  <div
                    key={s}
                    className="autocomplete-item"
                    onClick={() => {
                      setDestQuery(s);
                      setSuggestions((p) => ({ ...p, dest: [] }));
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PULSANTE NAVIGAZIONE */}
          <button
            className="btn-nav"
            style={{
              marginTop: "15px",
              opacity: !startQuery || !destQuery ? 0.6 : 1,
              cursor: !startQuery || !destQuery ? "not-allowed" : "pointer",
            }}
            disabled={!startQuery || !destQuery}
            onClick={() => startNavigation(startQuery, destQuery)}
          >
            {!startQuery || !destQuery
              ? "Inserisci partenza e arrivo"
              : "Inizia Navigazione"}
          </button>

          {directions && (
            <button
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#ff3b30",
                marginTop: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "15px",
              }}
              onClick={clearRoute}
            >
              Annulla percorso
            </button>
          )}
        </div>

        <div
          className="categories-section"
          style={{ display: panelState === "full" ? "block" : "none" }}
        >
          {!activeCategory ? (
            <>
              <h4 style={{ margin: "10px 0", color: UNIBO_BLACK }}>
                Esplora Categorie
              </h4>
              <div className="categories-grid">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="category-item"
                    onClick={() => setActiveCategory(cat)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-label">{cat.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div onMouseDown={(e) => e.stopPropagation()}>
              <button
                className="back-btn"
                onClick={() => setActiveCategory(null)}
              >
                ← Torna alle categorie
              </button>
              <h4 style={{ margin: "0 0 10px", color: UNIBO_BLACK }}>
                {activeCategory.icon} {activeCategory.label}
              </h4>
              <div className="subcategory-list">
                {activeCategory.items.map((item) => (
                  <div
                    key={item}
                    className="subcategory-item"
                    onClick={() => handleLocationChoice(item)}
                  >
                    {item} <span style={{ opacity: 0.3 }}>📍</span>
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
            pathOptions: {
              visibleThroughGeometry: true,
              color: UNIBO_RED,
              width: 0.5,
              displayArrowsOnPath: true,
              animateArrowsOnPath: true,
            },
            avatarOptions: { color: UNIBO_RED },
            createMarkers: {
              departure: (i) =>
                mapView.Markers.add(
                  i.coordinate,
                  `<div style="font-size:20px; color:${UNIBO_RED}">🔵</div>`,
                ),
              destination: (i) =>
                mapView.Markers.add(
                  i.coordinate,
                  `<div style="font-size:24px">🏁</div>`,
                ),
              connection: (i) =>
                mapView.Markers.add(
                  i.coordinate,
                  `<div style="font-size:18px">🚪</div>`,
                ),
            },
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

    if (mapData) {
      console.log("--- ELENCO ID PIANI (FLOORS) ---");
      mapData.getByType("floor").forEach((f) => {
        console.log(`Piano: ${f.name} - ID: ${f.id}`);
      });
    }

    mapView.updateState("space", null);
    mapView.updateState("facade", null);
    mapView.updateState("point-of-interest", {
      interactive: true,
      visible: true,
    });

    // --- COLORAZIONE STANZE ---
    mapData.getByType("space").forEach((space) => {
      const name = space.name || "";
      const isHallway =
        name.toLowerCase().includes("hallway") ||
        name.toLowerCase().includes("corridoio");
      const hasName = name.trim() !== "";

      let roomColor =
        BUILDING_INTERACTION.default.color || BUILDING_INTERACTION.default;
      if (STANZE_E1.includes(name))
        roomColor = BUILDING_INTERACTION["fc_94b7a4dd7fee1f8f"].color;
      else if (STANZE_E2.includes(name))
        roomColor = BUILDING_INTERACTION["fc_94b7a4dd7fee1f8a"].color;
      else if (STANZE_E3.includes(name))
        roomColor = BUILDING_INTERACTION["fc_7a4dd7fee1f8f330"].color;
      else if (STANZE_E4.includes(name))
        roomColor = BUILDING_INTERACTION["fc_dd7fee1f8f330c42"].color;

      if (isHallway) {
        mapView.updateState(space, { color: "#f5f5f5", interactive: false });
      } else if (!hasName) {
        mapView.updateState(space, {
          interactive: true,
          color: "#ffffff",
          hoverColor: "#eeeeee",
        });
      } else {
        mapView.updateState(space, {
          interactive: true,
          color: "#ffffff",
          hoverColor: roomColor,
        });
      }
    });

    const groundFloor = mapData
      .getByType("floor")
      .find((f) => f.elevation === 0);
    if (groundFloor) mapView.setFloor(groundFloor.id);

    if (!dynamicFocus.isEnabled) {
      dynamicFocus.enable({
        autoFocus: true,
        setFloorOnFocus: true,
        indoorZoomThreshold: 18,
      });
    }

    mapView.updateState("wall", { visible: true, opacity: 1 });
    if (mapView.__EXPERIMENTAL__auto) mapView.__EXPERIMENTAL__auto();


    // Imposta la mappa sul piano terra all'avvio
    if (groundFloor) {
      mapView.setFloor(groundFloor.id);
    }

    // 1. Inizializza Blue Dot reale
    const bd = new BlueDot(mapView);
    
    // Attiviamo il tracciamento della posizione del dispositivo
    bd.enable({ 
      watchDevicePosition: true, 
      color: UNIBO_RED 
    });

    // Passiamo l'istanza al componente genitore
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
  if (isLoading) return <div style={{ padding: "20px" }}>Caricamento...</div>;
  if (error)
    return (
      <div style={{ color: UNIBO_RED, padding: "20px" }}>
        Errore: {error.message}
      </div>
    );
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        margin: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {mapData && (
        <MapView mapData={mapData} style={{ width: "100%", height: "100%" }}>
          <MapManagers onBlueDotInit={setBlueDot} />
          <SmartWayfinding blueDotInstance={blueDot} />
        </MapView>
      )}
    </div>
  );
}
