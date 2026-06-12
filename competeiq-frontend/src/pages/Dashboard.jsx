import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-[#161b27] border border-[#252d3d] rounded-xl p-5 flex-1 min-w-0">
      <div className="text-slate-500 text-xs font-medium mb-2">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${color || 'text-white'}`}>{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [competitors, setCompetitors] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [compRes, alertRes] = await Promise.all([
          api.get('/competitors/'),
          api.get('/notifications/')
        ])
        setCompetitors(compRes.data)
        setAlerts(alertRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const changes = alerts.length
  const active = competitors.filter(c => c.status === 'active').length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-500 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Your competitor monitoring summary</p>
      </div>

      {/* Stats */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <StatCard label="Competitors tracked" value={competitors.length} sub={`${active} active`} />
        <StatCard label="Changes detected" value={changes} sub="total alerts" color={changes > 0 ? 'text-yellow-400' : 'text-white'} />
        <StatCard label="Next check" value="6h" sub="scheduled" color="text-green-400" />
      </div>

      {/* Recent alerts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Recent changes</div>
          <Link to="/alerts" className="text-blue-400 text-xs hover:text-blue-300">View all</Link>
        </div>
        {alerts.length === 0 ? (
          <div className="bg-[#161b27] border border-[#252d3d] rounded-xl p-8 text-center">
            <div className="text-slate-500 text-sm">No changes detected yet</div>
            <div className="text-slate-600 text-xs mt-1">Changes will appear here after your competitors are analyzed</div>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="bg-[#161b27] border border-[#252d3d] border-l-2 border-l-blue-500 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="bg-blue-500/15 text-blue-400 text-xs font-semibold px-2 py-1 rounded shrink-0">
                    CHANGE
                  </span>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{alert.competitor_name}</div>
                    <div className="text-slate-400 text-sm mt-0.5 line-clamp-2">{alert.change_summary}</div>
                  </div>
                </div>
                <div className="text-slate-600 text-xs shrink-0">{new Date(alert.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competitors list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Competitors</div>
          <Link to="/competitors" className="text-blue-400 text-xs hover:text-blue-300">Manage</Link>
        </div>
        {competitors.length === 0 ? (
          <div className="bg-[#161b27] border border-[#252d3d] rounded-xl p-8 text-center">
            <div className="text-slate-500 text-sm">No competitors added yet</div>
            <Link to="/competitors" className="text-blue-400 text-xs mt-2 inline-block hover:text-blue-300">
              Add your first competitor →
            </Link>
          </div>
        ) : (
          <div className="bg-[#161b27] border border-[#252d3d] rounded-xl overflow-hidden">
            {competitors.map((c, i) => (
              <div key={c.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < competitors.length - 1 ? 'border-b border-[#252d3d]' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-[#1c2333] border border-[#252d3d] flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-slate-500 text-xs truncate">{c.website_url}</div>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}