# Reader

一个本地优先的 Web 电子书阅读器，按 `IMPLEMENTATION_PLAN.md` 实施，目标是接近 iOS Apple Books 的阅读体验。

## 已落地能力（当前阶段）

- 多格式导入：`EPUB` / `MOBI` / `TXT`
- 统一解析服务：`src/services/*Parser.ts`
- 书库页：导入、过滤、排序、卡片展示
- 阅读页：章节阅读、目录、书签、进度条
- 阅读设置：主题（浅色/深色/米色）、字号、行高、版心
- 本地持久化：`IndexedDB`（书库、阅读偏好、阅读进度）

## 技术栈

- `React + TypeScript + Vite`
- `react-router-dom`
- `zustand`
- `epubjs`
- `idb-keyval`
- `vitest + testing-library`

## 启动方式

```bash
npm install
npm run dev
```

## 验证命令

```bash
npm run test
npm run build
```

## 原子修改策略

项目采用“原子修改策略”，详见：`docs/ATOMIC_CHANGE_STRATEGY.md`。
