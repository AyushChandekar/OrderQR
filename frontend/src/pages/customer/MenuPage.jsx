import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTableInfo, getPublicSections } from '../../api/endpoints'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function MenuPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const { items: cartItems, addItem, updateQuantity, itemCount, total } = useCart()
  const [sections, setSections] = useState([])
  const [tableInfo, setTableInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(null)
  const sectionRefs = useRef({})

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Step 1: fetch table info (gives us adminId + restaurant name)
        const { data: table } = await getTableInfo(tableId)
        setTableInfo(table)

        // Step 2: fetch that restaurant's menu
        const { data: secs } = await getPublicSections(table.adminId)
        setSections(secs)
        if (secs.length > 0) setActiveSection(secs[0].id)
      } catch {
        toast.error('Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [tableId])

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getCartQty = (menuItemId) => {
    const item = cartItems.find(i => i.menuItemId === menuItemId)
    return item ? item.quantity : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{tableInfo?.restaurantName || 'Menu'}</h1>
            <div className="flex items-center space-x-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Table {tableInfo?.tableNumber}</span>
            </div>
          </div>
          {itemCount > 0 && (
            <button
              onClick={() => navigate(`/cart/${tableId}`)}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-orange-200 hover:bg-orange-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>{itemCount}</span>
              <span className="font-normal">|</span>
              <span>&#8377;{total.toFixed(0)}</span>
            </button>
          )}
        </div>

        {/* Section Tabs */}
        {sections.length > 1 && (
          <div className="border-t border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="max-w-lg mx-auto px-4 flex space-x-1 py-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    activeSection === section.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Menu Content */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-28 space-y-6">
        {sections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No items available right now</p>
          </div>
        ) : (
          sections.map(section => (
            <div key={section.id} ref={el => sectionRefs.current[section.id] = el} className="scroll-mt-28">
              <div className="mb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <span>{section.name}</span>
                  <span className="text-xs text-gray-400 font-normal">({section.items.length})</span>
                </h2>
                {section.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
                )}
              </div>

              <div className="space-y-3">
                {section.items.map(item => {
                  const qty = getCartQty(item.id)
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                        )}
                        <p className="font-bold text-orange-500 mt-2">&#8377;{item.price.toFixed(0)}</p>
                      </div>

                      <div className="flex flex-col items-center shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-24 h-20 rounded-xl object-cover" />
                        ) : (
                          <div className="w-24 h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-orange-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                            </svg>
                          </div>
                        )}

                        {qty === 0 ? (
                          <button
                            onClick={() => { addItem(item); toast.success(`Added ${item.name}`, { icon: '+', duration: 1000 }) }}
                            className="mt-[-12px] bg-white border-2 border-orange-500 text-orange-500 px-5 py-1 rounded-lg text-xs font-bold hover:bg-orange-500 hover:text-white transition shadow-sm"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="mt-[-12px] bg-orange-500 text-white rounded-lg flex items-center shadow-sm">
                            <button onClick={() => updateQuantity(item.id, qty - 1)}
                              className="px-2.5 py-1 text-sm font-bold hover:bg-orange-600 rounded-l-lg transition">&minus;</button>
                            <span className="px-2 text-xs font-bold min-w-[20px] text-center">{qty}</span>
                            <button onClick={() => addItem(item)}
                              className="px-2.5 py-1 text-sm font-bold hover:bg-orange-600 rounded-r-lg transition">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="max-w-lg mx-auto px-4 pb-4">
            <button
              onClick={() => navigate(`/cart/${tableId}`)}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-semibold text-sm flex justify-between items-center px-6 shadow-xl shadow-orange-200/50 hover:bg-orange-600 transition"
            >
              <span className="flex items-center space-x-2">
                <span className="bg-orange-600 px-2 py-0.5 rounded-md text-xs">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>View Cart</span>
                <span>&#8377;{total.toFixed(0)}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
