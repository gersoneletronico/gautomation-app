"use client";

import { useState } from "react";

export default function TrocarSenhaPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao trocar senha");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none focus:border-orange-500 text-sm w-full";
  const labelClass = "text-xs text-neutral-400 mb-1 block";

  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <h1 className="text-2xl font-bold">Trocar senha</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-400 bg-green-950/50 border border-green-900 rounded-md px-3 py-2">
            Senha alterada com sucesso.
          </div>
        )}
        <div>
          <label className={labelClass}>Senha atual</label>
          <input
            type="password"
            className={inputClass}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Nova senha</label>
          <input
            type="password"
            className={inputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Confirmar nova senha</label>
          <input
            type="password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 px-5 py-2 rounded-md bg-orange-600 hover:bg-orange-500 disabled:opacity-60 transition-colors text-sm font-medium"
        >
          {saving ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
