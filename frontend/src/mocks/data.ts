import { 
  Profile, 
  Roadmap, 
  Resource, 
  Creator, 
  Project, 
  Job, 
  ChatMessage, 
  CommunityPost, 
  ProgressMetric,
  Skill 
} from '../types';

export const mockProfile: Profile = {
  id: 'user-1',
  name: 'Majidulla',
  email: 'majidulla@studentos.dev',
  goal: 'AI Engineer',
  targetRole: 'AI Engineer',
  level: 'Intermediate',
  interests: ['AI', 'DevOps', 'Full Stack', 'Open Source'],
  timeCommitmentHours: 2,
  skills: ['Python', 'JavaScript', 'Docker', 'Git', 'FastAPI', 'React', 'SQL', 'PyTorch'],
  followedCreatorIds: ['karpathy', 'kunalkushwaha', 'fireship', 'hiteshchoudhary'],
};

export const mockSkills: Skill[] = [
  { id: '1', name: 'Python', category: 'Language', proficiency: 85, level: 'Advanced' },
  { id: '2', name: 'Git & GitHub', category: 'Tools', proficiency: 80, level: 'Advanced' },
  { id: '3', name: 'JavaScript', category: 'Language', proficiency: 65, level: 'Intermediate' },
  { id: '4', name: 'SQL & Databases', category: 'Backend', proficiency: 60, level: 'Intermediate' },
  { id: '5', name: 'FastAPI', category: 'Backend', proficiency: 45, level: 'Intermediate' },
  { id: '6', name: 'Docker', category: 'DevOps', proficiency: 40, level: 'Beginner' },
  { id: '7', name: 'React', category: 'Frontend', proficiency: 50, level: 'Intermediate' },
  { id: '8', name: 'PyTorch & LLMs', category: 'AI/ML', proficiency: 30, level: 'Beginner' },
];

export const mockMetrics: ProgressMetric = {
  topicsCompleted: 28,
  totalTopics: 120,
  learningHours: 42,
  projectsCount: 5,
  activeProjects: 3,
  currentStreak: 12,
  roadmapPercentage: 28,
  skillGrowthPercentage: 18,
};

export const mockTodaysFocus = [
  { id: 'tf-1', text: 'Complete FastAPI tutorial', completed: false, time: '45m' },
  { id: 'tf-2', text: 'Watch Karpathy video (Agents)', completed: true, time: '1h' },
  { id: 'tf-3', text: 'Update project README', completed: false, time: '20m' },
  { id: 'tf-4', text: 'Practice DSA (30 mins)', completed: false, time: '30m' },
];

export const mockRoadmap: Roadmap = {
  id: 'roadmap-ai-engineer',
  goal: 'AI Engineer',
  targetRole: 'AI Engineer',
  overallPercentage: 28,
  stages: [
    { id: 'stage-1', stageNumber: 1, title: 'Foundations', status: 'Completed', moduleCount: 8 },
    { id: 'stage-2', stageNumber: 2, title: 'Backend & APIs', status: 'In Progress', moduleCount: 8 },
    { id: 'stage-3', stageNumber: 3, title: 'AI & LLMs', status: 'Next', moduleCount: 8 },
    { id: 'stage-4', stageNumber: 4, title: 'RAG', status: 'Upcoming', moduleCount: 6 },
    { id: 'stage-5', stageNumber: 5, title: 'AI Agents', status: 'Upcoming', moduleCount: 6 },
    { id: 'stage-6', stageNumber: 6, title: 'Production & DevOps', status: 'Upcoming', moduleCount: 6 },
    { id: 'stage-7', stageNumber: 7, title: 'Career & Jobs', status: 'Upcoming', moduleCount: 6 },
  ],
  modules: [
    {
      id: 'mod-1',
      number: 1,
      title: 'Foundations',
      description: 'Core programming, tools and CS basics',
      status: 'Completed',
      totalTasks: 8,
      completedTasks: 8,
      percentage: 100,
      tasks: [
        { id: 't1-1', title: 'Python Syntax, OOP & Data Structures', type: 'Theory', level: 'Basics', estimatedHours: 6, completed: true },
        { id: 't1-2', title: 'Git Version Control & GitHub Flow', type: 'Hands-on', level: 'Core', estimatedHours: 3, completed: true },
        { id: 't1-3', title: 'Linux Command Line & Bash Scripting', type: 'Hands-on', level: 'Basics', estimatedHours: 4, completed: true },
        { id: 't1-4', title: 'Virtual Environments & Poetry', type: 'Hands-on', level: 'Project Setup', estimatedHours: 2, completed: true },
      ],
      whyThisStep: 'Programming foundations ensure you write clean, maintainable code before jumping into complex ML libraries.',
      additionalResources: []
    },
    {
      id: 'mod-2',
      number: 2,
      title: 'Backend & APIs',
      description: 'Build real backend applications and APIs',
      status: 'In Progress',
      totalTasks: 8,
      completedTasks: 3,
      percentage: 38,
      whyThisStep: 'Backend & APIs are essential because they help you build real applications, connect to databases, handle authentication, and provide APIs that power your frontend or mobile apps. These skills are required for almost every software or AI product role.',
      aiSuggestion: {
        text: 'Based on your progress, I recommend you complete the CRUD API and then move to Authentication with JWT. This will give you a strong backend foundation for AI and full-stack projects.',
        nextTaskId: 't2-3',
        nextTaskTitle: 'Build CRUD API with FastAPI'
      },
      recommendedProject: {
        id: 'proj-task-api',
        title: 'Task Manager API',
        description: 'Build a task management backend with FastAPI, PostgreSQL, JWT authentication and deployment.',
        badge: 'Beginner Friendly'
      },
      additionalResources: [
        {
          id: 'res-fastapi-fcc',
          title: 'FastAPI Full Course (freeCodeCamp)',
          platform: 'YouTube',
          duration: '3:12:00',
          url: 'https://youtube.com'
        },
        {
          id: 'res-fastapi-docs',
          title: 'FastAPI Documentation',
          platform: 'Documentation',
          url: 'https://fastapi.tiangolo.com'
        },
        {
          id: 'res-awesome-fastapi',
          title: 'Awesome FastAPI',
          platform: 'GitHub',
          url: 'https://github.com'
        },
        {
          id: 'res-notes-template',
          title: 'Backend Learning Notes Template',
          platform: 'Notion',
          url: 'https://notion.so'
        }
      ],
      tasks: [
        {
          id: 't2-1',
          title: 'Learn HTTP & REST APIs',
          type: 'Theory',
          level: 'Basics',
          estimatedHours: 2,
          completed: true,
          dependencies: ['Python basics'],
          resourcesCount: 2
        },
        {
          id: 't2-2',
          title: 'Set up FastAPI project',
          type: 'Hands-on',
          level: 'Project Setup',
          estimatedHours: 3,
          completed: true,
          dependencies: ['Python virtualenv', 'REST APIs'],
          resourcesCount: 3
        },
        {
          id: 't2-3',
          title: 'Build CRUD API with FastAPI',
          description: 'Build a complete CRUD (Create, Read, Update, Delete) API using FastAPI and PostgreSQL. Learn how to structure your project, use Pydantic models, and test endpoints.',
          type: 'Hands-on',
          level: 'Core',
          estimatedHours: 4,
          completed: false,
          inProgress: true,
          dependencies: ['Python basics', 'FastAPI setup'],
          subTasks: [
            { id: 'st-1', title: 'Set up project structure', completed: true },
            { id: 'st-2', title: 'Create database models', completed: true },
            { id: 'st-3', title: 'Implement CRUD endpoints', completed: false },
            { id: 'st-4', title: 'Test with Postman or Thunder Client', completed: false },
          ],
          resourcesCount: 3
        },
        {
          id: 't2-4',
          title: 'Authentication with JWT',
          type: 'Security',
          level: 'Auth',
          estimatedHours: 3,
          completed: false,
          dependencies: ['Build CRUD API'],
          resourcesCount: 2
        },
        {
          id: 't2-5',
          title: 'Connect to PostgreSQL',
          type: 'Hands-on',
          level: 'Database',
          estimatedHours: 2,
          completed: false,
          dependencies: ['Docker setup', 'SQL basics'],
          resourcesCount: 2
        },
        {
          id: 't2-6',
          title: 'Build a small CRUD project',
          type: 'Project',
          level: 'Full Build',
          estimatedHours: 5,
          completed: false,
          dependencies: ['Authentication with JWT', 'Connect to PostgreSQL'],
          resourcesCount: 4
        },
        {
          id: 't2-7',
          title: 'API Testing with Pytest & TestClient',
          type: 'Hands-on',
          level: 'Core',
          estimatedHours: 3,
          completed: false,
          resourcesCount: 2
        },
        {
          id: 't2-8',
          title: 'Containerize FastAPI with Docker',
          type: 'Hands-on',
          level: 'Project Setup',
          estimatedHours: 2,
          completed: false,
          resourcesCount: 3
        }
      ]
    },
    {
      id: 'mod-3',
      number: 3,
      title: 'AI & LLMs',
      description: 'Learn LLMs, prompt engineering, and embeddings',
      status: 'Upcoming',
      totalTasks: 8,
      completedTasks: 0,
      percentage: 0,
      whyThisStep: 'Understanding how transformer models, tokenization, embeddings, and prompting work is the core foundation of an AI Engineer.',
      tasks: [
        { id: 't3-1', title: 'Transformer Architecture & Attention Mechanisms', type: 'Theory', level: 'Basics', estimatedHours: 4, completed: false },
        { id: 't3-2', title: 'OpenAI API & Anthropic SDK Fundamentals', type: 'Hands-on', level: 'Core', estimatedHours: 3, completed: false },
        { id: 't3-3', title: 'Prompt Engineering & Structured Outputs', type: 'Hands-on', level: 'Core', estimatedHours: 4, completed: false },
        { id: 't3-4', title: 'Vector Embeddings & Similarity Search', type: 'Theory', level: 'Basics', estimatedHours: 3, completed: false },
        { id: 't3-5', title: 'Local Models with Ollama and HuggingFace', type: 'Hands-on', level: 'Project Setup', estimatedHours: 4, completed: false },
        { id: 't3-6', title: 'Evaluation & Benchmarks for LLM Apps', type: 'Theory', level: 'Core', estimatedHours: 3, completed: false },
      ]
    },
    {
      id: 'mod-4',
      number: 4,
      title: 'RAG',
      description: 'Build knowledge-based retrieval augmented generation systems',
      status: 'Upcoming',
      totalTasks: 6,
      completedTasks: 0,
      percentage: 0,
      whyThisStep: 'RAG bridges proprietary company documents with large language models without expensive fine-tuning.',
      tasks: [
        { id: 't4-1', title: 'Document Ingestion, Chunking & Cleaning', type: 'Hands-on', level: 'Basics', estimatedHours: 3, completed: false },
        { id: 't4-2', title: 'Vector Databases: ChromaDB, Qdrant & Pinecone', type: 'Hands-on', level: 'Database', estimatedHours: 4, completed: false },
        { id: 't4-3', title: 'Hybrid Search & Reranking Models', type: 'Theory', level: 'Core', estimatedHours: 3, completed: false },
        { id: 't4-4', title: 'Building End-to-End RAG with LangChain / LlamaIndex', type: 'Project', level: 'Full Build', estimatedHours: 6, completed: false },
      ]
    },
    {
      id: 'mod-5',
      number: 5,
      title: 'AI Agents',
      description: 'Multi-step agents, function calling, and tool use',
      status: 'Upcoming',
      totalTasks: 6,
      completedTasks: 0,
      percentage: 0,
      whyThisStep: 'Autonomous agents that plan, remember state, and use external APIs are the frontier of modern software.',
      tasks: [
        { id: 't5-1', title: 'ReAct Pattern & Tool Calling Protocols', type: 'Theory', level: 'Basics', estimatedHours: 3, completed: false },
        { id: 't5-2', title: 'LangGraph & Stateful Workflows', type: 'Hands-on', level: 'Core', estimatedHours: 5, completed: false },
        { id: 't5-3', title: 'Multi-Agent Collaboration Systems', type: 'Project', level: 'Full Build', estimatedHours: 7, completed: false },
      ]
    },
    {
      id: 'mod-6',
      number: 6,
      title: 'Production & DevOps',
      description: 'Deploy and scale your AI projects reliably',
      status: 'Upcoming',
      totalTasks: 6,
      completedTasks: 0,
      percentage: 0,
      whyThisStep: 'Taking AI apps from Jupyter Notebooks to low-latency, observable production APIs is what separates hobbyists from engineers.',
      tasks: [
        { id: 't6-1', title: 'Async FastAPI + Celery / Redis Queues', type: 'Hands-on', level: 'Core', estimatedHours: 4, completed: false },
        { id: 't6-2', title: 'Dockerizing & Deploying to AWS / Railway', type: 'Hands-on', level: 'Project Setup', estimatedHours: 4, completed: false },
        { id: 't6-3', title: 'LLM Observability with Langfuse & Arize', type: 'Hands-on', level: 'Core', estimatedHours: 3, completed: false },
      ]
    },
    {
      id: 'mod-7',
      number: 7,
      title: 'Career & Jobs',
      description: 'Resume, interviews, portfolio, and real job applications',
      status: 'Upcoming',
      totalTasks: 6,
      completedTasks: 0,
      percentage: 0,
      whyThisStep: 'Turn your real portfolio of AI and backend projects into high-paying job offers.',
      tasks: [
        { id: 't7-1', title: 'Targeted AI Engineer Resume & Portfolio Site', type: 'Hands-on', level: 'Basics', estimatedHours: 5, completed: false },
        { id: 't7-2', title: 'System Design & LLM Architecture Interviews', type: 'Theory', level: 'Core', estimatedHours: 6, completed: false },
        { id: 't7-3', title: 'Cold Outreach & Tech Community Networking', type: 'Hands-on', level: 'Full Build', estimatedHours: 4, completed: false },
      ]
    }
  ]
};

export const mockResources: Resource[] = [
  {
    id: 'res-1',
    title: 'Build a Complete RAG App with LangChain & Vector DB',
    platform: 'YouTube Video',
    creator: 'codebasics',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/20658428?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
    category: 'AI / ML',
    tags: ['AI / LLMs', 'RAG', 'LangChain', 'Vector Search'],
    difficulty: 'Intermediate',
    duration: '1h 12m',
    saved: true,
    url: 'https://www.youtube.com/watch?v=mEsleV16qdo',
    rating: 4.9
  },
  {
    id: 'res-2',
    title: 'FastAPI Full Course for Beginners: Build Production APIs',
    platform: 'Course (free)',
    creator: 'freeCodeCamp',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/9892522?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80',
    category: 'Backend',
    tags: ['Backend', 'FastAPI', 'APIs', 'PostgreSQL'],
    difficulty: 'Beginner',
    duration: '3h 12m',
    saved: true,
    url: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
    rating: 4.9
  },
  {
    id: 'res-3',
    title: 'Docker & Kubernetes Tutorial for Beginners',
    platform: 'YouTube Video',
    creator: 'TechWorld with Nana',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/61821868?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&auto=format&fit=crop&q=80',
    category: 'DevOps',
    tags: ['DevOps', 'Docker', 'Kubernetes', 'Containers'],
    difficulty: 'Beginner',
    duration: '2h 8m',
    saved: false,
    url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    rating: 4.8
  },
  {
    id: 'res-4',
    title: 'A Practical Guide to Building Autonomous AI Agents',
    platform: 'Article',
    creator: 'OpenAI Research',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/14957082?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    category: 'AI / ML',
    tags: ['AI Agents', 'Tool Calling', 'Reasoning', 'Best Practices'],
    difficulty: 'Intermediate',
    duration: '15 min read',
    saved: true,
    url: 'https://openai.com/index/practices-for-governing-agentic-ai/',
    rating: 5.0
  },
  {
    id: 'res-5',
    title: 'LLMs-from-scratch: Implementing a ChatGPT-like LLM in PyTorch',
    platform: 'GitHub Repository',
    creator: 'Sebastian Raschka',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/5618407?v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=400&auto=format&fit=crop&q=80',
    category: 'AI / ML',
    tags: ['LLMs', 'PyTorch', 'From Scratch', 'Deep Learning'],
    difficulty: 'Advanced',
    duration: '45.2k stars',
    stars: '45.2k',
    saved: true,
    url: 'https://github.com/rasbt/LLMs-from-scratch',
    rating: 5.0
  },
  {
    id: 'res-6',
    title: 'System Design for Beginners: Scalable Microservices Architecture',
    platform: 'YouTube Video',
    creator: 'Gaurav Sen',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/105658826?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    category: 'System Design',
    tags: ['Architecture', 'Scalability', 'Microservices'],
    difficulty: 'Intermediate',
    duration: '1h 45m',
    saved: false,
    url: 'https://www.youtube.com/watch?v=xpDnVSmNFX0',
    rating: 4.9
  },
  {
    id: 'res-7',
    title: 'Vector Databases in 100 Seconds',
    platform: 'YouTube Video',
    creator: 'Fireship',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/46283609?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80',
    category: 'AI / ML',
    tags: ['Vector DBs', 'Embeddings', 'Pinecone', 'pgvector'],
    difficulty: 'Beginner',
    duration: '2m 15s',
    saved: true,
    url: 'https://www.youtube.com/watch?v=klTvEwg3oJ4',
    rating: 4.9
  },
  {
    id: 'res-8',
    title: 'Neural Networks: Zero to Hero — Building micrograd',
    platform: 'YouTube Video',
    creator: 'Andrej Karpathy',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/241138?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
    category: 'AI / ML',
    tags: ['Neural Networks', 'Backprop', 'PyTorch', 'From Scratch'],
    difficulty: 'Intermediate',
    duration: '2h 25m',
    saved: true,
    url: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
    rating: 5.0
  },
  {
    id: 'res-9',
    title: "Let's build GPT: from scratch, in code, spelled out",
    platform: 'YouTube Video',
    creator: 'Andrej Karpathy',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/241138?s=200&v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    category: 'AI / ML',
    tags: ['Transformers', 'GPT', 'Attention', 'PyTorch'],
    difficulty: 'Advanced',
    duration: '1h 56m',
    saved: true,
    url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
    rating: 5.0
  },
  {
    id: 'res-10',
    title: "The Last Algorithms Course You'll Need",
    platform: 'YouTube Video',
    creator: 'ThePrimeagen',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/4198211?v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&auto=format&fit=crop&q=80',
    category: 'DSA',
    tags: ['Algorithms', 'Data Structures', 'Performance', 'TypeScript'],
    difficulty: 'Intermediate',
    duration: '9h 30m',
    saved: true,
    url: 'https://www.youtube.com/watch?v=RBSGKlAnoiM',
    rating: 5.0
  },
  {
    id: 'res-11',
    title: 'Complete Git and GitHub Tutorial for Beginners',
    platform: 'YouTube Video',
    creator: 'Kunal Kushwaha',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/42698533?v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=400&auto=format&fit=crop&q=80',
    category: 'DevOps',
    tags: ['Git', 'GitHub', 'Open Source', 'Version Control'],
    difficulty: 'Beginner',
    duration: '2h 14m',
    saved: true,
    url: 'https://www.youtube.com/watch?v=apGV9Kg7ics',
    rating: 4.9
  },
  {
    id: 'res-12',
    title: 'tinygrad: Deep Learning Framework from Scratch',
    platform: 'GitHub Repository',
    creator: 'George Hotz',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/72895?v=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
    category: 'AI / ML',
    tags: ['Deep Learning', 'GPU', 'tinygrad', 'From Scratch'],
    difficulty: 'Advanced',
    duration: '29.5k stars',
    stars: '29.5k',
    saved: true,
    url: 'https://github.com/tinygrad/tinygrad',
    rating: 5.0
  }
];

export const mockCreators: Creator[] = [
  {
    id: 'karpathy',
    name: 'Andrej Karpathy',
    handle: '@AndrejKarpathy',
    avatarUrl: 'https://avatars.githubusercontent.com/u/241138?v=4',
    verified: true,
    followers: '~1.69M YT Subscribers',
    platform: 'YouTube',
    categories: ['AI/ML', 'Research'],
    tags: ['AI/ML', 'LLMs', 'Deep Learning', 'Research'],
    bio: 'Founding member of OpenAI, former Senior Director of AI at Tesla, and founder of Eureka Labs. Renowned globally for first-principles neural network tutorials.',
    featuredSeries: [
      'Neural Networks: Zero to Hero',
      'LLM from Scratch',
      'Tech Talks & First Principles AI'
    ],
    whyRelevant: 'Covers LLMs, AI fundamentals and production AI — key for your AI Engineer goal.',
    isFollowing: true,
    roadmapCoverage: {
      'Programming Basics': 'none',
      'DSA': 'none',
      'Web Development': 'none',
      'Backend & APIs': 'none',
      'DevOps / Cloud': 'none',
      'AI / LLMs': 'well',
      'Projects': 'well',
      'Career Guidance': 'well'
    }
  },
  {
    id: 'kunalkushwaha',
    name: 'Kunal Kushwaha',
    handle: '@kunalkushwaha',
    avatarUrl: 'https://avatars.githubusercontent.com/u/42698533?v=4',
    verified: true,
    followers: '~920K YT Subscribers',
    platform: 'YouTube',
    categories: ['Web Dev', 'DSA', 'DevOps'],
    tags: ['Web Dev', 'DSA', 'Career', 'Projects'],
    bio: 'Founder of WeMakeDevs and CNCF Ambassador. Specializes in DevOps, Git, Kubernetes, DSA, and open-source software contributions.',
    featuredSeries: [
      'Full Stack Web Development',
      'DSA Playlist in Java',
      'Developer Career Guide'
    ],
    whyRelevant: 'Helps you strengthen DSA, web dev, Git mastery, and build real open source projects.',
    isFollowing: true,
    roadmapCoverage: {
      'Programming Basics': 'well',
      'DSA': 'well',
      'Web Development': 'well',
      'Backend & APIs': 'well',
      'DevOps / Cloud': 'partial',
      'AI / LLMs': 'none',
      'Projects': 'well',
      'Career Guidance': 'well'
    }
  },
  {
    id: 'fireship',
    name: 'Fireship (Jeff Delaney)',
    handle: '@fireship',
    avatarUrl: 'https://avatars.githubusercontent.com/u/46283607?v=4',
    verified: true,
    followers: '~4.28M YT Subscribers',
    platform: 'YouTube',
    categories: ['Web Dev', 'DevOps', 'AI/ML'],
    tags: ['Web Dev', 'DevOps', 'Cloud', 'AI Tools'],
    bio: 'Creator of the acclaimed "In 100 Seconds" series and Fireship.io. High-velocity architecture breakdowns for modern full-stack web frameworks.',
    featuredSeries: [
      'In 100 Seconds Series',
      'Full Stack Tutorials',
      'Dev Tools & Productivity'
    ],
    whyRelevant: 'Great for quick, practical learning on modern tools, frameworks and DevOps.',
    isFollowing: true,
    roadmapCoverage: {
      'Programming Basics': 'none',
      'DSA': 'none',
      'Web Development': 'well',
      'Backend & APIs': 'well',
      'DevOps / Cloud': 'well',
      'AI / LLMs': 'partial',
      'Projects': 'well',
      'Career Guidance': 'none'
    }
  },
  {
    id: 'hiteshchoudhary',
    name: 'Hitesh Choudhary',
    handle: '@hiteshcodelab',
    avatarUrl: 'https://avatars.githubusercontent.com/u/11613311?v=4',
    verified: true,
    followers: '~1.04M YT Subscribers',
    platform: 'YouTube',
    categories: ['Web Dev', 'Backend', 'DevOps'],
    tags: ['Web Dev', 'DevOps', 'Career', 'Hindi'],
    bio: 'Prominent tech educator and founder of Chai aur Code. Extensive project-based engineering courses covering Python, Full-Stack web dev, and DevOps.',
    featuredSeries: [
      'Complete Web Development',
      'DevOps & Cloud Mastery',
      'Career & Interview Preparation'
    ],
    whyRelevant: 'Covers full stack, DevOps and career prep — aligned directly with your roadmap.',
    isFollowing: true,
    roadmapCoverage: {
      'Programming Basics': 'well',
      'DSA': 'well',
      'Web Development': 'well',
      'Backend & APIs': 'well',
      'DevOps / Cloud': 'well',
      'AI / LLMs': 'none',
      'Projects': 'well',
      'Career Guidance': 'well'
    }
  },
  {
    id: 'theprimeagen',
    name: 'ThePrimeagen',
    handle: '@ThePrimeagen',
    avatarUrl: 'https://avatars.githubusercontent.com/u/4198211?v=4',
    verified: true,
    followers: '~550K YT Subscribers',
    platform: 'YouTube',
    categories: ['DSA', 'Web Dev', 'Career'],
    tags: ['DSA', 'Algorithms', 'Go', 'Rust', 'Neovim'],
    bio: 'Ex-Netflix engineer. Deep dives into high-performance computing, data structures, and software engineering.',
    featuredSeries: [
      "The Last Algorithms Course You'll Need",
      'Full Stack Go & HTMX',
      'Code Reviews & Software Engineering'
    ],
    whyRelevant: 'Essential for DSA, low-level performance, and writing clean, scalable software.',
    isFollowing: true,
    roadmapCoverage: {
      'Programming Basics': 'well',
      'DSA': 'well',
      'Web Development': 'well',
      'Backend & APIs': 'well',
      'DevOps / Cloud': 'partial',
      'AI / LLMs': 'partial',
      'Projects': 'well',
      'Career Guidance': 'well'
    }
  },
  {
    id: 'georgehotz',
    name: 'George Hotz (Geohot)',
    handle: '@geohot',
    avatarUrl: 'https://avatars.githubusercontent.com/u/72895?v=4',
    verified: true,
    followers: '~78K YT Subscribers',
    platform: 'YouTube',
    categories: ['AI/ML', 'Research'],
    tags: ['Deep Learning', 'tinygrad', 'GPU', 'From Scratch'],
    bio: 'Founder of comma.ai and creator of tinygrad. Teaches building neural network frameworks from raw Python and C.',
    featuredSeries: [
      'Programming a Deep Learning Framework',
      'tinygrad Architecture',
      'Open Source Autopilot'
    ],
    whyRelevant: 'The ultimate deep-dive into how GPU tensors, autodiff, and transformer execution graphs actually work.',
    isFollowing: true,
    roadmapCoverage: {
      'Programming Basics': 'well',
      'DSA': 'well',
      'Web Development': 'none',
      'Backend & APIs': 'partial',
      'DevOps / Cloud': 'partial',
      'AI / LLMs': 'well',
      'Projects': 'well',
      'Career Guidance': 'none'
    }
  },
  {
    id: 'rasbt',
    name: 'Sebastian Raschka',
    handle: '@sebastianraschka',
    avatarUrl: 'https://avatars.githubusercontent.com/u/5618407?v=4',
    verified: true,
    followers: '~93K YT Subscribers',
    platform: 'YouTube',
    categories: ['AI/ML', 'Research'],
    tags: ['LLMs', 'PyTorch', 'Research', 'Fine-Tuning'],
    bio: 'Author of Build a Large Language Model From Scratch and Machine Learning Q and AI. PyTorch researcher.',
    featuredSeries: [
      'Build a Large Language Model from Scratch',
      'LoRA and Parameter-Efficient Fine-Tuning',
      'Deep Learning Research Notes'
    ],
    whyRelevant: 'Step-by-step code implementations of attention, multi-head attention, and pretraining in PyTorch.',
    isFollowing: true,
    roadmapCoverage: {
      'Programming Basics': 'partial',
      'DSA': 'partial',
      'Web Development': 'none',
      'Backend & APIs': 'none',
      'DevOps / Cloud': 'none',
      'AI / LLMs': 'well',
      'Projects': 'well',
      'Career Guidance': 'partial'
    }
  },
  {
    id: 'ykilcher',
    name: 'Yannic Kilcher',
    handle: '@yannickilcher',
    avatarUrl: 'https://avatars.githubusercontent.com/u/7464018?v=4',
    verified: true,
    followers: '~331K YT Subscribers',
    platform: 'YouTube',
    categories: ['AI/ML', 'Research'],
    tags: ['Paper Reviews', 'Attention', 'LLMs', 'Research'],
    bio: 'Deep learning researcher explaining ML research papers line by line with mathematical rigor.',
    featuredSeries: [
      'Attention Is All You Need Dissection',
      'State of the Art LLMs',
      'Multimodal AI Architectures'
    ],
    whyRelevant: 'Deepens theoretical understanding of architectures before you write or deploy them.',
    isFollowing: false,
    roadmapCoverage: {
      'Programming Basics': 'none',
      'DSA': 'none',
      'Web Development': 'none',
      'Backend & APIs': 'none',
      'DevOps / Cloud': 'none',
      'AI / LLMs': 'well',
      'Projects': 'partial',
      'Career Guidance': 'none'
    }
  },

];

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Task Manager Backend API',
    description: 'A production-ready REST API built with FastAPI, PostgreSQL, and JWT Authentication with rate limiting.',
    techStack: ['FastAPI', 'PostgreSQL', 'Docker', 'Pytest', 'JWT'],
    status: 'In Progress',
    progress: 75,
    githubUrl: 'https://github.com/majidulla/task-manager-api',
    liveUrl: 'https://task-api.studentos.dev',
    difficulty: 'Beginner Friendly',
    category: 'Backend',
  },
  {
    id: 'proj-2',
    title: 'RAG Knowledge Assistant',
    description: 'Document QA engine using LangChain, OpenAI embeddings, and ChromaDB vector database with hybrid search.',
    techStack: ['Python', 'LangChain', 'OpenAI', 'ChromaDB', 'Streamlit'],
    status: 'In Progress',
    progress: 40,
    githubUrl: 'https://github.com/majidulla/rag-assistant',
    difficulty: 'Intermediate',
    category: 'AI / ML',
  },
  {
    id: 'proj-3',
    title: 'Personal Portfolio & Tech Blog',
    description: 'Ultra fast static site built with React, Tailwind CSS, and Markdown blog engine deployed on Vercel.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    status: 'Completed',
    progress: 100,
    githubUrl: 'https://github.com/majidulla/portfolio',
    liveUrl: 'https://majidulla.dev',
    difficulty: 'Beginner Friendly',
    category: 'Frontend',
  },
  {
    id: 'proj-4',
    title: 'Multi-Agent Code Review Bot',
    description: 'Autonomous GitHub PR reviewer agent using LangGraph and AST parsing to detect bugs and security flaws.',
    techStack: ['LangGraph', 'Python', 'GitHub API', 'FastAPI'],
    status: 'Idea',
    progress: 0,
    difficulty: 'Advanced',
    category: 'AI / ML',
  },
  {
    id: 'proj-5',
    title: 'DevOps CI/CD Pipeline Automation',
    description: 'Automated GitHub Actions pipeline with Docker image build, security scanning (Trivy), and AWS ECS deploy.',
    techStack: ['GitHub Actions', 'Docker', 'AWS ECS', 'Bash'],
    status: 'Idea',
    progress: 0,
    difficulty: 'Intermediate',
    category: 'DevOps',
  }
];

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Junior AI Engineer (Generative AI)',
    company: 'Anthropic Ecosystem Partner',
    companyLogo: 'https://avatars.githubusercontent.com/u/76263028?s=200&v=4',
    location: 'Remote / San Francisco',
    type: 'Full-time',
    experience: '0-2 years',
    salary: '$115,000 - $140,000',
    matchScore: 92,
    isTopMatch: true,
    skillsMatched: ['Python', 'FastAPI', 'Git', 'REST APIs', 'Prompt Engineering'],
    skillsToImprove: ['Vector DBs (Chroma/Pinecone)', 'LangGraph'],
    description: 'Build enterprise RAG pipelines, fine-tune models, and deploy reliable LLM agents for Fortune 500 customers.',
    applyUrl: 'https://jobs.lever.co'
  },
  {
    id: 'job-2',
    title: 'Backend Python Engineer (APIs & Data)',
    company: 'Scale AI',
    companyLogo: 'https://avatars.githubusercontent.com/u/20658428?s=200&v=4',
    location: 'Remote (US/India/EU)',
    type: 'Full-time',
    experience: '1-3 years',
    salary: '$95,000 - $125,000',
    matchScore: 86,
    isTopMatch: false,
    skillsMatched: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git'],
    skillsToImprove: ['Celery / Redis queues', 'Kubernetes'],
    description: 'Scale our high-throughput annotation and model training microservices handling millions of daily inference calls.',
    applyUrl: 'https://scale.com/careers'
  },
  {
    id: 'job-3',
    title: 'Machine Learning & AI Engineering Intern',
    company: 'Perplexity AI',
    companyLogo: 'https://avatars.githubusercontent.com/u/105658826?s=200&v=4',
    location: 'Hybrid / New York',
    type: 'Internship',
    experience: 'Students / Freshers',
    salary: '$50 - $65 / hour',
    matchScore: 89,
    isTopMatch: true,
    skillsMatched: ['Python', 'Git', 'SQL', 'FastAPI'],
    skillsToImprove: ['RAG Architectures', 'PyTorch'],
    description: 'Work directly with research and product engineers on next-generation real-time knowledge retrieval algorithms.',
    applyUrl: 'https://perplexity.ai/careers'
  }
];

export const mockChatHistory = [
  { id: 'c-1', title: 'What should I learn today?', group: 'Today', time: '10:24 AM' },
  { id: 'c-2', title: 'Best RAG resources for me', group: 'Today', time: '09:12 AM' },
  { id: 'c-3', title: 'Review my progress', group: 'Today', time: '08:45 AM' },
  { id: 'c-4', title: 'Give me a project idea', group: 'Today', time: '08:20 AM' },
  { id: 'c-5', title: 'Explain FastAPI authentication', group: 'Yesterday', time: '11:30 PM' },
  { id: 'c-6', title: 'Compare AWS vs GCP for AI', group: 'Yesterday', time: '06:15 PM' },
  { id: 'c-7', title: 'Help me improve my resume', group: 'Yesterday', time: '04:42 PM' },
  { id: 'c-8', title: 'Roadmap for AI Engineer', group: 'Yesterday', time: '01:20 PM' },
  { id: 'c-9', title: 'Best YouTube creators for AI', group: 'Last 7 days', time: 'Sep 12' },
  { id: 'c-10', title: 'How to learn system design?', group: 'Last 7 days', time: 'Sep 11' },
  { id: 'c-11', title: 'Project deployment help', group: 'Last 7 days', time: 'Sep 10' },
  { id: 'c-12', title: 'DSA study plan for interviews', group: 'Last 7 days', time: 'Sep 09' },
];

export const mockInitialMessages: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'assistant',
    timestamp: '10:24 AM',
    text: `Hi Majidulla,
I am your personal AI learning agent. I continuously evaluate your goals, current skills, and roadmap milestones to provide:

• Context-aware study recommendations
• High-signal resources from top engineering creators
• Project architecture & implementation guidance
• Career readiness evaluation & interview prep

What would you like to explore today?`
  },
  {
    id: 'm-2',
    sender: 'user',
    timestamp: '10:25 AM',
    text: 'What should I learn today?'
  },
  {
    id: 'm-3',
    sender: 'assistant',
    timestamp: '10:25 AM',
    toolCalls: [
      {
        toolName: 'get_student_context',
        args: { userId: 'user-1', includeGaps: true, targetRole: 'AI Engineer' },
        resultSummary: 'Loaded student baseline (Python 85%, FastAPI 45%, Target: AI Engineer)',
        executionTimeMs: 42,
        status: 'completed',
        resultPayload: {
          targetRole: 'AI Engineer',
          currentStage: 2,
          proficiencyGap: 'Vector Databases & Similarity Search'
        }
      },
      {
        toolName: 'analyze_skills_gap',
        args: { stage: 2, topic: 'Vector Databases for RAG' },
        resultSummary: 'Identified high-impact bridge from backend to AI engineering',
        executionTimeMs: 128,
        status: 'completed',
        resultPayload: {
          recommendedMilestone: 'ChromaDB & LangChain RAG',
          priority: 'High Impact',
          estimatedHours: 2
        }
      }
    ],
    text: `Based on your profile, current progress, and goal of becoming an AI Engineer, here is what I recommend for today:`,
    richCard: {
      type: 'recommendation',
      title: 'Learn: Vector Databases for RAG',
      subtitle: 'This will help you build a strong foundation for LLM applications.',
      badgeText: 'Recommended for Today',
      tags: [
        { icon: 'clock', label: '1-2 hours' },
        { icon: 'bar-chart', label: 'Intermediate' },
        { icon: 'target', label: 'High Impact' }
      ],
      whyRecommendation: 'Vector databases are the storage backbone of modern AI search. Since you have solid Python and are completing FastAPI, adding vector similarity search (like Chroma or Qdrant) bridges your backend expertise directly into AI engineering.',
      learningResources: [
        {
          title: 'Vector Databases Explained in 10 Minutes (freeCodeCamp)',
          platform: 'YouTube',
          duration: '10 mins',
          url: 'https://youtube.com'
        },
        {
          title: 'Getting Started with ChromaDB and Python',
          platform: 'Documentation',
          duration: '25 mins',
          url: 'https://docs.trychroma.com'
        },
        {
          title: 'Embeddings & Similarity Search Hands-on Notebook',
          platform: 'GitHub',
          duration: '45 mins',
          url: 'https://github.com'
        }
      ],
      nextSteps: [
        '1. Run a local ChromaDB instance with Docker or pip.',
        '2. Generate OpenAI or sentence-transformers embeddings for 5 documents.',
        '3. Query with a sample sentence and inspect semantic similarity scores.',
        '4. Connect this query to your FastAPI CRUD project as a new `/search` endpoint.'
      ]
    }
  }
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-pin',
    authorName: 'Student OS Team',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    timeAgo: 'Pinned Announcement',
    category: 'Announcements',
    title: 'Welcome to Student OS Community: Build in Public and Learn Faster',
    body: 'We believe learning with peers accelerates mastery 3x faster. Join daily study rooms, share your project repos, ask questions on your roadmap hurdles, and attend weekly creator AMAs!',
    hashtags: ['#BuildInPublic', '#StudentOS', '#AIEngineering'],
    likesCount: 184,
    commentsCount: 42,
    sharesCount: 19,
    isPinned: true,
    isLiked: true
  },
  {
    id: 'post-1',
    authorName: 'Rohan Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    timeAgo: '2 hours ago',
    category: 'AI/ML',
    title: 'Built my first RAG app with LangChain and FastAPI! Here is what I learned',
    body: 'Just finished the Stage 4 RAG module on Student OS! The biggest breakthrough was realizing that chunking strategy matters far more than the embedding model choice. Check out my repo and let me know your thoughts!',
    hashtags: ['#RAG', '#FastAPI', '#AI', '#Projects'],
    likesCount: 56,
    commentsCount: 14,
    sharesCount: 6,
    isLiked: false
  },
  {
    id: 'post-2',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    timeAgo: '5 hours ago',
    category: 'DevOps',
    title: 'Dockerizing FastAPI with Poetry and multi-stage builds',
    body: 'Reduced my image size from 1.2GB down to 140MB using alpine and separate builder stages. Saved so much cloud bandwidth on deployment!',
    hashtags: ['#DevOps', '#Docker', '#FastAPI'],
    likesCount: 89,
    commentsCount: 22,
    sharesCount: 11,
    isLiked: true
  }
];

export const mockWeeklyActivity = [
  { day: 'Mon', hours: 2.5, completed: 3 },
  { day: 'Tue', hours: 3.0, completed: 4 },
  { day: 'Wed', hours: 1.5, completed: 2 },
  { day: 'Thu', hours: 4.0, completed: 5 },
  { day: 'Fri', hours: 2.0, completed: 2 },
  { day: 'Sat', hours: 5.5, completed: 7 },
  { day: 'Sun', hours: 3.5, completed: 4 },
];

export const mockAchievements = [
  { id: 'ach-1', title: '10-Day Streak Master', description: 'Learned continuously for 10 consecutive days', icon: 'flame', date: 'Sep 17' },
  { id: 'ach-2', title: 'Backend Pioneer', description: 'Completed first 3 FastAPI backend modules', icon: 'database', date: 'Sep 15' },
  { id: 'ach-3', title: 'Open Source Contributor', description: 'Published 3 repositories to GitHub', icon: 'git-branch', date: 'Sep 10' },
  { id: 'ach-4', title: 'Early Adopter', description: 'Completed personalized Student OS onboarding', icon: 'sparkles', date: 'Sep 01' },
];
