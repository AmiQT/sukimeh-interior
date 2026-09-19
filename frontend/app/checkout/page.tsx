"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle, Download, Package } from "lucide-react";
import { useAppStore, CartItem } from "@/lib/store";

export default function CheckoutPage() {
  const { cart, clearCart } = useAppStore();
  const [receipt, setReceipt] = useState<{ id: string; items: CartItem[]; total: number } | null>(null);
  const items = receipt?.items ?? cart;
  const total = receipt?.total ?? cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finish = () => {
    setReceipt({ id: `DEMO-${Date.now()}`, items: cart.map((item) => ({ ...item })), total });
    clearCart();
  };
  const download = () => {
    const blob = new Blob([JSON.stringify({ ...receipt, currency: "MYR", demo: true }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt?.id.toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy text-white px-5 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/shop" aria-label="Kembali ke katalog" className="p-2 rounded-lg hover:bg-white/10"><ArrowLeft size={20} /></Link>
          <span className="font-display text-xl">Ruma Studio</span>
          <span className="ml-auto text-xs border border-white/30 px-3 py-1 rounded-full">Demo sahaja</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-12">
        {receipt ? <CheckCircle className="text-green-600 mb-4" size={40} /> : <Package className="text-accent mb-4" size={40} />}
        <h1 className="text-3xl text-navy mb-3">{receipt ? "Ringkasan demo disediakan" : "Semak pilihan perabot"}</h1>
        <p className="text-gray-600 mb-8">Katalog dan harga ini rekaan untuk demonstrasi. Tiada bayaran, pesanan sebenar, penghantaran atau emel akan dibuat.</p>
        {items.length ? <>
          <div className="bg-white border border-navy-100 rounded-2xl p-5 sm:p-7">
            {items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 border-b border-navy-50">
              <div><p className="font-semibold text-navy">{item.name}</p><p className="text-sm text-gray-500">Kuantiti {item.quantity}</p></div>
              <p className="shrink-0">RM {(item.price * item.quantity).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</p>
            </div>)}
            <div className="flex justify-between gap-4 pt-6 font-bold text-lg text-navy"><span>Jumlah demo</span><span>RM {total.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</span></div>
          </div>
          {receipt ? <button onClick={download} className="mt-6 w-full flex justify-center gap-2 bg-navy text-white p-4 rounded-xl font-semibold"><Download size={20} />Muat turun ringkasan JSON</button> : <button onClick={finish} className="mt-6 w-full bg-accent text-white p-4 rounded-xl font-semibold">Sediakan ringkasan demo</button>}
        </> : <p className="p-8 bg-white rounded-2xl border border-navy-100 text-center">Troli masih kosong. Tambah perabot daripada katalog dahulu.</p>}
        <Link href={receipt ? "/layout" : "/shop"} className="inline-block mt-6 text-navy underline underline-offset-4">{receipt ? "Kembali ke pelan" : "Kembali ke katalog"}</Link>
      </main>
    </div>
  );
}
