import React from 'react'

export default function Controls({ running, paused, onStart, onPause, onReset, speed, onSpeed, children, className }) {
  return (
    <div className={`flex items-center gap-3 flex-wrap ${className || 'mb-4'}`}>
      <button
        onClick={onStart}
        disabled={running && !paused}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-700 bg-blue-950 text-blue-300
          hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Start
      </button>
      <button
        onClick={onPause}
        disabled={!running}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-700 text-gray-300
          hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {paused ? 'Resume' : 'Pause'}
      </button>
      <button
        onClick={onReset}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-700 text-gray-300
          hover:bg-gray-800 transition-all"
      >
        Reset
      </button>

      {children}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-gray-400">Speed</span>
        <input
          type="range" min="0.5" max="3" step="0.5" value={speed}
          onChange={e => onSpeed(parseFloat(e.target.value))}
          className="w-20"
        />
        <span className="text-xs text-gray-400 w-6">{speed}x</span>
      </div>
    </div>
  )
}
