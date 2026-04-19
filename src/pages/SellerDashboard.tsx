import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, BarChart3, DollarSign, Star, Settings, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

type TabName = 'listings' | 'add' | 'sales' | 'reviews' | 'payout' | 'settings';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user, emails, addEmail, logout } = useApp();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabName>('listings');
  const [newEmail, setNewEmail] = useState({
    address: '',
    provider: 'gmail' as 'gmail' | 'outlook' | 'yahoo' | 'custom',
    age: '1',
    price: '',
    warranty: '7',
    description: '',
  });
  const [listingStatus, setListingStatus] = useState<Record<string, 'active' | 'inactive'>>({});

  const menuItems: { id: TabName; label: string }[] = [
    { id: 'listings', label: 'Kelola Listing' },
    { id: 'add', label: 'Tambah Email' },
    { id: 'sales', label: 'Laporan Penjualan' },
    { id: 'reviews', label: 'Rating & Ulasan' },
    { id: 'payout', label: 'Penarikan Saldo' },
    { id: 'settings', label: 'Pengaturan' },
  ];

  const myListings = emails.slice(0, 3);

  const handleToggleListing = (emailId: string) => {
    const newStatus = (listingStatus[emailId] || 'active') === 'active' ? 'inactive' : 'active';
    setListingStatus(prev => ({ ...prev, [emailId]: newStatus }));
    addToast(`Listing ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
  };

  const handleAddEmail = () => {
    if (!newEmail.address || !newEmail.price) {
      addToast('Email dan harga harus diisi', 'error');
      return;
    }

    const emailData = {
      id: Date.now().toString(),
      address: newEmail.address,
      provider: newEmail.provider,
      age: `${newEmail.age} tahun`,
      price: parseInt(newEmail.price),
      description: newEmail.description,
      verifications: { phone: true, recovery: true, twoFa: false },
      sellerId: user?.id || 'seller1',
      sellerName: user?.name || 'Seller',
      sellerRating: 4.8,
      sellerReviews: 127,
      status: 'active' as const,
      warranty: `${newEmail.warranty} hari`,
      imageCount: 0,
    };

    addEmail(emailData);
    addToast('Email berhasil ditambahkan!', 'success');
    setNewEmail({ address: '', provider: 'gmail', age: '1', price: '', warranty: '7', description: '' });
    setActiveTab('listings');
  };

  const handleLogout = () => {
    logout();
    addToast('Anda telah logout', 'info');
    navigate('/');
  };

  const sales = [
    { id: 1, buyer: 'Ahmad R***', email: 'premium***@gmail.com', price: 150000, date: '10 Des', status: 'Lunas' },
    { id: 2, buyer: 'Siti N***', email: 'business***@outlook.com', price: 120000, date: '8 Des', status: 'Lunas' },
  ];

  const reviews = [
    { id: 1, buyer: 'Ahmad Rizki', rating: 5, text: 'Email berkualitas, sangat puas dengan transaksinya', date: '10 Des 2024' },
    { id: 2, buyer: 'Siti Nurhaliza', rating: 5, text: 'Penjual sangat responsif, akun berfungsi dengan baik', date: '8 Des 2024' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Penjual</h1>
            <p className="text-slate-600 mt-2">Kelola toko, email, dan penjualan Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow border border-slate-200 p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{user?.name || 'Seller'}</p>
                    <p className="text-xs text-slate-600">Terverifikasi</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-green-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <button
                  onClick={handleLogout}
                  className="w-full mt-6 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {/* Kelola Listing */}
              {activeTab === 'listings' && (
                <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Kelola Listing
                  </h2>

                  {myListings.length > 0 ? (
                    <div className="space-y-4">
                      {myListings.map(email => (
                        <div key={email.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 mb-2">{email.address}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                              <p>Provider: <span className="font-medium">{email.provider.toUpperCase()}</span></p>
                              <p>Harga: <span className="font-medium text-blue-600">Rp {email.price.toLocaleString('id-ID')}</span></p>
                              <p>Umur: <span className="font-medium">{email.age}</span></p>
                              <p>Terjual: <span className="font-medium">15x</span></p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                (listingStatus[email.id] || 'active') === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {(listingStatus[email.id] || 'active') === 'active' ? 'Aktif' : 'Nonaktif'}
                              </span>
                              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                Garansi: {email.warranty}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleToggleListing(email.id)}
                              className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Toggle status"
                            >
                              {(listingStatus[email.id] || 'active') === 'active'
                                ? <ToggleRight className="w-5 h-5 text-green-600" />
                                : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-600 py-12">Anda belum memiliki listing</p>
                  )}
                </div>
              )}

              {/* Tambah Email */}
              {activeTab === 'add' && (
                <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    Tambah Email Baru
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Alamat Email</label>
                      <input
                        type="email"
                        value={newEmail.address}
                        onChange={(e) => setNewEmail(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="example@gmail.com"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Provider</label>
                      <select
                        value={newEmail.provider}
                        onChange={(e) => setNewEmail(prev => ({ ...prev, provider: e.target.value as 'gmail' | 'outlook' | 'yahoo' | 'custom' }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="gmail">Gmail</option>
                        <option value="outlook">Outlook</option>
                        <option value="yahoo">Yahoo</option>
                        <option value="custom">Custom Domain</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Umur Akun (Tahun)</label>
                        <input
                          type="number"
                          value={newEmail.age}
                          onChange={(e) => setNewEmail(prev => ({ ...prev, age: e.target.value }))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Harga (Rp)</label>
                        <input
                          type="number"
                          value={newEmail.price}
                          onChange={(e) => setNewEmail(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="150000"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Garansi</label>
                      <select
                        value={newEmail.warranty}
                        onChange={(e) => setNewEmail(prev => ({ ...prev, warranty: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="3">3 Hari</option>
                        <option value="7">7 Hari</option>
                        <option value="14">14 Hari</option>
                        <option value="30">30 Hari</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Deskripsi</label>
                      <textarea
                        value={newEmail.description}
                        onChange={(e) => setNewEmail(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Jelaskan detail akun ini..."
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddEmail}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Terbitkan Sekarang
                      </button>
                      <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                        Simpan Sebagai Draft
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Laporan Penjualan */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                      <p className="text-slate-600 text-sm mb-2 flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Total Terjual</p>
                      <p className="text-3xl font-bold text-slate-900">45</p>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                      <p className="text-slate-600 text-sm mb-2">Pendapatan Kotor</p>
                      <p className="text-3xl font-bold text-green-600">Rp 5.4M</p>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                      <p className="text-slate-600 text-sm mb-2">Pendapatan Bersih</p>
                      <p className="text-3xl font-bold text-slate-900">Rp 5.1M</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Penjualan Terbaru</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900">Pembeli</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900">Harga</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900">Tanggal</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map(sale => (
                            <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-700">{sale.buyer}</td>
                              <td className="py-3 px-4 font-bold text-green-600">Rp {sale.price.toLocaleString('id-ID')}</td>
                              <td className="py-3 px-4 text-slate-600">{sale.date}</td>
                              <td className="py-3 px-4">
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                  {sale.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating & Ulasan */}
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Rating &amp; Ulasan
                  </h2>

                  <div className="mb-8 pb-8 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-5xl font-bold text-slate-900">4.8</p>
                        <div className="flex gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-yellow-400">&#9733;</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-slate-600">
                        <p>Berdasarkan 27 ulasan</p>
                        <p className="text-sm">Respons positif: 100%</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{review.buyer}</p>
                            <div className="flex gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <span key={i} className="text-yellow-400 text-sm">&#9733;</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">{review.date}</p>
                        </div>
                        <p className="text-slate-700 mb-3">{review.text}</p>
                        <button className="text-sm text-blue-600 font-medium hover:underline">
                          Balas Ulasan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Penarikan Saldo */}
              {activeTab === 'payout' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg shadow p-8">
                    <p className="text-green-100 mb-2 flex items-center gap-1"><DollarSign className="w-4 h-4" /> Saldo Tersedia</p>
                    <h3 className="text-4xl font-bold mb-6">Rp 5,127,500</h3>
                    <button className="px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                      Tarik Saldo
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Rekening Bank</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Nama Bank</label>
                        <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option>BCA</option>
                          <option>BNI</option>
                          <option>BRI</option>
                          <option>Mandiri</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Nomor Rekening</label>
                        <input
                          type="text"
                          placeholder="0123456789"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button
                        onClick={() => addToast('Rekening tersimpan', 'success')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Simpan Rekening
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pengaturan */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    Pengaturan Toko
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Nama Toko</label>
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Deskripsi Toko</label>
                      <textarea
                        placeholder="Ceritakan tentang toko Anda..."
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-6 border-t border-slate-200">
                      <button
                        onClick={() => addToast('Pengaturan toko disimpan', 'success')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
