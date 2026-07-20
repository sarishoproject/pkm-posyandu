# Changelog

## [1.3.0] - 2026-07-20
- 🚀 Introduce a new Bun script 'scripts/commit.ts' to automate semantic commits and version bumping using Gemini AI.
- ⚙️ Update 'package.json' with a new 'commit' command for easier task execution.
- 🧹 Add '.commit-auth.json' to '.gitignore' to prevent accidental exposure of local AI API credentials.

## [1.2.2] - 2026-07-20
- 📦 Bump project version from 1.2.0 to 1.2.1 in package.json

## [1.2.0] - 2026-07-20
- ⚙️ Rename build job to test-build and refine test output messages.
- 🚀 Add automated GitHub release workflow triggered on push.
- 🥟 Integrate Bun setup for cross-platform compilation (Linux ARM64 and Windows x64).
- 🔖 Implement version-based tag checks to prevent duplicate releases.
- 📦 Package build artifacts as .tar.gz and .zip for distribution.
- 🧹 Clean up unused commit script from package.json.

## [1.1.0] - 2026-07-20
- 🚀 Add CI/CD workflow (`build.yml`) for automated testing and binary compilation using Bun.
- ⚙️ Update `.gitignore` to exclude log files, binary builds, and sensitive local data files.
- 📖 Initialize `README.md` with project architecture, tech stack, and setup guides.
- 🧹 Configure `biome.json` for code consistency and linting rules.
