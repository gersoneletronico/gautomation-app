"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteClienteButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este cliente? Essa ação não pode ser desfeita.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/empresas/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Erro ao excluir cliente");
        return;
      }
      router.push("/admin/clientes");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-md bg-red-900/50 hover:bg-red-900 text-red-300 transition-colors disabled:opacity-60"
    >
      {loading ? "Excluindo..." : "Excluir cliente"}
    </button>
  );
}
