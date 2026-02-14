# 原子修改策略

## 目的

确保每次改动都**范围小、可验证、可回滚**，避免“大杂烩提交”导致定位问题困难。

## 执行规则

1. **单一目标原则**：一次改动只解决一类问题（例如：只改解析器、只改 UI、只改测试）。
2. **配套验证原则**：每个改动必须附带对应验证（最少 `npm run test` 或 `npm run build` 的相关证据）。
3. **先接口后实现**：先定义类型/契约，再落地具体逻辑，避免后续大范围重构。
4. **先失败后修复（推荐）**：可测试的行为优先先写测试再实现。
5. **独立可回滚**：任意改动块都应可单独撤回，不影响其它模块。

## 本项目的原子批次建议

- 批次 A：工程配置（脚手架、别名、测试框架）
- 批次 B：领域模型与解析接口（`types` + `parser contracts`）
- 批次 C：核心服务（`services`）
- 批次 D：状态管理与 Hooks（`store` + `hooks`）
- 批次 E：页面与 UI 组件（`features` + `components` + `styles`）
- 批次 F：测试与文档（`*.test.ts` + `README` + `docs`）

## 与 Git 同步策略

- 每个批次使用清晰提交信息，例如：
  - `feat(parser): add txt parser with chapter splitting`
  - `feat(reader): implement reader page with toc and bookmarks`
  - `test(parser): add txt parser unit tests`
- 推送前执行：
  - `npm run test`
  - `npm run build`

> 这份策略用于指导后续持续迭代，确保 Reader 项目长期保持可维护性。
