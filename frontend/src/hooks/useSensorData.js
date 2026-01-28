"use client";

import { useEffect, useState } from "react";
import { sensorAPI } from "../services/api";

export const useSensorData = (pollMs = 2000) => {
  const [status, setStatus] = useState(null);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [st, lt, hs] = await Promise.all([
          sensorAPI.getStatus(),
          sensorAPI.getLatest(),
          sensorAPI.getHistory(100),
        ]);

        if (cancelled) return;

        setStatus(st.data);
        setLatest(lt.data);
        setHistory(hs.data);
        setError("");
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.detail || e.message || "Failed to load");
        setLoading(false);
      }
    };

    load(); // первый запрос сразу
    const id = setInterval(load, pollMs);

    return () => {
      cancelled = true;
      clearInterval(id); // cleanup интервала [web:142]
    };
  }, [pollMs]);

  return { status, latest, history, loading, error };
};
