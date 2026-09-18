export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  headline?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  goal: string;
  targetRole: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  interests: string[];
  timeCommitmentHours: number;
  skills: string[];
  followedCreatorIds: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 0 to 100
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface RoadmapTask {
  id: string;
  title: string;
  description?: string;
  type: 'Theory' | 'Hands-on' | 'Project' | 'Security';
  level: 'Basics' | 'Core' | 'Project Setup' | 'Auth' | 'Database' | 'Full Build';
  estimatedHours: number;
  completed: boolean;
  inProgress?: boolean;
  subTasks?: SubTask[];
  dependencies?: string[];
  resourcesCount?: number;
}

export interface RoadmapModule {
  id: string;
  number: number;
  title: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  tasks: RoadmapTask[];
  whyThisStep?: string;
  aiSuggestion?: {
    text: string;
    nextTaskId: string;
    nextTaskTitle: string;
  };
  recommendedProject?: {
    id: string;
    title: string;
    description: string;
    badge: string;
  };
  additionalResources?: {
    id: string;
    title: string;
    platform: 'YouTube' | 'Documentation' | 'GitHub' | 'Notion' | 'Course';
    duration?: string;
    url: string;
  }[];
}

export interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  status: 'Completed' | 'In Progress' | 'Next' | 'Upcoming';
  moduleCount?: number;
}

export interface Roadmap {
  id: string;
  goal: string;
  targetRole: string;
  overallPercentage: number;
  stages: RoadmapStage[];
  modules: RoadmapModule[];
}

export type ResourcePlatform = 'YouTube Video' | 'Course (free)' | 'Course' | 'Article' | 'GitHub Repository' | 'Documentation';
export type ResourceCategory = 'All' | 'AI / ML' | 'Backend' | 'DevOps' | 'DSA' | 'Frontend' | 'Career' | 'Tools' | 'System Design';

export interface Resource {
  id: string;
  title: string;
  platform: ResourcePlatform;
  creator: string;
  creatorAvatar?: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  saved?: boolean;
  url: string;
  stars?: string;
  readTime?: string;
  rating?: number;
}

export interface CreatorCoverageItem {
  topic: string;
  status: 'well' | 'partial' | 'none';
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  verified: boolean;
  followers: string;
  platform: 'YouTube' | 'X/Twitter' | 'GitHub' | 'Web';
  categories: string[];
  tags: string[];
  bio: string;
  featuredSeries: string[];
  whyRelevant: string;
  isFollowing: boolean;
  roadmapCoverage: Record<string, 'well' | 'partial' | 'none'>;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: 'Completed' | 'In Progress' | 'Idea';
  progress: number;
  githubUrl?: string;
  liveUrl?: string;
  difficulty: 'Beginner Friendly' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnailUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract' | 'Remote';
  experience: string;
  salary: string;
  matchScore: number;
  isTopMatch?: boolean;
  skillsMatched: string[];
  skillsToImprove: string[];
  description: string;
  applyUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  richCard?: {
    type: 'recommendation';
    title: string;
    subtitle: string;
    badgeText: string;
    tags: { icon: string; label: string }[];
    whyRecommendation: string;
    learningResources: {
      title: string;
      platform: string;
      duration: string;
      url: string;
    }[];
    nextSteps: string[];
  };
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  category: string;
  title: string;
  body: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPinned?: boolean;
  isLiked?: boolean;
}

export interface ProgressMetric {
  topicsCompleted: number;
  totalTopics: number;
  learningHours: number;
  projectsCount: number;
  activeProjects: number;
  currentStreak: number;
  roadmapPercentage: number;
  skillGrowthPercentage: number;
}
