"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteOrcamentoButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este orçamento? Essa ação não pode ser desfeita.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orcamentos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Erro ao excluir orçamento");
        return;
      }
      router.push("/admin/orcamentos");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-3 py-2 rounded-md bg-red-900/50 hover:bg-red-900 text-red-300 transition-colors disabled:opacity-60"
    >
      {loading ? "Excluindo..." : "Excluir"}
    </button>
  );
}
