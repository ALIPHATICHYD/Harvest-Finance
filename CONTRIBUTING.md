# 🤝 Contributing to Harvest Finance

Thank you for your interest in contributing to **Harvest Finance**! 🚜 ✨  
We're building a blockchain-based supply chain financing platform to empower smallholder farmers, and we'd love for you to be part of this journey.

---

## 🏗️ Architecture & Project Structure

Harvest Finance is a full-stack decentralized application built on the **Stellar Blockchain**. We are currently participating in the **Drips Wave** program, aiming to expand our contributor base and accelerate the development of sustainable agricultural financing tools.

### Repository Structure

```text
harvest-finance/
├── backend/              # NestJS API Server (TypeScript)
│   ├── src/              # Source code (controllers, services, entities)
│   ├── test/             # Unit and E2E tests
│   └── .env.example      # Environment template
├── frontend/             # Next.js Web Dashboard (TypeScript)
│   ├── src/              # React components, pages, hooks
│   ├── public/           # Static assets (images, icons)
│   └── next.config.ts    # Next.js configuration
└── (root)                # Documentation & global configs
```

### Key Technologies
- **Blockchain**: Stellar (Stellar SDK, Claimable Balances)
- **Backend**: Node.js, NestJS, TypeORM, PostgreSQL, Redis
- **Frontend**: React, Next.js, TailwindCSS, Framer Motion
- **Tooling**: TypeScript, ESLint, Prettier, Jest

---

## 🚀 Setting Up Your Local Environment

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.x or later
- **npm**: v8.x or later
- **PostgreSQL**: v14.x or later (Running locally or via Docker)
- **Redis**: v6.x or later (Used for caching)
- **Git**: For version control

### 2. Fork & Clone
```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/your-username/Harvest-Finance.git
cd Harvest-Finance
```

### 3. Backend Setup
Navigate to the `harvest-finance/backend` directory:
```bash
cd harvest-finance/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env with your local DB & Redis credentials
# (Default values usually work if you have local Postgres/Redis)
```

**Initialize Database:**
```bash
# Run migrations to create tables
npm run migration:run

# (Optional) Seed the database with demo data
npm run seed
```

**Start Backend Development Server:**
```bash
npm run start:dev
```
The API should now be running at `http://localhost:5000` (or `http://localhost:5000/api` for Swagger docs).

### 4. Frontend Setup
Open a new terminal and navigate to the `harvest-finance/frontend` directory:
```bash
cd harvest-finance/frontend

# Install dependencies (using npm or bun)
npm install

# Setup environment variables
# (Ensure NEXT_PUBLIC_API_URL points to your backend: http://localhost:5000)
cp .env.example .env
```

**Start Frontend Development Server:**
```bash
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

---

## 🛠️ Contribution Workflow

### 1. Picking an Issue
Visit our [GitHub Issues](https://github.com/code-flexing/Harvest-Finance/issues) and look for tags:
- `good-first-issue`: Perfect for new contributors.
- `help-wanted`: High priority or complex tasks.
- `frontend` / `backend`: Tech-specific tasks.

Before starting work, **please comment on the issue** to express your interest—this avoids duplicate work!

### 2. Branching Strategy
We use a simple branching model. Always create a new branch from `main`:
- `feature/your-feature-name` (e.g., `feature/ farmer-id-verification`)
- `fix/your-fix-name` (e.g., `fix/auth-token-expiry`)
- `docs/your-doc-update` (e.g., `docs/api-guide`)

### 3. Coding Standards
- **Linting**: Run `npm run lint` before committing.
- **Formatting**: We use Prettier. Ensure your editor is configured to use our `.prettierrc`.
- **Testing**: If you're adding logic, please include unit or integration tests.

### 4. Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add new escrow contract handler`
- `fix: resolve transaction fee calculation bug`
- `docs: update setup guide`
- `chore: update dependencies`

### 5. Pull Requests
1. **Push your changes** to your fork.
2. **Open a PR** against our `main` branch.
3. **Fill out the PR Template** (if available) with:
   - What changed?
   - How to test it?
   - Screenshots (if UI-related).
4. **Wait for review**. We try to review PRs within 48 hours!

---

## 🏷️ Issue Labels Guide

| Label | Description |
| :--- | :--- |
| `good-first-issue` | Beginner-friendly tasks with clear instructions. |
| `enhancement` | A new feature or improvement to existing logic. |
| `bug` | Something isn't working as expected. |
| `backend` | Involves the NestJS API, Database, or Stellar logic. |
| `frontend` | Involves the React UI, Framer Motion, or styling. |
| `documentation` | Updates to README, Wiki, or code comments. |
| `urgent` | Needs immediate attention for stability or security. |

---

## 🎨 Project Visual Identity
When contributing UI elements, keep in mind our brand aesthetics:
- **Primary Color**: Forest Green (Agriculture & Growth)
- **Secondary Color**: Gold (Finance & Value)
- **Tone**: Clean, Minimalist, Professional, Trustworthy

---

**Happy Coding!** 🌾 We can't wait to see what you build.
