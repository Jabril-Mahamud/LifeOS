import { PrismaClient } from "@prisma/client";
import { startOfDay, subDays, addDays, subHours } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.habitLog.deleteMany({});
  await prisma.habit.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.journal.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding the database...");

  // Create a sample user
  const user = await prisma.user.create({
    data: {
      clerkId: "user_2x0EBigV3xgmexdOQCciX5Fphnu",
      email: "jabrilmahamud8@gmail.com",
      firstName: "John",
      lastName: "Doe",
      profileImage: "https://via.placeholder.com/150",
    },
  });

  console.log("Created user:", user);

  // Create a sample organization
  const organization = await prisma.organization.create({
    data: {
      clerkId: "sample-clerk-org-id-1",
      name: "Demo Company",
      imageUrl: "https://via.placeholder.com/150",
    },
  });

  console.log("Created organization:", organization);

  // Add the user to the organization
  const membership = await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      role: "admin",
    },
  });

  console.log("Created organization membership:", membership);

  // Create a sample post
  const post = await prisma.post.create({
    data: {
      title: "Getting Started with LifeOS",
      content: "Welcome to LifeOS, your personal life operating system. This platform will help you track habits, manage tasks, and journal your thoughts all in one place.",
      published: true,
      authorId: user.id,
    },
  });

  console.log("Created post:", post);

  // Create sample habits
  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        name: "Meditation",
        description: "Daily mindfulness practice for 10 minutes",
        icon: "🧘",
        color: "#9f7aea", // Purple
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Read 30 minutes",
        description: "Read books to expand knowledge",
        icon: "📚",
        color: "#4299e1", // Blue
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Exercise",
        description: "Physical activity for at least 20 minutes",
        icon: "💪",
        color: "#ed8936", // Orange
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Drink water",
        description: "8 glasses of water daily",
        icon: "💧",
        color: "#38b2ac", // Teal
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Practice guitar",
        description: "Practice playing guitar",
        icon: "🎸",
        color: "#f56565", // Red
        active: false, // Inactive habit
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Write code",
        description: "Practice coding skills",
        icon: "💻",
        color: "#6366f1", // Indigo
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Morning stretching",
        description: "5 minutes of stretching after waking up",
        icon: "🤸",
        color: "#10b981", // Emerald
        active: true,
        authorId: user.id,
      },
    }),
  ]);

  console.log(`Created ${habits.length} habits`);

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Personal Website",
        description: "Rebuild my personal website with modern technologies",
        icon: "🌐",
        color: "#3b82f6", // Blue
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Learn React",
        description: "Study React and build sample projects",
        icon: "⚛️",
        color: "#10b981", // Emerald
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Home Organization",
        description: "Organize and declutter the house",
        icon: "🏠",
        color: "#f59e0b", // Amber
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Vacation Planning",
        description: "Plan summer vacation to Europe",
        icon: "✈️",
        color: "#ec4899", // Pink
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Photography Course",
        description: "Complete online photography course",
        icon: "📷",
        color: "#8b5cf6", // Violet
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Old Project",
        description: "This is an archived project",
        icon: "📦",
        color: "#6b7280", // Gray
        completed: true,
        archived: true,
        authorId: user.id,
      },
    }),
  ]);

  console.log(`Created ${projects.length} projects`);

  // Create tasks for projects
  const personalWebsiteTasks = [
    {
      title: "Design website mockup",
      description: "Create wireframes and design mockups for the personal website",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 5),
      completedAt: subDays(new Date(), 3),
      projectId: projects[0].id,
    },
    {
      title: "Set up Next.js project",
      description: "Initialize Next.js project with TypeScript and required dependencies",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 2),
      completedAt: subDays(new Date(), 1),
      projectId: projects[0].id,
    },
    {
      title: "Implement homepage",
      description: "Code the homepage layout and components",
      status: "in-progress",
      priority: "medium",
      dueDate: addDays(new Date(), 2),
      completedAt: null,
      projectId: projects[0].id,
    },
    {
      title: "Create portfolio section",
      description: "Develop the portfolio showcase section with project cards",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 5),
      completedAt: null,
      projectId: projects[0].id,
    },
    {
      title: "Deploy website",
      description: "Deploy the website to Vercel or Netlify",
      status: "pending",
      priority: "low",
      dueDate: addDays(new Date(), 14),
      completedAt: null,
      projectId: projects[0].id,
    },
  ];

  const learnReactTasks = [
    {
      title: "Complete React basics course",
      description: "Finish the React fundamentals course on Udemy",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 10),
      completedAt: subDays(new Date(), 7),
      projectId: projects[1].id,
    },
    {
      title: "Build a todo app",
      description: "Create a simple todo application using React",
      status: "completed",
      priority: "medium",
      dueDate: subDays(new Date(), 5),
      completedAt: subDays(new Date(), 4),
      projectId: projects[1].id,
    },
    {
      title: "Learn React Hooks",
      description: "Study and practice using React hooks",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 3),
      completedAt: null,
      projectId: projects[1].id,
    },
    {
      title: "Build a weather app",
      description: "Create a weather app that uses an external API",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 7),
      completedAt: null,
      projectId: projects[1].id,
    },
  ];

  const homeOrganizationTasks = [
    {
      title: "Declutter living room",
      description: "Sort through and organize the living room",
      status: "completed",
      priority: "medium",
      dueDate: subDays(new Date(), 15),
      completedAt: subDays(new Date(), 14),
      projectId: projects[2].id,
    },
    {
      title: "Organize kitchen cabinets",
      description: "Clean and reorganize kitchen cabinets and drawers",
      status: "in-progress",
      priority: "medium",
      dueDate: addDays(new Date(), 1),
      completedAt: null,
      projectId: projects[2].id,
    },
    {
      title: "Donate unused items",
      description: "Collect items to donate and take them to donation center",
      status: "pending",
      priority: "low",
      dueDate: addDays(new Date(), 10),
      completedAt: null,
      projectId: projects[2].id,
    },
  ];

  const vacationPlanningTasks = [
    {
      title: "Research destinations",
      description: "Research potential destinations in Europe",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 20),
      completedAt: subDays(new Date(), 18),
      projectId: projects[3].id,
    },
    {
      title: "Check passport validity",
      description: "Ensure passport is valid for at least 6 months after return date",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 15),
      completedAt: subDays(new Date(), 15),
      projectId: projects[3].id,
    },
    {
      title: "Book flights",
      description: "Search for and book flights to Europe",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 7),
      completedAt: null,
      projectId: projects[3].id,
    },
    {
      title: "Reserve accommodations",
      description: "Book hotels or Airbnbs for each destination",
      status: "pending",
      priority: "high",
      dueDate: addDays(new Date(), 14),
      completedAt: null,
      projectId: projects[3].id,
    },
    {
      title: "Create itinerary",
      description: "Plan daily activities and sightseeing",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 30),
      completedAt: null,
      projectId: projects[3].id,
    },
  ];

  const photographyCourseTasks = [
    {
      title: "Complete basics module",
      description: "Finish the photography basics module",
      status: "completed",
      priority: "medium",
      dueDate: subDays(new Date(), 30),
      completedAt: subDays(new Date(), 28),
      projectId: projects[4].id,
    },
    {
      title: "Practice composition techniques",
      description: "Take 20 photos demonstrating different composition techniques",
      status: "completed",
      priority: "medium",
      dueDate: subDays(new Date(), 20),
      completedAt: subDays(new Date(), 19),
      projectId: projects[4].id,
    },
    {
      title: "Learn about lighting",
      description: "Complete the lighting module and practice exercises",
      status: "in-progress",
      priority: "medium",
      dueDate: addDays(new Date(), 5),
      completedAt: null,
      projectId: projects[4].id,
    },
    {
      title: "Photo editing basics",
      description: "Learn basic photo editing in Lightroom",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 15),
      completedAt: null,
      projectId: projects[4].id,
    },
  ];

  // Create standalone tasks (not associated with any project)
  const standaloneTasks = [
    {
      title: "Schedule dentist appointment",
      description: "Call dentist office to schedule annual checkup",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 5),
      completedAt: null,
      projectId: null,
    },
    {
      title: "Pay utility bills",
      description: "Pay electric and water bills online",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 2),
      completedAt: subDays(new Date(), 3),
      projectId: null,
    },
    {
      title: "Buy groceries",
      description: "Purchase items from shopping list",
      status: "pending",
      priority: "high",
      dueDate: addDays(new Date(), 1),
      completedAt: null,
      projectId: null,
    },
  ];

  // Combine all tasks
  const allTasks = [
    ...personalWebsiteTasks,
    ...learnReactTasks,
    ...homeOrganizationTasks,
    ...vacationPlanningTasks,
    ...photographyCourseTasks,
    ...standaloneTasks,
  ];

  // Create tasks in database
  for (const taskData of allTasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        authorId: user.id,
      },
    });
  }

  console.log(`Created ${allTasks.length} tasks`);

  // Sample moods for journal entries
  const moods = ["happy", "calm", "neutral", "anxious", "sad", "excited", "tired"];
  
  // Sample journal content templates
  const journalTemplates = [
    "Today was a {mood} day. I accomplished several tasks and made good progress on my projects. I feel {feelingAdjective} about my productivity.",
    "I woke up feeling {mood} today. The weather was {weather}, which affected my mood. I spent most of my day working on {activity}.",
    "Today I focused on {activity}. It was a {mood} experience, and I learned {learningPoint}. I'm looking forward to continuing tomorrow.",
    "I had a {mood} day today. I struggled with {challenge} but managed to overcome it by {solution}. Tomorrow I plan to work on {tomorrowPlan}.",
    "Reflecting on today, I feel {mood}. I made progress on {progress} but still need to work on {improvement}. Overall, it was a {dayQuality} day.",
  ];
  
  // Helper function to generate random content
  const generateContent = (mood: string, date: Date) => {
    const template = journalTemplates[Math.floor(Math.random() * journalTemplates.length)];
    
    const feelingAdjectives = {
      happy: "optimistic",
      calm: "content",
      neutral: "fine",
      anxious: "worried",
      sad: "disappointed",
      excited: "enthusiastic",
      tired: "exhausted",
    };
    
    const weather = ["sunny", "rainy", "cloudy", "windy", "pleasant", "hot", "cold"];
    const activities = ["work", "studying", "reading", "exercising", "coding", "cleaning", "planning"];
    const learningPoints = ["a lot about myself", "new skills", "the importance of consistency", "how to be more efficient", "the value of patience"];
    const challenges = ["time management", "focusing", "motivation", "unexpected obstacles", "technical difficulties"];
    const solutions = ["breaking tasks into smaller steps", "taking short breaks", "seeking help", "changing my approach", "persevering"];
    const tomorrowPlans = ["my main project", "habit building", "addressing pending tasks", "learning something new", "organizing my schedule better"];
    const progress = ["my goals", "several tasks", "important projects", "habit consistency", "skill development"];
    const improvements = ["time management", "focus", "task prioritization", "balance", "consistency"];
    const dayQualities = ["productive", "challenging", "balanced", "insightful", "eventful"];
    
    return template
      .replace("{mood}", mood)
      .replace("{feelingAdjective}", feelingAdjectives[mood as keyof typeof feelingAdjectives] || "neutral")
      .replace("{weather}", weather[Math.floor(Math.random() * weather.length)])
      .replace("{activity}", activities[Math.floor(Math.random() * activities.length)])
      .replace("{learningPoint}", learningPoints[Math.floor(Math.random() * learningPoints.length)])
      .replace("{challenge}", challenges[Math.floor(Math.random() * challenges.length)])
      .replace("{solution}", solutions[Math.floor(Math.random() * solutions.length)])
      .replace("{tomorrowPlan}", tomorrowPlans[Math.floor(Math.random() * tomorrowPlans.length)])
      .replace("{progress}", progress[Math.floor(Math.random() * progress.length)])
      .replace("{improvement}", improvements[Math.floor(Math.random() * improvements.length)])
      .replace("{dayQuality}", dayQualities[Math.floor(Math.random() * dayQualities.length)]);
  };
  
  // Create journal entries for the past 60 days
  const journalEntries = [];
  
  for (let i = 60; i >= 0; i--) {
    // Skip some days to make it realistic (about 20% of days will be skipped)
    if (Math.random() < 0.2 && i !== 0) continue; // Don't skip today
    
    const entryDate = startOfDay(subDays(new Date(), i));
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const content = generateContent(randomMood, entryDate);
    
    const journalEntry = await prisma.journal.create({
      data: {
        title: `Journal for ${entryDate.toLocaleDateString()}`,
        content,
        mood: randomMood,
        date: entryDate,
        authorId: user.id,
      },
    });
    
    journalEntries.push(journalEntry);
    
    // Create habit logs for each entry (with some randomness for completion)
    for (const habit of habits.filter(h => h.active)) {
      // More likely to complete habits on recent days (learning and improvement)
      // Higher chance of completion for simple habits like "Drink water"
      let completionChance = 0.7; // Base chance
      
      if (habit.name === "Drink water") {
        completionChance = 0.9; // Higher chance for simple habits
      } else if (habit.name === "Exercise") {
        completionChance = 0.6; // Lower chance for demanding habits
      }
      
      // Improvement over time - lower chance further in the past
      if (i > 30) {
        completionChance -= 0.2;
      } else if (i > 15) {
        completionChance -= 0.1;
      }
      
      const completed = Math.random() < completionChance;
      
      await prisma.habitLog.create({
        data: {
          completed,
          notes: completed ? `Completed ${habit.name}` : null,
          journalId: journalEntry.id,
          habitId: habit.id,
        },
      });
    }
  }

  console.log(`Created ${journalEntries.length} journal entries with habit logs`);
  
  console.log("Database seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });