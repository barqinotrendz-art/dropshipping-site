import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Order } from '../types/index'

const OrderDetail: React.FC = () => {
  const { id } = useParams()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [order, setOrder] = React.useState<Order | null>(null)

  React.useEffect(() => {
    async function fetchOrder() {
      if (!id) return
      try {
        const snap = await getDoc(doc(db, 'orders', id))
        if (!snap.exists()) {
          setError('Order not found')
        } else {
          setOrder({ id: snap.id, ...snap.data() } as Order)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) return <p>Loading order...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!order) return <p>Order not found.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-xl font-semibold">Items</h2>
          <ul className="space-y-2">
            {order.items?.map((i: any, idx: number) => (
              <li key={idx} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm opacity-70">Qty: {i.qty} • Rs {i.price?.toFixed?.(2) ?? i.price}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Summary</h2>
          <div className="border rounded p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs {order.totals?.subtotal?.toFixed?.(2) ?? order.totals?.subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Rs {order.totals?.shipping?.toFixed?.(2) ?? order.totals?.shipping ?? 0}</span></div>
            {order.totals?.discount && order.totals.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs {order.totals?.discount?.toFixed?.(2) ?? order.totals?.discount}</span></div>
            )}
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>Rs {order.totals?.grandTotal?.toFixed?.(2) ?? order.totals?.grandTotal}</span></div>
          </div>

          <h2 className="text-xl font-semibold">Status</h2>
          <div className="border rounded p-3 text-sm space-y-1">
            <div><strong>Current:</strong> {order.status}</div>
            <div className="space-y-2">
              {order.timeline?.map((t: any, idx: number) => (
                <div key={idx} className="opacity-80">
                  <div>• {t.status} {t.at?.toDate ? `at ${t.at.toDate().toLocaleString()}` : ''}</div>
                  {t.note && (
                    <div className="ml-4 text-xs italic text-gray-600 bg-gray-50 px-2 py-1 rounded mt-1">
                      Note: {t.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Link className="text-blue-600" to="/">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
