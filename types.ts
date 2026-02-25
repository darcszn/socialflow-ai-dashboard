export enum View {
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  CALENDAR = 'CALENDAR',
  CREATE_POST = 'CREATE_POST',
  MEDIA_LIBRARY = 'MEDIA_LIBRARY',
  INBOX = 'INBOX',
  SETTINGS = 'SETTINGS',
  DEBUG_TOOLS = 'DEBUG_TOOLS'
}

export interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

export interface ViewProps {
  onNavigate: (view: View) => void;
}

export interface Post {
  id: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'linkedin' | 'x';
  content: string;
  image?: string;
  date: Date;
  status: 'scheduled' | 'published' | 'draft';
  stats?: {
    likes: number;
    views: number;
  };
}

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  platform: 'instagram' | 'facebook' | 'x';
  user: string;
  avatar: string;
  lastMessage: string;
  unread: boolean;
  status: 'new' | 'pending' | 'resolved';
  messages: Message[];
}

export enum Platform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  FACEBOOK = 'facebook',
  YOUTUBE = 'youtube',
  LINKEDIN = 'linkedin',
  X = 'x'
}

export interface Transaction {
  id: string;
  type: 'post' | 'comment' | 'like' | 'share' | 'follow' | 'message' | 'campaign' | 'payment';
  platform: Platform;
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  metadata: {
    userId: string;
    amount?: number;
    [key: string]: any;
  };
  isNew?: boolean;
}

export interface NetworkRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

export interface ContractExecution {
  id: string;
  contractAddress: string;
  method: string;
  parameters: any[];
  gasUsed: number;
  gasLimit: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  logs: ContractLog[];
}

export interface ContractLog {
  id: string;
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
    preferences: Record<string, any>;
  };
  posts: Post[];
  conversations: Conversation[];
  transactions: Transaction[];
  networkRequests: NetworkRequest[];
  contractExecutions: ContractExecution[];
  settings: Record<string, any>;
}

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}