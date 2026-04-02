import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Wallet = {
  id: string
  name: string // e.g., "Jazzcash", "Easypaisa", "SadaPay"
  number: string // e.g., "03176004098"
  wallet_name : string // e.g., "John Doe"
}

export type PaymentSettings = {
  accountName?: string
  whatsappNumber?: string
  wallets?: Wallet[] // Array of wallets
  bankName?: string
  accountNumber?: string
  iban?: string
  instructionsEnglish?: string
  instructionsUrdu?: string
}

async function fetchPaymentSettings(): Promise<PaymentSettings> {
  const paymentDocRef = doc(db, 'settings', 'payment')
  const walletsDocRef = doc(db, 'settings', 'wallets')

  const [paymentSnap, walletsSnap] = await Promise.all([
    getDoc(paymentDocRef),
    getDoc(walletsDocRef)
  ])

  type PaymentDocData = Omit<PaymentSettings, 'wallets'>
  type WalletDocData = { wallets?: Wallet[] }

  const paymentData = paymentSnap.exists() ? (paymentSnap.data() as PaymentDocData) : {}
  const walletData = walletsSnap.exists() ? (walletsSnap.data() as WalletDocData) : {}

  return {
    ...paymentData,
    wallets: walletData.wallets || []
  }
}

export function usePaymentSettings() {
  return useQuery({ 
    queryKey: ['payment-settings'], 
    queryFn: fetchPaymentSettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdatePaymentSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settings: PaymentSettings) => {
      const paymentDocRef = doc(db, 'settings', 'payment')
      const walletsDocRef = doc(db, 'settings', 'wallets')

      const { wallets = [], ...paymentDetails } = settings

      const batch = writeBatch(db)
      batch.set(paymentDocRef, paymentDetails, { merge: true })
      batch.set(walletsDocRef, { wallets })

      await batch.commit()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-settings'] })
    }
  })
}
