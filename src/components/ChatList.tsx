import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserChats, deleteChatConversation, acceptChatRequest, rejectChatRequest } from '@/services/chatService';
import { getDoctorById } from '@/services/firebaseService';
import { Chat } from '@/types/firebase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MessageCircle, Check, X, Trash2, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatListProps {
    onSelectChat: (chat: Chat) => void;
    selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
    const { userData } = useAuth();
    const { language } = useLanguage();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [doctorPhotos, setDoctorPhotos] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!userData) return;

        const unsubscribe = getUserChats(
            userData.uid,
            userData.role as 'doctor' | 'patient',
            async (fetchedChats) => {
                setChats(fetchedChats);
                setLoading(false);
                
                // Fetch doctor photos for patients
                if (userData.role === 'patient') {
                    const photos: Record<string, string> = {};
                    for (const chat of fetchedChats) {
                        try {
                            const doctor = await getDoctorById(chat.doctorId);
                            if (doctor?.photoURL) {
                                photos[chat.doctorId] = doctor.photoURL;
                            }
                        } catch (error) {
                            console.error('Error fetching doctor photo:', error);
                        }
                    }
                    setDoctorPhotos(photos);
                }
            }
        );

        return () => unsubscribe();
    }, [userData]);

    const formatLastMessageTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return format(date, 'HH:mm');
        } else {
            return format(date, 'dd/MM/yyyy');
        }
    };

    const getUnreadCount = (chat: Chat) => {
        if (!userData) return 0;
        return userData.role === 'doctor' 
            ? chat.unreadCount?.doctor || 0 
            : chat.unreadCount?.patient || 0;
    };

    const handleAccept = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        setProcessingId(chatId);
        try {
            await acceptChatRequest(chatId);
        } catch (error) {
            console.error('Error accepting chat:', error);
            alert('حدث خطأ أثناء قبول الطلب');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
        
        setProcessingId(chatId);
        try {
            await rejectChatRequest(chatId);
        } catch (error) {
            console.error('Error rejecting chat:', error);
            alert('حدث خطأ أثناء رفض الطلب');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return;
        
        setProcessingId(chatId);
        try {
            await deleteChatConversation(chatId, userData!.uid, userData!.role as 'doctor' | 'patient');
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('حدث خطأ أثناء حذف المحادثة');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</Badge>;
            case 'accepted':
                return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">{language === 'ar' ? 'مقبول' : 'Accepted'}</Badge>;
            case 'rejected':
                return <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">{language === 'ar' ? 'مرفوض' : 'Rejected'}</Badge>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <MessageCircle className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {language === 'ar' ? 'لا توجد محادثات' : 'No conversations'}
                </h3>
                <p className="text-sm text-gray-500">
                    {language === 'ar' 
                        ? 'ابدأ محادثة مع طبيب من صفحة البحث' 
                        : 'Start a chat with a doctor from the search page'}
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="divide-y divide-gray-100">
                {chats.map((chat) => {
                    const otherUserName = userData?.role === 'doctor' 
                        ? chat.patientName 
                        : chat.doctorName;
                    const unreadCount = getUnreadCount(chat);
                    const isSelected = chat.id === selectedChatId;
                    const isPending = chat.status === 'pending';
                    const isDoctor = userData?.role === 'doctor';
                    const doctorPhoto = userData?.role === 'patient' ? doctorPhotos[chat.doctorId] : null;

                    return (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat)}
                            className={`p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${
                                isSelected ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''
                            } ${processingId === chat.id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar with Photo */}
                                <div className="relative shrink-0">
                                    {doctorPhoto ? (
                                        <img 
                                            src={doctorPhoto} 
                                            alt={otherUserName}
                                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling!.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md ${doctorPhoto ? 'hidden' : ''}`}>
                                        {otherUserName?.charAt(0) || <User size={24} />}
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                                            {unreadCount}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-gray-900 truncate text-base">
                                            {otherUserName}
                                        </h3>
                                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                                            {formatLastMessageTime(chat.lastMessageTime)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusBadge(chat.status)}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 truncate leading-relaxed">
                                        {chat.lastMessage || (language === 'ar' ? 'لا توجد رسائل' : 'No messages')}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isDoctor && isPending && (
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={(e) => handleAccept(e, chat.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                                    >
                                        <Check size={16} />
                                        {language === 'ar' ? 'قبول' : 'Accept'}
                                    </button>
                                    <button
                                        onClick={(e) => handleReject(e, chat.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                                    >
                                        <X size={16} />
                                        {language === 'ar' ? 'رفض' : 'Reject'}
                                    </button>
                                </div>
                            )}

                            {/* Delete Button (for accepted chats) */}
                            {chat.status === 'accepted' && (
                                <button
                                    onClick={(e) => handleDelete(e, chat.id)}
                                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <Trash2 size={14} />
                                    {language === 'ar' ? 'حذف المحادثة' : 'Delete Chat'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
};
