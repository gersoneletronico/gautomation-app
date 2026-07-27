"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Contato = { id: number; nome: string; email: string | null; cargo: string | null };
type Empresa = {
  id: number;
  razao_social: string;
  natureza: string | null;
  prazo_padrao: string | null;
  contatos: Contato[];
};

type Item = {
  id?: number;
  cod_ncm: string;
  descricao: string;
  fabricante: string;
  unidade: string;
  quantidade: number;
  prazo_entrega: string;
  valor_unitario: number;
};

type OrcamentoData = {
  id?: number;
  numero?: string;
  empresa_id: number | "";
  contato_id: number | "";
  natureza: string;
  prazo_entrega: string;
  validade_proposta: string;
  condicoes_pagamento: string;
  garantia_servico: string;
  garantia_produto: string;
  desconto: number;
  escopo_servico: string;
  observacoes: string;
  status: string;
  itens: Item[];
};

const emptyItem: Item = {
  cod_ncm: "",
  descricao: "",
  fabricante: "",
  unidade: "UN",
  quantidade: 1,
  prazo_entrega: "",
  valor_unitario: 0,
};

const empty: OrcamentoData = {
  empresa_id: "",
  contato_id: "",
  natureza: "SERVIÇO",
  prazo_entrega: "",
  validade_proposta: "15 DIAS",
  condicoes_pagamento: "15 DIAS DDL",
  garantia_servico: "90 DIAS",
  garantia_produto: "",
  desconto: 0,
  escopo_servico: "",
  observacoes: "",
  status: "RASCUNHO",
  itens: [{ ...emptyItem }],
};

const currency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function OrcamentoForm({ initial }: { initial?: OrcamentoData }) {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [data, setData] = useState<OrcamentoData>(initial ?? empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    fetch("/api/empresas")
      .then((r) => r.json())
      .then(setEmpresas);
  }, []);

  const empresaSelecionada = useMemo(
    () => empresas.find((e) => e.id === data.empresa_id),
    [empresas, data.empresa_id]
  );

  function setField<K extends keyof OrcamentoData>(key: K, value: OrcamentoData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setItem(idx: number, field: keyof Item, value: string | number) {
    setData((d) => {
      const itens = [...d.itens];
      itens[idx] = { ...itens[idx], [field]: value };
      return { ...d, itens };
    });
  }

  function addItem() {
    setData((d) => ({ ...d, itens: [...d.itens, { ...emptyItem }] }));
  }

  function removeItem(idx: number) {
    setData((d) => ({ ...d, itens: d.itens.filter((_, i) => i !== idx) }));
  }

  function handleEmpresaChange(id: string) {
    const empresaId = id ? Number(id) : "";
    const empresa = empresas.find((e) => e.id === empresaId);
    setData((d) => ({
      ...d,
      empresa_id: empresaId,
      contato_id: "",
      natureza: empresa?.natureza || d.natureza,
      prazo_entrega: empresa?.prazo_padrao || d.prazo_entrega,
    }));
  }

  const subtotal = data.itens.reduce((acc, it) => acc + it.quantidade * it.valor_unitario, 0);
  const total = Math.max(0, subtotal - (data.desconto || 0));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!data.empresa_id) {
      setError("Selecione o cliente.");
      return;
    }
    if (data.itens.filter((i) => i.descricao.trim()).length === 0) {
      setError("Adicione ao menos um item com descrição.");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/orcamentos/${initial!.id}` : "/api/orcamentos";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao salvar orçamento");
        return;
      }
      const id = isEdit ? initial!.id : json.id;
      router.push(`/admin/orcamentos/${id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none focus:border-orange-500 text-sm w-full";
  const labelClass = "text-xs text-neutral-400 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-5xl">
      {error && (
        <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {isEdit && (
        <div className="text-sm text-neutral-400">
          Número do orçamento: <span className="text-orange-400 font-mono">{initial?.numero}</span>{" "}
          <span className="text-xs">(não muda ao editar)</span>
        </div>
      )}

      <section className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Cliente *</label>
          <select
            className={inputClass}
            value={data.empresa_id}
            onChange={(e) => handleEmpresaChange(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razao_social}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Contato (e-mail de envio)</label>
          <select
            className={inputClass}
            value={data.contato_id}
            onChange={(e) => setField("contato_id", e.target.value ? Number(e.target.value) : "")}
            disabled={!empresaSelecionada}
          >
            <option value="">Selecione...</option>
            {empresaSelecionada?.contatos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.email ? `— ${c.email}` : ""}
              </option>
            ))}
          </select>
          {empresaSelecionada && empresaSelecionada.contatos.length === 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Este cliente ainda não tem contatos cadastrados.
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Natureza</label>
          <input className={inputClass} value={data.natureza} onChange={(e) => setField("natureza", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Validade da proposta</label>
          <input className={inputClass} value={data.validade_proposta} onChange={(e) => setField("validade_proposta", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Condições de pagamento</label>
          <input className={inputClass} value={data.condicoes_pagamento} onChange={(e) => setField("condicoes_pagamento", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Garantia de serviço ou produto</label>
          <input className={inputClass} value={data.garantia_servico} onChange={(e) => setField("garantia_servico", e.target.value)} />
        </div>
        {isEdit && (
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={data.status} onChange={(e) => setField("status", e.target.value)}>
              <option value="RASCUNHO">Rascunho</option>
              <option value="ENVIADO">Enviado</option>
              <option value="APROVADO">Aprovado</option>
              <option value="REJEITADO">Rejeitado</option>
            </select>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-200">Itens do orçamento</h2>
          <button
            type="button"
            onClick={addItem}
            className="text-xs px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            + Adicionar item
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {data.itens.map((it, idx) => (
            <div key={it.id ?? `new-${idx}`} className="border border-neutral-800 rounded-lg p-3 relative">
              <div className="grid sm:grid-cols-6 gap-3">
                <div className="sm:col-span-3">
                  <label className={labelClass}>Descrição *</label>
                  <input className={inputClass} value={it.descricao} onChange={(e) => setItem(idx, "descricao", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Fabricante</label>
                  <input className={inputClass} value={it.fabricante} onChange={(e) => setItem(idx, "fabricante", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Cód. NCM</label>
                  <input className={inputClass} value={it.cod_ncm} onChange={(e) => setItem(idx, "cod_ncm", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Unidade</label>
                  <input className={inputClass} value={it.unidade} onChange={(e) => setItem(idx, "unidade", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Quantidade</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={it.quantidade}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setItem(idx, "quantidade", e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prazo de entrega</label>
                  <input className={inputClass} value={it.prazo_entrega} onChange={(e) => setItem(idx, "prazo_entrega", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Valor unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={it.valor_unitario}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setItem(idx, "valor_unitario", e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Valor total</label>
                  <div className={inputClass + " bg-neutral-900 text-neutral-300"}>
                    {currency(it.quantidade * it.valor_unitario)}
                  </div>
                </div>
              </div>
              {data.itens.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end gap-1 text-sm mt-2">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Subtotal:</span>
            <span>{currency(subtotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-neutral-400">Desconto (R$):</label>
            <input
              type="number"
              step="0.01"
              className="bg-neutral-800 border border-neutral-700 rounded-md px-2 py-1 w-32 text-right outline-none focus:border-orange-500"
              value={data.desconto}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setField("desconto", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2 text-base font-semibold text-orange-400">
            <span>Total:</span>
            <span>{currency(total)}</span>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Escopo do serviço</label>
          <textarea
            className={inputClass}
            rows={3}
            value={data.escopo_servico}
            onChange={(e) => setField("escopo_servico", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Observações</label>
          <textarea
            className={inputClass}
            rows={3}
            value={data.observacoes}
            onChange={(e) => setField("observacoes", e.target.value)}
          />
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-md bg-orange-600 hover:bg-orange-500 disabled:opacity-60 transition-colors text-sm font-medium"
        >
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar orçamento"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/orcamentos")}
          className="px-5 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
