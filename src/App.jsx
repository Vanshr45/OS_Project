import React, { useState } from 'react'
import SemaphoreSection from './components/SemaphoreSection'
import MutexSection from './components/MutexSection'
import MonitorSection from './components/MonitorSection'

const TABS = [
  { id: 'semaphore', label: 'Semaphore' },
  { id: 'mutex',     label: 'Mutex' },
  { id: 'monitor',   label: 'Monitor' },
]

export default function App() {
  const [tab, setTab] = useState('semaphore')

  return (
    <div className="w-screen h-screen bg-gray-950 text-gray-100 px-6 md:px-8 py-4 md:py-6 flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Thread Synchronization Visualizer</h1>
          <p className="text-sm text-gray-400 mt-1">Interactive OS education — semaphores · mutexes · monitors</p>
        </div>
        <div className="flex gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Running</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />Waiting</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Blocked</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 mb-8 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-base font-medium rounded-t-lg border border-b-0 transition-all
              ${tab === t.id
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="flex-1 min-h-0 overflow-auto">
        {tab === 'semaphore' && <SemaphoreSection />}
        {tab === 'mutex'     && <MutexSection />}
        {tab === 'monitor'   && <MonitorSection />}
      </div>
    </div>
  )
}
