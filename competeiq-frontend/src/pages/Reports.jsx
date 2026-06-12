import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/').then(res => {
      setReports(res.data)
      if (res.data.length > 0) setSelected(res.data[0])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-500 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Full analysis history</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-[#161b27] border border-[#252d3d] rounded-xl p-12 text-center">
          <div className="text-slate-500 text-sm">No reports yet</div>
          <div className="text-slate-600 text-xs mt-1">Run an analysis on a competitor to generate your first report</div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* List */}
          <div className="lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {reports.map(r => (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className={`shrink-0 lg:shrink cursor-pointer rounded-xl p-3.5 border transition-colors min-w-48 lg:min-w-0 ${
                  selected?.id === r.id
                    ? 'bg-blue-500/10 border-blue-500/40'
                    : 'bg-[#161b27] border-[#252d3d] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-white text-sm font-semibold truncate">{r.competitor_name}</div>
                  {r.change_detected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  )}
                </div>
                <div className="text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="flex-1 bg-[#161b27] border border-[#252d3d] rounded-xl p-5 lg:p-6 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-white text-lg font-bold">{selected.competitor_name}</h2>
                  <div className="text-slate-500 text-xs mt-1">
                    {selected.website_url} · {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                {selected.change_detected && (
                  <span className="bg-yellow-400/15 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0">
                    Change detected
                  </span>
                )}
              </div>

              {/* Summary */}
              <div className="bg-[#0f1117] rounded-lg p-4 mb-5">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Summary</div>
                <p className="text-slate-300 text-sm leading-relaxed">{selected.analysis_summary}</p>
              </div>

              {/* Change summary */}
              {selected.change_detected && selected.change_summary && (
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4 mb-5">
                  <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-2">What changed</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{selected.change_summary}</p>
                </div>
              )}

              {/* Key insights */}
              {selected.key_insights?.length > 0 && (
                <div>
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Key insights</div>
                  <div className="space-y-2">
                    {selected.key_insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-slate-300 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scraped pages */}
              {selected.scraped_pages?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-[#252d3d]">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Pages analyzed</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.scraped_pages.map((page, i) => (
                      <a key={i} href={page} target="_blank" rel="noreferrer"
                        className="text-slate-500 text-xs bg-[#0f1117] border border-[#252d3d] rounded px-2.5 py-1 hover:text-white transition-colors truncate max-w-xs">
                        {page}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}