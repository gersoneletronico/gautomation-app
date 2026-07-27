"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Contato = {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
};

type EmpresaData = {
  id?: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ie: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  natureza: string;
  prazo_padrao: string;
  observacoes: string;
  contatos: Contato[];
};

const empty: EmpresaData = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  ie: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  natureza: "",
  prazo_padrao: "",
  observacoes: "",
  contatos: [{ nome: "", email: "", telefone: "", cargo: "" }],
};

export default function ClienteForm({ initial }: { initial?: EmpresaData }) {
  const router = useRouter();
  const [data, setData] = useState<EmpresaData>(initial ?? empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [cnpjMsg, setCnpjMsg] = useState("");
  const isEdit = Boolean(initial?.id);

  function setField<K extends keyof EmpresaData>(key: K, value: EmpresaData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function buscarCnpj() {
    const digits = data.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) {
      setCnpjMsg("CNPJ incompleto (precisa ter 14 dígitos).");
      return;
    }
    setBuscandoCnpj(true);
    setCnpjMsg("Buscando dados...");
    try {
      const res = await fetch(`/api/cnpj/${digits}`);
      const json = await res.json();
      if (!res.ok) {
        setCnpjMsg(json.error || "Não foi possível buscar o CNPJ.");
        return;
      }
      setData((d) => ({
        ...d,
        razao_social: d.razao_social.trim() ? d.razao_social : json.razao_social || d.razao_social,
        nome_fantasia: d.nome_fantasia.trim() ? d.nome_fantasia : json.nome_fantasia || d.nome_fantasia,
        endereco: json.endereco || d.endereco,
        bairro: json.bairro || d.bairro,
        cidade: json.cidade || d.cidade,
        estado: json.estado || d.estado,
        cep: json.cep || d.cep,
      }));
      setCnpjMsg("Dados preenchidos automaticamente.");
    } finally {
      setBuscandoCnpj(false);
    }
  }

  function setContato(idx: number, field: keyof Contato, value: string) {
    setData((d) => {
      const contatos = [...d.contatos];
      contatos[idx] = { ...contatos[idx], [field]: value };
      return { ...d, contatos };
    });
  }

  function addContato() {
    setData((d) => ({
      ...d,
      contatos: [...d.contatos, { nome: "", email: "", telefone: "", cargo: "" }],
    }));
  }

  function removeContato(idx: number) {
    setData((d) => ({ ...d, contatos: d.contatos.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!data.razao_social.trim()) {
      setError("Razão social é obrigatória.");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/empresas/${initial!.id}` : "/api/empresas";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao salvar cliente");
        return;
      }
      router.push("/admin/clientes");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none focus:border-orange-500 text-sm w-full";
  const labelClass = "text-xs text-neutral-400 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {error && (
        <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-neutral-200">Dados da empresa</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Razão Social *</label>
            <input
              className={inputClass}
              value={data.razao_social}
              onChange={(e) => setField("razao_social", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Nome Fantasia</label>
            <input
              className={inputClass}
              value={data.nome_fantasia}
              onChange={(e) => setField("nome_fantasia", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>CNPJ</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={data.cnpj}
                onChange={(e) => setField("cnpj", e.target.value)}
                onBlur={buscarCnpj}
                placeholder="Somente números ou com pontuação"
              />
              <button
                type="button"
                onClick={buscarCnpj}
                disabled={buscandoCnpj}
                className="shrink-0 text-xs px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-60"
              >
                {buscandoCnpj ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {cnpjMsg && <p className="text-xs text-neutral-500 mt-1">{cnpjMsg}</p>}
          </div>
          <div>
            <label className={labelClass}>Inscrição Estadual</label>
            <input
              className={inputClass}
              value={data.ie}
              onChange={(e) => setField("ie", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Natureza (venda/serviço)</label>
            <input
              className={inputClass}
              value={data.natureza}
              onChange={(e) => setField("natureza", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Endereço</label>
            <input
              className={inputClass}
              value={data.endereco}
              onChange={(e) => setField("endereco", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Bairro</label>
            <input
              className={inputClass}
              value={data.bairro}
              onChange={(e) => setField("bairro", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input
              className={inputClass}
              value={data.cidade}
              onChange={(e) => setField("cidade", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Estado (UF)</label>
            <input
              className={inputClass}
              value={data.estado}
              onChange={(e) => setField("estado", e.target.value)}
              maxLength={2}
            />
          </div>
          <div>
            <label className={labelClass}>CEP</label>
            <input
              className={inputClass}
              value={data.cep}
              onChange={(e) => setField("cep", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Prazo padrão</label>
            <input
              className={inputClass}
              placeholder="Ex: 7 DIAS"
              value={data.prazo_padrao}
              onChange={(e) => setField("prazo_padrao", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Observações</label>
            <textarea
              className={inputClass}
              rows={2}
              value={data.observacoes}
              onChange={(e) => setField("observacoes", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-200">
            Contatos <span className="text-neutral-500 font-normal">(pode cadastrar mais de um)</span>
          </h2>
          <button
            type="button"
            onClick={addContato}
            className="text-xs px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            + Adicionar contato
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {data.contatos.map((c, idx) => (
            <div
              key={c.id ?? `new-${idx}`}
              className="border border-neutral-800 rounded-lg p-3 grid sm:grid-cols-2 gap-3 relative"
            >
              <div>
                <label className={labelClass}>Nome *</label>
                <input
                  className={inputClass}
                  value={c.nome}
                  onChange={(e) => setContato(idx, "nome", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Cargo</label>
                <input
                  className={inputClass}
                  value={c.cargo}
                  onChange={(e) => setContato(idx, "cargo", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input
                  type="email"
                  className={inputClass}
                  value={c.email}
                  onChange={(e) => setContato(idx, "email", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Telefone</label>
                <input
                  className={inputClass}
                  value={c.telefone}
                  onChange={(e) => setContato(idx, "telefone", e.target.value)}
                />
              </div>
              {data.contatos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContato(idx)}
                  className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-md bg-orange-600 hover:bg-orange-500 disabled:opacity-60 transition-colors text-sm font-medium"
        >
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar cliente"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/clientes")}
          className="px-5 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
