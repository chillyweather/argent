export function formatPath(path: string): string {
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace('.md', '');
}
