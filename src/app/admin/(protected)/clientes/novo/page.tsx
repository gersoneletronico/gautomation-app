import ClienteForm from "../ClienteForm";

export default function NovoClientePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Novo cliente</h1>
      <ClienteForm />
    </div>
  );
}
