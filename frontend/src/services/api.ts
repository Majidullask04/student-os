import { 
  Profile, 
  Roadmap, 
  Resource, 
  Creator, 
  Job, 
  ChatMessage, 
  CommunityPost,
  Project,
  ProgressMetric
} from '../types';
import { 
  mockProfile, 
  mockRoadmap, 
  mockResources, 
  mockCreators, 
  mockJobs, 
  mockProjects, 
  mockInitialMessages, 
  mockCommunityPosts,
  mockMetrics,
  mockTodaysFocus
} from '../mocks/data';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Storage keys for local persistence while backend is offline
const STORAGE_KEYS = {
  PROFILE: 'student_os_profile',
  ROADMAP: 'student_os_roadmap',
  RESOURCES: 'student_os_resources',
  CREATORS: 'student_os_creators',
  PROJECTS: 'student_os_projects',
  MESSAGES: 'student_os_messages',
  COMMUNITY: 'student_os_community',
  METRICS: 'student_os_metrics',
  FOCUS: 'student_os_focus',
  AUTH_TOKEN: 'student_os_auth_token',
};

// Helper to get or initialize local storage
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

/**
 * Robust fetch wrapper that gracefully attempts the real backend API,
 * and seamlessly falls back to mock data if the backend is unavailable.
 */
async function fetchWithFallback<T>(
  endpoint: string, 
  options: RequestInit | undefined, 
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    // Attempt real backend call with a short timeout to prevent UI hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
    console.info(`[API] Endpoint ${endpoint} returned ${response.status}, falling back to mock.`);
    return await fallbackFn();
  } catch (err) {
    // Backend is not running or unreachable: silently and smoothly use fallback
    // console.info(`[API] Backend offline at ${url}. Using seeded mock data.`);
    return await fallbackFn();
  }
}

export const api = {
  // Authentication
  async signup(data: { email: string; password: string; name: string }) {
    return fetchWithFallback(
      '/auth/signup',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        const token = 'mock_jwt_token_' + Date.now();
        setLocalItem(STORAGE_KEYS.AUTH_TOKEN, token);
        const profile = { ...mockProfile, name: data.name || mockProfile.name, email: data.email };
        setLocalItem(STORAGE_KEYS.PROFILE, profile);
        return { success: true, token, user: profile };
      }
    );
  },

  async login(data: { email: string; password: string }) {
    return fetchWithFallback(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        const token = 'mock_jwt_token_' + Date.now();
        setLocalItem(STORAGE_KEYS.AUTH_TOKEN, token);
        const profile = getLocalItem(STORAGE_KEYS.PROFILE, mockProfile);
        return { success: true, token, user: profile };
      }
    );
  },

  // Profile & Onboarding
  async getProfile(): Promise<Profile> {
    return fetchWithFallback(
      '/profiles',
      { method: 'GET' },
      () => getLocalItem<Profile>(STORAGE_KEYS.PROFILE, mockProfile)
    );
  },

  async saveProfile(profileData: Partial<Profile>): Promise<Profile> {
    return fetchWithFallback(
      '/profiles',
      { method: 'POST', body: JSON.stringify(profileData) },
      () => {
        const current = getLocalItem<Profile>(STORAGE_KEYS.PROFILE, mockProfile);
        const updated = { ...current, ...profileData };
        setLocalItem(STORAGE_KEYS.PROFILE, updated);
        return updated;
      }
    );
  },

  // AI Agent Analysis & Roadmap Generation
  async analyzeAgent(data: { goal: string; skills: string[]; timeCommitmentHours: number }) {
    return fetchWithFallback(
      '/agent/analyze',
      { method: 'POST', body: JSON.stringify(data) },
      async () => {
        // Simulate thoughtful AI analysis delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const roadmap = getLocalItem<Roadmap>(STORAGE_KEYS.ROADMAP, mockRoadmap);
        roadmap.goal = data.goal;
        roadmap.targetRole = data.goal;
        setLocalItem(STORAGE_KEYS.ROADMAP, roadmap);
        return {
          status: 'success',
          summary: `Personalized ${data.goal} Roadmap generated with ${roadmap.stages.length} milestones and tailored learning paths.`,
          roadmap,
        };
      }
    );
  },

  // Roadmap & Progress
  async getRoadmap(): Promise<Roadmap> {
    return fetchWithFallback(
      '/roadmap',
      { method: 'GET' },
      () => getLocalItem<Roadmap>(STORAGE_KEYS.ROADMAP, mockRoadmap)
    );
  },

  async markTaskProgress(data: { taskId: string; completed: boolean; subTaskId?: string }): Promise<{ success: boolean; roadmap: Roadmap }> {
    return fetchWithFallback(
      '/progress',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        const roadmap = getLocalItem<Roadmap>(STORAGE_KEYS.ROADMAP, mockRoadmap);
        
        // Find and update the task inside modules
        let found = false;
        roadmap.modules.forEach((mod) => {
          mod.tasks.forEach((task) => {
            if (task.id === data.taskId) {
              found = true;
              if (data.subTaskId && task.subTasks) {
                const sub = task.subTasks.find((s) => s.id === data.subTaskId);
                if (sub) sub.completed = data.completed;
                // If all subtasks are done, mark task done
                const allSubDone = task.subTasks.every((s) => s.completed);
                task.completed = allSubDone;
              } else {
                task.completed = data.completed;
                if (task.subTasks) {
                  task.subTasks.forEach((s) => (s.completed = data.completed));
                }
              }
            }
          });

          // Recalculate module metrics
          const completedCount = mod.tasks.filter((t) => t.completed).length;
          mod.completedTasks = completedCount;
          mod.percentage = Math.round((completedCount / (mod.totalTasks || 1)) * 100);
          if (mod.percentage === 100) mod.status = 'Completed';
          else if (mod.percentage > 0) mod.status = 'In Progress';
        });

        // Update overall roadmap percentage
        const totalCompleted = roadmap.modules.reduce((acc, m) => acc + m.completedTasks, 0);
        const totalTasks = roadmap.modules.reduce((acc, m) => acc + m.totalTasks, 0);
        roadmap.overallPercentage = Math.round((totalCompleted / (totalTasks || 1)) * 100);

        setLocalItem(STORAGE_KEYS.ROADMAP, roadmap);

        // Also update metrics
        const metrics = getLocalItem<ProgressMetric>(STORAGE_KEYS.METRICS, mockMetrics);
        metrics.topicsCompleted = totalCompleted;
        metrics.roadmapPercentage = roadmap.overallPercentage;
        setLocalItem(STORAGE_KEYS.METRICS, metrics);

        return { success: true, roadmap };
      }
    );
  },

  // Resources
  async getRecommendedResources(): Promise<Resource[]> {
    return fetchWithFallback(
      '/resources/recommended',
      { method: 'GET' },
      () => getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, mockResources).filter((r) => r.rating && r.rating >= 4.8)
    );
  },

  async getResources(category?: string): Promise<Resource[]> {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return fetchWithFallback(
      `/resources${query}`,
      { method: 'GET' },
      () => {
        const all = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, mockResources);
        if (!category || category === 'All') return all;
        return all.filter((r) => r.category.toLowerCase().includes(category.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(category.toLowerCase())));
      }
    );
  },

  async toggleSaveResource(resourceId: string): Promise<boolean> {
    const list = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, mockResources);
    const target = list.find((r) => r.id === resourceId);
    let newState = false;
    if (target) {
      target.saved = !target.saved;
      newState = target.saved;
      setLocalItem(STORAGE_KEYS.RESOURCES, list);
    }
    return newState;
  },

  // Creators
  async getCreators(): Promise<Creator[]> {
    return fetchWithFallback(
      '/creators',
      { method: 'GET' },
      () => getLocalItem<Creator[]>(STORAGE_KEYS.CREATORS, mockCreators)
    );
  },

  async toggleFollowCreator(creatorId: string): Promise<{ success: boolean; isFollowing: boolean }> {
    return fetchWithFallback(
      '/creators/follow',
      { method: 'POST', body: JSON.stringify({ creatorId }) },
      () => {
        const list = getLocalItem<Creator[]>(STORAGE_KEYS.CREATORS, mockCreators);
        const target = list.find((c) => c.id === creatorId);
        let isFollowing = false;
        if (target) {
          target.isFollowing = !target.isFollowing;
          isFollowing = target.isFollowing;
          setLocalItem(STORAGE_KEYS.CREATORS, list);
        }
        return { success: true, isFollowing };
      }
    );
  },

  // AI Chat & Assistant
  async getChatHistory(): Promise<ChatMessage[]> {
    return getLocalItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, mockInitialMessages);
  },

  async chatWithAgent(message: string, model: string = 'GPT-4o'): Promise<ChatMessage> {
    return fetchWithFallback(
      '/agent/chat',
      { method: 'POST', body: JSON.stringify({ message, model }) },
      async () => {
        // AI simulated response logic
        await new Promise((resolve) => setTimeout(resolve, 800));

        let responseText = `Here is what I recommend regarding "${message}":`;
        let richCard = undefined;

        const lower = message.toLowerCase();
        if (lower.includes('today') || lower.includes('learn') || lower.includes('what should i')) {
          responseText = "Based on your profile, current progress, and goal of becoming an AI Engineer, here's what I recommend for today:";
          richCard = {
            type: 'recommendation' as const,
            title: 'Learn: Vector Databases for RAG',
            subtitle: 'This will help you build a strong foundation for LLM applications.',
            badgeText: 'Recommended for Today',
            tags: [
              { icon: 'clock', label: '1-2 hours' },
              { icon: 'bar-chart', label: 'Intermediate' },
              { icon: 'target', label: 'High Impact' }
            ],
            whyRecommendation: 'Vector databases are the key memory component of production AI systems. By completing this next, you bridge your FastAPI backend skills with semantic vector retrieval.',
            learningResources: [
              { title: 'Vector Databases in 10 Minutes (freeCodeCamp)', platform: 'YouTube', duration: '10m', url: 'https://youtube.com' },
              { title: 'ChromaDB Python Quickstart', platform: 'Docs', duration: '20m', url: 'https://trychroma.com' },
              { title: 'Vector Similarity Search Jupyter Notebook', platform: 'GitHub', duration: '40m', url: 'https://github.com' }
            ],
            nextSteps: [
              '1. Install chromadb and sentence-transformers',
              '2. Create a collection with 5 chunked documents',
              '3. Test nearest-neighbor semantic search',
              '4. Wire into your FastAPI backend endpoints'
            ]
          };
        } else if (lower.includes('rag') || lower.includes('resource')) {
          responseText = "Here are the top-rated RAG resources matching your current skill level:";
          richCard = {
            type: 'recommendation' as const,
            title: 'Mastering RAG: From Basics to Advanced Chunking',
            subtitle: 'Curated deep-dives from Andrej Karpathy and freeCodeCamp.',
            badgeText: 'Top Pick for RAG',
            tags: [
              { icon: 'clock', label: '2-3 hours' },
              { icon: 'bar-chart', label: 'Intermediate' },
              { icon: 'target', label: 'Core AI Skill' }
            ],
            whyRecommendation: 'RAG allows LLMs to query custom internal documentation without expensive model fine-tuning.',
            learningResources: [
              { title: 'Build a Complete RAG App with LangChain (codebasics)', platform: 'YouTube', duration: '1h 12m', url: 'https://youtube.com' },
              { title: 'Practical Guide to Building AI Agents (OpenAI)', platform: 'Article', duration: '15m', url: 'https://openai.com' }
            ],
            nextSteps: [
              '1. Understand chunking strategies (fixed-size vs semantic)',
              '2. Compare dense vs sparse retrieval (BM25 vs embeddings)',
              '3. Implement reranking using Cohere or Cross-Encoders'
            ]
          };
        } else if (lower.includes('project') || lower.includes('idea')) {
          responseText = "Here is a high-impact project tailored for your current progress:";
          richCard = {
            type: 'recommendation' as const,
            title: 'Project: AI Knowledge Assistant with FastAPI & Chroma',
            subtitle: 'A portfolio-defining full-stack AI system.',
            badgeText: 'Portfolio Booster',
            tags: [
              { icon: 'clock', label: '4-6 hours' },
              { icon: 'bar-chart', label: 'Hands-on Build' },
              { icon: 'target', label: 'Top Resume Match' }
            ],
            whyRecommendation: 'Recruiters want to see that you can connect backend APIs with AI embeddings and provide clean response streaming.',
            learningResources: [
              { title: 'FastAPI Backend Architecture Guide', platform: 'Docs', duration: '30m', url: 'https://fastapi.tiangolo.com' },
              { title: 'ChromaDB Local Deployment', platform: 'GitHub', duration: '20m', url: 'https://github.com' }
            ],
            nextSteps: [
              '1. Clone your Task Manager backend',
              '2. Add `/ingest` and `/chat` endpoints',
              '3. Push to GitHub with a high quality README'
            ]
          };
        } else {
          responseText = `I understand you're asking about "${message}". As your AI study agent for your AI Engineer goal, I suggest focusing on building tangible code alongside structured theory. What part would you like to explore deeper?`;
        }

        const newAssistantMessage: ChatMessage = {
          id: 'msg_' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: responseText,
          richCard
        };

        const currentMsgs = getLocalItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, mockInitialMessages);
        setLocalItem(STORAGE_KEYS.MESSAGES, [...currentMsgs, newAssistantMessage]);
        return newAssistantMessage;
      }
    );
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    return getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, mockProjects);
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    return fetchWithFallback('/jobs', { method: 'GET' }, () => mockJobs);
  },

  async analyzeJobFit(jobId: string) {
    return fetchWithFallback(
      '/jobs/analyze',
      { method: 'POST', body: JSON.stringify({ jobId }) },
      () => {
        const job = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
        return {
          jobId: job.id,
          matchScore: job.matchScore,
          strengths: job.skillsMatched,
          gaps: job.skillsToImprove,
          recommendation: `Complete Stage 4 (RAG) and Stage 5 (AI Agents) to increase match score from ${job.matchScore}% to 98%.`
        };
      }
    );
  },

  async tailorApplication(jobId: string) {
    return fetchWithFallback(
      '/jobs/tailor',
      { method: 'POST', body: JSON.stringify({ jobId }) },
      () => ({
        jobTitle: 'Junior AI Engineer',
        company: 'Cognitive Scale AI',
        matchScore: 83,
        tailoredCvBullets: [
          '• Engineered FastAPI Microservice with JWT Auth using Python, FastAPI, PostgreSQL, Docker; implemented structured API contracts aligned with production standards.',
          '• Built CLI Document Summarizer with Gemini API and local caching; accelerated text summarization throughput.'
        ],
        tailoredCoverLetter: 'Dear Hiring Team at Cognitive Scale AI,\n\nI am writing to express my strong interest in the Junior AI Engineer role. As an aspiring AI Engineer with hands-on experience building FastAPI microservices and LLM document processing pipelines, I am eager to contribute to your engineering team...',
        atsAnalysis: {
          atsReadinessScore: 88,
          matchedKeywords: ['Python', 'FastAPI', 'Docker', 'PostgreSQL'],
          missingKeywords: ['RAG', 'Vector Databases'],
          recommendation: 'Highlight your asynchronous API design and schema validation projects in your summary.'
        }
      })
    );
  },

  async prepareInterview(jobId: string) {
    return fetchWithFallback(
      '/jobs/interview-prep',
      { method: 'POST', body: JSON.stringify({ jobId }) },
      () => ({
        jobTitle: 'Junior AI Engineer',
        company: 'Cognitive Scale AI',
        matchScore: 83,
        technicalDeepDives: [
          {
            topic: 'Vector Search & RAG Latency',
            question: 'How do you handle vector search latency and chunking strategies when building RAG pipelines?',
            sampleAnswerStrategy: 'Explain chunking tradeoffs (256 vs 512 tokens with 10% overlap), approximate nearest neighbors (HNSW), and caching frequent query embeddings.'
          },
          {
            topic: 'FastAPI Concurrency',
            question: 'How does FastAPI handle asynchronous requests with async def vs regular def routes with database calls?',
            sampleAnswerStrategy: 'Clarify threadpool delegation for blocking sync def vs native event-loop execution for async def.'
          }
        ],
        behavioralStarQuestions: [
          {
            question: 'Tell me about a time you solved a difficult backend architectural bug.',
            recommendedStory: 'Discuss building FastAPI Microservice with JWT Auth. Situation: async database queries were blocking. Task: optimize connection pooling. Action: configured async SQLAlchemy engine. Result: 60% latency reduction.'
          }
        ],
        smartQuestionsToAsk: [
          'What does the current LLM evaluation and regression testing pipeline look like at Cognitive Scale AI?',
          'How do you balance latency vs model accuracy in production agent workflows?'
        ]
      })
    );
  },

  // Community
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return getLocalItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, mockCommunityPosts);
  },

  async createPost(title: string, body: string, category: string): Promise<CommunityPost> {
    const posts = getLocalItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, mockCommunityPosts);
    const newPost: CommunityPost = {
      id: 'post-' + Date.now(),
      authorName: mockProfile.name,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      timeAgo: 'Just now',
      category: category || 'AI/ML',
      title,
      body,
      hashtags: ['#StudentOS', '#' + (category || 'Learning').replace(/[^a-zA-Z]/g, '')],
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true
    };
    const updated = [newPost, ...posts];
    setLocalItem(STORAGE_KEYS.COMMUNITY, updated);
    return newPost;
  },

  async toggleLikePost(postId: string): Promise<boolean> {
    const posts = getLocalItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, mockCommunityPosts);
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likesCount += post.isLiked ? 1 : -1;
      setLocalItem(STORAGE_KEYS.COMMUNITY, posts);
      return post.isLiked;
    }
    return false;
  },

  // Progress metrics & Focus
  async getProgressMetrics(): Promise<ProgressMetric> {
    return getLocalItem<ProgressMetric>(STORAGE_KEYS.METRICS, mockMetrics);
  },

  async getTodaysFocus() {
    return getLocalItem(STORAGE_KEYS.FOCUS, mockTodaysFocus);
  },

  async toggleFocusItem(id: string) {
    const list = getLocalItem(STORAGE_KEYS.FOCUS, mockTodaysFocus);
    const target = list.find((i: any) => i.id === id);
    if (target) {
      target.completed = !target.completed;
      setLocalItem(STORAGE_KEYS.FOCUS, list);
    }
    return list;
  }
};
