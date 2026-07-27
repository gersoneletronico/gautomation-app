import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

type Resultado = {
  razao_social: string;
  nome_fantasia: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
};

const BROWSER_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

async function tentarBrasilApi(digits: string): Promise<Resultado | null> {
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
    headers: BROWSER_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const d = await res.json();
  return {
    razao_social: d.razao_social || "",
    nome_fantasia: d.nome_fantasia || "",
    endereco: [d.logradouro, d.numero].filter(Boolean).join(", "),
    bairro: d.bairro || "",
    cidade: d.municipio || "",
    estado: d.uf || "",
    cep: d.cep || "",
    telefone: d.ddd_telefone_1 || "",
  };
}

async function tentarReceitaWs(digits: string): Promise<Resultado | null> {
  const res = await fetch(`https://receitaws.com.br/v1/cnpj/${digits}`, {
    headers: BROWSER_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const d = await res.json();
  if (d.status === "ERROR") return null;
  return {
    razao_social: d.nome || "",
    nome_fantasia: d.fantasia || "",
    endereco: [d.logradouro, d.numero].filter(Boolean).join(", "),
    bairro: d.bairro || "",
    cidade: d.municipio || "",
    estado: d.uf || "",
    cep: d.cep || "",
    telefone: d.telefone || "",
  };
}

async function tentarCnpjWs(digits: string): Promise<Resultado | null> {
  const res = await fetch(`https://publica.cnpj.ws/cnpj/${digits}`, {
    headers: BROWSER_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const d = await res.json();
  const estabelecimento = d.estabelecimento || {};
  return {
    razao_social: d.razao_social || "",
    nome_fantasia: estabelecimento.nome_fantasia || "",
    endereco: [estabelecimento.tipo_logradouro, estabelecimento.logradouro, estabelecimento.numero]
      .filter(Boolean)
      .join(" "),
    bairro: estabelecimento.bairro || "",
    cidade: estabelecimento.cidade?.nome || "",
    estado: estabelecimento.estado?.sigla || "",
    cep: estabelecimento.cep || "",
    telefone: estabelecimento.ddd1 && estabelecimento.telefone1
      ? `(${estabelecimento.ddd1}) ${estabelecimento.telefone1}`
      : "",
  };
}

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

  const provedores = [tentarBrasilApi, tentarReceitaWs, tentarCnpjWs];

  for (const provedor of provedores) {
    try {
      const resultado = await provedor(digits);
      if (resultado && resultado.razao_social) {
        return NextResponse.json(resultado);
      }
    } catch (err) {
      console.error(`[cnpj] provedor falhou:`, err);
    }
  }

  return NextResponse.json(
    { error: "CNPJ não encontrado ou serviços de consulta indisponíveis no momento. Tente novamente em instantes." },
    { status: 502 }
  );
}
