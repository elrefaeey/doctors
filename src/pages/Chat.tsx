import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ChatList } from '@/components/ChatList';
import { ChatWindow } from '@/components/ChatWindow';
import { Chat as ChatType } from '@/types/firebase';
import BackButton from '@/components/BackButton';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Chat() {
    const { userData, loading } = useAuth();
    const { language } = useLanguage();
    const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    // Redirect if not logged in
    if (!userData) {
        return <Navigate to="/role-selection" replace />;
    }

    // Redirect if admin
    if (userData.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    const otherUserName = userData.role === 'doctor' 
        ? selectedChat?.patientName 
        : selectedChat?.doctorName;

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <BackButton variant="floating" />
            
            {/* Modern Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {language === 'ar' ? 'المحادثات' : 'Messages'}
                            </h1>
                            <p className="text-sm text-blue-100">
                                {language === 'ar' ? 'تواصل مع الأطباء' : 'Connect with doctors'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex overflow-hidden container mx-auto">
                {/* Chat List - Left Side */}
                <div className="w-full md:w-96 bg-white md:rounded-l-2xl md:my-4 md:ml-4 shadow-xl border-r border-gray-100">
                    <ChatList
                        onSelectChat={setSelectedChat}
                        selectedChatId={selectedChat?.id}
                    />
                </div>

                {/* Chat Window - Right Side */}
                <div className="flex-1 hidden md:flex md:rounded-r-2xl md:my-4 md:mr-4 overflow-hidden shadow-xl">
                    {selectedChat ? (
                        <ChatWindow
                            chatId={selectedChat.id}
                            otherUserName={otherUserName || ''}
                            chat={selectedChat}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full text-center p-8 bg-white">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
                                <MessageCircle className="h-16 w-16 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {language === 'ar' ? 'اختر محادثة' : 'Select a conversation'}
                            </h2>
                            <p className="text-gray-500 max-w-sm">
                                {language === 'ar' 
                                    ? 'اختر محادثة من القائمة لبدء المراسلة' 
                                    : 'Choose a chat from the list to start messaging'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Mobile Chat Window */}
                {selectedChat && (
                    <div className="fixed inset-0 bg-white z-50 md:hidden">
                        <ChatWindow
                            chatId={selectedChat.id}
                            otherUserName={otherUserName || ''}
                            chat={selectedChat}
                            onBack={() => setSelectedChat(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
