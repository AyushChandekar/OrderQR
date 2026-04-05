import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { createRazorpayOrder, verifyPayment } from '../../api/endpoints'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const { items, updateQuantity, updateItemNotes, clearCart, total, itemCount } = useCart()
  const [orderNotes, setOrderNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (items.length === 0) return
    setLoading(true)

    try {
      const orderPayload = {
        tableNumber: 0, // resolved by backend from tableId
        items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes })),
        notes: orderNotes
      }

      // tableId is the DB id of the table — passed in URL
      const { data: razorpayData } = await createRazorpayOrder(tableId, orderPayload)

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'QR Food Order',
        description: `Order - ${itemCount} item(s)`,
        order_id: razorpayData.orderId,
        handler: async function (response) {
          try {
            const verifyPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              tableNumber: 0,
              items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes })),
              notes: orderNotes
            }
            const { data: orderData } = await verifyPayment(tableId, verifyPayload)
            clearCart()
            navigate(`/order-confirmation`, {
              state: {
                orderId: orderData.orderId,
                items: orderData.items,
                totalAmount: orderData.totalAmount,
                tableNumber: orderData.tableNumber,
                paymentId: orderData.razorpayPaymentId,
                createdAt: orderData.createdAt
              }
            })
          } catch {
            toast.error('Payment verification failed. Contact restaurant staff.')
          }
        },
        theme: { color: '#F97316' },
        modal: {
          ondismiss: function () {
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      toast.error('Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center space-x-3">
          <button onClick={() => navigate(`/menu/${tableId}`)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
            <p className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 pb-44 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Your cart is empty</p>
            <button onClick={() => navigate(`/menu/${tableId}`)}
              className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition">
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {items.map(item => (
              <div key={item.menuItemId} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-orange-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                      <span className="font-bold text-gray-900 text-sm">&#8377;{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-gray-400">&#8377;{item.price.toFixed(0)} each</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 transition text-sm font-bold">&minus;</button>
                        <span className="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[32px] text-center bg-gray-50">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="px-3 py-1.5 text-orange-500 hover:bg-orange-50 transition text-sm font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
                <input type="text" placeholder="Add a note (e.g. no onions, extra spicy)"
                  value={item.notes} onChange={(e) => updateItemNotes(item.menuItemId, e.target.value)}
                  className="mt-3 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400" />
              </div>
            ))}

            {/* Order Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Special Instructions</span>
              </label>
              <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any allergies or special requests for the kitchen..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400" rows="2" />
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Bill Summary</h3>
              {items.map(item => (
                <div key={item.menuItemId} className="flex justify-between text-sm text-gray-600">
                  <span>{item.name} x {item.quantity}</span>
                  <span>&#8377;{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>&#8377;{total.toFixed(0)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Payment Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100">
          <div className="max-w-lg mx-auto p-4">
            <button onClick={handlePayment} disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-base flex justify-between items-center px-6 shadow-xl shadow-orange-200/50 hover:bg-orange-600 disabled:opacity-50 transition">
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{loading ? 'Processing...' : 'Pay Now'}</span>
              </span>
              <span className="text-lg">&#8377;{total.toFixed(0)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
