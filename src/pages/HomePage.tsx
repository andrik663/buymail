import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, TrendingUp, Mail, Zap, Shield, Search, MessageSquare, CreditCard, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const stats = [
    { label: 'Email Terjual', value: '12.543', icon: Mail },
    { label: 'Penjual Aktif', value: '387', icon: Users },
    { label: 'Kepuasan', value: '98%', icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: 'Ahmad Rizki',
      role: 'Digital Marketer',
      text: 'Beli email bulk dari EmailMarket, semua terverifikasi dan aktif. Deliverability tinggi untuk campaign.',
      rating: 5,
    },
    {
      name: 'Siti Nurhaliza',
      role: 'E-Commerce Owner',
      text: 'Sistem sangat mudah. Upload akun, terima pembayaran. Semua transaksi aman dan terpercaya.',
      rating: 5,
    },
    {
      name: 'Budi Santoso',
      role: 'Startup Founder',
      text: 'Custom domain email dengan harga terjangkau. Support responsif. Recommended untuk startup.',
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-blue-600 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-balance">
            Jual &amp; Beli Email Premium dengan Aman
          </h1>
          <p className="text-blue-100 mb-8 text-sm md:text-base max-w-xl mx-auto">
            Ribuan email Gmail, Outlook, Yahoo &amp; custom domain terverifikasi siap pakai.
          </p>

          {/* Inline search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center bg-white rounded-lg overflow-hidden shadow-md">
            <Search className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari provider, alamat email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 text-slate-900 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              Cari
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick filters */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {['Gmail', 'Outlook', 'Yahoo', 'Custom Domain'].map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${tag.toLowerCase()}`)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-xs font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center py-5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                  </div>
                  <span className="text-xs text-slate-500">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-bold text-center text-slate-900 mb-6">Cara Kerja</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { num: 1, title: 'Cari Email', desc: 'Filter by provider, umur, verifikasi & harga', icon: Search },
              { num: 2, title: 'Chat Penjual', desc: 'Tanya detail & verifikasi penjual sebelum beli', icon: MessageSquare },
              { num: 3, title: 'Bayar & Terima', desc: 'Transaksi aman, akses email langsung diterima', icon: CreditCard },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-900">{step.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-bold text-center text-slate-900 mb-6">Kenapa EmailMarket?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Shield, title: 'Escrow Aman', desc: 'Dana ditahan hingga akun diterima' },
              { icon: MessageSquare, title: 'Chat P2P', desc: 'Komunikasi langsung buyer-seller' },
              { icon: CheckCircle, title: 'Seller Terverif', desc: 'Semua penjual sudah diverifikasi' },
              { icon: Zap, title: 'Akses Instan', desc: 'Email langsung setelah bayar' },
              { icon: TrendingUp, title: 'Dashboard', desc: 'Report penjualan & transaksi' },
              { icon: Users, title: 'Support 24/7', desc: 'Tim siap membantu kapan saja' },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                  <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-bold text-center text-slate-900 mb-6">Kata Pengguna</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-blue-600 text-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">Siap Mulai?</h2>
          <p className="text-blue-100 text-sm mb-6">
            Bergabung dengan ribuan pembeli dan penjual di EmailMarket
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              Cari Email
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors border border-blue-400"
            >
              Daftar Gratis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
