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

export default function MutexSection() {
  const [threadCount, setThreadCount] = useState(5)
  const [speed, setSpeed] = useState(1)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [threads, setThreads] = useState(() => makeThreads(5))
  const [lockState, setLockState] = useState({ locked: false, owner: -1 })
  const [queue, setQueue] = useState([])
  const [log, setLog] = useState([])

  const stateRef = useRef({ locked: false, owner: -1, queue: [], threads: makeThreads(5) })
  const timerRef = useRef(null)
  const runningRef = useRef(false)
  const speedRef = useRef(1)

  const addLog = (msg, cls = '') => {
    const t = (performance.now() / 1000).toFixed(1)
    setLog(prev => [...prev.slice(-60), { t, msg, cls }])
  }

  const syncUI = () => {
    const s = stateRef.current
    setLockState({ locked: s.locked, owner: s.owner })
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
          s.locked = false
          s.owner = -1
          addLog(`T${th.id} released mutex`, 'green')
          if (s.queue.length > 0) {
            const nid = s.queue.shift()
            const nth = s.threads[nid]
            s.locked = true; s.owner = nid
            nth.state = 'running'; nth.progress = 0
            nth.timer = 1.5 + Math.random() * 2
            addLog(`T${nid} acquired mutex (FIFO wake)`, 'blue')
          }
          th.timer = 1 + Math.random() * 1.5
        } else if (th.state === 'waiting') {
          if (!s.locked) {
            s.locked = true; s.owner = th.id
            th.state = 'running'; th.progress = 0
            th.timer = 1.5 + Math.random() * 2
            addLog(`T${th.id} acquired mutex (lock free)`, 'blue')
          } else {
            th.state = 'blocked'
            if (!s.queue.includes(th.id)) {
              s.queue.push(th.id)
              addLog(`T${th.id} blocked — waiting for lock (owner: T${s.owner})`, 'red')
            }
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
  const handleReset = () => {
    runningRef.current = false; clearTimeout(timerRef.current)
    const th = makeThreads(threadCount)
    stateRef.current = { locked: false, owner: -1, queue: [], threads: th }
    setRunning(false); setPaused(false)
    setLockState({ locked: false, owner: -1 }); setQueue([]); setThreads(th.map(t=>({...t}))); setLog([])
  }
  const handleSpeedChange = v => { setSpeed(v); speedRef.current = v }
  const handleTCChange = e => {
    const tc = parseInt(e.target.value); setThreadCount(tc)
    runningRef.current = false; clearTimeout(timerRef.current)
    const th = makeThreads(tc)
    stateRef.current = { locked: false, owner: -1, queue: [], threads: th }
    setRunning(false); setPaused(false)
    setLockState({ locked: false, owner: -1 }); setQueue([]); setThreads(th.map(t=>({...t}))); setLog([])
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-2">Mutex (Mutual Exclusion Lock)</h2>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        A mutex ensures only one thread holds the lock at a time. The current lock owner is highlighted in blue.
        All contending threads are blocked in a FIFO queue until the owner calls <code className="text-gray-300">unlock()</code>.
      </p>

      <Controls running={running} paused={paused} speed={speed}
        onStart={handleStart} onPause={handlePause} onReset={handleReset} onSpeed={handleSpeedChange} className="mb-6">
        <span className="text-xs text-gray-400">Threads:</span>
        <select value={threadCount} onChange={handleTCChange}
          className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1">
          {[2,3,4,5,6,8,10].map(n => <option key={n}>{n}</option>)}
        </select>
      </Controls>

      {/* Mutex state */}
      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 mb-6">
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Mutex state</div>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{lockState.locked ? '🔒' : '🔓'}</span>
            <div>
              <div className={`text-base font-semibold ${lockState.locked ? 'text-red-300' : 'text-green-300'}`}>
                {lockState.locked ? 'Locked' : 'Unlocked'}
              </div>
              <div className="text-sm text-gray-400">
                {lockState.locked ? `Owner: Thread ${lockState.owner}` : 'No owner'}
              </div>
            </div>
            {lockState.locked && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-950 text-blue-300 border border-blue-700">
                T{lockState.owner} holds lock
              </span>
            )}
          </div>
          <div className="flex-1 min-w-48">
            <div className="text-sm text-gray-400 mb-3">Wait queue ({queue.length} blocked)</div>
            <div className="flex gap-2 flex-wrap min-h-10 items-center">
              {queue.length === 0
                ? <span className="text-xs text-gray-600">empty</span>
                : queue.map(id => (
                  <span key={id} className="px-3 py-1 rounded-full text-sm font-medium bg-red-950 text-red-300 border border-red-800\">
                    T{id}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
        {threads.map(th => (
          <ThreadCard key={th.id} thread={th} isOwner={lockState.locked && th.id === lockState.owner} />
        ))}
      </div>

      <LogBox entries={log} />
    </div>
  )
}
