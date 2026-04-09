import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API = `${API_BASE}/products`

const CATEGORIES = ['Молочные', 'Мясо и рыба', 'Овощи и фрукты', 'Напитки', 'Готовая еда', 'Прочее']

// today's date as YYYY-MM-DD for min attribute on date input
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getStatus(expiryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  const diffDays = Math.round((expiry - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)  return { label: 'Истекло', color: 'expired', days: diffDays }
  if (diffDays === 0) return { label: 'Сегодня!', color: 'today', days: diffDays }
  if (diffDays === 1) return { label: 'Завтра', color: 'urgent', days: diffDays }
  if (diffDays <= 3)  return { label: `${diffDays} дня`, color: 'urgent', days: diffDays }
  return { label: `${diffDays} дней`, color: 'ok', days: diffDays }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const FILTERS = [
  { key: 'all',     label: 'Все' },
  { key: 'expired', label: 'Истекло' },
  { key: 'urgent',  label: 'Срочно' },
  { key: 'ok',      label: 'В порядке' },
]

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // form
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  // filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')

  async function fetchProducts() {
    try {
      const res = await axios.get(API)
      setProducts(res.data)
      setError(null)
    } catch {
      setError('Не удалось загрузить продукты. Проверьте, запущен ли backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim() || !expiry) return
    setAdding(true)
    try {
      await axios.post(API, {
        name: name.trim(),
        expiry_date: expiry,
        category: category || null,
        quantity: quantity,
      })
      setName(''); setExpiry(''); setCategory(''); setQuantity(1)
      await fetchProducts()
    } catch {
      setError('Ошибка при добавлении продукта.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`${API}/${id}`)
      setProducts(products.filter(p => p.id !== id))
    } catch {
      setError('Ошибка при удалении.')
    }
  }

  async function handleQuantity(id, delta) {
    const product = products.find(p => p.id === id)
    if (!product) return
    const newQty = product.quantity + delta
    if (newQty < 1) return
    try {
      const res = await axios.patch(`${API}/${id}/quantity?quantity=${newQty}`)
      setProducts(products.map(p => p.id === id ? res.data : p))
    } catch {
      setError('Ошибка при изменении количества.')
    }
  }

  // counts — expired and urgent are separate
  const counts = products.reduce((acc, p) => {
    const s = getStatus(p.expiry_date)
    if (s.color === 'expired') acc.expired = (acc.expired || 0) + 1
    else if (s.color === 'today' || s.color === 'urgent') acc.urgent = (acc.urgent || 0) + 1
    else acc.ok = (acc.ok || 0) + 1
    return acc
  }, {})

  // unique categories from products
  const usedCategories = [...new Set(products.map(p => p.category).filter(Boolean))]

  // filtered list
  const filtered = products.filter(p => {
    const s = getStatus(p.expiry_date)
    if (statusFilter === 'expired' && s.color !== 'expired') return false
    if (statusFilter === 'urgent' && s.color !== 'today' && s.color !== 'urgent') return false
    if (statusFilter === 'ok' && s.color !== 'ok') return false
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="app">
      <h1>🥦 FridgeTracker</h1>
      <p className="subtitle">Следи за сроками годности продуктов</p>

      {error && <div className="error-msg">{error}</div>}

      {/* ADD FORM */}
      <div className="form-card">
        <h2>Добавить продукт</h2>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Название"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="date"
              value={expiry}
              min={todayStr()}
              onChange={e => setExpiry(e.target.value)}
              required
            />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Категория</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="qty-wrap">
              <button type="button" className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-val">{quantity}</span>
              <button type="button" className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <button className="add-btn" type="submit" disabled={adding || !name || !expiry}>
              {adding ? '...' : '+ Добавить'}
            </button>
          </div>
        </form>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat expired">
          <div className="stat-label">Истекло</div>
          <div className="stat-value">{counts.expired || 0}</div>
        </div>
        <div className="stat urgent">
          <div className="stat-label">Срочно (≤3 дня)</div>
          <div className="stat-value">{counts.urgent || 0}</div>
        </div>
        <div className="stat ok">
          <div className="stat-label">Всё в порядке</div>
          <div className="stat-value">{counts.ok || 0}</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-row">
        <div className="filter-group">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${statusFilter === f.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.key)}
            >{f.label}</button>
          ))}
        </div>
        <div className="filter-group">
          <select
            className="cat-filter"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">Все категории</option>
            {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="🔍 Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* PRODUCT LIST */}
      <div className={`list-card ${loading ? 'loading' : ''}`}>
        <div className="list-header">
          <div>Продукт</div>
          <div>Срок годности</div>
          <div>Количество</div>
          <div>Статус</div>
          <div></div>
        </div>

        {loading && <div className="empty">Загружаем...</div>}
        {!loading && filtered.length === 0 && (
          <div className="empty">{products.length === 0 ? 'Список пуст — добавьте первый продукт 👆' : 'Ничего не найдено'}</div>
        )}

        {!loading && filtered.map(product => {
          const status = getStatus(product.expiry_date)
          return (
            <div className={`product-row status-${status.color}`} key={product.id}>
              <div>
                <div className="product-name">{product.name}</div>
                {product.category && <div className="product-cat">{product.category}</div>}
              </div>
              <div className="expiry-date">{formatDate(product.expiry_date)}</div>
              <div className="qty-control">
                <button className="qty-btn-sm" onClick={() => handleQuantity(product.id, -1)}>−</button>
                <span className="qty-num">{product.quantity}</span>
                <button className="qty-btn-sm" onClick={() => handleQuantity(product.id, +1)}>+</button>
              </div>
              <div><span className={`badge ${status.color}`}>{status.label}</span></div>
              <div>
                <button className="delete-btn" onClick={() => handleDelete(product.id)}>×</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
