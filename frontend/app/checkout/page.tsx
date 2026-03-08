"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  Package,
  Sparkles,
  Truck,
  Phone,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface FormData {
  nama: string;
  email: string;
  telefon: string;
  alamat: string;
  bandar: string;
  poskod: string;
  negeri: string;
  catatan: string;
}

const NEGERI_LIST = [
  "Kuala Lumpur",
  "Selangor",
  "Pulau Pinang",
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Terengganu",
  "Putrajaya",
  "Labuan",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useAppStore();
  const [form, setForm] = useState<FormData>({
    nama: "",
    email: "",
    telefon: "",
    alamat: "",
    bandar: "",
    poskod: "",
    negeri: "",
    catatan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const total = getCartTotal();
  const originalTotal = cart.reduce(
    (sum, item) => sum + item.original_price * item.quantity,
    0
  );
  const savings = originalTotal - total;
  const shipping = 0; // Free delivery for Chin Hin
  const grandTotal = total + shipping;

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.nama.trim()) e.nama = "Nama diperlukan";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email tidak sah";
    if (!form.telefon.trim() || !/^[0-9+\-\s]{8,15}$/.test(form.telefon))
      e.telefon = "No telefon tidak sah";
    if (!form.alamat.trim()) e.alamat = "Alamat diperlukan";
    if (!form.bandar.trim()) e.bandar = "Bandar diperlukan";
    if (!form.poskod.trim() || !/^\d{5}$/.test(form.poskod))
      e.poskod = "Poskod mesti 5 digit";
    if (!form.negeri) e.negeri = "Negeri diperlukan";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate order processing
    await new Promise((r) => setTimeout(r, 1800));
    const orderId = `CHG-${Date.now().toString().slice(-6)}`;
    setOrderSuccess(orderId);
    clearCart();
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // --- Success state ---
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-navy text-white py-3 px-6 shadow-card">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-display">Sukimeh AI Interior Designer</h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-display text-navy mb-2">Pesanan Berjaya!</h2>
            <p className="text-gray-500 mb-4">
              Terima kasih, <strong>{form.nama}</strong>! Pesanan anda sedang diproses.
            </p>
            <div className="bg-white rounded-card border border-navy-100 shadow-card p-5 mb-6">
              <p className="text-xs text-gray-400 mb-1">No. Pesanan</p>
              <p className="text-2xl font-bold text-accent tracking-wider">{orderSuccess}</p>
              <div className="mt-4 pt-4 border-t border-navy-50 space-y-1 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah Bayaran</span>
                  <span className="font-bold text-navy-500">RM {grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Penghantaran</span>
                  <span className="text-green-600 font-medium">PERCUMA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Anggaran Tiba</span>
                  <span className="text-navy-500">5–7 hari bekerja</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center mb-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Chin Hin Customer Care: 1800-88-2626</span>
            </div>
            <p className="text-xs text-gray-400 mb-8">
              Konfirmasi pesanan dihantar ke <strong>{form.email}</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-navy hover:bg-navy-600 text-white font-semibold rounded-btn transition-colors"
              >
                Reka Bilik Lain
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="px-6 py-3 border-2 border-navy text-navy hover:bg-navy-50 font-semibold rounded-btn transition-colors"
              >
                Kembali ke Kedai
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Redirect if cart empty ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-navy-200 mx-auto mb-4" />
          <p className="text-navy-400 font-medium mb-4">Troli kosong</p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-accent text-white px-6 py-3 rounded-btn font-semibold"
          >
            Kembali ke Kedai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-3 px-6 shadow-card sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/shop")}
            className="p-2 hover:bg-navy-600 rounded-btn transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-accent" />
            <h1 className="text-base font-display">Checkout</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT — Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Maklumat peribadi */}
              <div className="bg-white rounded-card border border-navy-100 shadow-sm p-6">
                <h2 className="font-display text-lg text-navy-500 mb-4">
                  Maklumat Peribadi
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                      Nama Penuh <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Contoh: Ahmad Bin Abu"
                      className={`w-full border rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
                        errors.nama ? "border-red-400 bg-red-50" : "border-navy-200"
                      }`}
                    />
                    {errors.nama && (
                      <p className="text-xs text-red-500 mt-1">{errors.nama}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                      No. Telefon <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="telefon"
                      value={form.telefon}
                      onChange={handleChange}
                      placeholder="01X-XXXXXXX"
                      className={`w-full border rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
                        errors.telefon ? "border-red-400 bg-red-50" : "border-navy-200"
                      }`}
                    />
                    {errors.telefon && (
                      <p className="text-xs text-red-500 mt-1">{errors.telefon}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                      Emel <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                      className={`w-full border rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
                        errors.email ? "border-red-400 bg-red-50" : "border-navy-200"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alamat penghantaran */}
              <div className="bg-white rounded-card border border-navy-100 shadow-sm p-6">
                <h2 className="font-display text-lg text-navy-500 mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-accent" />
                  Alamat Penghantaran
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                      Alamat <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      placeholder="No. Rumah, Nama Jalan, Taman..."
                      className={`w-full border rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
                        errors.alamat ? "border-red-400 bg-red-50" : "border-navy-200"
                      }`}
                    />
                    {errors.alamat && (
                      <p className="text-xs text-red-500 mt-1">{errors.alamat}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                        Bandar <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="bandar"
                        value={form.bandar}
                        onChange={handleChange}
                        placeholder="Petaling Jaya"
                        className={`w-full border rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
                          errors.bandar ? "border-red-400 bg-red-50" : "border-navy-200"
                        }`}
                      />
                      {errors.bandar && (
                        <p className="text-xs text-red-500 mt-1">{errors.bandar}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                        Poskod <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="poskod"
                        value={form.poskod}
                        onChange={handleChange}
                        placeholder="47810"
                        maxLength={5}
                        className={`w-full border rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
                          errors.poskod ? "border-red-400 bg-red-50" : "border-navy-200"
                        }`}
                      />
                      {errors.poskod && (
                        <p className="text-xs text-red-500 mt-1">{errors.poskod}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                      Negeri <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="negeri"
                      value={form.negeri}
                      onChange={handleChange}
                      className={`w-full border rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all bg-white ${
                        errors.negeri ? "border-red-400 bg-red-50" : "border-navy-200"
                      }`}
                    >
                      <option value="">-- Pilih Negeri --</option>
                      {NEGERI_LIST.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    {errors.negeri && (
                      <p className="text-xs text-red-500 mt-1">{errors.negeri}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-400 mb-1.5">
                      Catatan (pilihan)
                    </label>
                    <textarea
                      name="catatan"
                      value={form.catatan}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Contoh: Hantar waktu pagi, cincin loceng 2x..."
                      className="w-full border border-navy-200 rounded-btn px-3 py-2.5 text-sm text-navy-500 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Kaedah Bayaran */}
              <div className="bg-white rounded-card border border-navy-100 shadow-sm p-6">
                <h2 className="font-display text-lg text-navy-500 mb-4">
                  Kaedah Bayaran
                </h2>
                <div className="space-y-2">
                  {[
                    { id: "fpx", label: "FPX Online Banking", icon: "🏦" },
                    { id: "card", label: "Kad Kredit / Debit", icon: "💳" },
                    { id: "ewallet", label: "e-Wallet (Touch 'n Go, Boost)", icon: "📱" },
                    { id: "installment", label: "Ansuran 0% (12 bulan)", icon: "📆" },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center gap-3 p-3 border border-navy-200 rounded-btn cursor-pointer hover:bg-navy-50 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-50"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        defaultChecked={method.id === "fpx"}
                        className="accent-accent"
                      />
                      <span className="text-lg">{method.icon}</span>
                      <span className="text-sm font-medium text-navy-500">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Order summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-card border border-navy-100 shadow-sm p-5 sticky top-24">
                <h2 className="font-display text-lg text-navy-500 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-accent" />
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 text-sm">
                      <div className="w-8 h-8 rounded-md bg-navy-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="w-3.5 h-3.5 text-navy-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-navy-500 font-medium leading-tight line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-xs">x{item.quantity}</p>
                      </div>
                      <span className="text-navy-500 font-semibold flex-shrink-0">
                        RM {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-navy-50 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>RM {originalTotal.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Jimat bundle</span>
                      <span>- RM {savings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-600">
                    <span>Penghantaran</span>
                    <span>PERCUMA</span>
                  </div>
                  <div className="flex justify-between font-bold text-navy-500 text-base pt-2 border-t border-navy-100">
                    <span>Jumlah</span>
                    <span>RM {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-accent hover:bg-accent-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-btn transition-colors flex items-center justify-center gap-2 shadow-card"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Sahkan Pesanan
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  🔒 Transaksi selamat & disulitkan
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
