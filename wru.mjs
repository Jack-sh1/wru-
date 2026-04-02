#!/usr/bin/env node
/**
 * wru (who are you) — 验证某人是学生还是开发新手
 *
 * 三个验证模块：
 *   1. 教育邮箱验证 (.edu / .ac.uk 等)
 *   2. 基础开发技能问卷 (8 题)
 *   3. GitHub 账号分析 (公开 API)
 *
 * 用法:
 *   wru                # 交互式全量验证
 *   wru --email-only   # 仅邮箱
 *   wru --quiz-only    # 仅问卷
 *   wru --github-only  # 仅 GitHub
 *
 * 零依赖，仅使用 Node.js 内置模块。
 */

import * as readline from "node:readline";
import https from "node:https";

// ── ANSI helpers ────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};
const paint = (s, ...styles) => styles.join("") + s + c.reset;

function printHeader(title) {
  const w = 52;
  console.log();
  console.log(paint("┌" + "─".repeat(w) + "┐", c.cyan));
  console.log(paint("│", c.cyan) + paint(` ${title}`.padEnd(w), c.bold) + paint("│", c.cyan));
  console.log(paint("└" + "─".repeat(w) + "┘", c.cyan));
  console.log();
}

function bar(score, width = 20) {
  const filled = Math.round((score / 100) * width);
  const b = "█".repeat(filled) + "░".repeat(width - filled);
  if (score >= 70) return paint(b, c.green);
  if (score >= 40) return paint(b, c.yellow);
  return paint(b, c.red);
}

// ── Readline prompt ─────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(paint("  ? ", c.green) + q + " ", res));

// ── 1. 教育邮箱验证 ────────────────────────────────────────
const EDU_SUFFIXES = [
  ".edu", ".edu.cn", ".edu.tw", ".edu.hk", ".edu.sg", ".edu.my",
  ".edu.au", ".edu.br", ".edu.mx", ".edu.in", ".edu.pk",
  ".edu.vn", ".edu.ph", ".edu.co", ".edu.ar", ".edu.pe",
  ".ac.uk", ".ac.jp", ".ac.kr", ".ac.nz", ".ac.za", ".ac.id",
  ".ac.th", ".ac.ir",
];

function verifyEmail(email) {
  email = email.trim().toLowerCase();
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return { isStudent: false, reason: "邮箱格式不合法" };
  }
  const domain = email.split("@")[1];
  const isEdu = EDU_SUFFIXES.some((s) => domain.endsWith(s) || domain.includes(s.slice(1)));
  return {
    isStudent: isEdu,
    domain,
    reason: isEdu ? `教育机构域名 (${domain})` : `非教育机构域名 (${domain})`,
  };
}

async function runEmailCheck() {
  printHeader("模块 1 / 3 ── 教育邮箱验证");
  const email = await ask("请输入你的邮箱地址:");
  const r = verifyEmail(email);
  if (r.isStudent) {
    console.log(paint(`  ✓ 学生邮箱确认: ${r.reason}`, c.green));
  } else {
    console.log(paint(`  ✗ ${r.reason}`, c.yellow));
  }
  return { module: "email", score: r.isStudent ? 100 : 0, detail: r };
}

// ── 2. 技能问卷 ────────────────────────────────────────────
const QUIZ = [
  { q: "HTML 中 <div> 标签的主要作用是什么？", opts: ["a) 插入图片", "b) 划分页面区域/容器", "c) 创建超链接", "d) 定义标题"], ans: "b" },
  { q: "以下哪个命令用于初始化一个 Git 仓库？", opts: ["a) git start", "b) git create", "c) git init", "d) git new"], ans: "c" },
  { q: "HTTP 状态码 404 表示什么？", opts: ["a) 服务器错误", "b) 请求成功", "c) 页面未找到", "d) 权限不足"], ans: "c" },
  { q: "在 JavaScript 中，=== 和 == 的区别是什么？", opts: ["a) 没有区别", "b) === 比较值和类型，== 只比较值", "c) == 更严格", "d) === 只用于字符串"], ans: "b" },
  { q: "什么是 API？", opts: ["a) 一种编程语言", "b) 应用程序之间交互的接口", "c) 一种数据库", "d) 一种操作系统"], ans: "b" },
  { q: "CSS 中 margin 和 padding 的区别是什么？", opts: ["a) 没有区别", "b) margin 是内边距，padding 是外边距", "c) margin 是外边距，padding 是内边距", "d) 两者都控制字体大小"], ans: "c" },
  { q: "npm 是什么？", opts: ["a) 一种编程语言", "b) Node.js 的包管理工具", "c) 一种数据库", "d) 一种浏览器"], ans: "b" },
  { q: "数据库中 SQL 的 SELECT 语句用来做什么？", opts: ["a) 删除数据", "b) 插入数据", "c) 查询数据", "d) 修改表结构"], ans: "c" },
];

async function runQuiz() {
  printHeader("模块 2 / 3 ── 基础开发技能问卷");
  console.log(paint(`  共 ${QUIZ.length} 道选择题，输入选项字母 (a/b/c/d) 回答\n`, c.dim));

  let correct = 0;
  for (let i = 0; i < QUIZ.length; i++) {
    const item = QUIZ[i];
    console.log(`  ${c.bold}Q${i + 1}. ${item.q}${c.reset}`);
    for (const opt of item.opts) console.log(`      ${opt}`);
    const ans = (await ask("你的答案 (a/b/c/d):")).trim().toLowerCase();
    if (ans === item.ans) {
      correct++;
      console.log(paint("      ✓ 正确\n", c.green));
    } else {
      console.log(paint(`      ✗ 错误，正确答案是 ${item.ans}\n`, c.red));
    }
  }

  const score = Math.round((correct / QUIZ.length) * 100);
  const level = quizLevel(score);
  console.log(paint(`  得分: ${correct}/${QUIZ.length} (${score}%)`, c.bold));
  console.log(paint(`  判定: ${level}\n`, c.cyan));
  return { module: "quiz", score, detail: { correct, total: QUIZ.length, level } };
}

function quizLevel(score) {
  if (score <= 25) return "完全新手 — 尚未开始学习开发";
  if (score <= 50) return "初学者 — 刚开始接触开发";
  if (score <= 75) return "入门级 — 有一定基础知识";
  return "有经验 — 非新手开发者";
}

// ── 3. GitHub 分析 ──────────────────────────────────────────
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "verify-user-cli/1.0", Accept: "application/vnd.github.v3+json" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 404) return resolve(null);
        if (res.statusCode >= 400) return reject(new Error(`GitHub API ${res.statusCode}`));
        resolve(JSON.parse(data));
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("请求超时")); });
  });
}

function githubScore(ageDays, origRepos, followers, langs, stars) {
  let s = 0;
  s += Math.min((ageDays / 365) * 10, 20);
  s += Math.min(origRepos * 2.5, 25);
  s += Math.min(langs * 5, 15);
  s += Math.min(followers * 2, 20);
  s += Math.min(stars * 2, 20);
  return Math.min(Math.round(s), 100);
}

function githubLevel(score) {
  if (score <= 15) return "新手 — 几乎无开发活动";
  if (score <= 35) return "初学者 — 少量练习项目";
  if (score <= 60) return "成长中 — 有一定项目经验";
  return "活跃开发者 — 非新手";
}

async function runGithubCheck() {
  printHeader("模块 3 / 3 ── GitHub 账号分析");
  const username = (await ask("请输入 GitHub 用户名:")).trim();
  console.log(paint("  ⏳ 正在查询 GitHub...", c.dim));

  let user, repos;
  try {
    user = await httpsGet(`https://api.github.com/users/${encodeURIComponent(username)}`);
    if (!user) {
      console.log(paint(`  ✗ GitHub 用户 '${username}' 不存在`, c.red));
      return { module: "github", score: 0, detail: { found: false } };
    }
    repos = (await httpsGet(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`)) || [];
  } catch (e) {
    console.log(paint(`  ✗ GitHub 查询失败: ${e.message}`, c.red));
    return { module: "github", score: 0, detail: { found: false, error: e.message } };
  }

  const now = Date.now();
  const created = new Date(user.created_at).getTime();
  const ageDays = Math.round((now - created) / 86400000);
  const languages = new Set();
  let totalStars = 0;
  let origRepos = 0;
  for (const r of repos) {
    if (r.language) languages.add(r.language);
    totalStars += r.stargazers_count || 0;
    if (!r.fork) origRepos++;
  }

  const score = githubScore(ageDays, origRepos, user.followers || 0, languages.size, totalStars);
  const level = githubLevel(score);

  console.log(`  ${"账号年龄:".padEnd(14)} ${ageDays} 天`);
  console.log(`  ${"公开仓库:".padEnd(14)} ${user.public_repos} 个 (原创 ${origRepos})`);
  console.log(`  ${"关注者:".padEnd(14)} ${user.followers}`);
  console.log(`  ${"使用语言:".padEnd(14)} ${[...languages].sort().join(", ") || "无"}`);
  console.log(`  ${"获得 Star:".padEnd(14)} ${totalStars}`);
  console.log();
  console.log(paint(`  GitHub 评分: ${score}/100`, c.bold));
  console.log(paint(`  判定: ${level}`, c.cyan));

  return { module: "github", score, detail: { found: true, username, ageDays, origRepos, followers: user.followers, languages: [...languages], totalStars, level } };
}

// ── 综合评估 ────────────────────────────────────────────────
function finalVerdict(results) {
  printHeader("综合评估结果");

  const weights = { email: 0.3, quiz: 0.4, github: 0.3 };
  const totalWeight = results.reduce((s, r) => s + (weights[r.module] || 0), 0);
  if (totalWeight === 0) {
    console.log(paint("  无有效验证模块结果", c.red));
    return;
  }

  const moduleNames = { email: "教育邮箱", quiz: "技能问卷", github: "GitHub" };
  for (const r of results) {
    const name = (moduleNames[r.module] || r.module).padEnd(10);
    console.log(`  ${name} ${bar(r.score)} ${String(r.score).padStart(3)}/100`);
  }

  const weighted = Math.round(results.reduce((s, r) => s + r.score * (weights[r.module] || 0) / totalWeight, 0));
  console.log(paint(`\n  ${"综合得分:".padEnd(10)} ${weighted}/100`, c.bold));
  console.log();

  const isStudent = results.some((r) => r.module === "email" && r.score === 100);
  const isBeginner = weighted <= 40;

  let tag, color;
  if (isStudent && isBeginner)      { tag = "学生 + 开发新手";          color = c.green; }
  else if (isStudent)               { tag = "学生（有一定开发经验）";    color = c.green; }
  else if (isBeginner)              { tag = "非学生，但是开发新手";      color = c.yellow; }
  else                              { tag = "非学生，有开发经验";        color = c.red; }

  console.log(paint("  ┌─────────────────────────────────────────┐", color));
  console.log(paint(`  │  结论: ${tag.padEnd(32)}│`, color));
  console.log(paint("  └─────────────────────────────────────────┘", color));
  console.log();
}

// ── CLI 入口 ────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args);

  console.log(paint("\n  ╔════════════════════════════════════════════════════════╗", c.cyan));
  console.log(paint("  ║   wru — 学生 / 开发新手 身份验证 CLI                  ║", c.cyan));
  console.log(paint("  ╚════════════════════════════════════════════════════════╝", c.cyan));

  if (flags.has("--help") || flags.has("-h")) {
    console.log(`
  用法: wru [选项]

  选项:
    --email-only    仅运行教育邮箱验证
    --quiz-only     仅运行技能问卷
    --github-only   仅运行 GitHub 分析
    --help, -h      显示帮助
`);
    process.exit(0);
  }

  const runAll = !flags.has("--email-only") && !flags.has("--quiz-only") && !flags.has("--github-only");
  const results = [];

  try {
    if (runAll || flags.has("--email-only"))  results.push(await runEmailCheck());
    if (runAll || flags.has("--quiz-only"))   results.push(await runQuiz());
    if (runAll || flags.has("--github-only")) results.push(await runGithubCheck());
  } catch {
    console.log(paint("\n\n  已取消。\n", c.dim));
    process.exit(1);
  }

  finalVerdict(results);
  rl.close();
}

main();
