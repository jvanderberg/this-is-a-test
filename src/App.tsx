import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Stop = {
  stop_id: string;
  direction: string;
  name: string;
  station: string;
  map_id: string;
  ada: boolean;
  lines: string[];
  lat: number;
  lon: number;
};

const LINE_NAMES: Record<string, string> = {
  red: "Red", blue: "Blue", g: "Green", brn: "Brown",
  p: "Purple", y: "Yellow", pnk: "Pink", o: "Orange",
};
const LINE_COLORS: Record<string, string> = {
  red: "#c60c30", blue: "#00a1de", g: "#009b3a", brn: "#62361b",
  p: "#522398", y: "#f9e300", pnk: "#e27ea6", o: "#f9461c",
};

const OAK_PARK: [number, number] = [41.8864, -87.7845];

export default function App() {
  const [stops, setStops] = useState<Stop[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/cta_l_stops_oak_park.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Stop[]>;
      })
      .then(setStops)
      .catch((e: Error) => setError(e.message));
  }, []);

  // One row per station, with lines merged across platforms.
  const stations = useMemo(() => {
    if (!stops) return [];
    const byName = new Map<string, { name: string; lat: number; lon: number; lines: Set<string>; ada: boolean; stops: Stop[] }>();
    for (const s of stops) {
      let st = byName.get(s.station);
      if (!st) {
        st = { name: s.station, lat: 0, lon: 0, lines: new Set(), ada: false, stops: [] };
        byName.set(s.station, st);
      }
      s.lines.forEach((l) => st!.lines.add(l));
      st.ada = st.ada || s.ada;
      st.stops.push(s);
    }
    for (const st of byName.values()) {
      st.lat = st.stops.reduce((a, s) => a + s.lat, 0) / st.stops.length;
      st.lon = st.stops.reduce((a, s) => a + s.lon, 0) / st.stops.length;
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [stops]);

  return (
    <div className="flex h-dvh flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h1 className="text-lg font-semibold">Oak Park Transit</h1>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {stations.length} L stations
        </span>
      </header>

      <div className="relative min-h-[40dvh] flex-1">
        <MapContainer center={OAK_PARK} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map((st) => (
            <CircleMarker
              key={st.name}
              center={[st.lat, st.lon]}
              radius={selected === st.name ? 10 : 7}
              pathOptions={{
                color: "#1e293b",
                weight: 2,
                fillColor: LINE_COLORS[[...st.lines][0]] ?? "#64748b",
                fillOpacity: 1,
              }}
              eventHandlers={{ click: () => setSelected(st.name) }}
            >
              <Popup>{st.name}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <section
        aria-label="Stations"
        className="max-h-[45dvh] overflow-y-auto border-t border-slate-200 dark:border-slate-700"
      >
        {error && <p className="p-4 text-red-600 dark:text-red-400">Could not load stations: {error}</p>}
        {!stops && !error && <p className="p-4 text-slate-500">Loading stations…</p>}
        <ul>
          {stations.map((st) => (
            <li
              key={st.name}
              className={`border-b border-slate-100 px-4 py-3 dark:border-slate-800 ${
                selected === st.name ? "bg-slate-100 dark:bg-slate-800" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setSelected(st.name)}
                className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
              >
                <span className="font-medium">{st.name}</span>
                <span className="flex flex-wrap justify-end gap-1">
                  {[...st.lines].map((l) => (
                    <span
                      key={l}
                      title={`${LINE_NAMES[l]} Line`}
                      className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: LINE_COLORS[l], color: l === "y" ? "#000" : "#fff" }}
                    >
                      {LINE_NAMES[l]}
                    </span>
                  ))}
                </span>
              </button>
              {selected === st.name && (
                <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {st.stops.map((s) => (
                    <li key={s.stop_id}>
                      {s.direction ? `${s.direction}-bound` : "Platform"} · stop {s.stop_id}
                      {s.ada ? " · accessible" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
