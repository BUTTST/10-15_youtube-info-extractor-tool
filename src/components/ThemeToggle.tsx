import { useTheme } from '../contexts/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-700"
    >
      {theme === 'dark' ? '切換為亮色' : '切換為暗色'}
    </button>
  );
}
