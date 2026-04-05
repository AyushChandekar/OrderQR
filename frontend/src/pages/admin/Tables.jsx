import { useState, useEffect } from 'react'
import { getTables, createTables } from '../../api/endpoints'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function Tables() {
  const [tables, setTables] = useState([])
  const [numTables, setNumTables] = useState('')

  const fetchTables = async () => {
    try {
      const { data } = await getTables()
      setTables(data)
    } catch {
      toast.error('Failed to load tables')
    }
  }

  useEffect(() => { fetchTables() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!numTables || numTables < 1) return
    try {
      await createTables({ numberOfTables: parseInt(numTables) })
      toast.success('Tables created!')
      setNumTables('')
      fetchTables()
    } catch {
      toast.error('Failed to create tables')
    }
  }

  const downloadQr = (tableDbId) => {
    const link = document.createElement('a')
    link.href = `${API_BASE}/api/qr/${tableDbId}`
    link.download = `table-${tableDbId}-qr.png`
    link.click()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tables & QR Codes</h2>
          <p className="text-sm text-gray-400">Print QR codes and place them on tables</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-col sm:flex-row items-end gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Tables</label>
          <input type="number" min="1" value={numTables} onChange={(e) => setNumTables(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g. 10" />
        </div>
        <button type="submit" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition shadow-sm whitespace-nowrap">
          Generate Tables
        </button>
      </form>

      {tables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No tables created yet</p>
          <p className="text-sm text-gray-400 mt-1">Enter the number above and click Generate</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg transition-shadow group">
              <div className="bg-orange-50 rounded-xl p-3 mb-3">
                <img
                  src={`${API_BASE}/api/qr/${table.id}`}
                  alt={`QR for Table ${table.tableNumber}`}
                  className="w-full aspect-square object-contain"
                />
              </div>
              <p className="font-bold text-gray-900 text-lg">Table {table.tableNumber}</p>
              <button onClick={() => downloadQr(table.id)}
                className="mt-2 w-full bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-semibold hover:bg-orange-500 hover:text-white transition group-hover:bg-orange-500 group-hover:text-white">
                Download QR
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
