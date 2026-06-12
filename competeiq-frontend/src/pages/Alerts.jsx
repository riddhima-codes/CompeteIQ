import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications/').then(res => {
      setAlerts(res.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-500 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Alerts</h1>
        <p className="text-slate-500 text-sm mt-1">{alerts.length} total changes detected</p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-[#161b27] border border-[#252d3d] rounded-xl p-12 text-center">
          <div className="text-slate-500 text-sm">No changes detected yet</div>
          <div className="text-slate-600 text-xs mt-1">
            Alerts appear here when a competitor's website changes significantly
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="bg-[#161b27] border border-[#252d3d] border-l-2 border-l-blue-500 rounded-xl p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <span className="text-white text-sm font-semibold">{alert.competitor_name}</span>
                    <span className="bg-yellow-400/15 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded">
                      Changed
                    </span>
                  </div>
                  {alert.change_summary && (
                    <p className="text-slate-400 text-sm leading-relaxed">{alert.change_summary}</p>
                  )}
                  {alert.analysis_summary && (
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2">{alert.analysis_summary}</p>
                  )}
                </div>
                <div className="text-slate-600 text-xs shrink-0">
                  {new Date(alert.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}