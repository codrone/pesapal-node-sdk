# Contributing to Pesapal Node.js SDK

First off, thank you for considering contributing to the Pesapal Node.js SDK! It's people like you who make this a great tool for the community.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup
1. Fork the repository.
2. Clone your fork: `git clone https://github.com/your-username/pesapal-v3-node.git`
3. Install dependencies:
   ```bash
   npm install
   ```

## 🛠 Development Workflow

### Scripts
- `npm run build`: Compiles TypeScript to CJS and ESM formats in the `dist` folder.
- `npm run test`: Runs the unit test suite using Vitest.
- `npm run typecheck`: Performs a static type check of the source code.
- `npm run prepublishOnly`: Runs typecheck, tests, and build in sequence.

### Code Style
- **TypeScript:** This project is strictly typed. Avoid using `any` unless absolutely necessary.
- **JSDoc:** All public classes and methods **must** include JSDoc comments.
- **Prettier:** We use standard formatting. Ensure your code is clean and readable.

## 🧪 Testing Guidelines

We take testing seriously. A contribution is not considered complete until it is fully tested.

1. **Unit Tests:** Add or update tests in the `tests/` directory for any new logic.
2. **Integration Tests:** For changes involving API communication, verify your changes against the Pesapal Sandbox using `tests/integration.test.ts`. 
   - *Note:* Do not commit your personal sandbox credentials. Use a `.env` file.

Run tests before submitting a PR:
```bash
npm test
```

## 📝 Commit Messages

This project uses **[semantic-release](https://github.com/semantic-release/semantic-release)** to automate versioning and changelogs. Because of this, we follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

Please format your commit messages as follows:

- `feat:` for new features (e.g., `feat: add refund resource`)
- `fix:` for bug fixes (e.g., `fix: resolve token cache expiry issue`)
- `docs:` for documentation changes
- `chore:` for maintenance tasks
- `refactor:` for code changes that neither fix a bug nor add a feature

Example:
```text
feat: add IPN signature verification helper
```

## 📬 Pull Request Process

1. Create a new branch for your feature or fix: `git checkout -b feat/my-new-feature`.
2. Ensure all tests pass and the build is successful.
3. Update the documentation (`README.md` and `docs/index.md`) if your change affects the public API.
4. Submit your PR against the `main` branch.
5. Provide a clear description of the changes and link any related issues.

## 📄 License
By contributing, you agree that your contributions will be licensed under the project's **ISC License**.

---

Happy coding! 🚀
