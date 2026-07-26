import OrcamentoForm from "../OrcamentoForm";

export default function NovoOrcamentoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Novo orçamento</h1>
      <OrcamentoForm />
    </div>
  );
}
