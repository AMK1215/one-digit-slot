import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import BASE_URL from '../hooks/baseUrl';

function Wallet() {
  const { user } = useAuth();
  const [tab, setTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [form, setForm] = useState({
    amount: '',
    reference: '',
    image: null
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch payment types on component mount
  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  // Fetch banks when payment type changes
  useEffect(() => {
    if (selectedPaymentType) {
      fetchBanks();
    }
  }, [selectedPaymentType]);

  const fetchPaymentTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/paymentTypefinicial`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentTypes(data.data || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to load payment types' });
      }
    } catch (error) {
      console.error('Error fetching payment types:', error);
      setMessage({ type: 'error', text: 'Network error loading payment types' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/banks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBanks(data.data || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to load banks' });
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      setMessage({ type: 'error', text: 'Network error loading banks' });
    } finally {
      setLoading(false);
    }
  };

  const handleTab = (t) => {
    setTab(t);
    setForm({ amount: '', reference: '', image: null });
    setSelectedPaymentType(null);
    setSelectedBank(null);
    setMessage({ type: '', text: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPaymentType) {
      setMessage({ type: 'error', text: 'Please select a payment type' });
      return;
    }

    if (!selectedBank) {
      setMessage({ type: 'error', text: 'Please select a bank' });
      return;
    }

    if (!form.amount || form.amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('payment_type_id', selectedPaymentType.id);
      formData.append('bank_id', selectedBank.id);
      formData.append('amount', form.amount);
      formData.append('reference', form.reference);
      if (form.image) {
        formData.append('image', form.image);
      }

      const response = await fetch(`${BASE_URL}/depositfinicial`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Deposit request submitted successfully!' });
        setForm({ amount: '', reference: '', image: null });
        setSelectedPaymentType(null);
        setSelectedBank(null);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to submit deposit request' });
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
      setMessage({ type: 'error', text: 'Network error submitting deposit request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="flex flex-col items-center justify-center px-4 py-12 min-h-[calc(100vh-64px)]">
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Wallet</h2>
          
          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => handleTab('deposit')} 
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                tab === 'deposit' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-yellow-400/30'
              }`}
            >
              Deposit
            </button>
            <button 
              onClick={() => handleTab('withdraw')} 
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                tab === 'withdraw' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-pink-500/30'
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-center font-semibold ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {message.text}
            </div>
          )}

          {tab === 'deposit' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Type Selection */}
              <div>
                <label className="block text-white font-semibold mb-3">Select Payment Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {paymentTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedPaymentType(type)}
                      className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${
                        selectedPaymentType?.id === type.id
                          ? 'border-yellow-400 bg-yellow-400/10 shadow-lg'
                          : 'border-white/20 bg-white/5 hover:border-yellow-400/50'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-2">
                          <span className="text-black font-bold text-lg">💰</span>
                        </div>
                        <span className="text-white font-medium text-sm">{type.name || 'Payment Type'}</span>
                      </div>
                      {selectedPaymentType?.id === type.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Selection */}
              {selectedPaymentType && (
                <div>
                  <label className="block text-white font-semibold mb-3">Select Bank</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {banks.map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => setSelectedBank(bank)}
                        className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${
                          selectedBank?.id === bank.id
                            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg'
                            : 'border-white/20 bg-white/5 hover:border-yellow-400/50'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-white font-bold text-lg">🏦</span>
                          </div>
                          <span className="text-white font-medium text-sm">{bank.name || 'Bank'}</span>
                        </div>
                        {selectedBank?.id === bank.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-black text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-white font-semibold mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-white/20"
                    required
                    min="1"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    MMK
                  </div>
                </div>
              </div>

              {/* Reference Input */}
              <div>
                <label className="block text-white font-semibold mb-2">Reference (Optional)</label>
                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  placeholder="Enter reference number"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-white/20"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-white font-semibold mb-2">Receipt Image (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300"
                  >
                    <span className="mr-2">📷</span>
                    {form.image ? form.image.name : 'Choose image file'}
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 text-sm text-gray-400">
                    Selected: {form.image.name}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold py-4 rounded-lg shadow-lg hover:from-yellow-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Submit Deposit Request'
                )}
              </button>
            </form>
          ) : (
            /* Withdraw Tab - Placeholder */
            <div className="text-center text-white py-8">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-xl font-semibold mb-2">Withdraw Feature</h3>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet; 