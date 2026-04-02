import React, { useState, useEffect } from 'react'
import { usePaymentSettings, useUpdatePaymentSettings, type Wallet } from '../../hooks/usePaymentSettings'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { CreditCard, Save, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PaymentSettingsAdmin: React.FC = () => {
  const { data: settings, isLoading } = usePaymentSettings()
  const updateSettings = useUpdatePaymentSettings()

  const [formData, setFormData] = useState({
    accountName: '',
    whatsappNumber: '',
    wallets: [] as Wallet[],
    bankName: '',
    accountNumber: '',
    iban: '',
    instructionsEnglish: '',
    instructionsUrdu: ''
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        accountName: settings.accountName || '',
        whatsappNumber: settings.whatsappNumber || '',
        wallets: settings.wallets || [],
        bankName: settings.bankName || '',
        accountNumber: settings.accountNumber || '',
        iban: settings.iban || '',
        instructionsEnglish: settings.instructionsEnglish || '',
        instructionsUrdu: settings.instructionsUrdu || ''
      })
    }
  }, [settings])

  const addWallet = () => {
    const newWallet: Wallet = {
      id: Date.now().toString(),
      name: '',
      number: '',
      wallet_name : ''
    }
    setFormData({ ...formData, wallets: [...formData.wallets, newWallet] })
  }

  const removeWallet = (id: string) => {
    setFormData({ ...formData, wallets: formData.wallets.filter(w => w.id !== id) })
  }

  const updateWallet = (id: string, field: 'wallet_name' | 'name' | 'number', value: string) => {
    setFormData({
      ...formData,
      wallets: formData.wallets.map(w => w.id === id ? { ...w, [field]: value } : w)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateSettings.mutateAsync(formData)
      toast.success('Payment settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update payment settings')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Payment Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">WhatsApp Number (for screenshots)</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g., 03361076840"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Wallets */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Payment Wallets</h2>
            <Button
              type="button"
              variant="outline"
              onClick={addWallet}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Wallet
            </Button>
          </div>
          
          {formData.wallets.length === 0 ? (
            <p className="text-gray-500 text-sm">No wallets added. Click "Add Wallet" to add payment methods like JazzCash, Easypaisa, SadaPay, etc.</p>
          ) : (
            <div className="space-y-3">
              {formData.wallets.map((wallet) => (
                <div key={wallet.id} className="flex gap-3 items-start p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Wallet Name</label>
                      <input
                        type="text"
                        value={wallet.name}
                        onChange={(e) => updateWallet(wallet.id, 'name', e.target.value)}
                        placeholder="e.g., JazzCash, Easypaisa, SadaPay"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Wallet Number</label>
                      <input
                        type="text"
                        value={wallet.number}
                        onChange={(e) => updateWallet(wallet.id, 'number', e.target.value)}
                        placeholder="e.g., 03176004098"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                       <div>
                      <label className="block text-xs font-medium mb-1">Wallet Name</label>
                      <input
                        type="text"
                        value={wallet.wallet_name || ''}
                        onChange={(e) => updateWallet(wallet.id, 'wallet_name', e.target.value)}
                        placeholder="shehzad"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWallet(wallet.id)}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Name</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="e.g., Danial Nadeem"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., Albarka"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="e.g., 0108627608023"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">IBAN</label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                placeholder="e.g., PK07AIIN0000108627608023"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Custom Instructions (Optional)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Additional Instructions (English)</label>
              <textarea
                value={formData.instructionsEnglish}
                onChange={(e) => setFormData({ ...formData, instructionsEnglish: e.target.value })}
                placeholder="Any additional payment instructions in English..."
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Instructions (Urdu)</label>
              <textarea
                value={formData.instructionsUrdu}
                onChange={(e) => setFormData({ ...formData, instructionsUrdu: e.target.value })}
                placeholder="اردو میں اضافی ہدایات..."
                rows={3}
                className="w-full border rounded px-3 py-2"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={updateSettings.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Payment Settings
        </Button>
      </form>

      {/* Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Preview</h3>
        <p className="text-sm text-blue-800">
          These settings will be displayed to customers during checkout for shipping payment instructions.
        </p>
      </div>
    </div>
  )
}

export default PaymentSettingsAdmin
