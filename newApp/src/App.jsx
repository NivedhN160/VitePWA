import { useState, useEffect } from 'react'
import './App.css'
import PWABadge from './PWABadge.jsx'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGameId, setSelectedGameId] = useState(null)
  const [gameDetail, setGameDetail] = useState(null)
  const [screenshots, setScreenshots] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  const API_KEY = '55edaa7c5c3242068bdff75f335324e9'

  useEffect(() => {
    fetchGames()
  }, [])

  useEffect(() => {
    if (selectedGameId) {
      fetchGameDetails(selectedGameId)
    } else {
      setGameDetail(null)
      setScreenshots([])
    }
  }, [selectedGameId])

  const fetchGames = async (query = '') => {
    setLoading(true)
    try {
      const url = query 
        ? `https://api.rawg.io/api/games?key=${API_KEY}&search=${query}&page_size=12`
        : `https://api.rawg.io/api/games?key=${API_KEY}&ordering=-rating&page_size=12&dates=2023-01-01,2025-12-31`
      
      const response = await fetch(url)
      const data = await response.json()
      setGames(data.results || [])
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGameDetails = async (id) => {
    setDetailLoading(true)
    try {
      // Fetch core details
      const detailRes = await fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`)
      const detailData = await detailRes.json()
      setGameDetail(detailData)

      // Fetch screenshots
      const shotRes = await fetch(`https://api.rawg.io/api/games/${id}/screenshots?key=${API_KEY}`)
      const shotData = await shotRes.json()
      setScreenshots(shotData.results || [])
      
      // Scroll to top of modal if needed (handled by CSS overflow)
    } catch (error) {
      console.error("Error fetching detail:", error)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      fetchGames(search)
    } else {
      fetchGames()
    }
  }

  const closeDetail = () => {
    setSelectedGameId(null)
    document.body.style.overflow = 'auto'
  }

  const openDetail = (id) => {
    setSelectedGameId(id)
    document.body.style.overflow = 'hidden'
  }

  return (
    <div className="container">
      <header className="fade-in">
        <h1 className="hero-title">GameSphere</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '300' }}>
          Explore the world of gaming data internally
        </p>
        
        <form onSubmit={handleSearch} className="search-box">
          <input 
            type="text" 
            placeholder="Search titles, genres, platforms..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </header>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="game-grid fade-in">
          {games.length > 0 ? (
            games.map(game => (
              <article key={game.id} className="card" onClick={() => openDetail(game.id)}>
                <div className="card-img-container">
                  <img 
                    src={game.background_image || 'https://via.placeholder.com/600x400?text=No+Image+Available'} 
                    alt={game.name} 
                    className="card-img" 
                  />
                  <div className="rating-badge">
                    <span>★</span>
                    <span>{game.rating || 'N/A'}</span>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title" title={game.name}>{game.name}</h3>
                  <div className="card-meta">
                    <span>{game.released ? new Date(game.released).getFullYear() : 'TBA'}</span>
                    <span>{game.platforms?.[0]?.platform?.name || 'Multi'}</span>
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                     <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      View Internally
                     </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem' }}>
              <h3>No games found for "{search}"</h3>
              <button onClick={() => {setSearch(''); fetchGames();}} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Internal Game Detail View */}
      {selectedGameId && (
        <div className="detail-overlay overlay-fade-in" onClick={closeDetail}>
          <div className="detail-container modal-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetail}>✕</button>
            
            {detailLoading ? (
              <div className="loading" style={{ minHeight: '600px' }}>
                <div className="spinner"></div>
              </div>
            ) : gameDetail && (
              <>
                <img src={gameDetail.background_image} alt={gameDetail.name} className="detail-banner" />
                <div className="detail-content">
                  <header className="detail-header" style={{ textAlign: 'left' }}>
                    <h2 className="detail-title">{gameDetail.name}</h2>
                    <div className="detail-stats">
                      <div className="stat-item">
                        <span className="stat-label">Released</span>
                        <span className="stat-value">{gameDetail.released || 'TBA'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">★ {gameDetail.rating} / 5</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Playtime</span>
                        <span className="stat-value">{gameDetail.playtime} Hours</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Developers</span>
                        <span className="stat-value">{gameDetail.developers?.map(d => d.name).join(', ') || 'N/A'}</span>
                      </div>
                    </div>
                  </header>

                  <div className="description">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>About</h3>
                    <div dangerouslySetInnerHTML={{ __html: gameDetail.description }} />
                  </div>

                  <div className="screenshot-section">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Screenshots</h3>
                    <div className="screenshot-grid">
                      {screenshots.slice(0, 4).map((shot, idx) => (
                        <div key={idx} className="screenshot-item">
                          <img src={shot.image} alt="screenshot" className="screenshot-img" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                     <button className="btn btn-primary" onClick={closeDetail}>Return to Gallery</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <PWABadge />
    </div>
  )
}

export default App
