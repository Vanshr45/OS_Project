import React, { useState, useRef, useCallback } from 'react'
import Controls from './Controls'
import ThreadCard from './ThreadCard'
import LogBox from './LogBox'

const BUFFER_CAP = 4

function makeThreads(np, nc) {
  const threads = []
  for (let i = 0; i < np; i++) threads.push({ id: i, label: `P${i}`, role: 'P', state: 'waiting', progress: 0, timer: Math.random() * 2 + 0.5 })
  for (let i = 0; i < nc; i++) threads.push({ id: np + i, label: `C${i}`, role: 'C', state: 'waiting', progress: 0, timer: Math.random() * 2 + 0.5 })
  return threads
}

export default function MonitorSection() {
  const [prodCount, setProdCount] = useState(2)
  const [consCount, setConsCount] = useState(2)
  const [speed, setSpeed] = useState(1)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [threads, setThreads] = useState(() => makeThreads(2, 2))
  const [buffer, setBuffer] = useState([])
  const [lockState, setLockState] = useState({ locked: false, owner: -1 })
  const [notFullQ, setNotFullQ] = useState([])
  const [notEmptyQ, setNotEmptyQ] = useState([])
  const [log, setLog] = useState([])

  const stateRef = useRef({ locked: false, owner: -1, buffer: [], notFullQ: [], notEmptyQ: [], threads: makeThreads(2, 2) })
  const timerRef = useRef(null)
  const runningRef = useRef(false)
  const speedRef = useRef(1)

  const addLog = (msg, cls = '') => {
    const t = (performance.now() / 1000).toFixed(1)
    setLog(prev => [...prev.slice(-60), { t, msg, cls }])
  }

  const syncUI = () => {
    const s = stateRef.current
    setBuffer([...s.buffer])
    setLockState({ locked: s.locked, owner: s.owner })
    setNotFullQ([...s.notFullQ])
    setNotEmptyQ([...s.notEmptyQ])
    setThreads(s.threads.map(t => ({ ...t })))
  }

  const tick = useCallback(() => {
    if (!runningRef.current) return
    const s = stateRef.current
    const sp = speedRef.current

    s.threads.forEach(th => {
      th.timer -= 0.3 * sp
      if (th.timer <= 0) {
        if (th.state === 'running') {
          if (th.role === 'P') {
            const item = Math.floor(Math.random() * 90) + 10
            s.buffer.push(item)
            addLog(`${th.label} produced item ${item} → buffer [${s.buffer.length}/${BUFFER_CAP}]`, 'green')
            if (s.notEmptyQ.length > 0) {
              const wid = s.notEmptyQ.shift()
              const wth = s.threads[wid]
              wth.state = 'running'; wth.timer = 1.5 + Math.random()
              addLog(`signal(notEmpty) → woke ${wth.label}`, 'blue')
            }
          } else {
            const item = s.buffer.shift()
            addLog(`${th.label} consumed item ${item} ← buffer [${s.buffer.length}/${BUFFER_CAP}]`, 'amber')
            if (s.notFullQ.length > 0) {
              const wid = s.notFullQ.shift()
              const wth = s.threads[wid]
              wth.state = 'running'; wth.timer = 1.5 + Math.random()
              addLog(`signal(notFull) → woke ${wth.label}`, 'blue')
            }
          }
          th.state = 'waiting'; th.progress = 0
          s.locked = false; s.owner = -1
          th.timer = 1 + Math.random() * 1.5
        } else if (th.state === 'waiting') {
          if (!s.locked) {
            s.locked = true; s.owner = th.id
            if (th.role === 'P') {
              if (s.buffer.length >= BUFFER_CAP) {
                th.state = 'blocked'
                s.notFullQ.push(th.id)
                s.locked = false; s.owner = -1
                addLog(`${th.label} wait(notFull) — buffer full`, 'red')
                th.timer = 0.4
              } else {
                th.state = 'running'; th.progress = 0
                th.timer = 0.8 + Math.random()
              }
            } else {
              if (s.buffer.length === 0) {
                th.state = 'blocked'
                s.notEmptyQ.push(th.id)
                s.locked = false; s.owner = -1
                addLog(`${th.label} wait(notEmpty) — buffer empty`, 'red')
                th.timer = 0.4
              } else {
                th.state = 'running'; th.progress = 0
                th.timer = 0.8 + Math.random()
              }
            }
          } else {
            th.timer = 0.4
          }
        } else {
          th.timer = 0.4
        }
      }
      if (th.state === 'running') th.progress = Math.min(100, th.progress + 3 * sp)
    })

    syncUI()
    timerRef.current = setTimeout(tick, 150 / sp)
  }, [])

  const handleStart = () => {
    if (running && !paused) return
    runningRef.current = true; speedRef.current = speed
    setRunning(true); setPaused(false); tick()
  }
  const handlePause = () => {
    if (!running) return
    if (!paused) { runningRef.current = false; clearTimeout(timerRef.current); setPaused(true) }
    else { runningRef.current = true; speedRef.current = speed; setPaused(false); tick() }
  }
  const doReset = (np, nc) => {
    runningRef.current = false; clearTimeout(timerRef.current)
    const th = makeThreads(np, nc)
    stateRef.current = { locked: false, owner: -1, buffer: [], notFullQ: [], notEmptyQ: [], threads: th }
    setRunning(false); setPaused(false)
    setBuffer([]); setLockState({ locked: false, owner: -1 })
    setNotFullQ([]); setNotEmptyQ([]); setThreads(th.map(t => ({ ...t }))); setLog([])
  }
  const handleReset = () => doReset(prodCount, consCount)
  const handleSpeedChange = v => { setSpeed(v); speedRef.current = v }
  const handleProdChange = e => { const v = parseInt(e.target.value); setProdCount(v); doReset(v, consCount) }
  const handleConsChange = e => { const v = parseInt(e.target.value); setConsCount(v); doReset(prodCount, v) }

  const bufFill = buffer.length / BUFFER_CAP

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-2">Monitor (Bounded Buffer)</h2>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        A monitor encapsulates shared state + a mutex + condition variables. Producers call{' '}
        <code className="text-gray-300">wait(notFull)</code> when the buffer is full;
        consumers call <code className="text-gray-300">wait(notEmpty)</code> when empty.{' '}
        <code className="text-gray-300">signal()</code> wakes a waiting thread on the relevant condition.
      </p>

      <Controls running={running} paused={paused} speed={speed}
        onStart={handleStart} onPause={handlePause} onReset={handleReset} onSpeed={handleSpeedChange} className="mb-6">
        <span className="text-xs text-gray-400">Producers:</span>
        <select value={prodCount} onChange={handleProdChange}
          className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1">
          {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
        </select>
        <span className="text-xs text-gray-400">Consumers:</span>
        <select value={consCount} onChange={handleConsChange}
          className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1">
          {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
        </select>
      </Controls>

      {/* Monitor box */}
      <div className="border border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-300">Monitor — Bounded Buffer (cap: {BUFFER_CAP})</span>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border transition-all
              ${lockState.locked
                ? 'bg-red-950 text-red-300 border-red-800'
                : 'bg-green-950 text-green-300 border-green-800'}`}>
              {lockState.locked ? `Locked by ${threads.find(t=>t.id===lockState.owner)?.label ?? '?'}` : 'Lock free'}
            </span>
            <span className="text-sm text-gray-400">{buffer.length} / {BUFFER_CAP}</span>
          </div>
        </div>
        <div className="p-6 bg-gray-900">
          {/* Buffer visualization */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-gray-400 w-16">Buffer:</span>
            <div className="flex gap-2">
              {Array.from({ length: BUFFER_CAP }, (_, i) => (
                <div key={i}
                  className={`w-12 h-12 rounded-lg border flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${i < buffer.length
                      ? 'bg-green-950 border-green-700 text-green-300'
                      : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                  {i < buffer.length ? buffer[i] : '—'}
                </div>
              ))}
            </div>
          </div>

          {/* Condition variables */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 w-20">notFull</span>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div className={`h-full rounded-full transition-all duration-500 ${bufFill >= 1 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.round((1 - bufFill) * 100)}%` }} />
              </div>
              <div className="flex gap-2 min-w-24">
                {notFullQ.length === 0
                  ? <span className="text-sm text-gray-600">—</span>
                  : notFullQ.map(id => (
                    <span key={id} className="px-2 py-1 rounded-full text-xs font-medium bg-red-950 text-red-300 border border-red-800">
                      {threads[id]?.label}
                    </span>
                  ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 w-20">notEmpty</span>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div className={`h-full rounded-full transition-all duration-500 ${bufFill === 0 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.round(bufFill * 100)}%` }} />
              </div>
              <div className="flex gap-2 min-w-24">
                {notEmptyQ.length === 0
                  ? <span className="text-sm text-gray-600">—</span>
                  : notEmptyQ.map(id => (
                    <span key={id} className="px-2 py-1 rounded-full text-xs font-medium bg-red-950 text-red-300 border border-red-800">
                      {threads[id]?.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
        {threads.map(th => (
          <ThreadCard
            key={th.id} thread={th}
            isOwner={lockState.locked && th.id === lockState.owner}
            badge={th.role === 'P' ? 'producer' : 'consumer'}
          />
        ))}
      </div>

      <LogBox entries={log} />
    </div>
  )
}
