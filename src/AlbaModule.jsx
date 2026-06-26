import { useState } from 'react'
import { RefreshCw, Search, CheckCircle2 } from 'lucide-react'

// ── 알바 데이터 (Java AlbaRecommender 동일) ─────────────────
const CATEGORY_LABEL = {
  CAFE: '카페', RESTAURANT: '식당', CONVENIENCE_STORE: '편의점',
  TUTORING: '과외', DELIVERY: '배달',
}

const ALBA_POOL = [
  { id:'A001', storeName:'스타벅스 건대점',  location:'광진구',   category:'CAFE',              availableDays:[1,3,5], shiftStart:'14:00', shiftEnd:'18:00', hourlyWage:10030, contact:'010-1234-5678', urgent:false },
  { id:'A002', storeName:'CU 편의점 홍대점', location:'마포구',   category:'CONVENIENCE_STORE', availableDays:[2,4],   shiftStart:'18:00', shiftEnd:'22:00', hourlyWage:10030, contact:'010-9876-5432', urgent:false },
  { id:'A003', storeName:'맥도날드 신촌점',  location:'서대문구', category:'RESTAURANT',         availableDays:[6,0],   shiftStart:'10:00', shiftEnd:'15:00', hourlyWage:10200, contact:'010-5555-1234', urgent:true  },
  { id:'A004', storeName:'과외 (수학/영어)', location:'온라인',   category:'TUTORING',          availableDays:[1,2,3,4,5], shiftStart:'16:00', shiftEnd:'19:00', hourlyWage:20000, contact:'앱 내 매칭', urgent:false },
  { id:'A005', storeName:'쿠팡이츠 배달',    location:'전지역',   category:'DELIVERY',          availableDays:[0,1,2,3,4,5,6], shiftStart:'11:00', shiftEnd:'21:00', hourlyWage:11000, contact:'앱 다운로드', urgent:false },
]

// ── 공강 계산 (Java ScheduleManager.getFreeSlots 포팅) ──────
function timeToMins(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minsToStr(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

function getFreeSlots(schedules, dateStr) {
  const classItems = schedules
    .filter((s) => s.date === dateStr && s.type === 'CLASS')
    .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime))

  let cursor = timeToMins('08:00')
  const dayEnd = timeToMins('22:00')
  const slots = []

  for (const s of classItems) {
    const ss = timeToMins(s.startTime)
    const se = timeToMins(s.endTime)
    if (cursor < ss) slots.push({ start: cursor, end: ss })
    if (se > cursor) cursor = se
  }
  if (cursor < dayEnd) slots.push({ start: cursor, end: dayEnd })

  return slots.filter((s) => s.end - s.start >= 60) // 최소 1시간
}

const DAY_KOR = ['일', '월', '화', '수', '목', '금', '토']

// Java AlbaRecommender.recommendByFreeTime 포팅
function analyzeAndRecommend(schedules) {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  const weekFree = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay()
    const freeSlots = getFreeSlots(schedules, dateStr)
    if (freeSlots.length > 0) {
      weekFree.push({ dayLabel: DAY_KOR[dayOfWeek] + '요일', dayOfWeek, freeSlots })
    }
  }

  // 공강 시간에 맞는 알바 필터링
  const matched = new Map()
  for (const day of weekFree) {
    for (const alba of ALBA_POOL) {
      if (!alba.availableDays.includes(day.dayOfWeek)) continue
      const aStart = timeToMins(alba.shiftStart)
      const aEnd   = timeToMins(alba.shiftEnd)
      for (const slot of day.freeSlots) {
        if (slot.start <= aStart && slot.end >= aEnd) {
          if (!matched.has(alba.id)) matched.set(alba.id, { alba, matchedDays: 0 })
          matched.get(alba.id).matchedDays++
        }
      }
    }
  }

  const recommendations = [...matched.values()].sort((a, b) => b.alba.hourlyWage - a.alba.hourlyWage)
  return { weekFree, recommendations }
}

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function AlbaModule({ schedules }) {
  const [analyzed, setAnalyzed] = useState(false)
  const [weekFree, setWeekFree] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [applied, setApplied] = useState(new Set())
  const [toasts, setToasts] = useState([])

  const notify = (msg, kind = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }

  const analyze = () => {
    const hasClass = schedules.some((s) => s.type === 'CLASS')
    if (!hasClass) { notify('일정 탭에서 시간표를 먼저 불러오세요', 'warn'); return }
    const { weekFree, recommendations } = analyzeAndRecommend(schedules)
    setWeekFree(weekFree)
    setRecommendations(recommendations)
    setAnalyzed(true)
  }

  const apply = (alba) => {
    setApplied((s) => new Set([...s, alba.id]))
    notify(`${alba.storeName} 지원 완료! ${alba.contact}로 결과를 알려드립니다.`, 'ok')
  }

  const reset = () => { setAnalyzed(false); setWeekFree([]); setRecommendations([]); setApplied(new Set()) }

  const monthlyEstimate = (alba, matchedDays) => {
    const hours = (timeToMins(alba.shiftEnd) - timeToMins(alba.shiftStart)) / 60
    return (alba.hourlyWage * hours * matchedDays * 4).toLocaleString('ko-KR')
  }

  const hasClass = schedules.some((s) => s.type === 'CLASS')

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
              <p className="text-xs text-slate-400">공강 기반 알바 추천</p>
              <p className="text-lg font-bold text-slate-800">도현님 💼</p>
            </div>
            {analyzed && (
              <button onClick={reset} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs">
                <RefreshCw size={14} /> 다시
              </button>
            )}
          </div>

          {!analyzed ? (
            <div className="px-5 pb-8">
              <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 p-4 mb-4">
                <p className="text-sm font-bold text-emerald-800 mb-1">💡 공강 기반 알바 추천</p>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  이번 주 시간표를 분석해서 수업과 겹치지 않는 공강 시간에 할 수 있는 알바를 자동으로 추천해드려요.
                </p>
              </div>
              <button onClick={analyze}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 text-sm transition">
                <Search size={16} /> 이번 주 공강 분석하기
              </button>
              {!hasClass && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  ⚠️ 일정 탭에서 시간표를 먼저 불러와야 해요
                </p>
              )}
            </div>
          ) : (
            <div className="px-5 pb-6 space-y-5">

              {/* 공강 시간대 */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">🕐 이번 주 공강 시간대</p>
                {weekFree.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">공강 시간이 없어요</p>
                ) : (
                  <div className="space-y-2">
                    {weekFree.map(({ dayLabel, freeSlots }) => (
                      <div key={dayLabel} className="flex gap-3 items-start">
                        <span className="text-[11px] font-bold text-slate-500 w-14 shrink-0 pt-0.5">{dayLabel}</span>
                        <div className="flex flex-wrap gap-1">
                          {freeSlots.map((slot, i) => (
                            <span key={i} className="text-[10px] bg-sky-50 ring-1 ring-sky-200 text-sky-700 rounded px-1.5 py-0.5 font-medium">
                              {minsToStr(slot.start)}~{minsToStr(slot.end)} ({Math.round((slot.end - slot.start) / 60)}h)
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 알바 추천 목록 */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">✅ 추천 알바 목록</p>
                {recommendations.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 py-6 text-center">
                    <p className="text-sm text-slate-400">공강 시간에 맞는 알바를 찾지 못했어요</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map(({ alba, matchedDays }) => (
                      <AlbaCard key={alba.id} alba={alba} matchedDays={matchedDays}
                        applied={applied.has(alba.id)}
                        onApply={() => apply(alba)}
                        monthlyEstimate={monthlyEstimate(alba, matchedDays)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 토스트 */}
          <div className="absolute left-0 right-0 bottom-4 px-5 space-y-2 pointer-events-none">
            {toasts.map((t) => (
              <div key={t.id} className={`pointer-events-auto rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-lg ${
                t.kind === 'ok'   ? 'bg-emerald-600 text-white' :
                t.kind === 'warn' ? 'bg-amber-500 text-white'   :
                                    'bg-slate-800 text-white'
              }`}>
                {t.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AlbaCard({ alba, matchedDays, applied, onApply, monthlyEstimate }) {
  const catLabel = CATEGORY_LABEL[alba.category] || alba.category
  const durationH = (timeToMins(alba.shiftEnd) - timeToMins(alba.shiftStart)) / 60

  return (
    <div className={`rounded-2xl border p-3.5 transition ${applied ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 bg-slate-50/30'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex gap-1.5">
          {alba.urgent && <span className="text-[10px] font-bold bg-red-100 text-red-600 rounded px-1.5 py-0.5">🚨 급구</span>}
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{catLabel}</span>
        </div>
        <span className="text-xs font-bold text-slate-700 shrink-0">시급 {alba.hourlyWage.toLocaleString()}원</span>
      </div>

      <p className="font-bold text-slate-800 text-sm">{alba.storeName}</p>
      <p className="text-[11px] text-slate-400 mb-2">{alba.location} · {alba.shiftStart}~{alba.shiftEnd} ({durationH}h)</p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-slate-400">예상 월수입 ({matchedDays}일/주 기준)</p>
          <p className="text-sm font-bold text-emerald-600">{monthlyEstimate}원</p>
        </div>
        <button onClick={onApply} disabled={applied}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            applied ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}>
          {applied ? <><CheckCircle2 size={13} /> 지원완료</> : '지원하기'}
        </button>
      </div>
    </div>
  )
}
