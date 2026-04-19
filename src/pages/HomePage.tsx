import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, TrendingUp, Mail, Zap, Shield, Search, MessageSquare, CreditCard } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Email Terjual', value: '2,543', icon: Mail },
    { label: 'Penjual Aktif', value: '187', icon: Users },
    { label: 'Kepuasan', value: '98%', icon: TrendingUp },
  ];

  const steps = [
    {
      num: 1,
      title: 'Cari Email yang Cocok',
      desc: 'Pilih dari ribuan email premium dengan berbagai provider dan umur akun',
      icon: Search,
    },
    {
      num: 2,
      title: 'Chat dengan Penjual',
      desc: 'Tanya informasi lebih detail dan verifikasi kredibilitas penjual sebelum membeli',
      icon: MessageSquare,
    },
    {
      num: 3,
      title: 'Bayar & Terima Akses',
      desc: 'Transaksi aman dengan berbagai metode pembayaran. Email langsung ke akun Anda',
      icon: CreditCard,
    },
  ];

  const testimonials = [
    {
      name: 'Ahmad Rizki',
      role: 'Digital Marketer',
      text: 'Beli email bulk dari EmailMarket, semua terverifikasi dan aktif. Deliverability tinggi untuk campaign. Puas!',
      rating: 5,
    },
    {
      name: 'Siti Nurhaliza',
      role: 'E-Commerce Owner',
      text: 'Sebagai penjual, sistem EmailMarket sangat mudah. Upload akun, terima pembayaran, lepas. Semua transaksi aman.',
      rating: 5,
    },
    {
      name: 'Budi Santoso',
      role: 'Startup Founder',
      text: 'Custom domain email dengan harga terjangkau. Support-nya responsif. Recommended untuk startup.',
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Jual &amp; Beli Email Premium dengan Aman
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Platform terpercaya untuk membeli email terverifikasi (Gmail, Outlook, Yahoo, Custom Domain) dan leads marketing yang sudah di-validasi.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/search')}
                  className="flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                  Cari Email Sekarang
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-bold transition-colors"
                >
                  Jadi Penjual
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Transaksi Aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Verified Sellers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Instan &amp; Cepat</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full h-64 bg-blue-500 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-24 h-24 text-white mx-auto mb-4 opacity-80" />
                  <p className="text-xl font-bold">Ribuan Email Siap Pakai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Dipercaya oleh Ribuan Pengguna
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-lg p-8 text-center shadow-sm border border-slate-200">
                  <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
                  <p className="text-slate-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Cara Kerja Email Market
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Proses yang sederhana dan aman untuk mendapatkan email premium yang Anda butuhkan
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-white rounded-lg p-8 border border-slate-200 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                    {step.num}
                  </div>
                  <Icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Fitur Unggulan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Shield, title: 'Transaksi Aman', desc: 'Semua transaksi dilindungi sistem escrow' },
              { icon: MessageSquare, title: 'Chat P2P', desc: 'Komunikasi langsung dengan penjual sebelum beli' },
              { icon: CheckCircle, title: 'Verified Seller', desc: 'Semua penjual terverifikasi dan terukur ratingnya' },
              { icon: Zap, title: 'Instan', desc: 'Akses email langsung setelah pembayaran sukses' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Dashboard dengan report penjualan & transaksi' },
              { icon: Users, title: 'Support 24/7', desc: 'Tim support siap membantu kapan saja' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex gap-4 p-6 bg-white rounded-lg border border-slate-200">
                  <Icon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
                    <p className="text-slate-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Apa Kata Pengguna
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">&#9733;</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Mulai?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Bergabunglah dengan ribuan pembeli dan penjual yang sudah mempercayai EmailMarket
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Daftar Gratis Sekarang
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
