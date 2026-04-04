export type AppStatus = 
  | 'Ready' 
  | 'Saving' 
  | 'Saved' 
  | 'Offline' 
  | 'Auth Error' 
  | 'Server Error' 
  | 'Config Missing';

export interface Settings {
  sbUrl: string;
  sbToken: string;
  alwaysOnTop: boolean;
  vimEnabled: boolean;
}

export interface Draft {
  content: string;
}

export interface RecentNote {
  name: string;
  path: string;
  url: string;
  lastModified: number;
}
