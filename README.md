# QVQ Blog

基于 Hexo 7 和自定义 `qmq` 主题的个人技术博客。文章源文件、图片、主题和自动部署配置都保存在本仓库中；`public/` 是构建产物，不需要提交。

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm ci
npm run clean
npm run build
npm run server -- --port 4000
```

本地地址：`http://localhost:4000/QMQ.github.io/`

## 主要目录

```text
source/
├── _posts/              # Markdown 文章源文件
├── images/
│   ├── avatar.jpg       # 头像
│   ├── hero/            # 首页随机 Hero（mountain-01 到 mountain-04）
│   ├── pages/           # About/Archives 等页面 Hero
│   ├── posts/           # 文章封面
│   └── uploads/         # 正文上传图片
├── about/
├── links/
└── portfolio/
themes/qmq/
├── _config.yml          # 站点外观和交互配置
├── layout/              # EJS 模板
└── source/              # CSS 与 JavaScript
.github/workflows/deploy.yml
.pages.yml
```

## 常用配置

编辑 `themes/qmq/_config.yml`：

- `brand.title`、`hero.title`、`hero.subtitle`：博客名和首页文字。
- `brand.avatar`：头像路径。替换 `source/images/avatar.jpg`，或修改此路径。
- `hero.images`：首页随机图片。当前使用四张 mountain 图片；每项支持 `day` 和可选的 `night`，缺少夜图时会继续使用日图并叠加深色遮罩。
- `pages.*.hero`：About、Archives、Categories、Tags、Portfolio、Links 的独立背景。
- `default_cover.day`：文章没有封面时的兜底图片。
- `hero.animation_delay`：逐字符浮现间隔，单位毫秒。
- `light_switch.sound`：拉绳声音，`false` 为关闭，`true` 为开启。
- `nav`、`social`：导航和社交链接。

增加首页图片时，把图片放进 `source/images/hero/`，再向 `hero.images` 添加一项：

```yaml
- day: /images/hero/city-day.webp
  night: /images/hero/city-night.webp
```

文章 Front Matter 示例：

```yaml
---
title: PE 文件解析
date: 2026-09-19 12:00:00
cover: /images/posts/pe/cover.webp
description: 文章摘要
categories:
  - Reverse Engineering
tags:
  - PE
  - Windows
---
```

## 手机发文章

后台地址：<https://app.pagescms.org/>

1. 用拥有本仓库权限的 GitHub 账号登录。
2. 首次使用时安装 Pages CMS GitHub App，并授权 `rzq66/QMQ.github.io`。
3. 打开仓库，进入 `Posts`，点击新建文章。
4. 填写标题、日期、摘要、分类、标签；封面是必填项。
5. 封面会上传到 `source/images/posts/`，正文图片会上传到 `source/images/uploads/`。
6. 保存后 Pages CMS 会提交到 GitHub，随后 GitHub Actions 自动构建并发布。

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy.yml`。把这些源码提交并推送到 `main` 后，在 GitHub 仓库的 `Settings > Pages` 中将 `Source` 设为 `GitHub Actions`。以后 Pages CMS 或普通 Git 提交都会触发自动部署。

部署链路：

```text
Pages CMS -> GitHub main -> GitHub Actions -> Hexo build -> GitHub Pages
```

站点地址：<https://rzq66.github.io/QMQ.github.io/>
