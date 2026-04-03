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
  lastUpdated: number;
}

export interface RecentNote {
  name: string;
  path: string;
  url: string;
  lastModified: number;
}

export interface SaveResult {
  path: string;
  url: string;
}

export interface RecentNotesResult {
  notes: RecentNote[];
}
