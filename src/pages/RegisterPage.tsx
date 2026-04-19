import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

type Role = 'buyer' | 'seller' | 'both';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useApp();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (newRole: Role) => {
    setFormData(prev => ({ ...prev, role: newRole }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      addToast('Semua field harus diisi', 'error');
      return;
    }

    if (!formData.email.includes('@')) {
      addToast('Format email tidak valid', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password minimal 6 karakter', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Password tidak cocok', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      register(formData.name, formData.email, formData.password, formData.role);
      addToast(`Selamat datang ${formData.name}!`, 'success');
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    try {
      setIsLoading(true);

      const token = credentialResponse.credential;
      if (!token) throw new Error('No credential');

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decodedToken = JSON.parse(jsonPayload);
      const googleEmail = decodedToken.email as string;
      const googleName = decodedToken.name as string;

      setTimeout(() => {
        register(googleName, googleEmail, 'google_oauth', 'buyer');
        addToast(`Selamat datang ${googleName}!`, 'success');
        setIsLoading(false);
        navigate('/');
      }, 1000);
    } catch {
      addToast('Gagal daftar dengan Google', 'error');
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    addToast('Gagal daftar dengan Google. Coba lagi', 'error');
  };

  const roleOptions: { value: Role; label: string; desc: string }[] = [
    { value: 'buyer', label: 'Pembeli', desc: 'Cari & beli email premium' },
    { value: 'seller', label: 'Penjual', desc: 'Jual email & kelola toko' },
    { value: 'both', label: 'Keduanya', desc: 'Beli & jual email' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Buat Akun EmailMarket</h1>
              <p className="text-slate-600">Mulai jual atau beli email premium hari ini</p>
            </div>

            {/* Google Signup Button */}
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
                width="350"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-500">atau</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Anda"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">Tipe Akun</label>
                <div className="space-y-2">
                  {roleOptions.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                      style={{
                        borderColor: formData.role === option.value ? '#2563eb' : '#d1d5db',
                        backgroundColor: formData.role === option.value ? '#eff6ff' : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={() => handleRoleChange(option.value)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-600">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Membuat akun...' : 'Daftar'}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-slate-600 mt-6">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Masuk di sini
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-900">
              Demo mode aktif - Semua transaksi adalah simulasi
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
