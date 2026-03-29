import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Bell, CheckCheck, Gift, Car, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase, subscribeToNotifications } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsModalProps {
  theme: string;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  userId?: string;
  onClose: () => void;
  t: (key: string) => string;
}

const getNotifIcon = (title: string) => {
  if (title.toLowerCase().includes('promo') || title.toLowerCase().includes('offre')) return <Gift className="w-5 h-5 text-[#FDB931]" />;
  if (title.toLowerCase().includes('chauffeur') || title.toLowerCase().includes('driver')) return <Car className="w-5 h-5 text-blue-400" />;
  if (title.toLowerCase().includes('urgence') || title.toLowerCase().includes('alerte')) return <AlertTriangle className="w-5 h-5 text-red-400" />;
  return <Bell className="w-5 h-5 text-[#FDB931]" />;
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  theme,
  notifications,
  setNotifications,
  userId,
  onClose,
  t,
}) => {
  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time notifications
    const channel = subscribeToNotifications(userId, (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      // Play notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (userId) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 z-[120] backdrop-blur-2xl flex items-start justify-center pt-16 p-6',
        theme === 'dark' ? 'bg-black/80' : 'bg-white/80'
      )}
    >
      <div className="w-full max-w-sm glass backdrop-blur-3xl rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FDB931]" />
            <h3 className="font-bold text-lg">{t('notifications')}</h3>
            {unreadCount > 0 && (
              <span className="bg-[#FDB931] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" /> Tout lire
              </button>
            )}
            <button
              onClick={onClose}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12 opacity-40">
              <Bell className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'flex items-start gap-3 p-4 border-b transition-colors',
                  theme === 'dark' ? 'border-white/5' : 'border-black/5',
                  !notif.is_read && (theme === 'dark' ? 'bg-white/5' : 'bg-black/5')
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                  )}
                >
                  {getNotifIcon(notif.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{notif.title}</p>
                  <p className="text-xs opacity-60 mt-0.5 line-clamp-2">{notif.content}</p>
                  <p className="text-[10px] opacity-40 mt-1">
                    {new Date(notif.created_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-[#FDB931] rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
