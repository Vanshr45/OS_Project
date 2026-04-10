import React, { useEffect, useRef } from 'react'

const COLOR = {
  green: 'text-green-400',
  amber: 'text-yellow-400',
  red:   'text-red-400',
  blue:  'text-blue-400',
}

export default function LogBox({ entries }) {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [entries])

  return (
    <div
      ref={ref}
      className="font-mono text-[12px] bg-gray-900 border border-gray-800 rounded-lg p-4 h-40 overflow-y-auto"
    >
      {entries.length === 0 && (
        <span className="text-gray-600">Waiting for simulation to start…</span>
      )}
      {entries.map((e, i) => (
        <div key={i} className="mb-0.5">
          <span className="text-gray-600 mr-2">{e.t}s</span>
          <span className={COLOR[e.cls] ?? 'text-gray-300'}>{e.msg}</span>
        </div>
      ))}
    </div>
  )
}
