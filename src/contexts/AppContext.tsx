import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, cartApi, wishlistApi, emailsApi } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'both';
  avatar?: string;
  isLoggedIn: boolean;
}

export interface Email {
  id: string;
  address: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  age: string;
  price: number;
  description: string;
  verifications: {
    phone: boolean;
    recovery: boolean;
    twoFa: boolean;
  };
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
  status: 'active' | 'sold' | 'inactive';
  warranty: string;
  imageCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  messages: ChatMessage[];
}

interface AppContextType {
  user: User | null;
  emails: Email[];
  emailsTotal: number;
  emailsLoading: boolean;
  chats: Chat[];
  cart: string[];
  wishlist: string[];
  notifications: string[];

  // User actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller' | 'both') => Promise<void>;

  // Email actions
  loadEmails: (query?: Parameters<typeof emailsApi.list>[0]) => Promise<void>;
  addEmail: (email: Email) => void;
  removeEmail: (id: string) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;

  // Cart actions
  addToCart: (emailId: string) => Promise<void>;
  removeFromCart: (emailId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Wishlist actions
  addToWishlist: (emailId: string) => Promise<void>;
  removeFromWishlist: (emailId: string) => Promise<void>;
  isInWishlist: (emailId: string) => boolean;

  // Chat actions
  addChat: (chat: Chat) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  markChatAsRead: (chatId: string) => void;

  // Notification actions
  addNotification: (message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailsTotal, setEmailsTotal] = useState(0);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Restore session on mount
  useEffect(() => {
    authApi.me()
      .then(({ user }) => {
        if (user) {
          setUserState(user);
          // Load cart and wishlist
          cartApi.get().then(({ items }) => setCart(items.map(i => String(i.listing_id)))).catch(() => {});
          wishlistApi.get().then(({ items }) => setWishlist(items)).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Load emails (from DB if available, fallback to sample)
  const loadEmails = useCallback(async (query: Parameters<typeof emailsApi.list>[0] = {}) => {
    setEmailsLoading(true);
    try {
      const result = await emailsApi.list({ limit: 50, ...query });
      if (result.emails.length > 0) {
        setEmails(result.emails);
        setEmailsTotal(result.total);
      } else {
        // Fallback to sample data when DB is empty
        const sample = getSampleEmails();
        setEmails(sample);
        setEmailsTotal(sample.length);
      }
    } catch {
      // API not available (dev without Vercel Functions) — use sample data
      const sample = getSampleEmails();
      setEmails(sample);
      setEmailsTotal(sample.length);
    } finally {
      setEmailsLoading(false);
    }
  }, []);

  // Load emails on mount
  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authApi.login(email, password);
    setUserState(user);
    // Load user-specific data
    cartApi.get().then(({ items }) => setCart(items.map(i => String(i.listing_id)))).catch(() => {});
    wishlistApi.get().then(({ items }) => setWishlist(items)).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUserState(null);
    setCart([]);
    setWishlist([]);
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'buyer' | 'seller' | 'both'
  ) => {
    const { user } = await authApi.register(name, email, password, role);
    setUserState(user);
  }, []);

  const addEmail = useCallback((email: Email) => {
    setEmails(prev => [...prev, email]);
  }, []);

  const removeEmail = useCallback((id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
  }, []);

  const updateEmail = useCallback((id: string, updates: Partial<Email>) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const addToCart = useCallback(async (emailId: string) => {
    setCart(prev => prev.includes(emailId) ? prev : [...prev, emailId]);
    if (user) {
      cartApi.add(emailId).catch(() => {});
    }
  }, [user]);

  const removeFromCart = useCallback(async (emailId: string) => {
    setCart(prev => prev.filter(id => id !== emailId));
    if (user) {
      cartApi.remove(emailId).catch(() => {});
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (user) {
      cartApi.clear().catch(() => {});
    }
  }, [user]);

  const addToWishlist = useCallback(async (emailId: string) => {
    setWishlist(prev => prev.includes(emailId) ? prev : [...prev, emailId]);
    if (user) {
      wishlistApi.add(emailId).catch(() => {});
    }
  }, [user]);

  const removeFromWishlist = useCallback(async (emailId: string) => {
    setWishlist(prev => prev.filter(id => id !== emailId));
    if (user) {
      wishlistApi.remove(emailId).catch(() => {});
    }
  }, [user]);

  const isInWishlist = useCallback((emailId: string) => {
    return wishlist.includes(emailId);
  }, [wishlist]);

  const addChat = useCallback((chat: Chat) => {
    setChats(prev => prev.find(c => c.id === chat.id) ? prev : [...prev, chat]);
  }, []);

  const addMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats(prev => prev.map(c =>
      c.id === chatId
        ? { ...c, messages: [...c.messages, message], lastMessage: message.content, lastMessageTime: message.timestamp }
        : c
    ));
  }, []);

  const markChatAsRead = useCallback((chatId: string) => {
    setChats(prev => prev.map(c =>
      c.id === chatId
        ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
        : c
    ));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n !== id));
  }, []);

  const addNotification = useCallback((message: string) => {
    const id = `${Date.now()}-${message.slice(0, 8)}`;
    setNotifications(prev => [...prev, id]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n !== id)), 5000);
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <AppContext.Provider
      value={{
        user,
        emails,
        emailsTotal,
        emailsLoading,
        chats,
        cart,
        wishlist,
        notifications,
        setUser,
        login,
        logout,
        register,
        loadEmails,
        addEmail,
        removeEmail,
        updateEmail,
        addToCart,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        addChat,
        addMessage,
        markChatAsRead,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// ─── Sample data fallback (used when DB has no listings yet) ─────────────────

function getSampleEmails(): Email[] {
  const sellers = [
    { id: 'seller1', name: 'Akun Resmi', rating: 4.8, reviews: 127 },
    { id: 'seller2', name: 'Email Terpercaya', rating: 4.6, reviews: 89 },
    { id: 'seller3', name: 'Starter Pack', rating: 4.4, reviews: 56 },
    { id: 'seller4', name: 'BulkMail Pro', rating: 4.9, reviews: 312 },
    { id: 'seller5', name: 'DigitalAcc', rating: 4.3, reviews: 74 },
    { id: 'seller6', name: 'TopSeller ID', rating: 4.7, reviews: 201 },
  ];
  const prefixes = [
    'premium','business','marketing','starter','growth','agency','outreach','bulk',
    'promo','sales','digital','brand','corp','lead','campaign','info','support',
    'admin','contact','hello','team','media','social','news','store','shop',
    'service','pro','mega','ultra','smart','fast','safe','secure','direct',
    'prime','first','best','top','max','power','super','alpha','beta','delta',
    'sigma','nova','apex','elite','vip','gold','silver',
  ];
  const providers: Array<Email['provider']> = ['gmail', 'outlook', 'yahoo', 'custom'];
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'mycompany.id'];
  const ages = ['1 tahun','2 tahun','3 tahun','4 tahun','5 tahun','6 tahun','1 tahun 6 bulan','2 tahun 8 bulan','3 tahun 4 bulan'];
  const warranties = ['3 hari','7 hari','14 hari','30 hari'];
  const descriptions = [
    'Akun bersih tanpa riwayat spam, siap pakai untuk bisnis.',
    'Verified lengkap, cocok untuk marketing campaign profesional.',
    'Aged account dengan deliverability tinggi, clean history.',
    'Full verifikasi, recovery aktif, perfect untuk B2B outreach.',
    'Akun premium dengan history bersih, siap digunakan.',
    'Terverifikasi phone & 2FA, cocok untuk operasional bisnis.',
    'Gmail lama dengan reputasi baik, clean dari spam filter.',
    'Outlook business class, full security features enabled.',
  ];

  const emails: Email[] = [];
  for (let i = 1; i <= 220; i++) {
    const pi = (i + Math.floor(i / 3)) % 4;
    const provider = providers[pi];
    const prefix = prefixes[(i * 3 + 7) % prefixes.length];
    const suffix = String((i * 17 + 3) % 999);
    const seller = sellers[i % sellers.length];
    const priceBase = [45000, 80000, 120000, 200000][pi];
    emails.push({
      id: String(i),
      address: `${prefix}.${suffix}***@${domains[pi]}`,
      provider,
      age: ages[i % ages.length],
      price: priceBase + ((i * 7919) % 80000),
      description: descriptions[i % descriptions.length],
      verifications: { phone: i % 3 !== 0, recovery: i % 4 !== 1, twoFa: i % 5 === 0 },
      sellerId: seller.id,
      sellerName: seller.name,
      sellerRating: seller.rating,
      sellerReviews: seller.reviews,
      status: 'active',
      warranty: warranties[i % warranties.length],
      imageCount: (i % 4) + 1,
    });
  }
  return emails;
}
