import Link from "next/link";
import { sql, ensureSchema } from "@/lib/db";

export default async function ClientesPage() {
  await ensureSchema();
  const { rows: empresas } = await sql<{
    id: number;
    razao_social: string;
    nome_fantasia: string | null;
    cnpj: string | null;
    cidade: string | null;
    estado: string | null;
  }>`
    SELECT id, razao_social, nome_fantasia, cnpj, cidade, estado FROM empresas ORDER BY razao_social ASC
  `;

  const { rows: contatosCount } = await sql<{ empresa_id: number; c: number }>`
    SELECT empresa_id, COUNT(*)::int as c FROM contatos GROUP BY empresa_id
  `;
  const countMap = new Map(contatosCount.map((c) => [c.empresa_id, c.c]));

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link
          href="/admin/clientes/novo"
          className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 transition-colors text-sm font-medium"
        >
          + Novo cliente
        </Link>
      </div>

      <div className="border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Razão Social</th>
              <th className="text-left px-4 py-2 font-medium">CNPJ</th>
              <th className="text-left px-4 py-2 font-medium">Cidade/UF</th>
              <th className="text-left px-4 py-2 font-medium">Contatos</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className="border-t border-neutral-800 hover:bg-neutral-900/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/clientes/${e.id}`} className="text-orange-400 hover:underline">
                    {e.razao_social}
                  </Link>
                  {e.nome_fantasia && (
                    <span className="text-neutral-500"> ({e.nome_fantasia})</span>
                  )}
                </td>
                <td className="px-4 py-2">{e.cnpj || "-"}</td>
                <td className="px-4 py-2">
                  {e.cidade ? `${e.cidade}/${e.estado || ""}` : "-"}
                </td>
                <td className="px-4 py-2">{countMap.get(e.id) || 0}</td>
              </tr>
            ))}
            {empresas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
