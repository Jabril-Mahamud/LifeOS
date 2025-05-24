# LifeOS - Your Personal Life Operating System

A comprehensive personal productivity and well-being platform that combines journaling, habit tracking, project management, and task organization in one seamless experience.

## 🌟 Overview

LifeOS is designed to be your central hub for personal growth and productivity. Whether you're tracking daily habits, reflecting through journaling, managing complex projects, or staying on top of tasks, LifeOS provides the tools and insights you need to build a more intentional life.

### Key Philosophy

- **Integration over Fragmentation**: All your productivity tools work together
- **Reflection over Just Action**: Built-in journaling encourages mindful progress
- **Habits over Goals**: Focus on sustainable daily practices
- **Insights over Data**: Meaningful visualizations that drive action

## ✨ Features

### 📝 **Intelligent Journaling**

- **Daily Reflection**: One journal entry per day with mood tracking
- **Integrated Habit Tracking**: Log habit completion directly in your journal
- **Rich Content**: Add titles, detailed content, and emotional context
- **Multiple Views**: Calendar and list views for easy navigation
- **Search & Filter**: Find past entries quickly with full-text search

### 🏆 **Advanced Habit Tracking**

- **Visual Habit Creation**: Custom icons, colors, and descriptions
- **Smart Analytics**: Streak tracking, completion rates, and trend analysis
- **Heatmap Visualization**: GitHub-style activity heatmaps for long-term patterns
- **Flexible Management**: Activate/deactivate habits as your routine evolves
- **Historical Insights**: View patterns and improvements over time

### 📊 **Project & Task Management**

- **Hierarchical Organization**: Projects contain tasks, or manage standalone tasks
- **Priority & Status Tracking**: Low/Medium/High priorities with status workflows
- **Due Date Management**: Never miss important deadlines
- **Visual Project Identity**: Custom colors and icons for quick recognition
- **Progress Tracking**: Automatic completion percentages and statistics
- **Archive System**: Keep completed projects organized without clutter

### 🎯 **Comprehensive Dashboard**

- **Activity Overview**: See your day at a glance
- **Progress Visualization**: Charts and graphs for habits, projects, and mood trends
- **Quick Actions**: Create entries, tasks, or projects without navigation
- **Recent Activity**: Stay connected to your latest work
- **Insightful Metrics**: Understand your productivity patterns

### ⏰ **Built-in Pomodoro Timer**

- **Customizable Sessions**: Adjust work and break durations
- **Auto-transitions**: Seamless flow between work and rest
- **Session Tracking**: Count completed pomodoros daily
- **Smart Notifications**: Audio and browser notifications
- **Focus Integration**: Works alongside your other productivity tools

### 🎨 **Thoughtful Design**

- **Dark/Light Themes**: Comfortable viewing any time of day
- **Responsive Design**: Seamless experience across desktop and mobile
- **Intuitive Navigation**: Organized by workflows, not features
- **Modern UI**: Clean, distraction-free interface using shadcn/ui components

## 🛠 Tech Stack

### Frontend

- **Next.js 15**: App Router with React Server Components
- **React 19**: Latest React features and concurrent rendering
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **shadcn/ui**: High-quality, accessible UI components

### Backend & Database

- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database operations with migrations
- **PostgreSQL**: Robust relational database for complex data relationships
- **Clerk Authentication**: Secure user management with social login

### Developer Experience

- **TypeScript**: Full type coverage for better DX and fewer bugs
- **ESLint & Prettier**: Consistent code formatting and quality
- **Prisma Studio**: Visual database management
- **Hot Reloading**: Instant feedback during development

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or hosted)
- **Clerk** account for authentication

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/lifeos.git
   cd lifeos
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/lifeos?schema=public"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed with sample data
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Setting Up Authentication

1. Create a free account at [Clerk.dev](https://clerk.dev)
2. Create a new application
3. Copy your publishable and secret keys to your `.env.local` file
4. Configure your sign-in/sign-up preferences in the Clerk dashboard

### Database Setup Options

**Local PostgreSQL:**

```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql
createdb lifeos

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb lifeos
```

**Hosted Options:**

- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Simple PostgreSQL hosting
- [Neon](https://neon.tech) - Serverless PostgreSQL

## 📁 Project Structure

```markdown
lifeos/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (journals, habits, tasks, projects)
│   ├── dashboard/         # Dashboard page
│   ├── habits/           # Habit management pages
│   ├── journal/          # Journal pages
│   ├── projects/         # Project management pages
│   ├── tasks/            # Task management pages
│   └── layout.tsx        # Root layout with navigation
├── components/           # Reusable React components
│   ├── habits/          # Habit-specific components
│   ├── journal/         # Journal-specific components
│   ├── layout/          # Navigation and layout components
│   ├── tasks/           # Task-specific components
│   ├── ui/              # shadcn/ui components
│   └── widgets/         # Standalone widgets (Pomodoro timer)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
├── prisma/             # Database schema and migrations
│   ├── migrations/     # Database migration files
│   ├── schema.prisma   # Database schema definition
│   └── seed.ts         # Sample data for development
└── public/             # Static assets
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Populate database with sample data
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Deploy with one click:**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Flifeos)

3. **Set environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`

4. **Run database migrations:**

   ```bash
   npx prisma migrate deploy
   ```

### Other Platforms

LifeOS can be deployed on any platform that supports Node.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Heroku

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper TypeScript types
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style (Prettier enforced)
- Add proper error handling
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Clerk](https://clerk.com)** - Authentication and user management
- **[shadcn/ui](https://ui.shadcn.com)** - Beautiful, accessible UI components
- **[Prisma](https://prisma.io)** - Type-safe database toolkit
- **[Vercel](https://vercel.com)** - Deployment and hosting platform
- **[Lucide](https://lucide.dev)** - Beautiful icon library

## 🔮 Roadmap

### Upcoming Features

- [ ] **Mobile App**: React Native companion app
- [ ] **Team Collaboration**: Shared projects and accountability partners
- [ ] **AI Insights**: Intelligent pattern recognition and suggestions
- [ ] **Export/Import**: Backup and migrate your data
- [ ] **Integrations**: Connect with calendars, fitness trackers, and other tools
- [ ] **Advanced Analytics**: Deeper insights into your productivity patterns
- [ ] **Customizable Dashboards**: Personalize your overview experience

### Ideas Being Explored

- [ ] **Voice Journaling**: Audio entries with transcription
- [ ] **Habit Recommendations**: AI-suggested habits based on your patterns
- [ ] **Time Tracking**: Built-in time tracking for projects and tasks
- [ ] **Goal Setting**: Long-term goal tracking with habit connections
- [ ] **Social Features**: Share achievements and motivate others

---

**Built with ❤️ to help you build better habits and live more intentionally.**

*Have questions or suggestions? Open an issue or start a discussion!*
