import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

type BrasilApiCnpj = {
  razao_social: string;
  nome_fantasia: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  ddd_telefone_1: string | null;
  descricao_situacao_cadastral: string | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { cnpj } = await params;
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[cnpj] fetch falhou:", err);
    return NextResponse.json(
      { error: "Não foi possível consultar o CNPJ agora", debug: String(err) },
      { status: 502 }
    );
  }

  if (res.status === 404) {
    return NextResponse.json({ error: "CNPJ não encontrado" }, { status: 404 });
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    console.error("[cnpj] resposta não-ok:", res.status, bodyText);
    return NextResponse.json(
      { error: "Não foi possível consultar o CNPJ agora", debug: `status ${res.status}: ${bodyText.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data: BrasilApiCnpj = await res.json();

  const endereco = [data.logradouro, data.numero].filter(Boolean).join(", ");

  return NextResponse.json({
    razao_social: data.razao_social || "",
    nome_fantasia: data.nome_fantasia || "",
    endereco,
    bairro: data.bairro || "",
    cidade: data.municipio || "",
    estado: data.uf || "",
    cep: data.cep || "",
    telefone: data.ddd_telefone_1 || "",
    situacao: data.descricao_situacao_cadastral || "",
  });
}
