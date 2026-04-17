export type AppStatus = 
  | 'Ready' 
  | 'Saving' 
  | 'Saved' 
  | 'Offline' 
  | 'Auth Error' 
  | 'Server Error' 
  | 'Config Missing';

export type AppMode = 'scratchpad' | 'todo';

export type Theme = 'light' | 'dark' | 'nord' | 'system';

export interface Settings {
  sbUrl: string;
  sbToken: string;
  alwaysOnTop: boolean;
  vimEnabled: boolean;
  livePreviewEnabled: boolean;
  theme: Theme;
  mode: AppMode;
}

export interface Draft {
  content: string;
}
