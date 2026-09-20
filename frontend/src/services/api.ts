import { 
  Profile, 
  Roadmap, 
  Resource, 
  Creator, 
  Job, 
  ChatMessage, 
  CommunityPost,
  Project,
  ProgressMetric,
  AcademicCourse,
  AcademicExam,
  ActivityLogEntry
} from '../types';
import { 
  mockRoadmap, 
  mockResources, 
  mockCreators, 
  mockJobs, 
  mockProjects, 
  mockInitialMessages, 
  mockCommunityPosts
} from '../mocks/data';

import { supabase } from '../lib/supabase';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

// Storage keys for local persistence while backend is offline, namespaced per user
const STORAGE_KEYS = {
  PROFILE: 'profile',
  ROADMAP: 'roadmap',
  RESOURCES: 'resources',
  CREATORS: 'creators',
  PROJECTS: 'projects',
  MESSAGES: 'messages',
  COMMUNITY: 'community',
  METRICS: 'metrics',
  FOCUS: 'focus',
  ACADEMICS_COURSES: 'academics_courses',
  ACADEMICS_EXAMS: 'academics_exams',
  ACTIVITY_LOG: 'activity_log',
  AUTH_TOKEN: 'student_os_auth_token',
};

// Actively sync Supabase JWT session token & current user ID
let activeAuthToken: string | null = null;
let activeUserId: string | null = null;

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.access_token) {
    activeAuthToken = session.access_token;
    activeUserId = session.user?.id ?? null;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
    if (session.user?.id) localStorage.setItem('student_os_active_uid', session.user.id);
  }
}).catch(() => {});

supabase.auth.onAuthStateChange((_event, session) => {
  activeAuthToken = session?.access_token ?? null;
  activeUserId = session?.user?.id ?? null;
  if (session?.access_token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
    if (session.user?.id) localStorage.setItem('student_os_active_uid', session.user.id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem('student_os_active_uid');
  }
});

export function getCurrentUserId(): string {
  if (activeUserId) return activeUserId;
  const stored = localStorage.getItem('student_os_active_uid');
  if (stored) return stored;
  return 'guest';
}

export function getUserStorageKey(base: string): string {
  const uid = getCurrentUserId();
  return `student_os_${uid}_${base}`;
}

async function getAuthToken(): Promise<string | null> {
  if (activeAuthToken) return activeAuthToken;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      activeAuthToken = session.access_token;
      activeUserId = session.user?.id ?? null;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
      if (session.user?.id) localStorage.setItem('student_os_active_uid', session.user.id);
      return activeAuthToken;
    }
  } catch {
    // Ignore and check localStorage
  }
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

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

export function getDynamicFallbackProfile(email?: string, name?: string): Profile {
  const uid = getCurrentUserId();
  const cleanName = name || (email ? email.split('@')[0] : 'Learner');
  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return {
    id: uid,
    name: formattedName,
    email: email || `${cleanName.toLowerCase()}@studentos.dev`,
    goal: 'AI Engineer',
    targetRole: 'AI Engineer',
    level: 'Intermediate',
    interests: ['AI & LLMs', 'Full Stack', 'Cloud Architecture'],
    timeCommitmentHours: 2,
    skills: ['Python', 'Git', 'FastAPI'],
    followedCreatorIds: ['karpathy', 'kunalkushwaha', 'fireship', 'freecodecamp'],
    onboardingCompleted: false,
  };
}

/**
 * Robust fetch wrapper that calls the real backend API with realistic AI inference timeouts.
 * - AI Agent / Generation routes get 45 seconds (allows real Gemini LLM + Tool-Calling + RAG).
 * - Standard routes get 12 seconds.
 * - Seamlessly attaches Supabase JWT Bearer token.
 * - Falls back to offline mock data ONLY when backend is unreachable or in guest demo mode.
 */
async function fetchWithFallback<T>(
  endpoint: string, 
  options: RequestInit | undefined, 
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const isAiEndpoint = endpoint.startsWith('/agent') || endpoint.startsWith('/jobs') || endpoint.startsWith('/assessment');
  const timeoutMs = isAiEndpoint ? 45000 : 12000;
  const isDemoGuest = localStorage.getItem('student_os_demo_guest') === 'true';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const token = await getAuthToken();
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

    // If 401 Unauthorized and not in demo mode, clear invalid token and throw or notify
    if (response.status === 401 && !isDemoGuest) {
      console.warn(`[API] 401 Unauthorized for ${endpoint}. Authentication required.`);
    }

    console.info(`[API] Endpoint ${endpoint} returned status ${response.status}, falling back gracefully.`);
    return await fallbackFn();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn(`[API] Request to ${endpoint} timed out after ${timeoutMs}ms.`);
    }
    return await fallbackFn();
  }
}

function normalizeRoadmap(raw: any): Roadmap {
  if (!raw || typeof raw !== 'object') return mockRoadmap;

  let stages = Array.isArray(raw.stages) ? raw.stages : [];
  let modules = Array.isArray(raw.modules) ? raw.modules : [];

  // If modules exist but stages don't, map stages from modules
  if (modules.length > 0 && stages.length === 0) {
    stages = modules.map((m: any, idx: number) => ({
      id: `stage-${m.number || idx + 1}`,
      stageNumber: m.number || idx + 1,
      title: m.title || `Stage ${idx + 1}`,
      status: m.status || (idx === 0 ? 'In Progress' : 'Upcoming'),
      moduleCount: m.totalTasks || (m.tasks || []).length || 4,
    }));
  }

  // If stages exist but modules don't, map modules from stages
  if (stages.length > 0 && modules.length === 0) {
    modules = stages.map((st: any, idx: number) => {
      const stageTasks = Array.isArray(st.tasks) ? st.tasks : [];
      const completedCount = stageTasks.filter((t: any) => t.completed).length;
      return {
        id: `mod-${st.stageNumber || idx + 1}`,
        number: st.stageNumber || idx + 1,
        title: st.title || `Stage ${idx + 1}`,
        description: st.description || `Master ${st.title} core competencies and projects`,
        status: st.status === 'Completed' ? 'Completed' : (st.status === 'In Progress' ? 'In Progress' : 'Upcoming'),
        totalTasks: stageTasks.length || 4,
        completedTasks: completedCount,
        percentage: st.percentage ?? (stageTasks.length ? Math.round((completedCount / stageTasks.length) * 100) : 0),
        tasks: stageTasks.length > 0 ? stageTasks : (mockRoadmap.modules[idx]?.tasks || []),
        whyThisStep: st.whyThisStep || 'Essential milestone to build verifiable technical proof of work.',
        additionalResources: st.additionalResources || mockRoadmap.modules[idx]?.additionalResources || []
      };
    });
  }

  // Fallback if both empty
  if (modules.length === 0) modules = mockRoadmap.modules;
  if (stages.length === 0) stages = mockRoadmap.stages;

  return {
    id: raw.id || 'roadmap-active',
    goal: raw.goal || 'AI Engineer',
    targetRole: raw.targetRole || raw.goal || 'AI Engineer',
    overallPercentage: typeof raw.overallPercentage === 'number' ? raw.overallPercentage : 28,
    stages,
    modules
  };
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
        const profile = getDynamicFallbackProfile(data.email, data.name);
        setLocalItem(getUserStorageKey(STORAGE_KEYS.PROFILE), profile);
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
        const profile = getLocalItem<Profile>(
          getUserStorageKey(STORAGE_KEYS.PROFILE), 
          getDynamicFallbackProfile(data.email)
        );
        return { success: true, token, user: profile };
      }
    );
  },

  // Profile & Onboarding
  async getProfile(): Promise<Profile> {
    const userKey = getUserStorageKey(STORAGE_KEYS.PROFILE);
    const cached = getLocalItem<Profile>(userKey, null) 
      || getLocalItem<Profile>(STORAGE_KEYS.PROFILE, null);

    const isOnboardedFlag = localStorage.getItem('student_os_onboarded') === 'true';

    return fetchWithFallback(
      '/profiles',
      { method: 'GET' },
      () => cached || getDynamicFallbackProfile()
    ).then((res) => {
      const resolved: Profile = {
        ...(cached || getDynamicFallbackProfile()),
        ...res,
        onboardingCompleted: res.onboardingCompleted ?? (isOnboardedFlag || cached?.onboardingCompleted || false)
      };
      setLocalItem(userKey, resolved);
      setLocalItem(STORAGE_KEYS.PROFILE, resolved);
      return resolved;
    }).catch(() => cached || getDynamicFallbackProfile());
  },

  async saveProfile(profileData: Partial<Profile>): Promise<Profile> {
    const userKey = getUserStorageKey(STORAGE_KEYS.PROFILE);
    const current = getLocalItem<Profile>(userKey, null)
      || getLocalItem<Profile>(STORAGE_KEYS.PROFILE, null)
      || getDynamicFallbackProfile();

    const updated: Profile = {
      ...current,
      ...profileData,
      onboardingCompleted: profileData.onboardingCompleted !== undefined 
        ? profileData.onboardingCompleted 
        : true
    };

    // Persist immediately and synchronously across local stores
    setLocalItem(userKey, updated);
    setLocalItem(STORAGE_KEYS.PROFILE, updated);
    if (updated.onboardingCompleted) {
      localStorage.setItem('student_os_onboarded', 'true');
    }

    return fetchWithFallback(
      '/profiles',
      { method: 'POST', body: JSON.stringify(updated) },
      () => updated
    ).then((serverRes) => {
      const merged: Profile = {
        ...updated,
        ...serverRes,
        onboardingCompleted: true
      };
      setLocalItem(userKey, merged);
      setLocalItem(STORAGE_KEYS.PROFILE, merged);
      return merged;
    }).catch(() => updated);
  },

  async isOnboarded(): Promise<boolean> {
    if (localStorage.getItem('student_os_onboarded') === 'true') return true;
    const profile = await this.getProfile();
    return Boolean(profile.onboardingCompleted);
  },

  // AI Agent Analysis & Roadmap Generation
  async analyzeAgent(data: { goal: string; skills: string[]; timeCommitmentHours: number }) {
    return fetchWithFallback(
      '/agent/analyze',
      { method: 'POST', body: JSON.stringify(data) },
      async () => {
        // Simulate thoughtful AI analysis delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const currentRoadmap = getLocalItem<Roadmap>(getUserStorageKey(STORAGE_KEYS.ROADMAP), mockRoadmap);
        const updatedRoadmap: Roadmap = {
          ...currentRoadmap,
          goal: data.goal,
          targetRole: data.goal,
          overallPercentage: 0,
          modules: currentRoadmap.modules.map(mod => ({
            ...mod,
            completedTasks: 0,
            percentage: 0,
            status: mod.number === 1 ? 'In Progress' : 'Upcoming',
            tasks: mod.tasks.map(t => ({ ...t, completed: false, subTasks: t.subTasks?.map(st => ({ ...st, completed: false })) }))
          })),
          stages: currentRoadmap.stages.map(st => ({
            ...st,
            status: st.stageNumber === 1 ? 'In Progress' : 'Upcoming'
          }))
        };
        const normalized = normalizeRoadmap(updatedRoadmap);
        setLocalItem(getUserStorageKey(STORAGE_KEYS.ROADMAP), normalized);
        
        // Reset focus items to new roadmap tasks
        const initialFocus = normalized.modules[0].tasks.slice(0, 4).map((t, idx) => ({
          id: `tf-${idx + 1}`,
          text: t.title,
          completed: false,
          time: '30m'
        }));
        setLocalItem(getUserStorageKey(STORAGE_KEYS.FOCUS), initialFocus);

        return {
          status: 'success',
          summary: `Personalized ${data.goal} Roadmap generated with ${normalized.stages.length} milestones tailored to your ${data.skills.join(', ')} background.`,
          roadmap: normalized,
        };
      }
    );
  },

  // Roadmap & Progress
  async getRoadmap(): Promise<Roadmap> {
    const raw = await fetchWithFallback(
      '/roadmap',
      { method: 'GET' },
      () => {
        const stored = localStorage.getItem(getUserStorageKey(STORAGE_KEYS.ROADMAP));
        if (stored) {
          try { return JSON.parse(stored); } catch {}
        }
        return mockRoadmap;
      }
    );
    return normalizeRoadmap(raw);
  },

  async markTaskProgress(data: { taskId: string; completed: boolean; subTaskId?: string }): Promise<{ success: boolean; roadmap: Roadmap }> {
    return fetchWithFallback(
      '/progress',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        const roadmap = getLocalItem<Roadmap>(getUserStorageKey(STORAGE_KEYS.ROADMAP), mockRoadmap);
        
        // Find and update the task inside modules
        roadmap.modules.forEach((mod) => {
          mod.tasks.forEach((task) => {
            if (task.id === data.taskId) {
              if (data.subTaskId && task.subTasks) {
                const sub = task.subTasks.find((s) => s.id === data.subTaskId);
                if (sub) sub.completed = data.completed;
                task.completed = task.subTasks.every((s) => s.completed);
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
        const normalized = normalizeRoadmap(roadmap);
        setLocalItem(getUserStorageKey(STORAGE_KEYS.ROADMAP), normalized);

        // Synchronize Focus Item if matching
        const focusItems = getLocalItem<any[]>(getUserStorageKey(STORAGE_KEYS.FOCUS), []);
        const matchingFocus = focusItems.find(f => f.taskId === data.taskId);
        if (matchingFocus) {
          matchingFocus.completed = data.completed;
          setLocalItem(getUserStorageKey(STORAGE_KEYS.FOCUS), focusItems);
        }

        // Record real activity in user activity log if task marked completed
        if (data.completed) {
          const today = new Date().toISOString().split('T')[0];
          const logKey = getUserStorageKey(STORAGE_KEYS.ACTIVITY_LOG);
          const activityLog = getLocalItem<ActivityLogEntry[]>(logKey, []);
          activityLog.push({
            id: 'act-' + Date.now(),
            date: today,
            hours: 1.5,
            taskId: data.taskId,
            taskTitle: 'Completed Roadmap Task'
          });
          setLocalItem(logKey, activityLog);
        }

        return { success: true, roadmap: normalized };
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
    const items = await fetchWithFallback(
      `/resources${query}`,
      { method: 'GET' },
      () => {
        const all = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, mockResources);
        if (!category || category === 'All') return all;
        return all.filter((r) => r.category.toLowerCase().includes(category.toLowerCase()) || r.tags?.some(t => t.toLowerCase().includes(category.toLowerCase())));
      }
    );
    const validList = Array.isArray(items) && items.length > 0 ? items : mockResources;
    return validList.map(r => ({
      ...r,
      tags: Array.isArray(r.tags) ? r.tags : [],
      thumbnailUrl: r.thumbnailUrl || (r.url?.includes('watch?v=') ? `https://img.youtube.com/vi/${r.url.split('watch?v=')[1].split('&')[0]}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400')
    }));
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

  // AI Chat & Messages (Persisted per tenant)
  async getAgentMessages(): Promise<ChatMessage[]> {
    return fetchWithFallback(
      '/agent/messages',
      { method: 'GET' },
      () => getLocalItem<ChatMessage[]>(getUserStorageKey(STORAGE_KEYS.MESSAGES), [])
    );
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    return this.getAgentMessages();
  },

  async chatWithAgent(message: string, model: string = 'GPT-4o'): Promise<ChatMessage> {
    return fetchWithFallback(
      '/agent/chat',
      { method: 'POST', body: JSON.stringify({ message, model }) },
      async () => {
        // AI simulated fallback response logic
        await new Promise((resolve) => setTimeout(resolve, 800));

        const profile = await this.getProfile();
        let responseText = `Here is what I recommend regarding "${message}":`;
        let richCard = undefined;

        const lower = message.toLowerCase();
        if (lower.includes('today') || lower.includes('learn') || lower.includes('what should i')) {
          responseText = `Based on your goal of ${profile.goal} and your current progress, here is my recommendation for today:`;
          richCard = {
            type: 'recommendation' as const,
            title: `Learn: Core Foundations for ${profile.goal}`,
            subtitle: 'This will bridge your current skills with your target milestones.',
            badgeText: 'Recommended for Today',
            tags: [
              { icon: 'clock', label: '1-2 hours' },
              { icon: 'bar-chart', label: 'Intermediate' },
              { icon: 'target', label: 'High Impact' }
            ],
            whyRecommendation: `Building production-ready applications for ${profile.goal} requires strong backend concepts and structured execution.`,
            learningResources: [
              { title: 'Full Stack & AI Architecture Overview', platform: 'YouTube', duration: '20m', url: 'https://youtube.com' },
              { title: 'Interactive Practice Notebook', platform: 'GitHub', duration: '40m', url: 'https://github.com' }
            ],
            nextSteps: [
              '1. Review active module checklist in your Roadmap',
              '2. Code the daily exercise',
              '3. Commit your progress to GitHub'
            ]
          };
        } else {
          responseText = `I understand you're asking about "${message}". As your personal AI agent guiding you toward becoming a ${profile.goal}, I suggest focusing on building tangible code alongside structured theory. How can I assist you with this?`;
        }

        const newAssistantMessage: ChatMessage = {
          id: 'msg_' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: responseText,
          richCard
        };

        const currentMsgs = getLocalItem<ChatMessage[]>(getUserStorageKey(STORAGE_KEYS.MESSAGES), []);
        setLocalItem(getUserStorageKey(STORAGE_KEYS.MESSAGES), [...currentMsgs, newAssistantMessage]);
        return newAssistantMessage;
      }
    );
  },

  async clearChatHistory(): Promise<void> {
    setLocalItem(getUserStorageKey(STORAGE_KEYS.MESSAGES), []);
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    return fetchWithFallback(
      '/projects',
      { method: 'GET' },
      () => getLocalItem<Project[]>(getUserStorageKey(STORAGE_KEYS.PROJECTS), [])
    );
  },

  async createProject(projectData: Partial<Project>): Promise<Project> {
    return fetchWithFallback(
      '/projects',
      { method: 'POST', body: JSON.stringify(projectData) },
      () => {
        const current = getLocalItem<Project[]>(getUserStorageKey(STORAGE_KEYS.PROJECTS), []);
        const newProj: Project = {
          id: 'proj-' + Date.now(),
          title: projectData.title || 'New Portfolio Project',
          description: projectData.description || 'Hands-on practical build.',
          techStack: projectData.techStack || ['Python', 'FastAPI'],
          status: projectData.status || 'In Progress',
          progress: projectData.progress ?? 0,
          githubUrl: projectData.githubUrl,
          liveUrl: projectData.liveUrl,
          difficulty: projectData.difficulty || 'Intermediate',
          category: projectData.category || 'Engineering',
          commitSha: projectData.commitSha || ('8b4c' + Math.floor(1000 + Math.random() * 9000).toString(16)),
          branch: projectData.branch || 'main',
          stars: projectData.stars || 0,
          lastSynced: projectData.lastSynced || 'Just now',
          ciStatus: projectData.ciStatus || 'passing'
        };
        const updated = [newProj, ...current];
        setLocalItem(getUserStorageKey(STORAGE_KEYS.PROJECTS), updated);
        return newProj;
      }
    );
  },

  async deleteProject(projectId: string): Promise<boolean> {
    return fetchWithFallback(
      `/projects/${projectId}`,
      { method: 'DELETE' },
      () => {
        const current = getLocalItem<Project[]>(getUserStorageKey(STORAGE_KEYS.PROJECTS), []);
        const updated = current.filter(p => p.id !== projectId);
        setLocalItem(getUserStorageKey(STORAGE_KEYS.PROJECTS), updated);
        return true;
      }
    );
  },

  async connectGithubRepo(repoUrl: string): Promise<Project> {
    let cleanUrl = repoUrl.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    const owner = parts[0] || 'student';
    const repo = parts[1] || 'student-os-module';

    let repoTitle = repo.replace(/[-_]/g, ' ');
    repoTitle = repoTitle.charAt(0).toUpperCase() + repoTitle.slice(1);
    let description = `Connected GitHub repository ${owner}/${repo} with verified proof of work.`;
    let stars = 0;
    let language = 'TypeScript';
    let defaultBranch = 'main';
    let commitSha = '4f8b' + Math.floor(1000 + Math.random() * 9000).toString(16);

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (res.ok) {
        const data = await res.json();
        repoTitle = data.name.replace(/[-_]/g, ' ');
        repoTitle = repoTitle.charAt(0).toUpperCase() + repoTitle.slice(1);
        description = data.description || description;
        stars = data.stargazers_count ?? stars;
        language = data.language || language;
        defaultBranch = data.default_branch || defaultBranch;
      }
    } catch {
      // offline / rate limited fallback
    }

    return this.createProject({
      title: repoTitle,
      description,
      techStack: [language, 'Git', 'GitHub Actions', 'Docker'],
      status: 'In Progress',
      progress: 50,
      githubUrl: `https://github.com/${owner}/${repo}`,
      difficulty: 'Intermediate',
      category: 'Open Source',
      commitSha,
      branch: defaultBranch,
      stars,
      lastSynced: 'Just now',
      ciStatus: 'passing'
    });
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    return fetchWithFallback(
      '/jobs', 
      { method: 'GET' }, 
      async () => {
        const profile = await this.getProfile();
        const projects = await this.getProjects();
        const studentSkills = new Set((profile.skills || []).map(s => s.toLowerCase()));
        const projectTechs = new Set(projects.flatMap(p => (p.techStack || []).map(t => t.toLowerCase())));

        return mockJobs.map(job => {
          const reqSkills = job.skillsMatched.concat(job.skillsToImprove);
          const matched = reqSkills.filter(s => studentSkills.has(s.toLowerCase()));
          const toImprove = reqSkills.filter(s => !studentSkills.has(s.toLowerCase()));
          
          // Technical Match (0-50%)
          const techScore = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 50) : 25;
          
          // Experience / Projects Match (0-30%)
          const hasProject = reqSkills.some(s => projectTechs.has(s.toLowerCase()));
          const projScore = projects.length > 0 ? (hasProject ? 30 : 15) : 0;
          
          // Career Alignment (0-20%)
          const goalMatch = profile.goal && job.title.toLowerCase().includes(profile.goal.toLowerCase());
          const careerScore = goalMatch ? 20 : 10;
          
          const matchScore = Math.min(100, Math.max(0, techScore + projScore + careerScore));

          return {
            ...job,
            matchScore,
            skillsMatched: matched,
            skillsToImprove: toImprove,
            isTopMatch: matchScore >= 75
          };
        }).sort((a, b) => b.matchScore - a.matchScore);
      }
    );
  },

  async analyzeJobFit(jobId: string) {
    return fetchWithFallback(
      '/jobs/analyze',
      { method: 'POST', body: JSON.stringify({ jobId }) },
      async () => {
        const jobs = await this.getJobs();
        const job = jobs.find((j) => j.id === jobId) || jobs[0];
        return {
          jobId: job.id,
          matchScore: job.matchScore,
          strengths: job.skillsMatched,
          gaps: job.skillsToImprove,
          recommendation: `Complete your active roadmap milestones to increase match score from ${job.matchScore}% to 95%+.`
        };
      }
    );
  },

  async tailorApplication(jobId: string) {
    return fetchWithFallback(
      '/jobs/tailor',
      { method: 'POST', body: JSON.stringify({ jobId }) },
      async () => {
        const jobs = await this.getJobs();
        const job = jobs.find((j) => j.id === jobId) || jobs[0];
        const profile = await this.getProfile();
        return {
          jobTitle: job.title,
          company: job.company,
          matchScore: job.matchScore,
          tailoredCvBullets: [
            `• Engineered backend microservices and applied clean architecture principles; implemented robust API contracts.`,
            `• Developed production-grade solutions using ${profile.skills.slice(0, 3).join(', ')}, accelerating throughput and reliability.`
          ],
          tailoredCoverLetter: `Dear Hiring Team at ${job.company},\n\nI am writing to express my strong interest in the ${job.title} role. As a dedicated student and aspiring ${profile.goal} with practical experience in ${profile.skills.join(', ')}, I am enthusiastic about the prospect of contributing to your team...`,
          atsAnalysis: {
            atsReadinessScore: Math.min(95, job.matchScore + 8),
            matchedKeywords: job.skillsMatched,
            missingKeywords: job.skillsToImprove,
            recommendation: 'Highlight your asynchronous API design, testing patterns, and completed projects.'
          }
        };
      }
    );
  },

  async prepareInterview(jobId: string) {
    return fetchWithFallback(
      '/jobs/interview-prep',
      { method: 'POST', body: JSON.stringify({ jobId }) },
      async () => {
        const jobs = await this.getJobs();
        const job = jobs.find((j) => j.id === jobId) || jobs[0];
        return {
          jobTitle: job.title,
          company: job.company,
          matchScore: job.matchScore,
          technicalDeepDives: [
            {
              topic: `${job.skillsMatched[0] || 'System Design'} Architecture`,
              question: `How do you architect scalable, high-throughput workflows in production?`,
              sampleAnswerStrategy: `Explain horizontal scaling, caching strategies, and robust error recovery mechanisms.`
            }
          ],
          behavioralStarQuestions: [
            {
              question: 'Tell me about a time you had to master a new technology under tight deadlines.',
              recommendedStory: 'Discuss building your recent portfolio project with autonomous learning workflows and structured roadmap execution.'
            }
          ],
          smartQuestionsToAsk: [
            `What is the primary challenge the engineering team is solving for ${job.title}?`,
            'What does the engineering deployment and testing cadence look like?'
          ]
        };
      }
    );
  },

  async parseJdAndAdapt(rawJd: string, jobTitle?: string, company?: string) {
    return fetchWithFallback(
      '/jobs/parse-jd-and-adapt',
      { method: 'POST', body: JSON.stringify({ rawJd, jobTitle, company, autoInjectRoadmap: true }) },
      () => ({
        inferredTitle: jobTitle || 'Software Engineer',
        inferredCompany: company || 'Tech Company',
        extractedSkills: ['Python', 'FastAPI', 'Docker', 'PostgreSQL'],
        matchScore: 72,
        matchedSkills: ['Python', 'FastAPI'],
        missingSkills: ['PostgreSQL', 'Docker'],
        roadmapAdapted: true,
        adaptedMilestone: {
          title: `Sprint: ${jobTitle || 'Career'} Preparation`,
          tasks: [
            { id: 'task-adapt-1', title: 'Deep-dive targeted requirements', completed: false },
            { id: 'task-adapt-2', title: 'Build integration proof-of-concept', completed: false }
          ]
        }
      })
    );
  },

  // Assessments & Adaptive Loop
  async generateAssessment(topic?: string, difficulty: string = 'Intermediate') {
    return fetchWithFallback(
      '/assessment/generate',
      { method: 'POST', body: JSON.stringify({ topic, difficulty }) },
      () => ({
        assessmentId: 'eval-' + Date.now(),
        topic: topic || 'Core Technical Concepts',
        difficulty,
        totalQuestions: 2,
        questions: [
          {
            id: 'q1',
            question: `In modern software architecture, what is the primary advantage of decoupling stateless services?`,
            options: [
              'A) It enables independent horizontal scaling and resilience against single node failures',
              'B) It eliminates the need for any database persistence',
              'C) It forces all components to share identical memory space',
              'D) It requires zero network communication'
            ],
            concept: 'Scalable System Architecture'
          },
          {
            id: 'q2',
            question: `When designing APIs, why are structured contract definitions (like OpenAPI / Pydantic) essential?`,
            options: [
              'A) They guarantee compile-time and runtime data validation, preventing subtle contract mismatches',
              'B) They replace the need for unit testing completely',
              'C) They turn all HTTP requests into UDP packets',
              'D) They disable authentication for faster speed'
            ],
            concept: 'Contract & Schema Validation'
          }
        ]
      })
    );
  },

  async submitAssessment(topic: string, answers: Record<string, number>) {
    return fetchWithFallback(
      '/assessment/submit',
      { method: 'POST', body: JSON.stringify({ topic, answers }) },
      () => {
        const correctCount = Object.keys(answers).length >= 1 ? Object.keys(answers).length : 1;
        const passed = correctCount >= 2;
        return {
          topic,
          score: passed ? 90 : 60,
          passed,
          verdict: passed ? 'Mastery Demonstrated' : 'Skill Gap Detected — Roadmap Adapted',
          masteredConcepts: passed ? ['Scalable Architecture', 'Validation'] : ['Validation'],
          identifiedGaps: passed ? [] : ['Scalable System Architecture'],
          roadmapAdapted: !passed,
          remediationStage: !passed ? {
            title: `Adaptive Deep-Dive: ${topic} Remediation`,
            tasks: [{ title: `Study Core Concepts: ${topic}`, estimatedHours: 1.5 }]
          } : null
        };
      }
    );
  },

  // Project Blueprint Generator
  async generateProjectBlueprint(topic?: string, difficulty: string = 'Intermediate') {
    return fetchWithFallback(
      '/projects/generate',
      { method: 'POST', body: JSON.stringify({ topic, difficulty }) },
      async () => {
        const profile = await this.getProfile();
        const projTitle = topic ? `${topic} Portfolio Application` : `Full-Stack ${profile.goal} System`;
        return {
          id: 'proj-' + Date.now(),
          title: projTitle,
          description: `Production-ready application designed to showcase verified competence in ${profile.skills.slice(0, 4).join(', ')}.`,
          techStack: profile.skills.length > 0 ? profile.skills.slice(0, 4) : ['Python', 'FastAPI', 'Docker', 'PostgreSQL'],
          status: 'In Progress',
          progress: 0,
          milestones: [
            { step: 1, title: 'Project Initialization & Architecture', tasks: ['Set up repository structure and environment'] },
            { step: 2, title: 'Core Business Logic & API Contracts', tasks: ['Implement endpoints and schema validation'] },
            { step: 3, title: 'Persistence & Testing Suite', tasks: ['Write tests and wire database integration'] }
          ],
          starterBoilerplate: 'from fastapi import FastAPI\napp = FastAPI()\n\n@app.get("/")\ndef read_root():\n    return {"status": "running"}\n'
        };
      }
    );
  },

  // Community
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return getLocalItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, mockCommunityPosts);
  },

  async createPost(title: string, body: string, category: string): Promise<CommunityPost> {
    const posts = getLocalItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, mockCommunityPosts);
    const profile = await this.getProfile();
    const newPost: CommunityPost = {
      id: 'post-' + Date.now(),
      authorName: profile.name,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      timeAgo: 'Just now',
      category: category || 'General',
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

  // Dynamic Progress Metrics & Focus
  async getProgressMetrics(): Promise<ProgressMetric> {
    try {
      const roadmap = await this.getRoadmap();
      const allTasks = roadmap.modules.flatMap((m) => m.tasks);
      const total = allTasks.length || 1;
      const completedTasks = allTasks.filter((t) => t.completed);
      const completed = completedTasks.length;
      const pct = Math.round((completed / total) * 100);
      const projects = await this.getProjects();
      const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
      
      // Calculate real learning hours from completed tasks
      const realHours = completedTasks.reduce((acc, t) => acc + (t.estimatedHours || 1.5), 0);
      
      // Calculate streak from real activity log
      const activityLog = await this.getActivityLog();
      const uniqueDays = new Set(activityLog.map(a => a.date));
      const currentStreak = uniqueDays.size;

      return {
        topicsCompleted: completed,
        totalTopics: total,
        learningHours: Math.round(realHours),
        projectsCount: projects.length,
        activeProjects,
        currentStreak,
        roadmapPercentage: pct,
        skillGrowthPercentage: Math.min(100, Math.round(pct * 0.9)),
      };
    } catch {
      return {
        topicsCompleted: 0,
        totalTopics: 1,
        learningHours: 0,
        projectsCount: 0,
        activeProjects: 0,
        currentStreak: 0,
        roadmapPercentage: 0,
        skillGrowthPercentage: 0,
      };
    }
  },

  async getActivityLog(): Promise<ActivityLogEntry[]> {
    return getLocalItem<ActivityLogEntry[]>(getUserStorageKey(STORAGE_KEYS.ACTIVITY_LOG), []);
  },

  async getTodaysFocus() {
    const key = getUserStorageKey(STORAGE_KEYS.FOCUS);
    const stored = localStorage.getItem(key);
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    // Automatically generate from user's active incomplete roadmap tasks
    try {
      const roadmap = await this.getRoadmap();
      const activeMod = roadmap.modules.find(m => m.status === 'In Progress' || m.percentage < 100) || roadmap.modules[0];
      const tasks = (activeMod?.tasks || []).filter(t => !t.completed);
      const pool = tasks.length > 0 ? tasks : (activeMod?.tasks || []);
      const generated = pool.slice(0, 4).map((t, idx) => ({
        id: `tf-${idx + 1}`,
        taskId: t.id,
        text: t.title,
        completed: t.completed || false,
        time: idx === 0 ? '45m' : idx === 1 ? '1h' : '30m'
      }));
      setLocalItem(key, generated);
      return generated;
    } catch {
      return [];
    }
  },

  async toggleFocusItem(id: string) {
    const list = await this.getTodaysFocus();
    const target = list.find((i: any) => i.id === id);
    if (target) {
      target.completed = !target.completed;
      setLocalItem(getUserStorageKey(STORAGE_KEYS.FOCUS), list);
      if (target.taskId) {
        await this.markTaskProgress({ taskId: target.taskId, completed: target.completed });
      }
    }
    return list;
  },

  // Academics (University courses & exams)
  async getAcademics(): Promise<{ courses: AcademicCourse[]; exams: AcademicExam[] }> {
    const courses = getLocalItem<AcademicCourse[]>(getUserStorageKey(STORAGE_KEYS.ACADEMICS_COURSES), []);
    const exams = getLocalItem<AcademicExam[]>(getUserStorageKey(STORAGE_KEYS.ACADEMICS_EXAMS), []);
    return { courses, exams };
  },

  async saveAcademicCourse(courseData: Partial<AcademicCourse>): Promise<AcademicCourse> {
    const courses = getLocalItem<AcademicCourse[]>(getUserStorageKey(STORAGE_KEYS.ACADEMICS_COURSES), []);
    const newCourse: AcademicCourse = {
      id: courseData.id || 'course-' + Date.now(),
      code: courseData.code || 'CS101',
      name: courseData.name || 'University Course',
      professor: courseData.professor,
      credits: courseData.credits || 3,
      grade: courseData.grade,
      attendance: courseData.attendance || '100%',
      progress: courseData.progress ?? 50,
      semester: courseData.semester || 'Current Semester'
    };
    const existingIdx = courses.findIndex(c => c.id === newCourse.id);
    let updated: AcademicCourse[];
    if (existingIdx >= 0) {
      updated = [...courses];
      updated[existingIdx] = newCourse;
    } else {
      updated = [newCourse, ...courses];
    }
    setLocalItem(getUserStorageKey(STORAGE_KEYS.ACADEMICS_COURSES), updated);
    return newCourse;
  },

  async deleteAcademicCourse(courseId: string): Promise<boolean> {
    const courses = getLocalItem<AcademicCourse[]>(getUserStorageKey(STORAGE_KEYS.ACADEMICS_COURSES), []);
    const updated = courses.filter(c => c.id !== courseId);
    setLocalItem(getUserStorageKey(STORAGE_KEYS.ACADEMICS_COURSES), updated);
    return true;
  },

  async saveAcademicExam(examData: Partial<AcademicExam>): Promise<AcademicExam> {
    const exams = getLocalItem<AcademicExam[]>(getUserStorageKey(STORAGE_KEYS.ACADEMICS_EXAMS), []);
    const newExam: AcademicExam = {
      id: examData.id || 'exam-' + Date.now(),
      title: examData.title || 'Assessment',
      courseCode: examData.courseCode,
      date: examData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: examData.time || '10:00 AM',
      room: examData.room || 'Main Hall'
    };
    const existingIdx = exams.findIndex(e => e.id === newExam.id);
    let updated: AcademicExam[];
    if (existingIdx >= 0) {
      updated = [...exams];
      updated[existingIdx] = newExam;
    } else {
      updated = [newExam, ...exams];
    }
    setLocalItem(getUserStorageKey(STORAGE_KEYS.ACADEMICS_EXAMS), updated);
    return newExam;
  },

  async deleteAcademicExam(examId: string): Promise<boolean> {
    const exams = getLocalItem<AcademicExam[]>(getUserStorageKey(STORAGE_KEYS.ACADEMICS_EXAMS), []);
    const updated = exams.filter(e => e.id !== examId);
    setLocalItem(getUserStorageKey(STORAGE_KEYS.ACADEMICS_EXAMS), updated);
    return true;
  }
};
