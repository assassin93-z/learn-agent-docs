# Learn Agent · 文档发布站

<p align="center">中文 &middot; <a href="README_EN.md">English</a></p>

这是 [Learn Agent 课程阅读站](https://assassin93-z.github.io/learn-agent-docs/) 的发布仓库。
通过 VitePress 将十一课 Agent 学习文档构建为静态网页，默认中文，英文位于 `/en/`。

## 内容范围

这里只公开课程文档、站点配置和发布检查。`learn-agent` 的 TypeScript 运行代码与
Git 提交历史仍在私有源码仓库中，不会因为文档上线而获得公开访问权限。
页面中的运行命令以已经获得源码访问权限为前提；网站本身不执行 Agent、模型请求、
Telegram bot 或后台任务，也不保存模型密钥。

课程参考 [Nami Agent 公开课程](https://namiai.tech/agent/)。本仓库不转载其 Python
下载包或第三方图片；引用项目的材料仍遵循各自原有条款。本仓库不为私有代码授予新的许可。
构建依赖的完整第三方版权与许可保存在 [第三方许可说明](docs/public/THIRD_PARTY_NOTICES.txt)，并随网站一起发布。

## 内容更新

原项目中的 15 对中英文 Markdown 是唯一课程正文源。通过白名单导出脚本同步到本仓库的
`docs/`；不要手工修改生成的课程页面，也不要复制整个私有仓库或其 Git 历史。
本站仓库的 README 和网站配置说明发布流程，并不是另一份课程正文。

使用 Node.js 22（22.16+）、24 或 26+，以及 pnpm 11.22.0。安装依赖、验证并预览：

```bash
pnpm install --frozen-lockfile --registry=https://registry.npmjs.org
pnpm check
pnpm docs:preview
```

`pnpm check` 运行隔离测试、发布文件扫描、第三方许可完整性检查、生产构建、
30 页链接与语言切换检查，以及包含搜索索引的静态产物扫描。
`pnpm docs:build` 也会先只读验证许可文件，内容漂移会阻止构建。
升级依赖后，使用 `pnpm notices:generate` 重新生成许可文件，审查变更并随锁文件一起提交。
开发时可使用 `pnpm docs:dev`。

## 发布与安全

GitHub Actions 在主分支变更后构建，并通过 GitHub Pages 发布静态产物。
项目部署路径是 `/learn-agent-docs/`；改动路径时须同时验证资源和章节链接。

不得提交凭据、私有状态、机器配置、本地工作流文件或非课程数据。只有公共 npm registry
依赖和经过审核的文档进入发布内容，唯一依赖锁文件是 `pnpm-lock.yaml`。
`pnpm-workspace.yaml` 只批准构建所需的 `esbuild` 依赖脚本；不要开放全部依赖脚本。
它也只跳过 `@napi-rs/lzma-linux-x64-gnu` 这一项可选依赖：这是 Rollup 上游交叉构建的
压缩工具，本站构建和网页均不依赖它。该发布包缺少完整版权许可文件，因此不安装或发布它，
而不是猜测补写许可。不要扩大可选依赖忽略名单，以免掩盖新的许可问题。
扫描是防护措施，不等于证明所有秘密都可被识别；提交前仍需人工审查差异。
