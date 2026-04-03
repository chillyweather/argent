export function formatPath(path: string): string {
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace('.md', '');
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
