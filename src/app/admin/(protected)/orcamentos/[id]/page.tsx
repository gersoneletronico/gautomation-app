import { notFound } from "next/navigation";
import { sql, ensureSchema } from "@/lib/db";
import OrcamentoForm from "../OrcamentoForm";
import DeleteOrcamentoButton from "./DeleteOrcamentoButton";

export default async function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureSchema();
  const { id } = await params;
  const { rows: orcRows } = await sql`SELECT * FROM orcamentos WHERE id = ${id}`;
  const orcamento = orcRows[0] as Record<string, unknown> | undefined;
  if (!orcamento) notFound();

  const { rows: itens } = await sql`
    SELECT * FROM orcamento_itens WHERE orcamento_id = ${id} ORDER BY ordem ASC, id ASC
  `;

  const initial = {
    id: Number(id),
    numero: orcamento.numero as string,
    empresa_id: orcamento.empresa_id as number,
    contato_id: (orcamento.contato_id as number) ?? ("" as const),
    natureza: (orcamento.natureza as string) ?? "",
    prazo_entrega: (orcamento.prazo_entrega as string) ?? "",
    validade_proposta: (orcamento.validade_proposta as string) ?? "",
    condicoes_pagamento: (orcamento.condicoes_pagamento as string) ?? "",
    garantia_servico: (orcamento.garantia_servico as string) ?? "",
    garantia_produto: (orcamento.garantia_produto as string) ?? "",
    desconto: Number(orcamento.desconto) || 0,
    escopo_servico: (orcamento.escopo_servico as string) ?? "",
    observacoes: (orcamento.observacoes as string) ?? "",
    status: (orcamento.status as string) ?? "RASCUNHO",
    itens: (itens as Record<string, unknown>[]).map((it) => ({
      id: it.id as number,
      cod_ncm: (it.cod_ncm as string) ?? "",
      descricao: (it.descricao as string) ?? "",
      fabricante: (it.fabricante as string) ?? "",
      unidade: (it.unidade as string) ?? "UN",
      quantidade: Number(it.quantidade) || 1,
      prazo_entrega: (it.prazo_entrega as string) ?? "",
      valor_unitario: Number(it.valor_unitario) || 0,
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between max-w-5xl flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          Orçamento <span className="text-orange-400 font-mono">{initial.numero}</span>
        </h1>
        <div className="flex gap-2">
          <a
            href={`/api/orcamentos/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Baixar PDF
          </a>
          <DeleteOrcamentoButton id={Number(id)} />
        </div>
      </div>
      <OrcamentoForm initial={initial} />
    </div>
  );
}
