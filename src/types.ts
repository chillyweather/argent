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
  globalShortcut: string;
  alwaysOnTop: boolean;
  hideAfterSave: boolean;
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
