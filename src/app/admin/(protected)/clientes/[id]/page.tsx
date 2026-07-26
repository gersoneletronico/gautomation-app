import { notFound } from "next/navigation";
import { sql, ensureSchema } from "@/lib/db";
import ClienteForm from "../ClienteForm";
import DeleteClienteButton from "./DeleteClienteButton";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureSchema();
  const { id } = await params;
  const { rows: empresaRows } = await sql`SELECT * FROM empresas WHERE id = ${id}`;
  const empresa = empresaRows[0] as Record<string, unknown> | undefined;
  if (!empresa) notFound();

  const { rows: contatos } = await sql`
    SELECT * FROM contatos WHERE empresa_id = ${id} ORDER BY nome ASC
  `;

  const initial = {
    id: Number(id),
    razao_social: (empresa.razao_social as string) ?? "",
    nome_fantasia: (empresa.nome_fantasia as string) ?? "",
    cnpj: (empresa.cnpj as string) ?? "",
    ie: (empresa.ie as string) ?? "",
    endereco: (empresa.endereco as string) ?? "",
    bairro: (empresa.bairro as string) ?? "",
    cidade: (empresa.cidade as string) ?? "",
    estado: (empresa.estado as string) ?? "",
    cep: (empresa.cep as string) ?? "",
    natureza: (empresa.natureza as string) ?? "",
    prazo_padrao: (empresa.prazo_padrao as string) ?? "",
    observacoes: (empresa.observacoes as string) ?? "",
    contatos: (contatos as Record<string, unknown>[]).map((c) => ({
      id: c.id as number,
      nome: (c.nome as string) ?? "",
      email: (c.email as string) ?? "",
      telefone: (c.telefone as string) ?? "",
      cargo: (c.cargo as string) ?? "",
    })),
  };

  if (initial.contatos.length === 0) {
    initial.contatos.push({ id: undefined as unknown as number, nome: "", email: "", telefone: "", cargo: "" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between max-w-3xl">
        <h1 className="text-2xl font-bold">Editar cliente</h1>
        <DeleteClienteButton id={Number(id)} />
      </div>
      <ClienteForm initial={initial} />
    </div>
  );
}
