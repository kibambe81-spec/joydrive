import React, { useState } from 'react';
import { CreditCard, Banknote, Wallet, Plus, Trash2, Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaymentCard {
  id: string;
  lastFour: string;
  brand: string;
  expiryDate: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: string;
  type: 'ride' | 'refund' | 'topup';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export default function PaymentModal({ isOpen, onClose, theme }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'methods' | 'transactions' | 'topup'>('methods');
  const [cards, setCards] = useState<PaymentCard[]>([
    { id: '1', lastFour: '4242', brand: 'Visa', expiryDate: '12/25', isDefault: true },
    { id: '2', lastFour: '5555', brand: 'Mastercard', expiryDate: '08/26', isDefault: false }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2024-03-28', type: 'ride', amount: -150, description: 'Ride from Cape Town to Stellenbosch', status: 'completed' },
    { id: '2', date: '2024-03-27', type: 'ride', amount: -85, description: 'Ride from City Center to Airport', status: 'completed' },
    { id: '3', date: '2024-03-26', type: 'topup', amount: 500, description: 'Wallet Top-up', status: 'completed' },
    { id: '4', date: '2024-03-25', type: 'ride', amount: -120, description: 'Ride from Waterfront to Gardens', status: 'completed' }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(1245.50);

  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const handleAddCard = () => {
    if (newCard.cardNumber && newCard.cardHolder && newCard.expiryDate && newCard.cvv) {
      const lastFour = newCard.cardNumber.slice(-4);
      const brand = newCard.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';
      setCards([...cards, {
        id: Math.random().toString(),
        lastFour,
        brand,
        expiryDate: newCard.expiryDate,
        isDefault: false
      }]);
      setNewCard({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
      setShowAddCard(false);
    }
  };

  const handleTopup = () => {
    if (topupAmount) {
      const amount = parseFloat(topupAmount);
      setWalletBalance(walletBalance + amount);
      setTransactions([{
        id: Math.random().toString(),
        date: new Date().toISOString().split('T')[0],
        type: 'topup',
        amount,
        description: `Wallet Top-up (R${amount})`,
        status: 'completed'
      }, ...transactions]);
      setTopupAmount('');
    }
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={cn("rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto", theme === 'dark' ? "bg-slate-800" : "bg-white")}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-black")}>Payment & Wallet</h2>
          <button onClick={onClose} className={cn("text-2xl font-bold", theme === 'dark' ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black")}>✕</button>
        </div>

        {/* Wallet Balance */}
        <div className={cn("rounded-2xl p-6 mb-8 bg-gradient-to-r from-[#FDB931] to-[#f39c12] text-black")}>
          <p className="text-sm font-medium opacity-90">Wallet Balance</p>
          <p className="text-4xl font-bold mt-2">R {walletBalance.toFixed(2)}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          {[
            { id: 'methods', label: 'Payment Methods', icon: CreditCard },
            { id: 'transactions', label: 'Transactions', icon: Wallet },
            { id: 'topup', label: 'Top-up', icon: Plus }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-[#FDB931] text-[#FDB931]"
                  : theme === 'dark'
                  ? "border-transparent text-white/50 hover:text-white"
                  : "border-transparent text-black/50 hover:text-black"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-4">
            {cards.map(card => (
              <div key={card.id} className={cn("p-4 rounded-2xl border-2 flex items-center justify-between", theme === 'dark' ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5")}>
                <div className="flex items-center gap-4">
                  <CreditCard className={cn("w-6 h-6", card.brand === 'Visa' ? "text-blue-500" : "text-red-500")} />
                  <div>
                    <p className={cn("font-bold", theme === 'dark' ? "text-white" : "text-black")}>{card.brand} •••• {card.lastFour}</p>
                    <p className={cn("text-xs", theme === 'dark' ? "text-white/50" : "text-black/50")}>Expires {card.expiryDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {card.isDefault && <span className={cn("text-xs font-bold px-2 py-1 rounded-full", "bg-green-500/20 text-green-400")}>Default</span>}
                  <button onClick={() => handleSetDefault(card.id)} className={cn("p-2 rounded-lg transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCard(card.id)} className={cn("p-2 rounded-lg transition-colors text-red-500", theme === 'dark' ? "hover:bg-red-500/10" : "hover:bg-red-500/10")}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {!showAddCard ? (
              <button
                onClick={() => setShowAddCard(true)}
                className="w-full border-2 border-dashed border-[#FDB931] rounded-2xl p-4 text-[#FDB931] font-bold hover:bg-[#FDB931]/5 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Card
              </button>
            ) : (
              <div className={cn("p-6 rounded-2xl space-y-4", theme === 'dark' ? "bg-white/5" : "bg-black/5")}>
                <div>
                  <label className={cn("text-sm font-medium block mb-2", theme === 'dark' ? "text-white" : "text-black")}>Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={newCard.cardNumber}
                    onChange={e => setNewCard({...newCard, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                    className={cn("w-full p-3 rounded-lg border-2 focus:outline-none", theme === 'dark' ? "bg-white/10 border-white/20 text-white" : "bg-black/10 border-black/20 text-black")}
                  />
                </div>

                <div>
                  <label className={cn("text-sm font-medium block mb-2", theme === 'dark' ? "text-white" : "text-black")}>Card Holder</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newCard.cardHolder}
                    onChange={e => setNewCard({...newCard, cardHolder: e.target.value})}
                    className={cn("w-full p-3 rounded-lg border-2 focus:outline-none", theme === 'dark' ? "bg-white/10 border-white/20 text-white" : "bg-black/10 border-black/20 text-black")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn("text-sm font-medium block mb-2", theme === 'dark' ? "text-white" : "text-black")}>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={newCard.expiryDate}
                      onChange={e => setNewCard({...newCard, expiryDate: e.target.value})}
                      className={cn("w-full p-3 rounded-lg border-2 focus:outline-none", theme === 'dark' ? "bg-white/10 border-white/20 text-white" : "bg-black/10 border-black/20 text-black")}
                    />
                  </div>
                  <div>
                    <label className={cn("text-sm font-medium block mb-2", theme === 'dark' ? "text-white" : "text-black")}>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={newCard.cvv}
                      onChange={e => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                      className={cn("w-full p-3 rounded-lg border-2 focus:outline-none", theme === 'dark' ? "bg-white/10 border-white/20 text-white" : "bg-black/10 border-black/20 text-black")}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddCard(false)}
                    className={cn("flex-1 p-3 rounded-lg font-bold transition-colors", theme === 'dark' ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-black")}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCard}
                    className="flex-1 p-3 rounded-lg font-bold bg-[#FDB931] text-black hover:bg-[#f39c12] transition-colors"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className={cn("p-4 rounded-2xl flex items-center justify-between", theme === 'dark' ? "bg-white/5" : "bg-black/5")}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tx.type === 'ride' ? "bg-blue-500/20" : tx.type === 'topup' ? "bg-green-500/20" : "bg-red-500/20")}>
                    {tx.type === 'ride' && <CreditCard className="w-5 h-5 text-blue-500" />}
                    {tx.type === 'topup' && <Wallet className="w-5 h-5 text-green-500" />}
                    {tx.type === 'refund' && <Trash2 className="w-5 h-5 text-red-500" />}
                  </div>
                  <div>
                    <p className={cn("font-bold", theme === 'dark' ? "text-white" : "text-black")}>{tx.description}</p>
                    <p className={cn("text-xs", theme === 'dark' ? "text-white/50" : "text-black/50")}>{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-bold", tx.amount > 0 ? "text-green-500" : "text-white")}>{tx.amount > 0 ? '+' : ''}R {Math.abs(tx.amount).toFixed(2)}</p>
                  <p className={cn("text-xs", tx.status === 'completed' ? "text-green-500" : tx.status === 'pending' ? "text-yellow-500" : "text-red-500")}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top-up Tab */}
        {activeTab === 'topup' && (
          <div className="space-y-6">
            <div>
              <label className={cn("text-sm font-medium block mb-2", theme === 'dark' ? "text-white" : "text-black")}>Amount to Top-up</label>
              <div className="flex gap-2 mb-4">
                {[100, 200, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTopupAmount(amount.toString())}
                    className={cn("flex-1 p-3 rounded-lg font-bold transition-colors", topupAmount === amount.toString() ? "bg-[#FDB931] text-black" : theme === 'dark' ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/10 text-black hover:bg-black/20")}
                  >
                    R{amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Enter custom amount"
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                className={cn("w-full p-4 rounded-lg border-2 focus:outline-none text-lg", theme === 'dark' ? "bg-white/10 border-white/20 text-white" : "bg-black/10 border-black/20 text-black")}
              />
            </div>

            <div className={cn("p-4 rounded-2xl", theme === 'dark' ? "bg-white/5" : "bg-black/5")}>
              <p className={cn("text-sm opacity-70 mb-2", theme === 'dark' ? "text-white" : "text-black")}>Payment Method</p>
              <p className={cn("font-bold", theme === 'dark' ? "text-white" : "text-black")}>Visa •••• 4242</p>
            </div>

            <button
              onClick={handleTopup}
              disabled={!topupAmount}
              className="w-full bg-[#FDB931] text-black font-bold py-4 rounded-2xl hover:bg-[#f39c12] transition-colors disabled:opacity-50"
            >
              Top-up R {topupAmount || '0'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
