import React, { createContext, useContext, useState, useCallback } from 'react';

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
  chats: Chat[];
  cart: string[];
  wishlist: string[];
  notifications: string[];

  // User actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller' | 'both') => void;

  // Email actions
  addEmail: (email: Email) => void;
  removeEmail: (id: string) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;

  // Cart actions
  addToCart: (emailId: string) => void;
  removeFromCart: (emailId: string) => void;
  clearCart: () => void;

  // Wishlist actions
  addToWishlist: (emailId: string) => void;
  removeFromWishlist: (emailId: string) => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [emails, setEmails] = useState<Email[]>(getSampleEmails());
  const [chats, setChats] = useState<Chat[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const login = useCallback((email: string, _password: string) => {
    setUser({
      id: '1',
      name: 'John Doe',
      email,
      role: 'both',
      isLoggedIn: true,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCart([]);
  }, []);

  const register = useCallback((name: string, email: string, _password: string, role: 'buyer' | 'seller' | 'both') => {
    setUser({
      id: Date.now().toString(),
      name,
      email,
      role,
      isLoggedIn: true,
    });
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

  const addToCart = useCallback((emailId: string) => {
    setCart(prev => prev.includes(emailId) ? prev : [...prev, emailId]);
  }, []);

  const removeFromCart = useCallback((emailId: string) => {
    setCart(prev => prev.filter(id => id !== emailId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addToWishlist = useCallback((emailId: string) => {
    setWishlist(prev => prev.includes(emailId) ? prev : [...prev, emailId]);
  }, []);

  const removeFromWishlist = useCallback((emailId: string) => {
    setWishlist(prev => prev.filter(id => id !== emailId));
  }, []);

  const isInWishlist = useCallback((emailId: string) => {
    return wishlist.includes(emailId);
  }, [wishlist]);

  const addChat = useCallback((chat: Chat) => {
    setChats(prev => {
      const exists = prev.find(c => c.id === chat.id);
      return exists ? prev : [...prev, chat];
    });
  }, []);

  const addMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats(prev => prev.map(c =>
      c.id === chatId
        ? {
            ...c,
            messages: [...c.messages, message],
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
          }
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
    const id = Date.now().toString();
    setNotifications(prev => [...prev, id]);
    // Suppress unused warning for message param in demo
    void message;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== id));
    }, 5000);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        emails,
        chats,
        cart,
        wishlist,
        notifications,
        setUser,
        login,
        logout,
        register,
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
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

function getSampleEmails(): Email[] {
  return [
    {
      id: '1',
      address: 'premium.acc***@gmail.com',
      provider: 'gmail',
      age: '5 tahun 3 bulan',
      price: 150000,
      description: 'Gmail premium dengan recovery email aktif, verified, siap pakai untuk bisnis. Akun bersih tanpa riwayat spam.',
      verifications: { phone: true, recovery: true, twoFa: false },
      sellerId: 'seller1',
      sellerName: 'Akun Resmi',
      sellerRating: 4.8,
      sellerReviews: 127,
      status: 'active',
      warranty: '7 hari',
      imageCount: 3,
    },
    {
      id: '2',
      address: 'business.email***@outlook.com',
      provider: 'outlook',
      age: '3 tahun 6 bulan',
      price: 120000,
      description: 'Outlook business dengan 2FA aktif, recovery lengkap. Cocok untuk marketing campaign.',
      verifications: { phone: true, recovery: true, twoFa: true },
      sellerId: 'seller2',
      sellerName: 'Email Terpercaya',
      sellerRating: 4.6,
      sellerReviews: 89,
      status: 'active',
      warranty: '14 hari',
      imageCount: 2,
    },
    {
      id: '3',
      address: 'starter.mail***@yahoo.com',
      provider: 'yahoo',
      age: '2 tahun',
      price: 85000,
      description: 'Yahoo mail starter untuk pemula, sudah terverifikasi semua sistem keamanan.',
      verifications: { phone: true, recovery: false, twoFa: false },
      sellerId: 'seller3',
      sellerName: 'Starter Pack',
      sellerRating: 4.4,
      sellerReviews: 56,
      status: 'active',
      warranty: '3 hari',
      imageCount: 1,
    },
    {
      id: '4',
      address: 'custom.domain***@company.com',
      provider: 'custom',
      age: '4 tahun 1 bulan',
      price: 250000,
      description: 'Custom domain email dengan full control, akses admin panel tersedia. Untuk startup & SME.',
      verifications: { phone: true, recovery: true, twoFa: true },
      sellerId: 'seller1',
      sellerName: 'Akun Resmi',
      sellerRating: 4.8,
      sellerReviews: 127,
      status: 'active',
      warranty: '30 hari',
      imageCount: 4,
    },
    {
      id: '5',
      address: 'marketing.lead***@gmail.com',
      provider: 'gmail',
      age: '1 tahun 8 bulan',
      price: 95000,
      description: 'Gmail untuk lead generation, sudah ditest dengan campaign. Deliverability tinggi.',
      verifications: { phone: true, recovery: true, twoFa: false },
      sellerId: 'seller2',
      sellerName: 'Email Terpercaya',
      sellerRating: 4.6,
      sellerReviews: 89,
      status: 'active',
      warranty: '7 hari',
      imageCount: 2,
    },
    {
      id: '6',
      address: 'growth.hack***@outlook.com',
      provider: 'outlook',
      age: '6 tahun',
      price: 175000,
      description: 'Outlook aged account dengan history clean, perfect untuk B2B outreach. Verified semua.',
      verifications: { phone: true, recovery: true, twoFa: true },
      sellerId: 'seller3',
      sellerName: 'Starter Pack',
      sellerRating: 4.4,
      sellerReviews: 56,
      status: 'active',
      warranty: '14 hari',
      imageCount: 3,
    },
  ];
}
