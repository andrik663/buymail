import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, X, Star, Shield, Phone, RefreshCw, Lock,
  ShoppingCart, Heart, ChevronDown, ChevronUp, ChevronRight,
  Clock, CheckCircle, AlertCircle, MessageSquare, ExternalLink, User
} from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import type { Email } from '../contexts/AppContext';

type Provider = 'gmail' | 'outlook' | 'yahoo' | 'custom';
type SortKey = 'price_asc' | 'price_desc' | 'rating_desc' | 'age_desc';

interface FilterState {
  providers: Provider[];
  priceMax: number;
  minRating: number;
  minAge: string;
  verifications: { phone: boolean; recovery: boolean; twoFa: boolean };
  search: string;
}

const PROVIDER_STYLES: Record<Provider, { badge: string; dot: string; label: string }> = {
  gmail:   { badge: 'bg-red-50 text-red-600 border-red-200',     dot: 'bg-red-500',     label: 'Gmail' },
  outlook: { badge: 'bg-blue-50 text-blue-600 border-blue-200',  dot: 'bg-blue-500',    label: 'Outlook' },
  yahoo:   { badge: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-500', label: 'Yahoo' },
  custom:  { badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500', label: 'Custom' },
};

const ITEMS_PER_PAGE = 50;

// ─── Expanded Detail Panel ────────────────────────────────────────────────────
function ExpandedRow({ email, onClose, onAddToCart, onToggleWishlist, inWishlist, onNavigate }: {
  email: Email;
  onClose: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  inWishlist: boolean;
  onNavigate: () => void;
}) {
  const ps = PROVIDER_STYLES[email.provider];
  const verifs = [
    { ok: email.verifications.phone,    icon: Phone,      label: 'Verifikasi HP',     desc: 'Nomor HP terdaftar & terverifikasi' },
    { ok: email.verifications.recovery, icon: RefreshCw,  label: 'Recovery Email',    desc: 'Email pemulihan aktif & berfungsi' },
    { ok: email.verifications.twoFa,    icon: Lock,       label: '2FA / Authenticator', desc: 'Two-factor authentication aktif' },
  ];
  const fullVerified = email.verifications.phone && email.verifications.recovery && email.verifications.twoFa;

  return (
    <div className="bg-slate-50 border-t border-blue-100 px-3 py-4 animate-[fadeIn_0.15s_ease]">
      <div className="max-w-full grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Col 1 – Product info */}
        <div className="md:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded border ${ps.badge}`}>
                  {ps.label}
                </span>
                {fullVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                    <Shield className="w-3 h-3" /> Full Verified
                  </span>
                )}
                <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  Garansi {email.warranty}
                </span>
              </div>
              <p className="text-base font-semibold text-slate-800 mt-1.5 font-mono tracking-tight">
                {email.address}
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-slate-200 transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deskripsi Produk</p>
            <p className="text-sm text-slate-700 leading-relaxed">{email.description}</p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-400 mb-0.5">Umur Akun</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-sm font-semibold text-slate-800">{email.age}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-400 mb-0.5">Provider</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ps.dot}`} />
                <span className="text-sm font-semibold text-slate-800">{ps.label}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-400 mb-0.5">Garansi</p>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-sm font-semibold text-slate-800">{email.warranty}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-400 mb-0.5">Status</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700 capitalize">{email.status === 'active' ? 'Tersedia' : email.status}</span>
              </div>
            </div>
          </div>

          {/* Verifications */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Verifikasi</p>
            <div className="flex flex-col gap-1.5">
              {verifs.map(({ ok, icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 border text-sm ${
                    ok
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  {ok
                    ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  }
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{label}</span>
                    <span className="text-xs ml-2 opacity-70">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2 – Seller + price + actions */}
        <div className="space-y-3">
          {/* Seller card */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Penjual</p>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{email.sellerName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-slate-700">{email.sellerRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({email.sellerReviews} ulasan)</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Penjual terpercaya dengan rekam jejak {email.sellerReviews} transaksi. Rating tinggi menunjukkan kepuasan pembeli.
            </p>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <MessageSquare className="w-3 h-3" />
              Chat Penjual
            </button>
          </div>

          {/* Price + buy */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-0.5">Harga</p>
            <p className="text-2xl font-bold text-blue-600 mb-3">
              Rp {email.price.toLocaleString('id-ID')}
            </p>
            <div className="space-y-2">
              <button
                onClick={onAddToCart}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Tambah ke Keranjang
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onToggleWishlist}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    inWishlist
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                  {inWishlist ? 'Tersimpan' : 'Simpan'}
                </button>
                <button
                  onClick={onNavigate}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single compact row ───────────────────────────────────────────────────────
function EmailRow({ email, expanded, onToggle, onAddToCart, onToggleWishlist, inWishlist, onNavigate }: {
  email: Email;
  expanded: boolean;
  onToggle: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  inWishlist: boolean;
  onNavigate: () => void;
}) {
  const ps = PROVIDER_STYLES[email.provider];
  const verifCount = [email.verifications.phone, email.verifications.recovery, email.verifications.twoFa].filter(Boolean).length;

  return (
    <div className={`border-b border-slate-100 last:border-b-0 ${expanded ? 'bg-white' : 'hover:bg-slate-50/60'} transition-colors`}>
      {/* Compact row – strictly single line */}
      <div
        className="flex items-center h-10 px-3 cursor-pointer select-none gap-0"
        onClick={onToggle}
      >
        {/* Provider badge – fixed 60px */}
        <div className="w-[60px] flex-shrink-0">
          <span className={`inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none ${ps.badge}`}>
            {ps.label.toUpperCase()}
          </span>
        </div>

        {/* Email address – grows, truncates */}
        <div className="flex-1 min-w-0 px-2">
          <span className="text-[13px] font-medium text-slate-800 truncate block font-mono">
            {email.address}
          </span>
        </div>

        {/* Verification dots – fixed 52px */}
        <div className="w-[52px] flex-shrink-0 flex items-center gap-1">
          <span title="HP" className={`w-2 h-2 rounded-full flex-shrink-0 ${email.verifications.phone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          <span title="Recovery" className={`w-2 h-2 rounded-full flex-shrink-0 ${email.verifications.recovery ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          <span title="2FA" className={`w-2 h-2 rounded-full flex-shrink-0 ${email.verifications.twoFa ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          {verifCount === 3 && <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />}
        </div>

        {/* Age – fixed 80px hidden on small */}
        <div className="hidden sm:block w-[80px] flex-shrink-0">
          <span className="text-[11px] text-slate-500 truncate">{email.age}</span>
        </div>

        {/* Seller + rating – fixed 130px hidden on md down */}
        <div className="hidden md:flex w-[130px] flex-shrink-0 items-center gap-1 min-w-0">
          <span className="text-[11px] text-slate-500 truncate">{email.sellerName}</span>
          <span className="text-[10px] text-slate-400 flex-shrink-0 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            {email.sellerRating.toFixed(1)}
          </span>
        </div>

        {/* Warranty – fixed 64px hidden on lg down */}
        <div className="hidden lg:block w-[64px] flex-shrink-0">
          <span className="text-[11px] text-slate-400 truncate">Grns {email.warranty}</span>
        </div>

        {/* Price – fixed 96px */}
        <div className="w-[96px] flex-shrink-0 text-right">
          <span className="text-[13px] font-bold text-blue-600">
            Rp {email.price >= 1000000
              ? `${(email.price / 1000000).toFixed(1)}jt`
              : email.price >= 1000
              ? `${Math.round(email.price / 1000)}rb`
              : email.price}
          </span>
        </div>

        {/* Expand chevron – fixed 28px */}
        <div className="w-7 flex-shrink-0 flex items-center justify-end pl-1">
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" />
          }
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <ExpandedRow
          email={email}
          onClose={onToggle}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          inWishlist={inWishlist}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

// ─── Filter Panel (reusable for sidebar & mobile drawer) ─────────────────────
function FilterPanel({
  filters,
  setFilters,
  setCurrentPage,
  activeFilterCount,
  onReset,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setCurrentPage: (n: number) => void;
  activeFilterCount: number;
  onReset: () => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setCollapsed(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const SectionHead = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => toggle(id)} className="flex items-center justify-between w-full py-1.5 text-left">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      {collapsed.has(id) ? <ChevronDown className="w-3 h-3 text-slate-300" /> : <ChevronUp className="w-3 h-3 text-slate-300" />}
    </button>
  );

  return (
    <div className="space-y-0.5 text-xs">
      {/* Provider */}
      <div className="border-b border-slate-100 pb-2 mb-0.5">
        <SectionHead id="p" label="Provider" />
        {!collapsed.has('p') && (
          <div className="space-y-0.5 mt-0.5">
            {(['gmail', 'outlook', 'yahoo', 'custom'] as Provider[]).map(p => (
              <label key={p} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.providers.includes(p)}
                  onChange={() => {
                    setFilters(prev => ({
                      ...prev,
                      providers: prev.providers.includes(p)
                        ? prev.providers.filter(x => x !== p)
                        : [...prev.providers, p],
                    }));
                    setCurrentPage(1);
                  }}
                  className="w-3 h-3 rounded accent-blue-600"
                />
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PROVIDER_STYLES[p].dot}`} />
                <span className="text-slate-700 capitalize">{PROVIDER_STYLES[p].label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-slate-100 pb-2 mb-0.5">
        <SectionHead id="pr" label="Maks. Harga" />
        {!collapsed.has('pr') && (
          <div className="mt-1">
            <input
              type="range" min="0" max="500000" step="10000"
              value={filters.priceMax}
              onChange={e => { setFilters(p => ({ ...p, priceMax: +e.target.value })); setCurrentPage(1); }}
              className="w-full h-1 accent-blue-600"
            />
            <div className="flex justify-between text-slate-400 mt-1">
              <span>Rp 0</span>
              <span className="font-semibold text-slate-600">Rp {(filters.priceMax / 1000).toFixed(0)}rb</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-b border-slate-100 pb-2 mb-0.5">
        <SectionHead id="r" label="Rating" />
        {!collapsed.has('r') && (
          <div className="space-y-0.5 mt-0.5">
            {([[0, 'Semua'], [3, '3+ ★★★'], [4, '4+ ★★★★'], [5, '5 ★★★★★']] as [number, string][]).map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="radio" name="rating"
                  checked={filters.minRating === val}
                  onChange={() => { setFilters(p => ({ ...p, minRating: val })); setCurrentPage(1); }}
                  className="w-3 h-3 accent-blue-600"
                />
                <span className="text-slate-700">{lbl}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Age */}
      <div className="border-b border-slate-100 pb-2 mb-0.5">
        <SectionHead id="a" label="Umur Akun" />
        {!collapsed.has('a') && (
          <div className="space-y-0.5 mt-0.5">
            {([['', 'Semua'], ['1-3', '1–3 Tahun'], ['3-5', '3–5 Tahun'], ['5+', '5+ Tahun']] as [string, string][]).map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="radio" name="age"
                  checked={filters.minAge === val}
                  onChange={() => { setFilters(p => ({ ...p, minAge: val })); setCurrentPage(1); }}
                  className="w-3 h-3 accent-blue-600"
                />
                <span className="text-slate-700">{lbl}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Verifications */}
      <div className="pb-2">
        <SectionHead id="v" label="Verifikasi" />
        {!collapsed.has('v') && (
          <div className="space-y-0.5 mt-0.5">
            {([
              ['phone', 'HP Terverifikasi'],
              ['recovery', 'Recovery Aktif'],
              ['twoFa', '2FA Aktif'],
            ] as [keyof FilterState['verifications'], string][]).map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifications[key]}
                  onChange={e => {
                    setFilters(p => ({ ...p, verifications: { ...p.verifications, [key]: e.target.checked } }));
                    setCurrentPage(1);
                  }}
                  className="w-3 h-3 rounded accent-blue-600"
                />
                <span className="text-slate-700">{lbl}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={onReset}
          className="w-full mt-2 px-2 py-1.5 text-[11px] font-semibold text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" />
          Reset {activeFilterCount} filter
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const navigate = useNavigate();
  const { emails, addToCart, isInWishlist, addToWishlist, removeFromWishlist } = useApp();
  const { addToast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    providers: [], priceMax: 500000, minRating: 0, minAge: '',
    verifications: { phone: false, recovery: false, twoFa: false },
    search: '',
  });
  const [sort, setSort] = useState<SortKey>('price_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredEmails = useMemo(() => {
    let result = emails.filter(email => {
      if (filters.search && !email.address.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.providers.length > 0 && !filters.providers.includes(email.provider)) return false;
      if (email.price > filters.priceMax) return false;
      if (email.sellerRating < filters.minRating) return false;
      const yr = parseInt(email.age.split(' ')[0]);
      if (filters.minAge === '1-3' && (yr < 1 || yr > 3)) return false;
      if (filters.minAge === '3-5' && (yr < 3 || yr > 5)) return false;
      if (filters.minAge === '5+' && yr < 5) return false;
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
    currentPage * ITEMS_PER_PAGE,
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

  const handleReset = () => {
    setFilters({ providers: [], priceMax: 500000, minRating: 0, minAge: '', verifications: { phone: false, recovery: false, twoFa: false }, search: '' });
    setCurrentPage(1);
    addToast('Filter direset', 'info');
  };

  const handleAddToCart = (email: Email) => {
    addToCart(email.id);
    addToast(`${email.address} ditambahkan ke keranjang`, 'success');
  };

  const handleToggleWishlist = (email: Email) => {
    if (isInWishlist(email.id)) {
      removeFromWishlist(email.id);
      addToast('Dihapus dari wishlist', 'info');
    } else {
      addToWishlist(email.id);
      addToast(`${email.address} disimpan`, 'success');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Column header row
  const ColHeaders = () => (
    <div className="flex items-center h-7 px-3 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
      <div className="w-[60px] flex-shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Provider</div>
      <div className="flex-1 min-w-0 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Alamat Email</div>
      <div className="w-[52px] flex-shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verif</div>
      <div className="hidden sm:block w-[80px] flex-shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Umur</div>
      <div className="hidden md:block w-[130px] flex-shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Penjual</div>
      <div className="hidden lg:block w-[64px] flex-shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Garansi</div>
      <div className="w-[96px] flex-shrink-0 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Harga</div>
      <div className="w-7 flex-shrink-0" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Sticky top bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold border border-slate-300 rounded-md bg-white hover:bg-slate-50 flex-shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
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
                onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setCurrentPage(1); }}
                className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              {filters.search && (
                <button onClick={() => setFilters(p => ({ ...p, search: '' }))} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => { setSort(e.target.value as SortKey); setCurrentPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white flex-shrink-0"
            >
              <option value="price_asc">Termurah</option>
              <option value="price_desc">Termahal</option>
              <option value="rating_desc">Rating Terbaik</option>
              <option value="age_desc">Akun Tertua</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex gap-3">

          {/* Sidebar – desktop sticky */}
          <aside className="hidden md:block w-44 flex-shrink-0">
            <div className="sticky top-[7rem] bg-white rounded-lg border border-slate-200 p-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                setCurrentPage={setCurrentPage}
                activeFilterCount={activeFilterCount}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {mobileFilterOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-slate-900">Filter</span>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  setCurrentPage={setCurrentPage}
                  activeFilterCount={activeFilterCount}
                  onReset={handleReset}
                />
              </div>
            </div>
          )}

          {/* Main list */}
          <main className="flex-1 min-w-0">
            {/* Result bar */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{filteredEmails.length}</span> email ditemukan
                {totalPages > 1 && <span className="ml-1 text-slate-400">· hal {currentPage}/{totalPages}</span>}
              </p>
              {/* Active filter chips */}
              <div className="flex items-center gap-1 flex-wrap">
                {filters.providers.map(p => (
                  <span key={p} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PROVIDER_STYLES[p].badge}`}>
                    {PROVIDER_STYLES[p].label}
                    <button onClick={() => setFilters(prev => ({ ...prev, providers: prev.providers.filter(x => x !== p) }))}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* List container */}
            {paginatedEmails.length > 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <ColHeaders />
                <div className="divide-y divide-slate-100">
                  {paginatedEmails.map(email => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      expanded={expandedId === email.id}
                      onToggle={() => toggleExpand(email.id)}
                      onAddToCart={() => handleAddToCart(email)}
                      onToggleWishlist={() => handleToggleWishlist(email)}
                      inWishlist={isInWishlist(email.id)}
                      onNavigate={() => navigate(`/email/${email.id}`)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
                <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 mb-1">Tidak ada hasil</p>
                <p className="text-xs text-slate-400 mb-4">Coba ubah filter atau kata kunci pencarian</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-slate-400">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmails.length)} dari {filteredEmails.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); setExpandedId(null); }}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 border border-slate-300 rounded-md text-xs font-medium disabled:opacity-40 hover:bg-slate-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={`e${i}`} className="px-1 text-xs text-slate-400">...</span>
                        : (
                          <button
                            key={p}
                            onClick={() => { setCurrentPage(p as number); window.scrollTo(0, 0); setExpandedId(null); }}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                              currentPage === p ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                    )
                  }
                  <button
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); setExpandedId(null); }}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 border border-slate-300 rounded-md text-xs font-medium disabled:opacity-40 hover:bg-slate-50"
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
