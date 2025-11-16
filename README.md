## 项目简介

仓库仅保留 `apps/web-ele` 这一套 Element Plus 管理端以及配套的 `packages`（布局、状态、请求、样式等）。所有 mock、Playground、多 UI 选择及多语言 README 已移除，默认面向接入 Laravel 10 的后端 API。

## 特性

- **Laravel 优先**：`.env.*` 默认指向 `http://localhost:8000/api`，关闭 Nitro Mock，Vite 直接代理到 Laravel。
- **模块化目录**：复用 Vben Admin 的 `packages` 能力（access、stores、styles、layouts、request 等）。
- **完整工程规范**：保留 ESLint、Stylelint、Prettier、Commitlint、lefthook、Vitest、Tailwind 配置。
- **请求管线**：`apps/web-ele/src/api/request.ts` 统一 token、语言、刷新以及错误提示，可按需适配 Laravel 响应格式。

```
.
├── apps/web-ele          # Element Plus + Vite 应用
├── packages              # 可复用的核心模块
├── internal              # Vite / lint / tailwind 公共配置
├── scripts               # turbo-run、vsh 等脚本
└── 其他根级配置文件
```

## 环境准备

- Node.js ≥ 20.10，建议使用 `corepack pnpm`（仓库 `packageManager` 为 `pnpm@10.14.0`）。
- 安装依赖：`corepack pnpm install`
- 常用命令：
  - `pnpm dev:ele` 启动前端（读取 `.env.development`，并通过 Vite 代理访问 Laravel）
  - `pnpm build` 或 `pnpm build:ele` 构建生产包（产物位于 `apps/web-ele/dist`，可根据 `VITE_ARCHIVER` 生成 dist.zip）
  - `pnpm check` 汇总循环依赖、依赖健康、类型与拼写检查
  - `pnpm test:unit` 运行 Vitest

## `.env` 约定

| 变量 | 说明 |
| --- | --- |
| `VITE_APP_TITLE` | 页面标题及 PWA 元数据 |
| `VITE_APP_NAMESPACE` | 本地缓存/Pinia 持久化命名空间 |
| `VITE_APP_STORE_SECURE_KEY` | 持久化加密密钥（请务必替换） |
| `VITE_GLOB_API_URL` | 接口地址（开发/生产分别指向 Laravel） |
| `VITE_DEV_SERVER_PROXY_TARGET` | Vite 代理目标（默认 `http://localhost:8000`） |
| `VITE_NITRO_MOCK` | 是否开启内置 mock，Laravel 项目保持 `false` |
| `VITE_ROUTER_HISTORY` | `hash` 或 `history`，取决于 Laravel 是否配置 SPA fallback |
| `VITE_COMPRESS / VITE_ARCHIVER / VITE_PWA` | 控制压缩、dist.zip、PWA |

## Laravel 10 集成流程

1. 启动 Laravel API（`php artisan serve --port=8000`），并允许跨域/携带凭证。
2. 根据需要修改 `apps/web-ele/.env.development` 与 `apps/web-ele/vite.config.mts`（如接口前缀不是 `/api`）。
3. `pnpm dev:ele` 进行前端开发；若 Laravel 返回结构不是 `{ code: 0, data: ... }`，请调整 `apps/web-ele/src/api/request.ts` 的 `defaultResponseInterceptor`。
4. 打包：`pnpm build` 输出 `apps/web-ele/dist`。
5. 部署：将 dist 拷贝至 Laravel `public/admin` 等目录，例如 `rsync -av apps/web-ele/dist/ ../laravel/public/admin`；Laravel 路由可添加 `Route::view('/admin/{any?}', 'admin')->where('any', '.*');` 作为 SPA fallback。

## 临时绕过登录（仅供本地调试）

当需要在没有后端的情况下快速预览界面，可在 `.env.*` 中配置 `VITE_SKIP_LOGIN_GUARD=true`。`apps/web-ele/src/router/guard.ts` 会读取该变量并跳过鉴权。**请务必仅在开发/演示阶段开启**，上线前改回 `false` 或删除相关逻辑，以免动态路由、菜单未正常生成。

## 模块 / 组件对照表

| 分类 | 说明 | 关键目录 |
| --- | --- | --- |
| 布局与 UI 框架 | Element Plus 主题适配、基础布局、菜单、标签页、弹窗等 UI 组件 | `apps/web-ele/src/layouts`、`packages/@core/ui-kit/*`、`packages/effects/layouts`、`packages/effects/common-ui` |
| 状态管理 / 偏好 | Pinia store、偏好设置、国际化资源 | `packages/stores`、`packages/preferences`、`packages/locales`、`apps/web-ele/src/store` |
| 权限与路由 | 动态菜单、路由守卫、权限生成 | `packages/access`、`apps/web-ele/src/router` |
| API 与请求 | axios 封装、拦截器、错误提示 | `packages/effects/request`、`apps/web-ele/src/api` |
| Hooks / 工具库 | 通用组合式函数、工具方法 | `packages/effects/hooks`、`packages/utils` |
| 样式与主题 | Vben Design、Tailwind/PostCSS 预设、全局 SCSS | `packages/@core/base/design`、`packages/styles`、`internal/tailwind-config` |
| 常量 / 类型 / 图标 | 常量、类型定义、Icon 集合 | `packages/constants`、`packages/types`、`packages/icons` |
| 业务示例/场景 | 通用 CRUD、演示模块 | `packages/business/*`、`apps/web-ele/src/views/demos` |
| 应用层视图 | 登录、仪表盘、演示页等业务页面 | `apps/web-ele/src/views` |

## 应用配置集中化

公共链接、默认首页等变量集中在 `apps/web-ele/src/config/app.ts`，并可通过 `VITE_APP_DOC_URL` 等环境变量覆盖。多项目只需调整此文件（或相关环境变量）即可定制文案与快捷入口，无需在多个组件中搜索替换。

示例业务模块：`packages/business/crud-page` + `apps/web-ele/src/views/demos/crud/index.vue` 展示了一个可复用的 CRUD 场景，后续可直接复制该组合到新项目。

## 新增模块 Checklist

1. 使用 `pnpm scaffold:module <模块名>` 生成基础视图文件，或手动在 `apps/web-ele/src/views` 下创建目录。
2. 在 `apps/web-ele/src/router/routes` 中注册路由及国际化标题。
3. 若需要复用逻辑，优先放入 `packages/business/*` 或 `packages/@core`，再在视图层调用。
4. 在 `apps/web-ele/src/api` 中定义接口方法，沿用 `@vben/request` 的统一拦截。
5. 更新 `packages/preferences` 或 `apps/web-ele/src/preferences.ts` 以覆盖项目偏好（例如主题、默认首页）。
6. 如果模块会在多个项目使用，请在 README 的模块表中补充条目，方便团队查阅。

## Docker / Nginx 快速预览

```bash
PATH="/home/long/web/vue-vben-admin/node_modules/.bin:$PATH" pnpm run build:ele
docker run --rm -p 8360:80 \
  -v $(pwd)/apps/web-ele/dist:/usr/share/nginx/html:ro \
  nginx:stable-alpine
```

访问 `http://localhost:8360` 即可查看当前构建效果。同样的流程已体现在 `.github/workflows/verify.yml` 中，CI 会在每次提交时进行构建校验。

## CI / 环境校验

仓库新增 `Verify Frontend` workflow（`.github/workflows/verify.yml`），在每次 `push`/`pull_request` 时自动执行 `pnpm lint` 及 `pnpm run build:ele`。如需在本地模拟，可运行：

```bash
corepack pnpm install
PATH="$PWD/node_modules/.bin:$PATH" pnpm lint
PATH="$PWD/node_modules/.bin:$PATH" pnpm run build:ele
```

## 代码规范与质量

- **ESLint**：`pnpm eslint .` 或 `pnpm lint`，配置位于 `internal/lint-configs/eslint-config`。
- **Stylelint**：`pnpm stylelint "**/*.{vue,css,scss}"`，配置位于 `internal/lint-configs/stylelint-config`。
- **Prettier**：`pnpm prettier .`，并由 lefthook 在提交前自动执行。
- **Commitlint**：Angular 规范（`git commit --no-verify` 可临时跳过，但不建议）。
- **Tailwind**：集中在 `internal/tailwind-config`，仅对包含 `tailwind.config.mjs` 的包生效。
- **测试**：`pnpm test:unit`（Vitest + happy-dom）、`pnpm check:type`（`vue-tsc --noEmit`）。

## 迁移检查清单

- [ ] 替换 `.env` 中的 `VITE_APP_STORE_SECURE_KEY` 与 API 地址
- [ ] 根据后端接口调整 `apps/web-ele/src/api/core/*` 与拦截器
- [ ] 更新 `apps/web-ele/src/preferences.ts`、`public` 内的品牌资源
- [ ] 需要时在相关模块增加 `.test.ts` 确保 `pnpm test:unit` 通过

MIT License
