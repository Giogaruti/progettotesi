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
import { WALLS } from "@mappedin/mappedin-js";
const options = {
  key: "mik_XyDzI7uiMbmwy6hoP587807f7",

  secret: "mis_DTert4P9ZbYwygjmefSB98U7XbueODXz6VdSFJJahyZ959b109b",

  mapId: "689f7c80dc0905000b1393fe",
};

const UNIBO_RED = "#bb2e29";

const UNIBO_WHITE = "#ffffff";

const UNIBO_BLACK = "#000000";

// --- LISTE STANZE PER EDIFICIO ---

const STANZE_E1 = [
  "Aula 0.1",
  "Aula 0.2",
  "Aula 0.4",
  "Aula 0.5",
  "Aula 0.6",
  "Aula 0.7",
  "Aula 0.8",
  "Aula 1.2",
  "Aula 1.3",
  "Aula 1.4",
  "Aula 1.5",
  "Aula 1.6",
  "Aula 2.2",
  "Aula 2.3",
  "Aula 2.4",
  "Aula 2.5",
  "Aula 2.6",
  "Aula 2.7A",
  "Aula 2.7B",
  "Aula 2.8",
  "Aula 2.9",
  "Aula 3.1",
  "Aula 3.3",
  "Aula 3.4",
  "Aula 3.6",
  "Lab 0",
  "Lab 4",
  "Lab 5",
  "Lab 9",
  "Sala studio 0.3",
  "Sala studio 0.4",
  "Sala Consiglio",
  "Aula Magna",
  "Biblioteca Dore",
  "Bar",
  "Portineria",
];

const STANZE_E2 = [
  "Aula 4.1",
  "Aula 4.2",
  "Aula 5.1",
  "Aula 5.2",
  "Aula 5.4",
  "Aula 5.5",
  "Aula 5.6",
  "Aula 5.7",
  "Aula 6.1",
  "Aula 6.2",
  "Lab 1",
  "Lab 2",
  "Lab 3",
  "Mensa",
];

const STANZE_E3 = [
  "Aula I",
  "Aula II",
  "Aula III",
  "Aula IX",
  "Aula V",
  "Aula VI",
  "Aula VII",
  "Aula VIII",
  "Aula IX",
];

const STANZE_E4 = ["Aula 8.1"];

const STANZE_E5 = ["Aula Trasporti", "Lab di Fotografia"];

const CATEGORIES = [
  {
    id: "aule",
    label: "Aule",
    icon: "📖",
    items: [
      "Aula 0.1",
      "Aula 0.2",
      "Aula 0.4",
      "Aula 0.5",
      "Aula 0.6",
      "Aula 0.7",
      "Aula 0.8",
      "Aula 1.2",
      "Aula 1.3",
      "Aula 1.4",
      "Aula 1.5",
      "Aula 1.6",
      "Aula 2.2",
      "Aula 2.3",
      "Aula 2.4",
      "Aula 2.5",
      "Aula 2.6",
      "Aula 2.7A",
      "Aula 2.7B",
      "Aula 2.8",
      "Aula 2.9",
      "Aula 3.1",
      "Aula 3.3",
      "Aula 3.4",
      "Aula 3.6",
      "Aula 4.1",
      "Aula 4.2",
      "Aula 5.1",
      "Aula 5.2",
      "Aula 5.4",
      "Aula 5.5",
      "Aula 5.6",
      "Aula 5.7",
      "Aula 6.1",
      "Aula 6.2",
      "Aula I",
      "Aula II",
      "Aula III",
      "Aula IX",
      "Aula V",
      "Aula VI",
      "Aula VII",
      "Aula VIII",
      "Aula IX",
      "Aula 8.1",
      "Aula Trasporti",
      "Aula Magna",
    ],
  },

  {
    id: "lab",
    label: "Laboratori",
    icon: "💻",
    items: [
      "Lab 0",
      "Lab 4",
      "Lab 5",
      "Lab 9",
      "Lab 1",
      "Lab 2",
      "Lab 3",
      "Lab di Fotografia",
    ],
  },

  { id: "ristoro", label: "Ristoro", icon: "☕", items: ["Bar", "Mensa"] },

  {
    id: "servizi",
    label: "Servizi",
    icon: "🚻",
    items: [
      "Sala studio 0.3",
      "Sala studio 0.4",
      "Sala Consiglio",
      "Biblioteca Dore",
      "Portineria",
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
      "Porta Saragozza - Liceo Righi #46",
      "Porta Saragozza - Liceo Righi #51",
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

const BUILDING_INTERACTION = {
  fc_94b7a4dd7fee1f8f: { name: "E1 + E2", color: "#B3D9D9" },

  fc_94b7a4dd7fee1f8a: { name: "E1 + E2", color: "#B3D1C6" },

  fc_7a4dd7fee1f8f330: { name: "E3", color: "#F9D0C2" },

  fc_dd7fee1f8f330c42: { name: "E4", color: "#C2C9E0" },

  fc_351964552d388fd2: { name: "E5", color: "#e2e1c2" },

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
  const [showFloorMenu, setShowFloorMenu] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // Mappatura Edifici -> Piani (usa gli ID che vedi nei log della tua console)

  const BUILDINGS_DATA = [
    {
      id: "e1_e2",

      name: "Edificio E1 + E2",

      floors: [
        { id: "m_0ae87446ce0bdede", name: "Piano 3" },
        { id: "m_544bceedfc4cb202", name: "Piano 2" },
        { id: "m_a0070fa062fa8917", name: "Piano 1" },
        { id: "m_73346441c6056802", name: "Piano Terra" },
        { id: "m_12ed62f23066cfa7", name: "Piano -1" },
      ],
    },
    {
      id: "e3",

      name: "Edificio E3",

      floors: [
        { id: "m_bdf57ffb0970378d", name: "Piano 2" },
        { id: "m_2d3eafe67300025c", name: "Piano 1" },
        { id: "m_eeb2b5535b557a02", name: "Piano Terra" },
      ],
    },
    {
      id: "e4",

      name: "Edificio E4",

      floors: [
        { id: "m_5dceea4b2fb7f7e2", name: "Piano 1" },
        { id: "m_c7f3cbbb678828aa", name: "Piano Terra" },
      ],
    },
    {
      id: "e5",

      name: "Edificio E5",

      floors: [{ id: "m_be1fca4d192f8bda", name: "Piano Terra" }],
    },
  ];

  const dragStartY = useRef(0);

  const isDragging = useRef(false);

  useMapViewEvent("click", (event) => {
    // 1. Blocca l'interazione se la navigazione è in corso
    if (directions) return;

    // 2. Estrazione target
    const poi = event.pointsOfInterest?.[0];
    const space = event.spaces?.[0];
    const annotation = event.annotations?.[0];
    const label = event.labels?.[0];

    const target = annotation || poi || space || label?.target;

    // 3. RESET COLORE: Se c'era una stanza selezionata, riportala a bianco prima di procedere
    if (selectedRoom && selectedRoom.target) {
      mapView.updateState(selectedRoom.target, { color: "#ffffff" });
    }

    // 4. Gestione chiusura pannello categorie se aperto
    if (panelState === "full") {
      setPanelState("partial");
      setActiveCategory(null);
    }

    const displayName = target?.name || target?.type || "";
    const lowerName = displayName.toLowerCase();

    // 5. FILTRO: Se il nome contiene "room", "hallway" o è vuoto, non mostrare nulla
    const isUndefined = lowerName.includes("room") || 
                        lowerName.includes("hallway") || 
                        displayName.trim() === "";

    if (target && !isUndefined) {
      const profile = target.locationProfiles?.[0];
      
      // Determina il colore in base all'edificio (usando la tua logica BUILDING_INTERACTION)
      let highlightColor = BUILDING_INTERACTION.default.color || BUILDING_INTERACTION.default;
      if (STANZE_E1.includes(displayName)) highlightColor = BUILDING_INTERACTION["fc_94b7a4dd7fee1f8f"].color;
      else if (STANZE_E2.includes(displayName)) highlightColor = BUILDING_INTERACTION["fc_94b7a4dd7fee1f8a"].color;
      else if (STANZE_E3.includes(displayName)) highlightColor = BUILDING_INTERACTION["fc_7a4dd7fee1f8f330"].color;
      else if (STANZE_E4.includes(displayName)) highlightColor = BUILDING_INTERACTION["fc_dd7fee1f8f330c42"].color;
      else if (STANZE_E5.includes(displayName)) highlightColor = BUILDING_INTERACTION["fc_351964552d388fd2"].color;

      // 6. Impostazione della stanza selezionata
      setSelectedRoom({
        name: displayName,
        description: profile?.description || (annotation ? "Presidio di sicurezza." : ""),
        image: profile?.images?.[0]?.url || target.icon?.url || null,
        openingHours: profile?.openingHoursSpecification || null,
        target: target,
      });

      // 7. Colora la stanza cliccata e sposta la camera
      mapView.updateState(target, { color: highlightColor });
      mapView.Camera.focusOn(target);
    } else {
      // 8. Se clicchi su un corridoio, area grigia o spazio vuoto, chiudi il popup
      setSelectedRoom(null);
    }
  });
  
  useEffect(() => {
    if (!mapData) return;

    console.log(
      "%c--- 🏢 REPORT STRUTTURA MAPPA ---",
      "color: #bb2e29; font-weight: bold; font-size: 16px;",
    );

    // 1. ELENCO EDIFICI (FACADE)
    console.group("🧱 ID EDIFICI (FACADE)");
    const facades = mapData.getByType("facade");
    if (facades.length > 0) {
      facades.forEach((f) => {
        console.log(
          `ID: %c${f.id}%c | Nome: ${f.name || "Nessun nome"}`,
          "color: blue; font-weight: bold",
          "color: inherit",
        );
      });
    } else {
      console.log("Nessuna facciata trovata.");
    }
    console.groupEnd();

    // 2. ELENCO PIANI (FLOOR)
    console.group("📶 ID PIANI (FLOORS)");
    const floors = mapData.getByType("floor");
    if (floors.length > 0) {
      floors.forEach((f) => {
        console.log(
          `ID: %c${f.id}%c | Nome: ${f.name} | Elevazione: ${f.elevation}`,
          "color: green; font-weight: bold",
          "color: inherit",
        );
      });
    } else {
      console.log("Nessun piano trovato.");
    }
    console.groupEnd();

    console.log(
      "%c--------------------------------",
      "color: #bb2e29; font-weight: bold;",
    );
  }, [mapData]);

  useEffect(() => {
    if (!directions || !mapView) return;

    // Quando iniziano le direzioni, seguiamo il primo set di coordinate
    const firstInstruction = directions.instructions[0];
    if (firstInstruction && firstInstruction.coordinate.floorId) {
      mapView.setFloor(firstInstruction.coordinate.floorId);
    }

    // Opzionale: Focus automatico sul percorso completo all'inizio
    mapView.Camera.focusOn(directions.coordinates);
  }, [directions, mapView]);

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

            if (target.floor) {
              mapView.setFloor(target.floor.id);
            }

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

    window.setMapFloor = (floorId) => {
      if (mapView && floorId) {
        mapView.setFloor(floorId);
      }
    };

    // Pulizia quando il componente viene smontato

    return () => {
      delete window.setMapFloor;
    };
  }, [mapData, mapView]);

  const handleFocusStart = () => {
    setPanelState("full");

    // Se il campo è vuoto, mostriamo subito l'opzione posizione

    if (!startQuery) {
      setSuggestions((prev) => ({
        ...prev,

        start: ["Mia Posizione"],
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
    try {
        const allSpaces = mapData.getByType("space");
        const allPois = mapData.getByType("point-of-interest");

        const findTarget = (name) =>
            allSpaces.find((s) => s.name === name) ||
            allPois.find((p) => p.name === name);

        const destination = findTarget(destName);
        let departure;

        if (startName === "Mia Posizione" || startName === "") {
            // Estrae la coordinata dall'istanza del Blue Dot [cite: 191]
            departure = blueDotInstance?.position?.coordinate;
            
            // Fallback manuale se l'istanza non ha ancora i dati caricati
            if (!departure) {
                departure = mapView.createCoordinate(44.48794636, 11.33062005);
            }
        } else {
            departure = findTarget(startName);
        }

        if (departure && destination) {
            const result = await mapData.getDirections(departure, destination);
            if (result) {
                setDirections(result);
                setPanelState("partial");
                
                // Opzionale: centra la camera sulla partenza
                mapView.Camera.focusOn(departure);
            }
        }
    } catch (e) {
        console.error("Errore nella navigazione:", e);
    }
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

  const clearRoute = (e) => {
    if (e) e.stopPropagation(); // Evita di triggerare il drag del pannello

    setDirections(null);

    setStartQuery("");

    setDestQuery("");

    setSuggestions({ start: [], dest: [] });

    setPanelState("closed");

    // Non resettiamo selectedRoom qui per non chiudere il popup se presente
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
      /* Assicura che solo gli elementi del piano attivo siano prominenti */
.mappedin-floor-label {
  display: none; /* Nasconde le etichette di piano di default se creano confusione */
}

                .mobile-interface-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; font-family: -apple-system, sans-serif; }

                .top-details-overlay { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: white; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 2000; pointer-events: auto; overflow: hidden; animation: slideDown 0.3s ease-out; }

                @keyframes slideDown { from { transform: translate(-50%, -100%); } to { transform: translate(-50%, 0); } }

                .top-details-content { padding: 15px; display: flex; align-items: center; gap: 15px; }

                .top-details-img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; background: #f0f0f0; }

                .top-details-info { flex: 1; }

                .top-details-info h3 { margin: 0; font-size: 18px; color: ${UNIBO_BLACK} !important; }

                .top-details-info p { margin: 3px 0 0; font-size: 13px; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

                .top-close-btn { background: #f0f0f0; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; color: ${UNIBO_BLACK}; }



                .bottom-sheet {position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top-left-radius: 20px; border-top-right-radius: 20px; box-shadow: 0 -5px 25px rgba(0,0,0,0.2); z-index: 1000; pointer-events: auto; height: 60vh; transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); display: flex; flex-direction: column;}

                .bottom-sheet.full { transform: translateY(0); }

                .bottom-sheet.partial { transform: translateY(calc(60vh - 220px));}

                .bottom-sheet.closed { transform: translateY(calc(60vh - 40px)); }

                .categories-section { flex: 1; overflow-y: auto; display: ${panelState === "full" ? "block" : "none"};}



                .drag-handle-container { width: 100%; height: 40px; display: flex; justify-content: center; align-items: center; cursor: grab; user-select: none; flex-shrink: 0; }

                .drag-handle { width: 40px; height: 5px; background: rgba(0,0,0,0.1); border-radius: 10px; }



               

                .search-section { padding: 0 16px 15px; flex-shrink: 0; position: relative;}

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



                .autocomplete-list { position: absolute; background: white; border-radius: 12px; margin-top: 2px; max-height: 200px; overflow-y: auto; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 100; width: calc(100% - 32px); left: 16px;}

                .autocomplete-item { padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; color: ${UNIBO_BLACK} !important; font-size: 15px; }

               

                @keyframes fadeInOut {0% { opacity: 0; transform: translate(-50%, 20px); } 15% { opacity: 1; transform: translate(-50%, 0); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -100%); }}



                .modal-backdrop {position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.2); z-index: 2500; pointer-events: auto; }



                .floor-selector-btn {position: absolute; right: 20px; bottom: 300px; width: 50px; height: 50px; background: white; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; pointer-events: auto; z-index: 900; border: none; cursor: pointer;}

                .floor-menu {position: absolute; right: 80px; bottom: 300px; background: white; padding: 10px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 2000; width: 200px; pointer-events: auto;}

                .floor-option {padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; font-weight: 500; color: #333;}

                .floor-option:last-child { border-bottom: none; }

                .floor-option:hover { background: #f0f0f0; }



                /* Stile per il contenitore di caricamento */

.loading-screen {

  position: fixed;

  top: 0;

  left: 0;

  width: 100vw;

  height: 100vh;

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  background-color: white;

  z-index: 9999;

}



/* La rotellina (Spinner) */

.spinner {

  width: 50px;

  height: 50px;

  border: 5px solid rgba(187, 46, 41, 0.1); /* UNIBO_RED molto chiaro */

  border-top: 5px solid #bb2e29; /* UNIBO_RED */

  border-radius: 50%;

  animation: spin 1s linear infinite;

}



@keyframes spin {

  0% { transform: rotate(0deg); }

  100% { transform: rotate(360deg); }

}



.loading-text {

  margin-top: 15px;

  font-family: -apple-system, sans-serif;

  color: #bb2e29;

  font-weight: 600;

  font-size: 14px;

}

            `}</style>

      {choiceModal && (
        <>
          {/* Overlay di sfondo cliccabile per chiudere */}

          <div
            className="modal-backdrop"
            onClick={() => setChoiceModal(null)}
          />

          <div
            className="choice-modal"
            onClick={(e) => e.stopPropagation()} // Impedisce la chiusura se clicchi dentro il popup
            style={{ zIndex: 3000 }} // Assicuriamoci che stia sopra l'overlay
          >
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

            {/* Tasto annulla facoltativo, dato che ora puoi cliccare fuori */}

            <button
              className="choice-btn"
              style={{ border: "none", color: "#888", marginTop: "5px" }}
              onClick={() => setChoiceModal(null)}
            >
              Chiudi
            </button>
          </div>
        </>
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

                {selectedRoom.openingHours &&
                  selectedRoom.openingHours.length > 0 && (
                    <div
                      style={{
                        margin: "12px 0",

                        padding: "10px",

                        backgroundColor: "#f5f5f5",

                        borderRadius: "10px",

                        borderLeft: `4px solid ${UNIBO_RED}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13px",

                          fontWeight: "bold",

                          margin: "0 0 8px 0",

                          color: UNIBO_BLACK,
                        }}
                      >
                        🕒 Orari di apertura
                      </p>

                      {selectedRoom.openingHours.map((item, index) => {
                        const dayMap = {
                          Monday: "Lun",

                          Tuesday: "Mar",

                          Wednesday: "Mer",

                          Thursday: "Gio",

                          Friday: "Ven",

                          Saturday: "Sab",

                          Sunday: "Dom",
                        };

                        // TRUCCO: Convertiamo sempre in array se è una stringa

                        const daysArray = Array.isArray(item.dayOfWeek)
                          ? item.dayOfWeek
                          : [item.dayOfWeek];

                        let daysText = "";

                        if (daysArray.length === 7) {
                          daysText = "Tutti i giorni";
                        } else if (
                          daysArray.length === 5 &&
                          daysArray.includes("Monday") &&
                          daysArray.includes("Friday")
                        ) {
                          daysText = "Lun - Ven";
                        } else {
                          // Ora .map() funzionerà sempre perché daysArray è sicuramente un array

                          daysText = daysArray

                            .map((d) => dayMap[d] || d)

                            .join(", ");
                        }

                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",

                              justifyContent: "space-between",

                              fontSize: "12px",

                              marginBottom: "4px",

                              gap: "10px",
                            }}
                          >
                            <span
                              style={{
                                color: "#666",

                                fontWeight: "500",

                                flexShrink: 0,
                              }}
                            >
                              {daysText}:
                            </span>

                            <span
                              style={{
                                fontWeight: "600",

                                color:
                                  item.opens === "00:00" &&
                                  item.closes === "00:00"
                                    ? "#999"
                                    : UNIBO_RED,

                                textAlign: "right",
                              }}
                            >
                              {item.opens === "00:00" && item.closes === "00:00"
                                ? "Chiuso"
                                : `${item.opens} - ${item.closes}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
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

                    setPanelState("partial");

                    setSelectedRoom(null);

                    console.log(
                      "Destinazione impostata su:",
                      selectedRoom.name,
                    );
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
            {/* Pulsante X Globale per annullare il percorso */}
            {directions && (
              <button
                onClick={clearRoute}
                style={{
                  position: "absolute",
                  right: "-5px",
                  top: "-35px",
                  background: "#ff3b30",
                  color: "white",
                  border: "none",
                  borderRadius: "100%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                ✕
              </button>
            )}

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
          onStepChange={(step) => {
            if (step.coordinate.floorId) {
              // 1. Cambia il piano
              mapView.setFloor(step.coordinate.floorId);

              // 2. Forza la modalità Flat (rimuove l'effetto X-Ray tra i piani)
              mapView.setFlat(true);

              // 3. Opzionale: centra la telecamera sul nuovo piano
              mapView.Camera.focusOn(step.coordinate);
            }
          }}
          options={{
            pathOptions: {
              color: UNIBO_RED,
              width: 1.7,
              displayArrowsOnPath: true,
              animateArrowsOnPath: true,
              // FONDAMENTALE: impedisce al percorso di essere visto attraverso i solai
              visibleThroughGeometry: false,
            },
            avatarOptions: {
              visible: true,
              color: UNIBO_RED,
            },
}}
        />
      )}

      <button
        className="floor-selector-btn"
        onClick={() => setShowFloorMenu(!showFloorMenu)}
      >
        🏢
      </button>

      {showFloorMenu && (
        <div className="floor-menu">
          {!selectedBuilding ? (
            <>
              <div
                style={{
                  fontWeight: "bold",

                  padding: "10px",

                  color: UNIBO_RED,
                }}
              >
                Seleziona Edificio
              </div>

              {BUILDINGS_DATA.map((b) => (
                <div
                  key={b.id}
                  className="floor-option"
                  onClick={() => setSelectedBuilding(b)}
                >
                  {b.name}
                </div>
              ))}
            </>
          ) : (
            <>
              <div
                style={{
                  fontWeight: "bold",

                  padding: "10px",

                  color: UNIBO_RED,
                }}
                onClick={() => setSelectedBuilding(null)}
              >
                Torna indietro
              </div>

              <div
                style={{ padding: "5px 10px", fontSize: "11px", color: "#888" }}
              >
                {selectedBuilding.name}
              </div>

              {selectedBuilding.floors.map((f) => (
                <div
                  key={f.id}
                  className="floor-option"
                  onClick={() => {
                    mapView.setFloor(f.id);

                    setShowFloorMenu(false);

                    setSelectedBuilding(null);
                  }}
                >
                  {f.name}
                </div>
              ))}
            </>
          )}
        </div>
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

    mapView.updateState("annotation", {
      interactive: true,

      visible: true,
    });

    mapView.updateState(WALLS.Exterior, {
      visible: true,

      color: "#aaaaaa", // Grigio quasi nero per i lati

      topColor: "#8e8e8e", // Nero assoluto per la parte superiore

      opacity: 1,
    });

    mapView.updateState(WALLS.Interior, {
      visible: true,

      color: "#cacaca", // Grigio quasi nero per i lati

      topColor: "#cacaca",

      opacity: 1,
    });

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
      else if (STANZE_E5.includes(name))
        roomColor = BUILDING_INTERACTION["fc_351964552d388fd2"].color;

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

    if (mapView.__EXPERIMENTAL__auto) mapView.__EXPERIMENTAL__auto();

    if (groundFloor) {
      mapView.setFloor(groundFloor.id);
    }

    const bd = new BlueDot(mapView);

    bd.enable({
      watchDevicePosition: false,
      color: UNIBO_RED,
      // Aumentiamo il timeout a 1 ora (in ms) per evitare che diventi grigio
      timeout: 3600000,
    });

    // Forziamo l'aggiornamento immediato della posizione [cite: 169]
    bd.update({
      latitude: 44.48794636,
      longitude: 11.33062005,
      floorOrFloorId: "m_73346441c6056802", // ID Piano Terra E1/E2 [cite: 181]
      accuracy: 10, // Valore basso per renderlo blu brillante [cite: 149]
    });

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

  if (isLoading) {
    return (
      <div className="loading-screen">
        <style>{`

          .loading-screen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: white; z-index: 9999; }

          .spinner { width: 50px; height: 50px; border: 5px solid rgba(187, 46, 41, 0.1); border-top: 5px solid #bb2e29; border-radius: 50%; animation: spin 1s linear infinite; }

          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

          .loading-text { margin-top: 15px; font-family: -apple-system, sans-serif; color: #bb2e29; font-weight: 600; font-size: 14px; }

        `}</style>

        <div className="spinner"></div>

        <div className="loading-text">Caricamento Mappa...</div>
      </div>
    );
  }

  if (error)
    return (
      <div
        style={{
          color: UNIBO_RED,
          padding: "20px",
          textAlign: "center",
          marginTop: "50px",
        }}
      >
        <strong>Errore nel caricamento:</strong> {error.message}
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
        <MapView
          mapData={mapData}
          style={{ width: "100%", height: "100%" }}
          options={{ shadingAndOutlines: true }}
        >
          <MapManagers onBlueDotInit={setBlueDot} />

          <SmartWayfinding blueDotInstance={blueDot} />
        </MapView>
      )}
    </div>
  );
}
