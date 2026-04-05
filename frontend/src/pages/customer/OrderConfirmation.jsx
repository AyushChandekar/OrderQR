import { useLocation, useNavigate } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // Fallback if someone hits this page directly
  if (!state?.orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No order found</p>
          <button onClick={() => navigate('/')} className="text-orange-500 font-semibold">Go Home</button>
        </div>
      </div>
    )
  }

  const { orderId, items, totalAmount, tableNumber, paymentId, createdAt } = state

  const generateReceipt = () => {
    const lines = [
      '================================',
      '        QR FOOD ORDER',
      '================================',
      '',
      `Order ID   : ${orderId}`,
      `Table      : ${tableNumber}`,
      `Date       : ${new Date(createdAt).toLocaleString('en-IN')}`,
      `Payment ID : ${paymentId || 'N/A'}`,
      '',
      '--------------------------------',
      'ITEMS',
      '--------------------------------',
      ...items.map(i =>
        `${i.menuItemName} x${i.quantity}    Rs.${(i.price * i.quantity).toFixed(0)}` +
        (i.notes ? `\n  Note: ${i.notes}` : '')
      ),
      '--------------------------------',
      `TOTAL              Rs.${totalAmount.toFixed(0)}`,
      '================================',
      '',
      'Payment Status: PAID',
      '',
      'Thank you for your order!',
      'Show this receipt to staff if needed.',
    ]
    return lines.join('\n')
  }

  const handleDownload = () => {
    const receipt = generateReceipt()
    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${orderId}-receipt.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Order ID: ${orderId}`).then(() => {
      // visual feedback handled via button text change
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Success Animation */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="text-gray-500 mt-1">Payment successful, your food is being prepared</p>
        </div>

        {/* Order ID Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden mb-4">
          <div className="bg-orange-500 px-6 py-4 text-center">
            <p className="text-orange-200 text-xs font-medium uppercase tracking-wider">Order ID</p>
            <p className="text-white text-3xl font-bold mt-1">{orderId}</p>
            <button onClick={handleCopy} className="mt-2 text-orange-200 text-xs hover:text-white transition underline">
              Tap to copy
            </button>
          </div>

          {/* Order Details */}
          <div className="p-5 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Table</span>
              <span className="font-semibold text-gray-700">{tableNumber}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Time</span>
              <span className="font-semibold text-gray-700">{new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {paymentId && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Payment ID</span>
                <span className="font-mono text-xs text-gray-600">{paymentId}</span>
              </div>
            )}

            <div className="border-t border-gray-100 pt-3 space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    <span className="text-gray-400 mr-1">{item.quantity}x</span>
                    {item.menuItemName}
                  </span>
                  <span className="text-gray-700 font-medium">&#8377;{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
              <span>Total Paid</span>
              <span className="text-green-600">&#8377;{totalAmount.toFixed(0)}</span>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Payment Verified</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold text-sm hover:border-orange-300 hover:text-orange-500 transition flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Receipt</span>
          </button>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-amber-700 text-sm font-medium">Remember your Order ID</p>
            <p className="text-amber-600 text-xs mt-1">Show <strong>{orderId}</strong> to staff if you need help with your order</p>
          </div>
        </div>
      </div>
    </div>
  )
}
