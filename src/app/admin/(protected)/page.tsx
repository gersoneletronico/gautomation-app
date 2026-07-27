import Link from "next/link";
import { sql, ensureSchema } from "@/lib/db";

export default async function AdminDashboard() {
  await ensureSchema();
  const { rows: clientesCount } = await sql<{ c: number }>`SELECT COUNT(*)::int as c FROM empresas`;
  const { rows: orcamentosCount } = await sql<{ c: number }>`SELECT COUNT(*)::int as c FROM orcamentos`;
  const totalClientes = clientesCount[0].c;
  const totalOrcamentos = orcamentosCount[0].c;
  const { rows: ultimosOrcamentos } = await sql<{
    id: number;
    numero: string;
    status: string;
    data_emissao: string;
    razao_social: string;
  }>`
    SELECT o.id, o.numero, o.status, o.data_emissao, e.razao_social
    FROM orcamentos o JOIN empresas e ON e.id = o.empresa_id
    ORDER BY o.id DESC LIMIT 8
  `;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <p className="text-neutral-400 text-sm">Clientes cadastrados</p>
          <p className="text-3xl font-bold mt-1">{totalClientes}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <p className="text-neutral-400 text-sm">Orçamentos emitidos</p>
          <p className="text-3xl font-bold mt-1">{totalOrcamentos}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/orcamentos/novo"
          className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 transition-colors text-sm font-medium"
        >
          + Novo orçamento
        </Link>
        <Link
          href="/admin/clientes/novo"
          className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium"
        >
          + Novo cliente
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Últimos orçamentos</h2>
        <div className="border border-neutral-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Número</th>
                <th className="text-left px-4 py-2 font-medium">Cliente</th>
                <th className="text-left px-4 py-2 font-medium">Data</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ultimosOrcamentos.map((o) => (
                <tr key={o.id} className="border-t border-neutral-800 hover:bg-neutral-900/60">
                  <td className="px-4 py-2">
                    <Link href={`/admin/orcamentos/${o.id}`} className="text-orange-400 hover:underline">
                      {o.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{o.razao_social}</td>
                  <td className="px-4 py-2">{o.data_emissao}</td>
                  <td className="px-4 py-2">{o.status}</td>
                </tr>
              ))}
              {ultimosOrcamentos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                    Nenhum orçamento ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
