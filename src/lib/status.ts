import { AppStatus } from '../types';

export function getStatusColor(status: AppStatus): string {
  switch (status) {
    case 'Ready':
      return 'bg-gray-400';
    case 'Saving':
      return 'bg-blue-400';
    case 'Saved':
      return 'bg-green-400';
    case 'Offline':
      return 'bg-orange-400';
    case 'Auth Error':
      return 'bg-red-400';
    case 'Server Error':
      return 'bg-red-400';
    case 'Config Missing':
      return 'bg-yellow-400';
    default:
      return 'bg-gray-400';
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
