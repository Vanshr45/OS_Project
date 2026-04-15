# 🧵 Thread Synchronization Visualizer

An interactive, browser-based educational tool that visually demonstrates core **Operating Systems** thread synchronization concepts — **Semaphores**, **Mutexes**, and **Monitors** — in real time.

> Built as a college Operating Systems project using React + Vite + Tailwind CSS.

---

## 🖥️ Live Demo

**[https://thread-sync-visualizer.vercel.app/](https://thread-sync-visualizer.vercel.app/)**

-

## 🎯 What It Visualizes

| Concept | What You See |
|---|---|
| **Semaphore** | N concurrent slots, live counter, blocked thread queue |
| **Mutex** | Single-owner lock, FIFO wake-up, blue owner highlight |
| **Monitor** | Bounded buffer, producer/consumer roles, `notFull` / `notEmpty` condition variables |

### Thread States (Color-coded)
- 🟢 **Green** — Running (holds the resource)
- 🟡 **Yellow** — Waiting (trying to acquire)
- 🔴 **Red** — Blocked (queued, waiting for signal)

---

## ⚙️ Tech Stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- Fully **client-side** — no backend, no APIs

---


## 📁 Project Structure

```
thread-sync-visualizer/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    └── components/
        ├── SemaphoreSection.jsx   # Counting semaphore simulation
        ├── MutexSection.jsx       # Mutex lock simulation
        ├── MonitorSection.jsx     # Monitor / bounded buffer simulation
        ├── ThreadCard.jsx         # Reusable thread state card
        ├── LogBox.jsx             # Timestamped event log
        └── Controls.jsx           # Start / Pause / Reset + speed slider
```

---

## 🎮 Controls

| Control | Description |
|---|---|
| **Start** | Begin the simulation |
| **Pause / Resume** | Freeze and resume thread scheduling |
| **Reset** | Stop and reinitialize all threads |
| **Thread Count** | Set number of threads (2–10) |
| **Speed Slider** | Control simulation speed (0.5x – 3x) |

---

## 📚 Concepts Explained

<details>
<summary><strong>Semaphore</strong></summary>

A semaphore is a counter that controls how many threads can access a shared resource concurrently.

- `wait()` — decrements counter; blocks thread if counter = 0
- `signal()` — increments counter; wakes next blocked thread

A **Counting Semaphore** allows N threads simultaneously. A **Binary Semaphore** (0 or 1) works like a simple lock.

</details>

<details>
<summary><strong>Mutex</strong></summary>

A mutex (Mutual Exclusion Lock) ensures only **one thread** can enter a critical section at a time.

- Only the **owner** (the thread that locked it) can unlock it
- All other threads are placed in a **FIFO wait queue**
- Stricter than a binary semaphore due to ownership enforcement

</details>

<details>
<summary><strong>Monitor (Bounded Buffer)</strong></summary>

A monitor encapsulates shared state + a mutex + condition variables.

- **Producers** call `wait(notFull)` when the buffer is at capacity
- **Consumers** call `wait(notEmpty)` when the buffer is empty
- `signal()` wakes a waiting thread on the relevant condition

</details>

---

## 📄 License

[MIT](LICENSE)

---

## 🙌 Acknowledgements

Built for an Operating Systems course project to make thread synchronization concepts interactive and intuitive.
