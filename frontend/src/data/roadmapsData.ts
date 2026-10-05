export interface RoadmapNodeResource {
  id: string;
  title: string;
  type: 'Docs' | 'Course' | 'Video' | 'GitHub' | 'Article';
  url: string;
  duration?: string;
  author?: string;
  isFree: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RoadmapNodeData {
  id: string;
  title: string;
  tagline: string;
  stageNumber: number;
  stageTitle: string;
  difficulty: 'Foundational' | 'Core' | 'Advanced' | 'Senior Masterclass';
  estimatedHours: number;
  status: 'completed' | 'in_progress' | 'to_learn' | 'recommended' | 'optional';
  isKeyMilestone?: boolean;
  isOptional?: boolean;
  connections?: string[]; // IDs of nodes this node leads to
  seniorMentalModel: string;
  coreChecklist: string[];
  resources: RoadmapNodeResource[];
  practicalChallenge: {
    title: string;
    description: string;
    acceptanceCriteria: string[];
    starterCode?: string;
  };
  interviewTrap: {
    question: string;
    seniorAnswer: string;
    pitfallToAvoid: string;
  };
  quiz: QuizQuestion[];
}

export interface RoadmapStageData {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  badge: string;
  nodes: RoadmapNodeData[];
}

export interface TechRoadmap {
  id: string;
  role: string;
  title: string;
  description: string;
  category: 'Role-Based' | 'Skill-Based' | 'Foundations';
  icon: string; // Lucide icon name
  accentColor: string; // e.g. emerald, indigo, cyan, amber
  totalHours: number;
  industryDemand: 'Very High' | 'Critical' | 'High' | 'Steady';
  stages: RoadmapStageData[];
}

export const ALL_ROADMAPS: Record<string, TechRoadmap> = {
  'frontend': {
    id: 'frontend',
    role: 'Frontend Developer',
    title: 'Frontend Engineer Mastery',
    description: 'Master modern client architecture, component design systems, performance optimization, and browser runtimes.',
    category: 'Role-Based',
    icon: 'Layout',
    accentColor: 'indigo',
    totalHours: 140,
    industryDemand: 'Very High',
    stages: [
      {
        id: 'fe-stage-1',
        stageNumber: 1,
        title: 'Internet & Web Fundamentals',
        description: 'How the browser engine works, DNS resolution, HTTP/1.1 to HTTP/3, and the critical rendering path.',
        badge: 'Foundations',
        nodes: [
          {
            id: 'fe-internet',
            title: 'How Browsers & the Internet Work',
            tagline: 'DNS lookup, TCP/UDP, TLS handshake, and packet routing.',
            stageNumber: 1,
            stageTitle: 'Internet & Web Fundamentals',
            difficulty: 'Foundational',
            estimatedHours: 4,
            status: 'completed',
            isKeyMilestone: true,
            connections: ['fe-html', 'fe-http'],
            seniorMentalModel: 'Juniors think websites are loaded instantly from a single server. Seniors understand the physics of latency, CDN edge caches, packet fragmentation, and why round-trip time (RTT) dominates performance over raw bandwidth.',
            coreChecklist: [
              'Understand DNS recursive resolvers and A/AAAA/CNAME record caching',
              'Trace the TCP 3-way handshake and TLS 1.3 key exchange',
              'Analyze how IP routing and packet fragmentation affect latency',
              'Explain CDN edge servers, Anycast routing, and point-of-presence (PoP)'
            ],
            resources: [
              { id: 'fe-r1', title: 'How Browsers Work Behind the Scenes', type: 'Article', url: 'https://web.dev/howbrowserswork/', isFree: true, author: 'web.dev' },
              { id: 'fe-r2', title: 'High Performance Browser Networking', type: 'Docs', url: 'https://hpbn.co/', isFree: true, author: 'Ilya Grigorik' },
              { id: 'fe-r3', title: 'HTTP/3 and QUIC Explained', type: 'Video', url: 'https://youtube.com', isFree: true, duration: '28m' }
            ],
            practicalChallenge: {
              title: 'Network Packet & Waterfall Profiler',
              description: 'Open Chrome DevTools Network tab on 3 different heavy sites. Capture HAR files and identify the critical bottleneck (DNS, SSL, TTFB, or resource downloading).',
              acceptanceCriteria: [
                'Identify DNS lookup latency vs TLS negotiation time',
                'Diagnose head-of-line blocking on assets',
                'Write a 1-page audit recommending preload/preconnect optimizations'
              ]
            },
            interviewTrap: {
              question: 'What happens from the millisecond you type "https://google.com" and press Enter until the first pixel renders?',
              seniorAnswer: 'Structure the response in distinct layers: 1) URL parsing & HSTS check, 2) DNS resolution hierarchy (browser cache -> OS -> resolver -> root/TLD), 3) TCP handshake + TLS 1.3 negotiation, 4) HTTP GET request with Keep-Alive, 5) Server processing & TTFB, 6) Browser parsing HTML, constructing DOM/CSSOM, firing preload scanner, assembling Render Tree, Layout (reflow), and Painting/Compositing.',
              pitfallToAvoid: 'Skipping the TLS handshake or failing to mention how the browser parses HTML while fetching subresources concurrently.'
            },
            quiz: [
              {
                id: 'q1',
                question: 'Which HTTP protocol version replaced TCP with UDP-based QUIC to eliminate head-of-line blocking?',
                options: ['HTTP/1.1', 'HTTP/2', 'HTTP/3', 'WebSockets'],
                correctIndex: 2,
                explanation: 'HTTP/3 uses QUIC over UDP, which completely eliminates TCP head-of-line blocking at the transport layer.'
              },
              {
                id: 'q2',
                question: 'What does a high TTFB (Time to First Byte) usually indicate in network profiling?',
                options: ['Client-side CSS rendering lag', 'Slow server processing, database queries, or excessive network distance to origin', 'JavaScript memory leak in browser', 'Image compression failure'],
                correctIndex: 1,
                explanation: 'TTFB measures the time between the browser sending the request and receiving the first byte of response data from the server.'
              }
            ]
          },
          {
            id: 'fe-html',
            title: 'Semantic HTML5 & Accessibility (a11y)',
            tagline: 'Accessible DOM trees, ARIA live regions, semantic elements, and keyboard navigability.',
            stageNumber: 1,
            stageTitle: 'Internet & Web Fundamentals',
            difficulty: 'Foundational',
            estimatedHours: 6,
            status: 'completed',
            connections: ['fe-css'],
            seniorMentalModel: 'Seniors treat accessibility not as an afterthought checklist, but as the true DOM architecture. An accessible site has proper semantic landmark elements (<main>, <nav>, <section>) and focus traps, making it naturally SEO-friendly and resilient to automated screen readers.',
            coreChecklist: [
              'Use proper semantic landmarks (<header>, <main>, <nav>, <aside>, <footer>)',
              'Implement WCAG 2.2 AA compliant focus states and skip-to-content links',
              'Handle aria-expanded, aria-controls, and aria-live announcements for dynamic components',
              'Audit with axe-core and keyboard navigation (Tab, Shift+Tab, Escape, Space, Enter)'
            ],
            resources: [
              { id: 'fe-r4', title: 'MDN Web Accessibility Guide', type: 'Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', isFree: true },
              { id: 'fe-r5', title: 'WAI-ARIA Authoring Practices Guide (APG)', type: 'Docs', url: 'https://www.w3.org/WAI/ARIA/apg/', isFree: true }
            ],
            practicalChallenge: {
              title: 'Accessible Modal & Combobox from First Principles',
              description: 'Build a modal dialog without third-party libraries that traps focus, handles Escape key, restores focus to the trigger on close, and communicates state to screen readers.',
              acceptanceCriteria: [
                'Focus is constrained inside the modal when open',
                'Pressing Escape closes the modal and returns focus to the initiating button',
                'Proper role="dialog" and aria-modal="true" attributes applied'
              ]
            },
            interviewTrap: {
              question: 'Why is <div onClick={...}> harmful, and when is an ARIA attribute worse than plain HTML?',
              seniorAnswer: '<div> elements are not focusable by default, do not support keyboard activation (Enter/Space), and convey no semantic role to assistive technologies. The first rule of ARIA states: "If you can use a native HTML element or attribute with the semantics and behavior you require, then do so instead of re-purposing an element and adding ARIA." Adding incorrect ARIA attributes actually worsens accessibility by confusing screen reader virtual cursors.',
              pitfallToAvoid: 'Claiming that adding tabindex="0" and role="button" to a div is equivalent to a native <button> (it still lacks default keyboard behavior and form submission mechanics).'
            },
            quiz: [
              {
                id: 'q3',
                question: 'Which ARIA attribute notifies screen readers of real-time background updates without requiring user interaction?',
                options: ['aria-hidden', 'aria-live', 'aria-atomic', 'aria-haspopup'],
                correctIndex: 1,
                explanation: 'aria-live="polite" or "assertive" allows assistive tech to announce dynamic DOM changes.'
              }
            ]
          },
          {
            id: 'fe-css',
            title: 'Modern CSS, Layouts & Cascade Layers',
            tagline: 'Flexbox, CSS Grid, Container Queries, Cascade Layers (@layer), and Subgrid.',
            stageNumber: 1,
            stageTitle: 'Internet & Web Fundamentals',
            difficulty: 'Core',
            estimatedHours: 8,
            status: 'completed',
            connections: ['fe-js-core'],
            seniorMentalModel: 'Seniors avoid arbitrary pixel magic numbers. They design using fluid typography (clamp()), responsive token systems, container queries that respond to component boundaries rather than viewport width, and modern CSS cascade layers to prevent specificity wars.',
            coreChecklist: [
              'Master 2D layout orchestration with CSS Grid & Subgrid',
              'Build responsive micro-components using @container (container queries)',
              'Structure global styles using @layer base, components, utilities',
              'Use modern CSS color functions (oklch, color-mix) for accessible themes'
            ],
            resources: [
              { id: 'fe-r6', title: 'Complete Guide to CSS Grid', type: 'Article', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', isFree: true },
              { id: 'fe-r7', title: 'Container Queries in Modern Web Apps', type: 'Docs', url: 'https://web.dev/cq-stable/', isFree: true }
            ],
            practicalChallenge: {
              title: 'Container Query Adaptive Card Component',
              description: 'Build a single card component that renders as a horizontal banner when container > 500px, a multi-column card at 350px-500px, and a compact stacked badge under 350px, all without a single viewport media query.',
              acceptanceCriteria: [
                'Uses @container (inline-size > X)',
                'Zero window resize listeners or window media queries',
                'Demonstrates smooth fluid layout transitions'
              ]
            },
            interviewTrap: {
              question: 'Explain how CSS Cascade Layers (@layer) solve CSS specificity wars in large codebases.',
              seniorAnswer: '@layer decouples source order and specificity from inheritance priority. Styles declared in a higher layer always override styles in a lower layer, regardless of the selector specificity inside those layers. For example, a single class in @layer components can override an ID selector in @layer base.',
              pitfallToAvoid: 'Confusing CSS Cascade Layers with CSS Modules or scoped CSS.'
            },
            quiz: [
              {
                id: 'q4',
                question: 'What is the main advantage of CSS Container Queries over standard Media Queries?',
                options: ['They render faster in GPU memory', 'They style elements based on their parent container size rather than global viewport width', 'They remove the need for flexbox', 'They work without any CSS files'],
                correctIndex: 1,
                explanation: 'Container queries evaluate the size of a specific component container rather than the entire browser viewport.'
              }
            ]
          }
        ]
      },
      {
        id: 'fe-stage-2',
        stageNumber: 2,
        title: 'JavaScript Core & Browser Runtime',
        description: 'V8 event loop, microtask vs macrotask queue, memory management, garbage collection, and modern ESNext.',
        badge: 'Core Engine',
        nodes: [
          {
            id: 'fe-js-core',
            title: 'Event Loop & Asynchronous Architecture',
            tagline: 'Call stack, Web APIs, Microtasks (Promises), and Macrotasks (setTimeout, I/O).',
            stageNumber: 2,
            stageTitle: 'JavaScript Core & Browser Runtime',
            difficulty: 'Core',
            estimatedHours: 8,
            status: 'in_progress',
            isKeyMilestone: true,
            connections: ['fe-react-core', 'fe-ts-core'],
            seniorMentalModel: 'A junior writes async/await hoping it works. A senior visualizes the call stack emptying, the microtask queue running to exhaustion before render painting, and how long-running sync scripts trigger Long Tasks that destroy INP (Interaction to Next Paint).',
            coreChecklist: [
              'Predict execution order across Promises, setTimeout, queueMicrotask, and requestAnimationFrame',
              'Profile JavaScript heap allocations and identify memory leaks using Chrome Memory Snapshots',
              'Use AbortController for cancelling in-flight fetch requests and race-condition prevention',
              'Understand WeakMap and WeakSet for garbage collection friendly caching'
            ],
            resources: [
              { id: 'fe-r8', title: 'What the heck is the event loop anyway?', type: 'Video', url: 'https://youtube.com', duration: '26m', isFree: true, author: 'Philip Roberts' },
              { id: 'fe-r9', title: 'JavaScript Visualized: Event Loop', type: 'Article', url: 'https://lydiahallie.com', isFree: true, author: 'Lydia Hallie' }
            ],
            practicalChallenge: {
              title: 'Custom Promise.allSettled and Async Queue with Concurrency Limit',
              description: 'Implement a p-limit function that executes an array of async tasks with a maximum concurrency of N (e.g. max 3 requests at a time).',
              acceptanceCriteria: [
                'Respects the concurrency ceiling strictly',
                'Resolves promises in order of arrival',
                'Properly rejects without leaking memory when an item fails'
              ]
            },
            interviewTrap: {
              question: 'In what exact order do Promise.then, setTimeout(0), queueMicrotask, and requestAnimationFrame execute?',
              seniorAnswer: 'Current synchronous execution completes -> Microtask queue drains completely (includes queueMicrotask and Promise.then callbacks) -> Rendering cycle checks requestAnimationFrame before layout/paint -> Macrotask queue picks the next task (setTimeout(0), I/O events).',
              pitfallToAvoid: 'Saying setTimeout(..., 0) runs immediately on the next line of execution.'
            },
            quiz: [
              {
                id: 'q5',
                question: 'Which of the following will run before a setTimeout(fn, 0) callback is invoked?',
                options: ['All pending Promise.then microtasks', 'The next network response', 'Nothing, setTimeout(0) runs first', 'Web Worker termination'],
                correctIndex: 0,
                explanation: 'Microtasks (Promises) always run to exhaustion before the browser processes the next macrotask in the event loop.'
              }
            ]
          },
          {
            id: 'fe-ts-core',
            title: 'TypeScript & Type-Level Metaprogramming',
            tagline: 'Generics, conditional types, mapped types, template literal types, and inference.',
            stageNumber: 2,
            stageTitle: 'JavaScript Core & Browser Runtime',
            difficulty: 'Core',
            estimatedHours: 10,
            status: 'to_learn',
            connections: ['fe-react-core'],
            seniorMentalModel: 'Seniors do not litter codebases with "any" or excessive type assertions (as unknown as T). They construct self-documenting, type-safe API boundaries where client payloads and server contracts validate each other with zero runtime overhead.',
            coreChecklist: [
              'Construct conditional types (T extends U ? X : Y) and infer keyword',
              'Use template literal types to validate route parameters or events at compile time',
              'Implement utility types from scratch: DeepReadonly, DeepPartial, PickByValue',
              'Integrate runtime schema validation with compile-time inference (Zod / Valibot)'
            ],
            resources: [
              { id: 'fe-r10', title: 'Total TypeScript Core Workshops', type: 'Course', url: 'https://totaltypescript.com', isFree: true, author: 'Matt Pocock' },
              { id: 'fe-r11', title: 'TypeScript Handbook Official', type: 'Docs', url: 'https://www.typescriptlang.org/docs/', isFree: true }
            ],
            practicalChallenge: {
              title: 'Strict Type-Safe Event Bus with Template Literals',
              description: 'Build an EventEmitter class where events are typed like `user:${action}` and payload arguments are strictly inferred based on the event name.',
              acceptanceCriteria: [
                'Invalid event strings cause immediate TypeScript compiler errors',
                'Payload type is automatically inferred on the listener function callback',
                'No usage of `any` permitted'
              ]
            },
            interviewTrap: {
              question: 'What is the fundamental difference between "unknown" and "any" in TypeScript?',
              seniorAnswer: '"any" turns off type checking entirely and allows any operation without validation. "unknown" is the type-safe counterpart; it indicates a value of arbitrary type, but TypeScript will NOT permit any operation on it until narrowed via typeof, instanceof, or custom type guards.',
              pitfallToAvoid: 'Claiming they are identical or using "any" to silence compiler warnings in production code.'
            },
            quiz: [
              {
                id: 'q6',
                question: 'What does the TypeScript "infer" keyword do inside a conditional type?',
                options: ['Imports another module automatically', 'Declares a type variable to be deduced from the type being examined', 'Forces a runtime type check', 'Casts a variable to string'],
                correctIndex: 1,
                explanation: 'The infer keyword allows you to extract and bind a type from inside another complex type within a conditional type branch.'
              }
            ]
          }
        ]
      },
      {
        id: 'fe-stage-3',
        stageNumber: 3,
        title: 'Modern React & Component Architecture',
        description: 'React 19 internals, Compiler, Server Components (RSC), custom hooks, suspense, and rendering patterns.',
        badge: 'Framework Architecture',
        nodes: [
          {
            id: 'fe-react-core',
            title: 'React 19, Server Components & Hooks Mastery',
            tagline: 'Fiber tree reconciliation, useActionState, useOptimistic, Suspense, and RSC streaming.',
            stageNumber: 3,
            stageTitle: 'Modern React & Component Architecture',
            difficulty: 'Advanced',
            estimatedHours: 16,
            status: 'recommended',
            isKeyMilestone: true,
            connections: ['fe-state-perf', 'fe-web-perf'],
            seniorMentalModel: 'Junior React devs reach for useEffect for everything. Seniors know useEffect is an escape hatch for synchronizing with external non-React systems. They use derived state, React 19 Actions, optimistic updates, and understand how the Fiber scheduler splits work into lanes without blocking the main thread.',
            coreChecklist: [
              'Understand the React Fiber reconciler: Render phase (pure) vs Commit phase (mutations)',
              'Leverage React 19 useActionState and useOptimistic for instant UX updates',
              'Stream HTML with Suspense boundaries to minimize Largest Contentful Paint (LCP)',
              'Design resilient custom hooks adhering to the Rules of React and memoization rules'
            ],
            resources: [
              { id: 'fe-r12', title: 'React.dev Official Documentation', type: 'Docs', url: 'https://react.dev', isFree: true },
              { id: 'fe-r13', title: 'React 19 Deep Dive & Compiler Insights', type: 'Article', url: 'https://react.dev/blog/2024/12/05/react-19', isFree: true }
            ],
            practicalChallenge: {
              title: 'Optimistic Interactive Kanban Board with React 19 Actions',
              description: 'Build a drag-and-drop task board that updates state immediately using useOptimistic, rolls back seamlessly if the simulated server network rejects, and streams live updates.',
              acceptanceCriteria: [
                'Zero layout jank during drag operations',
                'Instant optimistic UI update before server response',
                'Graceful toast notification and rollback on simulated API error'
              ]
            },
            interviewTrap: {
              question: 'Why does React 19 recommend against using useEffect for fetching data on component mount?',
              seniorAnswer: 'Fetching in useEffect creates waterfall cascades, causes race conditions when parameters change rapidly, produces layout thrashing on re-renders, and fails to support server-side rendering or streamable caching. Modern React delegates data fetching to Server Components, React Query / TanStack, or suspense-enabled loaders.',
              pitfallToAvoid: 'Advising people to wrap fetch calls in useEffect without cleanup/AbortController.'
            },
            quiz: [
              {
                id: 'q7',
                question: 'What is the primary role of the React 19 Compiler?',
                options: ['Convert JavaScript to C++ for faster execution', 'Automatically memoize values and components, reducing the need for manual useMemo and useCallback', 'Replace HTML with WebGL', 'Host backend API endpoints directly'],
                correctIndex: 1,
                explanation: 'The React Compiler analyzes code at compile-time to automatically memoize components and values, minimizing manual boilerplate.'
              }
            ]
          },
          {
            id: 'fe-state-perf',
            title: 'Global State, React Query & Cache Architecture',
            tagline: 'Server state vs client state, TanStack Query, optimistic mutations, and Zustand.',
            stageNumber: 3,
            stageTitle: 'Modern React & Component Architecture',
            difficulty: 'Advanced',
            estimatedHours: 8,
            status: 'to_learn',
            connections: ['fe-web-perf'],
            seniorMentalModel: 'Seniors strictly separate Server State (remote data that is cached and out-of-sync) from Client State (ephemeral UI like isOpen, activeTab). Putting server data in Redux/Zustand manually is an anti-pattern when tools like React Query handle deduplication, background revalidation, and caching automatically.',
            coreChecklist: [
              'Distinguish server cache from client state to eliminate duplicated sources of truth',
              'Configure TanStack Query staleTime, cacheTime, and query keys for efficient cache invalidation',
              'Implement lightweight client state stores with Zustand and subscribeWithSelector',
              'Handle offline mode and persistent cache hydration via IndexedDB'
            ],
            resources: [
              { id: 'fe-r14', title: 'Practical React Query by TkDodo', type: 'Article', url: 'https://tkdodo.eu/blog/practical-react-query', isFree: true, author: 'Dominik Dorfmeister' },
              { id: 'fe-r15', title: 'Zustand Architectural Patterns', type: 'GitHub', url: 'https://github.com/pmndrs/zustand', isFree: true }
            ],
            practicalChallenge: {
              title: 'Resilient Offline-First Data Table with Query Invalidation',
              description: 'Build an editable table with optimistic inline edits, automatic query cancellation on fast edits, and automatic synchronization when re-establishing internet connection.',
              acceptanceCriteria: [
                'Edits feel instant to the user',
                'Cancels stale outgoing network requests when user keeps typing',
                'Revalidates background queries silently without showing loading spinners'
              ]
            },
            interviewTrap: {
              question: 'What is stale-while-revalidate and how does it prevent unnecessary loading spinners?',
              seniorAnswer: 'Stale-while-revalidate serves existing cached (stale) data to the user immediately, eliminating loading spinners and flash of unstyled content, while concurrently dispatching a background fetch to revalidate and update the cache with fresh data.',
              pitfallToAvoid: 'Conflating staleTime (time data is considered fresh) with gcTime (time inactive data remains in memory).'
            },
            quiz: [
              {
                id: 'q8',
                question: 'If TanStack Query staleTime is set to 5 minutes, what happens when a component unmounts and remounts 2 minutes later?',
                options: ['It shows a loading spinner and refetches from network', 'It immediately returns cached data without initiating a network request', 'It crashes with a stale error', 'It wipes the cache'],
                correctIndex: 1,
                explanation: 'Since the data is within its 5-minute freshness window, it is considered fresh and served instantly without refetching.'
              }
            ]
          }
        ]
      },
      {
        id: 'fe-stage-4',
        stageNumber: 4,
        title: 'Performance, Core Web Vitals & Production Engineering',
        description: 'LCP, INP, CLS optimization, code splitting, bundle analysis, and browser profiling.',
        badge: 'Production Excellence',
        nodes: [
          {
            id: 'fe-web-perf',
            title: 'Core Web Vitals & Runtime Performance',
            tagline: 'LCP (Largest Contentful Paint), INP (Interaction to Next Paint), CLS (Cumulative Layout Shift).',
            stageNumber: 4,
            stageTitle: 'Performance, Core Web Vitals & Production Engineering',
            difficulty: 'Senior Masterclass',
            estimatedHours: 12,
            status: 'to_learn',
            isKeyMilestone: true,
            seniorMentalModel: 'Seniors don\'t guess performance bottlenecks; they measure using field telemetry (RUM) and Chrome Performance profiler. They know that breaking up long tasks below 50ms is what keeps INP green, and optimizing critical path images with fetchpriority="high" directly moves LCP.',
            coreChecklist: [
              'Diagnose and remediate high INP (>200ms) by yielding to main thread with scheduler.yield()',
              'Optimize LCP using fetchpriority="high", responsive srcset, and eliminating render-blocking scripts',
              'Prevent Cumulative Layout Shift (CLS) by reserving aspect-ratio boxes and font-display: optional',
              'Perform bundle visualization (rollup-plugin-visualizer) and dynamic import() code splitting'
            ],
            resources: [
              { id: 'fe-r16', title: 'web.dev Core Web Vitals Deep Dive', type: 'Docs', url: 'https://web.dev/vitals/', isFree: true },
              { id: 'fe-r17', title: 'Optimizing INP with scheduler.yield()', type: 'Article', url: 'https://web.dev/optimize-inp/', isFree: true }
            ],
            practicalChallenge: {
              title: 'Lighthouse 100 & INP Performance Audit of a Complex Page',
              description: 'Profile a sluggish infinite-scroll feed containing images and interactive widgets. Reduce main-thread blocking time from 800ms down to under 50ms using virtualization and task chunking.',
              acceptanceCriteria: [
                'Zero layout shifts (CLS < 0.05)',
                'INP under 100ms on simulated 4x CPU throttling',
                'Bundle size reduction of at least 30% through dynamic imports'
              ]
            },
            interviewTrap: {
              question: 'Why did Google replace FID (First Input Delay) with INP (Interaction to Next Paint) as a Core Web Vital?',
              seniorAnswer: 'FID only measured the delay of the very first user interaction and only captured the input delay (time until event handler started executing). INP measures the latency of ALL user interactions across the entire lifecycle of the page, including event execution time and presentation delay until the browser actually paints the updated frame.',
              pitfallToAvoid: 'Believing FID and INP measure the same thing or that INP only tracks the first click.'
            },
            quiz: [
              {
                id: 'q9',
                question: 'What is the recommended threshold for a "Good" Interaction to Next Paint (INP) score?',
                options: ['<= 200 ms', '<= 500 ms', '<= 1000 ms', '<= 50 ms'],
                correctIndex: 0,
                explanation: 'A good INP score is 200 milliseconds or less at the 75th percentile of page loads.'
              }
            ]
          }
        ]
      }
    ]
  },

  'backend': {
    id: 'backend',
    role: 'Backend Developer',
    title: 'Backend & Distributed Systems',
    description: 'Master server runtimes, relational database schema & indexing, distributed caching, APIs, and microservices.',
    category: 'Role-Based',
    icon: 'Database',
    accentColor: 'emerald',
    totalHours: 160,
    industryDemand: 'Very High',
    stages: [
      {
        id: 'be-stage-1',
        stageNumber: 1,
        title: 'OS, Networking & Runtime Foundations',
        description: 'Processes vs threads, POSIX signals, sockets, TCP/IP, and concurrency models.',
        badge: 'Core Engine',
        nodes: [
          {
            id: 'be-os-net',
            title: 'Operating Systems, Concurrency & Sockets',
            tagline: 'Processes, threads, epoll/kqueue, non-blocking I/O, and socket lifecycle.',
            stageNumber: 1,
            stageTitle: 'OS, Networking & Runtime Foundations',
            difficulty: 'Foundational',
            estimatedHours: 8,
            status: 'completed',
            isKeyMilestone: true,
            connections: ['be-dbs', 'be-apis'],
            seniorMentalModel: 'Seniors know that high-throughput servers don\'t spin up a new OS thread per connection (the C10K problem). They understand event-driven I/O multiplexing (epoll in Linux), how thread pools handle CPU-bound vs I/O-bound tasks, and how memory paging affects server performance.',
            coreChecklist: [
              'Understand Linux process memory layout (Stack, Heap, BSS, Data, Text)',
              'Explain how epoll/kqueue enables single-threaded non-blocking concurrency',
              'Handle POSIX signals (SIGTERM, SIGINT) for graceful server shutdown',
              'Debug file descriptor leaks and open socket exhaustion'
            ],
            resources: [
              { id: 'be-r1', title: 'Operating Systems: Three Easy Pieces (OSTEP)', type: 'Course', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', isFree: true, author: 'Remzi Arpaci-Dusseau' },
              { id: 'be-r2', title: 'The C10K problem & Async I/O', type: 'Article', url: 'http://www.kegel.com/c10k.html', isFree: true }
            ],
            practicalChallenge: {
              title: 'Multi-Client TCP Chat Server with Asyncio / Epoll',
              description: 'Write a lightweight TCP socket server in Python or Go that handles 1,000 concurrent client connections without crashing or spawning 1,000 threads.',
              acceptanceCriteria: [
                'Uses non-blocking sockets and event loop multiplexing',
                'Broadcasts incoming messages to all connected peers in sub-10ms',
                'Handles sudden client disconnects cleanly without lingering file descriptors'
              ]
            },
            interviewTrap: {
              question: 'Explain what happens during a Graceful Shutdown of a backend web service when receiving SIGTERM from Kubernetes.',
              seniorAnswer: '1) Stop accepting new incoming requests on the listening socket, 2) Send connection: close headers to active HTTP connections, 3) Wait for in-flight requests and background queue jobs to complete within a configured timeout (e.g. 30s), 4) Flush telemetry and close database connection pools cleanly, 5) Exit with status code 0.',
              pitfallToAvoid: 'Calling process.exit(0) immediately upon receiving SIGTERM, which abruptly drops user requests and corrupts transactions.'
            },
            quiz: [
              {
                id: 'q10',
                question: 'What is the primary advantage of epoll over the older select/poll system calls in Linux?',
                options: ['epoll uses threads instead of processes', 'epoll scales in O(1) time complexity with active connections rather than scanning all file descriptors in O(N)', 'epoll runs inside user space without kernel switches', 'epoll encrypts socket payloads natively'],
                correctIndex: 1,
                explanation: 'epoll only returns file descriptors that are ready for I/O in O(1) time, avoiding scanning thousands of idle sockets.'
              }
            ]
          }
        ]
      },
      {
        id: 'be-stage-2',
        stageNumber: 2,
        title: 'Relational Databases & Indexing Strategies',
        description: 'PostgreSQL internals, B-Trees, transactions, ACID, connection pooling, and query plan analysis.',
        badge: 'Data Architecture',
        nodes: [
          {
            id: 'be-dbs',
            title: 'PostgreSQL Deep Dive, B-Trees & Query Optimization',
            tagline: 'EXPLAIN ANALYZE, B-Tree indexes, Composite indexes, MVCC, and vacuuming.',
            stageNumber: 2,
            stageTitle: 'Relational Databases & Indexing Strategies',
            difficulty: 'Core',
            estimatedHours: 14,
            status: 'in_progress',
            isKeyMilestone: true,
            connections: ['be-cache', 'be-sys-design'],
            seniorMentalModel: 'Seniors design databases knowing that an index is not free—it speeds up reads at the cost of write amplification and memory. They read EXPLAIN ANALYZE plans to spot Sequential Scans, understand Multi-Version Concurrency Control (MVCC) bloat, and configure connection poolers like PgBouncer.',
            coreChecklist: [
              'Interpret EXPLAIN (ANALYZE, BUFFERS) query execution plans',
              'Design left-prefix compliant composite indexes for high-frequency queries',
              'Understand transaction isolation levels (Read Committed vs Serializable) and dirty reads',
              'Configure PgBouncer / connection pooling to prevent DB connection exhaustion'
            ],
            resources: [
              { id: 'be-r3', title: 'Use The Index, Luke! - Guide to Database Performance', type: 'Docs', url: 'https://use-the-index-luke.com/', isFree: true, author: 'Markus Winand' },
              { id: 'be-r4', title: 'PostgreSQL Query Optimization Masterclass', type: 'Article', url: 'https://postgresql.org/docs/', isFree: true }
            ],
            practicalChallenge: {
              title: 'Optimize a 1-Million Row Query from 1200ms to 4ms',
              description: 'Generate a mock database table with 1,000,000 orders. Run a slow multi-column filtered search with sorting. Write the optimal index and rewrite the query using EXPLAIN ANALYZE.',
              acceptanceCriteria: [
                'Eliminate Seq Scan in favor of Index Scan or Index Only Scan',
                'Reduce total execution time by at least 95%',
                'Document before-and-after buffer read counts'
              ]
            },
            interviewTrap: {
              question: 'Why doesn\'t PostgreSQL use a composite index on (created_at, status) when the WHERE clause only filters by status?',
              seniorAnswer: 'B-Tree indexes are sorted by the first key (created_at). If the query doesn\'t filter on the leading column, the database cannot perform a binary search down the tree structure and is forced to either scan the entire index (Index Full Scan) or fall back to a Sequential Table Scan.',
              pitfallToAvoid: 'Claiming that column order in composite indexes does not matter.'
            },
            quiz: [
              {
                id: 'q11',
                question: 'What does MVCC (Multi-Version Concurrency Control) prevent in modern databases like PostgreSQL?',
                options: ['Hard drive failure', 'Readers blocking writers and writers blocking readers', 'SQL Injection attacks', 'Memory fragmentation'],
                correctIndex: 1,
                explanation: 'MVCC allows multiple concurrent transactions to read consistent snapshots of data without locking out writes.'
              }
            ]
          },
          {
            id: 'be-cache',
            title: 'Distributed Caching with Redis & Cache Invalidation',
            tagline: 'Cache-Aside, Write-Through, Cache Stampede, Redis data structures, and Eviction policies.',
            stageNumber: 2,
            stageTitle: 'Relational Databases & Indexing Strategies',
            difficulty: 'Core',
            estimatedHours: 8,
            status: 'to_learn',
            connections: ['be-apis'],
            seniorMentalModel: '"There are only two hard things in Computer Science: cache invalidation and naming things." Seniors design caches with jittered TTLs to prevent thundering herds (cache stampedes), use Redis hashes and sorted sets appropriately, and choose the right eviction strategy (allkeys-lru vs volatile-lru).',
            coreChecklist: [
              'Implement Cache-Aside pattern with exponential backoff on cold misses',
              'Prevent Cache Stampede / Thundering Herd using single-flight mutexes or probabilistic early expiration',
              'Leverage Redis Sorted Sets (ZSET) for real-time leaderboards and rate limiters',
              'Understand Redis cluster partitioning and persistence tradeoffs (RDB vs AOF)'
            ],
            resources: [
              { id: 'be-r5', title: 'Redis University - RU101 Introduction to Redis Data Structures', type: 'Course', url: 'https://university.redis.com', isFree: true },
              { id: 'be-r6', title: 'Preventing Cache Stampede at Scale', type: 'Article', url: 'https://redis.io', isFree: true }
            ],
            practicalChallenge: {
              title: 'Sliding Window Rate Limiter using Redis Sorted Sets',
              description: 'Build an API rate limiter middleware that enforces a strict 100 requests per minute quota per IP address using Redis ZADD and ZREMRANGEBYSCORE.',
              acceptanceCriteria: [
                'Smooth rolling 60-second window (not fixed window bucket)',
                'Atomic execution using Lua scripts to prevent race conditions',
                'Returns standard 429 Too Many Requests with Retry-After header'
              ]
            },
            interviewTrap: {
              question: 'How do you prevent a Cache Stampede when a high-traffic cache key expires?',
              seniorAnswer: 'Three standard solutions: 1) Distributed Locking (only one worker queries the database while others wait), 2) Background Revalidation / Soft TTL with probabilistic early expiration (XFetch algorithm), or 3) Never-expiring cache updated asynchronously via event stream / cron.',
              pitfallToAvoid: 'Suggesting setting TTL to infinity without an invalidation mechanism.'
            },
            quiz: [
              {
                id: 'q12',
                question: 'Which Redis eviction policy removes the least recently used keys out of all keys regardless of whether they have a TTL?',
                options: ['volatile-lru', 'allkeys-lru', 'noeviction', 'volatile-ttl'],
                correctIndex: 1,
                explanation: 'allkeys-lru evicts the least recently used keys among all keys in the database.'
              }
            ]
          }
        ]
      },
      {
        id: 'be-stage-3',
        stageNumber: 3,
        title: 'API Architecture & Authentication Security',
        description: 'RESTful API design, OAuth 2.0 / OpenID Connect, JWT signing, gRPC, and GraphQL.',
        badge: 'API Engineering',
        nodes: [
          {
            id: 'be-apis',
            title: 'Robust REST, gRPC & Idempotent API Design',
            tagline: 'Idempotency keys, HTTP semantics, Protobufs, gRPC streaming, and error contracts.',
            stageNumber: 3,
            stageTitle: 'API Architecture & Authentication Security',
            difficulty: 'Advanced',
            estimatedHours: 12,
            status: 'recommended',
            connections: ['be-sys-design'],
            seniorMentalModel: 'Seniors design APIs with idempotency keys so that network retries don\'t charge a credit card twice. They choose gRPC for ultra-fast, type-safe inter-service microservice communication and REST/JSON for client-facing edge APIs.',
            coreChecklist: [
              'Implement Idempotency-Key headers using database unique constraints or Redis locks',
              'Design standardized RFC 7807 Problem Details error responses',
              'Construct high-throughput inter-service RPCs with Protocol Buffers and gRPC',
              'Implement robust pagination using Cursor-based keysets instead of slow OFFSET/LIMIT'
            ],
            resources: [
              { id: 'be-r7', title: 'Stripe API Architecture & Idempotency Guide', type: 'Article', url: 'https://stripe.com/blog/idempotency', isFree: true },
              { id: 'be-r8', title: 'gRPC Official Documentation & Guides', type: 'Docs', url: 'https://grpc.io/docs/', isFree: true }
            ],
            practicalChallenge: {
              title: 'Production-Grade Payment Processing API with Idempotency',
              description: 'Build a checkout API endpoint that accepts an Idempotency-Key header, stores the initial response in Redis/DB, and returns the exact identical result if retried within 24 hours.',
              acceptanceCriteria: [
                'Duplicate requests with same key never trigger duplicate charges',
                'Concurrent duplicate requests return 409 Conflict or wait on initial execution',
                'Properly handles failure states and allows retrying on transient errors'
              ]
            },
            interviewTrap: {
              question: 'Why is cursor-based pagination vastly superior to offset/limit pagination for large tables?',
              seniorAnswer: 'OFFSET 100000 LIMIT 20 forces the database engine to scan 100,020 rows, discard the first 100,000, and return 20, leading to O(N) performance degradation. Cursor-based pagination uses WHERE id > last_seen_id ORDER BY id ASC LIMIT 20, allowing the B-Tree index to jump directly to the target record in O(log N) time with zero drift when rows are inserted or deleted.',
              pitfallToAvoid: 'Claiming offset/limit is fine for millions of records.'
            },
            quiz: [
              {
                id: 'q13',
                question: 'Which HTTP method is required by spec to be naturally idempotent?',
                options: ['POST', 'PUT', 'CONNECT', 'PATCH'],
                correctIndex: 1,
                explanation: 'PUT, GET, DELETE, and HEAD are defined as idempotent in HTTP/1.1; multiple identical requests must leave the server in the same state.'
              }
            ]
          }
        ]
      },
      {
        id: 'be-stage-4',
        stageNumber: 4,
        title: 'Distributed Systems & Asynchronous Pipelines',
        description: 'Message brokers (Kafka, RabbitMQ), eventual consistency, saga pattern, and fault tolerance.',
        badge: 'Distributed Systems',
        nodes: [
          {
            id: 'be-sys-design',
            title: 'Message Queues, Kafka & Event-Driven Architecture',
            tagline: 'Consumer groups, partitions, at-least-once delivery, dead-letter queues, and Saga patterns.',
            stageNumber: 4,
            stageTitle: 'Distributed Systems & Asynchronous Pipelines',
            difficulty: 'Senior Masterclass',
            estimatedHours: 16,
            status: 'to_learn',
            isKeyMilestone: true,
            seniorMentalModel: 'Seniors design for failure. In distributed systems, networks partition, services crash, and databases time out. Instead of synchronous HTTP chains that cascade failures, they decouple systems using event streams, dead-letter queues (DLQ), and idempotent consumers.',
            coreChecklist: [
              'Understand Kafka partition keys, log compaction, and consumer group rebalancing',
              'Implement Dead Letter Queue (DLQ) pattern for poison pill message handling',
              'Design compensating transactions using the Saga Pattern instead of distributed 2PC locks',
              'Maintain transactional outbox pattern to guarantee database update and event publishing consistency'
            ],
            resources: [
              { id: 'be-r9', title: 'Designing Data-Intensive Applications (DDIA)', type: 'Course', url: 'https://dataintensive.net/', isFree: false, author: 'Martin Kleppmann' },
              { id: 'be-r10', title: 'Transactional Outbox Pattern Explained', type: 'Article', url: 'https://microservices.io/patterns/data/transactional-outbox.html', isFree: true }
            ],
            practicalChallenge: {
              title: 'Transactional Outbox & Event Processor',
              description: 'Implement a transactional outbox service: insert a record into the DB and an outbox table in one ACID transaction, then use a background poller/CDC to publish to Kafka/RabbitMQ with at-least-once delivery.',
              acceptanceCriteria: [
                'Zero lost events even if the message broker is temporarily offline',
                'Deduplication logic on the consumer side',
                'Demonstrates graceful failover'
              ]
            },
            interviewTrap: {
              question: 'Explain the CAP Theorem and why "P" (Partition Tolerance) is non-negotiable in real-world distributed systems.',
              seniorAnswer: 'Network cables can be cut, switches fail, and latency spikes occur, meaning network partitions are inevitable in physical reality. Therefore, you cannot choose CA; you must always design for Partition Tolerance (P), leaving the fundamental trade-off between Consistency (C - reject writes if replicas cannot be reached) and Availability (A - accept writes on all reachable nodes even if temporary data divergence occurs).',
              pitfallToAvoid: 'Claiming that a system can achieve C, A, and P simultaneously in a distributed environment.'
            },
            quiz: [
              {
                id: 'q14',
                question: 'What problem does the Transactional Outbox pattern solve?',
                options: ['CSS animation glitches', 'The dual-write problem of saving to a database and publishing to a message broker atomically', 'SSL certificate expiration', 'Memory leaks in client apps'],
                correctIndex: 1,
                explanation: 'The transactional outbox pattern ensures atomic consistency when updating a database and publishing an event, preventing partial failure.'
              }
            ]
          }
        ]
      }
    ]
  },

  'fullstack': {
    id: 'fullstack',
    role: 'Full Stack Engineer',
    title: 'Full Stack Product Engineer',
    description: 'Bridge the entire software lifecycle from polished responsive client interfaces down to high-performance database schema and cloud deployments.',
    category: 'Role-Based',
    icon: 'Layers',
    accentColor: 'blue',
    totalHours: 180,
    industryDemand: 'Very High',
    stages: [
      {
        id: 'fs-stage-1',
        stageNumber: 1,
        title: 'End-to-End Type Safety & API Contracts',
        description: 'TypeScript across client and server, tRPC, Zod validation, and schema generation.',
        badge: 'Full Stack Glue',
        nodes: [
          {
            id: 'fs-contracts',
            title: 'End-to-End Type-Safe Architecture (tRPC & Zod)',
            tagline: 'Single source of truth for types from database schema to React components.',
            stageNumber: 1,
            stageTitle: 'End-to-End Type Safety & API Contracts',
            difficulty: 'Core',
            estimatedHours: 10,
            status: 'completed',
            isKeyMilestone: true,
            connections: ['fs-data-layer', 'fs-client-perf'],
            seniorMentalModel: 'Seniors eliminate manual API contracts and duplicate interfaces. They use shared type systems (like tRPC or OpenAPI codegen) where renaming a backend database column immediately produces a compile-time error in the frontend UI component.',
            coreChecklist: [
              'Build shared types monorepos (Turborepo / pnpm workspaces)',
              'Use Zod for runtime schema validation on both frontend forms and backend endpoints',
              'Set up tRPC or OpenAPI client generation for zero-boilerplate data fetching',
              'Handle optimistic mutations with rollback on server validation errors'
            ],
            resources: [
              { id: 'fs-r1', title: 'tRPC Official Documentation', type: 'Docs', url: 'https://trpc.io', isFree: true },
              { id: 'fs-r2', title: 'Fullstack TypeScript Architecture', type: 'Article', url: 'https://fullstackts.dev', isFree: true }
            ],
            practicalChallenge: {
              title: 'Monorepo Fullstack Task Management with tRPC',
              description: 'Set up a pnpm monorepo with /apps/web (React) and /apps/server (FastAPI or Node) sharing a /packages/types package with full autocompletion across network boundaries.',
              acceptanceCriteria: [
                'Autocomplete for API procedures in frontend code',
                'Type errors when changing backend request shapes',
                'Zod schema validation on all inputs'
              ]
            },
            interviewTrap: {
              question: 'When should you use tRPC versus standard REST with OpenAPI versus GraphQL?',
              seniorAnswer: 'tRPC is unbeatable for fullstack TypeScript monorepos where client and server are maintained by the same team, providing instant type safety without code generation steps. REST with OpenAPI is best for public APIs or multi-language teams (Python backend, Swift mobile client). GraphQL shines when multiple diverse clients (mobile, web, IoT) require flexible ad-hoc querying from large relational graphs.',
              pitfallToAvoid: 'Claiming tRPC replaces REST for external public third-party APIs.'
            },
            quiz: [
              {
                id: 'q15',
                question: 'What is the main benefit of Zod schema inference via z.infer<typeof Schema>?',
                options: ['It compiles to C++', 'It eliminates writing separate TypeScript interfaces that can drift out of sync with runtime validators', 'It speeds up network latency', 'It replaces SQL databases'],
                correctIndex: 1,
                explanation: 'z.infer generates static TypeScript types directly from runtime validation schemas, ensuring one single source of truth.'
              }
            ]
          }
        ]
      },
      {
        id: 'fs-stage-2',
        stageNumber: 2,
        title: 'Full Stack Performance & Production Deployment',
        description: 'Serverless, edge functions, Docker containers, database migrations, and CI/CD pipelines.',
        badge: 'DevOps & Cloud',
        nodes: [
          {
            id: 'fs-deploy',
            title: 'Docker, Database Migrations & Zero-Downtime Deployment',
            tagline: 'Multi-stage Docker builds, blue-green deployments, and schema migrations without locking.',
            stageNumber: 2,
            stageTitle: 'Full Stack Performance & Production Deployment',
            difficulty: 'Advanced',
            estimatedHours: 14,
            status: 'in_progress',
            isKeyMilestone: true,
            seniorMentalModel: 'Seniors know that anyone can write code that runs on localhost. The difference is being able to ship to production with zero downtime, execute schema migrations without locking production tables, and configure health checks that prevent routing traffic to dead pods.',
            coreChecklist: [
              'Create optimized multi-stage Dockerfiles (<100MB output images)',
              'Execute backwards-compatible multi-phase database migrations (Expand and Contract pattern)',
              'Configure GitHub Actions CI/CD with automated testing and preview deployments',
              'Set up Sentry error monitoring and OpenTelemetry distributed tracing'
            ],
            resources: [
              { id: 'fs-r3', title: 'Docker Official Best Practices Guide', type: 'Docs', url: 'https://docs.docker.com', isFree: true },
              { id: 'fs-r4', title: 'Zero Downtime Database Migrations (Stripe)', type: 'Article', url: 'https://stripe.com/blog', isFree: true }
            ],
            practicalChallenge: {
              title: 'Multi-Stage Production Dockerfile & GitHub Actions Workflow',
              description: 'Write a hardened Dockerfile for a Next.js/React + Node/FastAPI app with non-root user execution, cache layering, and a GitHub Actions workflow that runs tests on every PR.',
              acceptanceCriteria: [
                'Docker image runs as unprivileged non-root user',
                'Docker image size under 120MB',
                'CI pipeline halts on lint or unit test failure'
              ]
            },
            interviewTrap: {
              question: 'How do you safely rename a column in a production database table with 50 million active rows without downtime?',
              seniorAnswer: 'Never run ALTER TABLE RENAME in one step (it breaks running old code replicas). Use the Expand/Contract (Parallel Run) pattern: 1) Add the new column (nullable), 2) Deploy code that writes to both old and new columns, reads from old, 3) Backfill historical data in batches, 4) Deploy code that reads from new column, 5) Drop the old column after verifying stability.',
              pitfallToAvoid: 'Running a raw RENAME or ADD COLUMN with a heavy default value that takes an exclusive table lock.'
            },
            quiz: [
              {
                id: 'q16',
                question: 'Why are multi-stage Docker builds critical for production containers?',
                options: ['They run faster on Macbooks', 'They exclude compilers, dev dependencies, and source artifacts from the final production image, reducing attack surface and image size', 'They automatically scale in Kubernetes', 'They allow multiple OS kernels to run simultaneously'],
                correctIndex: 1,
                explanation: 'Multi-stage builds leave behind heavy build tools (compilers, npm cache) and only copy the compiled binary/assets into a minimal runtime base.'
              }
            ]
          }
        ]
      }
    ]
  },

  'ai-engineer': {
    id: 'ai-engineer',
    role: 'AI Engineer',
    title: 'AI & Applied LLM Systems',
    description: 'Build enterprise RAG pipelines, fine-tune models, orchestrate multi-agent workflows, and scale inference.',
    category: 'Role-Based',
    icon: 'Cpu',
    accentColor: 'purple',
    totalHours: 190,
    industryDemand: 'Critical',
    stages: [
      {
        id: 'ai-stage-1',
        stageNumber: 1,
        title: 'Python, Math & ML Foundations',
        description: 'Linear algebra, matrix operations, vectors, PyTorch tensors, and data wrangling with Pandas.',
        badge: 'Mathematical Foundations',
        nodes: [
          {
            id: 'ai-foundations',
            title: 'PyTorch Tensors, Embeddings & Vector Math',
            tagline: 'Dot products, cosine similarity, dimensional reduction, and tensor operations.',
            stageNumber: 1,
            stageTitle: 'Python, Math & ML Foundations',
            difficulty: 'Foundational',
            estimatedHours: 10,
            status: 'completed',
            isKeyMilestone: true,
            connections: ['ai-rag', 'ai-agents'],
            seniorMentalModel: 'Seniors don\'t view AI as magic or simple API calls to OpenAI. They understand that LLMs are next-token predictors trained on high-dimensional vector spaces, and that similarity search is mathematical geometry (cosine similarity in 1536-dimensional space).',
            coreChecklist: [
              'Compute dot products, matrix multiplications, and cosine similarity in NumPy/PyTorch',
              'Understand semantic embeddings and vector space representations',
              'Implement tokenization algorithms (Byte-Pair Encoding, WordPiece) from scratch',
              'Profile GPU memory allocation (VRAM) and tensor precision (FP32, FP16, BF16, INT8, INT4)'
            ],
            resources: [
              { id: 'ai-r1', title: 'Neural Networks: Zero to Hero by Andrej Karpathy', type: 'Course', url: 'https://karpathy.ai/zero-to-hero.html', isFree: true, author: 'Andrej Karpathy' },
              { id: 'ai-r2', title: '3Blue1Brown - Essence of Linear Algebra', type: 'Video', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', isFree: true }
            ],
            practicalChallenge: {
              title: 'Micro-GPT from Scratch in PyTorch',
              description: 'Implement a character-level multi-head self-attention transformer from scratch following Karpathy\'s nanogpt and train it on Shakespeare text.',
              acceptanceCriteria: [
                'Build Multi-Head Attention, LayerNorm, and FeedForward modules',
                'Demonstrates loss reduction across training epochs',
                'Generates coherent Shakespeare-style character completions'
              ]
            },
            interviewTrap: {
              question: 'Why do we use Cosine Similarity instead of Euclidean (L2) distance for comparing text embeddings?',
              seniorAnswer: 'Cosine similarity measures the angle between vectors, capturing direction and semantic meaning while normalizing out magnitude. Text embeddings of varying lengths can have different vector magnitudes, so cosine similarity ensures document length does not distort semantic similarity.',
              pitfallToAvoid: 'Claiming cosine similarity is always faster to calculate than Euclidean distance.'
            },
            quiz: [
              {
                id: 'q17',
                question: 'What is the attention formula introduced in the "Attention Is All You Need" paper?',
                options: ['softmax(QK^T / sqrt(d_k)) * V', 'sigmoid(Q * K) + V', 'relu(W_1 * x + b_1)', 'argmax(Q + K - V)'],
                correctIndex: 0,
                explanation: 'Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V scales dot products by the square root of dimension size.'
              }
            ]
          }
        ]
      },
      {
        id: 'ai-stage-2',
        stageNumber: 2,
        title: 'Retrieval Augmented Generation (RAG)',
        description: 'Chunking strategies, hybrid search (dense + sparse BM25), reranking, and vector databases.',
        badge: 'Enterprise Architecture',
        nodes: [
          {
            id: 'ai-rag',
            title: 'Production RAG, Hybrid Search & Reranking',
            tagline: 'Chunking, Vector DBs (pgvector, Qdrant), reciprocal rank fusion (RRF), and cross-encoder rerankers.',
            stageNumber: 2,
            stageTitle: 'Retrieval Augmented Generation (RAG)',
            difficulty: 'Advanced',
            estimatedHours: 16,
            status: 'in_progress',
            isKeyMilestone: true,
            connections: ['ai-agents', 'ai-evals'],
            seniorMentalModel: 'Juniors dump PDFs into LangChain with default 1000-character chunks and wonder why retrieval is terrible. Seniors know chunking must respect semantic boundaries (Markdown/AST chunking), hybrid search combines exact keyword matches (BM25) with semantic embeddings (dense), and cross-encoder rerankers filter out hallucinations.',
            coreChecklist: [
              'Implement Semantic & Hierarchical Chunking (parent-child documents)',
              'Combine dense semantic search with sparse BM25 keyword search using Reciprocal Rank Fusion (RRF)',
              'Deploy cross-encoder rerankers (Cohere Rerank, BGE-Reranker) to boost top-5 precision',
              'Set up HNSW and IVFFlat index tuning in pgvector or Qdrant for sub-20ms retrieval'
            ],
            resources: [
              { id: 'ai-r3', title: 'Advanced RAG Techniques by Pinecone', type: 'Docs', url: 'https://www.pinecone.io/learn/advanced-rag-techniques/', isFree: true },
              { id: 'ai-r4', title: 'RAG from Scratch by LangChain', type: 'Video', url: 'https://youtube.com', isFree: true }
            ],
            practicalChallenge: {
              title: 'Enterprise PDF Document Assistant with Hybrid Search',
              description: 'Build a RAG system on financial SEC 10-K quarterly reports that answers complex numerical and textual questions with exact page and section citations.',
              acceptanceCriteria: [
                'Hybrid search combining pgvector and PostgreSQL tsvector/tsquery',
                'Includes source citation links in final LLM response',
                'Rejection prompt when context does not contain sufficient answer evidence'
              ]
            },
            interviewTrap: {
              question: 'How do you diagnose and eliminate hallucinations in an enterprise RAG pipeline?',
              seniorAnswer: '1) Evaluate retrieval recall vs generation precision using RAGAS / TruLens metrics (Context Relevance, Faithfulness, Answer Relevance). If context relevance is low, the problem is chunking/retrieval. If faithfulness is low, the LLM is ignoring context. 2) Apply cross-encoder reranking, 3) Use strict system prompting with negative constraints ("If the context does not explicitly state X, reply with \'I do not have sufficient information\'"), 4) Enforce structured outputs via Pydantic/JSON schema.',
              pitfallToAvoid: 'Claiming that increasing the LLM temperature or increasing chunk size fixes hallucinations.'
            },
            quiz: [
              {
                id: 'q18',
                question: 'What is Reciprocal Rank Fusion (RRF) used for in modern RAG systems?',
                options: ['Encrypting vector databases', 'Combining ranked results from disparate retrieval systems (like dense vector search and sparse BM25) into a single unified score', 'Generating synthetic text', 'Fine-tuning transformer weights'],
                correctIndex: 1,
                explanation: 'RRF merges ranked lists from different retrieval algorithms without needing to normalize disparate raw score distributions.'
              }
            ]
          }
        ]
      },
      {
        id: 'ai-stage-3',
        stageNumber: 3,
        title: 'Autonomous AI Agents & Tool Calling',
        description: 'ReAct loops, function calling, state machines, LangGraph, and guardrails.',
        badge: 'Autonomous Systems',
        nodes: [
          {
            id: 'ai-agents',
            title: 'Agentic Architectures, ReAct Loops & Tool Orchestration',
            tagline: 'Planning, reflection, function calling, LangGraph state graphs, and Human-in-the-Loop.',
            stageNumber: 3,
            stageTitle: 'Autonomous AI Agents & Tool Calling',
            difficulty: 'Senior Masterclass',
            estimatedHours: 18,
            status: 'recommended',
            isKeyMilestone: true,
            connections: ['ai-evals'],
            seniorMentalModel: 'Seniors don\'t let LLMs run free loops without bounded deterministic state machines. They implement explicit state graphs (LangGraph), idempotency on tool invocations, checkpointing for human-in-the-loop approvals, and timeout safeguards.',
            coreChecklist: [
              'Design ReAct (Reason + Act) loops with deterministic stopping conditions',
              'Implement structured tool calling with schema validation via Pydantic',
              'Model multi-agent workflows as state graphs with branch routing and memory persistence',
              'Incorporate Human-in-the-Loop approval gates for destructive tool calls (e.g. sending emails, deleting records)'
            ],
            resources: [
              { id: 'ai-r5', title: 'Building Effective AI Agents by Anthropic', type: 'Article', url: 'https://www.anthropic.com/research/building-effective-agents', isFree: true },
              { id: 'ai-r6', title: 'LangGraph State Machine Course', type: 'Course', url: 'https://academy.langchain.com', isFree: true }
            ],
            practicalChallenge: {
              title: 'Autonomous Research & Code Debugging Agent',
              description: 'Build an autonomous agent with 4 tools: web search, code executor, terminal shell, and file writer. Give it a bug report and let it iterate, run tests, and write the fix.',
              acceptanceCriteria: [
                'Max iteration limit to prevent infinite spending loops',
                'Stores intermediate reasoning in a persistent memory checkpoint',
                'Requires human confirmation before writing to disk'
              ]
            },
            interviewTrap: {
              question: 'Why does Anthropic\'s research recommend simple workflows with tools over complex multi-agent frameworks for most production tasks?',
              seniorAnswer: 'Complex autonomous multi-agent setups suffer from compounded error probabilities (if each agent step has 90% accuracy, 5 chained agents have 59% reliability), high latency, massive token costs, and difficulty debugging failure states. Deterministic routing, routing classifiers, and parallel sub-agents with clear evaluation gates are far more reliable in production.',
              pitfallToAvoid: 'Advocating for 10 autonomous agents talking to each other without strict evaluation controls.'
            },
            quiz: [
              {
                id: 'q19',
                question: 'What is the primary vulnerability of unconstrained autonomous LLM agents with bash/code execution tools?',
                options: ['Low network bandwidth', 'Prompt Injection leading to remote code execution or data exfiltration', 'GPU overheating', 'Loss of CSS styling'],
                correctIndex: 1,
                explanation: 'Indirect prompt injection in retrieved content can hijack tool execution and run malicious shell commands unless strictly sandboxed.'
              }
            ]
          }
        ]
      }
    ]
  },

  'devops': {
    id: 'devops',
    role: 'DevOps Engineer',
    title: 'DevOps & Cloud Architecture',
    description: 'Master container orchestration, Kubernetes, Infrastructure as Code (Terraform), CI/CD, and Observability.',
    category: 'Role-Based',
    icon: 'Cloud',
    accentColor: 'amber',
    totalHours: 150,
    industryDemand: 'Very High',
    stages: [
      {
        id: 'do-stage-1',
        stageNumber: 1,
        title: 'Containers & Docker Internals',
        description: 'Linux namespaces, cgroups, layered union filesystems, and container networking.',
        badge: 'Core Infrastructure',
        nodes: [
          {
            id: 'do-docker',
            title: 'Docker Internals & Linux Namespaces',
            tagline: 'Namespaces (PID, NET, MNT), cgroups (resource limits), and scratch containers.',
            stageNumber: 1,
            stageTitle: 'Containers & Docker Internals',
            difficulty: 'Core',
            estimatedHours: 10,
            status: 'completed',
            isKeyMilestone: true,
            connections: ['do-k8s'],
            seniorMentalModel: 'Seniors know that a container is not a lightweight VM. A container is simply a standard Linux process restricted by kernel namespaces for isolation and cgroups for resource limits (CPU/memory throttling).',
            coreChecklist: [
              'Inspect Linux namespaces (unshare, nsenter) and control groups (cgroups v2)',
              'Build minimal scratch and distroless container images',
              'Configure Docker bridge and host networking with iptables inspection',
              'Manage secrets without leaking credentials into image build layer history'
            ],
            resources: [
              { id: 'do-r1', title: 'Docker Deep Dive by Nigel Poulton', type: 'Course', url: 'https://nigelpoulton.com', isFree: false },
              { id: 'do-r2', title: 'Containers from Scratch (Liz Rice)', type: 'Video', url: 'https://youtube.com', isFree: true, author: 'Liz Rice' }
            ],
            practicalChallenge: {
              title: 'Build a Mini Container Runtime in 100 lines of Go/Bash',
              description: 'Use the unshare syscall to create isolated PID, mount, and UTS namespaces with a custom chroot filesystem.',
              acceptanceCriteria: [
                'Running `ps` inside the child process only shows PID 1',
                'Host filesystem cannot be accessed from child process',
                'Demonstrates cgroup memory cap enforcing OOM kill'
              ]
            },
            interviewTrap: {
              question: 'What is the difference between a Docker container and a Virtual Machine?',
              seniorAnswer: 'A Virtual Machine bundles an entire guest operating system, virtual kernel, and emulated virtual hardware via a hypervisor (Type 1 or Type 2), taking gigabytes of storage and minutes to boot. A container shares the host Linux kernel directly, using namespaces for process isolation and cgroups for resource capping, booting in milliseconds with negligible overhead.',
              pitfallToAvoid: 'Saying containers have their own dedicated kernel.'
            },
            quiz: [
              {
                id: 'q20',
                question: 'Which Linux kernel feature is responsible for limiting and throttling CPU and memory usage of a container?',
                options: ['Namespaces', 'Control Groups (cgroups)', 'systemd', 'iptables'],
                correctIndex: 1,
                explanation: 'cgroups (control groups) meter and enforce limits on system resources such as memory, CPU, and block I/O.'
              }
            ]
          }
        ]
      },
      {
        id: 'do-stage-2',
        stageNumber: 2,
        title: 'Kubernetes (K8s) & Cluster Orchestration',
        description: 'Pods, Deployments, Services, Ingress, Horizontal Pod Autoscaling, and Helm charts.',
        badge: 'Orchestration',
        nodes: [
          {
            id: 'do-k8s',
            title: 'Kubernetes Architecture & Production Operations',
            tagline: 'kube-apiserver, etcd, kube-scheduler, kubelet, CNI plugins, and Rolling Updates.',
            stageNumber: 2,
            stageTitle: 'Kubernetes (K8s) & Cluster Orchestration',
            difficulty: 'Senior Masterclass',
            estimatedHours: 20,
            status: 'in_progress',
            isKeyMilestone: true,
            connections: ['do-iac'],
            seniorMentalModel: 'Seniors view Kubernetes as an automated reconciliation loop: declaring desired state in etcd and letting controllers continuously converge actual state toward desired state. They configure readiness/liveness probes carefully to avoid cascading restart storms.',
            coreChecklist: [
              'Understand Control Plane components: kube-apiserver, etcd, controller-manager, scheduler',
              'Configure fine-grained liveness, readiness, and startup probes',
              'Implement Horizontal Pod Autoscaling (HPA) based on custom Prometheus metrics',
              'Package and template multi-environment applications using Helm'
            ],
            resources: [
              { id: 'do-r3', title: 'Kubernetes The Hard Way (Kelsey Hightower)', type: 'GitHub', url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way', isFree: true, author: 'Kelsey Hightower' },
              { id: 'do-r4', title: 'Kubernetes Documentation Official', type: 'Docs', url: 'https://kubernetes.io/docs/', isFree: true }
            ],
            practicalChallenge: {
              title: 'Zero-Downtime Canary Rollout on Local K3s / Minikube',
              description: 'Deploy an app with 5 replicas on Minikube. Execute a rolling deployment with preStop hooks and readiness probes while sending continuous HTTP traffic with zero 5xx errors.',
              acceptanceCriteria: [
                '100% successful requests during deployment transition',
                'Readiness probe prevents traffic until app cache is warm',
                'preStop hook allows graceful connection draining'
              ]
            },
            interviewTrap: {
              question: 'Why can a poorly configured Liveness Probe cause a cascading failure across an entire Kubernetes cluster?',
              seniorAnswer: 'If a backend service becomes temporarily overloaded or experiences high database latency, response times spike. A naive liveness probe with a short timeout fails, causing kubelet to kill and restart the pod. When the pod restarts, it dumps its load onto remaining surviving pods, causing their liveness probes to fail too, triggering a cascading restart loop across the entire deployment.',
              pitfallToAvoid: 'Using liveness probes to check external dependencies like databases.'
            },
            quiz: [
              {
                id: 'q21',
                question: 'Which Kubernetes probe determines whether a Pod receives traffic from a Service?',
                options: ['Liveness Probe', 'Readiness Probe', 'Startup Probe', 'Healthcheck Daemon'],
                correctIndex: 1,
                explanation: 'The Readiness Probe signals whether the pod is ready to accept user network traffic; if it fails, endpoints are removed from the Service.'
              }
            ]
          }
        ]
      }
    ]
  },

  'dsa-cs': {
    id: 'dsa-cs',
    role: 'Computer Science & DSA',
    title: 'Data Structures & Algorithms',
    description: 'Master core computational thinking, Big-O complexity, graphs, dynamic programming, and technical interview problem solving.',
    category: 'Foundations',
    icon: 'Terminal',
    accentColor: 'cyan',
    totalHours: 120,
    industryDemand: 'High',
    stages: [
      {
        id: 'dsa-stage-1',
        stageNumber: 1,
        title: 'Complexity & Linear Data Structures',
        description: 'Time and space complexity, memory layouts, arrays, linked lists, stacks, and queues.',
        badge: 'Algorithmic Core',
        nodes: [
          {
            id: 'dsa-linear',
            title: 'Big-O Analysis, Memory Locality & Two Pointers',
            tagline: 'Asymptotic notation, CPU cache lines, Two Pointers, and Sliding Window patterns.',
            stageNumber: 1,
            stageTitle: 'Complexity & Linear Data Structures',
            difficulty: 'Core',
            estimatedHours: 10,
            status: 'completed',
            isKeyMilestone: true,
            connections: ['dsa-graphs', 'dsa-dp'],
            seniorMentalModel: 'Seniors don\'t just memorize LeetCode solutions; they recognize algorithmic patterns (Sliding Window, Two Pointers, Monotonic Stack). They also know that due to CPU hardware cache lines, iterating over a contiguous array in memory is orders of magnitude faster than traversing linked list pointers across scattered RAM.',
            coreChecklist: [
              'Derive tight upper bounds (Big-O), lower bounds (Big-Omega), and average case (Big-Theta)',
              'Master Two-Pointers (opposite ends, fast & slow pointer cycle detection)',
              'Implement Sliding Window algorithms for substring/subarray optimization in O(N) time',
              'Use Monotonic Stacks to solve Next Greater Element in single-pass linear time'
            ],
            resources: [
              { id: 'dsa-r1', title: 'NeetCode 150 Problem Roadmap', type: 'Course', url: 'https://neetcode.io', isFree: true },
              { id: 'dsa-r2', title: 'Algorithms by Robert Sedgewick (Princeton)', type: 'Course', url: 'https://algs4.cs.princeton.edu', isFree: true }
            ],
            practicalChallenge: {
              title: 'Sliding Window Maximum in O(N) Time',
              description: 'Solve the Sliding Window Maximum problem using a Monotonic Double-Ended Queue (Deque) ensuring strict O(N) total runtime.',
              acceptanceCriteria: [
                'Time complexity strictly O(N), not O(N * K)',
                'Handles empty and single-element edge cases',
                'Memory space complexity strictly O(K) where K is window size'
              ]
            },
            interviewTrap: {
              question: 'Why does inserting at the end of an ArrayList/vector take O(1) amortized time instead of strict O(1)?',
              seniorAnswer: 'When the internal dynamic array reaches capacity, it must allocate a new chunk of memory with double the size, copy all N existing elements over, and free the old array, taking O(N) time. However, doubling capacity guarantees that this expensive resizing operation happens so infrequently that the average time per insertion across N operations remains O(1) amortized.',
              pitfallToAvoid: 'Claiming dynamic array append is ALWAYS constant time O(1).'
            },
            quiz: [
              {
                id: 'q22',
                question: 'What is the time complexity of finding a cycle in a linked list using Floyd\'s Tortoise and Hare algorithm?',
                options: ['O(N^2) time and O(N) space', 'O(N) time and O(1) auxiliary space', 'O(log N) time and O(1) space', 'O(N log N) time'],
                correctIndex: 1,
                explanation: 'Floyd\'s algorithm moves two pointers at different speeds, detecting a cycle in O(N) time with zero extra heap memory (O(1) space).'
              }
            ]
          }
        ]
      },
      {
        id: 'dsa-stage-2',
        stageNumber: 2,
        title: 'Graphs, Trees & Dynamic Programming',
        description: 'BFS/DFS, Dijkstra, Topological Sort, Memoization, and Tabulation.',
        badge: 'Advanced Algorithms',
        nodes: [
          {
            id: 'dsa-graphs',
            title: 'Graph Traversal, Topological Sort & Shortest Paths',
            tagline: 'BFS, DFS, Kahn\'s Algorithm, Dijkstra, and Union-Find (Disjoint Set).',
            stageNumber: 2,
            stageTitle: 'Graphs, Trees & Dynamic Programming',
            difficulty: 'Advanced',
            estimatedHours: 16,
            status: 'in_progress',
            isKeyMilestone: true,
            seniorMentalModel: 'Seniors map real-world systems to graphs: build dependency trees (Topological Sort), social connection hops (BFS), and network packet routing (Dijkstra). They choose adjacency lists over adjacency matrices for sparse graph memory efficiency.',
            coreChecklist: [
              'Implement Breadth-First Search (BFS) and Depth-First Search (DFS) iteratively with explicit queues/stacks',
              'Detect cycles in directed and undirected graphs',
              'Implement Kahn\'s Algorithm for Topological Sorting (build pipelines & task scheduling)',
              'Implement Dijkstra\'s algorithm using a Min-Heap / Priority Queue in O((V + E) log V) time'
            ],
            resources: [
              { id: 'dsa-r3', title: 'Graph Algorithms Visualizer by VisuAlgo', type: 'Docs', url: 'https://visualgo.net', isFree: true },
              { id: 'dsa-r4', title: 'MIT 6.006 Introduction to Algorithms', type: 'Course', url: 'https://ocw.mit.edu', isFree: true }
            ],
            practicalChallenge: {
              title: 'Build System Dependency Resolver (Topological Sort)',
              description: 'Implement a package manager dependency resolver that takes package requirements, checks for cyclic dependencies (e.g. A depends on B, B depends on A), and outputs the exact build installation order.',
              acceptanceCriteria: [
                'Throws descriptive cycle detection error with loop path',
                'Outputs correct linear dependency execution sequence',
                'Runs in O(V + E) time complexity'
              ]
            },
            interviewTrap: {
              question: 'When does Dijkstra\'s shortest path algorithm fail, and what algorithm should be used instead?',
              seniorAnswer: 'Dijkstra fails when a graph contains negative edge weights because it greedily assumes once a node is marked visited, its shortest distance is finalized. For graphs with negative edge weights (and detecting negative cycles), the Bellman-Ford algorithm must be used.',
              pitfallToAvoid: 'Claiming Dijkstra works on negative edges if you just add a constant to all weights.'
            },
            quiz: [
              {
                id: 'q23',
                question: 'What is the runtime complexity of Dijkstra\'s algorithm using a binary min-heap priority queue?',
                options: ['O(V^3)', 'O((V + E) log V)', 'O(V * E)', 'O(1)'],
                correctIndex: 1,
                explanation: 'Using an adjacency list and binary min-heap, Dijkstra executes in O((V + E) log V) time.'
              }
            ]
          }
        ]
      }
    ]
  },

  'system-design': {
    id: 'system-design',
    role: 'System Design',
    title: 'High-Scale System Architecture',
    description: 'Design systems that scale to millions of users: sharding, replication, CDN, rate limiting, and CAP theorem trade-offs.',
    category: 'Foundations',
    icon: 'Network',
    accentColor: 'indigo',
    totalHours: 110,
    industryDemand: 'Critical',
    stages: [
      {
        id: 'sd-stage-1',
        stageNumber: 1,
        title: 'Scalability Principles & Building Blocks',
        description: 'Load balancers, reverse proxies, horizontal vs vertical scaling, and caching tiers.',
        badge: 'Scale Foundations',
        nodes: [
          {
            id: 'sd-blocks',
            title: 'Horizontal Scaling, Sharding & Consistent Hashing',
            tagline: 'Database sharding keys, consistent hashing rings, read replicas, and split-brain resolution.',
            stageNumber: 1,
            stageTitle: 'Scalability Principles & Building Blocks',
            difficulty: 'Senior Masterclass',
            estimatedHours: 14,
            status: 'completed',
            isKeyMilestone: true,
            seniorMentalModel: 'Seniors design systems asking: "What breaks when traffic spikes 100x?" They isolate single points of failure, partition data using consistent hashing so adding a server node only relocates K/N keys, and decouple synchronous request flows with event buses.',
            coreChecklist: [
              'Design consistent hashing rings with virtual nodes for uniform partition distribution',
              'Choose appropriate database sharding keys to prevent hot spot partitions',
              'Implement Read Replicas with lag tolerance and primary failover elections',
              'Size network bandwidth, QPS, storage growth, and cache memory mathematically'
            ],
            resources: [
              { id: 'sd-r1', title: 'System Design Primer by Donne Martin', type: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer', isFree: true, author: 'Donne Martin' },
              { id: 'sd-r2', title: 'ByteByteGo System Design Newsletter', type: 'Article', url: 'https://blog.bytebytego.com/', isFree: true, author: 'Alex Xu' }
            ],
            practicalChallenge: {
              title: 'Design a Distributed URL Shortener (TinyURL) at 10,000 QPS',
              description: 'Calculate storage, bandwidth, and database schema for 100M URLs per month. Design the Base62 encoding service, caching tier, and collision prevention mechanism.',
              acceptanceCriteria: [
                'Complete capacity estimation math document (QPS, IOPS, Storage)',
                'Consistent hashing key-value store architecture',
                'Sub-10ms read latency guarantee using distributed cache'
              ]
            },
            interviewTrap: {
              question: 'Why do we use Virtual Nodes in a Consistent Hashing ring?',
              seniorAnswer: 'Without virtual nodes, standard consistent hashing distributes real server nodes unevenly across the 360-degree hash ring, causing non-uniform key distribution and hotspot servers. Virtual nodes map each physical server to hundreds of pseudo-random locations on the ring, ensuring mathematically balanced load distribution.',
              pitfallToAvoid: 'Thinking consistent hashing is only used for databases and not distributed caches or load balancers.'
            },
            quiz: [
              {
                id: 'q24',
                question: 'When a new cache node is added to a Consistent Hashing ring with N nodes, approximately what fraction of keys need to be remapped?',
                options: ['All keys (100%)', '1 / (N + 1) of the keys', '50% of the keys', 'Zero keys'],
                correctIndex: 1,
                explanation: 'Consistent hashing only relocates keys adjacent to the new node on the ring (approx 1/N), avoiding global cache flushes.'
              }
            ]
          }
        ]
      }
    ]
  }
};
