<h1 align="center">wru (Who Are You) 🕵️‍♂️</h1>
<div align="center">
<p align="center">
  <a href="./README.md">中文</a>｜
  <a href="./README_EN.md">英文</a>
</p>
wru is a lightweight CLI tool designed to verify whether someone is a student or a **beginner developer** just starting their journey in application development.

Built with native Node.js modules, it is zero-dependency, fast, and secure.
</div>


## 🌟 Key Features

Comprehensive verification through three core modules:

1.  **Educational Email Verification**: Checks if the provided email belongs to major educational domains worldwide (e.g., `.edu`, `.ac.uk`, `.edu.cn`).
2.  **Basic Skills Quiz**: A set of 8 questions covering fundamentals of HTML, Git, HTTP, JavaScript, CSS, npm, and SQL.
3.  **GitHub Profile Analysis**: Analyzes account age, followers, and repository activity via the GitHub Public API to assess development experience.

## 🚀 Quick Start

Run directly without installation using `npx`:

```bash
npx wru
```

Alternatively, if you have cloned the repository:

```bash
# Clone the repository
git clone https://github.com/jack/wru

# Navigate and install
cd wru && npm install

# Run the tool
wru
```

## 🛠 Usage

By default, `wru` guides you through the full interactive verification process. You can also choose to run specific modules:

-   `wru`: Starts the full verification flow.
-   `wru --email-only`: Runs only the educational email check.
-   `wru --quiz-only`: Runs only the basic skills quiz.
-   `wru --github-only`: Runs only the GitHub profile analysis.

## 📦 Technical Details

-   **Runtime**: Node.js >= 18
-   **Zero Dependency**: Uses only built-in modules like `node:readline` and `node:https`, keeping the footprint minimal and secure.
-   **Modular Design**: Supports both interactive input and flexible command-line arguments.

## 📄 License

Distributed under the [MIT](./LICENSE) License.
