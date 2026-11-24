import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

const db = global.__db ?? new Database(path.join(dataDir, "gautomation.db"));
global.__db = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Mesma interface do @vercel/postgres (sql`...` => { rows }), rodando em SQLite local.
type Param = string | number | bigint | boolean | null | undefined;

export async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: Param[]
): Promise<{ rows: T[] }> {
  const text = strings
    .join("?")
    .replace(/::int\b/gi, "")
    .replace(/\bnow\(\)/gi, "datetime('now')");
  const params = values.map((v) => (v === undefined ? null : typeof v === "boolean" ? Number(v) : v));
  const stmt = db.prepare(text);
  if (stmt.reader) return { rows: stmt.all(...params) as T[] };
  stmt.run(...params);
  return { rows: [] };
}

db.exec(`
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS empresas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contatos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cargo TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orcamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  desconto REAL DEFAULT 0,
  escopo_servico TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'RASCUNHO',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orcamento_id INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  ordem INTEGER DEFAULT 0,
  cod_ncm TEXT,
  descricao TEXT NOT NULL,
  fabricante TEXT,
  unidade TEXT DEFAULT 'UN',
  quantidade REAL DEFAULT 1,
  prazo_entrega TEXT,
  valor_unitario REAL DEFAULT 0
);
`);

function seedAdmin() {
  const row = db.prepare("SELECT COUNT(*) AS c FROM admin_users").get() as { c: number };
  if (row.c > 0) return;
  const defaultUser = process.env.ADMIN_DEFAULT_USER || "admin";
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || "gautomation2016";
  db.prepare("INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)").run(
    defaultUser,
    bcrypt.hashSync(defaultPass, 10)
  );
  console.log(
    `[gautomation-app] Usuário admin padrão criado -> usuário: "${defaultUser}" senha: "${defaultPass}". Troque a senha depois do primeiro login.`
  );
}
seedAdmin();

// Compatibilidade: o código já faz `await ensureSchema()` antes de consultar.
export async function ensureSchema(): Promise<void> {}
