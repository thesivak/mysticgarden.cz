import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function hasMarkdownPosts(directory = './src/content/blog'): boolean {
  if (!existsSync(directory)) return false;

  return readdirSync(directory, { withFileTypes: true }).some((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return hasMarkdownPosts(path);
    return entry.isFile() && entry.name.endsWith('.md');
  });
}
