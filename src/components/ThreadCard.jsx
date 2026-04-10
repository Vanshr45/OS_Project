import React from 'react'

const STATE_STYLES = {
  running: {
    card: 'border-green-700 bg-green-950',
    label: 'text-green-300',
    bar: 'bg-green-500',
  },
  waiting: {
    card: 'border-yellow-700 bg-yellow-950',
    label: 'text-yellow-300',
    bar: 'bg-yellow-500',
  },
  blocked: {
    card: 'border-red-700 bg-red-950',
    label: 'text-red-300',
    bar: 'bg-red-500',
  },
}

export default function ThreadCard({ thread, isOwner, badge }) {
  const s = STATE_STYLES[thread.state] ?? STATE_STYLES.waiting
  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 ${s.card} ${isOwner ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-300">{thread.label ?? `T${thread.id}`}</span>
        {isOwner && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-900 text-blue-300 border border-blue-700">owner</span>
        )}
        {badge && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${badge === 'producer'
            ? 'bg-green-900 text-green-300 border-green-700'
            : 'bg-blue-900 text-blue-300 border-blue-700'}`}>{badge}</span>
        )}
      </div>
      <div className={`text-base font-medium capitalize ${s.label}`}>{thread.state}</div>
      <div className="h-2 rounded-full bg-gray-800 mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${s.bar}`}
          style={{ width: `${thread.progress}%` }}
        />
      </div>
    </div>
  )
}
