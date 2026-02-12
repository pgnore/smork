import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

/* ═══════════════════════════════════════════
   DATA: QUESTIONS, JOBS, RESOURCES
   ═══════════════════════════════════════════ */

const QUESTIONS = [
  {
    id: "tasks", question: "What does your day mostly look like?",
    options: [
      { label: "Emails, spreadsheets, reports", score: 90, tag: "📋 Paper pusher", signals: ["admin","analyst","accountant","coordinator"] },
      { label: "Meetings and \"aligning stakeholders\"", score: 75, tag: "🤝 Professional nodder", signals: ["pm","manager","consultant","executive"] },
      { label: "Writing code or debugging systems", score: 60, tag: "⌨️ Keyboard warrior", signals: ["developer","devops","data_engineer"] },
      { label: "Creative work — design, writing, branding", score: 40, tag: "🎨 Right-brainer", signals: ["designer","writer","marketer"] },
      { label: "Physical/hands-on work", score: 8, tag: "🔧 Touch grass certified", signals: ["trades","healthcare_hands","field_tech"] },
      { label: "Managing humans and their feelings", score: 35, tag: "🫂 Emotional labor dept", signals: ["hr","manager","therapist"] },
      { label: "Staring at dashboards and reacting", score: 80, tag: "📊 Dashboard zombie", signals: ["analyst","ops","marketer"] },
      { label: "Teaching, training, or mentoring", score: 30, tag: "🎓 Knowledge dealer", signals: ["teacher","trainer","lead"] },
      { label: "Sales calls and chasing leads", score: 45, tag: "📞 Commission breath", signals: ["sales","biz_dev","recruiter"] },
      { label: "Research — reading papers, running experiments", score: 35, tag: "🔬 Lab rat", signals: ["researcher","scientist","academic"] },
    ],
  },
  {
    id: "decisions", question: "How much of your job requires judgment calls?",
    options: [
      { label: "I follow a process. The process is god.", score: 95, tag: "🤖 Already an algorithm", signals: ["admin","coordinator","ops"] },
      { label: "Some discretion, but mostly routine", score: 70, tag: "⚙️ Semi-automatic", signals: ["analyst","accountant","devops"] },
      { label: "Constant judgment with incomplete info", score: 30, tag: "🎲 Professional gambler", signals: ["executive","consultant","pm"] },
      { label: "Life-or-death decisions, literally", score: 12, tag: "🚑 No pressure", signals: ["healthcare_hands","field_tech","trades"] },
      { label: "I interpret ambiguous requirements from humans", score: 40, tag: "🔮 Mind reader", signals: ["designer","developer","pm"] },
      { label: "I make bets on what markets/people will do next", score: 25, tag: "🎯 Fortune teller", signals: ["sales","executive","biz_dev","researcher"] },
    ],
  },
  {
    id: "output", question: "What do you actually produce?",
    options: [
      { label: "Documents, slides, and summaries", score: 95, tag: "📄 Content mill", signals: ["admin","consultant","analyst","marketer"] },
      { label: "Code, pipelines, or data analysis", score: 65, tag: "💻 Data wrangler", signals: ["developer","data_engineer","devops"] },
      { label: "Physical things in the real world", score: 8, tag: "🏗️ Atom manipulator", signals: ["trades","field_tech"] },
      { label: "Decisions, approvals, and sign-offs", score: 50, tag: "✅ Professional yes/no", signals: ["manager","executive"] },
      { label: "Relationships and trust", score: 18, tag: "🤙 Vibes specialist", signals: ["sales","hr","biz_dev","therapist"] },
      { label: "Original ideas and creative concepts", score: 35, tag: "💡 Idea machine", signals: ["designer","writer","researcher"] },
      { label: "Lesson plans, curricula, or training material", score: 55, tag: "📚 Syllabus architect", signals: ["teacher","trainer"] },
      { label: "Revenue. Directly. With my mouth.", score: 40, tag: "💰 Money printer", signals: ["sales","biz_dev","recruiter"] },
    ],
  },
  {
    id: "tools", question: "How much of your work is already assisted by AI?",
    options: [
      { label: "I use AI for basically everything now", score: 92, tag: "🪦 Writing your own obituary", signals: ["developer","writer","marketer","analyst"] },
      { label: "Copilot, ChatGPT, Claude — the usual stack", score: 72, tag: "🔮 Soft landing incoming", signals: ["developer","analyst","pm"] },
      { label: "A little here and there", score: 45, tag: "🐢 Slow adopter", signals: ["manager","admin","teacher"] },
      { label: "None — my work doesn't translate to AI", score: 12, tag: "🏰 Analog fortress", signals: ["trades","healthcare_hands","field_tech"] },
      { label: "I BUILD the AI tools others use", score: 30, tag: "🧬 Creating your own replacement", signals: ["developer","data_engineer","researcher"] },
      { label: "My company banned it lol", score: 55, tag: "🚫 Institutionally doomed", signals: ["admin","coordinator","hr"] },
    ],
  },
  {
    id: "unique", question: "What's your secret sauce?",
    options: [
      { label: "Domain expertise — I know things nobody documented", score: 28, tag: "🧠 Tribal knowledge vault", signals: ["consultant","lead","researcher","scientist"] },
      { label: "Speed — I do the thing fast", score: 88, tag: "⚡ About to get out-sped", signals: ["developer","analyst","admin"] },
      { label: "Relationships — people trust me specifically", score: 18, tag: "🫱🏽‍🫲🏻 The human API", signals: ["sales","hr","biz_dev","therapist"] },
      { label: "Honestly? I'm pretty interchangeable", score: 95, tag: "💀 Self-aware legend", signals: ["admin","coordinator","ops"] },
      { label: "I manage chaos nobody else wants to touch", score: 22, tag: "🌪️ Entropy tamer", signals: ["pm","devops","ops","manager"] },
      { label: "Creative vision — taste, aesthetics, vibes", score: 30, tag: "✨ Taste-maker", signals: ["designer","writer","marketer"] },
      { label: "Institutional knowledge — I know where the bodies are buried", score: 20, tag: "🗝️ Legacy gatekeeper", signals: ["lead","manager","executive"] },
      { label: "I explain complex things to non-technical people", score: 35, tag: "🌉 The translator", signals: ["teacher","consultant","pm","trainer"] },
    ],
  },
  {
    id: "remote", question: "Could your job be done from a beach in Bali?",
    options: [
      { label: "Yes, and sometimes I do", score: 88, tag: "🏖️ Location: irrelevant", signals: ["developer","writer","designer","consultant"] },
      { label: "Mostly, but some in-person stuff", score: 55, tag: "🔄 Hybrid specimen", signals: ["pm","manager","analyst","marketer"] },
      { label: "No — I need to physically be there", score: 8, tag: "📍 Geographically essential", signals: ["trades","healthcare_hands","field_tech","teacher"] },
      { label: "My job requires reading a room of humans", score: 25, tag: "👁️ Empathy required on-site", signals: ["therapist","hr","sales","trainer"] },
      { label: "I work in a classified/regulated environment", score: 15, tag: "🔒 Compliance shield activated", signals: ["executive","scientist","field_tech"] },
    ],
  },
  {
    id: "replaced", question: "Be honest — has AI already eaten part of your job?",
    options: [
      { label: "Yes, noticeably", score: 92, tag: "🦴 The bones are showing", signals: ["writer","analyst","developer","admin"] },
      { label: "It's nibbling at the edges", score: 60, tag: "🐁 Death by a thousand tokens", signals: ["designer","marketer","pm","consultant"] },
      { label: "Not yet, but I see it coming", score: 42, tag: "👀 The aware ones", signals: ["manager","teacher","hr","recruiter"] },
      { label: "Nah, not even close", score: 12, tag: "🛡️ Safe... for now", signals: ["trades","healthcare_hands","therapist"] },
      { label: "My whole team got downsized, I'm the survivor", score: 85, tag: "🏚️ Last one standing", signals: ["admin","analyst","writer","coordinator"] },
      { label: "AI made my job bigger, not smaller", score: 35, tag: "📈 Riding the wave", signals: ["developer","data_engineer","researcher","lead"] },
    ],
  },
  {
    id: "meeting", question: "What happens in your meetings?",
    options: [
      { label: "Status updates that could've been a Slack message", score: 90, tag: "📢 Performative syncing", signals: ["pm","manager","admin","coordinator"] },
      { label: "Actually solving hard problems together", score: 30, tag: "🧩 Real collaboration", signals: ["developer","designer","researcher","scientist"] },
      { label: "Convincing someone to give me money or approval", score: 40, tag: "🎪 Persuasion theater", signals: ["sales","biz_dev","executive","consultant"] },
      { label: "I don't have meetings, I have work", score: 20, tag: "🎧 Deep work enjoyer", signals: ["developer","writer","trades","data_engineer"] },
      { label: "Supporting someone through something emotional", score: 15, tag: "🫶 Human moment", signals: ["therapist","hr","teacher","trainer"] },
      { label: "Meetings ARE my job", score: 82, tag: "📅 Calendar is my prison", signals: ["pm","executive","manager","consultant"] },
    ],
  },
  {
    id: "sector", question: "What world do you operate in?",
    options: [
      { label: "Tech / Software / Internet", score: 65, tag: "🖥️ Silicon creature", signals: ["developer","devops","data_engineer"] },
      { label: "Finance / Banking / Insurance", score: 75, tag: "💰 Money matrix", signals: ["accountant","analyst"] },
      { label: "Healthcare / Medicine / Pharma", score: 20, tag: "🏥 Healer class", signals: ["healthcare_hands","therapist"] },
      { label: "Education / Academia / Research", score: 35, tag: "🎓 Knowledge sector", signals: ["teacher","researcher"] },
      { label: "Government / Military / Public", score: 30, tag: "🏛️ Public servant", signals: ["admin","ops"] },
      { label: "Creative / Media / Entertainment", score: 40, tag: "🎬 Culture maker", signals: ["designer","writer"] },
      { label: "Construction / Manufacturing / Energy", score: 10, tag: "🏗️ Atoms over bits", signals: ["trades","field_tech"] },
      { label: "Retail / Hospitality / Food", score: 50, tag: "🍽️ Service economy", signals: ["sales"] },
      { label: "Legal / Consulting / Professional Services", score: 55, tag: "⚖️ Billable hours", signals: ["consultant"] },
      { label: "Agriculture / Environment / Outdoors", score: 8, tag: "🌿 Earth worker", signals: ["trades"] },
      { label: "Transportation / Logistics / Supply Chain", score: 40, tag: "🚛 Moving things", signals: ["ops"] },
      { label: "Real Estate / Property / Architecture", score: 35, tag: "🏠 Space dealer", signals: ["sales"] },
    ],
  },
  {
    id: "environment", question: "What does your workspace look like?",
    options: [
      { label: "Laptop in a home office / coffee shop", score: 82, tag: "☕ Remote warrior", signals: ["developer","writer","designer"] },
      { label: "Open-plan office with too many Slack notifications", score: 70, tag: "🏢 Cubicle dweller", signals: ["pm","analyst","marketer"] },
      { label: "Lab, hospital, or clinical setting", score: 12, tag: "🔬 Sterile environment", signals: ["healthcare_hands","researcher"] },
      { label: "Construction site / workshop / field", score: 5, tag: "👷 Hardhat zone", signals: ["trades","field_tech"] },
      { label: "Classroom / lecture hall / training room", score: 30, tag: "📖 Learning space", signals: ["teacher","trainer"] },
      { label: "Studio / stage / creative space", score: 25, tag: "🎨 Creative den", signals: ["designer","writer"] },
      { label: "Vehicle — truck, plane, ambulance, patrol car", score: 8, tag: "🚗 On the move", signals: ["field_tech","trades"] },
      { label: "Kitchen / restaurant / hotel", score: 12, tag: "🍳 Heat and hustle", signals: ["trades"] },
      { label: "Executive suite / boardroom / corner office", score: 60, tag: "🪟 Corner office energy", signals: ["executive","manager"] },
      { label: "Courtroom / government building / secure facility", score: 20, tag: "🏛️ Institutional walls", signals: ["consultant","admin"] },
      { label: "Warehouse / factory floor / distribution center", score: 35, tag: "📦 Industrial vibes", signals: ["ops"] },
      { label: "Outdoors — farm, forest, ocean, park", score: 5, tag: "🌳 Nature's office", signals: ["trades","field_tech"] },
    ],
  },
];


/*
 * 200+ JOB PROFILES organized by family.
 * Each job has: title, icon, flavorText, family, and a compact answer fingerprint.
 *
 * Fingerprint format: { t, d, o, k, u, r, e, m }
 *   t = tasks preferences (array of option indices, best first)
 *   d = decisions preferences
 *   o = output preferences
 *   k = tools (AI usage) preferences
 *   u = unique/sauce preferences
 *   r = remote preferences
 *   e = replaced (AI eaten) preferences
 *   m = meeting preferences
 *
 * Scoring: 1st pref = 5pts, 2nd = 3pts, 3rd = 1pt, rest = 0
 * Anti-pattern (answer in job's "never" list) = -3pts
 */

const JOB_PROFILES = {
  // ══════════════════════════════════════════════════
  // TECH: CODE & SOFTWARE
  // ══════════════════════════════════════════════════
  developer:         { title: "Software Developer",       icon: "💻", flavorText: "You write code that an AI will rewrite better by next quarter" },
  frontend_dev:      { title: "Frontend Developer",       icon: "🖥️", flavorText: "You argue about CSS frameworks while Copilot writes your React" },
  backend_dev:       { title: "Backend Developer",        icon: "⚙️", flavorText: "You build APIs that an agent will generate from a spec file" },
  fullstack_dev:     { title: "Full-Stack Developer",     icon: "🔀", flavorText: "Jack of all stacks, master of none. AI is master of all" },
  mobile_dev:        { title: "Mobile Developer",         icon: "📱", flavorText: "You fight Xcode so 14-year-olds can scroll TikTok" },
  game_dev:          { title: "Game Developer",           icon: "🎮", flavorText: "You crunch 80-hour weeks to ship bugs. AI doesn't need sleep" },
  embedded_eng:      { title: "Embedded Systems Engineer",icon: "🔌", flavorText: "You write C for toasters. The toasters are safe. For now" },
  security_eng:      { title: "Security Engineer",        icon: "🔐", flavorText: "You find vulnerabilities. AI finds them faster and doesn't need coffee" },
  devops:            { title: "DevOps / SRE",             icon: "🔥", flavorText: "You keep things running at 3am. AI never sleeps either" },
  platform_eng:      { title: "Platform Engineer",        icon: "🏗️", flavorText: "You build the platform for building platforms. It's platforms all the way down" },
  qa_engineer:       { title: "QA Engineer",              icon: "🧪", flavorText: "You find bugs. AI writes the tests AND finds the bugs now" },
  test_automation:   { title: "Test Automation Engineer",  icon: "🤖", flavorText: "You automate testing. AI automates your automation" },
  cloud_architect:   { title: "Cloud Architect",          icon: "☁️", flavorText: "You draw diagrams of boxes and arrows. Very expensive arrows" },
  solutions_arch:    { title: "Solutions Architect",      icon: "📐", flavorText: "You design systems you'll never build and PowerPoints you'll always present" },
  data_engineer:     { title: "Data / ML Engineer",       icon: "🔧", flavorText: "You build the pipes the AI flows through. Ironic" },
  ml_engineer:       { title: "ML Engineer",              icon: "🧠", flavorText: "You train models that will train themselves soon" },
  ai_researcher:     { title: "AI Researcher",            icon: "🔬", flavorText: "You're building your own replacement and writing papers about it" },
  blockchain_dev:    { title: "Blockchain Developer",     icon: "⛓️", flavorText: "You solve problems nobody has with technology nobody understands" },
  systems_admin:     { title: "Systems Administrator",    icon: "🖥️", flavorText: "You reboot servers. Terraform already replaced you once" },
  dba:               { title: "Database Administrator",   icon: "🗄️", flavorText: "You guard the data. The data guards itself now" },
  network_eng:       { title: "Network Engineer",         icon: "🌐", flavorText: "You configure routers while the cloud makes routers irrelevant" },
  tech_writer:       { title: "Technical Writer",         icon: "📝", flavorText: "You document APIs that AI can read and rewrite simultaneously" },
  dev_advocate:      { title: "Developer Advocate",       icon: "📣", flavorText: "You tweet about SDKs for a living. AI will tweet better" },
  cto:               { title: "CTO",                      icon: "👨‍💻", flavorText: "You pick the tech stack then blame the team when it fails" },
  vp_engineering:    { title: "VP of Engineering",        icon: "🏛️", flavorText: "You manage managers who manage people who write code AI writes better" },
  lead:              { title: "Tech Lead / Senior IC",    icon: "⚡", flavorText: "Senior enough to know AI is coming for you too" },
  site_reliability:  { title: "Site Reliability Engineer", icon: "📟", flavorText: "You maintain five 9s of uptime while AI maintains six" },
  infosec_analyst:   { title: "InfoSec Analyst",          icon: "🛡️", flavorText: "You watch logs for threats. AI reads logs at 10M lines/second" },
  firmware_eng:      { title: "Firmware Engineer",        icon: "💾", flavorText: "You write code for hardware that hasn't changed since 2009" },

  // ══════════════════════════════════════════════════
  // DESIGN & CREATIVE
  // ══════════════════════════════════════════════════
  designer:          { title: "UI/UX Designer",           icon: "🎨", flavorText: "You arrange pixels and call it vision. Midjourney sends its regards" },
  product_designer:  { title: "Product Designer",         icon: "✏️", flavorText: "You run workshops about empathy then make wireframes AI can generate" },
  graphic_designer:  { title: "Graphic Designer",         icon: "🖼️", flavorText: "You kern letters for hours. AI kerns in milliseconds" },
  brand_designer:    { title: "Brand Designer",           icon: "🏷️", flavorText: "You pick colors and call it strategy. Expensive strategy" },
  motion_designer:   { title: "Motion Designer",          icon: "🎬", flavorText: "You keyframe animations. Runway and Kling just keyframed your career" },
  three_d_artist:    { title: "3D Artist",                icon: "🎲", flavorText: "You sculpt polygons. Meshy does it from a text prompt" },
  illustrator:       { title: "Illustrator",              icon: "🖌️", flavorText: "Your hand-drawn style? There's a LoRA for that" },
  art_director:      { title: "Art Director",             icon: "🎯", flavorText: "You have taste. AI has infinite taste at infinite speed" },
  creative_director: { title: "Creative Director",        icon: "👁️", flavorText: "You set the vision. AI generates 1000 visions per prompt" },
  interior_designer: { title: "Interior Designer",        icon: "🛋️", flavorText: "You pick furniture. AI renders the room before you open SketchUp" },
  fashion_designer:  { title: "Fashion Designer",         icon: "👗", flavorText: "You sketch garments. AI generates entire collections overnight" },
  industrial_designer:{ title: "Industrial Designer",     icon: "🔩", flavorText: "You design objects people touch. Touch is your moat" },
  architect:         { title: "Architect",                icon: "🏗️", flavorText: "You stamp drawings. AI generates buildings. Stamps still require you" },
  landscape_arch:    { title: "Landscape Architect",      icon: "🌿", flavorText: "You design gardens. Dirt is hard to automate" },
  photographer:      { title: "Photographer",             icon: "📸", flavorText: "You capture reality. AI generates fake reality that looks better" },
  videographer:      { title: "Videographer",             icon: "🎥", flavorText: "You shoot video. Sora shoots it without a camera" },
  animator:          { title: "Animator",                  icon: "🎞️", flavorText: "You draw 24 frames per second. AI generates 24 per millisecond" },
  sound_designer:    { title: "Sound Designer",           icon: "🔊", flavorText: "You design sounds nobody consciously notices but everyone feels" },
  music_producer:    { title: "Music Producer",           icon: "🎵", flavorText: "You make beats. Suno makes hits. Existential crisis in 4/4 time" },
  ux_researcher:     { title: "UX Researcher",            icon: "🔍", flavorText: "You watch people click the wrong button for a living" },
  ui_developer:      { title: "UI Developer",             icon: "🧩", flavorText: "Half designer, half developer, fully threatened from both sides" },

  // ══════════════════════════════════════════════════
  // DATA & ANALYTICS
  // ══════════════════════════════════════════════════
  analyst:           { title: "Data Analyst",             icon: "📊", flavorText: "You make charts that executives glance at for 3 seconds" },
  business_analyst:  { title: "Business Analyst",         icon: "📈", flavorText: "You translate business to tech and neither side is happy" },
  bi_analyst:        { title: "BI Analyst",               icon: "📉", flavorText: "You build dashboards nobody looks at after the first week" },
  financial_analyst: { title: "Financial Analyst",        icon: "💹", flavorText: "You model scenarios in Excel. AI models them in reality" },
  market_researcher: { title: "Market Research Analyst",  icon: "🔎", flavorText: "You survey 500 people. AI scrapes 500 million opinions" },
  data_scientist:    { title: "Data Scientist",           icon: "🧬", flavorText: "Sexiest job of the 21st century meets AutoML in the 2020s" },
  quant_analyst:     { title: "Quantitative Analyst",     icon: "∑", flavorText: "You model risk with math. AI does more math faster" },
  actuary:           { title: "Actuary",                  icon: "📋", flavorText: "You predict when people die. Morbid but regulated" },
  statistician:      { title: "Statistician",             icon: "📐", flavorText: "You know the difference between correlation and causation. AI doesn't care" },

  // ══════════════════════════════════════════════════
  // PRODUCT & STRATEGY
  // ══════════════════════════════════════════════════
  pm:                { title: "Product Manager",          icon: "📋", flavorText: "You translate English into slightly different English and call it a spec" },
  program_manager:   { title: "Program Manager",          icon: "📅", flavorText: "You manage timelines that slip regardless of your Gantt charts" },
  project_manager:   { title: "Project Manager",          icon: "📌", flavorText: "You track tasks in Jira. Jira could track them without you" },
  scrum_master:      { title: "Scrum Master",             icon: "🔄", flavorText: "You facilitate ceremonies. AI facilitates everything else" },
  chief_of_staff:    { title: "Chief of Staff",           icon: "🎖️", flavorText: "You are the CEO's brain extension. AI will be a cheaper one" },
  strategy_consultant:{ title: "Strategy Consultant",     icon: "🏛️", flavorText: "You charge $500/hr to make slides. Claude charges $20/mo" },
  mgmt_consultant:   { title: "Management Consultant",    icon: "💼", flavorText: "You fly Business Class to tell people what they already know" },
  coordinator:       { title: "Project Coordinator",      icon: "📌", flavorText: "You keep track of things. Software was literally invented for this" },
  business_ops:      { title: "Business Operations",      icon: "⚙️", flavorText: "You optimize processes. Algorithms do this in their sleep" },
  product_ops:       { title: "Product Ops",              icon: "🔧", flavorText: "You bridge product and ops. AI bridges everything" },
  coo:               { title: "COO",                      icon: "🏢", flavorText: "You operationalize the CEO's fever dreams" },

  // ══════════════════════════════════════════════════
  // SALES & REVENUE
  // ══════════════════════════════════════════════════
  sales:             { title: "Sales Professional",       icon: "🤑", flavorText: "Your charm is hard to automate. Your CRM updates are not" },
  account_exec:      { title: "Account Executive",        icon: "🎯", flavorText: "You close deals. AI will open, nurture, AND close them" },
  sdr:               { title: "SDR / BDR",                icon: "📞", flavorText: "You cold-call strangers. AI cold-calls at scale without crying" },
  account_manager:   { title: "Account Manager",          icon: "🤝", flavorText: "You keep clients happy. AI keeps them engaged 24/7" },
  customer_success:  { title: "Customer Success Manager", icon: "🌟", flavorText: "You prevent churn through vibes. AI prevents it with data" },
  sales_engineer:    { title: "Sales Engineer",           icon: "🔧", flavorText: "Half sales, half engineer, doubly threatened" },
  real_estate:       { title: "Real Estate Agent",        icon: "🏠", flavorText: "You open doors. Zillow opened them first" },
  insurance_agent:   { title: "Insurance Agent",          icon: "☂️", flavorText: "You sell peace of mind. Algorithms price it better" },
  retail_sales:      { title: "Retail Sales Associate",   icon: "🏪", flavorText: "You help people buy things they found on Amazon first" },
  pharma_sales:      { title: "Pharmaceutical Sales Rep", icon: "💊", flavorText: "You bring lunch to doctors. AI brings clinical trials" },
  car_sales:         { title: "Car Salesperson",          icon: "🚗", flavorText: "You upsell undercoating. Tesla sells online with zero humans" },
  biz_dev:           { title: "Business Development",     icon: "🤝", flavorText: "You network and schmooze. AI is learning to schmooze" },

  // ══════════════════════════════════════════════════
  // MARKETING & COMMUNICATIONS
  // ══════════════════════════════════════════════════
  marketer:          { title: "Digital Marketer",         icon: "📣", flavorText: "You A/B test subject lines. AI A/B tests 10,000 simultaneously" },
  content_marketer:  { title: "Content Marketer",         icon: "📝", flavorText: "You write blog posts. AI writes 50 blog posts per hour" },
  seo_specialist:    { title: "SEO Specialist",           icon: "🔍", flavorText: "You game Google's algorithm. Google's AI games you back" },
  social_media:      { title: "Social Media Manager",     icon: "📱", flavorText: "You post memes for brands. AI generates memes infinitely" },
  pr_specialist:     { title: "PR / Comms Specialist",    icon: "📰", flavorText: "You spin narratives. AI spins faster with less spin" },
  brand_manager:     { title: "Brand Manager",            icon: "🏷️", flavorText: "You protect brand equity. AI doesn't understand equity yet. Yet" },
  growth_hacker:     { title: "Growth Hacker",            icon: "📈", flavorText: "You hack growth loops. AI is the ultimate growth loop" },
  email_marketer:    { title: "Email Marketer",           icon: "✉️", flavorText: "You optimize open rates. AI optimizes everything else" },
  copywriter:        { title: "Copywriter",               icon: "✍️", flavorText: "You agonize over headlines. AI generates 1000 in a second" },
  advertising:       { title: "Advertising Executive",    icon: "📺", flavorText: "Mad Men era is over. Now it's AI Men" },
  media_buyer:       { title: "Media Buyer",              icon: "💰", flavorText: "You buy ad space. Programmatic AI already does this" },
  event_planner:     { title: "Event Planner",            icon: "🎪", flavorText: "You coordinate chaos in meatspace. AI can't set up chairs" },
  community_mgr:     { title: "Community Manager",        icon: "👥", flavorText: "You moderate comments. AI moderates at scale without burnout" },
  comms_manager:     { title: "Communications Manager",   icon: "📢", flavorText: "You craft messages. AI crafts them in every language simultaneously" },

  // ══════════════════════════════════════════════════
  // WRITING & CONTENT
  // ══════════════════════════════════════════════════
  writer:            { title: "Writer / Content Creator", icon: "✍️", flavorText: "You agonize over word choice while AI generates 10,000 words/second" },
  journalist:        { title: "Journalist",               icon: "🗞️", flavorText: "You chase stories. AI aggregates them in milliseconds" },
  editor:            { title: "Editor",                   icon: "🔖", flavorText: "You fix other people's writing. AI fixes it before they write it" },
  screenwriter:      { title: "Screenwriter",             icon: "🎬", flavorText: "You write dialogue. AI writes entire scripts nobody asked for" },
  grant_writer:      { title: "Grant Writer",             icon: "📜", flavorText: "You write proposals in bureaucrat-ese. AI speaks fluent bureaucrat" },
  speechwriter:      { title: "Speechwriter",             icon: "🎤", flavorText: "You put words in powerful mouths. AI puts better words faster" },
  translator:        { title: "Translator / Interpreter", icon: "🌍", flavorText: "You bridge languages. AI bridges all languages simultaneously" },
  blogger:           { title: "Blogger / Creator",        icon: "💻", flavorText: "You create content. AI creates content about creating content" },
  proposal_writer:   { title: "Proposal Writer",          icon: "📄", flavorText: "You write 80-page proposals. AI writes them while you sleep" },

  // ══════════════════════════════════════════════════
  // FINANCE & ACCOUNTING
  // ══════════════════════════════════════════════════
  accountant:        { title: "Accountant",               icon: "🧮", flavorText: "Computers have been doing this since the 1950s" },
  bookkeeper:        { title: "Bookkeeper",               icon: "📒", flavorText: "You record transactions. QuickBooks said hello 30 years ago" },
  auditor:           { title: "Auditor",                  icon: "🔎", flavorText: "You check other people's math. AI checks everyone's math instantly" },
  tax_preparer:      { title: "Tax Preparer",             icon: "📊", flavorText: "You know tax code. TurboTax + AI knows it better" },
  financial_advisor: { title: "Financial Advisor",        icon: "💰", flavorText: "You manage money. Robo-advisors manage money without golf outings" },
  investment_banker: { title: "Investment Banker",        icon: "🏦", flavorText: "You build models at 2am. AI builds them at 2am without the tears" },
  trader:            { title: "Trader",                   icon: "📊", flavorText: "You make split-second decisions. HFT algorithms make split-nanosecond ones" },
  portfolio_mgr:     { title: "Portfolio Manager",        icon: "💼", flavorText: "You beat the market. Spoiler: most of you don't" },
  risk_analyst:      { title: "Risk Analyst",             icon: "⚠️", flavorText: "You quantify risk. AI quantifies it across dimensions you can't imagine" },
  loan_officer:      { title: "Loan Officer",             icon: "🏧", flavorText: "You approve loans. Algorithms approve loans faster without bias. Supposedly" },
  underwriter:       { title: "Underwriter",              icon: "📋", flavorText: "You assess risk on paper. AI assesses risk on everything" },
  controller:        { title: "Controller / Comptroller", icon: "📑", flavorText: "You guard the books. AI reads all the books at once" },
  cfo:               { title: "CFO",                      icon: "💎", flavorText: "You control the money. AI will advise what to do with it" },
  payroll_spec:      { title: "Payroll Specialist",       icon: "💳", flavorText: "You process paychecks. This was automated 20 years ago" },
  credit_analyst:    { title: "Credit Analyst",           icon: "📈", flavorText: "You evaluate creditworthiness. AI scores 10,000 applicants per second" },

  // ══════════════════════════════════════════════════
  // LEGAL
  // ══════════════════════════════════════════════════
  lawyer:            { title: "Lawyer / Attorney",        icon: "⚖️", flavorText: "You bill by the hour. AI bills by the millisecond and reads faster" },
  paralegal:         { title: "Paralegal",                icon: "📁", flavorText: "You research case law. AI researches all case law simultaneously" },
  legal_assistant:   { title: "Legal Assistant",          icon: "🗃️", flavorText: "You file documents. Filing is AI's favorite hobby" },
  compliance:        { title: "Compliance Officer",       icon: "✅", flavorText: "You enforce rules. AI reads every rule in every jurisdiction" },
  contract_mgr:      { title: "Contract Manager",        icon: "📃", flavorText: "You review contracts. AI reviews 10,000 contracts before lunch" },
  patent_attorney:   { title: "Patent Attorney",          icon: "🔬", flavorText: "You protect inventions. Including the AI that might replace you" },
  mediator:          { title: "Mediator / Arbitrator",    icon: "🤝", flavorText: "You resolve disputes between humans. AI can't read the room. Yet" },
  legal_ops:         { title: "Legal Operations",         icon: "⚙️", flavorText: "You optimize legal workflows. AI IS the optimization" },
  ip_specialist:     { title: "IP Specialist",            icon: "©️", flavorText: "You protect intellectual property. AI's IP rights are still TBD" },

  // ══════════════════════════════════════════════════
  // HEALTHCARE
  // ══════════════════════════════════════════════════
  doctor:            { title: "Doctor / Physician",       icon: "🩺", flavorText: "You diagnose humans. AI diagnoses from images better. But can't hug" },
  surgeon:           { title: "Surgeon",                  icon: "🔪", flavorText: "You cut people open to save them. Robots assist but you still lead" },
  nurse:             { title: "Nurse",                    icon: "👩‍⚕️", flavorText: "You ARE the healthcare system. AI can't hold a patient's hand" },
  nurse_practitioner:{ title: "Nurse Practitioner",       icon: "🏥", flavorText: "You do doctor things for nurse pay. AI won't fix that" },
  physician_asst:    { title: "Physician Assistant",      icon: "⚕️", flavorText: "You see patients when the doctor is busy. Which is always" },
  pharmacist:        { title: "Pharmacist",               icon: "💊", flavorText: "You count pills and catch drug interactions. One of those AI does well" },
  dentist:           { title: "Dentist",                  icon: "🦷", flavorText: "You drill teeth. Robots can't small-talk about flossing" },
  dental_hygienist:  { title: "Dental Hygienist",         icon: "🪥", flavorText: "You scrape plaque while patients pretend they floss" },
  physical_therapist:{ title: "Physical Therapist",       icon: "🏃", flavorText: "You move bodies to heal them. AI can't move bodies" },
  occupational_ther: { title: "Occupational Therapist",   icon: "🤲", flavorText: "You help people live normally. Normal requires human understanding" },
  speech_therapist:  { title: "Speech Therapist",         icon: "🗣️", flavorText: "You help people speak. Ironic that AI speaks fluently without help" },
  radiologist:       { title: "Radiologist",              icon: "🩻", flavorText: "You read scans. AI reads scans better. Sorry, Hinton called it in 2016" },
  lab_tech:          { title: "Lab Technician",           icon: "🔬", flavorText: "You run samples. Automation runs them faster and doesn't need lunch" },
  emt:               { title: "EMT / Paramedic",          icon: "🚑", flavorText: "You save lives in ambulances. AI can't do CPR" },
  midwife:           { title: "Midwife",                  icon: "👶", flavorText: "You bring humans into the world. The most un-automatable job ever" },
  optometrist:       { title: "Optometrist",              icon: "👓", flavorText: "You test eyes. AI reads retinas better but can't fit glasses" },
  veterinarian:      { title: "Veterinarian",             icon: "🐾", flavorText: "You heal animals that can't describe their symptoms. Peak diagnosis" },
  healthcare_hands:  { title: "Healthcare Worker",        icon: "🏥", flavorText: "You touch humans to heal them. AI can't do that. Yet" },
  med_coder:         { title: "Medical Coder",            icon: "🏷️", flavorText: "You translate diagnoses into billing codes. AI was born for this" },

  // ══════════════════════════════════════════════════
  // MENTAL HEALTH & COUNSELING
  // ══════════════════════════════════════════════════
  therapist:         { title: "Therapist / Counselor",    icon: "🧘", flavorText: "You hold space for human suffering. AI holds tokens" },
  psychologist:      { title: "Psychologist",             icon: "🧠", flavorText: "You understand minds. AI simulates understanding. There's a difference" },
  psychiatrist:      { title: "Psychiatrist",             icon: "💊", flavorText: "You prescribe meds and listen. AI can't prescribe. Yet" },
  social_worker:     { title: "Social Worker",            icon: "💛", flavorText: "You navigate human crisis. AI navigates data" },
  life_coach:        { title: "Life Coach",               icon: "🌟", flavorText: "You inspire transformation. ChatGPT costs less and is available 24/7" },
  school_counselor:  { title: "School Counselor",         icon: "🎒", flavorText: "You guide young humans. They need a human for that" },
  addiction_couns:   { title: "Addiction Counselor",       icon: "🫂", flavorText: "You help people fight demons. AI has no demons to understand" },
  marriage_couns:    { title: "Marriage Counselor",        icon: "💑", flavorText: "You mediate love disputes. AI can't understand love. Probably" },

  // ══════════════════════════════════════════════════
  // EDUCATION & TRAINING
  // ══════════════════════════════════════════════════
  teacher:           { title: "K-12 Teacher",             icon: "🎓", flavorText: "You shape minds. AI wants to shape them faster and cheaper" },
  professor:         { title: "College Professor",        icon: "🏛️", flavorText: "You lecture. Students already use AI to do the homework" },
  tutor:             { title: "Tutor",                    icon: "📖", flavorText: "You explain things 1-on-1. Khan Academy + AI does this for free" },
  school_admin:      { title: "School Administrator",     icon: "🏫", flavorText: "You run a school. Bureaucracy is AI-resistant. Silver lining" },
  curriculum_design: { title: "Curriculum Designer",      icon: "📚", flavorText: "You design learning. AI generates personalized curricula instantly" },
  special_ed:        { title: "Special Ed Teacher",       icon: "🌈", flavorText: "You adapt to every learner's needs. Deeply human. Deeply safe" },
  esl_teacher:       { title: "ESL Teacher",              icon: "🌍", flavorText: "You teach English. AI teaches 100 languages simultaneously" },
  librarian:         { title: "Librarian",                icon: "📚", flavorText: "You organize knowledge. Google did it. AI is doing it better" },
  academic_advisor:  { title: "Academic Advisor",         icon: "🗺️", flavorText: "You help students pick classes. Degree audit software waves hello" },
  trainer:           { title: "Corporate Trainer",        icon: "📢", flavorText: "You teach adults things they'll forget by Monday" },
  instruct_designer: { title: "Instructional Designer",   icon: "🎯", flavorText: "You design e-learning. AI generates e-learning. Full circle" },
  academic:          { title: "Academic / Researcher",    icon: "🏛️", flavorText: "You publish papers. AI writes them faster" },

  // ══════════════════════════════════════════════════
  // ADMINISTRATIVE & OFFICE
  // ══════════════════════════════════════════════════
  admin:             { title: "Administrative Assistant",  icon: "🗂️", flavorText: "You are the glue. AI is a better glue" },
  exec_assistant:    { title: "Executive Assistant",       icon: "📋", flavorText: "You manage a CEO's calendar. AI manages everyone's calendar" },
  office_manager:    { title: "Office Manager",           icon: "🏢", flavorText: "You keep the office running. Remote work keeps it empty" },
  receptionist:      { title: "Receptionist",             icon: "🔔", flavorText: "You greet people. The iPad on the desk also greets people" },
  data_entry:        { title: "Data Entry Clerk",         icon: "⌨️", flavorText: "You type data. OCR + AI types data without typos" },
  virtual_assistant: { title: "Virtual Assistant",        icon: "💬", flavorText: "You assist virtually. AI literally IS a virtual assistant" },
  secretary:         { title: "Secretary",                icon: "📎", flavorText: "Remember Clippy? He got an upgrade" },

  // ══════════════════════════════════════════════════
  // HR & PEOPLE
  // ══════════════════════════════════════════════════
  hr:                { title: "HR Manager",               icon: "🫂", flavorText: "You write policies and mediate drama. Both are getting automated" },
  hr_generalist:     { title: "HR Generalist",            icon: "👥", flavorText: "You do a little of everything HR. AI does all of it" },
  recruiter:         { title: "Recruiter",                icon: "🎯", flavorText: "You find humans. AI is the reason there are fewer to find" },
  talent_acquisition:{ title: "Talent Acquisition",       icon: "🎣", flavorText: "You source candidates. LinkedIn AI sources them first" },
  compensation:      { title: "Compensation Analyst",     icon: "💲", flavorText: "You crunch salary data. AI crunches it with more data points" },
  benefits_admin:    { title: "Benefits Administrator",   icon: "🏥", flavorText: "You manage benefits enrollment. Portals already do this" },
  dei_officer:       { title: "DEI Officer",              icon: "🌈", flavorText: "You champion inclusion. Important work that needs human judgment" },
  employee_relations:{ title: "Employee Relations",       icon: "⚖️", flavorText: "You handle workplace conflicts. AI mediates but can't empathize" },
  hris_specialist:   { title: "HRIS Specialist",          icon: "🖥️", flavorText: "You manage HR software. The software is managing itself now" },
  learning_dev:      { title: "L&D Specialist",           icon: "📚", flavorText: "You design training programs. AI designs personalized ones" },

  // ══════════════════════════════════════════════════
  // OPERATIONS & LOGISTICS
  // ══════════════════════════════════════════════════
  ops:               { title: "Operations Manager",       icon: "📦", flavorText: "You optimize flows. So does any half-decent algorithm" },
  supply_chain:      { title: "Supply Chain Manager",     icon: "🔗", flavorText: "You manage the chain. AI optimizes every link simultaneously" },
  logistics_coord:   { title: "Logistics Coordinator",    icon: "🚛", flavorText: "You route trucks. Algorithms route them better" },
  warehouse_mgr:     { title: "Warehouse Manager",        icon: "🏭", flavorText: "You manage inventory. Amazon's robots manage it faster" },
  procurement:       { title: "Procurement Specialist",   icon: "🛒", flavorText: "You buy things for the company. AI negotiates better prices" },
  inventory_mgr:     { title: "Inventory Manager",        icon: "📊", flavorText: "You count stuff. Sensors count stuff without blinking" },
  quality_mgr:       { title: "Quality Assurance Manager",icon: "✅", flavorText: "You ensure standards. AI monitors standards in real-time" },
  fleet_mgr:         { title: "Fleet Manager",            icon: "🚗", flavorText: "You manage vehicles. Autonomous vehicles manage themselves" },
  import_export:     { title: "Import/Export Specialist",  icon: "🌐", flavorText: "You navigate customs regulations. AI reads all regulations instantly" },

  // ══════════════════════════════════════════════════
  // TRADES & SKILLED LABOR
  // ══════════════════════════════════════════════════
  trades:            { title: "General Contractor",       icon: "🔧", flavorText: "You work with atoms, not bits. Robots aren't there yet. Respect" },
  electrician:       { title: "Electrician",              icon: "⚡", flavorText: "You wire buildings. Robots can't crawl through walls" },
  plumber:           { title: "Plumber",                  icon: "🔧", flavorText: "You fix pipes. AI can't fix pipes. Society needs you more than developers" },
  carpenter:         { title: "Carpenter",                icon: "🪚", flavorText: "You build with wood. 3D printers are coming but you're safe for now" },
  hvac_tech:         { title: "HVAC Technician",          icon: "❄️", flavorText: "You control climate. Indoors. Where AI also works" },
  welder:            { title: "Welder",                   icon: "🔥", flavorText: "You join metal with fire. Some things just need a human touch" },
  mechanic:          { title: "Mechanic",                 icon: "🔩", flavorText: "You fix cars. EVs have fewer parts to fix. Hmm" },
  mason:             { title: "Mason / Bricklayer",       icon: "🧱", flavorText: "You lay bricks. Robots lay them faster but can't do custom work" },
  roofer:            { title: "Roofer",                   icon: "🏠", flavorText: "You work on top of buildings. Gravity keeps AI away" },
  painter_trade:     { title: "Painter (Trade)",          icon: "🎨", flavorText: "You paint walls. Rollers don't need AI but scheduling might" },
  locksmith:         { title: "Locksmith",                icon: "🔑", flavorText: "You open locks. Smart locks are coming but dumb locks aren't leaving" },
  crane_operator:    { title: "Crane Operator",           icon: "🏗️", flavorText: "You lift heavy things. Autonomous cranes exist but need supervision" },
  heavy_equipment:   { title: "Heavy Equipment Operator", icon: "🚜", flavorText: "You move earth. Caterpillar wants AI to do this but not yet" },
  field_tech:        { title: "Field Technician",         icon: "📡", flavorText: "You fix things in places AI can't reach. For now" },

  // ══════════════════════════════════════════════════
  // ENGINEERING (NON-SOFTWARE)
  // ══════════════════════════════════════════════════
  mech_engineer:     { title: "Mechanical Engineer",      icon: "⚙️", flavorText: "You design things that move. AI designs them faster. You test them" },
  civil_engineer:    { title: "Civil Engineer",           icon: "🌉", flavorText: "You build bridges. AI can't pour concrete" },
  electrical_eng:    { title: "Electrical Engineer",      icon: "🔌", flavorText: "You design circuits. AI simulates them but you solder them" },
  chemical_eng:      { title: "Chemical Engineer",        icon: "⚗️", flavorText: "You optimize reactions. AI optimizes parameters. You handle the explosions" },
  aerospace_eng:     { title: "Aerospace Engineer",       icon: "🚀", flavorText: "You send things to space. AI helps but humans still ride the rockets" },
  environmental_eng: { title: "Environmental Engineer",   icon: "🌱", flavorText: "You clean up messes. Literally. Important and hard to automate" },
  structural_eng:    { title: "Structural Engineer",      icon: "🏗️", flavorText: "You make sure buildings don't fall down. Stamps required" },
  biomedical_eng:    { title: "Biomedical Engineer",      icon: "🧬", flavorText: "You engineer life. AI assists but biology is messy" },
  industrial_eng:    { title: "Industrial Engineer",      icon: "🏭", flavorText: "You optimize factories. AI optimizes your optimizations" },
  nuclear_eng:       { title: "Nuclear Engineer",         icon: "☢️", flavorText: "You split atoms. Classified, regulated, and robot-resistant" },
  petroleum_eng:     { title: "Petroleum Engineer",       icon: "🛢️", flavorText: "You extract oil. Climate change may replace you before AI does" },
  materials_sci:     { title: "Materials Scientist",      icon: "🔬", flavorText: "You invent new materials. AI discovers them computationally now" },

  // ══════════════════════════════════════════════════
  // SCIENCE & RESEARCH
  // ══════════════════════════════════════════════════
  researcher:        { title: "Research Scientist",       icon: "🔬", flavorText: "You push human knowledge forward. AI reads 10,000 papers before breakfast" },
  scientist:         { title: "Laboratory Scientist",     icon: "🧬", flavorText: "You discover new things. AlphaFold already won a Nobel" },
  biologist:         { title: "Biologist",                icon: "🧫", flavorText: "You study life. AI studies life's data" },
  chemist:           { title: "Chemist",                  icon: "⚗️", flavorText: "You mix things. AI predicts the results before you mix" },
  physicist:         { title: "Physicist",                icon: "⚛️", flavorText: "You understand the universe. AI simulates parts of it" },
  geologist:         { title: "Geologist",                icon: "🪨", flavorText: "You read rocks. AI reads satellite data of all the rocks" },
  neuroscientist:    { title: "Neuroscientist",           icon: "🧠", flavorText: "You study brains. AI IS a brain. Circular reference error" },
  climate_scientist: { title: "Climate Scientist",        icon: "🌡️", flavorText: "You model Earth's climate. AI runs the models faster" },
  food_scientist:    { title: "Food Scientist",           icon: "🍽️", flavorText: "You engineer food. AI designs flavors you can't imagine" },
  forensic_sci:      { title: "Forensic Scientist",       icon: "🔍", flavorText: "You analyze crime scenes. AI matches DNA faster but can't testify" },
  epidemiologist:    { title: "Epidemiologist",           icon: "📊", flavorText: "COVID made you famous. AI makes you faster" },
  marine_biologist:  { title: "Marine Biologist",         icon: "🐋", flavorText: "You study oceans. AI reads sonar but can't scuba dive" },
  astronomer:        { title: "Astronomer",               icon: "🔭", flavorText: "You stare at stars. AI processes telescope data you'd never finish" },

  // ══════════════════════════════════════════════════
  // GOVERNMENT & PUBLIC SERVICE
  // ══════════════════════════════════════════════════
  policy_analyst:    { title: "Policy Analyst",           icon: "📜", flavorText: "You analyze policy. AI reads every policy ever written" },
  diplomat:          { title: "Diplomat",                  icon: "🕊️", flavorText: "You negotiate between nations. AI can't shake hands at summits" },
  city_planner:      { title: "City / Urban Planner",     icon: "🗺️", flavorText: "You design cities. SimCity AI already does this for fun" },
  public_admin:      { title: "Public Administrator",     icon: "🏛️", flavorText: "You run government ops. Bureaucracy is AI-resistant by design" },
  intel_analyst:     { title: "Intelligence Analyst",     icon: "🕵️", flavorText: "You analyze threats. AI analyzes 10x the signals in 1/10th the time" },
  military_officer:  { title: "Military Officer",         icon: "🎖️", flavorText: "You command humans. Autonomous weapons are a debate, not a product" },
  firefighter:       { title: "Firefighter",              icon: "🚒", flavorText: "You run INTO fire. Robots exist but you're still braver" },
  police_officer:    { title: "Police Officer",           icon: "🚔", flavorText: "You enforce laws. AI can't de-escalate a bar fight" },
  park_ranger:       { title: "Park Ranger",              icon: "🌲", flavorText: "You protect nature. Drones help but bears require humans" },
  social_services:   { title: "Social Services Worker",   icon: "💛", flavorText: "You help vulnerable people. Society's safety net needs human hands" },
  regulatory:        { title: "Regulatory Affairs",       icon: "📋", flavorText: "You navigate regulations. AI reads them but you interpret politics" },

  // ══════════════════════════════════════════════════
  // FOOD & HOSPITALITY
  // ══════════════════════════════════════════════════
  chef:              { title: "Chef",                     icon: "👨‍🍳", flavorText: "You cook. Robots flip burgers but can't taste the sauce" },
  sous_chef:         { title: "Sous Chef",                icon: "🍳", flavorText: "Second in command of a kitchen. The heat is literal" },
  pastry_chef:       { title: "Pastry Chef",              icon: "🎂", flavorText: "You make beautiful things people destroy with forks" },
  bartender:         { title: "Bartender",                icon: "🍺", flavorText: "You pour drinks AND therapy. Two jobs AI can't do at once" },
  restaurant_mgr:    { title: "Restaurant Manager",       icon: "🍽️", flavorText: "You manage chaos, humans, and health codes simultaneously" },
  hotel_mgr:         { title: "Hotel Manager",            icon: "🏨", flavorText: "You make people feel at home. AI makes reservations" },
  sommelier:         { title: "Sommelier",                icon: "🍷", flavorText: "You taste wine for money. AI predicts ratings but can't sip" },
  nutritionist:      { title: "Nutritionist / Dietitian", icon: "🥗", flavorText: "You plan diets. AI plans diets. You motivate compliance" },
  barista:           { title: "Barista",                  icon: "☕", flavorText: "You make coffee and small talk. Both are deeply human" },
  food_critic:       { title: "Food Critic",              icon: "🍽️", flavorText: "You eat and judge. AI can judge photos but can't taste" },

  // ══════════════════════════════════════════════════
  // TRANSPORTATION
  // ══════════════════════════════════════════════════
  pilot:             { title: "Pilot",                    icon: "✈️", flavorText: "You fly planes. Autopilot exists but passengers want a human" },
  atc:               { title: "Air Traffic Controller",   icon: "📡", flavorText: "You prevent mid-air collisions. Zero tolerance for AI hallucinations here" },
  truck_driver:      { title: "Truck Driver",             icon: "🚛", flavorText: "You haul freight. Self-driving is coming but loading docks aren't ready" },
  bus_driver:        { title: "Bus Driver",               icon: "🚌", flavorText: "You drive and deal with humans. Autonomous buses can't break up fights" },
  delivery_driver:   { title: "Delivery Driver",          icon: "📦", flavorText: "You bring packages. Drones want your job but stairs exist" },
  dispatcher:        { title: "Dispatcher",               icon: "📻", flavorText: "You coordinate emergency response. AI assists but you make the call" },
  ship_captain:      { title: "Ship Captain",             icon: "🚢", flavorText: "You navigate oceans. GPS helps but storms need a human" },

  // ══════════════════════════════════════════════════
  // MEDIA & ENTERTAINMENT
  // ══════════════════════════════════════════════════
  actor:             { title: "Actor / Performer",        icon: "🎭", flavorText: "You pretend to be other people. Deepfakes pretend to be you" },
  comedian:          { title: "Comedian",                 icon: "😂", flavorText: "You make people laugh. AI tries but timing is everything" },
  podcast_host:      { title: "Podcast Host",             icon: "🎙️", flavorText: "You talk for a living. AI clones your voice and talks forever" },
  tv_producer:       { title: "TV / Film Producer",       icon: "🎬", flavorText: "You wrangle creative chaos. Some things can't be prompted" },
  sports_caster:     { title: "Sports Broadcaster",       icon: "🏟️", flavorText: "You narrate games. AI generates highlights but lacks passion" },
  dj:                { title: "DJ",                       icon: "🎧", flavorText: "You read the room's energy. Spotify's algorithm reads data instead" },
  talent_agent:      { title: "Talent Agent",             icon: "⭐", flavorText: "You discover stars. AI discovers patterns in engagement metrics" },
  voice_actor:       { title: "Voice Actor",              icon: "🎤", flavorText: "You ARE the voice. ElevenLabs clones it in 30 seconds" },
  streamer:          { title: "Content Streamer",         icon: "📺", flavorText: "You stream yourself existing. AI generates virtual streamers" },

  // ══════════════════════════════════════════════════
  // REAL ESTATE & PROPERTY
  // ══════════════════════════════════════════════════
  property_mgr:      { title: "Property Manager",        icon: "🏘️", flavorText: "You manage buildings. Tenants are harder to manage than code" },
  appraiser:         { title: "Appraiser",                icon: "📋", flavorText: "You estimate property value. Zillow Zestimates for free" },
  home_inspector:    { title: "Home Inspector",           icon: "🔍", flavorText: "You crawl through attics. Drones help but you still need to be there" },
  mortgage_broker:   { title: "Mortgage Broker",          icon: "🏦", flavorText: "You match buyers with lenders. Online comparison tools are eating this" },
  commercial_re:     { title: "Commercial Real Estate",   icon: "🏢", flavorText: "You deal in millions. AI deals in billions of data points" },

  // ══════════════════════════════════════════════════
  // CUSTOMER SERVICE & SUPPORT
  // ══════════════════════════════════════════════════
  customer_service:  { title: "Customer Service Rep",     icon: "📞", flavorText: "You help angry humans. Chatbots handle the easy ones already" },
  call_center:       { title: "Call Center Agent",        icon: "🎧", flavorText: "You answer calls. IVR and AI answer them first now" },
  help_desk:         { title: "Help Desk / IT Support",   icon: "🖥️", flavorText: "Have you tried turning it off and on? AI asks that now" },
  tech_support:      { title: "Technical Support",        icon: "🛠️", flavorText: "You troubleshoot. AI troubleshoots with better documentation" },
  client_relations:  { title: "Client Relations",         icon: "🤝", flavorText: "You maintain relationships. AI maintains databases" },

  // ══════════════════════════════════════════════════
  // SECURITY
  // ══════════════════════════════════════════════════
  security_guard:    { title: "Security Guard",           icon: "🛡️", flavorText: "You watch things. Cameras watch things. You watch cameras" },
  cyber_analyst:     { title: "Cybersecurity Analyst",    icon: "🔒", flavorText: "You hunt threats. AI hunts more threats faster but you decide what to do" },
  loss_prevention:   { title: "Loss Prevention",          icon: "👁️", flavorText: "You catch shoplifters. AI cameras flag them but you do the confrontation" },
  private_inv:       { title: "Private Investigator",     icon: "🕵️", flavorText: "You find information. OSINT tools and AI find it faster" },

  // ══════════════════════════════════════════════════
  // AGRICULTURE & ENVIRONMENT
  // ══════════════════════════════════════════════════
  farmer:            { title: "Farmer",                   icon: "🌾", flavorText: "You grow food. Precision agriculture AI optimizes but you plow" },
  rancher:           { title: "Rancher",                  icon: "🐄", flavorText: "You raise animals. AI monitors health but you do the work" },
  arborist:          { title: "Arborist",                 icon: "🌳", flavorText: "You care for trees. Chainsaws need human operators. Thankfully" },
  landscaper:        { title: "Landscaper",               icon: "🌿", flavorText: "You shape outdoor spaces. Roomba for lawns exists but you do the art" },
  animal_trainer:    { title: "Animal Trainer",           icon: "🐕", flavorText: "You train animals. AI trains on data. Different kinds of training" },
  zookeeper:         { title: "Zookeeper",                icon: "🦁", flavorText: "You care for wild animals in captivity. Deeply physical, deeply safe" },
  forester:          { title: "Forester",                 icon: "🌲", flavorText: "You manage forests. Satellites help but trees need hands" },

  // ══════════════════════════════════════════════════
  // FITNESS & WELLNESS
  // ══════════════════════════════════════════════════
  personal_trainer:  { title: "Personal Trainer",         icon: "💪", flavorText: "You motivate humans to lift things. AI motivates with notifications" },
  yoga_instructor:   { title: "Yoga Instructor",          icon: "🧘", flavorText: "You guide breathing and movement. YouTube is competition but presence isn't" },
  sports_coach:      { title: "Sports Coach",             icon: "🏆", flavorText: "You develop athletes. AI analyzes performance but can't inspire" },
  athletic_trainer:  { title: "Athletic Trainer",         icon: "🏃", flavorText: "You prevent and treat sports injuries. Bodies need bodies" },
  massage_therapist: { title: "Massage Therapist",        icon: "💆", flavorText: "You touch humans therapeutically. Maximum AI-resistance achieved" },

  // ══════════════════════════════════════════════════
  // EXECUTIVE & LEADERSHIP
  // ══════════════════════════════════════════════════
  executive:         { title: "Executive / C-Suite",      icon: "👑", flavorText: "You make the big calls. AI will make them with better data" },
  manager:           { title: "People Manager",           icon: "👔", flavorText: "You approve PTO requests and schedule 1:1s. For now" },
  ceo:               { title: "CEO",                      icon: "🏛️", flavorText: "You run the company. AI will run parts of it better" },
  cmo:               { title: "CMO",                      icon: "📣", flavorText: "You set marketing strategy. AI-generated campaigns are 10x faster" },
  ciso:              { title: "CISO",                      icon: "🔒", flavorText: "You protect the company from hackers. AI hacks AND defends" },
  vp_sales:          { title: "VP of Sales",              icon: "📈", flavorText: "You hit revenue targets. AI will set AND hit them" },
  director:          { title: "Director",                 icon: "🎯", flavorText: "You direct teams. AI directs workflows" },

  // ══════════════════════════════════════════════════
  // MISCELLANEOUS / NICHE
  // ══════════════════════════════════════════════════
  consultant:        { title: "Consultant / Advisor",     icon: "🧠", flavorText: "You charge $400/hr to say what Claude says for $20/mo" },
  freelancer:        { title: "Freelancer / Independent", icon: "🦅", flavorText: "You are the business. AI is your biggest competitor AND tool" },
  entrepreneur:      { title: "Entrepreneur / Founder",   icon: "🚀", flavorText: "You build companies. AI lets you build them with fewer people" },
  product_owner:     { title: "Product Owner",            icon: "📦", flavorText: "You own the backlog. AI will prioritize it better" },
  ux_writer:         { title: "UX Writer",                icon: "💬", flavorText: "You write button labels. AI A/B tests 10,000 labels per button" },
  solutions_eng:     { title: "Solutions Engineer",       icon: "🔧", flavorText: "You bridge sales and engineering. AI bridges everything" },
  data_steward:      { title: "Data Steward / Governance",icon: "📊", flavorText: "You govern data. AI generates AND governs data" },
  devrel:            { title: "Developer Relations",      icon: "🤝", flavorText: "You make developers like your product. AI makes documentation" },
  technical_pm:      { title: "Technical Program Manager",icon: "📋", flavorText: "You manage technical programs. AI manages Jira tickets" },
  release_mgr:       { title: "Release Manager",         icon: "🚀", flavorText: "You ship software. CI/CD ships it without you" },
};

const RESOURCES = {
  critical: {
    title: "EMERGENCY SURVIVAL KIT", subtitle: "You need to move NOW.",
    resources: [
      { name: "fast.ai", url: "https://www.fast.ai", desc: "Free deep learning — zero to dangerous in weeks" },
      { name: "Claude Code", url: "https://docs.anthropic.com/en/docs/claude-code", desc: "AI coding from terminal. Pilot it before it pilots you" },
      { name: "Langchain", url: "https://github.com/langchain-ai/langchain", desc: "Build AI chains. Be the automator, not the automated" },
      { name: "n8n", url: "https://github.com/n8n-io/n8n", desc: "Open-source workflow automation. Automate yourself first" },
      { name: "Prompt Engineering Guide", url: "https://github.com/dair-ai/Prompt-Engineering-Guide", desc: "Most in-demand skill: talking to robots properly" },
      { name: "OpenClaw", url: "https://github.com/PicoCreator/OpenClaw", desc: "Open-source AI agents. Study the thing replacing you" },
    ],
  },
  urgent: {
    title: "UPSKILL OR PERISH", subtitle: "You've got a window. Use it.",
    resources: [
      { name: "Hugging Face Courses", url: "https://huggingface.co/learn", desc: "Free NLP/ML from the open-source AI hub" },
      { name: "CrewAI", url: "https://github.com/crewAIInc/crewAI", desc: "Multi-agent systems. Command the AI army" },
      { name: "Ollama", url: "https://github.com/ollama/ollama", desc: "Run LLMs locally. Understand the enemy" },
      { name: "DSPy", url: "https://github.com/stanfordnlp/dspy", desc: "Programming foundation models. Next-level" },
      { name: "AutoGen", url: "https://github.com/microsoft/autogen", desc: "Multi-agent conversations. Agents managing agents" },
      { name: "Full Stack Deep Learning", url: "https://fullstackdeeplearning.com", desc: "Production ML end to end" },
    ],
  },
  moderate: {
    title: "STRATEGIC UPGRADES", subtitle: "Not in danger yet. The smart ones are preparing.",
    resources: [
      { name: "Anthropic Cookbook", url: "https://github.com/anthropics/anthropic-cookbook", desc: "Building with Claude. Know your future coworker" },
      { name: "Cursor", url: "https://www.cursor.com", desc: "Code with AI, not against it" },
      { name: "LlamaIndex", url: "https://github.com/run-llama/llama_index", desc: "Connect LLMs to your data. Be the bridge" },
      { name: "Awesome AI Agents", url: "https://github.com/e2b-dev/awesome-ai-agents", desc: "Know what's coming for you" },
      { name: "Weights & Biases", url: "https://www.wandb.ai", desc: "Speak the language of the AI teams" },
      { name: "Awesome MLOps", url: "https://github.com/visenger/awesome-mlops", desc: "Putting ML into production" },
    ],
  },
  safe: {
    title: "FUTURE-PROOFING", subtitle: "You're solid. Stay ahead of the curve.",
    resources: [
      { name: "AI Safety Fundamentals", url: "https://aisafetyfundamentals.com", desc: "Govern AI = last ones standing" },
      { name: "Three.js", url: "https://threejs.org", desc: "Physical-digital interfaces. Human creativity wins" },
      { name: "The Bitter Lesson", url: "http://www.incompleteideas.net/IncIdeas/BitterLesson.html", desc: "Most important 2-page AI essay ever written" },
      { name: "Simon Willison's Blog", url: "https://simonwillison.net", desc: "Best AI practitioner blog. Trenches-level info" },
      { name: "Latent Space Podcast", url: "https://www.latent.space", desc: "AI engineering podcast. Know the landscape" },
      { name: "Awesome Self-Hosted", url: "https://github.com/awesome-selfhosted/awesome-selfhosted", desc: "Digital sovereignty matters more every year" },
    ],
  },
};

// ═══════════════════════════════════════════════════════
// JOB FAMILIES: Shared answer patterns for scalable detection
// Each family defines preferred answers per question (indices)
// Format: [best_option, 2nd_best, 3rd_best, ...]
// ═══════════════════════════════════════════════════════

const JOB_FAMILIES = {
  tech_code: {
    t: [2],      d: [4, 2],   o: [1],     k: [1, 0, 4], u: [1, 0],   r: [0],    e: [0, 5],   m: [3, 1],
    s: [0],      w: [0, 1],
    antiT: [4, 8], antiO: [2, 7], antiR: [2],
  },
  tech_infra: {
    t: [2],      d: [2, 4],   o: [1],     k: [1, 4],    u: [4, 0],   r: [0, 1], e: [5, 0],   m: [1, 3],
    s: [0],      w: [0, 1],
    antiT: [4, 8], antiO: [2, 7],
  },
  tech_data: {
    t: [2, 9],   d: [4, 2],   o: [1],     k: [4, 1],    u: [0, 1],   r: [0],    e: [5, 0],   m: [3, 1],
    s: [0],      w: [0, 1],
    antiT: [4, 8], antiO: [2, 7],
  },
  tech_research: {
    t: [9, 2],   d: [2, 5],   o: [5, 1],  k: [4, 1],    u: [0],      r: [0, 4], e: [5, 1],   m: [1, 3],
    s: [0, 3],   w: [0, 2],
    antiT: [4, 8], antiO: [2, 7],
  },
  design_creative: {
    t: [3],      d: [4, 2],   o: [5],     k: [1, 0],    u: [5, 0],   r: [0, 1], e: [1, 0],   m: [1, 3],
    s: [5, 0],   w: [5, 0],
    antiT: [4, 0, 8], antiO: [2],
  },
  writing_content: {
    t: [3],      d: [4, 2],   o: [5, 0],  k: [0, 1],    u: [5, 0],   r: [0],    e: [0, 1],   m: [3],
    s: [5, 0],   w: [0, 5],
    antiT: [4, 8, 2], antiO: [2, 1],
  },
  product_strategy: {
    t: [1],      d: [2, 4],   o: [0, 3],  k: [1, 0],    u: [4, 7],   r: [1, 0], e: [1, 2],   m: [0, 5],
    s: [0, 8],   w: [1, 0],
    antiT: [4, 2], antiO: [2, 1],
  },
  business_ops: {
    t: [0, 6],   d: [0, 1],   o: [0, 3],  k: [2, 1],    u: [4, 1],   r: [1],    e: [1, 2],   m: [0],
    s: [10, 6],  w: [1, 10],
    antiT: [4, 9], antiO: [2, 5],
  },
  executive_leadership: {
    t: [1, 5],   d: [2, 5],   o: [3],     k: [2, 1],    u: [6, 2],   r: [1, 4], e: [1, 2],   m: [5, 2],
    s: [0, 1],   w: [8, 1],
    antiT: [4, 2, 0], antiO: [1, 2],
  },
  people_management: {
    t: [5, 1],   d: [2],      o: [3, 4],  k: [2, 1],    u: [6, 4],   r: [1, 3], e: [2, 1],   m: [0, 5],
    s: [0, 1],   w: [1, 8],
    antiT: [4, 2, 9], antiO: [1, 2],
  },
  sales_revenue: {
    t: [8],      d: [5, 2],   o: [7, 4],  k: [2, 1],    u: [2],      r: [1, 3], e: [2, 1],   m: [2],
    s: [0, 7],   w: [1, 0],
    antiT: [2, 9, 4], antiO: [1, 2],
  },
  marketing_comms: {
    t: [3, 6],   d: [4, 1],   o: [0, 5],  k: [0, 1],    u: [5, 1],   r: [0, 1], e: [0, 1],   m: [0, 1],
    s: [0, 5],   w: [1, 0],
    antiT: [4, 9], antiO: [2],
  },
  finance_numbers: {
    t: [0, 6],   d: [0, 1],   o: [0],     k: [2, 5],    u: [1, 0],   r: [1, 0], e: [0, 1],   m: [0, 3],
    s: [1],      w: [1, 0],
    antiT: [4, 3], antiO: [2, 5],
  },
  legal_compliance: {
    t: [0, 9],   d: [2, 0],   o: [0],     k: [2, 5],    u: [0, 6],   r: [1, 4], e: [1, 2],   m: [2, 1],
    s: [8],      w: [1, 9],
    antiT: [4, 8], antiO: [2],
  },
  healthcare_clinical: {
    t: [4],      d: [3, 2],   o: [4, 2],  k: [3, 2],    u: [0, 2],   r: [2],    e: [3],      m: [4, 1],
    s: [2],      w: [2],
    antiT: [0, 8, 2], antiO: [1, 0],
  },
  mental_health: {
    t: [5, 7],   d: [2, 3],   o: [4],     k: [3, 2],    u: [2],      r: [2, 3], e: [3, 2],   m: [4],
    s: [2, 3],   w: [1, 2],
    antiT: [0, 2, 8], antiO: [1, 0],
  },
  education_training: {
    t: [7],      d: [2, 4],   o: [6],     k: [2, 1],    u: [7, 0],   r: [2, 1], e: [2, 1],   m: [4, 1],
    s: [3],      w: [4],
    antiT: [8, 0], antiO: [1, 7],
  },
  admin_office: {
    t: [0],      d: [0, 1],   o: [0],     k: [2, 5],    u: [3, 1],   r: [1],    e: [0, 4],   m: [0],
    s: [0, 4],   w: [1],
    antiT: [4, 9, 2], antiO: [2, 5],
  },
  hr_people: {
    t: [5, 8],   d: [2, 4],   o: [4, 0],  k: [2, 5],    u: [2, 6],   r: [1, 3], e: [2, 1],   m: [4, 0],
    s: [0, 8],   w: [1],
    antiT: [2, 4, 9], antiO: [1, 2],
  },
  trades_physical: {
    t: [4],      d: [3, 1],   o: [2],     k: [3],       u: [0, 2],   r: [2],    e: [3],      m: [3],
    s: [6],      w: [3],
    antiT: [0, 8, 9], antiO: [0, 1],
  },
  engineering_hard: {
    t: [2, 9],   d: [2, 4],   o: [2, 1],  k: [1, 2],    u: [0],      r: [1, 2], e: [1, 2],   m: [1],
    s: [6, 0],   w: [1, 3],
    antiT: [8, 5], antiO: [7],
  },
  science_lab: {
    t: [9],      d: [2, 1],   o: [5, 2],  k: [2, 3],    u: [0],      r: [2, 4], e: [2, 3],   m: [1, 3],
    s: [3, 2],   w: [2],
    antiT: [8, 0, 5], antiO: [7, 0],
  },
  government_public: {
    t: [0, 1],   d: [2, 0],   o: [0, 3],  k: [5, 2],    u: [6, 0],   r: [4, 2], e: [2, 3],   m: [0, 2],
    s: [4],      w: [9, 1],
    antiT: [2, 3], antiO: [1],
  },
  hospitality_food: {
    t: [4, 5],   d: [2, 1],   o: [2, 4],  k: [3, 2],    u: [5, 2],   r: [2],    e: [3, 2],   m: [3, 4],
    s: [7],      w: [7],
    antiT: [0, 9, 2], antiO: [0, 1],
  },
  transportation: {
    t: [4],      d: [3, 2],   o: [2],     k: [3, 2],    u: [0],      r: [2],    e: [3, 2],   m: [3],
    s: [10],     w: [6],
    antiT: [0, 9, 3], antiO: [0, 5],
  },
  media_entertainment: {
    t: [3, 7],   d: [2, 4],   o: [5, 4],  k: [2, 3],    u: [5, 2],   r: [2, 1], e: [2, 1],   m: [2, 1],
    s: [5],      w: [5, 0],
    antiT: [0, 2], antiO: [1, 0],
  },
  customer_support: {
    t: [0, 5],   d: [0, 4],   o: [4, 0],  k: [2, 1],    u: [2, 1],   r: [1, 0], e: [0, 1],   m: [4, 0],
    s: [0, 7],   w: [1, 0],
    antiT: [4, 9, 2], antiO: [2, 5],
  },
  security_safety: {
    t: [4, 6],   d: [3, 2],   o: [3, 2],  k: [3, 2],    u: [0, 4],   r: [2, 4], e: [3, 2],   m: [3, 1],
    s: [4, 0],   w: [9, 3],
    antiT: [3, 8], antiO: [5, 7],
  },
  agriculture_outdoor: {
    t: [4],      d: [1, 2],   o: [2],     k: [3],       u: [0],      r: [2],    e: [3],      m: [3],
    s: [9],      w: [11],
    antiT: [0, 8, 1], antiO: [0, 1, 7],
  },
  fitness_wellness: {
    t: [7, 4],   d: [2, 4],   o: [4, 6],  k: [3, 2],    u: [2, 5],   r: [2, 3], e: [3, 2],   m: [4],
    s: [2, 7],   w: [5, 3],
    antiT: [0, 2, 8], antiO: [0, 1],
  },
  real_estate_prop: {
    t: [8, 4],   d: [5, 2],   o: [7, 4],  k: [2, 1],    u: [2, 0],   r: [1, 2], e: [1, 2],   m: [2],
    s: [11],     w: [1, 3],
    antiT: [2, 9], antiO: [1],
  },
};

// Map every job to its family (and optional differentiation signals)
// diff: extra boosted question+options that separate this job from siblings
const JOB_FAMILY_MAP = {
  // ── TECH CODE ──────────────────────────────────────────
  developer:       { family: "tech_code", diff: { s: [0], w: [0] } },
  frontend_dev:    { family: "tech_code", diff: { u: [5], s: [0], w: [0] } },
  backend_dev:     { family: "tech_code", diff: { m: [3], s: [0], w: [0] } },
  fullstack_dev:   { family: "tech_code", diff: { u: [4], s: [0], w: [0] } },
  mobile_dev:      { family: "tech_code", diff: { s: [0], w: [0, 1] } },
  game_dev:        { family: "tech_code", diff: { u: [5], s: [5, 0], w: [5, 0] } },
  embedded_eng:    { family: "tech_code", diff: { r: [2, 4], k: [2, 3], s: [6, 0], w: [3, 2] } },
  security_eng:    { family: "tech_code", diff: { u: [0, 4], r: [4], s: [0], w: [1, 9] } },
  blockchain_dev:  { family: "tech_code", diff: { s: [1, 0], w: [0] } },
  firmware_eng:    { family: "tech_code", diff: { r: [2], k: [2, 3], s: [6, 0], w: [3, 2] } },
  ui_developer:    { family: "tech_code", diff: { u: [5], s: [0, 5], w: [0, 5] } },

  // ── TECH INFRA ─────────────────────────────────────────
  devops:          { family: "tech_infra", diff: { s: [0], w: [0, 1] } },
  platform_eng:    { family: "tech_infra", diff: { s: [0], w: [0, 1] } },
  site_reliability:{ family: "tech_infra", diff: { u: [4], s: [0], w: [0, 1] } },
  systems_admin:   { family: "tech_infra", diff: { d: [0, 1], s: [0, 4], w: [1, 0] } },
  dba:             { family: "tech_infra", diff: { d: [0, 1], s: [0, 1], w: [1, 0] } },
  network_eng:     { family: "tech_infra", diff: { r: [2, 4], s: [0, 10], w: [1, 3] } },
  infosec_analyst: { family: "tech_infra", diff: { r: [4], s: [0, 1], w: [1, 9] } },
  cloud_architect: { family: "tech_infra", diff: { m: [1, 2], d: [2], s: [0], w: [1, 0] } },

  // ── TECH DATA ──────────────────────────────────────────
  data_engineer:   { family: "tech_data", diff: { s: [0], w: [0, 1] } },
  ml_engineer:     { family: "tech_data", diff: { t: [9], s: [0], w: [0, 2] } },
  ai_researcher:   { family: "tech_research", diff: { s: [0, 3], w: [0, 2] } },
  data_scientist:  { family: "tech_data", diff: { t: [9, 6], s: [0, 1], w: [0, 1] } },

  // ── TECH LEADERSHIP ────────────────────────────────────
  lead:            { family: "tech_code", diff: { u: [6, 0], m: [1], t: [7, 2], s: [0], w: [1, 0] } },
  cto:             { family: "tech_code", diff: { d: [2], o: [3], m: [5, 2], u: [6], s: [0], w: [8, 1] } },
  vp_engineering:  { family: "executive_leadership", diff: { t: [2, 1], s: [0], w: [1, 8] } },

  // ── TECH ADJACENT ──────────────────────────────────────
  qa_engineer:     { family: "tech_code", diff: { d: [0, 1], s: [0], w: [1, 0] } },
  test_automation: { family: "tech_code", diff: { d: [0, 1], s: [0], w: [1, 0] } },
  solutions_arch:  { family: "tech_code", diff: { m: [2, 1], o: [0], s: [0, 8], w: [1, 0] } },
  tech_writer:     { family: "writing_content", diff: { t: [2, 0], s: [0], w: [0, 1] } },
  dev_advocate:    { family: "marketing_comms", diff: { t: [2, 7], s: [0], w: [0, 5] } },

  // ── DESIGN ─────────────────────────────────────────────
  designer:        { family: "design_creative", diff: { s: [0, 5], w: [0, 1] } },
  product_designer:{ family: "design_creative", diff: { d: [4], m: [1], s: [0], w: [1, 0] } },
  graphic_designer:{ family: "design_creative", diff: { m: [3], s: [5, 0], w: [5, 0] } },
  brand_designer:  { family: "design_creative", diff: { o: [0, 5], s: [5, 8], w: [1, 5] } },
  motion_designer: { family: "design_creative", diff: { m: [3], s: [5], w: [5, 0] } },
  three_d_artist:  { family: "design_creative", diff: { m: [3], k: [1, 0], s: [5, 0], w: [5, 0] } },
  illustrator:     { family: "design_creative", diff: { m: [3], e: [0], s: [5], w: [5, 0] } },
  art_director:    { family: "design_creative", diff: { m: [1, 5], u: [6], s: [5], w: [1, 5] } },
  creative_director:{ family: "design_creative", diff: { d: [2], m: [5, 1], u: [6], s: [5], w: [8, 1] } },
  interior_designer:{ family: "design_creative", diff: { r: [2, 1], o: [2, 5], s: [11], w: [3, 1] } },
  fashion_designer:{ family: "design_creative", diff: { o: [2, 5], s: [7, 5], w: [5] } },
  industrial_designer:{ family: "design_creative", diff: { r: [2, 1], o: [2], s: [6], w: [3, 10] } },
  architect:       { family: "design_creative", diff: { r: [2, 1], d: [2], o: [0, 5], s: [11, 6], w: [1, 3] } },
  landscape_arch:  { family: "design_creative", diff: { r: [2], s: [9, 11], w: [11, 3] } },
  photographer:    { family: "design_creative", diff: { r: [2, 1], m: [3], s: [5], w: [5, 11] } },
  videographer:    { family: "design_creative", diff: { r: [2, 1], m: [3], s: [5], w: [5, 3] } },
  animator:        { family: "design_creative", diff: { m: [3], s: [5, 0], w: [5, 0] } },
  sound_designer:  { family: "design_creative", diff: { m: [3], s: [5], w: [5] } },
  music_producer:  { family: "design_creative", diff: { m: [3], r: [0], s: [5], w: [5, 0] } },
  ux_researcher:   { family: "design_creative", diff: { t: [9, 1], m: [1], s: [0], w: [1, 0] } },

  // ── WRITING ────────────────────────────────────────────
  writer:          { family: "writing_content", diff: { s: [5, 0], w: [0] } },
  journalist:      { family: "writing_content", diff: { r: [1, 2], d: [2], s: [5], w: [1, 0] } },
  editor:          { family: "writing_content", diff: { s: [5, 0], w: [1, 0] } },
  copywriter:      { family: "writing_content", diff: { t: [3], s: [5, 0], w: [0, 1] } },
  screenwriter:    { family: "writing_content", diff: { m: [3], s: [5], w: [0, 5] } },
  grant_writer:    { family: "writing_content", diff: { t: [0, 3], s: [3, 4], w: [1, 0] } },
  speechwriter:    { family: "writing_content", diff: { s: [4, 8], w: [1, 0] } },
  translator:      { family: "writing_content", diff: { u: [0], s: [8, 4], w: [0, 1] } },
  blogger:         { family: "writing_content", diff: { r: [0], s: [5, 0], w: [0] } },
  proposal_writer: { family: "writing_content", diff: { t: [0], s: [8, 4], w: [1, 0] } },
  ux_writer:       { family: "writing_content", diff: { t: [3, 2], s: [0], w: [0, 1] } },

  // ── DATA & ANALYTICS ──────────────────────────────────
  analyst:         { family: "finance_numbers", diff: { t: [6, 0], o: [0], s: [0, 1], w: [1, 0] } },
  business_analyst:{ family: "product_strategy", diff: { t: [0, 6], o: [0], s: [0, 8], w: [1] } },
  bi_analyst:      { family: "finance_numbers", diff: { t: [6], s: [0, 1], w: [1, 0] } },
  financial_analyst:{ family: "finance_numbers", diff: { d: [1, 5], s: [1], w: [1] } },
  market_researcher:{ family: "finance_numbers", diff: { t: [9, 6], s: [7, 0], w: [1, 0] } },
  quant_analyst:   { family: "finance_numbers", diff: { t: [2, 9], d: [5], s: [1], w: [1, 0] } },
  actuary:         { family: "finance_numbers", diff: { d: [0, 1], s: [1], w: [1] } },
  statistician:    { family: "finance_numbers", diff: { t: [9, 6], s: [3, 2], w: [1, 2] } },

  // ── PRODUCT & STRATEGY ─────────────────────────────────
  pm:              { family: "product_strategy", diff: { s: [0], w: [1, 0] } },
  program_manager: { family: "product_strategy", diff: { d: [0, 2], s: [0, 6], w: [1] } },
  project_manager: { family: "product_strategy", diff: { d: [0], u: [4], s: [6, 0], w: [1, 3] } },
  scrum_master:    { family: "product_strategy", diff: { t: [7, 1], s: [0], w: [1, 0] } },
  chief_of_staff:  { family: "product_strategy", diff: { d: [2], u: [6], s: [0, 1], w: [8, 1] } },
  strategy_consultant:{ family: "product_strategy", diff: { m: [2], u: [0, 7], s: [8], w: [8, 1] } },
  mgmt_consultant: { family: "product_strategy", diff: { m: [2], u: [0, 7], s: [8], w: [1, 8] } },
  coordinator:     { family: "admin_office", diff: { t: [1, 0], m: [0], s: [0, 6], w: [1] } },
  business_ops:    { family: "business_ops", diff: { s: [0, 7], w: [1] } },
  product_ops:     { family: "business_ops", diff: { t: [1, 6], s: [0], w: [1, 0] } },
  product_owner:   { family: "product_strategy", diff: { u: [4], s: [0], w: [1, 0] } },
  technical_pm:    { family: "product_strategy", diff: { t: [2, 1], s: [0], w: [1, 0] } },
  release_mgr:     { family: "product_strategy", diff: { d: [0], s: [0], w: [1, 0] } },
  consultant:      { family: "product_strategy", diff: { m: [2], u: [0, 7], o: [0], s: [8, 0], w: [1, 8] } },

  // ── SALES ──────────────────────────────────────────────
  sales:           { family: "sales_revenue", diff: { s: [0, 7], w: [1, 0] } },
  account_exec:    { family: "sales_revenue", diff: { m: [2], s: [0], w: [1, 0] } },
  sdr:             { family: "sales_revenue", diff: { u: [1], s: [0], w: [1, 0] } },
  account_manager: { family: "sales_revenue", diff: { u: [2], o: [4], s: [0], w: [1, 0] } },
  customer_success:{ family: "sales_revenue", diff: { u: [2], o: [4], s: [0], w: [1, 0] } },
  sales_engineer:  { family: "sales_revenue", diff: { t: [2, 8], s: [0], w: [1, 0] } },
  real_estate:     { family: "real_estate_prop", diff: { s: [11], w: [1, 3] } },
  insurance_agent: { family: "sales_revenue", diff: { d: [0, 5], s: [1], w: [1] } },
  retail_sales:    { family: "sales_revenue", diff: { r: [2], s: [7], w: [1] } },
  pharma_sales:    { family: "sales_revenue", diff: { r: [2, 1], s: [2], w: [1, 2] } },
  car_sales:       { family: "sales_revenue", diff: { r: [2], s: [7], w: [1] } },
  biz_dev:         { family: "sales_revenue", diff: { d: [5, 2], s: [0, 8], w: [1, 8] } },

  // ── MARKETING ──────────────────────────────────────────
  marketer:        { family: "marketing_comms", diff: { s: [0, 7], w: [1, 0] } },
  content_marketer:{ family: "marketing_comms", diff: { t: [3], s: [0], w: [0, 1] } },
  seo_specialist:  { family: "marketing_comms", diff: { t: [6, 2], s: [0], w: [0, 1] } },
  social_media:    { family: "marketing_comms", diff: { t: [3, 6], s: [5, 0], w: [0, 1] } },
  pr_specialist:   { family: "marketing_comms", diff: { m: [2], s: [5, 8], w: [1] } },
  brand_manager:   { family: "marketing_comms", diff: { u: [5, 6], s: [7, 0], w: [1] } },
  growth_hacker:   { family: "marketing_comms", diff: { t: [6, 2], s: [0], w: [0, 1] } },
  email_marketer:  { family: "marketing_comms", diff: { t: [0, 6], s: [0, 7], w: [0, 1] } },
  advertising:     { family: "marketing_comms", diff: { m: [2], s: [5], w: [1, 8] } },
  media_buyer:     { family: "marketing_comms", diff: { t: [6], s: [5, 0], w: [1] } },
  event_planner:   { family: "marketing_comms", diff: { r: [2], t: [5, 1], s: [7, 5], w: [5, 1] } },
  community_mgr:   { family: "marketing_comms", diff: { u: [2], s: [0], w: [0, 1] } },
  comms_manager:   { family: "marketing_comms", diff: { o: [0], s: [4, 0], w: [1] } },

  // ── FINANCE ────────────────────────────────────────────
  accountant:      { family: "finance_numbers", diff: { s: [1], w: [1] } },
  bookkeeper:      { family: "finance_numbers", diff: { d: [0], s: [1, 7], w: [1] } },
  auditor:         { family: "finance_numbers", diff: { d: [0, 2], s: [1, 8], w: [1] } },
  tax_preparer:    { family: "finance_numbers", diff: { d: [0], s: [8, 1], w: [1] } },
  financial_advisor:{ family: "finance_numbers", diff: { m: [2, 4], u: [2], s: [1], w: [1, 8] } },
  investment_banker:{ family: "finance_numbers", diff: { d: [5], m: [2, 3], s: [1], w: [8, 1] } },
  trader:          { family: "finance_numbers", diff: { d: [5], m: [3], s: [1], w: [1] } },
  portfolio_mgr:   { family: "finance_numbers", diff: { d: [5, 2], s: [1], w: [8, 1] } },
  risk_analyst:    { family: "finance_numbers", diff: { d: [1, 2], s: [1], w: [1] } },
  loan_officer:    { family: "finance_numbers", diff: { d: [0, 1], m: [2], s: [1], w: [1] } },
  underwriter:     { family: "finance_numbers", diff: { d: [0, 1], s: [1], w: [1] } },
  controller:      { family: "finance_numbers", diff: { d: [2], u: [6], s: [1], w: [8, 1] } },
  cfo:             { family: "executive_leadership", diff: { t: [0, 6], s: [1, 0], w: [8] } },
  payroll_spec:    { family: "admin_office", diff: { t: [0], s: [1, 0], w: [1] } },
  credit_analyst:  { family: "finance_numbers", diff: { d: [0, 1], s: [1], w: [1] } },

  // ── LEGAL ──────────────────────────────────────────────
  lawyer:          { family: "legal_compliance", diff: { d: [2], m: [2], s: [8], w: [9, 1] } },
  paralegal:       { family: "legal_compliance", diff: { d: [0, 1], s: [8], w: [1, 9] } },
  legal_assistant: { family: "admin_office", diff: { r: [4, 1], s: [8], w: [1, 9] } },
  compliance:      { family: "legal_compliance", diff: { d: [0, 2], s: [1, 8], w: [1, 9] } },
  contract_mgr:    { family: "legal_compliance", diff: { d: [0], s: [8, 0], w: [1] } },
  patent_attorney: { family: "legal_compliance", diff: { t: [9, 0], s: [8, 0], w: [1, 9] } },
  mediator:        { family: "legal_compliance", diff: { m: [4, 2], u: [2], s: [8], w: [9, 1] } },
  legal_ops:       { family: "legal_compliance", diff: { d: [0], s: [8], w: [1] } },
  ip_specialist:   { family: "legal_compliance", diff: { t: [9, 0], s: [0, 8], w: [1] } },

  // ── HEALTHCARE ─────────────────────────────────────────
  doctor:          { family: "healthcare_clinical", diff: { d: [2, 3], s: [2], w: [2] } },
  surgeon:         { family: "healthcare_clinical", diff: { d: [3], s: [2], w: [2] } },
  nurse:           { family: "healthcare_clinical", diff: { u: [2, 4], s: [2], w: [2] } },
  nurse_practitioner:{ family: "healthcare_clinical", diff: { d: [2], s: [2], w: [2] } },
  physician_asst:  { family: "healthcare_clinical", diff: { d: [2], s: [2], w: [2] } },
  pharmacist:      { family: "healthcare_clinical", diff: { d: [0, 1], t: [0, 4], s: [2], w: [2, 1] } },
  dentist:         { family: "healthcare_clinical", diff: { d: [2, 1], s: [2], w: [2] } },
  dental_hygienist:{ family: "healthcare_clinical", diff: { d: [0], s: [2], w: [2] } },
  physical_therapist:{ family: "healthcare_clinical", diff: { t: [7, 4], s: [2], w: [2, 5] } },
  occupational_ther:{ family: "healthcare_clinical", diff: { t: [7, 4], s: [2, 3], w: [2] } },
  speech_therapist:{ family: "healthcare_clinical", diff: { t: [7, 4], s: [2, 3], w: [2, 4] } },
  radiologist:     { family: "healthcare_clinical", diff: { t: [9, 4], m: [3], s: [2], w: [2] } },
  lab_tech:        { family: "healthcare_clinical", diff: { t: [9], d: [0, 1], m: [3], s: [2], w: [2] } },
  emt:             { family: "healthcare_clinical", diff: { d: [3], s: [2], w: [6] } },
  midwife:         { family: "healthcare_clinical", diff: { u: [2], s: [2], w: [2] } },
  optometrist:     { family: "healthcare_clinical", diff: { d: [1, 2], s: [2], w: [2] } },
  veterinarian:    { family: "healthcare_clinical", diff: { d: [3, 2], s: [9, 2], w: [2, 11] } },
  healthcare_hands:{ family: "healthcare_clinical", diff: { s: [2], w: [2] } },
  med_coder:       { family: "admin_office", diff: { k: [2, 5], r: [1], s: [2], w: [1, 2] } },

  // ── MENTAL HEALTH ──────────────────────────────────────
  therapist:       { family: "mental_health", diff: { s: [2, 8], w: [1, 2] } },
  psychologist:    { family: "mental_health", diff: { t: [9, 5], s: [2, 3], w: [1, 2] } },
  psychiatrist:    { family: "mental_health", diff: { d: [3, 2], s: [2], w: [2] } },
  social_worker:   { family: "mental_health", diff: { r: [2], d: [3, 2], s: [4, 2], w: [1, 9] } },
  life_coach:      { family: "mental_health", diff: { r: [0, 1], s: [8, 2], w: [0, 1] } },
  school_counselor:{ family: "mental_health", diff: { r: [2], t: [7], s: [3], w: [4] } },
  addiction_couns: { family: "mental_health", diff: { d: [3], s: [2], w: [2, 1] } },
  marriage_couns:  { family: "mental_health", diff: { s: [8, 2], w: [1] } },

  // ── EDUCATION ──────────────────────────────────────────
  teacher:         { family: "education_training", diff: { s: [3], w: [4] } },
  professor:       { family: "education_training", diff: { t: [9, 7], r: [1], s: [3], w: [4, 2] } },
  tutor:           { family: "education_training", diff: { r: [0, 2], s: [3], w: [0, 4] } },
  school_admin:    { family: "education_training", diff: { t: [5, 1], m: [0, 5], s: [3], w: [1, 4] } },
  curriculum_design:{ family: "education_training", diff: { m: [3, 1], s: [3], w: [0, 1] } },
  special_ed:      { family: "education_training", diff: { u: [2], s: [3], w: [4] } },
  esl_teacher:     { family: "education_training", diff: { s: [3], w: [4] } },
  librarian:       { family: "education_training", diff: { m: [3], d: [0, 1], s: [3, 4], w: [4, 1] } },
  academic_advisor:{ family: "education_training", diff: { m: [4], u: [2], s: [3], w: [1, 4] } },
  trainer:         { family: "education_training", diff: { r: [1, 0], s: [0, 8], w: [1, 4] } },
  instruct_designer:{ family: "education_training", diff: { m: [3], t: [3, 7], s: [3, 0], w: [0, 1] } },
  academic:        { family: "education_training", diff: { t: [9], r: [1], s: [3], w: [4, 2] } },

  // ── ADMIN ──────────────────────────────────────────────
  admin:           { family: "admin_office", diff: { s: [0, 1], w: [1] } },
  exec_assistant:  { family: "admin_office", diff: { u: [6, 4], s: [0, 1], w: [8, 1] } },
  office_manager:  { family: "admin_office", diff: { u: [4], r: [2], s: [0, 8], w: [1] } },
  receptionist:    { family: "admin_office", diff: { r: [2], s: [2, 8], w: [1, 2] } },
  data_entry:      { family: "admin_office", diff: { d: [0], s: [0, 1], w: [1, 0] } },
  virtual_assistant:{ family: "admin_office", diff: { r: [0], s: [0, 8], w: [0] } },
  secretary:       { family: "admin_office", diff: { s: [8, 4], w: [1, 9] } },

  // ── HR ─────────────────────────────────────────────────
  hr:              { family: "hr_people", diff: { s: [0, 1], w: [1] } },
  hr_generalist:   { family: "hr_people", diff: { s: [0, 7], w: [1] } },
  recruiter:       { family: "hr_people", diff: { t: [8, 5], s: [0], w: [1, 0] } },
  talent_acquisition:{ family: "hr_people", diff: { t: [8], s: [0], w: [1, 0] } },
  compensation:    { family: "hr_people", diff: { t: [0, 6], s: [0, 1], w: [1] } },
  benefits_admin:  { family: "admin_office", diff: { t: [0, 5], s: [0, 2], w: [1] } },
  dei_officer:     { family: "hr_people", diff: { d: [2], u: [2], s: [0, 4], w: [1] } },
  employee_relations:{ family: "hr_people", diff: { m: [4], s: [0, 6], w: [1] } },
  hris_specialist: { family: "admin_office", diff: { t: [2, 0], s: [0], w: [1, 0] } },
  learning_dev:    { family: "hr_people", diff: { t: [7], s: [0, 8], w: [1, 4] } },

  // ── OPERATIONS ─────────────────────────────────────────
  ops:             { family: "business_ops", diff: { s: [0, 7], w: [1, 10] } },
  supply_chain:    { family: "business_ops", diff: { d: [2], s: [6, 10], w: [10, 1] } },
  logistics_coord: { family: "business_ops", diff: { d: [0], s: [10], w: [10, 1] } },
  warehouse_mgr:   { family: "business_ops", diff: { r: [2], s: [7, 10], w: [10] } },
  procurement:     { family: "business_ops", diff: { m: [2], s: [6, 0], w: [1] } },
  inventory_mgr:   { family: "business_ops", diff: { d: [0], s: [7, 6], w: [10] } },
  quality_mgr:     { family: "business_ops", diff: { d: [0, 2], s: [6], w: [10, 3] } },
  fleet_mgr:       { family: "business_ops", diff: { r: [2], s: [10], w: [10, 1] } },
  import_export:   { family: "business_ops", diff: { r: [4], s: [10], w: [1, 10] } },

  // ── TRADES ─────────────────────────────────────────────
  trades:          { family: "trades_physical", diff: { s: [6], w: [3] } },
  electrician:     { family: "trades_physical", diff: { u: [0], s: [6], w: [3] } },
  plumber:         { family: "trades_physical", diff: { s: [6], w: [3] } },
  carpenter:       { family: "trades_physical", diff: { u: [5, 0], s: [6], w: [3] } },
  hvac_tech:       { family: "trades_physical", diff: { s: [6], w: [3] } },
  welder:          { family: "trades_physical", diff: { s: [6], w: [3, 10] } },
  mechanic:        { family: "trades_physical", diff: { u: [0], s: [10, 6], w: [3, 10] } },
  mason:           { family: "trades_physical", diff: { s: [6], w: [3] } },
  roofer:          { family: "trades_physical", diff: { s: [6], w: [3] } },
  painter_trade:   { family: "trades_physical", diff: { s: [6], w: [3] } },
  locksmith:       { family: "trades_physical", diff: { u: [0], s: [6, 7], w: [3] } },
  crane_operator:  { family: "trades_physical", diff: { s: [6], w: [3] } },
  heavy_equipment: { family: "trades_physical", diff: { s: [6, 9], w: [3, 11] } },
  field_tech:      { family: "trades_physical", diff: { u: [0], t: [2, 4], s: [0, 6], w: [3, 6] } },

  // ── HARD ENGINEERING (key disambiguation!) ─────────────
  mech_engineer:   { family: "engineering_hard", diff: { s: [6, 0], w: [1, 3] } },
  civil_engineer:  { family: "engineering_hard", diff: { r: [2, 1], s: [6], w: [3, 1] } },
  electrical_eng:  { family: "engineering_hard", diff: { s: [6, 0], w: [2, 1] } },
  chemical_eng:    { family: "engineering_hard", diff: { r: [2, 4], s: [6], w: [2, 10] } },
  aerospace_eng:   { family: "engineering_hard", diff: { r: [4, 2], s: [4, 6], w: [2, 9] } },
  environmental_eng:{ family: "engineering_hard", diff: { r: [2, 1], s: [9, 6], w: [3, 11] } },
  structural_eng:  { family: "engineering_hard", diff: { r: [2, 1], s: [6, 11], w: [3, 1] } },
  biomedical_eng:  { family: "engineering_hard", diff: { t: [9, 2], s: [2], w: [2] } },
  industrial_eng:  { family: "engineering_hard", diff: { t: [6, 2], s: [6], w: [10, 1] } },
  nuclear_eng:     { family: "engineering_hard", diff: { r: [4], s: [4, 6], w: [9, 2] } },
  petroleum_eng:   { family: "engineering_hard", diff: { r: [2], s: [6], w: [3, 11] } },
  materials_sci:   { family: "science_lab", diff: { t: [9], s: [6, 3], w: [2] } },

  // ── SCIENCE ────────────────────────────────────────────
  researcher:      { family: "science_lab", diff: { s: [3], w: [2] } },
  scientist:       { family: "science_lab", diff: { s: [3, 2], w: [2] } },
  biologist:       { family: "science_lab", diff: { s: [2, 3], w: [2] } },
  chemist:         { family: "science_lab", diff: { s: [2, 6], w: [2] } },
  physicist:       { family: "science_lab", diff: { t: [9, 2], s: [3, 4], w: [2, 0] } },
  geologist:       { family: "science_lab", diff: { r: [2], s: [6, 9], w: [11, 3] } },
  neuroscientist:  { family: "science_lab", diff: { s: [2, 3], w: [2] } },
  climate_scientist:{ family: "science_lab", diff: { t: [9, 6], s: [4, 9], w: [2, 0] } },
  food_scientist:  { family: "science_lab", diff: { r: [2], s: [7], w: [2, 10] } },
  forensic_sci:    { family: "science_lab", diff: { r: [2, 4], s: [4], w: [2, 9] } },
  epidemiologist:  { family: "science_lab", diff: { t: [9, 6], s: [2, 4], w: [2, 1] } },
  marine_biologist:{ family: "science_lab", diff: { r: [2], s: [9, 3], w: [11, 2] } },
  astronomer:      { family: "science_lab", diff: { t: [9], s: [3, 4], w: [2, 0] } },

  // ── GOVERNMENT ─────────────────────────────────────────
  policy_analyst:  { family: "government_public", diff: { s: [4], w: [9, 1] } },
  diplomat:        { family: "government_public", diff: { u: [2], m: [2], s: [4], w: [9, 8] } },
  city_planner:    { family: "government_public", diff: { t: [9, 0], r: [1, 2], s: [4], w: [1, 9] } },
  public_admin:    { family: "government_public", diff: { s: [4], w: [9, 1] } },
  intel_analyst:   { family: "government_public", diff: { t: [6, 9], r: [4], s: [4], w: [9] } },
  military_officer:{ family: "government_public", diff: { d: [3, 2], r: [2, 4], s: [4], w: [9, 3] } },
  firefighter:     { family: "trades_physical", diff: { d: [3], s: [4], w: [3, 6] } },
  police_officer:  { family: "security_safety", diff: { d: [3], r: [2], s: [4], w: [6, 9] } },
  park_ranger:     { family: "agriculture_outdoor", diff: { d: [2, 3], s: [4, 9], w: [11] } },
  social_services: { family: "mental_health", diff: { t: [0, 5], s: [4], w: [1, 9] } },
  regulatory:      { family: "legal_compliance", diff: { d: [0], s: [4, 1], w: [9, 1] } },

  // ── FOOD & HOSPITALITY ─────────────────────────────────
  chef:            { family: "hospitality_food", diff: { s: [7], w: [7] } },
  sous_chef:       { family: "hospitality_food", diff: { s: [7], w: [7] } },
  pastry_chef:     { family: "hospitality_food", diff: { u: [5], s: [7], w: [7] } },
  bartender:       { family: "hospitality_food", diff: { u: [2], s: [7], w: [7] } },
  restaurant_mgr:  { family: "hospitality_food", diff: { t: [5], u: [4], s: [7], w: [7] } },
  hotel_mgr:       { family: "hospitality_food", diff: { t: [5, 1], s: [7], w: [7, 8] } },
  sommelier:       { family: "hospitality_food", diff: { u: [0, 5], s: [7], w: [7] } },
  nutritionist:    { family: "healthcare_clinical", diff: { t: [7], d: [2], s: [2, 7], w: [2, 1] } },
  barista:         { family: "hospitality_food", diff: { s: [7], w: [7] } },
  food_critic:     { family: "writing_content", diff: { t: [9, 3], s: [7, 5], w: [7, 0] } },

  // ── TRANSPORTATION ─────────────────────────────────────
  pilot:           { family: "transportation", diff: { d: [3], s: [10], w: [6] } },
  atc:             { family: "transportation", diff: { d: [3], s: [10, 4], w: [9] } },
  truck_driver:    { family: "transportation", diff: { s: [10], w: [6] } },
  bus_driver:      { family: "transportation", diff: { u: [2], s: [10, 4], w: [6] } },
  delivery_driver: { family: "transportation", diff: { s: [7, 10], w: [6] } },
  dispatcher:      { family: "transportation", diff: { t: [6, 4], d: [3, 2], s: [10, 4], w: [1, 9] } },
  ship_captain:    { family: "transportation", diff: { d: [3, 2], s: [10], w: [6] } },

  // ── MEDIA & ENTERTAINMENT ──────────────────────────────
  actor:           { family: "media_entertainment", diff: { s: [5], w: [5] } },
  comedian:        { family: "media_entertainment", diff: { u: [5], s: [5], w: [5] } },
  podcast_host:    { family: "media_entertainment", diff: { r: [0], u: [2, 5], s: [5, 0], w: [5, 0] } },
  tv_producer:     { family: "media_entertainment", diff: { u: [4, 6], m: [5, 2], s: [5], w: [5, 8] } },
  sports_caster:   { family: "media_entertainment", diff: { r: [2], s: [5], w: [5, 6] } },
  dj:              { family: "media_entertainment", diff: { r: [2], u: [5], s: [5, 7], w: [5] } },
  talent_agent:    { family: "sales_revenue", diff: { u: [2], s: [5], w: [1, 8] } },
  voice_actor:     { family: "media_entertainment", diff: { m: [3], s: [5], w: [5, 0] } },
  streamer:        { family: "media_entertainment", diff: { r: [0], m: [3], s: [5, 0], w: [0] } },

  // ── REAL ESTATE ────────────────────────────────────────
  property_mgr:    { family: "real_estate_prop", diff: { t: [5, 4], s: [11], w: [1, 3] } },
  appraiser:       { family: "real_estate_prop", diff: { t: [4, 0], d: [1], s: [11], w: [3, 1] } },
  home_inspector:  { family: "trades_physical", diff: { u: [0], s: [11], w: [3] } },
  mortgage_broker: { family: "real_estate_prop", diff: { t: [0, 8], s: [11, 1], w: [1] } },
  commercial_re:   { family: "real_estate_prop", diff: { d: [5], s: [11], w: [8, 1] } },

  // ── CUSTOMER SUPPORT ───────────────────────────────────
  customer_service:{ family: "customer_support", diff: { s: [7, 0], w: [1] } },
  call_center:     { family: "customer_support", diff: { d: [0], s: [0, 1], w: [1] } },
  help_desk:       { family: "customer_support", diff: { t: [2, 0], s: [0], w: [1, 0] } },
  tech_support:    { family: "customer_support", diff: { t: [2, 0], u: [0], s: [0], w: [1, 0] } },
  client_relations:{ family: "customer_support", diff: { u: [2], s: [8, 0], w: [1] } },

  // ── SECURITY ───────────────────────────────────────────
  security_guard:  { family: "security_safety", diff: { d: [1, 0], r: [2], s: [7, 6], w: [3, 1] } },
  cyber_analyst:   { family: "tech_infra", diff: { r: [4], u: [0, 4], s: [0, 4], w: [1, 9] } },
  loss_prevention: { family: "security_safety", diff: { r: [2], s: [7], w: [1, 10] } },
  private_inv:     { family: "security_safety", diff: { r: [1, 2], u: [0], s: [8], w: [1, 0] } },

  // ── AGRICULTURE ────────────────────────────────────────
  farmer:          { family: "agriculture_outdoor", diff: { s: [9], w: [11] } },
  rancher:         { family: "agriculture_outdoor", diff: { s: [9], w: [11] } },
  arborist:        { family: "agriculture_outdoor", diff: { s: [9], w: [11] } },
  landscaper:      { family: "agriculture_outdoor", diff: { u: [5], s: [9, 11], w: [11] } },
  animal_trainer:  { family: "agriculture_outdoor", diff: { t: [7, 4], u: [2], s: [9, 5], w: [11, 5] } },
  zookeeper:       { family: "agriculture_outdoor", diff: { s: [9, 3], w: [11] } },
  forester:        { family: "agriculture_outdoor", diff: { u: [0], s: [9, 4], w: [11] } },

  // ── FITNESS ────────────────────────────────────────────
  personal_trainer:{ family: "fitness_wellness", diff: { s: [7, 2], w: [5, 3] } },
  yoga_instructor: { family: "fitness_wellness", diff: { u: [5], s: [2, 7], w: [5] } },
  sports_coach:    { family: "fitness_wellness", diff: { u: [2, 4], s: [3, 5], w: [3, 5] } },
  athletic_trainer:{ family: "fitness_wellness", diff: { s: [3, 2], w: [3, 5] } },
  massage_therapist:{ family: "fitness_wellness", diff: { m: [3], s: [2, 7], w: [5, 2] } },

  // ── EXECUTIVES ─────────────────────────────────────────
  executive:       { family: "executive_leadership", diff: { s: [0, 1], w: [8] } },
  manager:         { family: "people_management", diff: { s: [0, 1], w: [1, 8] } },
  ceo:             { family: "executive_leadership", diff: { d: [2], u: [6], s: [0], w: [8] } },
  cmo:             { family: "executive_leadership", diff: { t: [3, 6], s: [0, 5], w: [8, 1] } },
  ciso:            { family: "executive_leadership", diff: { t: [2, 6], r: [4], s: [0, 1], w: [8, 9] } },
  vp_sales:        { family: "executive_leadership", diff: { t: [8, 1], s: [0, 7], w: [8, 1] } },
  coo:             { family: "executive_leadership", diff: { t: [0, 1], u: [4], s: [0, 6], w: [8, 10] } },
  director:        { family: "executive_leadership", diff: { s: [0, 1], w: [8, 1] } },

  // ── MISC ───────────────────────────────────────────────
  freelancer:      { family: "tech_code", diff: { r: [0], u: [1, 5], s: [0, 5], w: [0] } },
  entrepreneur:    { family: "executive_leadership", diff: { r: [0, 1], u: [4, 5], s: [0], w: [0, 8] } },
  solutions_eng:   { family: "tech_code", diff: { m: [2], t: [2, 8], s: [0], w: [1, 0] } },
  data_steward:    { family: "finance_numbers", diff: { t: [0, 6], s: [0, 1], w: [1] } },
  devrel:          { family: "marketing_comms", diff: { t: [2, 7], s: [0], w: [0, 5] } },
};

/* ═══════════════════════════════════════════
   SCALABLE JOB GUESSING ENGINE (v2)
   Family-based pattern matching with
   weighted signals and disambiguation.
   ═══════════════════════════════════════════ */

const Q_KEYS = ["tasks", "decisions", "output", "tools", "unique", "remote", "replaced", "meeting"];
const Q_MAP = { t: "tasks", d: "decisions", o: "output", k: "tools", u: "unique", r: "remote", e: "replaced", m: "meeting", s: "sector", w: "environment" };
const SHORT_KEYS = ["t", "d", "o", "k", "u", "r", "e", "m", "s", "w"];

function guessJob(answers) {
  const picked = {};
  for (const a of answers) picked[a.questionId] = a.optionIndex;

  const scores = {};

  for (const [jobKey, jobInfo] of Object.entries(JOB_FAMILY_MAP)) {
    const family = JOB_FAMILIES[jobInfo.family];
    if (!family) continue;

    let score = 0;

    // Layer 1: Score against family pattern
    for (const sk of SHORT_KEYS) {
      const qId = Q_MAP[sk];
      const userAnswer = picked[qId];
      if (userAnswer === undefined) continue;

      const prefs = family[sk];
      if (!prefs) continue;

      if (userAnswer === prefs[0]) score += 5;
      else if (prefs[1] !== undefined && userAnswer === prefs[1]) score += 3;
      else if (prefs.length > 2 && prefs.slice(2).includes(userAnswer)) score += 1;
    }

    // Layer 2: Anti-pattern penalties (family level)
    const antiMap = { antiT: "tasks", antiO: "output", antiR: "remote", antiD: "decisions", antiM: "meeting" };
    for (const [antiKey, qId] of Object.entries(antiMap)) {
      const antiList = family[antiKey];
      if (antiList && antiList.includes(picked[qId])) score -= 3;
    }

    // Layer 3: Diff scoring — this is the key disambiguator
    // Match = big boost, Mismatch = penalty (pushes wrong siblings down)
    if (jobInfo.diff) {
      let diffHits = 0;
      let diffTotal = 0;

      for (const [sk2, diffPrefs] of Object.entries(jobInfo.diff)) {
        const qId2 = Q_MAP[sk2];
        const userAnswer2 = picked[qId2];
        if (userAnswer2 === undefined) continue;

        diffTotal++;
        if (userAnswer2 === diffPrefs[0]) {
          score += 7;   // Strong match: this IS the differentiator
          diffHits++;
        } else if (diffPrefs[1] !== undefined && userAnswer2 === diffPrefs[1]) {
          score += 4;   // Partial match
          diffHits++;
        } else {
          score -= 3;   // Mismatch penalty: wrong sibling, push it down
        }
      }

      // Specificity bonus: reward jobs where most diffs matched
      if (diffTotal >= 2 && diffHits >= diffTotal * 0.7) {
        score += diffHits * 2;  // Extra bonus for high match rate
      }
    }

    if (score > 0) scores[jobKey] = score;
  }

  // Sort with deterministic tiebreaker (job key alphabetical)
  const sorted = Object.entries(scores).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);  // Alphabetical tiebreak so order is stable
  });

  if (sorted.length === 0) return { jobs: ["admin", "coordinator", "ops"], confidence: 0, allScores: [] };

  const top = sorted[0][1];
  const second = sorted[1]?.[1] || 0;
  const gap = top - second;
  const confidence = Math.min(Math.round((gap / Math.max(top, 1)) * 70 + Math.min(top / 1.5, 30)), 99);

  return {
    jobs: sorted.slice(0, 3).map(([k]) => k),
    confidence,
    allScores: sorted.slice(0, 8),
  };
}


function calcScore(answers) {
  if (!answers.length) return 0;
  const t = answers.reduce((s, a) => {
    const q = QUESTIONS.find(q => q.id === a.questionId);
    return s + q.options[a.optionIndex].score;
  }, 0);
  return Math.round(t / answers.length);
}

function getVerdict(score) {
  if (score >= 85) return { title: "COOKED", subtitle: "Start learning plumbing", color: "#ff0040", glow: "#ff004066", icon: "🪦", desc: "An AI agent on a $20/mo subscription could do 90% of your job by next Tuesday. Your LinkedIn should already say \"Open to Work.\"", timeline: "6-12 months", resourceKey: "critical", tier: "critical" };
  if (score >= 70) return { title: "ON BORROWED TIME", subtitle: "The countdown has started", color: "#ff4400", glow: "#ff440066", icon: "⏳", desc: "You're one prompt chain away from obsolescence. AI will make one person do your whole team's work. Guess who survives.", timeline: "1-2 years", resourceKey: "urgent", tier: "urgent" };
  if (score >= 55) return { title: "NERVOUS SWEATING", subtitle: "The writing is on the wall (AI wrote it)", color: "#ff8800", glow: "#ff880066", icon: "😰", desc: "Your job has a big attack surface. The core survives, but everything around it is getting automated. Evolve or else.", timeline: "2-3 years", resourceKey: "moderate", tier: "moderate" };
  if (score >= 40) return { title: "CAUTIOUSLY SAFE", subtitle: "For now", color: "#ddaa00", glow: "#ddaa0066", icon: "🤏", desc: "AI will be your productive intern before it becomes your replacement. Position yourself as the human-in-the-loop.", timeline: "3-5 years", resourceKey: "moderate", tier: "moderate" };
  if (score >= 25) return { title: "SURPRISINGLY DURABLE", subtitle: "Meat-based advantages detected", color: "#44cc44", glow: "#44cc4466", icon: "💪", desc: "Relationships, physical presence, creative judgment — these are your moats. Maintain them.", timeline: "5+ years", resourceKey: "safe", tier: "safe" };
  return { title: "IRREPLACEABLE", subtitle: "The machines need you", color: "#00ddaa", glow: "#00ddaa66", icon: "🏆", desc: "Your job needs a human body, deep trust, or navigating pure chaos. You're the last line. Respect.", timeline: "Not in this decade", resourceKey: "safe", tier: "safe" };
}

function encodeResults(answers, score) {
  const compact = answers.map(a => `${a.questionId}:${a.optionIndex}`).join(",");
  return btoa(JSON.stringify({ a: compact, s: score }));
}

function decodeResults(hash) {
  try {
    const data = JSON.parse(atob(hash));
    const answers = data.a.split(",").map(p => {
      const [questionId, idx] = p.split(":");
      return { questionId, optionIndex: parseInt(idx) };
    });
    return { answers, score: data.s };
  } catch { return null; }
}

/* ═══════════════════════════════════════════
   STORAGE / ANALYTICS
   ═══════════════════════════════════════════ */

async function saveResult(score, jobKey, answers) {
  try {
    const existing = await loadAllResults();
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      score, job: jobKey,
      tags: answers.map(a => {
        const q = QUESTIONS.find(q => q.id === a.questionId);
        return q.options[a.optionIndex].tag;
      }),
      ts: Date.now(),
    };
    existing.push(entry);
    // Keep last 500 results
    const trimmed = existing.slice(-500);
    await fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(trimmed) });
    return entry;
  } catch (e) { console.error("Save failed:", e); }
}

async function loadAllResults() {
  try {
    const r = await fetch("/api/stats");
    return r.ok ? await r.json() : [];
  } catch { return []; }
}

/* ═══════════════════════════════════════════
   SHARE IMAGE GENERATION (Canvas)
   ═══════════════════════════════════════════ */

function generateShareImage(score, verdict, jobTitle, jobIcon) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, 1200, 630);

  // Scanlines
  ctx.fillStyle = "rgba(255,255,255,0.015)";
  for (let y = 0; y < 630; y += 4) ctx.fillRect(0, y, 1200, 2);

  // Accent line left
  ctx.fillStyle = verdict.color;
  ctx.fillRect(0, 0, 4, 630);

  // Score ring
  const cx = 180, cy = 315, r = 110;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "#151515"; ctx.lineWidth = 12; ctx.stroke();

  const endAngle = -Math.PI / 2 + (score / 100) * Math.PI * 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, endAngle);
  ctx.strokeStyle = verdict.color; ctx.lineWidth = 12;
  ctx.shadowColor = verdict.color; ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Score number
  ctx.font = "bold 80px monospace"; ctx.fillStyle = verdict.color;
  ctx.textAlign = "center"; ctx.fillText(score.toString(), cx, cy + 16);
  ctx.font = "11px monospace"; ctx.fillStyle = "#555";
  ctx.fillText("REPLACEABILITY INDEX", cx, cy + 45);

  // Right side content
  const rx = 380;
  ctx.textAlign = "left";

  // Smork branding
  ctx.font = "bold 12px monospace"; ctx.fillStyle = "#ff0040";
  ctx.fillText("SMORK.CO", rx, 120);

  // Verdict title (no emoji - they render as boxes on canvas)
  ctx.font = "bold 52px sans-serif"; ctx.fillStyle = verdict.color;
  ctx.shadowColor = verdict.color; ctx.shadowBlur = 15;
  ctx.fillText(verdict.title, rx, 190);
  ctx.shadowBlur = 0;

  ctx.font = "16px monospace"; ctx.fillStyle = "#666";
  ctx.fillText(verdict.subtitle, rx, 225);

  // Divider
  ctx.fillStyle = "#222";
  ctx.fillRect(rx, 250, 400, 1);

  // Job guess
  ctx.font = "12px monospace"; ctx.fillStyle = "#ff004099";
  ctx.fillText("JOB DETECTED", rx, 290);
  ctx.font = "bold 30px sans-serif"; ctx.fillStyle = "#ffffff";
  ctx.fillText(jobTitle, rx, 330);

  // Timeline
  ctx.font = "12px monospace"; ctx.fillStyle = "#ff004099";
  ctx.fillText("ESTIMATED TIME TO REPLACEMENT", rx, 390);
  ctx.font = "bold 30px sans-serif"; ctx.fillStyle = verdict.color;
  ctx.fillText(verdict.timeline, rx, 430);

  // CTA
  ctx.fillStyle = "#222";
  ctx.fillRect(rx, 480, 400, 1);
  ctx.font = "bold 18px monospace"; ctx.fillStyle = "#ff0040";
  ctx.fillText("How replaceable are you?", rx, 520);
  ctx.font = "14px monospace"; ctx.fillStyle = "#444";
  ctx.fillText("Take the quiz at smork.co", rx, 548);

  // Border
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 1198, 628);

  return canvas.toDataURL("image/png");
}

/* ═══════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════ */

function Scanline() {
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />;
}

function Noise() {
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 998, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />;
}

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, background: i <= current ? "#ff0040" : "#1a1a1a", transition: "background 0.4s ease", boxShadow: i <= current ? "0 0 8px #ff004044" : "none" }} />
      ))}
    </div>
  );
}

function ScoreRing({ score, verdict, size = 200 }) {
  const r = size * 0.425;
  const circumference = 2 * Math.PI * r;
  const [animScore, setAnimScore] = useState(0);
  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
      let c = 0;
      const iv = setInterval(() => { c++; if (c >= score) { setAnimScore(score); clearInterval(iv); } else setAnimScore(c); }, 18);
      return () => clearInterval(iv);
    }, 200);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto 24px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#111" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={verdict.color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.22, 1, 0.36, 1)", filter: `drop-shadow(0 0 12px ${verdict.glow})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: size * 0.26, fontWeight: 700, color: verdict.color, lineHeight: 1 }}>{animScore}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>REPLACEABILITY</div>
      </div>
    </div>
  );
}

function JobGuess({ topJobs, confidence, allScores }) {
  const primary = JOB_PROFILES[topJobs[0]] || JOB_PROFILES["admin"];
  const runners = topJobs.slice(1).map(j => JOB_PROFILES[j]).filter(Boolean);
  const confLabel = confidence >= 80 ? "LOCKED IN" : confidence >= 60 ? "STRONG READ" : confidence >= 40 ? "EDUCATED GUESS" : confidence >= 20 ? "VIBES-BASED" : "COIN FLIP";
  const confColor = confidence >= 70 ? "#00ddaa" : confidence >= 45 ? "#ddaa00" : "#ff8800";

  // Top scored jobs for mini chart
  const topScored = (allScores || []).slice(0, 5).map(([key, score]) => ({
    key, score, profile: JOB_PROFILES[key],
  })).filter(s => s.profile);
  const maxScore = topScored[0]?.score || 1;

  return (
    <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 24, marginBottom: 24, animation: "fadeSlideIn 0.6s ease 0.3s both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.2em", textTransform: "uppercase" }}>▸ SMORK THINKS YOUR JOB IS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#444", letterSpacing: "0.1em" }}>{confLabel}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: confColor }}>{confidence}%</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 40 }}>{primary.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{primary.title}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" }}>{primary.flavorText}</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 4, background: "#111", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${confidence}%`,
            background: `linear-gradient(90deg, ${confColor}88, ${confColor})`,
            transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: `0 0 8px ${confColor}44`,
          }} />
        </div>
      </div>

      {/* Mini ranking of top job candidates */}
      {topScored.length > 1 && (
        <div style={{ marginBottom: 12, paddingTop: 12, borderTop: "1px solid #151515" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#333", letterSpacing: "0.15em", marginBottom: 10, textTransform: "uppercase" }}>SIGNAL STRENGTH</div>
          {topScored.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: i === 0 ? "#fff" : "#555", width: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.profile.icon} {s.profile.title.split("/")[0].trim()}
              </div>
              <div style={{ flex: 1, height: 3, background: "#111", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(s.score / maxScore) * 100}%`,
                  background: i === 0 ? "#ff0040" : i === 1 ? "#ff440066" : "#ff440033",
                  transition: "width 1s ease",
                }} />
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: i === 0 ? "#ff0040" : "#333", width: 24, textAlign: "right" }}>{s.score}</div>
            </div>
          ))}
        </div>
      )}

      {runners.length > 0 && (
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#444", paddingTop: 12, borderTop: "1px solid #181818" }}>
          Runner-up: {runners.map((r, i) => <span key={i} style={{ color: "#666" }}>{r.icon} {r.title}{i < runners.length - 1 ? "  ·  " : ""}</span>)}
        </div>
      )}
    </div>
  );
}

function ResourceSection({ resourceKey }) {
  const section = RESOURCES[resourceKey];
  if (!section) return null;
  return (
    <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 24, marginTop: 24, animation: "fadeSlideIn 0.6s ease 0.8s both" }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.2em", marginBottom: 4, textTransform: "uppercase" }}>▸ {section.title}</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555", marginBottom: 20 }}>{section.subtitle}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {section.resources.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "12px 16px", background: "#080808", border: "1px solid #181818", textDecoration: "none", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff004044"; e.currentTarget.style.background = "#0d0d0d"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#181818"; e.currentTarget.style.background = "#080808"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#e0e0e0" }}>{r.name}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#333" }}>↗</div>
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555", marginTop: 4, lineHeight: 1.5 }}>{r.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function renderInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>');
}

function AIVerdict({ answers, score, topJobs }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const attempted = useRef(false);
  useEffect(() => {
    if (!attempted.current) {
      attempted.current = true;
      try {
        const saved = JSON.parse(localStorage.getItem("smork-results") || "{}");
        if (saved.roast) { setAnalysis(saved.roast); return; }
      } catch {}
      go();
    }
  }, []);
  async function go() {
    setLoading(true);
    try {
      const primary = JOB_PROFILES[topJobs[0]] || JOB_PROFILES["admin"];
      const profile = answers.map(a => { const q = QUESTIONS.find(q => q.id === a.questionId); const o = q.options[a.optionIndex]; return `"${q.question}" → "${o.label}" (${o.tag})`; }).join("\n");
      const r = await fetch("/api/roast", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, job: primary.title, profile }),
      });
      const d = await r.json();
      const text = d.text || "Smork.exe has stopped working.";
      setAnalysis(text);
      try {
        const saved = JSON.parse(localStorage.getItem("smork-results") || "{}");
        saved.roast = text;
        localStorage.setItem("smork-results", JSON.stringify(saved));
      } catch {}
    } catch { setAnalysis("Smork's brain glitched. The irony is not lost on us."); }
    setLoading(false);
  }
  if (loading) return (
    <div style={{ padding: 24, border: "1px dashed #222", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#444", textAlign: "center" }}>
      <div style={{ marginBottom: 8, fontSize: 20 }}>🧠</div>
      <div style={{ animation: "pulse 1.5s ease infinite" }}>SMORK IS WRITING YOUR CAREER OBITUARY...</div>
    </div>
  );
  if (!analysis) return null;
  return (
    <div style={{ padding: 24, border: "1px solid #222", background: "#0a0a0a", animation: "fadeSlideIn 0.6s ease 0.5s both" }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>▸ SMORK'S VERDICT</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, color: "#ccc", lineHeight: 1.8, whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(analysis) }} />
    </div>
  );
}

function TagsCollected({ answers }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 32 }}>
      {answers.map((a, i) => {
        const q = QUESTIONS.find(q => q.id === a.questionId);
        return <span key={i} style={{ padding: "4px 10px", background: "#ff004012", border: "1px solid #ff004025", fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff6680", animation: `fadeSlideIn 0.3s ease ${i * 0.08}s both` }}>{q.options[a.optionIndex].tag}</span>;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHALLENGE MODE (Side-by-side)
   ═══════════════════════════════════════════ */

function ChallengeView({ myAnswers, myScore, challengeData, onBack }) {
  const myVerdict = getVerdict(myScore);
  const theirVerdict = getVerdict(challengeData.score);
  const myJobs = guessJob(myAnswers).jobs;
  const theirJobs = guessJob(challengeData.answers).jobs;
  const myJob = JOB_PROFILES[myJobs[0]] || JOB_PROFILES["admin"];
  const theirJob = JOB_PROFILES[theirJobs[0]] || JOB_PROFILES["admin"];
  const diff = myScore - challengeData.score;

  return (
    <div style={{ animation: "fadeSlideIn 0.6s ease" }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.3em", textAlign: "center", marginBottom: 32, textTransform: "uppercase" }}>⚔️ CHALLENGE RESULTS</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* YOU */}
        <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 20, textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#888", letterSpacing: "0.2em", marginBottom: 16 }}>YOU</div>
          <ScoreRing score={myScore} verdict={myVerdict} size={140} />
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: myVerdict.color }}>{myVerdict.icon} {myVerdict.title}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555", marginTop: 8 }}>{myJob.icon} {myJob.title}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#444", marginTop: 4 }}>{myVerdict.timeline}</div>
        </div>
        {/* THEM */}
        <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 20, textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#888", letterSpacing: "0.2em", marginBottom: 16 }}>YOUR COWORKER</div>
          <ScoreRing score={challengeData.score} verdict={theirVerdict} size={140} />
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: theirVerdict.color }}>{theirVerdict.icon} {theirVerdict.title}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555", marginTop: 8 }}>{theirJob.icon} {theirJob.title}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#444", marginTop: 4 }}>{theirVerdict.timeline}</div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px", border: "1px solid #222", background: "#0a0a0a", marginBottom: 24 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: diff > 0 ? "#ff0040" : diff < 0 ? "#00ddaa" : "#888" }}>
          {diff > 0 ? `🫠 You're ${diff} points MORE replaceable` : diff < 0 ? `😎 You're ${Math.abs(diff)} points LESS replaceable` : "🤝 Equally cooked. Solidarity."}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#444", marginTop: 8 }}>
          {diff > 10 ? "Your coworker will be handing you tasks soon. Oh wait, the AI will." : diff < -10 ? "You'll be training their AI replacement. Congrats?" : "You'll both find out together. How romantic."}
        </div>
      </div>

      <button onClick={onBack} style={{ display: "block", margin: "0 auto", padding: "10px 24px", background: "none", border: "1px solid #333", color: "#888", fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer" }}>
        ← BACK TO RESULTS
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STATS / WEEKLY REPORT PAGE
   ═══════════════════════════════════════════ */

function StatsPage({ onBack }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAllResults().then(r => { setResults(r); setLoading(false); }); }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 40, fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#444", animation: "pulse 1.5s ease infinite" }}>LOADING AGGREGATE DATA...</div>;

  const total = results.length;
  const avgScore = total > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / total) : 0;

  // Job distribution
  const jobCounts = {};
  results.forEach(r => { jobCounts[r.job] = (jobCounts[r.job] || 0) + 1; });
  const topJobs = Object.entries(jobCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const jobChartData = topJobs.map(([key, count]) => ({ name: (JOB_PROFILES[key]?.icon || "") + " " + (JOB_PROFILES[key]?.title || key).split("/")[0].trim(), count, pct: Math.round(count / total * 100) }));

  // Score distribution
  const scoreBuckets = { "0-19": 0, "20-39": 0, "40-59": 0, "60-79": 0, "80-100": 0 };
  results.forEach(r => {
    if (r.score < 20) scoreBuckets["0-19"]++;
    else if (r.score < 40) scoreBuckets["20-39"]++;
    else if (r.score < 60) scoreBuckets["40-59"]++;
    else if (r.score < 80) scoreBuckets["60-79"]++;
    else scoreBuckets["80-100"]++;
  });
  const scoreChartData = Object.entries(scoreBuckets).map(([range, count]) => ({ range, count }));

  // Verdict distribution
  const verdicts = { "COOKED": 0, "BORROWED TIME": 0, "NERVOUS": 0, "CAUTIOUS": 0, "DURABLE": 0, "IRREPLACEABLE": 0 };
  results.forEach(r => {
    const v = getVerdict(r.score);
    if (v.tier === "critical") verdicts["COOKED"]++;
    else if (r.score >= 70) verdicts["BORROWED TIME"]++;
    else if (r.score >= 55) verdicts["NERVOUS"]++;
    else if (r.score >= 40) verdicts["CAUTIOUS"]++;
    else if (r.score >= 25) verdicts["DURABLE"]++;
    else verdicts["IRREPLACEABLE"]++;
  });
  const verdictData = Object.entries(verdicts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const VERDICT_COLORS = ["#ff0040", "#ff4400", "#ff8800", "#ddaa00", "#44cc44", "#00ddaa"];

  // Most common tags
  const tagCounts = {};
  results.forEach(r => { if (r.tags) r.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }); });
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  // Recent activity (last 7 days)
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentCount = results.filter(r => r.ts > weekAgo).length;
  const cookedThisWeek = results.filter(r => r.ts > weekAgo && r.score >= 85).length;

  // Daily completions (last 7 days)
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now - i * 86400000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const count = results.filter(r => r.ts >= dayStart.getTime() && r.ts < dayEnd.getTime()).length;
    const dayLabel = dayStart.toLocaleDateString("en", { weekday: "short" });
    dailyData.push({ day: dayLabel, quizzes: count });
  }

  const mostReplaceable = total > 0 ? (() => {
    const j = Object.entries(jobCounts).map(([key, count]) => {
      const scores = results.filter(r => r.job === key).map(r => r.score);
      return { key, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), count };
    }).filter(j => j.count >= 2).sort((a, b) => b.avg - a.avg);
    return j[0];
  })() : null;

  return (
    <div style={{ animation: "fadeSlideIn 0.6s ease" }}>
      <button onClick={onBack} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555", background: "none", border: "none", cursor: "pointer", marginBottom: 24, padding: 0 }}>← BACK</button>

      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>SMORK.CO</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 }}>THE REPLACEABILITY REPORT</h2>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#444", marginBottom: 40 }}>Aggregate data from {total} brave souls</div>

      {total === 0 ? (
        <div style={{ textAlign: "center", padding: 60, border: "1px dashed #222" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: "#444" }}>No data yet. Be the first to face the truth.</div>
        </div>
      ) : (
        <>
          {/* Hero stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
            {[
              { label: "TOTAL QUIZZES", value: total, color: "#fff" },
              { label: "AVG SCORE", value: avgScore, color: avgScore >= 70 ? "#ff0040" : avgScore >= 50 ? "#ff8800" : "#44cc44" },
              { label: "THIS WEEK", value: recentCount, color: "#888" },
              { label: "COOKED THIS WEEK", value: cookedThisWeek, color: "#ff0040" },
            ].map((s, i) => (
              <div key={i} style={{ border: "1px solid #222", background: "#0a0a0a", padding: 16, textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#444", letterSpacing: "0.15em", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {mostReplaceable && (
            <div style={{ border: "1px solid #ff004033", background: "#ff004008", padding: 16, marginBottom: 32, textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.15em", marginBottom: 4 }}>MOST REPLACEABLE PROFESSION</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#ff4444" }}>
                {(JOB_PROFILES[mostReplaceable.key]?.icon || "")} {JOB_PROFILES[mostReplaceable.key]?.title || mostReplaceable.key} — avg {mostReplaceable.avg}/100
              </div>
            </div>
          )}

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 20 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.15em", marginBottom: 16 }}>SCORE DISTRIBUTION</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreChartData}>
                  <XAxis dataKey="range" tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} labelStyle={{ color: "#888" }} itemStyle={{ color: "#ff0040" }} />
                  <Bar dataKey="count" fill="#ff0040" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 20 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.15em", marginBottom: 16 }}>VERDICT BREAKDOWN</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={verdictData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {verdictData.map((_, i) => <Cell key={i} fill={VERDICT_COLORS[i % VERDICT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily activity */}
          <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 20, marginBottom: 32 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.15em", marginBottom: 16 }}>DAILY QUIZ COMPLETIONS (7 DAYS)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="day" tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} />
                <Line type="monotone" dataKey="quizzes" stroke="#ff0040" strokeWidth={2} dot={{ fill: "#ff0040", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top jobs */}
          <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 20, marginBottom: 32 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.15em", marginBottom: 16 }}>TOP PROFESSIONS DETECTED</div>
            <ResponsiveContainer width="100%" height={Math.max(200, jobChartData.length * 32)}>
              <BarChart data={jobChartData} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} formatter={(v) => [`${v} quizzes`, ""]} />
                <Bar dataKey="count" fill="#ff440088" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Popular tags */}
          {topTags.length > 0 && (
            <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 20 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.15em", marginBottom: 16 }}>MOST COMMON SELF-DESCRIPTIONS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {topTags.map(([tag, count], i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#ff004012", border: "1px solid #ff004025", fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff6680", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {tag} <span style={{ background: "#ff0040", color: "#000", padding: "0 5px", fontSize: 9, fontWeight: 700 }}>×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARE ACTIONS
   ═══════════════════════════════════════════ */

function ShareActions({ score, verdict, topJobs, answers }) {
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [shareImgUrl, setShareImgUrl] = useState(null);
  const [imgDownloaded, setImgDownloaded] = useState(false);
  const primary = JOB_PROFILES[topJobs[0]] || JOB_PROFILES["admin"];

  // Generate share image on mount
  useEffect(() => {
    try {
      const url = generateShareImage(score, verdict, primary.title, primary.icon);
      setShareImgUrl(url);
    } catch (e) { console.error("Image gen failed:", e); }
  }, [score, verdict, primary]);

  function copyText() {
    const text = `${verdict.icon} I scored ${score}/100 on the AI Replaceability Index: "${verdict.title}"\n\nSmork guessed my job: ${primary.icon} ${primary.title}\nTimeline to replacement: ${verdict.timeline}\n\nHow cooked are you? → smork.co`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function copyChallenge() {
    const hash = encodeResults(answers, score);
    const url = `https://smork.co?challenge=${hash}`;
    navigator.clipboard.writeText(url).then(() => { setChallengeCopied(true); setTimeout(() => setChallengeCopied(false), 2000); });
  }

  function downloadImage() {
    if (!shareImgUrl) return;
    const a = document.createElement("a");
    a.href = shareImgUrl; a.download = `smork-score-${score}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setImgDownloaded(true);
    setTimeout(() => setImgDownloaded(false), 2000);
  }

  const btnBase = { padding: "12px 20px", background: "none", fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.3s ease", width: "100%" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 32 }}>
      {/* Share image preview */}
      {shareImgUrl && (
        <div style={{ border: "1px solid #222", background: "#0a0a0a", padding: 16, marginBottom: 8, animation: "fadeSlideIn 0.6s ease 1s both" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>▸ YOUR SHARE CARD</div>
          <div style={{ borderRadius: 2, overflow: "hidden", border: "1px solid #1a1a1a" }}>
            <img src={shareImgUrl} alt="Smork share card" style={{ width: "100%", display: "block" }} />
          </div>
          <button onClick={downloadImage} style={{
            width: "100%", marginTop: 12, padding: "12px 16px",
            background: imgDownloaded ? "#00ddaa15" : "#ff004015",
            border: `1px solid ${imgDownloaded ? "#00ddaa44" : "#ff004044"}`,
            color: imgDownloaded ? "#00ddaa" : "#ff6680",
            fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer",
            transition: "all 0.3s ease", letterSpacing: "0.05em",
          }}
          onMouseEnter={e => { if (!imgDownloaded) { e.target.style.background = "#ff004025"; e.target.style.borderColor = "#ff004066"; } }}
          onMouseLeave={e => { if (!imgDownloaded) { e.target.style.background = "#ff004015"; e.target.style.borderColor = "#ff004044"; } }}>
            {imgDownloaded ? "✓ SAVED" : "⬇ DOWNLOAD IMAGE"}
          </button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#333", marginTop: 8, textAlign: "center" }}>
            Or right-click / long-press the image to save directly
          </div>
        </div>
      )}

      <button onClick={copyText} style={{ ...btnBase, border: `1px solid ${copied ? "#00ddaa" : "#333"}`, color: copied ? "#00ddaa" : "#888" }}
        onMouseEnter={e => { if (!copied) { e.target.style.borderColor = "#ff0040"; e.target.style.color = "#ff0040"; } }}
        onMouseLeave={e => { if (!copied) { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; } }}>
        {copied ? "✓ COPIED" : "📋 COPY RESULTS AS TEXT"}
      </button>

      <button onClick={copyChallenge} style={{ ...btnBase, border: `1px solid ${challengeCopied ? "#00ddaa" : "#333"}`, color: challengeCopied ? "#00ddaa" : "#888" }}
        onMouseEnter={e => { if (!challengeCopied) { e.target.style.borderColor = "#ff4400"; e.target.style.color = "#ff4400"; } }}
        onMouseLeave={e => { if (!challengeCopied) { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; } }}>
        {challengeCopied ? "✓ CHALLENGE LINK COPIED" : "⚔️ CHALLENGE A COWORKER"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */

export default function App() {
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showQuestion, setShowQuestion] = useState(true);
  const [challengeData, setChallengeData] = useState(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [saved, setSaved] = useState(false);

  // Restore saved results and check challenge param on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("smork-results");
      if (saved) {
        const { answers: savedAnswers } = JSON.parse(saved);
        if (Array.isArray(savedAnswers) && savedAnswers.length > 0) {
          setAnswers(savedAnswers);
          setSaved(true);
          setPhase("results");
        }
      }
    } catch {}
    try {
      const params = new URLSearchParams(window.location?.search || "");
      const ch = params.get("challenge");
      if (ch) { const d = decodeResults(ch); if (d) setChallengeData(d); }
    } catch {}
  }, []);

  const score = calcScore(answers);
  const verdict = getVerdict(score);
  const jobGuess = guessJob(answers);
  const topJobs = jobGuess.jobs;
  const jobConfidence = jobGuess.confidence;
  const jobAllScores = jobGuess.allScores;

  // Save result when entering results phase
  useEffect(() => {
    if (phase === "results" && !saved && answers.length > 0) {
      setSaved(true);
      saveResult(score, topJobs[0], answers);
      try { localStorage.setItem("smork-results", JSON.stringify({ answers })); } catch {}
    }
  }, [phase]);

  function startQuiz() { try { localStorage.removeItem("smork-results"); } catch {} setPhase("quiz"); setCurrentQ(0); setAnswers([]); setShowQuestion(true); setSaved(false); setShowChallenge(false); }

  function selectOption(i) {
    setAnswers([...answers, { questionId: QUESTIONS[currentQ].id, optionIndex: i }]);
    setShowQuestion(false);
    setTimeout(() => {
      if (currentQ + 1 < QUESTIONS.length) { setCurrentQ(currentQ + 1); setHoveredOption(null); setShowQuestion(true); }
      else { setPhase("calculating"); setTimeout(() => setPhase("results"), 2500); }
    }, 300);
  }

  if (showStats) return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e0e0e0", padding: "40px 20px" }}>
      <Scanline /><Noise />
      <style>{STYLES}</style>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <StatsPage onBack={() => setShowStats(false)} />
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#050505", color: "#e0e0e0",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: phase === "intro" ? "center" : "flex-start",
      padding: "40px 20px",
    }}>
      <Scanline /><Noise />
      <style>{STYLES}</style>

      {/* ═══ INTRO ═══ */}
      {phase === "intro" && (
        <div style={{ width: "100%", textAlign: "center", animation: "fadeSlideIn 0.6s ease" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff0040", letterSpacing: "0.3em", marginBottom: 24, textTransform: "uppercase", animation: "flicker 4s linear infinite" }}>SMORK.CO PRESENTS</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, color: "#fff", textAlign: "center" }}>
            HOW<br /><span style={{ background: "linear-gradient(90deg, #ff0040, #ff4400)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block" }}>REPLACEABLE</span>ARE YOU?
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#555", lineHeight: 1.8, maxWidth: 460, margin: "0 auto 40px" }}>
            10 questions. Zero sugarcoating.<br />We'll guess your job, score your replaceability,<br />and tell you exactly how long you've got left.
          </p>

          {challengeData && (
            <div style={{ border: "1px solid #ff004044", background: "#ff004010", padding: 16, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff0040", letterSpacing: "0.15em", marginBottom: 4 }}>⚔️ CHALLENGE RECEIVED</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#ff6680" }}>
                Someone scored {challengeData.score}/100 — {getVerdict(challengeData.score).title}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 4 }}>Beat their score (or don't). Take the quiz ↓</div>
            </div>
          )}

          <button onClick={startQuiz} style={{ padding: "16px 48px", background: "#ff0040", border: "none", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.target.style.background = "#ff2255"; e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = "0 0 30px #ff004044"; }}
            onMouseLeave={e => { e.target.style.background = "#ff0040"; e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "none"; }}>
            {challengeData ? "ACCEPT CHALLENGE →" : "FIND OUT →"}
          </button>

          <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 24 }}>
            <button onClick={() => setShowStats(true)} style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#333", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}
              onMouseEnter={e => e.target.style.color = "#666"} onMouseLeave={e => e.target.style.color = "#333"}>
              📊 VIEW GLOBAL STATS
            </button>
          </div>

          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#222", marginTop: 24, letterSpacing: "0.1em" }}>RESULTS MAY CAUSE EXISTENTIAL DREAD</div>
        </div>
      )}

      {/* ═══ QUIZ ═══ */}
      {phase === "quiz" && (
        <div style={{ maxWidth: 580, width: "100%", animation: "fadeSlideIn 0.4s ease" }}>
          <ProgressBar current={currentQ} total={QUESTIONS.length} />
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#444", letterSpacing: "0.2em", marginBottom: 16 }}>QUESTION {currentQ + 1} OF {QUESTIONS.length}</div>
          <div style={{ opacity: showQuestion ? 1 : 0, transform: showQuestion ? "translateY(0)" : "translateY(-10px)", transition: "all 0.3s ease" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 28 }}>{QUESTIONS[currentQ].question}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {QUESTIONS[currentQ].options.map((opt, i) => (
                <button key={i} onClick={() => selectOption(i)} onMouseEnter={() => setHoveredOption(i)} onMouseLeave={() => setHoveredOption(null)}
                  style={{
                    padding: "14px 18px", background: hoveredOption === i ? "#111" : "#0a0a0a",
                    border: `1px solid ${hoveredOption === i ? "#ff004066" : "#181818"}`,
                    color: hoveredOption === i ? "#fff" : "#aaa",
                    fontFamily: "'Syne', sans-serif", fontSize: 14, textAlign: "left", cursor: "pointer",
                    transition: "all 0.2s ease", display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                  <span>{opt.label}</span>
                  {hoveredOption === i && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#ff004088", whiteSpace: "nowrap", marginLeft: 12 }}>{opt.tag}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CALCULATING ═══ */}
      {phase === "calculating" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", animation: "fadeSlideIn 0.3s ease" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#ff0040", letterSpacing: "0.2em", animation: "pulse 1s ease infinite", textAlign: "center" }}>
            CROSS-REFERENCING YOUR ANSWERS<br />WITH 14 MILLION AI AGENT CAPABILITIES...
          </div>
          <div style={{ width: 240, height: 2, background: "#111", marginTop: 24, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#ff0040", animation: "loadBar 2.2s ease-in-out forwards" }} />
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#222", marginTop: 16, animation: "pulse 2s ease infinite" }}>THIS IS GOING TO HURT</div>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {phase === "results" && (
        <div style={{ maxWidth: 580, width: "100%", animation: "fadeSlideIn 0.6s ease" }}>
          {showChallenge && challengeData ? (
            <ChallengeView myAnswers={answers} myScore={score} challengeData={challengeData} onBack={() => setShowChallenge(false)} />
          ) : (
            <>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#333", letterSpacing: "0.3em", textAlign: "center", marginBottom: 32 }}>YOUR RESULTS ARE IN</div>
              <ScoreRing score={score} verdict={verdict} />
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: verdict.color, textShadow: `0 0 30px ${verdict.glow}` }}>{verdict.icon} {verdict.title}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#555", marginTop: 6 }}>{verdict.subtitle}</div>
              </div>
              <div style={{ textAlign: "center", margin: "24px 0", padding: "12px 20px", border: "1px solid #222", background: "#0a0a0a" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#444", letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>ESTIMATED TIME TO REPLACEMENT</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: verdict.color }}>{verdict.timeline}</div>
              </div>
              <TagsCollected answers={answers} />
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, color: "#888", lineHeight: 1.8, textAlign: "center", marginBottom: 24, padding: "0 20px" }}>{verdict.desc}</div>
              <JobGuess topJobs={topJobs} confidence={jobConfidence} allScores={jobAllScores} />
              <AIVerdict answers={answers} score={score} topJobs={topJobs} />
              <ResourceSection resourceKey={verdict.resourceKey} />
              <ShareActions score={score} verdict={verdict} topJobs={topJobs} answers={answers} />

              {challengeData && (
                <button onClick={() => setShowChallenge(true)} style={{ display: "block", width: "100%", marginTop: 8, padding: "14px 20px", background: "#ff004015", border: "1px solid #ff004044", color: "#ff6680", fontFamily: "'Space Mono', monospace", fontSize: 12, cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.3s ease" }}
                  onMouseEnter={e => { e.target.style.background = "#ff004025"; }}
                  onMouseLeave={e => { e.target.style.background = "#ff004015"; }}>
                  ⚔️ VIEW CHALLENGE COMPARISON
                </button>
              )}

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
                <button onClick={startQuiz} style={{ padding: "10px 24px", background: "none", border: "1px solid #1a1a1a", color: "#444", fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer" }}
                  onMouseEnter={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#1a1a1a"; e.target.style.color = "#444"; }}>
                  RETAKE QUIZ
                </button>
                <button onClick={() => setShowStats(true)} style={{ padding: "10px 24px", background: "none", border: "1px solid #1a1a1a", color: "#444", fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer" }}
                  onMouseEnter={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#1a1a1a"; e.target.style.color = "#444"; }}>
                  📊 GLOBAL STATS
                </button>
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#222", textAlign: "center", marginTop: 40, letterSpacing: "0.1em" }}>BUILT BY SMORK · AN AI THAT JUDGES YOUR CAREER · SMORK.CO</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; user-select: none; }
  @keyframes blink { 50% { opacity: 0; } }
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes loadBar { 0% { width: 0%; } 100% { width: 100%; } }
  @keyframes flicker { 0%, 100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.3; } 94% { opacity: 1; } 96% { opacity: 0.5; } 97% { opacity: 1; } }
`;
