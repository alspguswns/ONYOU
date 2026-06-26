import { useState, useMemo } from "react";
import {
    Home, Flame, Zap, Droplet, Wifi, Bus, Tv, Wallet, Bell, Check,
    AlertTriangle, RefreshCw, Plus, Clock, CheckCircle2,
    X, Info, Sparkles, MessageSquareText, Edit3, ChevronDown, ChevronUp,
    Share2, Camera,
} from "lucide-react";

const CATEGORY_META = {
    rent:    { label: "월세",    Icon: Home,    color: "emerald", tip: "계약 직후 전입신고·확정일자를 꼭 받아두세요. 보증금을 지키는 최소한의 안전장치예요. 월세는 매달 같은 날 나가니 자동이체를 걸어두면 깜빡할 일이 없어요." },
    gas:     { label: "도시가스", Icon: Flame,   color: "orange",  tip: "겨울 난방철엔 요금이 2~3배로 뛰어요. 외출할 땐 보일러 '외출모드'를 쓰면 꽤 아껴져요." },
    elec:    { label: "전기요금", Icon: Zap,     color: "yellow",  tip: "전기는 '누진제'라 많이 쓸수록 단가가 확 올라가요. 특히 여름 에어컨 사용에 주의하세요." },
    water:   { label: "수도세",   Icon: Droplet, color: "sky",     tip: "수도세는 보통 2개월에 한 번 청구되거나 관리비에 포함되기도 해요. 내 고지 주기를 확인해두면 깜빡하지 않아요." },
    net:     { label: "인터넷",   Icon: Wifi,    color: "blue",    tip: "보통 2~3년 '약정'이 걸려 있어 중간에 해지하면 위약금이 나와요. 약정기간과 위약금을 꼭 확인하세요." },
    transit: { label: "교통비",   Icon: Bus,     color: "teal",    tip: "대중교통을 자주 탄다면 정기권이나 환급형 교통카드를 알아보세요. 매달 새는 교통비를 꽤 아낄 수 있어요." },
    sub:     { label: "구독료",   Icon: Tv,      color: "violet",  tip: "안 보는 구독은 매달 조용히 빠져나가요. 가끔 '이번 달에 진짜 썼나?' 점검하고, 무료체험은 해지일을 꼭 메모해두세요." },
};

const COLOR = {
    emerald: { bg:"bg-emerald-100", text:"text-emerald-600", border:"border-emerald-200", light:"bg-emerald-50/40", btn:"bg-emerald-600 hover:bg-emerald-700", tip:"bg-emerald-50 ring-emerald-100 text-emerald-800", tipIcon:"text-emerald-500", badge:"bg-emerald-100 text-emerald-700", section:"border-emerald-100" },
    orange:  { bg:"bg-orange-100",  text:"text-orange-500",  border:"border-orange-200",  light:"bg-orange-50/30",  btn:"bg-orange-500 hover:bg-orange-600",   tip:"bg-orange-50 ring-orange-100 text-orange-800",  tipIcon:"text-orange-400",  badge:"bg-orange-100 text-orange-700",  section:"border-orange-100" },
    yellow:  { bg:"bg-yellow-100",  text:"text-yellow-600",  border:"border-yellow-200",  light:"bg-yellow-50/30",  btn:"bg-yellow-500 hover:bg-yellow-600",   tip:"bg-yellow-50 ring-yellow-100 text-yellow-800",  tipIcon:"text-yellow-500",  badge:"bg-yellow-100 text-yellow-700",  section:"border-yellow-100" },
    sky:     { bg:"bg-sky-100",     text:"text-sky-600",     border:"border-sky-200",     light:"bg-sky-50/30",     btn:"bg-sky-500 hover:bg-sky-600",         tip:"bg-sky-50 ring-sky-100 text-sky-800",           tipIcon:"text-sky-500",     badge:"bg-sky-100 text-sky-700",     section:"border-sky-100" },
    blue:    { bg:"bg-blue-100",    text:"text-blue-600",    border:"border-blue-200",    light:"bg-blue-50/30",    btn:"bg-blue-600 hover:bg-blue-700",       tip:"bg-blue-50 ring-blue-100 text-blue-800",        tipIcon:"text-blue-500",    badge:"bg-blue-100 text-blue-700",   section:"border-blue-100" },
    teal:    { bg:"bg-teal-100",    text:"text-teal-600",    border:"border-teal-200",    light:"bg-teal-50/30",    btn:"bg-teal-600 hover:bg-teal-700",       tip:"bg-teal-50 ring-teal-100 text-teal-800",        tipIcon:"text-teal-500",    badge:"bg-teal-100 text-teal-700",   section:"border-teal-100" },
    violet:  { bg:"bg-violet-100",  text:"text-violet-600",  border:"border-violet-200",  light:"bg-violet-50/30",  btn:"bg-violet-600 hover:bg-violet-700",   tip:"bg-violet-50 ring-violet-100 text-violet-800",  tipIcon:"text-violet-500",  badge:"bg-violet-100 text-violet-700", section:"border-violet-100" },
};

const UTILITY_PRESETS = [
    { key:"gas",   label:"도시가스", icon:"🔥", defaultAmount:38000, biller:"부산도시가스",  sms:"[Web발신] 부산도시가스 6월분 요금 38,000원 청구. 납부기한 07/02" },
    { key:"elec",  label:"전기요금", icon:"⚡", defaultAmount:27000, biller:"한국전력",      sms:"[한국전력] 전기요금 27,000원 청구. 납부기한 07/04. 미납 시 연체료 발생" },
    { key:"water", label:"수도세",   icon:"💧", defaultAmount:15000, biller:"부산시 상수도", sms:"[Web발신] 수도요금 15,000원 청구. 납부기한 07/10" },
    { key:"net",   label:"인터넷",   icon:"📡", defaultAmount:33000, biller:"LG U+",         sms:"[Web발신] LG U+ 인터넷 33,000원 자동납부 예정. 07/06" },
];

const SUB_PRESETS = [
    { name:"넷플릭스",        price:17000, icon:"🎬" },
    { name:"티빙",            price:13900, icon:"📺" },
    { name:"쿠팡플레이",      price:7890,  icon:"🛒" },
    { name:"왓챠",            price:12900, icon:"🎥" },
    { name:"디즈니+",         price:9900,  icon:"✨" },
    { name:"유튜브 프리미엄", price:14900, icon:"▶️" },
    { name:"Spotify",         price:10900, icon:"🎵" },
    { name:"멜론",            price:10900, icon:"🎵" },
    { name:"ChatGPT Plus",    price:27000, icon:"🤖" },
    { name:"Claude Pro",      price:22000, icon:"🤖" },
    { name:"Adobe CC",        price:30000, icon:"🎨" },
];

// 자동 감지 시뮬레이션 데이터
const DETECTED_RENT = {
    id:"rent_auto", cat:"rent", label:"월세", biller:"집주인",
    amount:450000, dday:5,
    sms:"[Web발신] 6월 월세 450,000원 입금 안내드립니다. 매월 5일까지 부탁드려요.",
};
const DETECTED_TRANSIT = {
    id:"transit_auto", cat:"transit", label:"교통비", biller:"교통 정기권",
    amount:62000, dday:7,
    sms:"[Web발신] 교통비 정기권 만료 예정. 갱신 금액 62,000원",
};

// 문자 파싱
function parseSms(text) {
    const amountMatch = text.match(/([0-9,]+)\s*원/);
    const ddayMatch   = text.match(/(\d{1,2})[\/\-.](\d{1,2})/);
    const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g,""), 10) : null;
    let dday = null;
    if (ddayMatch) {
        const today  = new Date();
        const month  = parseInt(ddayMatch[1], 10);
        const day    = parseInt(ddayMatch[2], 10);
        const target = new Date(today.getFullYear(), month - 1, day);
        if (target < today) target.setFullYear(today.getFullYear() + 1);
        dday = Math.ceil((target - today) / (1000*60*60*24));
    }
    return { amount, dday };
}

const won = (n) => Number(n||0).toLocaleString("ko-KR") + "원";
const APP_TEAL = "#16A085";

const STATUS_META = {
    paid:   { label:"납부 완료",        cls:"bg-emerald-50 text-emerald-700 ring-emerald-200", Icon:CheckCircle2 },
    failed: { label:"잔고 부족 · 실패", cls:"bg-red-50 text-red-700 ring-red-200",             Icon:AlertTriangle },
    auto:   { label:"자동이체 예정",    cls:"bg-sky-50 text-sky-700 ring-sky-200",              Icon:RefreshCw },
    due:    { label:"납부 대기",        cls:"bg-amber-50 text-amber-700 ring-amber-200",        Icon:Clock },
};

const SMS_EXAMPLES = {
    rent:    "[Web발신] 7월 월세 450,000원 입금 부탁드립니다. 납부기한 07/05",
    gas:     "[Web발신] 부산도시가스 7월분 38,000원 청구. 납부기한 07/02",
    elec:    "[한국전력] 전기요금 27,000원 청구. 납부기한 07/04",
    water:   "[Web발신] 수도요금 15,000원 청구. 납부기한 07/10",
    net:     "[Web발신] LG U+ 인터넷 33,000원 자동납부 예정. 07/06",
    transit: "[Web발신] 교통비 정기권 갱신 금액 62,000원. 납부기한 07/07",
};

// ── 메인 ─────────────────────────────────────────────────────
export default function DohyeonPayApp() {
    const [balance, setBalance]             = useState(130000);
    const [bills, setBills]                 = useState([]);
    const [rentDetected, setRentDetected]   = useState(true);
    const [transitDetected, setTransitDetected] = useState(true);
    const [toasts, setToasts]               = useState([]);
    const [topUpOpen, setTopUpOpen]         = useState(false);
    const [utilityOpen, setUtilityOpen]     = useState(false);
    const [subOpen, setSubOpen]             = useState(false);
    const [shareModal, setShareModal]       = useState(null); // { cat, billId? }
    const [openTip, setOpenTip]             = useState(null);

    const notify = (msg, kind="info") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((t) => [...t, { id, msg, kind }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };

    const payStatus = useMemo(() => {
        if (bills.some((b) => b.status==="failed")) return "failed";
        if (bills.length>0 && bills.every((b) => b.status==="paid")) return "done";
        return "ready";
    }, [bills]);

    const addBill = (bill) =>
        setBills((bs) => [...bs, { ...bill, id:bill.id||Math.random().toString(36).slice(2), autopay:true, status:"auto" }]);

    const addRent = () => {
        addBill({ id:DETECTED_RENT.id, cat:"rent", name:"월세", biller:DETECTED_RENT.biller, amount:DETECTED_RENT.amount, dday:DETECTED_RENT.dday });
        setRentDetected(false); notify("월세 등록 완료","ok");
    };
    const addTransit = () => {
        addBill({ id:DETECTED_TRANSIT.id, cat:"transit", name:"교통비", biller:DETECTED_TRANSIT.biller, amount:DETECTED_TRANSIT.amount, dday:DETECTED_TRANSIT.dday });
        setTransitDetected(false); notify("교통비 등록 완료","ok");
    };
    const addUtility = (preset) => {
        if (bills.some((b) => b.cat===preset.key)) return;
        addBill({ cat:preset.key, name:preset.label, biller:preset.biller, amount:preset.defaultAmount, dday:4 });
        notify(`${preset.label} 등록 완료`,"ok");
    };
    const addSub = (sub) => {
        addBill({ cat:"sub", name:sub.name, biller:sub.name, amount:sub.price, dday:5 });
        notify(`${sub.name} 등록 완료`,"ok");
    };

    // 문자 공유 처리 (신규 등록 or 금액 업데이트)
    const handleShare = (cat, text, biller) => {
        const { amount, dday } = parseSms(text);
        if (!amount) { notify("금액을 찾을 수 없어요. 문자를 다시 확인해주세요.","fail"); return; }
        const existing = bills.find((b) => b.cat===cat);
        if (existing) {
            setBills((bs) => bs.map((b) => b.id===existing.id ? { ...b, amount, dday:dday??b.dday } : b));
            notify(`${existing.name} 금액 업데이트 (${won(amount)})`,"ok");
        } else {
            const meta = CATEGORY_META[cat];
            addBill({ cat, name:meta.label, biller:biller||meta.label, amount, dday:dday??5 });
            notify(`${meta.label} 등록 완료 (${won(amount)})`,"ok");
        }
        setShareModal(null);
    };

    const payNow = (bill) => {
        if (bill.status==="paid") return;
        if (balance<bill.amount) { notify(`잔고가 부족해요. ${won(bill.amount-balance)} 더 필요합니다.`,"fail"); return; }
        setBalance((b) => b-bill.amount);
        setBills((bs) => bs.map((b) => b.id===bill.id ? { ...b, status:"paid" } : b));
        notify(`${bill.name} 납부 완료 (${won(bill.amount)})`,"ok");
    };
    const removeBill = (id) => { setBills((bs) => bs.filter((b) => b.id!==id)); notify("항목 삭제됨","info"); };
    const toggleAutopay = (bill) =>
        setBills((bs) => bs.map((b) => {
            if (b.id!==bill.id||b.status==="paid") return b;
            const autopay = !b.autopay;
            return { ...b, autopay, status:autopay?"auto":"due" };
        }));
    const runAutopay = () => {
        let bal=balance, anyFail=false;
        const queue = [...bills].filter((b) => b.autopay&&(b.status==="auto"||b.status==="failed")).sort((a,b) => a.dday-b.dday);
        const updated = bills.map((b) => ({ ...b }));
        for (const item of queue) {
            const t = updated.find((u) => u.id===item.id);
            if (bal>=item.amount) { bal-=item.amount; t.status="paid"; } else { t.status="failed"; anyFail=true; }
        }
        setBalance(bal); setBills(updated);
        if (!queue.length) notify("자동이체로 설정된 항목이 없어요.","info");
        else if (anyFail) notify("잔고 부족으로 일부 실패했어요. 충전 후 다시 시도하세요.","fail");
        else notify("자동이체가 모두 정상 처리됐어요.","ok");
    };
    const topUp = (amt) => { setBalance((b) => b+amt); setTopUpOpen(false); notify(`${won(amt)} 충전 완료`,"ok"); };
    const reset = () => { setBalance(130000); setBills([]); setRentDetected(true); setTransitDetected(true); setToasts([]); setOpenTip(null); };

    const unpaidTotal      = bills.filter((b) => b.status!=="paid").reduce((s,b) => s+b.amount, 0);
    const addedUtilityKeys = new Set(bills.filter((b) => ["gas","elec","water","net"].includes(b.cat)).map((b) => b.cat));
    const addedSubNames    = new Set(bills.filter((b) => b.cat==="sub").map((b) => b.name));

    const tipToggle = (key) => setOpenTip(openTip===key ? null : key);

    return (
        <div className="min-h-screen w-full bg-slate-100 flex items-start justify-center p-4 font-sans">
            <div className="w-full max-w-sm">
                <div className="relative bg-white rounded-[2.25rem] shadow-2xl ring-1 ring-slate-200 overflow-hidden">

                    <div className="h-6 flex items-center justify-center bg-white">
                        <div className="w-24 h-1.5 rounded-full bg-slate-200" />
                    </div>

                    <div className="px-5 pt-1 pb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400">안녕하세요</p>
                            <p className="text-lg font-bold text-slate-800">도현님 👋</p>
                        </div>
                        <button onClick={reset} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs">
                            <RefreshCw size={14} /> 초기화
                        </button>
                    </div>

                    {/* 입력 방식 안내 칩 */}
                    <div className="px-5 mb-1 flex gap-2">
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 ring-1 ring-emerald-100 px-3 py-1.5">
                            <MessageSquareText size={12} className="text-emerald-600" />
                            <span className="text-[11px] font-semibold text-emerald-700">안드로이드 · 자동 감지</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 ring-1 ring-blue-100 px-3 py-1.5">
                            <Share2 size={12} className="text-blue-600" />
                            <span className="text-[11px] font-semibold text-blue-700">아이폰 · 문자 공유</span>
                        </div>
                    </div>

                    <div className="mx-5 mt-2">
                        <StatusBanner status={payStatus} />
                    </div>

                    {/* 가상계좌 */}
                    <div className="px-5 pt-3">
                        <div className="rounded-2xl p-4 text-white shadow-lg" style={{ background:APP_TEAL }}>
                            <div className="flex items-center gap-2 text-white/80 text-xs"><Wallet size={14}/> 납부 가상계좌</div>
                            <p className="mt-1 text-3xl font-bold tracking-tight">{won(balance)}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-white/80">남은 납부 {won(unpaidTotal)}</span>
                                <button onClick={() => setTopUpOpen(true)} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 text-xs font-semibold transition">
                                    <Plus size={14}/> 채우기
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 pt-5 pb-6 space-y-5">

                        {/* ── 월세 ── */}
                        <Section label="월세" Icon={Home} color="emerald"
                                 badge={bills.some((b)=>b.cat==="rent") ? "등록됨" : rentDetected ? "문자 감지됨" : null}
                                 action={!bills.some((b)=>b.cat==="rent") && <ShareBtn onClick={()=>setShareModal({cat:"rent"})} />}>
                            {rentDetected && !bills.some((b)=>b.cat==="rent") ? (
                                <AutoDetectedCard detected={DETECTED_RENT} tip={CATEGORY_META.rent.tip} color="emerald"
                                                  tipOpen={openTip==="rent_d"} onTip={()=>tipToggle("rent_d")} onAdd={addRent} />
                            ) : bills.some((b)=>b.cat==="rent") ? (
                                bills.filter((b)=>b.cat==="rent").map((bill)=>(
                                    <BillRow key={bill.id} bill={bill} onPay={()=>payNow(bill)} onToggle={()=>toggleAutopay(bill)}
                                             onShare={()=>setShareModal({cat:"rent",billId:bill.id})}
                                             tipOpen={openTip===bill.id} onTip={()=>tipToggle(bill.id)} />
                                ))
                            ) : (
                                <ShareEmptyHint text="집주인에게 온 월세 문자를 공유하거나,\n문자가 오면 자동으로 감지돼요." onShare={()=>setShareModal({cat:"rent"})} />
                            )}
                        </Section>

                        {/* ── 공과금 ── */}
                        <Section label="공과금" Icon={Zap} color="yellow"
                                 action={<button onClick={()=>setUtilityOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-yellow-600 hover:text-yellow-700"><Plus size={13}/> 항목 선택</button>}>
                            {addedUtilityKeys.size===0 ? (
                                <button onClick={()=>setUtilityOpen(true)}
                                        className="w-full rounded-xl border-2 border-dashed border-slate-200 hover:border-yellow-300 hover:bg-yellow-50/40 py-4 text-center transition">
                                    <Zap size={18} className="mx-auto mb-1 text-slate-300"/>
                                    <p className="text-[12px] text-slate-400 leading-snug">내 자취방에 해당하는<br/>공과금 항목을 직접 골라요</p>
                                </button>
                            ) : (
                                <div className="space-y-2.5">
                                    {bills.filter((b)=>["gas","elec","water","net"].includes(b.cat)).map((bill)=>(
                                        <BillRow key={bill.id} bill={bill} onPay={()=>payNow(bill)} onToggle={()=>toggleAutopay(bill)}
                                                 onRemove={()=>removeBill(bill.id)}
                                                 onShare={()=>setShareModal({cat:bill.cat,billId:bill.id})}
                                                 tipOpen={openTip===bill.id} onTip={()=>tipToggle(bill.id)} />
                                    ))}
                                    {addedUtilityKeys.size<UTILITY_PRESETS.length && (
                                        <button onClick={()=>setUtilityOpen(true)}
                                                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-yellow-200 hover:bg-yellow-50 py-2 text-xs font-semibold text-yellow-600 transition">
                                            <Plus size={13}/> 공과금 더 추가
                                        </button>
                                    )}
                                </div>
                            )}
                        </Section>

                        {/* ── 교통비 ── */}
                        <Section label="교통비" Icon={Bus} color="teal"
                                 badge={bills.some((b)=>b.cat==="transit") ? "등록됨" : transitDetected ? "문자 감지됨" : null}
                                 action={!bills.some((b)=>b.cat==="transit") && <ShareBtn onClick={()=>setShareModal({cat:"transit"})} />}>
                            {transitDetected && !bills.some((b)=>b.cat==="transit") ? (
                                <AutoDetectedCard detected={DETECTED_TRANSIT} tip={CATEGORY_META.transit.tip} color="teal"
                                                  tipOpen={openTip==="transit_d"} onTip={()=>tipToggle("transit_d")} onAdd={addTransit} />
                            ) : bills.some((b)=>b.cat==="transit") ? (
                                bills.filter((b)=>b.cat==="transit").map((bill)=>(
                                    <BillRow key={bill.id} bill={bill} onPay={()=>payNow(bill)} onToggle={()=>toggleAutopay(bill)}
                                             onShare={()=>setShareModal({cat:"transit",billId:bill.id})}
                                             tipOpen={openTip===bill.id} onTip={()=>tipToggle(bill.id)} />
                                ))
                            ) : (
                                <ShareEmptyHint text="교통 관련 문자를 공유하거나,\n문자가 오면 자동으로 감지돼요." onShare={()=>setShareModal({cat:"transit"})} />
                            )}
                        </Section>

                        {/* ── 구독료 ── */}
                        <Section label="구독료" Icon={Tv} color="violet"
                                 action={<button onClick={()=>setSubOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"><Plus size={13}/> 구독 추가</button>}>
                            {bills.filter((b)=>b.cat==="sub").length===0 ? (
                                <button onClick={()=>setSubOpen(true)}
                                        className="w-full rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 py-4 text-center transition">
                                    <Tv size={18} className="mx-auto mb-1 text-slate-300"/>
                                    <p className="text-[12px] text-slate-400 leading-snug">넷플릭스, 티빙, 유튜브 등<br/>내가 쓰는 구독 서비스를 직접 추가해요</p>
                                </button>
                            ) : (
                                <div className="space-y-2.5">
                                    {bills.filter((b)=>b.cat==="sub").map((bill)=>(
                                        <BillRow key={bill.id} bill={bill} onPay={()=>payNow(bill)} onToggle={()=>toggleAutopay(bill)}
                                                 onRemove={()=>removeBill(bill.id)}
                                                 tipOpen={openTip===bill.id} onTip={()=>tipToggle(bill.id)} />
                                    ))}
                                    <button onClick={()=>setSubOpen(true)}
                                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-200 hover:bg-violet-50 py-2 text-xs font-semibold text-violet-500 transition">
                                        <Plus size={13}/> 구독 더 추가하기
                                    </button>
                                </div>
                            )}
                        </Section>

                        {/* 자동이체 실행 */}
                        {bills.length>0 && (
                            <div>
                                <button onClick={runAutopay} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition">
                                    <RefreshCw size={15}/> 오늘 자동이체 실행 (시뮬레이션)
                                </button>
                                <p className="mt-1.5 text-[11px] text-slate-400 text-center">
                                    잔고가 부족하면 조용히 실패하지 않고 <span className="text-red-500 font-medium">실패로 표시</span>돼요.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 토스트 */}
                    <div className="absolute left-0 right-0 bottom-4 px-5 space-y-2 pointer-events-none">
                        {toasts.map((t) => (
                            <div key={t.id} className={`pointer-events-auto rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-lg flex items-start gap-2 ${t.kind==="fail"?"bg-red-600 text-white":t.kind==="ok"?"bg-emerald-600 text-white":"bg-slate-800 text-white"}`}>
                                {t.kind==="fail"?<AlertTriangle size={15} className="shrink-0 mt-0.5"/>:t.kind==="ok"?<Check size={15} className="shrink-0 mt-0.5"/>:<Bell size={15} className="shrink-0 mt-0.5"/>}
                                <span className="leading-snug">{t.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {utilityOpen && <UtilityModal onClose={()=>setUtilityOpen(false)} onAdd={(p)=>{ addUtility(p); setUtilityOpen(false); }} addedKeys={addedUtilityKeys} />}
            {subOpen     && <SubModal     onClose={()=>setSubOpen(false)}     onAdd={(s)=>{ addSub(s); setSubOpen(false); }} addedNames={addedSubNames} />}
            {topUpOpen   && <TopUpModal   onClose={()=>setTopUpOpen(false)}   onTopUp={topUp} />}
            {shareModal  && <ShareModal   cat={shareModal.cat} billId={shareModal.billId} bills={bills}
                                          onClose={()=>setShareModal(null)} onSubmit={handleShare} />}
        </div>
    );
}

// ── 납부 상태 배너 ────────────────────────────────────────────
function StatusBanner({ status }) {
    const map = {
        done:   { bg:"bg-emerald-50 ring-emerald-100", dot:"bg-emerald-500", text:"모두 납부 완료",        sub:"이번 달 연체 없이 마무리됐어요 🎉" },
        failed: { bg:"bg-red-50 ring-red-100",         dot:"bg-red-500",     text:"납부 실패 항목 있음",   sub:"잔고를 확인하고 다시 납부해주세요." },
        ready:  { bg:"bg-slate-50 ring-slate-100",     dot:"bg-sky-400",     text:"납부 예정 — 준비됨",    sub:"자동이체가 납부일에 맞춰 처리돼요." },
    };
    const m = map[status];
    return (
        <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ring-1 ${m.bg}`}>
      <span className="relative flex h-3 w-3 shrink-0">
        {status!=="ready" && <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${m.dot}`}/>}
          <span className={`relative inline-flex h-3 w-3 rounded-full ${m.dot}`}/>
      </span>
            <div className="leading-tight">
                <p className="text-xs font-bold text-slate-700">{m.text}</p>
                <p className="text-[11px] text-slate-400">{m.sub}</p>
            </div>
        </div>
    );
}

function Section({ label, Icon, color, badge, action, children }) {
    const c = COLOR[color];
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <div className={`h-6 w-6 rounded-lg ${c.bg} flex items-center justify-center`}><Icon size={13} className={c.text}/></div>
                    <h2 className="text-sm font-bold text-slate-700">{label}</h2>
                    {badge && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.badge}`}>{badge}</span>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function ShareBtn({ onClick }) {
    return (
        <button onClick={onClick} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600">
            <Share2 size={13}/> 문자 공유
        </button>
    );
}

// 안드로이드 자동 감지 카드
function AutoDetectedCard({ detected, tip, color, tipOpen, onTip, onAdd }) {
    const c = COLOR[color];
    const meta = CATEGORY_META[detected.cat];
    const Icon = meta.Icon;
    return (
        <div className={`rounded-2xl border ${c.border} ${c.light} p-3`}>
            <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 flex items-center gap-1">
          <MessageSquareText size={10}/> 안드로이드 자동 감지
        </span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 flex items-center gap-1">
          <Share2 size={10}/> 아이폰은 문자 공유
        </span>
            </div>
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-white ring-1 ${c.border} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={c.text}/>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800 text-sm">{meta.label}</p>
                        <button onClick={onTip} className="text-slate-300 hover:text-emerald-500"><Info size={13}/></button>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${detected.dday<=2?"bg-red-100 text-red-600":"bg-white text-slate-500 ring-1 ring-slate-200"}`}>D-{detected.dday}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{detected.biller} · <span className="font-bold text-slate-700">{won(detected.amount)}</span></p>
                </div>
            </div>
            <div className="mt-2.5 flex gap-2">
                <MessageSquareText size={13} className="text-slate-300 shrink-0 mt-0.5"/>
                <p className="text-[11px] leading-relaxed text-slate-500 bg-white rounded-lg ring-1 ring-slate-100 px-2.5 py-1.5">{detected.sms}</p>
            </div>
            {tipOpen && (
                <div className={`mt-2.5 rounded-xl ring-1 px-3 py-2.5 flex gap-2 ${c.tip}`}>
                    <Sparkles size={14} className={`${c.tipIcon} shrink-0 mt-0.5`}/>
                    <p className="text-[11px] leading-relaxed">{tip}</p>
                </div>
            )}
            <button onClick={onAdd} className={`mt-2.5 w-full rounded-lg text-white text-xs font-bold py-2 transition flex items-center justify-center gap-1.5 ${c.btn}`}>
                <Plus size={14}/> 추가
            </button>
        </div>
    );
}

function ShareEmptyHint({ text, onShare }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 py-4 px-3 text-center">
            <p className="text-[11px] text-slate-400 leading-snug whitespace-pre-line mb-2">{text}</p>
            <button onClick={onShare} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-500 hover:text-blue-600">
                <Share2 size={12}/> 지금 문자 공유하기
            </button>
        </div>
    );
}

// 납부 항목 행
function BillRow({ bill, onPay, onToggle, onRemove, onShare, tipOpen, onTip }) {
    const meta = CATEGORY_META[bill.cat]||CATEGORY_META.sub;
    const c    = COLOR[meta.color];
    const sm   = STATUS_META[bill.status];
    const SI   = sm.Icon;
    const paid = bill.status==="paid";
    const canRemove = ["gas","elec","water","net","sub"].includes(bill.cat);
    return (
        <div className={`rounded-2xl border p-3 transition ${bill.status==="failed"?"border-red-200 bg-red-50/40":`${c.section} ${c.light}`}`}>
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <meta.Icon size={18} className={c.text}/>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800 text-sm truncate">{bill.name}</p>
                        <button onClick={onTip} className="text-slate-300 hover:text-emerald-500 shrink-0"><Info size={13}/></button>
                        {!paid && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bill.dday<=2?"bg-red-100 text-red-600":"bg-white text-slate-500 ring-1 ring-slate-200"}`}>D-{bill.dday}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{bill.biller} · {won(bill.amount)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ring-1 ${sm.cls}`}><SI size={11}/>{sm.label}</span>
                    {canRemove&&onRemove && <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition"><X size={14}/></button>}
                </div>
            </div>
            {tipOpen && (
                <div className={`mt-2.5 rounded-xl ring-1 px-3 py-2.5 flex gap-2 ${c.tip}`}>
                    <Sparkles size={14} className={`${c.tipIcon} shrink-0 mt-0.5`}/>
                    <p className="text-[11px] leading-relaxed">{meta.tip}</p>
                </div>
            )}
            {/* 아이폰 금액 업데이트 */}
            {!paid && onShare && (
                <button onClick={onShare} className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 py-1.5 text-[11px] font-semibold text-blue-500 transition">
                    <Share2 size={11}/> 아이폰 · 이번 달 청구서 공유해서 금액 업데이트
                </button>
            )}
            {!paid && (
                <div className="mt-2 flex items-center gap-2">
                    <button onClick={onPay} className={`flex-1 rounded-lg text-white text-xs font-bold py-2 transition ${c.btn}`}>
                        {bill.status==="failed"?"지금 다시 납부":"지금 납부"}
                    </button>
                    <button onClick={onToggle} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ring-1 ${bill.autopay?"bg-sky-50 text-sky-700 ring-sky-200":"bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        <RefreshCw size={12}/> {bill.autopay?"자동 ON":"자동 OFF"}
                    </button>
                </div>
            )}
        </div>
    );
}

// 문자 공유 모달 (안드로이드+아이폰 공용)
function ShareModal({ cat, billId, bills, onClose, onSubmit }) {
    const [text, setText]     = useState("");
    const [biller, setBiller] = useState("");
    const meta     = CATEGORY_META[cat]||CATEGORY_META.sub;
    const existing = bills.find((b) => b.id===billId);
    const parsed   = text ? parseSms(text) : {};

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Share2 size={16} className="text-blue-500"/>
                        <h3 className="font-bold text-slate-800">{meta.label} 문자 공유</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                    {existing ? "이번 달 새로 온 청구 문자를 붙여넣으면 금액이 업데이트돼요." : "청구 문자를 길게 눌러 복사한 뒤 아래에 붙여넣으세요."}
                </p>
                <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 px-3 py-2.5 flex gap-2 mb-3">
                    <Camera size={13} className="text-blue-500 shrink-0 mt-0.5"/>
                    <p className="text-[11px] leading-relaxed text-blue-700">
                        문자 앱 → 청구 문자 길게 누르기 → 복사 → 여기에 붙여넣기<br/>
                        카카오 알림톡도 같은 방법으로 공유할 수 있어요.
                    </p>
                </div>
                {!existing && (
                    <div className="mb-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">청구처 (선택)</label>
                        <input value={biller} onChange={(e)=>setBiller(e.target.value)} placeholder={`예: ${meta.label} 청구처`}
                               className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/>
                    </div>
                )}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-500">청구 문자 붙여넣기</label>
                        <button onClick={()=>setText(SMS_EXAMPLES[cat]||"")} className="text-[10px] text-blue-500 hover:text-blue-600 font-medium">예시 문자 넣기</button>
                    </div>
                    <textarea value={text} onChange={(e)=>setText(e.target.value)}
                              placeholder="여기에 청구 문자를 붙여넣으세요..." rows={3}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"/>
                </div>
                {text && (
                    <div className="mb-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5">
                        <p className="text-[10px] font-bold text-slate-400 mb-1.5">자동 인식 결과</p>
                        <div className="flex gap-4">
                            <div><p className="text-[10px] text-slate-400">금액</p><p className="text-sm font-bold text-slate-700">{parsed.amount?won(parsed.amount):"인식 불가"}</p></div>
                            <div><p className="text-[10px] text-slate-400">납부까지</p><p className="text-sm font-bold text-slate-700">{parsed.dday!=null?`D-${parsed.dday}`:"인식 불가"}</p></div>
                        </div>
                    </div>
                )}
                <button onClick={()=>onSubmit(cat,text,biller)} disabled={!text.trim()}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 text-sm transition">
                    {existing?"금액 업데이트":"등록하기"}
                </button>
            </div>
        </div>
    );
}

function UtilityModal({ onClose, onAdd, addedKeys }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800">공과금 항목 선택</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">내 자취방에 해당하는 항목만 골라요.<br/>관리비에 포함된 항목은 빼도 돼요.</p>
                <div className="rounded-xl bg-yellow-50 ring-1 ring-yellow-100 px-3 py-2.5 flex gap-2 mb-4">
                    <Sparkles size={14} className="text-yellow-500 shrink-0 mt-0.5"/>
                    <p className="text-[11px] leading-relaxed text-yellow-800">공과금마다 청구처가 달라 고지서가 따로따로 와요. 항목 추가 후 청구 문자를 공유하면 금액이 자동으로 채워져요.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {UTILITY_PRESETS.map((p) => {
                        const already = addedKeys.has(p.key);
                        const meta = CATEGORY_META[p.key];
                        const c = COLOR[meta.color];
                        return (
                            <button key={p.key} onClick={()=>{ if(!already) onAdd(p); }} disabled={already}
                                    className={`relative flex flex-col items-center justify-center rounded-xl border py-5 px-2 text-center transition ${already?"border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed":`border-slate-200 hover:${c.border} hover:${c.light}`}`}>
                                <span className="text-2xl mb-2">{p.icon}</span>
                                <p className="text-xs font-semibold text-slate-700">{p.label}</p>
                                {already && <span className="absolute top-1.5 right-1.5 text-[9px] bg-emerald-100 text-emerald-700 rounded px-1">추가됨</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SubModal({ onClose, onAdd, addedNames }) {
    const [customName, setCustomName]   = useState("");
    const [customPrice, setCustomPrice] = useState("");
    const [showCustom, setShowCustom]   = useState(false);
    const handleCustom = () => {
        const price = parseInt(String(customPrice).replace(/[^0-9]/g,""), 10);
        if (!customName.trim()||!price) return;
        onAdd({ name:customName.trim(), price });
    };
    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800">구독 서비스 추가</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">내가 쓰는 구독만 골라 추가하세요.</p>
                <div className="rounded-xl bg-violet-50 ring-1 ring-violet-100 px-3 py-2.5 flex gap-2 mb-4">
                    <Sparkles size={14} className="text-violet-500 shrink-0 mt-0.5"/>
                    <p className="text-[11px] leading-relaxed text-violet-800">안 보는 구독은 매달 조용히 빠져나가요. 가끔 '이번 달에 진짜 썼나?' 점검하고, 무료체험은 해지일을 꼭 메모해두세요.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {SUB_PRESETS.map((p) => {
                        const already = addedNames.has(p.name);
                        return (
                            <button key={p.name} onClick={()=>{ if(!already){ onAdd({name:p.name,price:p.price}); onClose(); } }} disabled={already}
                                    className={`relative flex flex-col items-center justify-center rounded-xl border py-3 px-1 text-center transition ${already?"border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed":"border-slate-200 hover:border-violet-300 hover:bg-violet-50"}`}>
                                <span className="text-xl mb-1">{p.icon}</span>
                                <p className="text-[11px] font-semibold text-slate-700 leading-snug">{p.name}</p>
                                {already && <span className="absolute top-1.5 right-1.5 text-[9px] bg-emerald-100 text-emerald-700 rounded px-1">추가됨</span>}
                            </button>
                        );
                    })}
                </div>
                <button onClick={()=>setShowCustom((v)=>!v)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-200 hover:bg-violet-50 py-2.5 text-xs font-semibold text-violet-600 transition mb-3">
                    <Edit3 size={13}/> 직접 입력하기
                    {showCustom?<ChevronUp size={13}/>:<ChevronDown size={13}/>}
                </button>
                {showCustom && (
                    <div className="space-y-3 border border-violet-100 rounded-xl p-3 bg-violet-50/40">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">서비스 이름</label>
                            <input value={customName} onChange={(e)=>setCustomName(e.target.value)} placeholder="예: 밀리의서재, 클래스101"
                                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">월 구독료</label>
                            <input value={customPrice} onChange={(e)=>setCustomPrice(e.target.value)} inputMode="numeric" placeholder="예: 9900"
                                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400 bg-white"/>
                        </div>
                        <button onClick={handleCustom} disabled={!customName||!customPrice}
                                className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white font-bold py-2.5 text-sm transition">
                            추가하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function TopUpModal({ onClose, onTopUp }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800">가상계좌 채우기</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[50000,100000,200000].map((amt)=>(
                        <button key={amt} onClick={()=>onTopUp(amt)} className="rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 py-3 text-sm font-semibold text-slate-700 transition">
                            +{amt/10000}만
                        </button>
                    ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-400 text-center">충전 후 실패한 자동이체는 <b>다시 시도</b>하거나 <b>지금 납부</b>로 처리할 수 있어요.</p>
            </div>
        </div>
    );
}
