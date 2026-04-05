import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (menuItem, quantity = 1, notes = '') => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem.id)
      if (existing) {
        return prev.map(i =>
          i.menuItemId === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        notes,
        imageUrl: menuItem.imageUrl
      }]
    })
  }

  const removeItem = (menuItemId) => {
    setItems(prev => prev.filter(i => i.menuItemId !== menuItemId))
  }

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(menuItemId)
      return
    }
    setItems(prev =>
      prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i)
    )
  }

  const updateItemNotes = (menuItemId, notes) => {
    setItems(prev =>
      prev.map(i => i.menuItemId === menuItemId ? { ...i, notes } : i)
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity,
      updateItemNotes, clearCart, total, itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
