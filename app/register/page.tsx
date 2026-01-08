"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Akun jadi! Login gih.");
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Join Us</h1>
          <p className="text-slate-500 mt-2 text-sm">Buat akun baru buat mulai magang</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Daftar Akun"}
            {!loading && <CheckCircle className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Udah punya akun?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}