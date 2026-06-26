import { useState } from 'react'
import { Calendar, Zap, Briefcase, HeartHandshake } from 'lucide-react'
import DohyeonPayApp from './OnYou'
import ScheduleModule from './ScheduleModule'
import AlbaModule from './AlbaModule'
import WelfareModule from './WelfareModule'

const TABS = [
  { id: 'schedule', label: '일정',   Icon: Calendar       },
  { id: 'bills',    label: '공과금', Icon: Zap            },
  { id: 'alba',     label: '알바',   Icon: Briefcase      },
  { id: 'welfare',  label: '복지',   Icon: HeartHandshake },
]

export default function App() {
  const [tab, setTab] = useState('bills')
  const [schedules, setSchedules] = useState([])

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="pb-16">
        {tab === 'schedule' && <ScheduleModule schedules={schedules} setSchedules={setSchedules} />}
        {tab === 'bills'    && <DohyeonPayApp />}
        {tab === 'alba'     && <AlbaModule schedules={schedules} />}
        {tab === 'welfare'  && <WelfareModule />}
      </div>

      {/* 하단 탭 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
              tab === id ? 'text-teal-600' : 'text-slate-400 hover:text-slate-500'
            }`}>
            <Icon size={20} strokeWidth={tab === id ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
