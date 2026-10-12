// All site copy lives here — edit this file to update the portfolio.
import {
  siReact, siNextdotjs, siGreensock, siJavascript, siTypescript, siTailwindcss, siNodedotjs, siExpress,
  siMongodb, siThreedotjs, siHtml5, siCss, siBootstrap, siChakraui, siAntdesign, siGit, siFigma,
} from 'simple-icons';

export const site = {
  name: 'Hassan',
  fullName: 'Muhammad Hassan Khan',
  role: 'Frontend & Creative Developer',
  location: 'Karachi',
  email: 'hssnkhn57@gmail.com',
  github: 'https://github.com/BDK57',
  linkedin: 'https://www.linkedin.com/in/muhammad-hassan-khan-96217a244/',
  intro:
    "Hi, I'm Hassan. I build fast, animated web apps with React, Next.js and GSAP that turn ideas into experiences people remember.",
  currently: { title: 'Associate UI/UX Developer', company: 'The Symmetry Group' },
  about: {
    heading: 'Crafting fast, animated & intuitive web experiences that stand out',
    body:
      "I'm Muhammad Hassan, a web app developer specialising in React, Next.js and GSAP animation. I turn ideas into interactive, responsive products, pairing clean engineering with motion that feels effortless on every device.",
  },
};

export const stack = [
  'React', 'Next.js', 'GSAP', 'TypeScript', 'Tailwind CSS', 'Node.js',
  'Express', 'MongoDB', 'Chakra UI', 'Ant Design', 'Bootstrap', 'REST APIs',
];

// Skill bubbles. `core` bubbles are drawn larger. Icons: simple-icons (CC0).
export const skills = [
  { name: 'React', icon: siReact.path, core: true },
  { name: 'Next.js', icon: siNextdotjs.path, core: true },
  { name: 'GSAP', icon: siGreensock.path, core: true },
  { name: 'JavaScript', icon: siJavascript.path, core: true },
  { name: 'TypeScript', icon: siTypescript.path, core: true },
  { name: 'Tailwind CSS', icon: siTailwindcss.path },
  { name: 'Node.js', icon: siNodedotjs.path },
  { name: 'Express', icon: siExpress.path },
  { name: 'MongoDB', icon: siMongodb.path },
  { name: 'Three.js', icon: siThreedotjs.path },
  { name: 'HTML5', icon: siHtml5.path },
  { name: 'CSS', icon: siCss.path },
  { name: 'Bootstrap', icon: siBootstrap.path },
  { name: 'Chakra UI', icon: siChakraui.path },
  { name: 'Ant Design', icon: siAntdesign.path },
  { name: 'Git', icon: siGit.path },
  { name: 'Figma', icon: siFigma.path },
];

// Projects + case-study content. `slug` is the URL: /work/<slug>.
// Facts about each client come from their live sites / public sources; review the wording of your own role.
export const projects = [
  {
    slug: 'rox',
    title: 'ROX',
    kind: 'Jazz youth brand website',
    tags: ['Next.js', 'GSAP'],
    url: 'https://www.rox.com.pk/',
    img: '/work/rox.webp',
    client: 'Jazz',
    industry: 'Telecom · Youth lifestyle',
    role: 'Frontend development',
    summary: 'A loud, animated home for Jazz’s youth brand: data packages, city-wide deals and nationwide events in one place.',
    overview: [
      'ROX is Jazz’s youth-focused digital brand, pitched as “more than a network”. Beyond fast data, it bundles transparent “Vibe” packages with lifestyle perks: discounts in the ROX Vault, brand deals on ROX High Street and ROX Life events, from concerts to Qawwali nights.',
      'The website has to sell all of that at a glance and push visitors to the ROX app, so it leans on bold type, motion and swipeable content on every screen size.',
    ],
    highlights: [
      { title: 'Vibe package cards', text: 'Side-by-side plans (Basic, Crazy, Insane, Share Vibe) with price, data, minutes and SMS made scannable at a glance.' },
      { title: 'Vault & High Street sliders', text: 'Swipeable deal carousels for partner brands across food, fashion, fitness and gadgets.' },
      { title: 'ROX Life events', text: 'An events slider for concerts and game nights with dates, venues and past-event states.' },
      { title: 'Guided onboarding', text: 'Tabbed “how to subscribe” steps for Jazz prepaid, postpaid and other SIM users, ending in app-store CTAs.' },
    ],
    shots: { desktop: '/work/shots/rox-desktop.webp', mobile: '/work/shots/rox-mobile.webp' },
  },
  {
    slug: 'onic',
    title: 'ONIC',
    kind: 'Digital telecom brand',
    tags: ['React', 'Animation'],
    url: 'https://onic.pk/',
    img: '/work/onic.webp',
    client: 'Pak Telecom Mobile Ltd',
    industry: 'Telecom · 5G digital SIM',
    role: 'Frontend development',
    summary: 'A fully digital 5G network where you pick a plan, order a SIM or eSIM and switch your number without visiting a shop.',
    overview: [
      'Onic is the digital brand of Pak Telecom Mobile Limited: a 5G network built around an app-first experience with unlimited calls and SMS, data rollover, free eSIM and no hidden charges.',
      'The website’s job is conversion: compare plans quickly, understand the perks and order a SIM in three steps.',
    ],
    highlights: [
      { title: 'Plan explorer', text: 'Tabs for weekly, monthly, annual, group and location-based plans, with discounted pricing on each plan card.' },
      { title: 'Feature grid', text: 'High-speed 5G, eSIM or physical SIM, data rollover, in-app number port-in and preferred number selection.' },
      { title: 'Perks showcase', text: 'Bundled benefits such as streaming, food-delivery and savings partners, presented as a visual strip.' },
      { title: 'Three-step ordering', text: 'Get the app, choose a plan, collect your SIM: a short path from landing to order.' },
    ],
    shots: { desktop: '/work/shots/onic-desktop.webp', mobile: '/work/shots/onic-mobile.webp' },
  },
  {
    slug: 'tango-pay',
    title: 'Tango Pay',
    kind: 'Fintech platform, UK',
    tags: ['Next.js', 'UI Dev'],
    url: 'https://tangopay.co.uk/',
    img: '/work/tangopay.webp',
    client: 'TangoPay',
    industry: 'Fintech · International remittance',
    role: 'UI development',
    summary: 'A UK money-transfer service helping people send money home to 70+ countries quickly, securely and at clear rates.',
    overview: [
      'TangoPay is a UK-based authorised payment institution focused on remittances for people living in the UK. Its app sends money to 70+ countries, with real-time exchange rates through its partnership with Currencycloud.',
      'The marketing site has to build trust fast: a clear promise, transparent pricing cues and a straight path to the iOS and Android apps.',
    ],
    highlights: [
      { title: 'Trust-first hero', text: 'Send money internationally with ease and security, backed by low fees and competitive rates, stated up front.' },
      { title: 'Corridor messaging', text: 'Copy and visuals built around sending to 70+ countries from the UK.' },
      { title: 'App-store funnel', text: 'Google Play and App Store CTAs repeated through the page.' },
      { title: 'Responsive brand system', text: 'A bold orange identity carried consistently across desktop and mobile layouts.' },
    ],
    shots: {},
  },
  {
    slug: 'mcb-bank',
    title: 'MCB Bank',
    kind: 'Banking website',
    tags: ['Frontend', 'Responsive'],
    url: 'https://www.mcb.com.pk/',
    img: '/work/mcb.webp',
    client: 'MCB Bank Limited',
    industry: 'Banking · Pakistan',
    role: 'Frontend development',
    summary: 'One of Pakistan’s leading banks: a large, content-heavy site where accounts, cards, loans and digital banking all need to stay easy to find.',
    overview: [
      'MCB’s website covers its full range: deposit accounts, digital banking (MCB Live, Raast), the Roshan Digital Account for overseas Pakistanis, cards, consumer loans, remittances and wealth management.',
      'The showcase work centres on MCB Direct, a digital account-opening journey (“open your account in just a click, no branch visit required”) that has to feel simple inside a very large site.',
    ],
    highlights: [
      { title: 'MCB Direct onboarding', text: 'A landing experience that walks people into opening an account online.' },
      { title: 'Deep navigation', text: 'A two-tier mega navigation spanning seven product families and dozens of products.' },
      { title: 'Self-service tools', text: 'Quick links to the branch locator, IBAN generator, remittance tracker and portals.' },
      { title: 'Responsive banking UI', text: 'Promotional hero sliders and product grids that hold up from phone to widescreen.' },
    ],
    shots: { desktop: '/work/shots/mcb-desktop.webp' },
  },
  {
    slug: 'cartsite-survey',
    title: 'Cartsite Survey',
    kind: 'Survey platform with auth',
    tags: ['React', 'Forms'],
    url: 'https://cartsite.symmetrydigital-labs.com/',
    img: '/work/cartsite.webp',
    client: 'Symmetry Digital Labs',
    industry: 'Research · Surveys',
    role: 'Frontend development',
    summary: 'A screening-questionnaire platform with authentication, built to collect clean, validated answers through long forms.',
    overview: [
      'Cartsite Survey is a web app for running screening questionnaires: respondents sign in, work through structured questions and submit answers that need to arrive complete and valid.',
      'The challenge is long-form UX: keeping multi-field forms readable, validating input as people go and making authentication feel effortless.',
    ],
    highlights: [
      { title: 'Advanced form authentication', text: 'Sign-in and session handling in front of the questionnaire flow.' },
      { title: 'Screening questionnaire', text: 'Grouped fields, dropdowns and date inputs laid out for fast completion.' },
      { title: 'Inline validation', text: 'Errors shown next to the field as people type, not at the end.' },
      { title: 'Focused dark UI', text: 'A calm, high-contrast interface that keeps attention on the questions.' },
    ],
    shots: {},
  },
  {
    slug: 'password-generator',
    title: 'Password Generator',
    kind: 'Utility web app',
    tags: ['JavaScript'],
    url: 'https://bdkpasswordgenerator.netlify.app/',
    img: '/work/passgen.webp',
    client: 'Personal project',
    industry: 'Utility · Security',
    role: 'Design & development',
    summary: 'A small, sharp tool that generates strong passwords instantly, with control over length, numbers and special characters.',
    overview: [
      'A focused utility: set the length with a slider, toggle numbers and special characters, and get a fresh password every time an option changes, ready to copy in one click.',
      'It’s an exercise in doing one thing well: instant feedback, clear controls and a friendly illustrated card.',
    ],
    highlights: [
      { title: 'Live generation', text: 'The password regenerates as soon as length or character options change.' },
      { title: 'Length slider', text: 'A range input for choosing password length, with immediate feedback.' },
      { title: 'One-click copy', text: 'A copy button that puts the password on the clipboard.' },
      { title: 'Illustrated card UI', text: 'A single centred card on black, with an illustration that sets the tone.' },
    ],
    shots: { desktop: '/work/shots/passgen-desktop.webp', mobile: '/work/shots/passgen-mobile.webp' },
  },
];

export const services = [
  {
    label: 'Landing pages',
    title: 'Start strong',
    blurb: 'A sharp, responsive page that turns visitors into leads.',
    points: ['Pixel-perfect Figma to code', 'Entrance & scroll animations', 'Performance & SEO tuned', 'Fully responsive on every device'],
  },
  {
    label: 'Animated experiences',
    title: 'Stand out',
    blurb: 'Scroll storytelling and motion that makes your brand unforgettable.',
    points: ['GSAP scroll storytelling', 'Micro-interactions & transitions', 'Smooth scroll & custom cursors', 'Buttery 60fps on mobile'],
    featured: true,
  },
  {
    label: 'Web applications',
    title: 'Scale up',
    blurb: 'Production-ready apps built to grow with your product.',
    points: ['React & Next.js apps', 'API & authentication flows', 'Dashboards & complex forms', 'Node, Express & MongoDB'],
  },
];

export const testimonials = [
  { quote: 'Hassan works exceptionally well with advanced animations, bringing dynamic and engaging elements to our projects.', name: 'Atif', role: 'Junior Consultant, Symmetry Group' },
  { quote: 'Hassan excels in JavaScript, consistently delivering high-quality code and functionality.', name: 'Muneeb', role: 'DevOps Engineer, TPS Limited' },
  { quote: 'Hassan is proficient in React JS and Next.js, creating seamless and efficient web applications.', name: 'Bilal', role: 'Senior App Developer, Gateways' },
  { quote: 'Hassan is an amazing professional. Very fast and talented. His best quality is being very creative! I highly recommend his services.', name: 'Kashan Malik', role: 'Senior Artist, Digital Oceans' },
];

export const credentials = [
  { title: 'BS Computer Science', where: 'PAF KIET' },
  { title: 'Web Development', where: 'MITI' },
  { title: 'App Development', where: 'National Certificate' },
  { title: 'JavaScript Developer', where: 'SMIT' },
];
