import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

let initialized: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!initialized) {
    initialized = runInit();
  }
  return initialized;
}

async function runInit() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS empresas (
      id SERIAL PRIMARY KEY,
      razao_social TEXT NOT NULL,
      nome_fantasia TEXT,
      cnpj TEXT,
      ie TEXT,
      endereco TEXT,
      bairro TEXT,
      cidade TEXT,
      estado TEXT,
      cep TEXT,
      natureza TEXT,
      prazo_padrao TEXT,
      observacoes TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contatos (
      id SERIAL PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      cargo TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orcamentos (
      id SERIAL PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id),
      contato_id INTEGER REFERENCES contatos(id),
      natureza TEXT,
      data_emissao TEXT NOT NULL,
      prazo_entrega TEXT,
      validade_proposta TEXT DEFAULT '15 DIAS',
      condicoes_pagamento TEXT DEFAULT '15 DIAS DDL',
      garantia_servico TEXT DEFAULT '90 DIAS',
      garantia_produto TEXT,
      desconto NUMERIC DEFAULT 0,
      escopo_servico TEXT,
      observacoes TEXT,
      status TEXT DEFAULT 'RASCUNHO',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orcamento_itens (
      id SERIAL PRIMARY KEY,
      orcamento_id INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
      ordem INTEGER DEFAULT 0,
      cod_ncm TEXT,
      descricao TEXT NOT NULL,
      fabricante TEXT,
      unidade TEXT DEFAULT 'UN',
      quantidade NUMERIC DEFAULT 1,
      prazo_entrega TEXT,
      valor_unitario NUMERIC DEFAULT 0
    )
  `;

  const { rows } = await sql`SELECT COUNT(*)::int AS c FROM admin_users`;
  if (rows[0].c === 0) {
    const defaultUser = process.env.ADMIN_DEFAULT_USER || "admin";
    const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || "gautomation2016";
    const hash = bcrypt.hashSync(defaultPass, 10);
    await sql`
      INSERT INTO admin_users (username, password_hash)
      VALUES (${defaultUser}, ${hash})
      ON CONFLICT (username) DO NOTHING
    `;
    console.log(
      `[gautomation-app] Usuário admin padrão criado -> usuário: "${defaultUser}" senha: "${defaultPass}". Troque a senha depois do primeiro login.`
    );
  }
}

export { sql };
