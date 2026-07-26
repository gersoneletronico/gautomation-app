import Image from "next/image";
import Link from "next/link";

const servicos = [
  { texto: "Manutenção em inversores, soft-starters, drivers e eletrônica de potência", foto: "/institucional/inversores.png" },
  { texto: "Reparos em placas eletrônicas industriais (IHM, CLP, cartões de controle e etc.)", foto: "/institucional/cfw11.png" },
  { texto: "Retrofit de painéis e sistemas legados", foto: "/institucional/bancada2.png" },
  { texto: "Soluções em automação industrial e suporte técnico multimarcas, com diagnóstico por termografia", foto: "/institucional/termografia.png" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 relative z-10 bg-neutral-950/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="G Automation" width={48} height={32} className="h-10 w-auto" />
          <span className="font-semibold tracking-wide text-lg">G AUTOMATION</span>
        </div>
        <Link
          href="/admin"
          className="text-sm px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 transition-colors font-medium"
        >
          Área do Administrador
        </Link>
      </header>

      {/* Hero com foto real da bancada de manutenção */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 sm:py-32 overflow-hidden">
        <Image
          src="/institucional/bancada.png"
          alt="Bancada de manutenção eletrônica G Automation"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/80 to-neutral-950" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Image src="/logo.png" alt="G Automation" width={200} height={135} />
          <h1 className="text-3xl sm:text-5xl font-bold max-w-3xl">
            G AUTOMATION INDUSTRIAL LTDA
          </h1>
          <p className="max-w-2xl text-neutral-200 text-base sm:text-lg leading-relaxed">
            Atuamos com compromisso, qualidade e inovação no setor de eletrônica
            industrial, automação e manutenção de equipamentos de potência,
            atendendo grandes indústrias em todo o Nordeste. Ferramentas e
            técnicas de diagnóstico eficazes que otimizam tempo e recursos no
            reparo.
          </p>
          <a
            href="#contato"
            className="mt-2 px-6 py-3 rounded-md bg-orange-600 hover:bg-orange-500 transition-colors font-semibold"
          >
            Fale conosco
          </a>
        </div>
      </section>

      {/* Serviços com fotos reais do trabalho */}
      <section className="px-6 py-16 bg-neutral-900 border-t border-neutral-800">
        <h2 className="text-2xl font-bold text-center mb-10">Serviços</h2>
        <div className="grid gap-6 max-w-5xl mx-auto sm:grid-cols-2">
          {servicos.map((s) => (
            <div
              key={s.texto}
              className="flex items-center gap-4 bg-neutral-800/60 rounded-lg p-4 border border-neutral-800"
            >
              <div className="relative shrink-0 w-24 h-24 rounded-md overflow-hidden border border-neutral-700">
                <Image src={s.foto} alt="" fill className="object-cover" />
              </div>
              <span className="text-neutral-200 text-sm leading-relaxed">{s.texto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bancada / estrutura técnica */}
      <section className="px-6 py-16 bg-neutral-950 border-t border-neutral-800">
        <h2 className="text-2xl font-bold text-center mb-10">Nossa estrutura</h2>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-neutral-800">
            <Image src="/institucional/bancada.png" alt="Bancada de testes e diagnóstico" fill className="object-cover" />
          </div>
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-neutral-800">
            <Image src="/institucional/inversores.png" alt="Inversores de frequência em manutenção" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Clientes */}
      <section className="px-6 py-16 bg-neutral-900 border-t border-neutral-800">
        <h2 className="text-2xl font-bold text-center mb-10">Alguns clientes</h2>
        <div className="max-w-4xl mx-auto rounded-lg overflow-hidden border border-neutral-800 bg-white">
          <Image
            src="/institucional/clientes.png"
            alt="Logotipos de clientes atendidos pela G Automation"
            width={1482}
            height={518}
            className="w-full h-auto"
          />
        </div>
      </section>

      <section
        id="contato"
        className="px-6 py-16 bg-neutral-950 border-t border-neutral-800"
      >
        <h2 className="text-2xl font-bold text-center mb-10">Contato</h2>
        <div className="max-w-3xl mx-auto grid gap-6 sm:grid-cols-2 text-sm text-neutral-300">
          <div>
            <p className="font-semibold text-neutral-100 mb-1">Razão Social</p>
            <p>G AUTOMATION INDUSTRIAL LTDA</p>
            <p className="mt-3 font-semibold text-neutral-100 mb-1">CNPJ</p>
            <p>45.531.455/0001-71</p>
            <p className="mt-3 font-semibold text-neutral-100 mb-1">Endereço</p>
            <p>Rua das Acácias, 171 - Jardim Botânico</p>
            <p>Goianinha/RN - CEP 59173-000</p>
          </div>
          <div>
            <p className="font-semibold text-neutral-100 mb-1">Telefone</p>
            <p>(81) 99131-8362</p>
            <p className="mt-3 font-semibold text-neutral-100 mb-1">E-mail</p>
            <p>gautomation2016@gmail.com</p>
            <p className="mt-3 font-semibold text-neutral-100 mb-1">Instagram</p>
            <p>@G_AUTOMATION_4.0</p>
            <p className="mt-3 font-semibold text-neutral-100 mb-1">Responsável</p>
            <p>Gerson Felipe de Sousa</p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 border-t border-neutral-800 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} G Automation Industrial Ltda. Todos os direitos reservados.
      </footer>
    </div>
  );
}
