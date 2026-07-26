"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao entrar");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-lg p-8 flex flex-col gap-4"
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          <Image src="/logo.png" alt="G Automation" width={120} height={80} />
          <h1 className="text-lg font-semibold">Área do Administrador</h1>
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Usuário</label>
          <input
            className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none focus:border-orange-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Senha</label>
          <input
            type="password"
            className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none focus:border-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 transition-colors rounded-md py-2 font-medium"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
