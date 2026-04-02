# wru (Who Are You) 🕵️‍♂️

**wru** 是一个轻量级的 CLI 工具，旨在通过一系列验证步骤确认某人是否为**学生**或**刚起步的开发者**。

该项目采用 Node.js 原生模块编写，**零依赖**，极速且安全。

## 🌟 功能特性

通过三个核心模块进行全方位验证：

1.  **教育邮箱验证**：检查输入的邮箱是否属于全球主流教育机构域名（如 `.edu`, `.ac.uk`, `.edu.cn` 等）。
2.  **基础技能问卷**：包含 8 道涵盖 HTML、Git、HTTP、JavaScript、CSS、npm 及 SQL 的基础知识题。
3.  **GitHub 账号分析**：通过 GitHub 公开 API 分析账号创建时间、关注者及仓库活跃度，评估开发资历。

## 🚀 快速开始

无需安装，直接使用 `npx` 运行：

```bash
npx wru
```

或者，如果你已经克隆了仓库：

```git
git clone https://github.com/jack/wru

cd wru && npm install

wru
```

## 🛠 用法说明

默认情况下，`wru` 会引导你完成完整的交互式验证流程。你也可以选择仅运行特定的验证模块：

-   `wru`：启动完整验证流程。
-   `wru --email-only`：仅进行教育邮箱验证。
-   `wru --quiz-only`：仅进行基础技能问卷。
-   `wru --github-only`：仅进行 GitHub 账号分析。

## 📦 技术细节

-   **运行时**：Node.js >= 18
-   **零依赖**：仅使用 `node:readline` 和 `node:https` 等内置模块，无需安装冗余的第三方包。
-   **模块化设计**：支持交互式输入和命令行参数灵活切换。

## 📄 开源协议

基于 [MIT](./LICENSE) 协议。
