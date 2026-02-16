import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, listenToMessages, markMessagesAsRead, getChatById } from '@/services/chatService';
import { getDoctorById } from '@/services/firebaseService';
import { ChatMessage, Chat } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Check, CheckCheck, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatWindowProps {
    chatId: string;
    otherUserName: string;
    chat?: Chat;
    onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, otherUserName, chat: initialChat, onBack }) => {
    const { userData } = useAuth();
    const { language } = useLanguage();
    const [chat, setChat] = useState<Chat | null>(initialChat || null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [doctorPhoto, setDoctorPhoto] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatId) return;
        const fetchChat = async () => {
            const chatData = await getChatById(chatId);
            setChat(chatData);
            
            // Fetch doctor photo if patient
            if (userData?.role === 'patient' && chatData) {
                try {
                    const doctor = await getDoctorById(chatData.doctorId);
                    if (doctor?.photoURL) {
                        setDoctorPhoto(doctor.photoURL);
                    }
                } catch (error) {
                    console.error('Error fetching doctor photo:', error);
                }
            }
        };
        fetchChat();
    }, [chatId, userData]);

    useEffect(() => {
        if (!chatId) return;
        const unsubscribe = listenToMessages(chatId, (msgs) => {
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!chatId || !userData) return;
        const markAsRead = async () => {
            try {
                await markMessagesAsRead(chatId, userData.uid, userData.role as 'doctor' | 'patient');
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        };
        markAsRead();
    }, [chatId, userData]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !userData || sending) return;
        if (chat?.status !== 'accepted') {
            alert(language === 'ar' ? 'لا يمكن إرسال رسائل حتى يتم قبول الطلب' : 'Cannot send messages until request is accepted');
            return;
        }
        setSending(true);
        try {
            await sendMessage(chatId, userData.uid, userData.role as 'doctor' | 'patient', userData.name || userData.displayName, newMessage.trim());
            setNewMessage('');
        } catch (error: any) {
            console.error('Error sending message:', error);
            alert(error.message || (language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة' : 'Error sending message'));
        } finally {
            setSending(false);
        }
    };

    const formatMessageTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'HH:mm');
    };

    const isPending = chat?.status === 'pending';
    const isRejected = chat?.status === 'rejected';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header with Doctor Photo */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 shadow-lg">
                <div className="p-4 flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    
                    {/* Avatar */}
                    {doctorPhoto ? (
                        <img 
                            src={doctorPhoto} 
                            alt={otherUserName}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={`w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg ${doctorPhoto ? 'hidden' : ''}`}>
                        {otherUserName?.charAt(0) || <User size={24} />}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-white">{otherUserName}</h2>
                        {isPending && <p className="text-xs text-blue-100">⏳ {language === 'ar' ? 'في انتظار قبول الطبيب' : 'Waiting for doctor approval'}</p>}
                        {isRejected && <p className="text-xs text-red-100">❌ {language === 'ar' ? 'تم رفض الطلب' : 'Request rejected'}</p>}
                        {!isPending && !isRejected && <p className="text-xs text-blue-100">✓ {language === 'ar' ? 'متصل' : 'Connected'}</p>}
                    </div>
                </div>
            </div>

            {/* Messages Area with Beautiful Background */}
            <ScrollArea className="flex-1 p-4 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto relative z-10">
                    {messages.length === 0 && (
                        <div className="text-center py-16">
                            {/* Beautiful Empty State */}
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                                    <Send className="w-16 h-16 text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {language === 'ar' ? 'ابدأ المحادثة الآن' : 'Start the conversation now'}
                            </h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                {language === 'ar' 
                                    ? 'أرسل رسالتك الأولى وابدأ التواصل مع الطبيب' 
                                    : 'Send your first message and start communicating with the doctor'}
                            </p>
                        </div>
                    )}
                    
                    {messages.map((message) => {
                        const isOwn = message.senderId === userData?.uid;
                        return (
                            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm ${
                                    isOwn 
                                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white rounded-br-md' 
                                        : 'bg-white/90 text-gray-900 border border-gray-100 rounded-bl-md'
                                }`}>
                                    {!isOwn && (
                                        <p className="text-xs font-bold mb-2 text-blue-600 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            {message.senderName}
                                        </p>
                                    )}
                                    <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
                                        {message.text}
                                    </p>
                                    <div className={`flex items-center gap-1.5 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {formatMessageTime(message.createdAt)}
                                        </p>
                                        {isOwn && (
                                            <span className="text-blue-100">
                                                {message.read ? <CheckCheck size={14} /> : <Check size={14} />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            {chat?.status === 'accepted' ? (
                <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-4 bg-white/95 backdrop-blur-xl">
                    <div className="flex gap-3 max-w-4xl mx-auto">
                        <Input 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                            placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'} 
                            disabled={sending} 
                            className="flex-1 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-5 py-6 text-base bg-white shadow-sm"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Button 
                            type="submit" 
                            disabled={sending || !newMessage.trim()} 
                            className="rounded-2xl w-14 h-14 p-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                        >
                            {sending ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <Send className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="border-t border-gray-100 p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-center relative overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-1/4 w-32 h-32 bg-amber-300 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-orange-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-amber-900 mb-2">
                            {isPending && (language === 'ar' ? '⏳ في انتظار قبول الطبيب' : '⏳ Waiting for doctor approval')}
                            {isRejected && (language === 'ar' ? '❌ تم رفض الطلب' : '❌ Request rejected')}
                        </h3>
                        <p className="text-sm text-amber-700 max-w-md mx-auto">
                            {isPending && (language === 'ar' 
                                ? 'سيتم إشعارك فور قبول الطبيب لطلب المحادثة' 
                                : 'You will be notified once the doctor accepts the chat request'
                            )}
                            {isRejected && (language === 'ar' 
                                ? 'يمكنك إرسال طلب محادثة جديد' 
                                : 'You can send a new chat request'
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
