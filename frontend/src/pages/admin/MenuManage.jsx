import { useState, useEffect } from 'react'
import { getSections, createSection, updateSection, deleteSection, createMenuItem, updateMenuItem, deleteMenuItem } from '../../api/endpoints'
import toast from 'react-hot-toast'

const emptyItem = { name: '', description: '', price: '', imageUrl: '', available: true, sectionId: null }
const emptySection = { name: '', description: '', displayOrder: '' }

export default function MenuManage() {
  const [sections, setSections] = useState([])
  const [expandedSection, setExpandedSection] = useState(null)

  // Section form
  const [sectionForm, setSectionForm] = useState(emptySection)
  const [editingSectionId, setEditingSectionId] = useState(null)
  const [showSectionForm, setShowSectionForm] = useState(false)

  // Item form
  const [itemForm, setItemForm] = useState(emptyItem)
  const [editingItemId, setEditingItemId] = useState(null)
  const [showItemForm, setShowItemForm] = useState(null) // sectionId or null

  const fetchSections = async () => {
    try {
      const { data } = await getSections()
      setSections(data)
    } catch {
      toast.error('Failed to load menu')
    }
  }

  useEffect(() => { fetchSections() }, [])

  // ---- Section handlers ----
  const handleSectionSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...sectionForm, displayOrder: sectionForm.displayOrder ? parseInt(sectionForm.displayOrder) : 0 }
    try {
      if (editingSectionId) {
        await updateSection(editingSectionId, payload)
        toast.success('Section updated')
      } else {
        await createSection(payload)
        toast.success('Section created')
      }
      setSectionForm(emptySection)
      setEditingSectionId(null)
      setShowSectionForm(false)
      fetchSections()
    } catch {
      toast.error('Failed to save section')
    }
  }

  const handleDeleteSection = async (id) => {
    if (!confirm('Delete this section? Items inside will be unlinked.')) return
    try {
      await deleteSection(id)
      toast.success('Section deleted')
      fetchSections()
    } catch {
      toast.error('Failed to delete section')
    }
  }

  // ---- Item handlers ----
  const handleItemSubmit = async (e, sectionId) => {
    e.preventDefault()
    const payload = { ...itemForm, price: parseFloat(itemForm.price), sectionId }
    try {
      if (editingItemId) {
        await updateMenuItem(editingItemId, payload)
        toast.success('Item updated')
      } else {
        await createMenuItem(payload)
        toast.success('Item added')
      }
      setItemForm(emptyItem)
      setEditingItemId(null)
      setShowItemForm(null)
      fetchSections()
    } catch {
      toast.error('Failed to save item')
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this item?')) return
    try {
      await deleteMenuItem(id)
      toast.success('Item deleted')
      fetchSections()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const startEditItem = (item, sectionId) => {
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      imageUrl: item.imageUrl || '',
      available: item.available,
      sectionId
    })
    setEditingItemId(item.id)
    setShowItemForm(sectionId)
    setExpandedSection(sectionId)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-sm text-gray-400">Organize your menu with sections</p>
        </div>
        <button
          onClick={() => { setShowSectionForm(!showSectionForm); setSectionForm(emptySection); setEditingSectionId(null) }}
          className="bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 text-sm font-semibold transition shadow-sm flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{showSectionForm ? 'Cancel' : 'Add Section'}</span>
        </button>
      </div>

      {/* Section Form */}
      {showSectionForm && (
        <form onSubmit={handleSectionSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-gray-800">{editingSectionId ? 'Edit Section' : 'New Section'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Section name (e.g. Starters)" value={sectionForm.name}
              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" required />
            <input type="text" placeholder="Description (optional)" value={sectionForm.description}
              onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <input type="number" placeholder="Display order (0, 1, 2...)" value={sectionForm.displayOrder}
              onChange={(e) => setSectionForm({ ...sectionForm, displayOrder: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <button type="submit" className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
            {editingSectionId ? 'Update Section' : 'Create Section'}
          </button>
        </form>
      )}

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No sections yet</p>
          <p className="text-sm text-gray-400 mt-1">Create a section like "Starters", "Main Course", etc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(section => {
            const isExpanded = expandedSection === section.id
            return (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Section Header */}
                <div
                  className="px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50/50 transition"
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                >
                  <div className="flex items-center space-x-3">
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div>
                      <h3 className="font-bold text-gray-900">{section.name}</h3>
                      {section.description && <p className="text-xs text-gray-400">{section.description}</p>}
                    </div>
                    <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {section.items.length} items
                    </span>
                  </div>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => {
                      setSectionForm({ name: section.name, description: section.description || '', displayOrder: section.displayOrder?.toString() || '' })
                      setEditingSectionId(section.id)
                      setShowSectionForm(true)
                    }} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <button onClick={() => {
                      setShowItemForm(showItemForm === section.id ? null : section.id)
                      setItemForm(emptyItem)
                      setEditingItemId(null)
                      setExpandedSection(section.id)
                    }} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
                      + Item
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-50">
                    {/* Add/Edit Item Form */}
                    {showItemForm === section.id && (
                      <form onSubmit={(e) => handleItemSubmit(e, section.id)} className="px-5 py-4 bg-orange-50/30 border-b border-gray-100 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">{editingItemId ? 'Edit Item' : 'Add Item'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Item name" value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                          <input type="number" step="0.01" min="0" placeholder="Price (&#8377;)" value={itemForm.price}
                            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                        </div>
                        <input type="text" placeholder="Description (optional)" value={itemForm.description}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <input type="url" placeholder="Image URL (optional)" value={itemForm.imageUrl}
                              onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64" />
                            <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                              <input type="checkbox" checked={itemForm.available}
                                onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                              <span>Available</span>
                            </label>
                          </div>
                          <div className="flex space-x-2">
                            <button type="button" onClick={() => { setShowItemForm(null); setEditingItemId(null); setItemForm(emptyItem) }}
                              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                            <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition">
                              {editingItemId ? 'Update' : 'Add Item'}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Items List */}
                    {section.items.length === 0 ? (
                      <p className="px-5 py-6 text-center text-sm text-gray-400">No items in this section</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {section.items.map(item => (
                          <div key={item.id} className={`px-5 py-3 flex items-center justify-between ${!item.available ? 'opacity-40' : ''}`}>
                            <div className="flex items-center space-x-3 flex-1">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-bold text-orange-500">&#8377;{item.price.toFixed(0)}</span>
                              <button onClick={() => startEditItem(item, section.id)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
