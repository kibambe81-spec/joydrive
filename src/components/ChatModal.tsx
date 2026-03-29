import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Phone, PhoneOff, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase, sendMessage, subscribeToMessages, initiateCall, subscribeToCalls } from '../lib/supabase';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatModalProps {
  theme: string;
  rideId: string;
  currentUserId: string;
  driverInfo: { name: string; phone: string; photo?: string };
  onClose: () => void;
  t: (key: string) => string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  theme,
  rideId,
  currentUserId,
  driverInfo,
  onClose,
  t,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();

    // Subscribe to new messages
    const channel = subscribeToMessages(rideId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Subscribe to call updates
    const callChannel = subscribeToCalls(rideId, (call) => {
      if (call.status === 'accepted') setCallStatus('connected');
      if (call.status === 'ended' || call.status === 'rejected') {
        setCallStatus('ended');
        setTimeout(() => setCallStatus('idle'), 2000);
      }
    });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(callChannel);
    };
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    // Use a placeholder driver ID for demo
    const driverPlaceholderId = 'driver-' + rideId;
    await sendMessage(rideId, currentUserId, driverPlaceholderId, newMessage.trim());
    // Optimistically add message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_id: currentUserId,
        created_at: new Date().toISOString(),
      },
    ]);
    setNewMessage('');
  };

  const handleCall = async () => {
    if (callStatus !== 'idle') return;
    setCallStatus('calling');
    const driverPlaceholderId = 'driver-' + rideId;
    const call = await initiateCall(rideId, currentUserId, driverPlaceholderId);
    if (call && (call as any)[0]?.id) {
      setActiveCallId((call as any)[0].id);
    }
    // Simulate call connection after 3 seconds
    setTimeout(() => {
      setCallStatus('connected');
      // Speak announcement
      const utterance = new SpeechSynthesisUtterance('Appel connecté avec votre chauffeur.');
      utterance.lang = 'fr-FR';
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith('fr') &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('femme') ||
            v.name.toLowerCase().includes('amélie') ||
            v.name.toLowerCase().includes('thomas') === false)
      ) || voices.find((v) => v.lang.startsWith('fr'));
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }, 3000);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => setCallStatus('idle'), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={cn(
        'fixed inset-0 z-[150] flex flex-col',
        theme === 'dark' ? 'bg-black/95 text-white' : 'bg-white/95 text-black'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4 border-b',
          theme === 'dark' ? 'border-white/10' : 'border-black/10'
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src={driverInfo.photo || 'https://picsum.photos/seed/driver/100/100'}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#FDB931]"
            alt={driverInfo.name}
          />
          <div>
            <p className="font-bold text-sm">{driverInfo.name}</p>
            <p className="text-xs opacity-50">
              {callStatus === 'calling'
                ? 'Appel en cours...'
                : callStatus === 'connected'
                ? 'En communication'
                : callStatus === 'ended'
                ? 'Appel terminé'
                : 'En ligne'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {callStatus === 'idle' ? (
            <button
              onClick={handleCall}
              className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>
          ) : callStatus === 'calling' || callStatus === 'connected' ? (
            <button
              onClick={handleEndCall}
              className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Call Status Banner */}
      <AnimatePresence>
        {callStatus !== 'idle' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              'px-4 py-3 text-center text-sm font-bold',
              callStatus === 'calling' && 'bg-yellow-500/20 text-yellow-400',
              callStatus === 'connected' && 'bg-green-500/20 text-green-400',
              callStatus === 'ended' && 'bg-red-500/20 text-red-400'
            )}
          >
            {callStatus === 'calling' && '📞 Appel en cours avec ' + driverInfo.name + '...'}
            {callStatus === 'connected' && '✅ En communication avec ' + driverInfo.name}
            {callStatus === 'ended' && '📵 Appel terminé'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center opacity-40 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Commencez la conversation avec votre chauffeur</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[75%] px-4 py-2 rounded-2xl text-sm',
                msg.sender_id === currentUserId
                  ? 'bg-[#FDB931] text-black rounded-br-sm'
                  : theme === 'dark'
                  ? 'bg-white/10 text-white rounded-bl-sm'
                  : 'bg-black/10 text-black rounded-bl-sm'
              )}
            >
              {msg.content}
              <p className="text-[10px] opacity-50 mt-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {["Je suis prêt", "J'arrive dans 2 min", "Où êtes-vous ?", "OK merci"].map((reply) => (
          <button
            key={reply}
            onClick={() => setNewMessage(reply)}
            className={cn(
              'whitespace-nowrap text-xs px-3 py-2 rounded-full border',
              theme === 'dark' ? 'border-white/20 hover:bg-white/10' : 'border-black/20 hover:bg-black/5'
            )}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 border-t',
          theme === 'dark' ? 'border-white/10' : 'border-black/10'
        )}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Écrire un message..."
          className={cn(
            'flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none',
            theme === 'dark' ? 'bg-white/10 text-white placeholder:text-white/40' : 'bg-black/5 text-black placeholder:text-black/40'
          )}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="w-12 h-12 bg-[#FDB931] rounded-full flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-5 h-5 text-black" />
        </button>
      </div>
    </motion.div>
  );
};
