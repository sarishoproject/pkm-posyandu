# Changelog

## [2.18.0] - 2026-08-01
- ⚙️ Optimize GitHub Actions workflow by streamlining artifact packaging and release steps.
- 🚀 Upgrade Bun to version 1.3.14 for builds.
- 🧹 Refactor `compile.ts` to remove complex pre-download logic, relying on standard `bun build --compile`.
- 📦 Standardize binary output handling and artifact naming across platforms.
- ⚡️ Improve build speed by removing redundant pre-download steps and cleanup intervals.

## [2.17.0] - 2026-08-01
- 🚀 Added 'prepareBunBinary' function to pre-download specific Bun variants before compilation to avoid CI download errors.
- ⚙️ Integrated automated curl-based download, verification, and extraction logic for cross-platform binary handling.
- 📦 Implemented robust cleanup process for temporary directories and partial/corrupt Bun bin caches.
- ⚡️ Increased retry delay from 3s to 5s to improve build reliability in unstable network environments.
- 🛠️ Refactored compilation logic to conditionally use the downloaded binary or fallback to --target flags.

## [2.16.3] - 2026-07-31
- ⚙️ Update build targets to use 'baseline' versions for improved compatibility.
- 🐛 Improve error detection by reading stderr, ensuring network/extraction failures are correctly identified.
- 🧹 Add automatic cache cleanup for Bun installation files to prevent issues with corrupted downloads.
- ⚡️ Increase retry delay and refine network error handling logic for a more stable compilation process.

## [2.16.2] - 2026-07-31
- ⚙️ Updated CI build targets to use 'baseline' suffixes for Bun windows and linux artifacts.
- 🛠️ Adjusted conditional logic in workflow scripts to match updated target identifiers for consistent binary renaming.

## [2.16.1] - 2026-07-31
- ⚙️ Remove macOS target configurations from GitHub Actions workflow to optimize CI pipeline runtime
- 📝 Update README to provide instructions for manual macOS binary compilation

## [2.16.0] - 2026-07-31
- 🚀 Revamped CI pipeline to support multi-platform builds (Windows, Linux x64/arm64, macOS x64/arm64) using a matrix strategy.
- 🛠️ Standardized binary naming conventions and added cross-platform archive creation (zip for Windows, tar.gz for Unix).
- 📦 Integrated artifact uploading for all platforms via GitHub Actions artifacts.
- ⚙️ Automated release notes generation and binary upload process using workflow_dispatch.
- 🧹 Cleaned up redundant job logic in build.yml to improve maintainability and performance.
- 📖 Updated README with enhanced documentation on cross-compilation, network timeout handling, and the new verify script.
- 🧹 Simplified project documentation and removed redundant internal API/schema technical details to improve readability.


## [2.15.0] - 2026-07-31
- 🧹 Remove client-side isAdmin state logic across the application to improve security posture.
- ⚙️ Update build script to support interactive target platform selection and dynamic mkcert path resolution.
- 🎨 Overhaul settings page UI with enhanced navigation and improved administrative tool grouping.
- 🚀 Remove localStorage-based authentication simulation from the frontend.
- 📦 Ignore .bun-build directory in .gitignore.

## [2.14.0] - 2026-07-31
- 🧹 Remove client-side isAdmin state check across multiple views as the application is transitioning to a more secure authentication model.
- ⚙️ Update build script to allow interactive selection of compilation targets and handle mkcert path resolution dynamically.
- 🎨 Overhaul the settings page interface for improved navigation and access to administrative tools.
- 🚀 Remove redundant localStorage-based authentication simulation in the frontend.

## [2.13.0] - 2026-07-31
- 🚀 Add vite-plugin-mkcert to enable local HTTPS development.
- ⚙️ Update binary compilation script to include mkcert.exe for production deployments.
- 🔐 Integrate automatic SSL certificate generation (local CA) in the server startup process.
- 📦 Rename binary output from app- to pkm-posyandu for better branding.
- 🐛 Fix numerical ID handling in the participant measurement form component.


## [2.12.0] - 2026-07-31
- 🚀 Added QR scanner integration with camera error handling and UI feedback.
- 📦 Updated dependencies including shadcn/ui and various utility libraries.
- 🛠️ Refactored member registration form with NIK validation and improved error handling.
- 🎨 Enhanced UI for Add Member screen, adding responsive layout and better input management.
- ⚡️ Enabled development mode with host access for testing.
- 🧹 Cleaned up biome.json exclusions and legacy commented-out code.

### [2026-07-30]
- 📝 Update README content to provide comprehensive guides on project usage, scripts, and API documentation.
- 🚀 Added detailed sections for Application Features, CRUD workflow, and Backend API specs.
- ⚙️ Clarified deployment workflows, script usage, and the compile process for single-binary builds.
- 📖 Enhanced documentation for Database schema management and error handling protocols.
- 🎨 Improved structure of the README for better readability and accessibility for new contributors.


## [2.11.0] - 2026-07-30
- ⚡️ Optimize QR scanner performance and event handling in root component.
- 🎨 Improve UI/UX of the scanner overlay with better accessibility and state management.
- 🧹 Simplify member detail route by moving component logic to an outlet.
- ⚙️ Update code formatting and cleanup unused dependencies to reduce bundle size.


## [2.10.0] - 2026-07-29
- 📦 Add qrcode.react to dependencies to enable QR generation.
- 🎨 Create new barcode view page (/anggota/barcode/$id) with download functionality.
- ⚡️ Implement QR code scanning support by allowing lookup via UUID in API routes.
- ⚙️ Update participant creation to auto-generate a unique QR code (UUID) upon registration.
- 📖 Update route definitions to include the new barcode view page.

## [2.9.0] - 2026-07-29
- ⚙️ Add database migration script for 'asi' column to 'pendataan' table.
- 📦 Update Pendataan interface and API routes to handle 'asi' field persistence.
- 🎨 Improve UI/UX in registration and editing forms with new select inputs for ASI status.
- 🚀 Add export functionality for individual member records.
- 🛠️ Refactor type definitions and optimize component logic to support nullable ASI fields.
- 🧹 Clean up imports and address React prop associations in forms.


## [2.8.0] - 2026-07-26
- ⚙️ Updated GitHub Actions workflow to support cross-compilation for Linux x64, macOS ARM64, and macOS x64.
- 📦 Streamlined build artifact compression using tar and zip utilities.
- 🧹 Cleaned up build directory management to ensure clean environments per job.
- 🚀 Added multi-platform artifacts to the GitHub release configuration.
- 📝 Added meeting minutes regarding project architecture and product distribution plans.


## [2.7.0] - 2026-07-25
- 🎨 [UI] Standardized component layouts and improved accessibility labels using htmlFor attributes.
- ⚙️ [Code] Refactored TanStack Router navigation logic to use explicit params for better type safety.
- 🧹 [Refactor] Simplified state management and improved error handling for sensor data fetching and form submissions.
- ⚡️ [Optimization] Added descriptive types and cleaned up redundant imports and whitespace.
- ✨ [Feature] Added placeholder Akun page for future account settings implementation.


## [2.6.1] - 2026-07-25
- 🎨 Refactor React components in edit measurement and edit member forms for better readability.
- ⚙️ Update error handling in data fetching to provide more informative feedback when server requests fail.
- 🛠️ Standardize consistent quote usage (switching to single quotes) and improve layout definitions.
- 🧹 Cleanup unused imports and organize component logic for better maintainability.

### [2026-07-25]
- 🧹 Delete obsolete edit component for anggota module
- ⚙️ Clean up project structure by removing unused route file

## [2.6.0] - 2026-07-25
- ✨ Implement sensor data integration for weight and height in measurement forms
- ⚙️ Add manual inputs for head and arm circumference, measurement method, and pitting edema
- 🛠️ Add validation for birth year in participant editing to ensure valid date ranges
- 🎨 Improve UI layout for measurement and edit forms with responsive design
- 🧹 Refactor form state management and data formatting logic for dates
- 📝 Add delete functionality and improved navigation across member info pages

## [2.5.0] - 2026-07-23
- ✨ Added EditMemberForm for updating member details.
- ⚙️ Integrated real-time weight/height data fetching from sensors in the input form.
- 🛠️ Refactored routing structure for improved dynamic parameter handling ($pesertaId).
- 🎨 Added helper functions for age calculation and date formatting on detail pages.
- 🐛 Fixed SVG chart visualization bugs by adding coordinate clamping.

## [2.4.0] - 2026-07-23
- ⚡️ Implement API integration for fetching member list and member details from backend
- ⚙️ Add dynamic routing support for member details using $id parameter
- 🛠️ Replace static dummy data with real-time state management using React useEffect and useState
- 🎨 Implement loading states with spinners while waiting for API responses
- 🧹 Clean up redundant static components and consolidate member display logic
- 🚀 Enable navigation and searching functionality based on actual API data

## [2.3.0] - 2026-07-22
- ✨ Create new MemberDetailView component to display growth history and visual charts.
- 📊 Implement SVG-based interactive growth charts for weight and height tracking.
- 📋 Integrate history measurement display and navigation to add new entries.
- ⚙️ Update routeTree.gen.ts to include the new /anggota/info/ path.

## [2.2.0] - 2026-07-22
- ✨ Added measurement input page for capturing weight, height, head circumference, and arm circumference.
- ✨ Added new member registration form with basic validation fields for child details.
- ⚙️ Integrated new routes into TanStack Router via routeTree.gen.ts.
- 🎨 Styled components using Tailwind CSS for consistent UI/UX across mobile and desktop views.

## [2.1.1] - 2026-07-21
- 📝 Update the app description text in the main index component
- 🎨 Improve aesthetic spacing/formatting for the application header

## [2.1.0] - 2026-07-21
- ✨ Create new members page layout for mobile device.
- 🎨 Add search functionality and scan input trigger for member management.
- 📦 Integrate dynamic child data rendering with status indicators.
- ⚙️ Update route tree configuration to support the new '/anggota' route path.


## [2.0.0] - 2026-07-21
- ⚙️ Migrate core database schemas from users/weights to participants/measurements
- 🚀 Implement full CRUD API endpoints for peserta (participants) and pendataan (measurements)
- 🎨 Create new frontend interface for participant management using TanStack Query
- 🧹 Remove deprecated user management modules and associated database tables
- 🔧 Update route definitions to reflect the new application structure
- ⚡️ Improve TypeScript configuration for module resolution

## [1.6.0] - 2026-07-21
- 🚀 Implement automated systemd setup flow for Raspberry Pi, enabling service persistence and logging management.
- 🛠️ Refactor compilation script to support true single-file execution without needing extra runtime dependencies.
- ⚙️ Update internal shell execution logic to use `Bun.spawnSync` for improved compatibility with SSR and cross-platform handling.
- 📖 Update README with comprehensive deployment documentation for both automatic and manual Raspberry Pi setups.

## [1.5.0] - 2026-07-21
- 🚀 Add CLI argument handler to support automated systemd service registration for Raspberry Pi deployment.
- ⚙️ Integrate systemd generation logic with auto-restart, log management, and process permissions.
- ⚡️ Implement native Bun ANSI color helpers for enhanced console readability.
- 📦 Refactor server startup to include automatic port listening and periodic memory/uptime statistics logging.
- 🛠️ Update documentation to reflect improved binary compilation and deployment workflow.

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
