// Centralized mock data for Silaris Quality & Training Intelligence app.

export type Risk = "High" | "Medium" | "Zero Tolerance";
export type Category = "A" | "B" | "C";

export const TOP_DEFECTS: { name: string; pct: number; risk: Risk }[] = [
  { name: "Competition objection handling", pct: 28, risk: "Medium" },
  { name: "T&C disclosure timing", pct: 18, risk: "High" },
  { name: "Charges communication", pct: 15, risk: "Medium" },
  { name: "Reconfirmation of amount/plan", pct: 12, risk: "High" },
  { name: "Purpose of call not stated", pct: 8, risk: "Medium" },
  { name: "Hold procedure not followed", pct: 7, risk: "Medium" },
  { name: "Self-intro not per IRDA", pct: 6, risk: "High" },
  { name: "Effective rebuttal missing", pct: 6, risk: "Medium" },
];

export const CUSTOMER_SENTIMENT = [
  { name: "Positive", value: 42, color: "#34d399" },
  { name: "Neutral", value: 38, color: "#7ba4cc" },
  { name: "Negative", value: 18, color: "#d4a574" },
  { name: "Profane", value: 2, color: "#a78baf" },
];

export const AGENT_SENTIMENT = [
  { name: "Positive", value: 55, color: "#34d399" },
  { name: "Neutral", value: 36, color: "#7ba4cc" },
  { name: "Negative", value: 8, color: "#d4a574" },
  { name: "Profane", value: 1, color: "#a78baf" },
];

export const HEATMAP_TEAMS = [
  { tl: "Ramesh K.",    weeks: [82, 84, 85, 87] },
  { tl: "Pooja S.",     weeks: [88, 89, 90, 91] },
  { tl: "Vikram J.",    weeks: [79, 80, 81, 82] },
  { tl: "Neha A.",      weeks: [86, 87, 88, 89] },
  { tl: "Suresh B.",    weeks: [74, 73, 72, 71] },
  { tl: "Kavita M.",    weeks: [83, 85, 86, 88] },
];

// 6 Agents – each with unique data
export interface Agent {
  id: string;
  name: string;
  empId: string;
  tl: string;
  score: number;
  out: 83;
  pct: number;
  category: Category;
  trend: number[];
  primaryGap: string;
  secondaryGap?: string;
  trainingStatus: string;
  callsToday: number;
  callsWeek: number;
  capStatus?: "CAP-1" | "CAP-2" | "CAP-3" | null;
  dimensions: { code: string; name: string; score: number; max: number }[];
  todaysCalls: { id: string; duration: string; cqi: number; tag: "Clean" | "Non-Fatal" | "Fatal"; obs: string }[];
  feedback: {
    aiPattern: string;
    strengths: string[];
    improvements: string[];
    actionPlan: string;
    remarks: string[];
  };
  training: {
    title: string;
    excerptCustomer: string;
    excerptAgentWrong: string;
    correctResponse: string;
    cheatSheet: { title: string; rows: { k: string; v: string }[] };
    qa: { q: string; a: string }[];
    closingNote: string;
  };
}

const D = (c: number[]): Agent["dimensions"] => [
  { code: "D1", name: "Communication",        score: c[0], max: 15 },
  { code: "D2", name: "Product Knowledge",    score: c[1], max: 15 },
  { code: "D3", name: "Objection Handling",   score: c[2], max: 15 },
  { code: "D4", name: "Customer Handling",    score: c[3], max: 12 },
  { code: "D5", name: "Closing",              score: c[4], max: 13 },
  { code: "D6", name: "Compliance",           score: c[5], max: 13 },
];

export const AGENTS: Agent[] = [
  {
    id: "priya",
    name: "Priya Menon",
    empId: "SIL-2041",
    tl: "Pooja S.",
    score: 66, out: 83, pct: 79.0, category: "C",
    trend: [83, 81, 80, 79],
    primaryGap: "Closing technique — weak urgency, no confirmed next step",
    secondaryGap: "Competition objection handling (HDFC pivot)",
    trainingStatus: "Active — Closing technique AI module (auto-delivered to desktop)",
    callsToday: 21, callsWeek: 87, capStatus: null,
    dimensions: D([14, 13, 9, 9, 10, 11]),
    todaysCalls: [
      { id: "C-88412", duration: "06:24", cqi: 78, tag: "Clean", obs: "Strong opening, full T&C on time" },
      { id: "C-88419", duration: "04:11", cqi: 71, tag: "Non-Fatal", obs: "Fumbled on HDFC FMC comparison" },
      { id: "C-88427", duration: "08:02", cqi: 80, tag: "Clean", obs: "Decent rapport, weak close — no callback set" },
      { id: "C-88433", duration: "05:48", cqi: 74, tag: "Non-Fatal", obs: "Charges not fully explained upfront" },
      { id: "C-88441", duration: "07:15", cqi: 79, tag: "Clean", obs: "Summary present, urgency missing" },
    ],
    feedback: {
      aiPattern: "AI detected: in 6 of last 10 calls, Priya did not set a concrete next-step / callback. Closing strength dropped from 12 → 9 over 4 weeks. Loses ~6pp on closing technique.",
      strengths: ["Warm, professional tone", "Strong opening per IRDA", "Good reconfirmation discipline"],
      improvements: ["Always anchor a specific callback time", "Pivot to FMC reduction when HDFC mentioned"],
      actionPlan: "AI training module on closing technique auto-delivered to agent desktop. STT monitoring active for daily CQI scoring. If no improvement in 5 days, Trainer and TL will be notified with detailed call analysis.",
      remarks: [
        "Opening greeting clear, name + company stated",
        "Product features explained but rider depth shallow",
        "Lost ground when customer said 'HDFC zero charge bol rahe hain'",
        "Closing summary present but no confirmed callback in 6/10 calls",
        "Urgency moderate, no anchor time committed",
        "Compliance disclosure within 30s in 9/10 calls",
      ],
    },
    training: {
      title: "Competition Comparison — Winning the HDFC Conversation",
      excerptCustomer: "Madam, HDFC wale toh zero allocation charge bol rahe hain — aap kyun mehnga de rahe ho?",
      excerptAgentWrong: "Sir, hamari company bhi achhi hai, aap ek baar try karein.",
      correctResponse:
        "Sir, bilkul sahi sawaal hai. Axis Max Life mein bhi Zero Allocation Charge hai — aur extra: FMC bhi 1.35% se ghat ke 0.90% ho jaata hai 10th year ke baad, aur admin charges policy maturity par wapas mil jaate hain. Effectively HDFC se 1.2% kam cost over 15 years.",
      cheatSheet: {
        title: "Axis Max Life vs HDFC Life — Snapshot",
        rows: [
          { k: "Allocation Charge", v: "Zero (same as HDFC)" },
          { k: "FMC", v: "1.35% → 0.90% (HDFC fixed 1.35%)" },
          { k: "Admin charges", v: "Returned at maturity (HDFC: not returned)" },
          { k: "Fund options", v: "22 (HDFC: 10)" },
          { k: "Loyalty additions", v: "2.5–5% from yr 10 (HDFC: from yr 10 lower)" },
        ],
      },
      qa: [
        { q: "Customer says HDFC has lower premium — your pivot?", a: "Match on allocation, win on FMC reduction & admin refund." },
        { q: "Fund switching cost on our plan?", a: "Free unlimited switching." },
        { q: "When do loyalty additions start?", a: "From the 10th policy year — 2.5% to 5%." },
      ],
      closingNote: "You're already in Category A, Priya — closing this gap moves you to a Top-10 process slot. You've got this!",
    },
  },
  {
    id: "rahul",
    name: "Rahul Sharma",
    empId: "SIL-2078",
    tl: "Ramesh K.",
    score: 71, out: 83, pct: 85.5, category: "B",
    trend: [68, 70, 69, 71],
    primaryGap: "T&C disclosure timing — mentions at 1:42 vs <30s",
    secondaryGap: "Closing technique",
    trainingStatus: "Completed — T&C timing module. Assessment pending.",
    callsToday: 18, callsWeek: 74, capStatus: null,
    dimensions: D([12, 12, 11, 10, 9, 11]),
    todaysCalls: [
      { id: "C-88502", duration: "05:33", cqi: 70, tag: "Non-Fatal", obs: "T&C disclosed at 1:38 — too late" },
      { id: "C-88511", duration: "06:01", cqi: 74, tag: "Clean", obs: "T&C on time, weak close" },
      { id: "C-88520", duration: "04:42", cqi: 68, tag: "Non-Fatal", obs: "No urgency in closing" },
      { id: "C-88528", duration: "07:09", cqi: 75, tag: "Clean", obs: "Best call of the day" },
      { id: "C-88535", duration: "05:21", cqi: 69, tag: "Non-Fatal", obs: "Did not summarize benefits" },
    ],
    feedback: {
      aiPattern: "AI detected: T&C disclosed after 60s in 6 of last 10 calls. IRDA mandate is within first 30 seconds. Pattern is consistent — agent finishes greeting + small talk before disclosure.",
      strengths: ["Strong product knowledge", "Patient with customers", "Polite tone throughout"],
      improvements: ["Move T&C disclosure to within first 30s", "Add urgency + summary in close"],
      actionPlan: "Completed T&C module — Day 5 assessment due tomorrow. Closing module queued.",
      remarks: [
        "Greeting and intro per script",
        "T&C disclosure delayed — recurring",
        "Good product explanation, riders covered",
        "Customer questions answered fully",
        "Closing lacks summary + next-step urgency",
        "No compliance violations beyond timing",
      ],
    },
    training: {
      title: "T&C Disclosure — The 30-Second Rule",
      excerptCustomer: "Haan boliye, kya plan hai aapke paas?",
      excerptAgentWrong: "Sir, pehle batayein aapka occupation kya hai, family kitni badi hai… (T&C only at 1:42)",
      correctResponse:
        "Sir, pehle ek important disclosure: yeh call recorded hai, aur main aapko Axis Max Life ka plan offer kar raha hoon. Iske T&C policy document mein detail mein milenge. Ab boliye — aapki investment horizon kya hai?",
      cheatSheet: {
        title: "IRDA-Compliant Opening (≤30s)",
        rows: [
          { k: "Step 1 (0–5s)", v: "Greeting + your name + Silaris on behalf of Axis Max Life" },
          { k: "Step 2 (5–15s)", v: "Call recorded disclosure" },
          { k: "Step 3 (15–30s)", v: "Purpose: insurance + investment plan" },
          { k: "Step 4 (>30s)", v: "Then begin discovery questions" },
        ],
      },
      qa: [
        { q: "By when must T&C disclosure happen?", a: "Within the first 30 seconds of the conversation." },
        { q: "Two things you must state in opening?", a: "Recording disclosure + purpose of call." },
        { q: "If customer interrupts before disclosure?", a: "Politely complete disclosure, then engage." },
      ],
      closingNote: "You're 3 points away from Category A, Rahul. Fix the 30-second rule and you'll cross 87%.",
    },
  },
  {
    id: "anita",
    name: "Anita Sharma",
    empId: "SIL-2003",
    tl: "Pooja S.",
    score: 78, out: 83, pct: 94, category: "A",
    trend: [76, 77, 78, 78],
    primaryGap: "None — role model agent",
    trainingStatus: "None needed. Available for peer coaching.",
    callsToday: 23, callsWeek: 92, capStatus: null,
    dimensions: D([15, 14, 13, 11, 12, 13]),
    todaysCalls: [
      { id: "C-88601", duration: "07:42", cqi: 81, tag: "Clean", obs: "Textbook execution, full T&C" },
      { id: "C-88608", duration: "06:18", cqi: 79, tag: "Clean", obs: "Empathetic handling of objection" },
      { id: "C-88614", duration: "05:51", cqi: 78, tag: "Clean", obs: "Closed Step-Up plan" },
      { id: "C-88622", duration: "08:33", cqi: 80, tag: "Clean", obs: "Excellent competition pivot" },
      { id: "C-88629", duration: "06:47", cqi: 77, tag: "Clean", obs: "Smooth reconfirmation" },
    ],
    feedback: {
      aiPattern: "AI detected: Anita is in the top 3% process-wide. Her competition pivots and closing summaries are reference-quality. Recommended as peer coach for Cat B agents in her TL pool.",
      strengths: ["Reference-quality openings", "Best-in-team objection pivots", "Consistent closes with urgency + summary"],
      improvements: ["Maintain consistency", "Take on peer coaching for 2 Cat B agents"],
      actionPlan: "Nominate for peer-coach rota. Record 3 calls as training reference assets.",
      remarks: [
        "All dimensions at or near max",
        "Tone calibrated to customer profile",
        "Compliance perfect across last 50 calls",
        "Zero fatal in trailing 90 days",
        "Conversion rate 14% vs team 9%",
        "Eligible for Star-of-the-Month",
      ],
    },
    training: {
      title: "Star Performer — Recognition Summary",
      excerptCustomer: "(no training required)",
      excerptAgentWrong: "(no training required)",
      correctResponse: "Anita's calls are being used as the gold-standard reference for peer training.",
      cheatSheet: {
        title: "Recognition & Rewards",
        rows: [
          { k: "Star of the Month", v: "Nominated — April 2026" },
          { k: "Peer Coach", v: "Assigned: Rahul Sharma, Sneha Joshi" },
          { k: "Incentive Tier", v: "Tier-1 (₹12,500 + voucher)" },
          { k: "Career Track", v: "Eligible for Sr. Agent promo Q3" },
        ],
      },
      qa: [
        { q: "Peer coaching focus area?", a: "Closing technique + competition pivots." },
        { q: "Calls available as training assets?", a: "C-88601, C-88622, C-88629." },
        { q: "Next milestone?", a: "Sr. Agent promotion shortlist Q3 FY26." },
      ],
      closingNote: "Keep doing what you're doing, Anita — you're setting the bar for the entire process.",
    },
  },
  {
    id: "deepak",
    name: "Deepak Tiwari",
    empId: "SIL-2117",
    tl: "Suresh B.",
    score: 52, out: 83, pct: 62.7, category: "C",
    trend: [58, 55, 53, 52],
    primaryGap: "FATAL — unauthorized fee waiver promise (3rd offense)",
    secondaryGap: "Mis-selling language detected",
    trainingStatus: "Mandatory compliance refresher. CAP-2 active.",
    callsToday: 16, callsWeek: 62, capStatus: "CAP-2",
    dimensions: D([10, 9, 7, 8, 7, 4]),
    todaysCalls: [
      { id: "C-88701", duration: "09:14", cqi: 41, tag: "Fatal", obs: "Promised fee waiver — unauthorised" },
      { id: "C-88708", duration: "04:22", cqi: 58, tag: "Non-Fatal", obs: "Mis-selling language flagged" },
      { id: "C-88712", duration: "05:01", cqi: 55, tag: "Non-Fatal", obs: "Charges not disclosed upfront" },
      { id: "C-88716", duration: "03:48", cqi: 60, tag: "Non-Fatal", obs: "Closing technique weak" },
      { id: "C-88720", duration: "—",     cqi: 0,  tag: "Fatal", obs: "Suspended from outbound after C-88701" },
    ],
    feedback: {
      aiPattern: "AI detected: third fatal in 30 days. Agent uses phrases like 'guaranteed return' and 'no charges at all' — both violate IRDA mis-selling guidelines. CAP-2 triggered automatically.",
      strengths: ["Comfortable on call", "Builds rapport quickly"],
      improvements: ["STOP promising waivers/discounts", "STOP guaranteed-return language", "Re-train on IRDA mis-selling rules"],
      actionPlan: "CAP-2 invoked. Mandatory 2-day classroom compliance refresher. No outbound until certification. TL + Compliance to sign off.",
      remarks: [
        "Communication acceptable",
        "Product knowledge gaps on charge structure",
        "Objection handling weak under pressure",
        "Customer handling friendly but undisciplined",
        "Closing weak — no summary",
        "FATAL: unauthorized fee waiver — 3rd offense",
      ],
    },
    training: {
      title: "Compliance Refresher — Mis-selling & Unauthorized Promises",
      excerptCustomer: "Charges itne kyun hain? Kuch waiver de do bhai.",
      excerptAgentWrong: "Sir aapke liye main personally allocation charge waive kar dunga, tension mat lijiye.",
      correctResponse:
        "Sir, main allocation charge waive nahi kar sakta — aur achhi baat yeh hai ki Axis Max Life mein allocation charge ZERO hai already. Aur admin charges policy maturity par wapas mil jaate hain. Effectively aap jo dete ho woh wapas milta hai.",
      cheatSheet: {
        title: "Things You Must NEVER Say (IRDA)",
        rows: [
          { k: "❌ 'Guaranteed return'", v: "Use 'illustrated' / 'projected' returns" },
          { k: "❌ 'I'll waive charges'", v: "Agents cannot waive charges" },
          { k: "❌ 'No charges at all'", v: "State actual charges + refunds clearly" },
          { k: "❌ 'Best in market'", v: "Stick to factual comparisons" },
          { k: "✓ Always", v: "Refer to policy document for exact terms" },
        ],
      },
      qa: [
        { q: "Can you waive any charge?", a: "No. Agents have zero authority to waive charges." },
        { q: "Word to avoid for returns?", a: "'Guaranteed' — use 'projected' or 'illustrated'." },
        { q: "What triggers CAP-3?", a: "Any further fatal during CAP-2 window." },
      ],
      closingNote: "This is serious, Deepak — one more fatal moves you to CAP-3. Use the next 2 days to reset. Your TL and the Compliance team are here to help.",
    },
  },
  {
    id: "sneha",
    name: "Sneha Joshi",
    empId: "SIL-2089",
    tl: "Neha A.",
    score: 68, out: 83, pct: 81.9, category: "B",
    trend: [63, 65, 67, 68],
    primaryGap: "Closing technique — no summary or urgency",
    trainingStatus: "Completed — closing module. Score 63 → 68 (+5).",
    callsToday: 20, callsWeek: 82, capStatus: null,
    dimensions: D([12, 11, 11, 10, 7, 12]),
    todaysCalls: [
      { id: "C-88801", duration: "05:18", cqi: 70, tag: "Clean", obs: "Used new closing template" },
      { id: "C-88809", duration: "06:44", cqi: 67, tag: "Non-Fatal", obs: "Forgot to summarize benefits" },
      { id: "C-88815", duration: "04:50", cqi: 71, tag: "Clean", obs: "Created urgency well" },
      { id: "C-88823", duration: "05:55", cqi: 66, tag: "Non-Fatal", obs: "Soft close, no next-step" },
      { id: "C-88830", duration: "07:08", cqi: 69, tag: "Clean", obs: "Strong rapport + benefit recap" },
    ],
    feedback: {
      aiPattern: "AI detected: Sneha graduated from Cat C to Cat B in 3 weeks. Closing dimension still trails (7/13). Pattern: she ends with 'thank you' but skips benefit summary + commitment ask.",
      strengths: ["Big improvement curve — C to B in 3 weeks", "Friendly, builds trust", "Listens actively"],
      improvements: ["Always summarize 3 benefits before closing", "Ask for explicit commitment ('Shall we proceed today?')"],
      actionPlan: "Module completed. STT monitoring for 5 days; reassess Day 5. Target: 71+ score, Cat A by month-end.",
      remarks: [
        "Communication clear and warm",
        "Product knowledge improving",
        "Objection handling adequate",
        "Customer handling — strong listening",
        "Closing — improving but inconsistent",
        "Compliance clean — no violations",
      ],
    },
    training: {
      title: "Closing Like a Pro — Summary, Urgency, Commitment",
      excerptCustomer: "Theek hai, main soch ke batata hoon.",
      excerptAgentWrong: "Ji sir, theek hai. Thank you for your time, have a nice day.",
      correctResponse:
        "Sir bilkul, ek minute — recap karta hoon: (1) Zero allocation charge, (2) 22 fund options with free switching, (3) admin charges maturity par wapas. Aaj enroll karne par 7-day free-look period mein bhi aap exit kar sakte hain. Kya hum aaj hi process start kar dein?",
      cheatSheet: {
        title: "The 3-S Close: Summary · Safety · Step",
        rows: [
          { k: "Summary", v: "Recap top 3 benefits relevant to this customer" },
          { k: "Safety", v: "Mention 15-day free-look period" },
          { k: "Step",    v: "Ask for explicit commitment with a date" },
          { k: "Fallback", v: "If 'soch ke batata hoon' → schedule callback with time" },
        ],
      },
      qa: [
        { q: "Three benefits you'll mention for a Savings customer?", a: "Zero allocation, FMC reduction, admin refund." },
        { q: "How to handle 'main soch ke batata hoon'?", a: "Reassure with free-look, schedule specific callback." },
        { q: "What's the explicit commitment ask?", a: "'Kya hum aaj hi process start kar dein?'" },
      ],
      closingNote: "Sneha — Cat C to Cat B in 3 weeks is exceptional. One small closing tweak and you're in Cat A by month-end.",
    },
  },
  {
    id: "manish",
    name: "Manish Verma",
    empId: "SIL-2055",
    tl: "Vikram J.",
    score: 58, out: 83, pct: 69.9, category: "C",
    trend: [60, 59, 58, 58],
    primaryGap: "Product knowledge — cannot explain riders / fund options",
    secondaryGap: "Active listening — customer repeats questions",
    trainingStatus: "Escalated — no improvement after 5 days AI coaching",
    callsToday: 19, callsWeek: 78, capStatus: "CAP-1",
    dimensions: D([11, 6, 9, 8, 10, 14]),
    todaysCalls: [
      { id: "C-88901", duration: "06:22", cqi: 57, tag: "Non-Fatal", obs: "Could not explain Step-Up rider" },
      { id: "C-88908", duration: "05:14", cqi: 60, tag: "Non-Fatal", obs: "Customer repeated fund question 2x" },
      { id: "C-88912", duration: "04:33", cqi: 55, tag: "Non-Fatal", obs: "Wrong FMC quoted" },
      { id: "C-88917", duration: "07:01", cqi: 61, tag: "Non-Fatal", obs: "Avoided rider question entirely" },
      { id: "C-88925", duration: "05:48", cqi: 58, tag: "Non-Fatal", obs: "Did not listen to customer need" },
    ],
    feedback: {
      aiPattern: "AI detected: Manish has completed 5 days of AI-led product micro-lessons with no measurable improvement (58 → 58). AI auto-escalated to Trainer + TL for classroom intervention. Human-in-the-loop trigger.",
      strengths: ["Compliance discipline is good", "Polite tone"],
      improvements: ["Master Savings product fund structure", "Active listening — paraphrase customer need before answering"],
      actionPlan: "AI coaching exhausted. ESCALATED to Trainer (classroom) + TL (shadowing). 2-week intensive plan; CAP-1 maintained until reassessment.",
      remarks: [
        "Communication okay",
        "Product knowledge — critical gap",
        "Objection handling weak due to knowledge gap",
        "Customer handling — listening issue",
        "Closing reasonable",
        "Compliance strong (rare bright spot)",
      ],
    },
    training: {
      title: "Product Knowledge Bootcamp — Riders, Funds, Charges",
      excerptCustomer: "Step-Up rider kya hota hai? Aur fund switch karne mein koi cost hai?",
      excerptAgentWrong: "Sir Step-Up matlab plan upgrade. Aur switch ke baare mein documents mein milega.",
      correctResponse:
        "Sir, Step-Up rider matlab har 3 saal mein aap apna sum-assured automatically badha sakte ho without fresh medicals — premium bhi proportional badhega. Fund switching is completely FREE in Axis Max Life — koi limit nahi, koi charge nahi. 22 funds mein switch kar sakte ho anytime.",
      cheatSheet: {
        title: "Savings Product Quick Card",
        rows: [
          { k: "Riders available", v: "Step-Up, Critical Illness, Accidental Death, Waiver of Premium" },
          { k: "Step-Up rider", v: "Auto sum-assured boost every 3 yrs, no medicals" },
          { k: "Fund options", v: "22 funds across equity/debt/balanced" },
          { k: "Switching", v: "Free + unlimited" },
          { k: "FMC", v: "1.35% → 0.90% after year 10" },
          { k: "Allocation charge", v: "ZERO from day 1" },
        ],
      },
      qa: [
        { q: "How many fund options?", a: "22 — free unlimited switching." },
        { q: "What does Step-Up do?", a: "Auto sum-assured increase every 3 years, no fresh medicals." },
        { q: "FMC change at year 10?", a: "Drops from 1.35% to 0.90%." },
      ],
      closingNote: "Manish — you have 2 weeks with a live trainer. Use them. Your compliance is excellent — product mastery will unlock the rest.",
    },
  },
];

// Team Leader view
export type AgentStatus = "STAR" | "COACH" | "WATCH" | "CAP";
export const TL_AGENTS: {
  name: string; cqi: number; cat: string; trend: string; audited: number;
  fatal: number; nonFatal: number; train: string; cap: string; status?: AgentStatus;
}[] = [
  { name: "Anita Sharma",   cqi: 94.0, cat: "A", trend: "up",   audited: 92, fatal: 0, nonFatal: 1,  train: "—",         cap: "—",     status: "STAR" },
  { name: "Rohit Bansal",   cqi: 93.4, cat: "A", trend: "up",   audited: 88, fatal: 0, nonFatal: 2,  train: "Complete",  cap: "—" },
  { name: "Meera Iyer",     cqi: 92.8, cat: "A", trend: "up",   audited: 85, fatal: 0, nonFatal: 2,  train: "—",         cap: "—" },
  { name: "Sanjay Pillai",  cqi: 92.1, cat: "A", trend: "flat", audited: 79, fatal: 0, nonFatal: 3,  train: "Complete",  cap: "—" },
  { name: "Rahul Sharma",   cqi: 85.5, cat: "B", trend: "up",   audited: 74, fatal: 0, nonFatal: 6,  train: "Complete",  cap: "—" },
  { name: "Sneha Joshi",    cqi: 81.9, cat: "B", trend: "up",   audited: 82, fatal: 0, nonFatal: 5,  train: "Complete",  cap: "—" },
  { name: "Priya Menon",    cqi: 79.0, cat: "C", trend: "down", audited: 87, fatal: 0, nonFatal: 9,  train: "Active",    cap: "—",     status: "COACH" },
  { name: "Manish Verma",   cqi: 69.9, cat: "C", trend: "flat", audited: 78, fatal: 0, nonFatal: 12, train: "Escalated", cap: "CAP-1", status: "WATCH" },
  { name: "Deepak Tiwari",  cqi: 62.7, cat: "C", trend: "down", audited: 62, fatal: 3, nonFatal: 9,  train: "Mandatory", cap: "CAP-2", status: "CAP" },
];

export const CRITICAL_PENDING = [
  { id: "FB-9412", agent: "Deepak Tiwari", call: "C-88701", issue: "Unauthorized fee waiver promise", risk: "Zero Tolerance", deadline: "8h" },
  { id: "FB-9410", agent: "Manish Verma",  call: "C-88912", issue: "Wrong FMC quoted to customer",   risk: "High",            deadline: "11h" },
  { id: "FB-9407", agent: "Rahul Sharma",  call: "C-88502", issue: "T&C disclosure delayed",         risk: "High",            deadline: "5h" },
];

// VoC
export const VOC_PAIN = [
  { name: "Policy expectation vs offering gap", pct: 45 },
  { name: "Non-actionable", pct: 21 },
  { name: "Policy understanding issues", pct: 6 },
  { name: "Communication & agent experience", pct: 6 },
  { name: "Scheduling conflicts", pct: 4 },
  { name: "Website / navigation", pct: 4 },
];

export const VOC_SCENARIOS = [
  { quote: "HDFC wale toh zero charge bol rahe hain",                 insight: "24% of NI calls mention competitor pricing" },
  { quote: "Mujhe samajh nahi aaya ki charges kaise lagte hain",      insight: "Charges not explained upfront" },
  { quote: "Premium bahut zyada hai, SBI mein kam milta hai",         insight: "Price comparison is the #1 objection" },
  { quote: "Kal phir se call karo, abhi time nahi hai",               insight: "14% NI is just timing" },
];

export const NI_ATTRIBUTION = [
  { name: "Product / pricing",      value: 53, color: "#d4a574" },
  { name: "Customer circumstance",  value: 36, color: "#7ba4cc" },
  { name: "Agent skill",            value: 11, color: "#a78baf" },
];

// Competition
export const COMPETITOR_SHARE = [
  { name: "HDFC Life",  value: 42, color: "#d4a574" },
  { name: "SBI Life",   value: 28, color: "#7ba4cc" },
  { name: "ICICI Pru",  value: 18, color: "#a78baf" },
  { name: "Others",     value: 12, color: "#5a6a82" },
];

export const FEATURE_TABLE = [
  { feature: "Claim Settlement",     amli: "98.7%",                hdfc: "98.3%",          sbi: "97.1%",       icici: "97.8%",   wins: ["amli"] },
  { feature: "Allocation Charge",    amli: "Zero",                 hdfc: "Zero",           sbi: "3–6% Yr1-3",  icici: "2–4%",    wins: ["amli","hdfc"] },
  { feature: "FMC",                  amli: "1.35% → 0.90%",        hdfc: "1.35% fixed",    sbi: "1.35% fixed", icici: "1.35% fixed", wins: ["amli"] },
  { feature: "Admin Charges",        amli: "₹500/mo (returned)",   hdfc: "₹500/mo",        sbi: "₹500/mo",     icici: "₹6000/yr",wins: ["amli"] },
  { feature: "Fund Options",         amli: "22",                   hdfc: "10",             sbi: "26",          icici: "19",      wins: ["sbi"] },
  { feature: "Switching",            amli: "Free unlimited",       hdfc: "4 free/yr",      sbi: "Free unlimited", icici: "4 free/yr", wins: ["amli","sbi"] },
  { feature: "Loyalty",              amli: "2.5–5% added",         hdfc: "From 10th yr",   sbi: "From 15th yr",icici: "From 10th yr", wins: ["amli"] },
];

// Call analytics
export const VOLUME_BY_DAY = [
  { day: "Mon", calls: 372 },
  { day: "Tue", calls: 405 },
  { day: "Wed", calls: 388 },
  { day: "Thu", calls: 421 },
  { day: "Fri", calls: 309 },
];

export const FATAL_DONUT = [
  { name: "Clean",      value: 81, color: "#34d399" },
  { name: "Non-Fatal",  value: 18, color: "#d4a574" },
  { name: "Fatal",      value: 1,  color: "#a78baf" },
];

export const SCORE_DISTRIBUTION = [
  { name: "Cat A (≥90)",    pct: 28, color: "#34d399" },
  { name: "Cat B (85–90)",  pct: 37, color: "#7ba4cc" },
  { name: "Cat C (<85)",    pct: 32, color: "#d4a574" },
  { name: "Cat D (Fatal)",  pct: 3,  color: "#a78baf" },
];

export const CONVERSION = [
  { name: "Converted",      pct: 9 },
  { name: "Non-converted",  pct: 91 },
];

export const PARAMETER_SCORES = [
  { name: "Opening compliance",    pct: 94 },
  { name: "Product knowledge",     pct: 86 },
  { name: "Objection handling",    pct: 71 },
  { name: "Customer handling",     pct: 88 },
  { name: "Closing",               pct: 78 },
  { name: "T&C disclosure",        pct: 82 },
  { name: "Reconfirmation",        pct: 81 },
];

// Training screens
export const TRAINING_PIPELINE = [
  { stage: "TNA Identified", count: 8 },
  { stage: "Plan Created",   count: 11 },
  { stage: "Delivered",      count: 23 },
  { stage: "Assessment",     count: 14 },
  { stage: "Completed",      count: 34 },
];

export const TRAINING_AGENTS = [
  { name: "Priya Menon",   tl: "Pooja S.",  gap: "Competition handling", type: "AI Module", status: "Active",    pre: 71, post: 76, change: +5 },
  { name: "Rahul Sharma",  tl: "Ramesh K.", gap: "T&C timing",           type: "AI Module", status: "Complete",  pre: 68, post: 71, change: +3 },
  { name: "Sneha Joshi",   tl: "Neha A.",   gap: "Closing technique",    type: "AI Module", status: "Complete",  pre: 63, post: 68, change: +5 },
  { name: "Manish Verma",  tl: "Vikram J.", gap: "Product knowledge",    type: "Classroom", status: "Escalated", pre: 60, post: 58, change: -2 },
  { name: "Deepak Tiwari", tl: "Suresh B.", gap: "Compliance (fatal)",   type: "Mandatory", status: "Active",    pre: 58, post: 52, change: -6 },
];

export const TRAIN_EFFECTIVENESS = [
  { week: "W1", before: 73, after: 73 },
  { week: "W2", before: 73, after: 76 },
  { week: "W3", before: 73, after: 79 },
  { week: "W4", before: 73, after: 81 },
  { week: "W5", before: 73, after: 83 },
];

// Process comparison (AVP)
export const PROCESS_COMPARE = [
  { name: "Savings", cqi: 87.1 },
  { name: "Term",    cqi: 89.4 },
  { name: "Renewal", cqi: 84.2 },
  { name: "RM",      cqi: 90.7 },
];

export const PROCESS_TREND = [
  { week: "W1", cqi: 84.0, forecast: null as number | null },
  { week: "W2", cqi: 85.3, forecast: null },
  { week: "W3", cqi: 86.5, forecast: null },
  { week: "W4", cqi: 87.1, forecast: null },
  { week: "W5", cqi: null as number | null, forecast: 88.0 },
  { week: "W6", cqi: null, forecast: 88.7 },
];

// ============================================================
// Roster — 20 agents for the searchable Agent table.
// keyId links to the rich AGENTS data (feedback + training).
// ============================================================
export type TrainingStatus = "None" | "Active" | "Completed" | "Assessment Due" | "Escalated";
export type CapStatus = "None" | "CAP-1" | "CAP-2";

export interface RosterAgent {
  rank: number;
  name: string;
  empId: string;
  tl: string;
  cqi: number;
  cat: Category;
  spd: number;
  quality: number;
  complaints: number;
  training: TrainingStatus;
  trainingNote?: string;
  cap: CapStatus;
  keyId?: string; // links to AGENTS[].id
}

export const AGENT_ROSTER: RosterAgent[] = [
  { rank: 1,  name: "Kavita Reddy",     empId: "SIL-2011", tl: "Pooja S.",  cqi: 95.2, cat: "A", spd: 1.9, quality: 93, complaints: 0, training: "None",            cap: "None" },
  { rank: 2,  name: "Arjun Nair",       empId: "SIL-2018", tl: "Neha A.",   cqi: 94.6, cat: "A", spd: 1.8, quality: 92, complaints: 0, training: "None",            cap: "None" },
  { rank: 3,  name: "Anita Sharma",     empId: "SIL-2003", tl: "Pooja S.",  cqi: 94.0, cat: "A", spd: 1.8, quality: 92, complaints: 0, training: "None",            cap: "None", keyId: "anita" },
  { rank: 4,  name: "Rohit Bansal",     empId: "SIL-2024", tl: "Kavita M.", cqi: 93.4, cat: "A", spd: 1.7, quality: 90, complaints: 0, training: "Completed",       trainingNote: "Rebuttal mastery", cap: "None" },
  { rank: 5,  name: "Meera Iyer",       empId: "SIL-2029", tl: "Neha A.",   cqi: 92.8, cat: "A", spd: 1.7, quality: 89, complaints: 0, training: "None",            cap: "None" },
  { rank: 6,  name: "Sanjay Pillai",    empId: "SIL-2034", tl: "Pooja S.",  cqi: 92.1, cat: "A", spd: 1.6, quality: 88, complaints: 0, training: "Completed",       trainingNote: "Step-Up rider", cap: "None" },
  { rank: 7,  name: "Divya Kapoor",     empId: "SIL-2038", tl: "Kavita M.", cqi: 91.9, cat: "A", spd: 1.6, quality: 86, complaints: 0, training: "None",            cap: "None" },
  { rank: 8,  name: "Priya Menon",      empId: "SIL-2041", tl: "Pooja S.",  cqi: 91.6, cat: "A", spd: 1.5, quality: 84, complaints: 0, training: "Active",          trainingNote: "Competition module", cap: "None", keyId: "priya" },
  { rank: 9,  name: "Faisal Khan",      empId: "SIL-2046", tl: "Ramesh K.", cqi: 90.7, cat: "A", spd: 1.5, quality: 83, complaints: 0, training: "Completed",       trainingNote: "T&C timing", cap: "None" },
  { rank: 10, name: "Nikhil Joshi",     empId: "SIL-2051", tl: "Vikram J.", cqi: 88.4, cat: "B", spd: 1.4, quality: 82, complaints: 1, training: "Active",          trainingNote: "Charges clarity", cap: "None" },
  { rank: 11, name: "Aarti Deshmukh",   empId: "SIL-2060", tl: "Neha A.",   cqi: 86.9, cat: "B", spd: 1.3, quality: 80, complaints: 0, training: "Assessment Due",  cap: "None" },
  { rank: 12, name: "Rahul Sharma",     empId: "SIL-2078", tl: "Ramesh K.", cqi: 85.5, cat: "B", spd: 1.2, quality: 78, complaints: 1, training: "Assessment Due",  trainingNote: "T&C timing — Day 5", cap: "None", keyId: "rahul" },
  { rank: 13, name: "Pooja Bhatt",      empId: "SIL-2083", tl: "Kavita M.", cqi: 84.7, cat: "B", spd: 1.2, quality: 77, complaints: 1, training: "Completed",       trainingNote: "Closing technique", cap: "None" },
  { rank: 14, name: "Vivek Choudhary",  empId: "SIL-2086", tl: "Vikram J.", cqi: 82.8, cat: "B", spd: 1.1, quality: 76, complaints: 0, training: "Active",          trainingNote: "Objection handling", cap: "None" },
  { rank: 15, name: "Sneha Joshi",      empId: "SIL-2089", tl: "Neha A.",   cqi: 81.9, cat: "B", spd: 1.1, quality: 75, complaints: 0, training: "Completed",       trainingNote: "Closing — 3-S", cap: "None", keyId: "sneha" },
  { rank: 16, name: "Tarun Mehta",      empId: "SIL-2094", tl: "Vikram J.", cqi: 78.6, cat: "C", spd: 1.0, quality: 70, complaints: 1, training: "Active",          trainingNote: "Product knowledge", cap: "None" },
  { rank: 17, name: "Geeta Singh",      empId: "SIL-2102", tl: "Suresh B.", cqi: 74.2, cat: "C", spd: 0.9, quality: 66, complaints: 2, training: "Assessment Due",  cap: "None" },
  { rank: 18, name: "Manish Verma",     empId: "SIL-2055", tl: "Vikram J.", cqi: 69.9, cat: "C", spd: 0.8, quality: 62, complaints: 2, training: "Escalated",       trainingNote: "Product bootcamp", cap: "CAP-1", keyId: "manish" },
  { rank: 19, name: "Imran Sheikh",     empId: "SIL-2108", tl: "Suresh B.", cqi: 66.4, cat: "C", spd: 0.7, quality: 57, complaints: 2, training: "Escalated",       trainingNote: "Active listening", cap: "CAP-1" },
  { rank: 20, name: "Deepak Tiwari",    empId: "SIL-2117", tl: "Suresh B.", cqi: 62.7, cat: "C", spd: 0.6, quality: 52, complaints: 3, training: "Active",          trainingNote: "Compliance refresher", cap: "CAP-2", keyId: "deepak" },
];
