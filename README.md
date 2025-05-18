# LifeOS

A comprehensive personal life operating system built with Next.js, Prisma, and Clerk authentication.

## Overview

LifeOS is your all-in-one personal management system designed to help you maintain consistency, track progress, and gain insights into your daily life. Unlike Notion-based life management systems that require complex configuration, LifeOS provides a streamlined, purpose-built experience with:

- 📝 **Daily Journaling**: Document your thoughts, experiences, and reflections
- 🏆 **Habit Tracking**: Build consistency with customizable habit tracking
- 🧠 **Mood Monitoring**: Track your emotional well-being over time
- 📊 **Visual Analytics**: Understand patterns with heatmaps, streak calendars, and statistics
- 🔄 **Daily Consistency**: Maintain your routines with a unified daily check-in process
- 🔒 **Privacy-First**: Complete user management with secure authentication
- 📱 **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk (user management, authentication)
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS, shadcn/ui component system

## Demo

A hosted demo of this application will be available soon.

## Getting Started

### Prerequisites

- Node.js v20+
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/life-os.git
   cd life-os
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:

   ```env
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/yourdbname?schema=public"
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Seed the database (optional):

   ```bash
   npx prisma db seed
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Core Features

### User Authentication

Powered by Clerk, the application offers a seamless authentication experience:

- Email and password authentication
- Social login options
- User profiles
- Secure session management

### Journal System

- Create daily journal entries with titles, content, and mood selection
- View past entries with search and filter capabilities
- One journal entry per day to encourage consistent reflection
- Mood tracking and analysis

### Habit Management

- Create custom habits with names, descriptions, icons, and colors
- Track habit completion alongside your daily journal entries
- View habit streaks and performance statistics
- Activate/deactivate habits as needed
- Build consistency through visual progress indicators

### Analytics Dashboard

- View journal activity through a heatmap visualization
- Track habit streaks and completion rates
- Analyze mood distribution and trends
- Get insights into your journaling and habit consistency
- Make data-driven decisions about your routines

## Project Structure

```md
├── app/                  # Next.js app router files
│   ├── api/              # API routes for journal, habits, etc.
│   ├── dashboard/        # Dashboard page
│   ├── habits/           # Habit management pages
│   ├── journal/          # Journal pages
│   ├── sign-in/          # Authentication pages
│   ├── sign-up/          
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── dashboard/        # Dashboard components
│   ├── habits/           # Habit-related components
│   ├── journal/          # Journal-related components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components (shadcn)
│   └── visualizations/   # Data visualization components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared code
├── prisma/               # Prisma schema and migrations
│   ├── migrations/       # Database migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script for development data
├── public/               # Static assets
```

## Deployment

You can easily deploy this application on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Flife-os)

When deploying, make sure to set up the required environment variables in the Vercel dashboard.

## Database Setup

This project uses PostgreSQL with Prisma ORM. You'll need to:

1. Create a PostgreSQL database
2. Update the DATABASE_URL in your .env file
3. Run migrations: `npx prisma migrate deploy`

For local development, you can use:

- Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`
- Railway, Supabase, or other hosted PostgreSQL services

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was built using [Clerk](https://clerk.com) for authentication
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Date handling with [date-fns](https://date-fns.org/)
- Database managed with [Prisma](https://www.prisma.io/)
