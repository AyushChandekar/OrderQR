import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../api/endpoints'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  PREPARING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
  SERVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  COMPLETED: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400' },
}

const NEXT_STATUS = { PENDING: 'PREPARING', PREPARING: 'SERVED', SERVED: 'COMPLETED' }

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{status}</span>
    </span>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    try {
      const { data } = await getOrders()
      setOrders(data)
    } catch { /* silent poll */ }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      toast.success(`Moved to ${status}`)
      fetchOrders()
    } catch {
      toast.error('Failed to update')
    }
  }

  const searched = search.trim()
    ? orders.filter(o => {
        const q = search.trim().toLowerCase()
        return o.orderId.toLowerCase().includes(q)
          || String(o.tableNumber).includes(q)
          || o.items.some(i => i.menuItemName.toLowerCase().includes(q))
      })
    : orders
  const filtered = filter === 'ALL' ? searched : searched.filter(o => o.status === filter)
  const counts = { ALL: searched.length }
  searched.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })

  return (
    <div>
      {/* Header + Search + Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Orders</h2>
            <p className="text-sm text-gray-400">Auto-refreshing every 5 seconds</p>
          </div>
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, table, item..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64 transition"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'PREPARING', 'SERVED', 'COMPLETED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition ${
                filter === s
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {s} {counts[s] ? `(${counts[s]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Order Header */}
              <div className="px-5 py-4 flex justify-between items-center border-b border-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">{order.tableNumber}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{order.orderId}</p>
                    <p className="text-xs text-gray-400">Table {order.tableNumber}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Items */}
              <div className="px-5 py-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-500">{item.quantity}</span>
                      <span className="text-gray-700">{item.menuItemName}</span>
                      {item.notes && <span className="text-xs text-gray-400 italic">({item.notes})</span>}
                    </div>
                    <span className="font-medium text-gray-600">&#8377;{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Special Instructions */}
              {order.notes && (
                <div className="px-5 py-2 bg-amber-50 border-t border-amber-100 flex items-start space-x-2">
                  <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <p className="text-xs text-amber-700">{order.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50/50 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  <span className="mx-1.5">|</span>
                  <span className="text-green-600 font-medium">{order.paymentStatus}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-gray-900">&#8377;{order.totalAmount.toFixed(0)}</span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, NEXT_STATUS[order.status])}
                      className="bg-orange-500 text-white px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-orange-600 transition shadow-sm"
                    >
                      {NEXT_STATUS[order.status]} &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
