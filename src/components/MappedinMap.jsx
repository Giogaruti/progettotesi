import React from "react";
import { MapView, useMapData } from "@mappedin/react-sdk";

export default function MappedinMap() {
  const { mapData, isLoading, error } = useMapData({
    key: "mik_PR3UXAsnl3a6LnTRK511b0726",
    secret: "mis_e9JbalSWHAgWYLbTTirFvRXBrfjWexqvo14akJw9yzi98161136",
    mapId: "689f7c80dc0905000b1393fe",
  });

  if (isLoading) return <div>Caricamento mappa…</div>;
  if (error) return <div>Errore: {error.message}</div>;

  // Trova il piano terra (floor 0 o "Ground")
  const groundFloor = mapData?.floors?.find(f => f.level === 0) || mapData?.floors?.[0];

  return (
    <div style={{ width: "100%", height: "600px" }}>
      {mapData && groundFloor && (
        <MapView
          mapData={mapData}
          floorId={groundFloor.id}          // <<<<< seleziona il piano terra
          style={{ width: "100%", height: "100%" }}
          showFloorSelector={false}         // opzionale: nasconde il selettore
        />
      )}
    </div>
  );
}
