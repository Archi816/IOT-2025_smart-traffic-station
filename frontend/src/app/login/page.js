"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await authAPI.login(username, password);
      localStorage.setItem("token", res.data.access_token);

      // флаг: “мы пришли на карту после логина”
      localStorage.setItem("after_login_show_map", "1");

      // сначала показываем карту
      router.push("/map");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || e2.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-slate-800/60 border border-slate-700 rounded-2xl p-6"
      >
        <h1 className="text-white text-2xl font-bold mb-4">Login</h1>

        <input
          className="w-full mb-3 p-2 rounded bg-slate-900 text-white"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 rounded bg-slate-900 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

        <button className="w-full bg-purple-600 text-white rounded p-2">
          Sign in
        </button>
      </form>
    </div>
  );
}
