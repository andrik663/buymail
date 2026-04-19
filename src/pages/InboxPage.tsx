import { useState } from 'react';
import { Send, Search, MoreVertical, AlertCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

const DEMO_CHATS = [
  {
    id: 'chat-seller1',
    participantId: 'seller1',
    participantName: 'Akun Resmi',
    unreadCount: 2,
    messages: [
      {
        id: '1',
        senderId: 'seller1',
        senderName: 'Akun Resmi',
        content: 'Halo, ada yang bisa saya bantu?',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
      },
      {
        id: '2',
        senderId: 'user1',
        senderName: 'Anda',
        content: 'Apa recovery email akun ini masih aktif?',
        timestamp: new Date(Date.now() - 1800000),
        isRead: true,
      },
      {
        id: '3',
        senderId: 'seller1',
        senderName: 'Akun Resmi',
        content: 'Ya, recovery email aktif dan sudah diverifikasi. Garansi 7 hari berlaku penuh',
        timestamp: new Date(Date.now() - 600000),
        isRead: false,
      },
    ],
  },
];

export default function InboxPage() {
  const { chats, addMessage, markChatAsRead } = useApp();
  const { addToast } = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  const displayChats = chats.length > 0 ? chats : DEMO_CHATS;

  const filteredChats = displayChats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = displayChats.find(c => c.id === selectedChatId);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'user1',
      senderName: 'Anda',
      content: messageText,
      timestamp: new Date(),
      isRead: false,
    };

    addMessage(selectedChat.id, newMessage);
    setMessageText('');
    addToast('Pesan terkirim', 'success');
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    markChatAsRead(chatId);
    setIsMobileView(true);
  };

  const handleBackToList = () => {
    setIsMobileView(false);
    setSelectedChatId(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Chat List Sidebar */}
        <div className={`${isMobileView ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 bg-white flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pesan</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length > 0 ? (
              filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
                    selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-slate-900">{chat.participantName}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                    {chat.messages[chat.messages.length - 1]?.content || 'Belum ada pesan'}
                  </p>
                  {chat.messages[chat.messages.length - 1]?.timestamp && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(new Date(chat.messages[chat.messages.length - 1].timestamp))}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-600">
                Tidak ada chat ditemukan
              </div>
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className={`${!isMobileView && !selectedChatId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white overflow-hidden`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white flex-shrink-0">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                    aria-label="Kembali"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {selectedChat.participantName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{selectedChat.participantName}</h3>
                    <p className="text-xs text-slate-500">Online</p>
                  </div>
                </div>
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {selectedChat.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'user1' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.senderId === 'user1'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.senderId === 'user1' ? 'text-blue-100' : 'text-slate-500'}`}>
                        {formatTime(new Date(message.timestamp))}
                        {message.senderId === 'user1' && (
                          <span className="ml-2">{message.isRead ? '\u2713\u2713' : '\u2713'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Tulis pesan..."
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Kirim pesan"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Pilih chat untuk memulai</h3>
                <p className="text-slate-600">Pilih salah satu chat dari daftar untuk melihat pesan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
