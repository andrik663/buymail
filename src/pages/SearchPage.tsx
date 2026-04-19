import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronRight, Star, Shield, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

type Provider = 'gmail' | 'outlook' | 'yahoo' | 'custom';

interface FilterState {
  providers: Provider[];
  priceRange: [number, number];
  minRating: number;
  minAge: string;
  verifications: {
    phone: boolean;
    recovery: boolean;
    twoFa: boolean;
  };
  search: string;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { emails, addToCart, isInWishlist, addToWishlist, removeFromWishlist } = useApp();
  const { addToast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    providers: [],
    priceRange: [0, 500000],
    minRating: 0,
    minAge: '',
    verifications: { phone: false, recovery: false, twoFa: false },
    search: '',
  });

  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      if (filters.search && !email.address.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.providers.length > 0 && !filters.providers.includes(email.provider)) return false;
      if (email.price < filters.priceRange[0] || email.price > filters.priceRange[1]) return false;
      if (email.sellerRating < filters.minRating) return false;

      const emailAge = parseInt(email.age.split(' ')[0]);
      if (filters.minAge === '1-3' && (emailAge < 1 || emailAge > 3)) return false;
      if (filters.minAge === '3-5' && (emailAge < 3 || emailAge > 5)) return false;
      if (filters.minAge === '5+' && emailAge < 5) return false;

      if (filters.verifications.phone && !email.verifications.phone) return false;
      if (filters.verifications.recovery && !email.verifications.recovery) return false;
      if (filters.verifications.twoFa && !email.verifications.twoFa) return false;

      return true;
    });
  }, [emails, filters]);

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleProviderToggle = (provider: Provider) => {
    setFilters(prev => ({
      ...prev,
      providers: prev.providers.includes(provider)
        ? prev.providers.filter(p => p !== provider)
        : [...prev.providers, provider],
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      providers: [],
      priceRange: [0, 500000],
      minRating: 0,
      minAge: '',
      verifications: { phone: false, recovery: false, twoFa: false },
      search: '',
    });
    setCurrentPage(1);
    addToast('Filter direset', 'info');
  };

  const handleAddToCart = (emailId: string, emailAddress: string) => {
    addToCart(emailId);
    addToast(`${emailAddress} ditambahkan ke keranjang`, 'success');
  };

  const toggleWishlist = (emailId: string, emailAddress: string) => {
    if (isInWishlist(emailId)) {
      removeFromWishlist(emailId);
      addToast(`${emailAddress} dihapus dari wishlist`, 'info');
    } else {
      addToWishlist(emailId);
      addToast(`${emailAddress} ditambahkan ke wishlist`, 'success');
    }
  };

  const toggleDescription = (emailId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Provider Filter */}
      <div className="pb-6 border-b border-slate-200">
        <label className="block text-sm font-semibold text-slate-900 mb-3">Provider</label>
        <div className="space-y-2">
          {(['gmail', 'outlook', 'yahoo', 'custom'] as Provider[]).map(provider => (
            <label key={provider} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.providers.includes(provider)}
                onChange={() => handleProviderToggle(provider)}
                className="w-4 h-4 border-slate-300 rounded cursor-pointer"
              />
              <span className="text-sm text-slate-700 capitalize">{provider}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pb-6 border-b border-slate-200">
        <label className="block text-sm font-semibold text-slate-900 mb-3">Harga</label>
        <input
          type="range"
          min="0"
          max="500000"
          value={filters.priceRange[1]}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            priceRange: [prev.priceRange[0], parseInt(e.target.value)],
          }))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-2">
          <span>Rp0</span>
          <span>Rp {filters.priceRange[1].toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="pb-6 border-b border-slate-200">
        <label className="block text-sm font-semibold text-slate-900 mb-3">Rating Penjual Min</label>
        <select
          value={filters.minRating}
          onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="0">Semua Rating</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </select>
      </div>

      {/* Age Filter */}
      <div className="pb-6 border-b border-slate-200">
        <label className="block text-sm font-semibold text-slate-900 mb-3">Umur Akun</label>
        <select
          value={filters.minAge}
          onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Umur</option>
          <option value="1-3">1-3 Tahun</option>
          <option value="3-5">3-5 Tahun</option>
          <option value="5+">5+ Tahun</option>
        </select>
      </div>

      {/* Verification Filters */}
      <div className="pb-6 border-b border-slate-200">
        <label className="block text-sm font-semibold text-slate-900 mb-3">Verifikasi</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifications.phone}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                verifications: { ...prev.verifications, phone: e.target.checked },
              }))}
              className="w-4 h-4 border-slate-300 rounded cursor-pointer"
            />
            <span className="text-sm text-slate-700">HP Terverifikasi</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifications.recovery}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                verifications: { ...prev.verifications, recovery: e.target.checked },
              }))}
              className="w-4 h-4 border-slate-300 rounded cursor-pointer"
            />
            <span className="text-sm text-slate-700">Recovery Email Aktif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifications.twoFa}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                verifications: { ...prev.verifications, twoFa: e.target.checked },
              }))}
              className="w-4 h-4 border-slate-300 rounded cursor-pointer"
            />
            <span className="text-sm text-slate-700">2FA Aktif</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleResetFilters}
        className="w-full px-4 py-2.5 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors"
      >
        Reset Filter
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari alamat email..."
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filter - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow border border-slate-200 p-6 sticky top-24">
                <h3 className="font-bold text-slate-900 mb-4">Filter</h3>
                <FilterPanel />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Button */}
              <div className="md:hidden mb-4 flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <span className="text-sm text-slate-600">{filteredEmails.length} hasil</span>
              </div>

              {/* Mobile Filter Panel */}
              {mobileFilterOpen && (
                <div className="md:hidden bg-white rounded-lg shadow border border-slate-200 p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900">Filter</h3>
                    <button onClick={() => setMobileFilterOpen(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterPanel />
                </div>
              )}

              {/* Results Counter */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{filteredEmails.length} Email Ditemukan</h2>
                  <p className="text-sm text-slate-600">Pilih email yang sesuai kebutuhan Anda</p>
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="12">12 per halaman</option>
                  <option value="24">24 per halaman</option>
                  <option value="48">48 per halaman</option>
                </select>
              </div>

              {/* Email Grid */}
              {paginatedEmails.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {paginatedEmails.map(email => (
                    <div key={email.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Card Header */}
                      <div className="p-4 border-b border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 mb-1">{email.address}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {email.provider.toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {email.age}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleWishlist(email.id, email.address)}
                            className="text-xl leading-none"
                            aria-label={isInWishlist(email.id) ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                          >
                            {isInWishlist(email.id) ? '❤️' : '🤍'}
                          </button>
                        </div>
                      </div>

                      {/* Verifications */}
                      <div className="px-4 pt-4 flex flex-wrap gap-2">
                        {email.verifications.phone && (
                          <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            <Shield className="w-3 h-3" />
                            HP Terverif
                          </div>
                        )}
                        {email.verifications.recovery && (
                          <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            <Shield className="w-3 h-3" />
                            Recovery
                          </div>
                        )}
                        {email.verifications.twoFa && (
                          <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            <Shield className="w-3 h-3" />
                            2FA
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="px-4 py-3">
                        <p className={`text-sm text-slate-600 ${expandedDescriptions.has(email.id) ? '' : 'line-clamp-2'}`}>
                          {email.description}
                        </p>
                        {email.description.length > 80 && (
                          <button
                            onClick={() => toggleDescription(email.id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
                          >
                            {expandedDescriptions.has(email.id) ? 'Sembunyikan' : 'Lihat selengkapnya'}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Seller Info */}
                      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-600">Penjual</p>
                            <p className="text-sm font-semibold text-slate-900">{email.sellerName}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold text-slate-900">{email.sellerRating.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-slate-600">{email.sellerReviews} ulasan</p>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="px-4 py-4 bg-white border-t border-slate-100">
                        <div className="mb-4">
                          <p className="text-xs text-slate-600 mb-1">Harga</p>
                          <p className="text-2xl font-bold text-blue-600">
                            Rp {email.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">Garansi: {email.warranty}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/email/${email.id}`)}
                            className="flex-1 px-3 py-2 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleAddToCart(email.id, email.address)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Beli
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Tidak ada hasil</h3>
                  <p className="text-slate-600 mb-4">Coba ubah filter atau kata kunci pencarian</p>
                  <button onClick={handleResetFilters} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                    Reset Filter
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
                  >
                    Next
                  </button>
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
