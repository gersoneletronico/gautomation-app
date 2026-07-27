import Link from "next/link";
import { sql, ensureSchema } from "@/lib/db";

export default async function OrcamentosPage() {
  await ensureSchema();
  const { rows } = await sql<{
    id: number;
    numero: string;
    status: string;
    data_emissao: string;
    razao_social: string;
    contato_nome: string | null;
  }>`
    SELECT o.id, o.numero, o.status, o.data_emissao, e.razao_social, c.nome as contato_nome
    FROM orcamentos o
    JOIN empresas e ON e.id = o.empresa_id
    LEFT JOIN contatos c ON c.id = o.contato_id
    ORDER BY o.id DESC
  `;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <Link
          href="/admin/orcamentos/novo"
          className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 transition-colors text-sm font-medium"
        >
          + Novo orçamento
        </Link>
      </div>

      <div className="border border-neutral-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Número</th>
              <th className="text-left px-4 py-2 font-medium">Cliente</th>
              <th className="text-left px-4 py-2 font-medium">Contato</th>
              <th className="text-left px-4 py-2 font-medium">Data</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-neutral-800 hover:bg-neutral-900/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/orcamentos/${o.id}`} className="text-orange-400 hover:underline">
                    {o.numero}
                  </Link>
                </td>
                <td className="px-4 py-2">{o.razao_social}</td>
                <td className="px-4 py-2">{o.contato_nome || "-"}</td>
                <td className="px-4 py-2">{o.data_emissao}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-xs">{o.status}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  Nenhum orçamento ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
