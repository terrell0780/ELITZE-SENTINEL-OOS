"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function GlobalSearchPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [zoom, setZoom] = useState(1.5);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [-40, 30],
      zoom: zoom,
      pitch: 0,
    });

    map.current.on('style.load', () => {
      // @ts-ignore - Some versions of maplibre type definitions might not have setProjection yet
      if (typeof map.current?.setProjection === 'function') {
        map.current.setProjection({ type: 'globe' });
      }
    });

    map.current.on('zoom', () => {
      if (map.current) {
        setZoom(Number(map.current.getZoom().toFixed(2)));
      }
    });

    // Clean up on unmount
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    if (map.current) {
      map.current.zoomTo(newZoom, { duration: 300 });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !map.current) return;
    
    // Fake search: just fly to a random city for demonstration
    // In production, this would hit a Geocoding API (e.g. Mapbox Geocoding or Nominatim)
    const mockCoordinates: [number, number] = [
      (Math.random() - 0.5) * 360, 
      (Math.random() - 0.5) * 160
    ];

    map.current.flyTo({
      center: mockCoordinates,
      zoom: 12,
      pitch: 45,
      duration: 3000,
      essential: true
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#09090B] relative">
      <header className="absolute top-0 left-0 right-0 h-20 z-10 p-6 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-lg font-semibold text-white drop-shadow-md">ELITZE GLOBAL</h1>
          <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest drop-shadow-md mt-0.5">Gods Eye View</p>
        </div>

        <form onSubmit={handleSearch} className="pointer-events-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A1A1AA]">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search Elitze Global, Google, Bing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-96 bg-[#111113]/90 backdrop-blur-md border border-[#27272A] rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#A1A1AA] outline-none focus:border-[#D92A2A] shadow-lg transition-colors"
          />
        </form>
      </header>

      {/* Zoom Slider Overlay */}
      <div className="absolute bottom-10 right-10 z-10 bg-[#111113]/90 backdrop-blur-md border border-[#27272A] p-5 rounded-xl flex flex-col items-center gap-4 shadow-xl">
        <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Space</span>
        <input 
          type="range" 
          min="1" 
          max="18" 
          step="0.1" 
          value={zoom} 
          onChange={handleZoomChange}
          className="w-1.5 h-32 appearance-none bg-[#27272A] rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D92A2A] [&::-webkit-slider-thumb]:cursor-pointer cursor-pointer origin-center -rotate-90 translate-y-14 translate-x-14"
          style={{ width: "128px", height: "6px", transform: "rotate(270deg)" }}
        />
        <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mt-28">Street</span>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
