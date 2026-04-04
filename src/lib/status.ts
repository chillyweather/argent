import { AppStatus } from '../types';

export function getStatusColor(status: AppStatus): string {
  switch (status) {
    case 'Offline':
    case 'Auth Error':
    case 'Server Error':
    case 'Config Missing':
      return 'bg-red-400';
    default:
      return '';
  }
}

export function getStatusText(status: AppStatus): string {
  switch (status) {
    case 'Ready':
      return 'Ready';
    case 'Saving':
      return 'Saving...';
    case 'Saved':
      return 'Saved';
    case 'Offline':
      return 'Offline';
    case 'Auth Error':
      return 'Auth Failed';
    case 'Server Error':
      return 'Server Error';
    case 'Config Missing':
      return 'Config Missing';
    default:
      return status;
  }
}

export function parseErrorStatus(error: string): AppStatus {
  if (error.includes('Network error')) {
    return 'Offline';
  }
  if (error.includes('Auth') || error.includes('Unauthorized')) {
    return 'Auth Error';
  }
  if (error.includes('Configuration missing')) {
    return 'Config Missing';
  }
  return 'Server Error';
}
