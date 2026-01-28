"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, useMapEvents, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ClickPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapClient() {
  const router = useRouter();
  const [picked, setPicked] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const center = useMemo(() => [48.7164, 21.2611], []);
  const dashboardPoint = useMemo(() => ({ lat: 48.7164, lng: 21.2611 }), []);

  const goToDashboardWithLocation = useCallback(
    (pos) => {
      localStorage.setItem("picked_location", JSON.stringify(pos));
      router.push("/");
    },
    [router]
  );

  // Автопереход после логина с таймером (только если есть флаг)
  useEffect(() => {
    const flag = localStorage.getItem("after_login_show_map");
    if (flag !== "1") return;

    localStorage.removeItem("after_login_show_map");

    let secs = 2;
    setCountdown(secs);

    const tick = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) clearInterval(tick);
    }, 1000);

    const t = setTimeout(() => {
      goToDashboardWithLocation(dashboardPoint);
    }, 2000);

    return () => {
      clearTimeout(t);
      clearInterval(tick);
    };
  }, [dashboardPoint, goToDashboardWithLocation]);

  const pickAndGo = (pos) => {
    setPicked(pos);
    goToDashboardWithLocation(pos);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight">Pick a place</h1>
            <p className="text-slate-300 mt-1">
              Select a point on the map to attach location and continue.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {countdown !== null && countdown >= 0 && (
              <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-slate-200 backdrop-blur-md">
                Going to dashboard in <span className="font-semibold">{countdown}</span>s
              </div>
            )}

            <button
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition backdrop-blur-md"
              onClick={() => router.push("/")}
              type="button"
            >
              Back
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="text-slate-200 text-sm">
              Tip: click anywhere to place a point and return to dashboard.
            </div>

            <div className="text-xs text-slate-300 px-2 py-1 rounded-lg bg-black/20 border border-white/10">
              Košice demo
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="h-[70vh] rounded-2xl overflow-hidden border border-white/10">
              <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />

                <CircleMarker
                  center={[dashboardPoint.lat, dashboardPoint.lng]}
                  radius={10}
                  pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 1 }}
                  eventHandlers={{ click: () => goToDashboardWithLocation(dashboardPoint) }}
                />

                <ClickPicker onPick={pickAndGo} />
                {picked && <Marker position={[picked.lat, picked.lng]} />}
              </MapContainer>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-slate-300 text-sm">
                Current:{" "}
                <span className="text-slate-100">
                  {picked ? `${picked.lat.toFixed(5)}, ${picked.lng.toFixed(5)}` : "—"}
                </span>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition"
                onClick={() => goToDashboardWithLocation(picked || dashboardPoint)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-container img {
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
}
