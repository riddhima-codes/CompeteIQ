import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const TRACK_OPTIONS = ['pricing', 'features', 'blog', 'all']
const FREQ_OPTIONS = [
  { value: 6, label: 'Every 6 hours' },
  { value: 12, label: 'Every 12 hours' },
  { value: 24, label: 'Every 24 hours' },
]

export default function Competitors() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [competitors, setCompetitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showSignupNudge, setShowSignupNudge] = useState(false)
  const [analyzing, setAnalyzing] = useState(null)
  const [form, setForm] = useState({
    name: '', website_url: '',
    pages_to_monitor: '', monitor_frequency_hours: 24,
    track: ['all']
  })
  const [error, setError] = useState('')

  useEffect(() => { fetchCompetitors() }, [])

  const fetchCompetitors = async () => {
    try {
      const res = await api.get('/competitors/')
      setCompetitors(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!form.name || !form.website_url) {
      setError('Name and URL are required')
      return
    }
    setError('')
    try {
      await api.post('/competitors/', {
        ...form,
        pages_to_monitor: form.pages_to_monitor
          ? form.pages_to_monitor.split(',').map(s => s.trim()).filter(Boolean)
          : []
      })
      setForm({ name: '', website_url: '', pages_to_monitor: '', monitor_frequency_hours: 24, track: ['all'] })
      setShowAdd(false)
      await fetchCompetitors()

      // Show signup nudge after adding 2nd competitor if not logged in
      if (!user && competitors.length >= 1) {
        setShowSignupNudge(true)
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to add competitor')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this competitor?')) return
    await api.delete(`/competitors/${id}`)
    fetchCompetitors()
  }

  const handleAnalyze = async (id) => {
    setAnalyzing(id)
    try {
      await api.post(`/analysis/${id}/run`)
      alert('Analysis complete!')
      fetchCompetitors()
    } catch (e) {
      alert('Analysis failed')
    } finally {
      setAnalyzing(null)
    }
  }

  const toggleTrack = (t) => {
    setForm(prev => ({
      ...prev,
      track: prev.track.includes(t)
        ? prev.track.filter(x => x !== t)
        : [...prev.track.filter(x => x !== 'all'), t]
    }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-500 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Soft signup nudge popup */}
      {showSignupNudge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161b27] border border-blue-500/40 rounded-xl p-6 max-w-sm mx-4 text-center">
            <div className="text-white text-lg font-bold mb-2">Save your work 💾</div>
            <div className="text-slate-400 text-sm mb-4">
              Sign up to save your competitors, get email alerts, and access full reports. It's free!
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                Sign up free
              </button>
              <button
                onClick={() => setShowSignupNudge(false)}
                className="border border-[#252d3d] text-slate-400 hover:text-white text-sm rounded-lg px-4 py-2 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Competitors</h1>
          <p className="text-slate-500 text-sm mt-1">{competitors.length} being monitored</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="text-base leading-none">+</span> Add competitor
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#161b27] border border-blue-500/40 rounded-xl p-5 mb-5">
          <div className="text-white text-sm font-semibold mb-4">New competitor</div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-xs rounded-lg px-3 py-2 mb-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Company name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full bg-[#0f1117] border border-[#252d3d] rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Website URL</label>
              <input
                value={form.website_url}
                onChange={e => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://acme.com"
                className="w-full bg-[#0f1117] border border-[#252d3d] rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Specific pages <span className="text-slate-600">(comma separated, optional)</span>
              </label>
              <input
                value={form.pages_to_monitor}
                onChange={e => setForm({ ...form, pages_to_monitor: e.target.value })}
                placeholder="https://acme.com/pricing, https://acme.com/features"
                className="w-full bg-[#0f1117] border border-[#252d3d] rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Check frequency</label>
              <select
                value={form.monitor_frequency_hours}
                onChange={e => setForm({ ...form, monitor_frequency_hours: parseInt(e.target.value) })}
                className="w-full bg-[#0f1117] border border-[#252d3d] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {FREQ_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-slate-400 text-xs font-medium block mb-2">What to track</label>
            <div className="flex flex-wrap gap-2">
              {TRACK_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTrack(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    form.track.includes(t)
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-transparent border-[#252d3d] text-slate-500 hover:text-white'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              Start monitoring
            </button>
            <button
              onClick={() => { setShowAdd(false); setError('') }}
              className="border border-[#252d3d] text-slate-400 hover:text-white text-sm rounded-lg px-4 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {competitors.length === 0 ? (
        <div className="bg-[#161b27] border border-[#252d3d] rounded-xl p-12 text-center">
          <div className="text-slate-500 text-sm">No competitors added yet</div>
          <div className="text-slate-600 text-xs mt-1">Add a competitor to start monitoring</div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-[#161b27] border border-[#252d3d] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_120px] px-4 py-3 border-b border-[#252d3d] text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Competitor</span>
              <span>URL</span>
              <span>Frequency</span>
              <span>Status</span>
              <span></span>
            </div>
            {competitors.map((c, i) => (
              <div key={c.id} className={`grid grid-cols-[2fr_2fr_1fr_1fr_120px] px-4 py-4 items-center ${i < competitors.length - 1 ? 'border-b border-[#252d3d]' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1c2333] border border-[#252d3d] flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-semibold truncate">{c.name}</span>
                </div>
                <div className="text-slate-400 text-sm truncate pr-4">{c.website_url}</div>
                <div className="text-slate-400 text-sm">Every {c.monitor_frequency_hours}h</div>
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${c.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAnalyze(c.id)}
                    disabled={analyzing === c.id}
                    className="text-xs border border-[#252d3d] text-slate-400 hover:text-white hover:border-slate-500 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {analyzing === c.id ? '...' : 'Analyze'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors px-1"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {competitors.map(c => (
              <div key={c.id} className="bg-[#161b27] border border-[#252d3d] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#1c2333] border border-[#252d3d] flex items-center justify-center text-slate-400 text-sm font-bold shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{c.name}</div>
                      <div className="text-slate-500 text-xs truncate">{c.website_url}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded shrink-0 ${c.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Checks every {c.monitor_frequency_hours}h</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnalyze(c.id)}
                      disabled={analyzing === c.id}
                      className="text-xs border border-[#252d3d] text-slate-400 hover:text-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    >
                      {analyzing === c.id ? 'Running...' : 'Analyze now'}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-slate-600 hover:text-red-400 transition-colors px-1">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}