# 📖 Reader 项目实施计划

## 一、深度调研总结

### 1.1 技术生态调研

#### EPUB 解析方案
| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| **epub.js** | 成熟稳定、功能丰富、社区活跃 | 渲染基于 iframe、性能一般 | ⭐⭐⭐⭐⭐ |
| **react-reader** | React 封装、开箱即用 | 灵活性受限、自定义样式困难 | ⭐⭐⭐⭐ |
| **foliate-js** | 现代化、多格式支持 | 较新、文档少 | ⭐⭐⭐ |

**决策**: 使用 `epub.js` 作为核心引擎，直接集成获得最大灵活性，参考 `react-reader` 的封装模式自行封装 React 组件。

#### MOBI 解析方案
| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| **mobi.js** | 浏览器端运行、开源 | 功能有限 | ⭐⭐⭐⭐ |
| **@colibri-hq/mobi** | 元数据提取全面、类型支持好 | 需要额外渲染层 | ⭐⭐⭐⭐ |
| **@lingo-reader/mobi-parser** | API 设计清晰、章节级解析 | 社区较小 | ⭐⭐⭐ |

**决策**: 使用 `mobi.js` 进行基础解析 + 自定义渲染层，结合 `@colibri-hq/mobi` 提取元数据和封面。

#### TXT 解析方案
- 使用原生 `FileReader` API
- 编码检测使用 `encoding-japanese` 或 `chardet` 库
- 自动章节分割算法（基于正则匹配章节标题）

#### 开源阅读器参考
- **Koodo Reader**: 功能全面、多平台、多格式，但 UI 偏重功能而非美感
- **Readest**: 现代化设计、跨平台、OPDS 支持
- **Flow**: PWA 架构、EPUB 专注、Typography 优秀

### 1.2 iOS Apple Books 设计分析

#### 核心设计语言
1. **Liquid Glass / 毛玻璃效果**
   - 导航栏使用 `backdrop-filter: blur(20px) saturate(180%)`
   - 半透明背景 `rgba(255,255,255,0.72)` / `rgba(28,28,30,0.85)`
   - 工具栏浮于内容之上，产生层次感

2. **内容优先 (Content First)**
   - 阅读界面极简，隐藏所有 UI
   - 点击屏幕中央唤出工具栏
   - 工具栏自动隐藏

3. **书库展示**
   - 书籍封面带有微妙阴影和立体效果
   - 网格布局，不同宽高比的封面
   - 封面下方显示书名和作者
   - 滑动切换 "正在阅读" / "想读" / "已读完"

4. **阅读体验**
   - 翻页动画: Curl（3D翻页）/ Fast Fade / Scroll
   - 主题: 白色、浅色（米色）、灰色、深灰、纯黑
   - 字体可选择多种 serif/sans-serif
   - 进度条显示在底部
   - 亮度调节集成在设置面板

5. **微动效**
   - 页面切换: 300ms ease-out 过渡
   - 封面缩放: 点击封面时放大进入阅读
   - 弹性滚动效果
   - 书签添加动画

6. **排版细节**
   - 两端对齐
   - 段首缩进 2em
   - 页面边距: 水平 24px-48px，垂直 40px-60px
   - 页眉显示章节标题，页脚显示页码

---

## 二、5人 Agent 团队规划

### 🏗 团队架构

```
                    ┌─────────────────┐
                    │   Agent #1      │
                    │   项目架构师    │
                    │  (Architect)    │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
   ┌────────▼────────┐ ┌────▼────────┐ ┌─────▼───────────┐
   │   Agent #2      │ │  Agent #3   │ │   Agent #4       │
   │   核心引擎师    │ │  UI/UX设计  │ │   功能模块师     │
   │ (Core Engine)   │ │  (Designer) │ │ (Features Dev)   │
   └─────────────────┘ └─────────────┘ └──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Agent #5      │
                    │   测试与优化    │
                    │  (QA/Perf)      │
                    └─────────────────┘
```

### Agent #1: 项目架构师 (Architect)
**职责:**
- 搭建项目脚手架（Vite + React + TypeScript）
- 配置路由系统、状态管理、构建工具
- 定义全局类型、接口和常量
- 设计模块间通信契约
- 配置路径别名和开发工具链

**产出物:**
- `vite.config.ts` 配置
- `tsconfig.json` 配置
- 路由配置 (`App.tsx`)
- 全局类型定义 (`types/`)
- 状态管理 store (`store/`)
- 项目基础文件结构

---

### Agent #2: 核心引擎师 (Core Engine Developer)
**职责:**
- 集成 epub.js 并封装为 React 组件
- 实现 MOBI 文件解析和渲染
- 实现 TXT 文件解析和智能分章
- 统一的文件解析接口 (Adapter Pattern)
- 阅读进度持久化 (IndexedDB)
- 书籍元数据提取

**产出物:**
- `services/epubParser.ts` — EPUB 解析服务
- `services/mobiParser.ts` — MOBI 解析服务
- `services/txtParser.ts` — TXT 解析服务
- `services/bookService.ts` — 统一书籍服务接口
- `services/storageService.ts` — 存储服务
- `hooks/useBookParser.ts` — 文件解析 Hook
- `hooks/useReadingProgress.ts` — 阅读进度 Hook

---

### Agent #3: UI/UX 设计师 (UI/UX Designer)
**职责:**
- 实现 iOS Apple Books 风格的 CSS 设计系统
- 构建基础 UI 组件库
- 实现亮色/暗色/墨水屏三种主题
- 毛玻璃效果和微动效
- 响应式布局设计
- 字体排版系统

**产出物:**
- `styles/variables.css` — CSS 变量和设计 token
- `styles/reset.css` — CSS 重置
- `styles/themes.css` — 主题定义
- `styles/animations.css` — 动画定义
- `components/ui/Button.tsx` — 按钮组件
- `components/ui/Slider.tsx` — 滑块组件
- `components/ui/Modal.tsx` — 模态框组件
- `components/ui/BottomSheet.tsx` — 底部弹出面板
- `components/ui/SegmentedControl.tsx` — 分段控制器
- `components/ui/Switch.tsx` — 开关组件

---

### Agent #4: 功能模块开发师 (Features Developer)
**职责:**
- 书库页面（网格/列表视图、排序筛选）
- 阅读器页面（翻页、进度、手势）
- 设置面板（字体、主题、排版参数）
- 目录和书签系统
- 搜索功能
- 文件导入（拖拽 + 文件选择）

**产出物:**
- `features/library/` — 书库模块
  - `LibraryPage.tsx` — 书库主页
  - `BookCard.tsx` — 书籍卡片
  - `BookGrid.tsx` — 网格布局
  - `ImportZone.tsx` — 文件导入区域
- `features/reader/` — 阅读器模块
  - `ReaderPage.tsx` — 阅读主页
  - `ReaderToolbar.tsx` — 工具栏
  - `PageTurner.tsx` — 翻页控制
  - `ProgressBar.tsx` — 进度条
- `features/settings/` — 设置模块
  - `SettingsPanel.tsx` — 设置面板
  - `ThemePicker.tsx` — 主题选择
  - `FontSettings.tsx` — 字体设置
- `features/toc/` — 目录模块
  - `TableOfContents.tsx` — 目录组件
  - `BookmarkList.tsx` — 书签列表

---

### Agent #5: 测试与优化工程师 (QA & Performance)
**职责:**
- 功能测试和问题修复
- 大文件性能优化
- 内存管理优化
- 浏览器兼容性测试
- 可访问性 (a11y) 检查
- 最终 UI 打磨和细节优化

**产出物:**
- 修复后的代码
- 性能优化方案
- 浏览器兼容性报告

---

## 三、分阶段开发计划

### Phase 1: 基础设施搭建 🏗
**负责人**: Agent #1 (架构师) + Agent #3 (设计师)

| 任务 | 优先级 | 预计时间 |
|------|--------|----------|
| Vite + React + TS 项目初始化 | P0 | 10 min |
| 安装核心依赖 | P0 | 5 min |
| 配置路由系统 | P0 | 10 min |
| CSS 设计系统创建 | P0 | 20 min |
| 全局类型定义 | P0 | 10 min |
| Zustand store 搭建 | P0 | 15 min |

### Phase 2: 核心引擎开发 ⚙️
**负责人**: Agent #2 (核心引擎)

| 任务 | 优先级 | 预计时间 |
|------|--------|----------|
| EPUB 解析器集成 | P0 | 30 min |
| TXT 解析器实现 | P0 | 20 min |
| MOBI 解析器集成 | P1 | 25 min |
| 统一解析接口 | P0 | 15 min |
| IndexedDB 存储服务 | P1 | 20 min |
| 阅读进度管理 | P1 | 15 min |

### Phase 3: UI 组件开发 🎨
**负责人**: Agent #3 (设计师)

| 任务 | 优先级 | 预计时间 |
|------|--------|----------|
| 基础 UI 组件库 | P0 | 30 min |
| 毛玻璃导航栏 | P0 | 15 min |
| 亮色/暗色主题切换 | P0 | 20 min |
| 微动效和过渡动画 | P1 | 20 min |
| 书籍封面 3D 效果 | P2 | 15 min |

### Phase 4: 功能页面开发 📚
**负责人**: Agent #4 (功能模块) + Agent #2 (核心引擎)

| 任务 | 优先级 | 预计时间 |
|------|--------|----------|
| 书库页面 | P0 | 30 min |
| 文件导入功能 | P0 | 20 min |
| 阅读器页面 | P0 | 40 min |
| 设置面板 | P1 | 25 min |
| 目录和书签 | P1 | 25 min |
| 搜索功能 | P2 | 20 min |

### Phase 5: 整合与优化 ✨
**负责人**: Agent #5 (测试优化) + 全体

| 任务 | 优先级 | 预计时间 |
|------|--------|----------|
| 端到端功能测试 | P0 | 30 min |
| 性能优化 | P1 | 20 min |
| UI 细节打磨 | P1 | 20 min |
| 响应式适配 | P1 | 15 min |
| 问题修复 | P0 | 持续 |

---

## 四、技术方案详解

### 4.1 文件解析架构

```typescript
// 统一接口设计 (Adapter Pattern)
interface BookParser {
  parse(file: File): Promise<BookData>;
  getChapter(index: number): Promise<ChapterContent>;
  getMetadata(): BookMetadata;
  getTOC(): TableOfContentsItem[];
  getPageCount(): number;
}

interface BookData {
  id: string;
  title: string;
  author: string;
  cover?: string; // base64 or blob URL
  format: 'epub' | 'mobi' | 'txt';
  totalChapters: number;
  metadata: BookMetadata;
}

interface BookMetadata {
  publisher?: string;
  language?: string;
  isbn?: string;
  description?: string;
  publishDate?: string;
}

interface ChapterContent {
  title: string;
  content: string; // HTML string
  index: number;
}
```

### 4.2 状态管理设计

```typescript
// Zustand Store 设计
interface LibraryStore {
  books: BookData[];
  currentBook: BookData | null;
  viewMode: 'grid' | 'list';
  sortBy: 'title' | 'author' | 'recent';
  addBook: (book: BookData) => void;
  removeBook: (id: string) => void;
  setCurrentBook: (book: BookData) => void;
}

interface ReaderStore {
  currentChapter: number;
  currentPage: number;
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  lineHeight: number;
  pageWidth: number;
  bookmarks: Bookmark[];
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
  addBookmark: (bookmark: Bookmark) => void;
}
```

### 4.3 iOS 风格 CSS 要点

```css
/* 毛玻璃导航栏 */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  height: 44px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.12);
}

/* 书籍封面 3D 效果 */
.book-cover {
  border-radius: 8px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-cover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.16),
    0 12px 32px rgba(0, 0, 0, 0.12);
}

/* iOS 弹性过渡 */
.page-transition {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

---

## 五、依赖列表

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.x",
    "epubjs": "^0.3.93",
    "zustand": "^4.x",
    "framer-motion": "^11.x",
    "lucide-react": "^0.x",
    "idb-keyval": "^6.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^6.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---

## 六、执行顺序

1. ✅ 深度调研完成
2. ✅ iOS Books 设计分析完成
3. ✅ 技术选型确定
4. ✅ claude.md 创建完成
5. ⬜ **Phase 1**: Agent #1 搭建项目基础设施
6. ⬜ **Phase 2**: Agent #2 开发核心解析引擎
7. ⬜ **Phase 3**: Agent #3 构建 UI 组件和设计系统
8. ⬜ **Phase 4**: Agent #4 开发功能页面
9. ⬜ **Phase 5**: Agent #5 整合测试与优化

---

> **当前状态**: 调研与规划阶段已完成 ✅，准备进入开发阶段 🚀
