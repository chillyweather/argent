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
  livePreviewEnabled: boolean;
}

export interface Draft {
  content: string;
}
