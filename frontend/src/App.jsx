import { useState, useEffect } from 'react'
import axios from 'axios'

const API = '/products'

const CATEGORIES = ['Молочные', 'Мясо и рыба', 'Овощи и фрукты', 'Напитки', 'Готовая еда', 'Прочее']

function getStatus(expiryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  const diffDays = Math.round((expiry - today) / (1000 * 60 * 60 * 24))

  if (diffDays <= 1) return { label: diffDays <= 0 ? 'Истекло!' : 'Завтра', color: 'red', days: diffDays }
  if (diffDays <= 3) return { label: `${diffDays} дня`, color: 'yellow', days: diffDays }
  return { label: `${diffDays} дней`, color: 'green', days: diffDays }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [category, setCategory] = useState('')
  const [adding, setAdding] = useState(false)

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
      })
      setName('')
      setExpiry('')
      setCategory('')
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

  const counts = products.reduce((acc, p) => {
    const s = getStatus(p.expiry_date)
    acc[s.color] = (acc[s.color] || 0) + 1
    return acc
  }, {})

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
              placeholder="Название (напр. Молоко)"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="date"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              required
            />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Категория (опционально)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="add-btn" type="submit" disabled={adding || !name || !expiry}>
              {adding ? 'Добавляем...' : '+ Добавить'}
            </button>
          </div>
        </form>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat red">
          <div className="stat-label">Срочно</div>
          <div className="stat-value">{counts.red || 0}</div>
        </div>
        <div className="stat yellow">
          <div className="stat-label">Скоро истекает</div>
          <div className="stat-value">{counts.yellow || 0}</div>
        </div>
        <div className="stat green">
          <div className="stat-label">Всё в порядке</div>
          <div className="stat-value">{counts.green || 0}</div>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div className={`list-card ${loading ? 'loading' : ''}`}>
        <div className="list-header">
          <div>Продукт</div>
          <div>Срок годности</div>
          <div>Статус</div>
          <div></div>
        </div>

        {loading && <div className="empty">Загружаем...</div>}

        {!loading && products.length === 0 && (
          <div className="empty">Список пуст — добавьте первый продукт 👆</div>
        )}

        {!loading && products.map(product => {
          const status = getStatus(product.expiry_date)
          return (
            <div className="product-row" key={product.id}>
              <div>
                <div className="product-name">{product.name}</div>
                {product.category && <div className="product-cat">{product.category}</div>}
              </div>
              <div className="expiry-date">{formatDate(product.expiry_date)}</div>
              <div><span className={`badge ${status.color}`}>{status.label}</span></div>
              <div>
                <button className="delete-btn" onClick={() => handleDelete(product.id)} title="Удалить">
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
