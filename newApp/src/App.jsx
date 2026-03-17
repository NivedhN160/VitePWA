import { useState, useEffect } from 'react'
import './App.css'
import PWABadge from './PWABadge.jsx'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const API_KEY = '55edaa7c5c3242068bdff75f335324e9'

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async (query = '') => {
    setLoading(true)
    try {
      // ordering=-rating gives us the top rated games first
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

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      fetchGames(search)
    } else {
      fetchGames()
    }
  }

  return (
    <div className="container">
      <header className="fade-in">
        <h1 className="hero-title">GameSphere</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '300' }}>
          Your portal to the world of video games
        </p>
        
        <form onSubmit={handleSearch} className="search-box">
          <input 
            type="text" 
            placeholder="Search titles, genres, or platforms..." 
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
              <article key={game.id} className="card">
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
                     <a 
                      href={`https://rawg.io/games/${game.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary" 
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Explore Details
                     </a>
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
      
      <PWABadge />
    </div>
  )
}

export default App
