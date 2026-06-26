import { useState, useMemo } from 'react'
import { Search, X, ChevronDown, ChevronUp, Heart, CreditCard, Landmark } from 'lucide-react'

// ── 카드사 혜택 데이터 (Python complete_card_dataset 동일) ───
const CARD_DATA = [
  {
    company: "카카오뱅크",
    icon: "🟡",
    benefits: {
      교통:    "K-패스 청년 30% 환급 + 전월 실적 없는 0.3% 추가 캐시백",
      주거금융: "수도권 보증금 7억 이하 대상 연 3~4%대 모바일 전용 전세 대출",
      생활비:  "배달앱, 쿠팡, 편의점 등 자취 단골 영역 최대 10% 캐시백",
    }
  },
  {
    company: "신한카드",
    icon: "🔵",
    benefits: {
      교통:    "국가 K-패스 30% 환급 + 신한 자체 대중교통 10% 청구할인",
      주거금융: "청년주택드림 청약 통장 연계 최저 연 2.0%대 장기 분양 대출",
      생활비:  "도시가스, 전기요금, 통신비 등 자취방 고정비 10% 적립",
    }
  },
  {
    company: "KB국민카드",
    icon: "🟠",
    benefits: {
      교통:    "K-패스 광역교통 30% 환급 + 이동통신요금 10% 결제 할인",
      주거금융: "정부 청년 버팀목 대출 금리 우대 매칭 및 중도수수료 면제",
      생활비:  "통신비 10%, 배달앱 10%, 올리브영 10% 자취 가계부 팩",
    }
  },
  {
    company: "우리카드",
    icon: "🔵",
    benefits: {
      교통:    "교통비 30% 마일리지 환급 + 주말 주요 마트 2천원 할인",
      주거금융: "청년 주거안정 월세 대출 실행 시 연 1~2%대 최저 금리 보장",
      생활비:  "자취방 가스/전기/수도세 자동납부 시 3천원 정액 할인 케어",
    }
  },
  {
    company: "하나카드",
    icon: "🟢",
    benefits: {
      교통:    "보장형 국가 교통 환급 30% + 커피/편의점 10% 청구할인",
      주거금융: "임차보증금 최대 90% 한도 대출 및 연 2.0% 이자 보전 연동",
      생활비:  "쿠팡/11번가 온라인 쇼핑 5% 및 배달앱 고정 지출 5% 할인",
    }
  },
  {
    company: "NH농협카드",
    icon: "🟢",
    benefits: {
      교통:    "교통비 30% 기본 정산 환급 + 오픈마켓 5% 추가 할인",
      주거금융: "정부 정책 대출 금리 최대로 우대 매칭 및 안심 상환 플랜",
      생활비:  "편의점, 다이소, 트레이더스 이용 시 5~10% 자취 맞춤 캐시백",
    }
  },
  {
    company: "삼성카드",
    icon: "⚫",
    benefits: {
      교통:    "삼성 K-패스 청년 30% 환급 + 커피/스트리밍 10% 추가할인",
      주거금융: "삼성화재 청년 자취방 전월세 화재보험 가입비 일부 전액 지원",
      생활비:  "다이소, 이마트24 등 1인 가구 초밀착 업종 최대 10% 결제일 할인",
    }
  },
  {
    company: "현대카드",
    icon: "⬛",
    benefits: {
      교통:    "현대 K-패스 청년 30% 기본 정산 + 현대카드 M포인트 연동",
      주거금융: "현대캐피탈 청년 독립 첫 중고차/주거론 우대금리 혜택 연계",
      생활비:  "쿠팡 와우 멤버십 및 네이버플러스 멤버십 이용료 최대 100% 청구할인",
    }
  },
  {
    company: "롯데카드",
    icon: "🔴",
    benefits: {
      교통:    "롯데 LOCA K-패스 청년 30% 환급 + 주유/쇼핑 할인 융합",
      주거금융: "롯데캐피탈 무주택 청년 전세 보증금 일부 안심 자금 융자 상품",
      생활비:  "독립 청년 자취방 정기구독 서비스(밀키트/생수) 결제 시 10% 할인",
    }
  },
  {
    company: "BC카드",
    icon: "🔵",
    benefits: {
      교통:    "BC 바로 K-패스 청년 30% 페이북 정산 + 편의점 할인",
      주거금융: "페이북 주택 안심 분석 서비스를 통한 등기부본 무료 열람권",
      생활비:  "자취생 홈 인프라 케어(다이소, 펫샵, 대형마트) 최대 10% 페이백",
    }
  },
]

const BENEFIT_META = {
  교통:    { bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200'     },
  주거금융: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200'  },
  생활비:  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
}

// ── 17개 지역 ───────────────────────────────────────────────
const REGIONS = ["서울","경기","인천","부산","대구","광주","대전","울산","세종","강원","충북","충남","전북","전남","경북","경남","제주"]

// ── 30개 복지 정책 (Python base_policies 동일) ───────────────
const BASE_POLICIES = [
  "청년월세 특별지원 사업",
  "청년 주거급여 분리지급",
  "임차보증금 이자지원 사업",
  "청년 전세보증금 반환보증료 지원",
  "독립 청년 이사비 및 중개보수 지원",
  "1인 가구 안심장비 지원 (도어락/CCTV)",
  "청년 전용 버팀목 주거안정대출",
  "청년 매입임대주택 공급사업",
  "자취생 전세사기 피해 예방 교육 및 컨설팅",
  "1인 가구 안심 귀가 스카우트 서비스",
  "청년 월세 대출이자 이차보전",
  "자취방 맞춤형 집수리/방역 클린케어",
  "청년 전용 공유공간 및 소셜다이닝 지원",
  "독립 청년 건강지원 (밀키트/영양제 바우처)",
  "1인 가구 고립방지 안심 콜 서비스",
  "청년 주택 드림 청약 연계 대출",
  "지자체 자체 청년 주거 수당",
  "자취생 공과금 및 기본 가스/전기료 감면",
  "청년 문화 주거 융합 카드",
  "자취생 긴급 생활안정자금 대출",
  "청년 취업준비생 주거안정 월세자금 대출",
  "1인 가구 맞춤형 안심택배함 운영",
  "청년 전세임대주택 입주자 모집",
  "지자체 청년 전입환영 웰컴박스 지원",
  "자취방 중고 가전/가구 리사이클링 지원",
  "독립 청년 종합 부동산/법률 상담 서비스",
  "청년 맞춤형 공공임대 행복주택 공급",
  "1인 가구 반려동물 돌봄 및 치료비 지원",
  "독립 청년 심리상담 및 힐링케어 바우처",
  "지자체 청년 주거 실태조사 참여 마일리지",
]

// ── 30개 혜택 내용 (Python details 동일) ────────────────────
const DETAILS = [
  "매달 최대 20만 원씩 최대 24개월간 월세 지원금 현금 지급",
  "부모 가구와 별개로 청년 본인 계좌로 주거급여 매달 직접 입금",
  "전세 및 보증부 월세 대출 이자 중 연 최대 2.0% 지자체 대납 지원",
  "HUG 전세보증보험 가입 시 납부한 보증료 전액 계좌 환급 (최대 30만 원)",
  "독립 시 발생한 부동산 복비 및 이사 용역비 실비 최대 50만 원 환급",
  "스마트 도어락, 창문 잠금장치, 휴대용 비상벨 등 자취생 안심 3종 세트 무료 설치",
  "연 1.8%~2.7% 국토부 청년 특화 저금리 전세 자금 대출 연계",
  "공공기관이 주택을 매입하여 청년 자취생에게 시세 30% 이하로 임대 제공",
  "공인중개사 연계 자취방 계약서 사전 진단 및 전세사기 예방 1:1 컨설팅",
  "야간 귀가 시 청년 자취 밀집 지역 대상 안심 동행 대원 전담 마크 지원",
  "시중은행 청년 월세 대출 이용 시 발생 이자 지자체 재원으로 대납",
  "오래된 자취방 도배/장판 전액 지원 및 주기적인 해충 방역/소독 케어 서비스",
  "혼밥하는 자취생들을 모아 함께 요리하고 소통하는 커뮤니티 공간 및 식재료 지원",
  "불규칙한 식습관을 가진 독립 청년 전용 고품질 밀키트 및 필수 비타민 바우처 지급",
  "1인 가구의 위급상황 대비 및 주기적인 생활 안부 확인 인공지능 콜 서비스 연동",
  "청약 당첨 시 분양가의 최대 80%를 2%대 저금리로 대출해 주는 전용 금융 우대",
  "정부 정책과 별개로 해당 지자체 거주 청년에게 무조건 지급하는 매달 10만 원의 주거수당",
  "자취 가구의 난방비, 가스비, 전기세 등 동절기/하절기 에너지 취약 고정비 일부 감면",
  "자취 라이프를 위한 도서 구매, 전시회, 문화 공연 관람용 연 20만 원 포인트 지급",
  "실직이나 질병으로 고정 소득이 끊긴 독립 청년을 위한 무이자 긴급 생활비 대출",
  "취업 준비 기간 동안 주거 안정 유지를 위한 저리 월세 비용 특별 융자 상품",
  "자취 밀집 구역 내 안심 무인 택배함을 설치하여 택배 분실 및 범죄 사전 차단",
  "정부 보증을 통해 원하는 전세 주택을 구하면 LH가 대신 계약 후 재임대 정책",
  "타 지역에서 전입신고 시 종량제 봉투, 구급함, 지역 화폐가 담긴 웰컴 박스 증정",
  "지자체 리사이클링 센터와 연계하여 자취 가전/가구를 무상 기증 및 배송 지원",
  "전월세 임대차 계약 분쟁, 전세금 미반환 소송 관련 청년 전담 변호사 무료 매칭",
  "역세권 인근 청년 1인 가구 맞춤형 설계 풀옵션 행복주택 우선 입주 자격 부여",
  "자취방에서 함께 사는 반려동물의 예방접종 및 긴급 수술/치료비 연 최대 50만 원 지원",
  "홀로서기 과정에서 오는 우울증, 고립감 해소를 위한 전문 심리상담 센터 정기 이용권",
  "지역 청년 주거 만족도 실태조사 응답 완료 시 지역사랑상품권 3만 원권 즉시 발급",
]

// ── 카테고리 (30개, idx 순서) ────────────────────────────────
const CATS = [
  { label:'주거비', bg:'bg-emerald-100', text:'text-emerald-700' },
  { label:'주거비', bg:'bg-emerald-100', text:'text-emerald-700' },
  { label:'금융',   bg:'bg-blue-100',    text:'text-blue-700'    },
  { label:'금융',   bg:'bg-blue-100',    text:'text-blue-700'    },
  { label:'주거비', bg:'bg-emerald-100', text:'text-emerald-700' },
  { label:'안전',   bg:'bg-rose-100',    text:'text-rose-700'    },
  { label:'금융',   bg:'bg-blue-100',    text:'text-blue-700'    },
  { label:'주택',   bg:'bg-teal-100',    text:'text-teal-700'    },
  { label:'안전',   bg:'bg-rose-100',    text:'text-rose-700'    },
  { label:'안전',   bg:'bg-rose-100',    text:'text-rose-700'    },
  { label:'금융',   bg:'bg-blue-100',    text:'text-blue-700'    },
  { label:'생활',   bg:'bg-violet-100',  text:'text-violet-700'  },
  { label:'커뮤니티', bg:'bg-orange-100', text:'text-orange-700' },
  { label:'건강',   bg:'bg-pink-100',    text:'text-pink-700'    },
  { label:'안전',   bg:'bg-rose-100',    text:'text-rose-700'    },
  { label:'금융',   bg:'bg-blue-100',    text:'text-blue-700'    },
  { label:'주거비', bg:'bg-emerald-100', text:'text-emerald-700' },
  { label:'생활',   bg:'bg-violet-100',  text:'text-violet-700'  },
  { label:'문화',   bg:'bg-yellow-100',  text:'text-yellow-700'  },
  { label:'금융',   bg:'bg-blue-100',    text:'text-blue-700'    },
  { label:'금융',   bg:'bg-blue-100',    text:'text-blue-700'    },
  { label:'안전',   bg:'bg-rose-100',    text:'text-rose-700'    },
  { label:'주택',   bg:'bg-teal-100',    text:'text-teal-700'    },
  { label:'생활',   bg:'bg-violet-100',  text:'text-violet-700'  },
  { label:'생활',   bg:'bg-violet-100',  text:'text-violet-700'  },
  { label:'법률',   bg:'bg-slate-100',   text:'text-slate-600'   },
  { label:'주택',   bg:'bg-teal-100',    text:'text-teal-700'    },
  { label:'생활',   bg:'bg-violet-100',  text:'text-violet-700'  },
  { label:'건강',   bg:'bg-pink-100',    text:'text-pink-700'    },
  { label:'기타',   bg:'bg-slate-100',   text:'text-slate-600'   },
]

const CAT_LABELS = ['전체', '주거비', '금융', '안전', '주택', '생활', '건강', '문화', '커뮤니티', '법률', '기타']

// ── 정적 데이터 생성 (Python welfare_dataset 동일 로직) ──────
const POLICY_DATA = BASE_POLICIES.map((policy, idx) => ({
  name: policy,
  ageLimit: idx % 2 === 0 ? "만 19~34세" : "만 19~39세",
  source: idx % 3 === 0 ? "정책브리핑" : "공공데이터포털",
  detail: DETAILS[idx],
  cat: CATS[idx],
}))

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function WelfareModule() {
  const [subTab, setSubTab]     = useState("policy") // "policy" | "card"
  const [region, setRegion]     = useState("부산") // 도현 거주지 기본값
  const [query, setQuery]       = useState("")
  const [catFilter, setCatFilter] = useState("전체")
  const [expanded, setExpanded] = useState(null)
  const [saved, setSaved]       = useState(new Set())
  const [cardExpanded, setCardExpanded] = useState(null)

  const filtered = useMemo(() =>
    POLICY_DATA.filter((item) => {
      const matchQ   = !query || item.name.includes(query) || item.detail.includes(query)
      const matchCat = catFilter === "전체" || item.cat.label === catFilter
      return matchQ && matchCat
    }), [query, catFilter]
  )

  const toggleSave = (idx) => {
    setSaved((s) => {
      const next = new Set(s)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const clearQuery = () => { setQuery(""); setExpanded(null) }

  return (
    <div className="w-full flex items-start justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="relative bg-white rounded-[2.25rem] shadow-2xl ring-1 ring-slate-200 overflow-hidden">

          {/* 노치 */}
          <div className="h-6 flex items-center justify-center bg-white">
            <div className="w-24 h-1.5 rounded-full bg-slate-200" />
          </div>

          {/* 헤더 */}
          <div className="px-5 pt-1 pb-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-400">청년 복지 정책</p>
              <p className="text-lg font-bold text-slate-800">도현님 🏛️</p>
            </div>
            <p className="text-[11px] text-slate-400 mb-0.5">
              {subTab === "policy"
                ? <><span className="font-bold text-teal-600">{region}</span> · {filtered.length}개</>
                : <><span className="font-bold text-teal-600">10대 카드사</span> · 3종 혜택</>}
            </p>
          </div>

          {/* 서브탭 */}
          <div className="px-5 mb-4 flex gap-2">
            <button onClick={() => { setSubTab("policy"); setExpanded(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                subTab === "policy"
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>
              <Landmark size={13} /> 정책 복지
            </button>
            <button onClick={() => { setSubTab("card"); setCardExpanded(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                subTab === "card"
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>
              <CreditCard size={13} /> 카드 혜택
            </button>
          </div>

          {/* ── 카드 혜택 탭 ── */}
          {subTab === "card" && (
            <div className="px-5 pb-6 space-y-2.5">
              <div className="rounded-xl bg-sky-50 ring-1 ring-sky-100 px-3 py-2.5 mb-3">
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  💳 10대 카드사의 <span className="font-bold">교통 · 주거금융 · 생활비</span> 혜택을 한눈에 비교해요.
                  K-패스 교통 환급은 모든 카드사 공통 30% 지원이에요.
                </p>
              </div>
              {CARD_DATA.map((card, i) => (
                <div key={card.company} className="rounded-2xl border border-slate-100 overflow-hidden">
                  <button onClick={() => setCardExpanded(cardExpanded === i ? null : i)}
                    className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{card.icon}</span>
                      <p className="text-sm font-bold text-slate-800">{card.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Object.keys(card.benefits).map((k) => (
                          <span key={k} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${BENEFIT_META[k].bg} ${BENEFIT_META[k].text}`}>{k}</span>
                        ))}
                      </div>
                      {cardExpanded === i
                        ? <ChevronUp size={14} className="text-slate-400" />
                        : <ChevronDown size={14} className="text-slate-300" />}
                    </div>
                  </button>
                  {cardExpanded === i && (
                    <div className="px-3.5 pb-3.5 space-y-2 border-t border-slate-100">
                      {Object.entries(card.benefits).map(([type, desc]) => {
                        const m = BENEFIT_META[type]
                        return (
                          <div key={type} className={`rounded-xl border ${m.border} px-3 py-2.5`}>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.bg} ${m.text}`}>{type}</span>
                            <p className="text-[12px] text-slate-700 leading-relaxed mt-1.5">{desc}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── 정책 복지 탭 ── */}
          {subTab === "policy" && <>

          {/* 지역 선택 */}
          <div className="px-5 mb-3">
            <div className="grid grid-cols-5 gap-1">
              {REGIONS.map((r) => (
                <button key={r} onClick={() => { setRegion(r); setExpanded(null) }}
                  className={`rounded-lg py-1 text-[11px] font-semibold transition ${
                    r === region
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 검색 */}
          <div className="px-5 mb-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => { setQuery(e.target.value); setExpanded(null) }}
                placeholder="정책명 또는 혜택 내용 검색..."
                className="w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 pl-8 pr-8 py-2 text-xs focus:outline-none focus:ring-teal-300" />
              {query && (
                <button onClick={clearQuery} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="px-5 mb-3 overflow-x-auto">
            <div className="flex gap-1.5 w-max">
              {CAT_LABELS.map((cat) => (
                <button key={cat} onClick={() => { setCatFilter(cat); setExpanded(null) }}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap transition ${
                    catFilter === cat
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 복지 목록 */}
          <div className="px-5 pb-6 space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-semibold text-slate-400">검색 결과가 없어요</p>
                <button onClick={clearQuery} className="mt-2 text-xs text-teal-600 font-semibold">초기화</button>
              </div>
            ) : (
              filtered.map((item, i) => {
                const globalIdx = POLICY_DATA.indexOf(item)
                const isExpanded = expanded === i
                const isSaved = saved.has(globalIdx)
                return (
                  <div key={i} className={`rounded-2xl border transition ${
                    isSaved ? 'border-pink-200 bg-pink-50/30' : 'border-slate-100 bg-slate-50/20'
                  }`}>
                    {/* 카드 헤더 (항상 표시) */}
                    <button onClick={() => setExpanded(isExpanded ? null : i)}
                      className="w-full text-left p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.cat.bg} ${item.cat.text}`}>
                              {item.cat.label}
                            </span>
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
                              {item.ageLimit}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.source}</span>
                          </div>
                          <p className="text-[13px] font-bold text-slate-800 leading-snug">{region} {item.name}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          <button onClick={(e) => { e.stopPropagation(); toggleSave(globalIdx) }}
                            className={`transition ${isSaved ? 'text-pink-500' : 'text-slate-200 hover:text-pink-300'}`}>
                            <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
                          </button>
                          {isExpanded
                            ? <ChevronUp size={15} className="text-slate-400" />
                            : <ChevronDown size={15} className="text-slate-300" />}
                        </div>
                      </div>
                    </button>

                    {/* 확장 내용 */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-slate-100">
                        <div className="mt-2 rounded-xl bg-teal-50 ring-1 ring-teal-100 px-3 py-2.5">
                          <p className="text-[10px] font-bold text-teal-600 mb-1">✅ 실질 지원 내용</p>
                          <p className="text-[12px] text-teal-900 leading-relaxed">{item.detail}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5">
                          <p className="text-[10px] font-bold text-slate-500 mb-1">📋 신청 대상 조건</p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {region} 관내에 주민등록 전입신고를 필한 무주택 1인 가구 독립 청년
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
          </>}

        </div>
      </div>
    </div>
  )
}
