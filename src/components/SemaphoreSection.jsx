import React, { useState, useRef, useCallback } from 'react'
import Controls from './Controls'
import ThreadCard from './ThreadCard'
import LogBox from './LogBox'

function makeThreads(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i, label: `T${i}`, state: 'waiting', progress: 0,
    timer: Math.random() * 2 + 0.3
  }))
}

export default function SemaphoreSection() {
  const [threadCount, setThreadCount] = useState(4)
  const [capacity, setCapacity] = useState(2)
  const [speed, setSpeed] = useState(1)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [threads, setThreads] = useState(() => makeThreads(4))
  const [slots, setSlots] = useState(2)
  const [queue, setQueue] = useState([])
  const [log, setLog] = useState([])

  const stateRef = useRef({ slots: 2, queue: [], threads: makeThreads(4) })
  const timerRef = useRef(null)
  const runningRef = useRef(false)
  const speedRef = useRef(1)

  const addLog = (msg, cls = '') => {
    const t = (performance.now() / 1000).toFixed(1)
    setLog(prev => [...prev.slice(-60), { t, msg, cls }])
  }

  const syncUI = () => {
    const s = stateRef.current
    setSlots(s.slots)
    setQueue([...s.queue])
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
          th.state = 'waiting'
          th.progress = 0
          s.slots++
          addLog(`T${th.id} released slot → semaphore = ${s.slots}`, 'green')
          const nextId = s.queue.shift()
          if (nextId !== undefined) {
            const nth = s.threads[nextId]
            nth.state = 'running'
            nth.progress = 0
            s.slots--
            nth.timer = 1.5 + Math.random() * 2
            addLog(`T${nextId} dequeued → running (sem=${s.slots})`, 'blue')
          }
          th.timer = 1 + Math.random() * 2
        } else if (th.state === 'waiting') {
          if (s.slots > 0) {
            th.state = 'running'
            th.progress = 0
            s.slots--
            th.timer = 1.5 + Math.random() * 2
            addLog(`T${th.id} acquired slot → semaphore = ${s.slots}`, 'blue')
          } else {
            th.state = 'blocked'
            if (!s.queue.includes(th.id)) {
              s.queue.push(th.id)
              addLog(`T${th.id} blocked — queued (sem=0)`, 'red')
            }
            th.timer = 0.5
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
    runningRef.current = true
    speedRef.current = speed
    setRunning(true)
    setPaused(false)
    tick()
  }

  const handlePause = () => {
    if (!running) return
    if (!paused) {
      runningRef.current = false
      clearTimeout(timerRef.current)
      setPaused(true)
    } else {
      runningRef.current = true
      speedRef.current = speed
      setPaused(false)
      tick()
    }
  }

  const handleReset = () => {
    runningRef.current = false
    clearTimeout(timerRef.current)
    const th = makeThreads(threadCount)
    stateRef.current = { slots: capacity, queue: [], threads: th }
    setRunning(false)
    setPaused(false)
    setSlots(capacity)
    setQueue([])
    setThreads(th.map(t => ({ ...t })))
    setLog([])
  }

  const handleSpeedChange = v => {
    setSpeed(v)
    speedRef.current = v
  }

  const handleTCChange = e => {
    const tc = parseInt(e.target.value)
    setThreadCount(tc)
    runningRef.current = false
    clearTimeout(timerRef.current)
    const th = makeThreads(tc)
    stateRef.current = { slots: capacity, queue: [], threads: th }
    setRunning(false); setPaused(false)
    setSlots(capacity); setQueue([])
    setThreads(th.map(t => ({ ...t })))
    setLog([])
  }

  const handleCapChange = e => {
    const cap = parseInt(e.target.value)
    setCapacity(cap)
    runningRef.current = false
    clearTimeout(timerRef.current)
    const th = makeThreads(threadCount)
    stateRef.current = { slots: cap, queue: [], threads: th }
    setRunning(false); setPaused(false)
    setSlots(cap); setQueue([])
    setThreads(th.map(t => ({ ...t })))
    setLog([])
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-2">Counting Semaphore</h2>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        A semaphore with value N allows up to N threads to access the shared resource concurrently.
        Threads that exceed the limit are queued and blocked until a slot is released via <code className="text-gray-300">signal()</code>.
      </p>

      <Controls running={running} paused={paused} speed={speed}
        onStart={handleStart} onPause={handlePause} onReset={handleReset} onSpeed={handleSpeedChange} className="mb-6">
        <span className="text-xs text-gray-400">Threads:</span>
        <select value={threadCount} onChange={handleTCChange}
          className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1">
          {[2,3,4,5,6,8,10].map(n => <option key={n}>{n}</option>)}
        </select>
        <span className="text-xs text-gray-400">Capacity:</span>
        <select value={capacity} onChange={handleCapChange}
          className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1">
          {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
        </select>
      </Controls>

      {/* Semaphore state */}
      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 mb-6">
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Semaphore state</div>
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-sm text-gray-400 mb-3">Available slots ({slots} / {capacity})</div>
            <div className="flex gap-3">
              {Array.from({ length: capacity }, (_, i) => (
                <div key={i}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center text-base font-medium transition-all duration-300
                    ${i < slots
                      ? 'bg-gray-800 border-gray-700 text-gray-400'
                      : 'bg-green-950 border-green-700 text-green-300'}`}>
                  {i < slots ? '○' : '✓'}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-48">
            <div className="text-sm text-gray-400 mb-3">Wait queue ({queue.length} blocked)</div>
            <div className="flex gap-2 flex-wrap min-h-10 items-center">
              {queue.length === 0
                ? <span className="text-xs text-gray-600">empty</span>
                : queue.map(id => (
                  <span key={id} className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-950 text-red-300 border border-red-800">
                    T{id}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
        {threads.map(th => <ThreadCard key={th.id} thread={th} />)}
      </div>

      <LogBox entries={log} />
    </div>
  )
}
