import { useState, useMemo } from 'react'
import { Plus, Star, Trash2, X, RefreshCw, Camera, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

// ── 상수 ────────────────────────────────────────────────────
const TYPE_META = {
  CLASS:    { label: '수업',   bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  PERSONAL: { label: '개인',   bg: 'bg-violet-100',  text: 'text-violet-700',  dot: 'bg-violet-400'  },
  DDAY:     { label: 'D-day', bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-400'     },
  ALBA:     { label: '알바',   bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// ── 에타 시간표 샘플 ─────────────────────────────────────────
function buildTimetableData() {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  const toDateStr = (d) => d.toISOString().split('T')[0]
  const addDays  = (d, n) => { const r = new Date(d); r.setDate(d.getDate() + n); return r }
  return [
    { title: '운영체제',       date: toDateStr(monday),            startTime: '09:00', endTime: '10:30', type: 'CLASS', priority: 'MEDIUM' },
    { title: '데이터베이스',   date: toDateStr(addDays(monday,0)), startTime: '13:00', endTime: '14:30', type: 'CLASS', priority: 'MEDIUM' },
    { title: '알고리즘',       date: toDateStr(addDays(monday,1)), startTime: '10:30', endTime: '12:00', type: 'CLASS', priority: 'MEDIUM' },
    { title: '컴퓨터네트워크', date: toDateStr(addDays(monday,2)), startTime: '14:00', endTime: '15:30', type: 'CLASS', priority: 'MEDIUM' },
    { title: '소프트웨어공학', date: toDateStr(addDays(monday,3)), startTime: '09:00', endTime: '10:30', type: 'CLASS', priority: 'MEDIUM' },
  ]
}

// ── 유틸 ────────────────────────────────────────────────────
const toDateStr = (d) => d.toISOString().split('T')[0]

function getDDayLabel(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr); target.setHours(0,0,0,0)
  const diff = Math.round((target - today) / 86400000)
  if (diff === 0) return 'D-DAY'
  if (diff > 0)  return `D-${diff}`
  return `D+${Math.abs(diff)}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth()+1}/${d.getDate()}(${DAY_LABELS[d.getDay()]})`
}

function groupByDate(items) {
  const map = {}
  for (const s of items) {
    if (!map[s.date]) map[s.date] = []
    map[s.date].push(s)
  }
  return Object.entries(map).sort(([a],[b]) => a.localeCompare(b))
}

// 달력 날짜 배열 생성 (null = 이전 달 빈칸)
function getCalendarDays(year, month) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

let idCounter = 1

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function ScheduleModule({ schedules, setSchedules }) {
  const [view, setView]         = useState('list') // 'list' | 'calendar'
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]         = useState({ title:'', date:'', startTime:'', endTime:'', type:'PERSONAL', priority:'MEDIUM' })
  const [toasts, setToasts]     = useState([])

  // 캘린더 상태
  const today = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState(toDateStr(today))

  const notify = (msg) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500)
  }

  const importTimetable = () => {
    const existing = new Set(schedules.map((s) => s.title + s.date))
    const newItems = buildTimetableData()
      .filter((s) => !existing.has(s.title + s.date))
      .map((s) => ({ ...s, id:`SCH-${idCounter++}`, isHighlighted:false }))
    if (!newItems.length) { notify('이미 불러온 시간표예요'); return }
    setSchedules((s) => [...s, ...newItems])
    notify(`시간표에서 ${newItems.length}개 일정 자동 추가됨 ✅`)
  }

  const addSchedule = () => {
    if (!form.title || !form.date) return
    setSchedules((s) => [...s, { ...form, id:`SCH-${idCounter++}`, isHighlighted:false }])
    setModalOpen(false)
    setForm({ title:'', date:'', startTime:'', endTime:'', type:'PERSONAL', priority:'MEDIUM' })
    notify('일정 추가됨')
  }

  const deleteSchedule = (id) => { setSchedules((s) => s.filter((x) => x.id !== id)); notify('일정 삭제됨') }
  const toggleHighlight = (id) => setSchedules((s) => s.map((x) => x.id===id ? {...x, isHighlighted:!x.isHighlighted} : x))
  const reset = () => { setSchedules([]); notify('초기화됨') }

  // 캘린더 달 이동
  const prevMonth = () => { if (calMonth===0) { setCalYear(y=>y-1); setCalMonth(11) } else setCalMonth(m=>m-1) }
  const nextMonth = () => { if (calMonth===11) { setCalYear(y=>y+1); setCalMonth(0) } else setCalMonth(m=>m+1) }

  // 날짜별 일정 맵
  const scheduleMap = useMemo(() => {
    const map = {}
    for (const s of schedules) {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    }
    return map
  }, [schedules])

  const calDays       = getCalendarDays(calYear, calMonth)
  const todayStr      = toDateStr(today)
  const selectedItems = scheduleMap[selected] || []
  const grouped       = groupByDate(schedules)

  return (
    <div className="w-full flex items-start justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="relative bg-white rounded-[2.25rem] shadow-2xl ring-1 ring-slate-200 overflow-hidden">

          {/* 노치 */}
          <div className="h-6 flex items-center justify-center bg-white">
            <div className="w-24 h-1.5 rounded-full bg-slate-200" />
          </div>

          {/* 헤더 */}
          <div className="px-5 pt-1 pb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">일정 관리</p>
              <p className="text-lg font-bold text-slate-800">도현님 📅</p>
            </div>
            <button onClick={reset} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs">
              <RefreshCw size={14} /> 초기화
            </button>
          </div>

          {/* 뷰 토글 + 액션 버튼 */}
          <div className="px-5 mb-4 flex gap-2">
            {/* 목록/캘린더 토글 */}
            <div className="flex rounded-xl overflow-hidden ring-1 ring-slate-200 shrink-0">
              <button onClick={() => setView('list')}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-semibold transition ${view==='list' ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                <List size={13} />
              </button>
              <button onClick={() => setView('calendar')}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-semibold transition ${view==='calendar' ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                <CalendarDays size={13} />
              </button>
            </div>
            <button onClick={importTimetable}
              className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-blue-50 hover:bg-blue-100 ring-1 ring-blue-200 py-2 text-xs font-semibold text-blue-700 transition">
              <Camera size={12} /> 에타 시간표
            </button>
            <button onClick={() => setModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-900 py-2 text-xs font-semibold text-white transition">
              <Plus size={12} /> 일정 추가
            </button>
          </div>

          {/* ── 캘린더 뷰 ── */}
          {view === 'calendar' && (
            <div className="px-5 pb-6">
              {/* 월 네비게이션 */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                  <ChevronLeft size={16} className="text-slate-500" />
                </button>
                <p className="text-sm font-bold text-slate-800">
                  {calYear}년 {calMonth+1}월
                </p>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map((d, i) => (
                  <div key={d} className={`text-center text-[10px] font-bold py-1 ${i===0?'text-red-400':i===6?'text-blue-400':'text-slate-400'}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-y-1">
                {calDays.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} />
                  const dateStr  = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                  const dayItems = scheduleMap[dateStr] || []
                  const isToday  = dateStr === todayStr
                  const isSel    = dateStr === selected
                  const dow      = (i) % 7  // 요일은 첫 칸 위치로 계산
                  const colIdx   = i % 7
                  return (
                    <button key={dateStr} onClick={() => setSelected(dateStr)}
                      className={`relative flex flex-col items-center rounded-xl py-1 transition ${
                        isSel   ? 'bg-slate-800 text-white' :
                        isToday ? 'bg-teal-50 ring-1 ring-teal-300' :
                        'hover:bg-slate-50'
                      }`}>
                      <span className={`text-[12px] font-semibold ${
                        isSel ? 'text-white' :
                        colIdx===0 ? 'text-red-400' :
                        colIdx===6 ? 'text-blue-400' :
                        isToday ? 'text-teal-600' : 'text-slate-700'
                      }`}>{d}</span>
                      {/* 일정 도트 */}
                      {dayItems.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                          {dayItems.slice(0,3).map((item, j) => {
                            const tm = TYPE_META[item.type] || TYPE_META.PERSONAL
                            return <span key={j} className={`w-1 h-1 rounded-full ${isSel ? 'bg-white/70' : tm.dot}`} />
                          })}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* 선택된 날 일정 */}
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 mb-2">
                  {formatDate(selected)}
                  {selectedItems.length > 0 && <span className="ml-1.5 font-normal text-slate-400">{selectedItems.length}개</span>}
                </p>
                {selectedItems.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 py-5 text-center">
                    <p className="text-xs text-slate-300">이 날은 일정이 없어요</p>
                    <button onClick={() => { setForm(f=>({...f, date:selected})); setModalOpen(true) }}
                      className="mt-1.5 text-xs font-semibold text-teal-500 hover:text-teal-600">
                      + 일정 추가
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedItems.map((item) => (
                      <ScheduleCard key={item.id} item={item}
                        onDelete={() => deleteSchedule(item.id)}
                        onToggleStar={() => toggleHighlight(item.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 목록 뷰 ── */}
          {view === 'list' && (
            <div className="px-5 pb-6 space-y-4">
              {grouped.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
                  <p className="text-2xl mb-2">📅</p>
                  <p className="text-sm font-semibold text-slate-400">등록된 일정이 없어요</p>
                  <p className="text-xs text-slate-300 mt-1">에타 시간표를 불러오거나<br />직접 일정을 추가해보세요</p>
                </div>
              ) : (
                grouped.map(([date, items]) => (
                  <div key={date}>
                    <p className="text-xs font-bold text-slate-500 mb-2">{formatDate(date)}</p>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <ScheduleCard key={item.id} item={item}
                          onDelete={() => deleteSchedule(item.id)}
                          onToggleStar={() => toggleHighlight(item.id)} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 토스트 */}
          <div className="absolute left-0 right-0 bottom-4 px-5 space-y-2 pointer-events-none">
            {toasts.map((t) => (
              <div key={t.id} className="pointer-events-auto rounded-xl px-3.5 py-2.5 text-xs font-medium bg-slate-800 text-white shadow-lg">
                {t.msg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">일정 추가</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">제목</label>
                <input value={form.title} onChange={(e) => setForm({...form, title:e.target.value})}
                  placeholder="예: 기말고사 - 운영체제"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">날짜</label>
                <input type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">시작</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime:e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">종료</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime:e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">종류</label>
                  <select value={form.type} onChange={(e) => setForm({...form, type:e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                    {Object.entries(TYPE_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">중요도</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority:e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                    <option value="HIGH">🔴 높음</option>
                    <option value="MEDIUM">🟡 보통</option>
                    <option value="LOW">⚪ 낮음</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={addSchedule} disabled={!form.title || !form.date}
              className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold py-3 text-sm transition">
              추가하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleCard({ item, onDelete, onToggleStar }) {
  const tm     = TYPE_META[item.type] || TYPE_META.PERSONAL
  const isDday = item.type === 'DDAY'
  return (
    <div className={`rounded-2xl border p-3 transition ${item.isHighlighted ? 'border-yellow-300 bg-yellow-50/50' : 'border-slate-100 bg-slate-50/30'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tm.bg} ${tm.text}`}>{tm.label}</span>
            {item.priority === 'HIGH' && <span className="text-[10px]">🔴</span>}
            {isDday && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                {getDDayLabel(item.date)}
              </span>
            )}
          </div>
          <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
          {(item.startTime || item.endTime) && (
            <p className="text-[11px] text-slate-400 mt-0.5">{item.startTime} ~ {item.endTime}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggleStar}
            className={`transition ${item.isHighlighted ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-300'}`}>
            <Star size={16} fill={item.isHighlighted ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onDelete} className="text-slate-200 hover:text-red-400 transition">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
