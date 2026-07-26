import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100">
      <aside className="w-60 shrink-0 border-r border-neutral-800 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-800">
          <Image src="/logo.png" alt="G Automation" width={32} height={22} className="h-7 w-auto" />
          <span className="font-semibold text-sm">G AUTOMATION</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-3 text-sm">
          <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/clientes" className="px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">
            Clientes
          </Link>
          <Link href="/admin/orcamentos" className="px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">
            Orçamentos
          </Link>
          <Link href="/admin/senha" className="px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">
            Trocar senha
          </Link>
          <Link href="/" className="px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors text-neutral-400">
            ← Ver site
          </Link>
        </nav>
        <div className="p-3 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500">{session.username as string}</span>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
