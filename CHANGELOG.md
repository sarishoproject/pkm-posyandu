# Changelog

## [1.4.0] - 2026-07-21
- 📦 [scripts/compile.ts] Added auto-generation logic to embed frontend assets directly into the binary.
- ⚙️ [scripts/compile.ts] Refactored compilation process to use a new entry point that registers assets before server startup.
- ⚡️ [src/server.ts] Implemented dual-mode asset loading: uses memory-embedded assets for production binaries and standard filesystem fallback for development.
- 🧹 [package.json] Added biome CI check to the lint script.
- 📝 [scripts/compile.ts] Improved binary size output and summary logging for better deployment visibility.

## [1.3.1] - 2026-07-20
- ⚙️ Update CI workflow to trigger releases specifically on v* tag pushes.
- 📦 Standardize release artifacts naming convention using ${github.ref_name}.
- 🧹 Remove redundant version checking logic and environment variables by leveraging native ref handling.

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
