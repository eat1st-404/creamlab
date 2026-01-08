import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// 1. 引入 PostHog 库
import posthog from 'posthog-js';

// 2. 初始化 (我已经帮你填好了截图里的 Key 和 Host)
// 这样你不需要去 Cloudflare 设置任何环境变量，上传就能用
posthog.init('phc_tMPOzuk75LgqKYRVtGsLfXuXOE6ropIrxOpBXLaoB3R', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only', 
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
