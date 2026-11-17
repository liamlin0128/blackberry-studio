# 轨道控制系统

这是一个由 Codex 维护的可运行产品原型。

## 开始

```powershell
npm.cmd install
npm.cmd run dev
```

开始实现前，请依次阅读 `AGENTS.md` 和 `docs/` 下的产品文档。

## 常用检查

```powershell
npm.cmd run lint
npm.cmd run build
```

## shadcn/ui

当前网络能够访问 npm，但可能无法访问 shadcn 初始化器所需的 GitHub 模板。网络恢复后运行：

```powershell
npx.cmd shadcn@latest init --preset nova --base radix --template vite --yes
```

初始化完成后，使用 shadcn CLI 添加组件，不手工复制组件源码。


