"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/orcamentos", label: "Orçamentos" },
  { href: "/admin/senha", label: "Trocar senha" },
];

export default function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinkClass = (href: string) => {
    const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
    return `px-3 py-2.5 rounded-md transition-colors ${
      active ? "bg-orange-600 text-white" : "hover:bg-neutral-800"
    }`;
  };

  const NavLinks = (
    <>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={navLinkClass(l.href)} onClick={() => setOpen(false)}>
          {l.label}
        </Link>
      ))}
      <Link
        href="/"
        className="px-3 py-2.5 rounded-md hover:bg-neutral-800 transition-colors text-neutral-400"
        onClick={() => setOpen(false)}
      >
        ← Ver site
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-neutral-950 text-neutral-100">
      {/* Barra superior mobile */}
      <header className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800 sticky top-0 z-30 bg-neutral-950">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="G Automation" width={70} height={47} className="h-12 w-auto" />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          className="p-2 rounded-md hover:bg-neutral-800"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-20 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <nav className="relative z-30 w-64 max-w-[80%] bg-neutral-900 border-r border-neutral-800 h-full p-4 flex flex-col gap-1 text-sm">
            {NavLinks}
            <div className="mt-auto pt-4 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500">{username}</span>
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden sm:flex w-60 shrink-0 border-r border-neutral-800 flex-col">
        <div className="flex items-center justify-center px-5 py-4 border-b border-neutral-800">
          <Image src="/logo.png" alt="G Automation" width={110} height={73} className="h-16 w-auto" />
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-3 text-sm">{NavLinks}</nav>
        <div className="p-3 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500">{username}</span>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-x-auto min-w-0">{children}</main>
    </div>
  );
}
