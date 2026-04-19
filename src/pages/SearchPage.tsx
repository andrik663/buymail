import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, Star, Shield, Phone, RefreshCw, Lock, ShoppingCart, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

type Provider = 'gmail' | 'outlook' | 'yahoo' | 'custom';
type SortKey = 'price_asc' | 'price_desc' | 'rating_desc' | 'age_desc';

interface FilterState {
  providers: Provider[];
  priceMax: number;
  minRating: number;
  minAge: string;
  verifications: {
    phone: boolean;
    recovery: boolean;
    twoFa: boolean;
  };
  search: string;
}

const PROVIDER_COLORS: Record<Provider, string> = {
  gmail: 'bg-red-50 text-red-700 border-red-200',
  outlook: 'bg-blue-50 text-blue-700 border-blue-200',
  yahoo: 'bg-purple-50 text-purple-700 border-purple-200',
  custom: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const ITEMS_PER_PAGE = 50;

export default function SearchPage() {
  const navigate = useNavigate();
  const { emails, addToCart, isInWishlist, addToWishlist, removeFromWishlist } = useApp();
  const { addToast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    providers: [],
    priceMax: 500000,
    minRating: 0,
    minAge: '',
    verifications: { phone: false, recovery: false, twoFa: false },
    search: '',
  });

  const [sort, setSort] = useState<SortKey>('price_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const filteredEmails = useMemo(() => {
    let result = emails.filter(email => {
      if (filters.search && !email.address.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.providers.length > 0 && !filters.providers.includes(email.provider)) return false;
      if (email.price > filters.priceMax) return false;
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

    result.sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'rating_desc') return b.sellerRating - a.sellerRating;
      if (sort === 'age_desc') return parseInt(b.age) - parseInt(a.age);
      return 0;
    });

    return result;
  }, [emails, filters, sort]);

  const totalPages = Math.ceil(filteredEmails.length / ITEMS_PER_PAGE);
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFilterCount = [
    filters.providers.length > 0,
    filters.priceMax < 500000,
    filters.minRating > 0,
    filters.minAge !== '',
    filters.verifications.phone,
    filters.verifications.recovery,
    filters.verifications.twoFa,
  ].filter(Boolean).length;

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
      priceMax: 500000,
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
      addToast(`Dihapus dari wishlist`, 'info');
    } else {
      addToWishlist(emailId);
      addToast(`${emailAddress} disimpan`, 'success');
    }
  };

  const SectionHeader = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex items-center justify-between w-full py-2 text-left"
    >
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      {collapsedSections.has(id)
        ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
    </button>
  );

  const FilterPanel = () => (
    <div className="space-y-1">
      {/* Provider */}
      <div className="border-b border-slate-100 pb-3 mb-1">
        <SectionHeader id="provider" label="Provider" />
        {!collapsedSections.has('provider') && (
          <div className="space-y-1 mt-1">
            {(['gmail', 'outlook', 'yahoo', 'custom'] as Provider[]).map(provider => (
              <label key={provider} className="flex items-center gap-2 cursor-pointer py-0.5 group">
                <input
                  type="checkbox"
                  checked={filters.providers.includes(provider)}
                  onChange={() => handleProviderToggle(provider)}
                  className="w-3.5 h-3.5 border-slate-300 rounded cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-slate-700 capitalize group-hover:text-slate-900">{provider}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-slate-100 pb-3 mb-1">
        <SectionHeader id="price" label="Maks. Harga" />
        {!collapsedSections.has('price') && (
          <div className="mt-1">
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={filters.priceMax}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, priceMax: parseInt(e.target.value) }));
                setCurrentPage(1);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Rp 0</span>
              <span className="font-medium text-slate-700">Rp {filters.priceMax.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-b border-slate-100 pb-3 mb-1">
        <SectionHeader id="rating" label="Rating Penjual" />
        {!collapsedSections.has('rating') && (
          <div className="space-y-1 mt-1">
            {[0, 3, 4, 5].map(rating => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer py-0.5 group">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating}
                  onChange={() => { setFilters(prev => ({ ...prev, minRating: rating })); setCurrentPage(1); }}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <span className="text-xs text-slate-700 group-hover:text-slate-900">
                  {rating === 0 ? 'Semua' : `${rating}+`}
                  {rating > 0 && <span className="text-yellow-500 ml-1">{'★'.repeat(rating)}</span>}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Age */}
      <div className="border-b border-slate-100 pb-3 mb-1">
        <SectionHeader id="age" label="Umur Akun" />
        {!collapsedSections.has('age') && (
          <div className="space-y-1 mt-1">
            {[['', 'Semua'], ['1-3', '1–3 Tahun'], ['3-5', '3–5 Tahun'], ['5+', '5+ Tahun']].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer py-0.5 group">
                <input
                  type="radio"
                  name="age"
                  checked={filters.minAge === val}
                  onChange={() => { setFilters(prev => ({ ...prev, minAge: val })); setCurrentPage(1); }}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <span className="text-xs text-slate-700 group-hover:text-slate-900">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Verifications */}
      <div className="pb-2">
        <SectionHeader id="verif" label="Verifikasi" />
        {!collapsedSections.has('verif') && (
          <div className="space-y-1 mt-1">
            {[
              { key: 'phone' as const, label: 'HP Terverifikasi', Icon: Phone },
              { key: 'recovery' as const, label: 'Recovery Aktif', Icon: RefreshCw },
              { key: 'twoFa' as const, label: '2FA Aktif', Icon: Lock },
            ].map(({ key, label, Icon }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer py-0.5 group">
                <input
                  type="checkbox"
                  checked={filters.verifications[key]}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      verifications: { ...prev.verifications, [key]: e.target.checked },
                    }));
                    setCurrentPage(1);
                  }}
                  className="w-3.5 h-3.5 accent-blue-600 rounded"
                />
                <Icon className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-700 group-hover:text-slate-900">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={handleResetFilters}
          className="w-full mt-3 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" />
          Reset {activeFilterCount} filter
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Sticky top bar: search + sort */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md bg-white hover:bg-slate-50 flex-shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-0.5 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari alamat email, provider..."
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setCurrentPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white flex-shrink-0"
            >
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="rating_desc">Rating Terbaik</option>
              <option value="age_desc">Akun Tertua</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-4">

          {/* Filter Sidebar - Desktop sticky */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-lg border border-slate-200 p-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-slate-900">Filter</span>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Result bar */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{filteredEmails.length}</span> email ditemukan
                {currentPage > 1 && (
                  <span className="ml-1">· hal {currentPage}/{totalPages}</span>
                )}
              </p>
              {/* Active filter chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {filters.providers.map(p => (
                  <span key={p} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${PROVIDER_COLORS[p]}`}>
                    {p}
                    <button onClick={() => handleProviderToggle(p)} className="hover:opacity-70">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                {filters.verifications.phone && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 font-medium">
                    HP Terverif
                    <button onClick={() => setFilters(p => ({ ...p, verifications: { ...p.verifications, phone: false } }))}><X className="w-2.5 h-2.5" /></button>
                  </span>
                )}
                {filters.verifications.twoFa && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 font-medium">
                    2FA
                    <button onClick={() => setFilters(p => ({ ...p, verifications: { ...p.verifications, twoFa: false } }))}><X className="w-2.5 h-2.5" /></button>
                  </span>
                )}
              </div>
            </div>

            {/* Email List */}
            {paginatedEmails.length > 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {paginatedEmails.map(email => (
                  <div
                    key={email.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Provider badge */}
                    <span className={`inline-flex items-center justify-center text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 w-16 text-center ${PROVIDER_COLORS[email.provider]}`}>
                      {email.provider === 'custom' ? 'CUSTOM' : email.provider.toUpperCase()}
                    </span>

                    {/* Email address + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/email/${email.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-blue-600 truncate transition-colors"
                        >
                          {email.address}
                        </button>
                        {/* Verification icons inline */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {email.verifications.phone && (
                            <span title="HP Terverifikasi">
                              <Phone className="w-3 h-3 text-emerald-500" />
                            </span>
                          )}
                          {email.verifications.recovery && (
                            <span title="Recovery Aktif">
                              <RefreshCw className="w-3 h-3 text-emerald-500" />
                            </span>
                          )}
                          {email.verifications.twoFa && (
                            <span title="2FA Aktif">
                              <Lock className="w-3 h-3 text-emerald-500" />
                            </span>
                          )}
                          {email.verifications.phone && email.verifications.recovery && email.verifications.twoFa && (
                            <span title="Full Verified">
                              <Shield className="w-3 h-3 text-blue-500" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{email.age}</span>
                        <span className="text-slate-300 text-xs">·</span>
                        <span className="text-xs text-slate-500">{email.sellerName}</span>
                        <span className="text-slate-300 text-xs">·</span>
                        <span className="text-xs text-slate-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {email.sellerRating.toFixed(1)}
                          <span className="text-slate-400 ml-0.5">({email.sellerReviews})</span>
                        </span>
                        <span className="text-slate-300 text-xs">·</span>
                        <span className="text-xs text-slate-500">Garansi {email.warranty}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-blue-600">
                        Rp {email.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleWishlist(email.id, email.address)}
                        className={`p-1.5 rounded-md border transition-colors ${
                          isInWishlist(email.id)
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                        }`}
                        aria-label={isInWishlist(email.id) ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isInWishlist(email.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleAddToCart(email.id, email.address)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Beli
                      </button>
                    </div>

                    {/* Always-visible buy on mobile */}
                    <div className="flex items-center gap-1 flex-shrink-0 md:hidden">
                      <button
                        onClick={() => handleAddToCart(email.id, email.address)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium"
                      >
                        Beli
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 mb-1">Tidak ada hasil</p>
                <p className="text-xs text-slate-500 mb-4">Coba ubah filter atau kata kunci</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmails.length)} dari {filteredEmails.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium disabled:opacity-40 hover:bg-slate-50"
                  >
                    Prev
                  </button>
                  {/* Page numbers with ellipsis */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={`e${i}`} className="px-2 text-xs text-slate-400">...</span>
                        : (
                          <button
                            key={p}
                            onClick={() => { setCurrentPage(p as number); window.scrollTo(0, 0); }}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                              currentPage === p
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                    )}
                  <button
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
