# WriteWise Agent 📝

> High-Fidelity AI Writing Workstation & Academic Research Platform

[![Deployment Status](https://img.shields.io/badge/deployment-live-brightgreen)](https://writewise-app.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![AI-Powered](https://img.shields.io/badge/AI--Powered-Gemini%20%7C%20GPT--4-purple)](https://writewise-app.vercel.app)

**[Live Demo](https://writewise-app.vercel.app)** | **[Report Bug](https://github.com/Teleiosite/writewise-agent/issues)** | **[Request Feature](https://github.com/Teleiosite/writewise-agent/issues)**

---

## 📖 Overview

WriteWise Agent is a premium, **Microsoft Word-style AI workstation** designed for hyper-productive academic research and content creation. It transforms the writing process into a structured, high-fidelity experience by integrating real-time AI analysis, structural drafting for scientific chapters, and a distraction-free wide-writing environment.

### 🎯 Key Highlights

- 🚀 **Global Pro Navigation** - Unified header-based control for the entire writing workstation.
- ✍️ **Wide Writing Space** - Dynamic document canvas that expands for a focused writing experience.
- 🤖 **Structural AI Drafting** - Intelligent generation of Chapters 1-5 (Introduction, Literature Review, etc.) with contextual topic awareness.
- 📊 **Real AI Analytics** - Scientific data analysis and writing productivity insights.
- ✅ **Full-Stack Production Ready** - Deployed on Vercel with a robust Supabase (PostgreSQL) backend.

---

## ✨ Features

### Premium Workstation Experience

#### 🖥️ Global Pro Navigation
- **Unified Control Center** - No more cluttered sidebars. All AI tools (Writing, Grammar, Humanizer) are consolidated into a professional "AI Tools" header dropdown.
- **Persistent Project Header** - Seamlessly switch between the Editor, Assistance, and Analytics without losing project context.

#### 📄 Focused Writing Canvas
- **Dynamic Layout** - The editor automatically expands to a wide-writing format when analysis panels are closed, providing a distraction-free Word-style workstation.
- **Section-Based Drafting** - Manage your document through intuitive logical sections for better organization.

#### 🤖 Advanced AI Research Tools
- **Structural Drafting (Ch 1-5)** - Specifically tuned AI for generating high-fidelity academic chapters (Introduction, Literature Review, Methodology, Results, Conclusion).
- **Topic-Aware Generation** - Input your specific "Research Focus" to ensure AI outputs are contextually accurate for your study.
- **Grammar & Academic Tone** - Real-time analysis of punctuation, syntax, and scholarly language.
- **AI Humanizer** - Instantly refines AI-generated text to maintain a natural, human flow while preserving academic rigor.

### Research & Data Tools

#### 📖 Citation & Source Management
- **Universal Citation Engine** - Support for APA, MLA, Chicago, and more.
- **Library Integration** - Import and manage references directly within the project workflow.

#### 📄 PDF Intelligence
- **Interactive PDF Chat** - Ask questions to your research papers and get instant summaries.
- **Side-by-Side Reading** - Reference your PDFs directly next to your active drafting area.

#### 📊 Scientific Analytics
- **Writing Productivity** - Track daily streaks, word counts, and writing time.
- **AI Research Insights** - Get critical scientific analysis and logical gap identification from your document content.

### User Experience

- 🎨 **Modern UI/UX** - Clean, intuitive interface built with shadcn/ui
- 🌓 **Theme Support** - Light and dark mode with system preference detection
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🔔 **Real-Time Notifications** - Toast notifications for actions and updates
- ⚡ **Fast Performance** - Optimized loading with code splitting and lazy loading

---

## 🏗️ System Architecture

### High-Level Architecture
```mermaid
graph TB
    subgraph Frontend["🎨 Pro Workstation (Vercel)"]
        A[React 19 + TypeScript]
        A --> B[📊 Analytics & AI Insights]
        A --> C[✍️ Wide-Writing Editor]
        A --> D[📁 Project Workspace]
        A --> E[🤖 AI Structural Drafter]
        A --> F[📄 PDF Intelligence]
    end

    subgraph Backend["⚙️ Backend Infrastructure (Supabase)"]
        H[(💾 PostgreSQL + RLS)]
        I[🔑 Managed Auth]
        J[📦 Research Storage]
        
        H --> H1[users]
        H --> H2[projects]
        H --> H3[academic_sections]
        H --> H4[citations]
        H --> H5[data_analysis]
    end

    subgraph AI_Core["🧠 AI Intelligence Layer"]
        K[🤖 OpenAI GPT-4o]
        L[🤖 Google Gemini 1.5 Pro]
        M[🌐 Vercel AI Proxy]
    end

    B & C & E & F -->|Proxy Streaming| M
    M --> K & L
    A -->|JWT Authenticated| I
    I -->|Postgres Query| H
    F -->|Document RAG| J

    style Frontend fill:#f0f7ff,stroke:#0070f3,stroke-width:2px
    style Backend fill:#fff7ed,stroke:#f97316,stroke-width:2px
    style AI_Core fill:#f5f3ff,stroke:#8b5cf6,stroke-width:2px
```

### Technology Stack

#### High-Fidelity Frontend
```yaml
Framework: React 19 (Production Grade)
Language: TypeScript 5.0
Design System: Tailwind CSS 3.4 + shadcn/ui
Animations: Framer Motion
Icons: Lucide React
Editor Core: TipTap/Rich-Text
Charts: Recharts (Scientific Data Visualization)
PDF Core: pdfjs-dist + Mammoth
```

#### Production Backend (BaaS)
```yaml
Platform: Supabase
Database: PostgreSQL 15 (with Row-Level Security)
Authentication: Supabase Auth (JWT & Session Persistence)
Storage: Supabase S3-Compatible Buckets
API Gateway: Vercel Serverless Functions
```

#### AI Intelligence
```yaml
Models: Gemini 1.5 Pro, GPT-4o, Claude 3.5
Proxy: Custom Vercel AI Proxy for secure API injection
Capabilities: Structural Drafting, Grammar Analysis, Data Interpretation
```

#### Backend (BaaS)
```yaml
Platform: Supabase
Database: PostgreSQL 15
Authentication: Supabase Auth (JWT-based)
Storage: Supabase Storage (S3-compatible)
Real-time: PostgreSQL triggers + Supabase Realtime (planned)
Row-Level Security: Enabled for all tables
```

#### DevOps & Deployment
```yaml
Hosting: Vercel (Serverless)
CI/CD: GitHub + Vercel (automatic deployments)
Environment: Production & Development environments
SSL/TLS: Automatic via Vercel
CDN: Vercel Edge Network (global)
Monitoring: Vercel Analytics (planned)
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users (managed by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citations
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  citation_type VARCHAR(50) NOT NULL,
  citation_style VARCHAR(50) NOT NULL,
  citation_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security (RLS)

```sql
-- Users can only read/update their own data
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own citations" ON citations
  FOR ALL USING (auth.uid() = user_id);
```

---

## 📁 Project Structure

```
writewise-agent/
├── public/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   └── images/                  # Image assets
│
├── src/
│   ├── components/              # React components
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── Overview.tsx
│   │   │   ├── RecentProjects.tsx
│   │   │   └── WritingStats.tsx
│   │   │
│   │   ├── editor/             # Writing editor components
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── TextEditor.tsx
│   │   │   └── FormatPanel.tsx
│   │   │
│   │   ├── citations/          # Citation management
│   │   │   ├── CitationForm.tsx
│   │   │   ├── CitationList.tsx
│   │   │   └── StyleSelector.tsx
│   │   │
│   │   ├── pdf/                # PDF interaction
│   │   │   ├── PDFReader.tsx
│   │   │   └── PDFChat.tsx
│   │   │
│   │   ├── auth/               # Authentication
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordReset.tsx
│   │   │
│   │   └── ui/                 # Reusable UI components (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── [40+ components]
│   │
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── ThemeContext.tsx    # Theme management
│   │   └── ProjectContext.tsx  # Project state
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useProjects.ts      # Project management
│   │   ├── useDocuments.ts     # Document operations
│   │   └── useAnalytics.ts     # Analytics tracking
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── supabase.ts         # Supabase client config
│   │   ├── utils.ts            # Helper functions
│   │   └── validators.ts       # Input validation
│   │
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Editor.tsx          # Writing editor
│   │   ├── Projects.tsx        # Project list
│   │   ├── Citations.tsx       # Citation manager
│   │   ├── Analytics.tsx       # Analytics page
│   │   ├── Settings.tsx        # User settings
│   │   ├── Login.tsx           # Login page
│   │   └── Register.tsx        # Registration
│   │
│   ├── services/                # API service layers
│   │   ├── projectService.ts   # Project CRUD
│   │   ├── documentService.ts  # Document CRUD
│   │   ├── citationService.ts  # Citation operations
│   │   └── analyticsService.ts # Analytics tracking
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── database.types.ts   # Supabase generated types
│   │   ├── project.types.ts    # Project types
│   │   └── document.types.ts   # Document types
│   │
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind CSS config
├── vite.config.ts               # Vite configuration
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **Git** for version control
- **Supabase Account** (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Teleiosite/writewise-agent.git
   cd writewise-agent
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > Note: The `--legacy-peer-deps` flag resolves peer dependency conflicts with React 19 and some packages. This is a temporary workaround.

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔧 Configuration

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Configure authentication**
   - Navigate to Authentication → Providers
   - Enable Email provider
   - Configure redirect URLs:
     - Development: `http://localhost:5173/**`
     - Production: `https://your-domain.vercel.app/**`

3. **Set up database tables**
   - Run the SQL commands from the [Database Schema](#database-schema) section
   - Enable Row-Level Security on all tables

4. **Configure storage** (optional)
   - Create storage buckets for user uploads
   - Set appropriate access policies

### Vercel Deployment

1. **Connect repository to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Configure environment variables** in Vercel Dashboard
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

3. **Enable automatic deployments**
   - Vercel will automatically deploy on `git push`

---

## 📊 Current Status

### ✅ Completed Features (Pro Mode)

- [x] **Global Pro Navigation** - Unified Microsoft Word-style workstation header.
- [x] **Chapter 1-5 Generator** - Structural academic drafting with topic awareness.
- [x] **Wide Writing Space** - Dynamic layout for distraction-free writing.
- [x] **Real-Time AI Analysis** - Grammar, tone, and scientific gap identification.
- [x] **Vercel AI Proxy** - Secure, production-ready AI API integration.
- [x] **Citation Manager** - Full APA/MLA support and project library.
- [x] **PDF Chat & Reader** - High-fidelity PDF interaction.
- [x] **Production Infrastructure** - Fully deployed on Vercel with Supabase DB.

### 🚧 In Progress

- [ ] **AI Research Analyst v2** - Advanced numerical data interpretation (CSV/Excel).
- [ ] **Real-time Collaboration** - Multi-user document presence.
- [ ] **Export to DOCX** - Academic-ready document exporting.
- [ ] **Plagiarism Search** - Deep-web scientific integrity checking.

### 🐛 Known Issues

1. **Dependency Conflicts**
   - `next-themes` peer dependency conflict with React 19
   - **Workaround:** Using `--legacy-peer-deps` flag
   - **Status:** Monitoring for upstream fix

2. **Large File PDF Processing**
   - Large PDF files (>10MB) may be slow in the browser reader
   - **Status:** Optimization planned
   - **Workaround:** Compress PDFs before upload

---

## 🛣️ Roadmap

### Phase 1: Core Enhancement (Q1 2025)
- [ ] Complete OpenAI/Gemini API integration
- [ ] Implement real-time AI suggestions
- [ ] Add collaborative editing (multiple users)
- [ ] Enhance PDF chat with RAG capabilities
- [ ] Performance optimizations

### Phase 2: Advanced Features (Q2 2025)
- [ ] Plagiarism detection service
- [ ] Grammar checker with advanced rules
- [ ] Voice-to-text dictation
- [ ] Document version history
- [ ] Team workspaces

### Phase 3: Mobile & Integrations (Q3 2025)
- [ ] React Native mobile app
- [ ] Browser extensions (Chrome, Firefox)
- [ ] API for third-party integrations
- [ ] Zapier/Make.com integrations
- [ ] Google Docs/Microsoft Word plugins

### Phase 4: Enterprise Features (Q4 2025)
- [ ] SSO (Single Sign-On) support
- [ ] Advanced analytics dashboard
- [ ] Custom branding options
- [ ] Audit logs and compliance features
- [ ] Self-hosted deployment option

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abomide Oluwaseye**

- Email: abosey23@gmail.com
- LinkedIn: [linkedin.com/in/abomide-oluwaseye](https://linkedin.com/in/abomide-oluwaseye)
- GitHub: [@Teleiosite](https://github.com/Teleiosite)
- Portfolio: [Live Demo](https://writewise-app.vercel.app)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Vercel](https://vercel.com/) - Deployment platform
- [Lucide](https://lucide.dev/) - Icon library

---

## 📚 Documentation

For more detailed documentation, please refer to:

- [API Documentation](docs/API.md) (coming soon)
- [Component Documentation](docs/COMPONENTS.md) (coming soon)
- [Deployment Guide](docs/DEPLOYMENT.md) (coming soon)
- [Contributing Guidelines](CONTRIBUTING.md) (coming soon)

---

## 📞 Support

If you have any questions or need help, please:

- 📧 Email: abosey23@gmail.com
- 🐛 [Open an issue](https://github.com/Teleiosite/writewise-agent/issues)
- 💬 [Start a discussion](https://github.com/Teleiosite/writewise-agent/discussions)

---

<div align="center">

**[⬆ back to top](#writewise-agent-)**

Made with ❤️ by [Abomide Oluwaseye](https://github.com/Teleiosite)

</div>
