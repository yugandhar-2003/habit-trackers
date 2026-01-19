const STORAGE_KEY = "calendar_habit_tracker_2026"

const defaultHabits = [
  "4:30 - Wake up",
  "4:30 - 5 Meditation",
  "5 - 9:00 Work",
  "9:00 - 12:00 Coding",
  "12:00 - 1:00 Eating",
  "1:00 - 2:00 Coding",
  "2:00 - 4:00 Interview Prep",
  "4:00 - 5:00 Rest",
  "5:00 - 6:00 Video Create & Upload",
  "6:00 - 7:30 Things to Do",
  "6:00 - 7:30 All Between Video Gen",
  "7:30 - 8:30 Mobile",
  "8:30 - Sleep",
]

const FESTIVALS_2026 = {
  "2026-01-01": "New Year's Day",
  "2026-01-26": "Republic Day (India)",
  "2026-02-14": "Valentine's Day",
  "2026-03-14": "Holi",
  "2026-04-02": "Ram Navami",
  "2026-04-10": "Good Friday",
  "2026-04-12": "Easter Sunday",
  "2026-05-01": "Labour Day",
  "2026-07-04": "Independence Day (USA)",
  "2026-08-15": "Independence Day (India)",
  "2026-10-02": "Gandhi Jayanti",
  "2026-10-24": "Diwali",
  "2026-11-26": "Thanksgiving",
  "2026-12-25": "Christmas",
  "2026-12-31": "New Year's Eve",
}

let habitData = {
  habits: [],
  checks: {}, // Format: "YYYY-MM-DD-habitIndex": boolean
}

let currentMonth = new Date().getMonth()
let currentYear = 2026
let currentPeriod = "monthly"

// DOM Elements
const monthSelect = document.getElementById("monthSelect")
const yearInput = document.getElementById("yearInput")
const viewAllMonthsBtn = document.getElementById("viewAllMonthsBtn")
const saveDataBtn = document.getElementById("saveDataBtn")
const addHabitBtn = document.getElementById("addHabitBtn")
const newHabitInput = document.getElementById("newHabitInput")
const tableHead = document.getElementById("tableHead")
const tableBody = document.getElementById("tableBody")
const tableFoot = document.getElementById("tableFoot")
const graphContainer = document.getElementById("graphContainer")
const graphTitle = document.getElementById("graphTitle")
const graphSummary = document.getElementById("graphSummary")
const monthYearTitle = document.getElementById("monthYearTitle")
const currentDateTimeEl = document.getElementById("currentDateTime")

// Stats Elements
const currentStreakEl = document.getElementById("currentStreak")
const totalHabitsEl = document.getElementById("totalHabits")
const completionRateEl = document.getElementById("completionRate")
const bestHabitEl = document.getElementById("bestHabit")
const avgCompletionEl = document.getElementById("avgCompletion")
const mostConsistentEl = document.getElementById("mostConsistent")
const totalCheckinsEl = document.getElementById("totalCheckins")

function init() {
  loadData()
  updateDateTime()
  setInterval(updateDateTime, 1000)

  // Set current month and year
  const now = new Date()
  currentMonth = now.getMonth()
  currentYear = now.getFullYear()
  monthSelect.value = currentMonth
  yearInput.value = currentYear

  renderCalendar()
  renderGraph()
  updateStats()
  setupEventListeners()
}

function updateDateTime() {
  const now = new Date()
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }
  currentDateTimeEl.textContent = now.toLocaleDateString("en-US", options)
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      habitData = JSON.parse(raw)
    } catch (e) {
      habitData = { habits: [], checks: {} }
    }
  }

  if (!habitData.habits || habitData.habits.length === 0) {
    habitData.habits = [...defaultHabits]
  }

  if (!habitData.checks) {
    habitData.checks = {}
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habitData))
}

function isSunday(date) {
  return date.getDay() === 0
}

function isFestival(date) {
  const dateStr = formatDate(date)
  return FESTIVALS_2026[dateStr] || null
}

function isToday(date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getDayName(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[date.getDay()]
}

function renderCalendar() {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  monthYearTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`

  // Render header
  tableHead.innerHTML = ""
  const headRow = document.createElement("tr")

  const habitHeader = document.createElement("th")
  habitHeader.textContent = "Habit"
  habitHeader.className = "habit-name"
  headRow.appendChild(habitHeader)

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const th = document.createElement("th")

    const dateHeader = document.createElement("div")
    dateHeader.className = "date-header"

    const dateNumber = document.createElement("div")
    dateNumber.className = "date-number"
    dateNumber.textContent = day

    const dateDay = document.createElement("div")
    dateDay.className = "date-day"
    dateDay.textContent = getDayName(date)

    if (isSunday(date)) {
      dateDay.classList.add("sunday-header")
    }

    dateHeader.appendChild(dateNumber)
    dateHeader.appendChild(dateDay)
    th.appendChild(dateHeader)
    headRow.appendChild(th)
  }

  const scoreHeader = document.createElement("th")
  scoreHeader.textContent = "Score"
  headRow.appendChild(scoreHeader)
  tableHead.appendChild(headRow)

  // Render body
  tableBody.innerHTML = ""
  habitData.habits.forEach((habit, habitIndex) => {
    const row = document.createElement("tr")

    const nameCell = document.createElement("td")
    nameCell.className = "habit-name"
    nameCell.textContent = habit
    row.appendChild(nameCell)

    let habitScore = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = formatDate(date)
      const checkKey = `${dateStr}-${habitIndex}`

      const cell = document.createElement("td")

      // Check for holidays
      const sunday = isSunday(date)
      const festival = isFestival(date)
      const today = isToday(date)

      if (sunday) {
        cell.classList.add("holiday-cell")
        cell.title = "Sunday - Holiday"
      } else if (festival) {
        cell.classList.add("holiday-cell", "festival-cell")
        cell.title = festival
      } else {
        // Add checkbox for non-holidays
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = !!habitData.checks[checkKey]
        checkbox.dataset.key = checkKey

        checkbox.addEventListener("change", () => {
          habitData.checks[checkKey] = checkbox.checked
          saveData()
          updateScores()
          renderGraph()
          updateStats()
        })

        cell.appendChild(checkbox)

        if (habitData.checks[checkKey]) {
          habitScore++
        }
      }

      if (today) {
        cell.classList.add("today-cell")
      }

      row.appendChild(cell)
    }

    const scoreCell = document.createElement("td")
    scoreCell.className = "score"
    scoreCell.id = `score-${habitIndex}`
    scoreCell.textContent = habitScore
    row.appendChild(scoreCell)

    tableBody.appendChild(row)
  })

  // Render footer
  renderFooter()
  updateScores()
}

function renderFooter() {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  tableFoot.innerHTML = ""
  const footRow = document.createElement("tr")

  const totalLabel = document.createElement("td")
  totalLabel.innerHTML = "<strong>Total</strong>"
  footRow.appendChild(totalLabel)

  for (let day = 1; day <= daysInMonth; day++) {
    footRow.appendChild(document.createElement("td"))
  }

  const totalScore = document.createElement("td")
  totalScore.id = "totalScore"
  totalScore.className = "score"
  footRow.appendChild(totalScore)
  tableFoot.appendChild(footRow)
}

function updateScores() {
  let grandTotal = 0

  habitData.habits.forEach((habit, habitIndex) => {
    let habitScore = 0
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = formatDate(date)
      const checkKey = `${dateStr}-${habitIndex}`

      if (habitData.checks[checkKey]) {
        habitScore++
      }
    }

    const scoreCell = document.getElementById(`score-${habitIndex}`)
    if (scoreCell) {
      scoreCell.textContent = habitScore
    }
    grandTotal += habitScore
  })

  const totalScoreCell = document.getElementById("totalScore")
  if (totalScoreCell) {
    totalScoreCell.textContent = grandTotal
  }
}

function renderGraph() {
  graphContainer.innerHTML = ""
  let data = []

  switch (currentPeriod) {
    case "daily":
      data = calculateDailyData()
      graphTitle.textContent = "Daily Habit Progress"
      break
    case "weekly":
      data = calculateWeeklyData()
      graphTitle.textContent = "Weekly Progress"
      break
    case "monthly":
      data = calculateMonthlyData()
      graphTitle.textContent = "Monthly Progress (All Months)"
      break
    case "yearly":
      data = calculateYearlyData()
      graphTitle.textContent = "Yearly Overview 2026"
      break
  }

  data.forEach((item) => {
    const row = document.createElement("div")
    row.className = "graph-row"

    const label = document.createElement("div")
    label.className = "graph-label"
    label.textContent = item.label

    const barWrap = document.createElement("div")
    barWrap.className = "bar-wrap"

    const bar = document.createElement("div")
    bar.className = "bar"
    bar.style.width = "0%"
    bar.textContent = `${item.percent}%`

    setTimeout(() => {
      bar.style.width = `${item.percent}%`
    }, 50)

    barWrap.appendChild(bar)
    row.appendChild(label)
    row.appendChild(barWrap)
    graphContainer.appendChild(row)
  })

  // Update summary
  const totalChecks = data.reduce((sum, item) => sum + item.count, 0)
  const totalPossible = data.reduce((sum, item) => sum + item.total, 0)
  const overallPercent = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0
  graphSummary.textContent = `${totalChecks} / ${totalPossible} (${overallPercent}%)`
}

function calculateDailyData() {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  return habitData.habits.map((habit, habitIndex) => {
    let count = 0
    let possibleDays = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = formatDate(date)
      const checkKey = `${dateStr}-${habitIndex}`

      // Only count non-Sunday and non-festival days
      if (!isSunday(date) && !isFestival(date)) {
        possibleDays++
        if (habitData.checks[checkKey]) {
          count++
        }
      }
    }

    const percent = possibleDays > 0 ? Math.round((count / possibleDays) * 100) : 0
    return {
      label: habit,
      count,
      total: possibleDays,
      percent,
    }
  })
}

function calculateWeeklyData() {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const weeks = Math.ceil(daysInMonth / 7)
  const weekData = []

  for (let w = 0; w < weeks; w++) {
    const startDay = w * 7 + 1
    const endDay = Math.min(startDay + 6, daysInMonth)
    let weekTotal = 0
    let weekPossible = 0

    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(currentYear, currentMonth, day)

      if (!isSunday(date) && !isFestival(date)) {
        habitData.habits.forEach((habit, habitIndex) => {
          const dateStr = formatDate(date)
          const checkKey = `${dateStr}-${habitIndex}`

          weekPossible++
          if (habitData.checks[checkKey]) {
            weekTotal++
          }
        })
      }
    }

    const percent = weekPossible > 0 ? Math.round((weekTotal / weekPossible) * 100) : 0
    weekData.push({
      label: `Week ${w + 1} (${startDay}-${endDay})`,
      count: weekTotal,
      total: weekPossible,
      percent,
    })
  }

  return weekData
}

function calculateMonthlyData() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const monthData = []

  for (let month = 0; month < 12; month++) {
    const daysInMonth = getDaysInMonth(currentYear, month)
    let monthTotal = 0
    let monthPossible = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, month, day)

      if (!isSunday(date) && !isFestival(date)) {
        habitData.habits.forEach((habit, habitIndex) => {
          const dateStr = formatDate(date)
          const checkKey = `${dateStr}-${habitIndex}`

          monthPossible++
          if (habitData.checks[checkKey]) {
            monthTotal++
          }
        })
      }
    }

    const percent = monthPossible > 0 ? Math.round((monthTotal / monthPossible) * 100) : 0
    monthData.push({
      label: monthNames[month],
      count: monthTotal,
      total: monthPossible,
      percent,
    })
  }

  return monthData
}

function calculateYearlyData() {
  return calculateDailyData()
}

function updateStats() {
  totalHabitsEl.textContent = habitData.habits.length

  // Calculate total checks for current month
  let totalChecks = 0
  let totalPossible = 0
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)

    if (!isSunday(date) && !isFestival(date)) {
      habitData.habits.forEach((habit, habitIndex) => {
        const dateStr = formatDate(date)
        const checkKey = `${dateStr}-${habitIndex}`

        totalPossible++
        if (habitData.checks[checkKey]) {
          totalChecks++
        }
      })
    }
  }

  totalCheckinsEl.textContent = totalChecks

  const completionPercent = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0
  completionRateEl.textContent = `${completionPercent}%`
  avgCompletionEl.textContent = `${completionPercent}%`

  // Calculate streak (consecutive days all habits completed)
  let streak = 0
  for (let day = daysInMonth; day >= 1; day--) {
    const date = new Date(currentYear, currentMonth, day)

    if (!isSunday(date) && !isFestival(date)) {
      const allComplete = habitData.habits.every((habit, habitIndex) => {
        const dateStr = formatDate(date)
        const checkKey = `${dateStr}-${habitIndex}`
        return habitData.checks[checkKey]
      })

      if (allComplete) {
        streak++
      } else {
        break
      }
    }
  }
  currentStreakEl.textContent = streak

  // Best habit
  let bestHabit = { name: "-", percent: 0 }
  habitData.habits.forEach((habit, habitIndex) => {
    let count = 0
    let possible = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)

      if (!isSunday(date) && !isFestival(date)) {
        const dateStr = formatDate(date)
        const checkKey = `${dateStr}-${habitIndex}`

        possible++
        if (habitData.checks[checkKey]) {
          count++
        }
      }
    }

    const percent = possible > 0 ? Math.round((count / possible) * 100) : 0
    if (percent > bestHabit.percent) {
      bestHabit = { name: habit, percent }
    }
  })
  bestHabitEl.textContent = bestHabit.name

  // Most consistent (lowest variance)
  let mostConsistent = { name: "-", variance: Number.POSITIVE_INFINITY }
  habitData.habits.forEach((habit, habitIndex) => {
    const checks = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)

      if (!isSunday(date) && !isFestival(date)) {
        const dateStr = formatDate(date)
        const checkKey = `${dateStr}-${habitIndex}`
        checks.push(habitData.checks[checkKey] ? 1 : 0)
      }
    }

    if (checks.length > 0) {
      const avg = checks.reduce((a, b) => a + b, 0) / checks.length
      const variance =
        checks.reduce((sum, val) => {
          const diff = val - avg
          return sum + diff * diff
        }, 0) / checks.length

      if (variance < mostConsistent.variance) {
        mostConsistent = { name: habit, variance }
      }
    }
  })
  mostConsistentEl.textContent = mostConsistent.name
}

function setupEventListeners() {
  // Add habit
  addHabitBtn.addEventListener("click", () => {
    const name = newHabitInput.value.trim()
    if (!name) {
      alert("Please enter a habit name")
      return
    }

    habitData.habits.push(name)
    newHabitInput.value = ""
    saveData()
    renderCalendar()
    renderGraph()
    updateStats()
  })

  // Month change
  monthSelect.addEventListener("change", () => {
    currentMonth = Number.parseInt(monthSelect.value)
    renderCalendar()
    renderGraph()
    updateStats()
  })

  // Year change
  yearInput.addEventListener("change", () => {
    currentYear = Number.parseInt(yearInput.value)
    renderCalendar()
    renderGraph()
    updateStats()
  })

  // View all months
  viewAllMonthsBtn.addEventListener("click", () => {
    currentPeriod = "monthly"
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
      if (btn.dataset.period === "monthly") {
        btn.classList.add("active")
      }
    })
    renderGraph()
  })

  // Save data
  saveDataBtn.addEventListener("click", () => {
    saveData()
    saveDataBtn.textContent = "✓ Saved!"
    setTimeout(() => {
      saveDataBtn.innerHTML = "<span>💾</span> Save Progress"
    }, 1500)
  })

  // Time period tabs
  const tabBtns = document.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentPeriod = btn.dataset.period
      renderGraph()
    })
  })

  // Enter key for habit input
  newHabitInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addHabitBtn.click()
    }
  })
}

// Initialize
init()
