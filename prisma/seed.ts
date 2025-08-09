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
      firstName: "Jabril",
      lastName: "Mahamud",
      profileImage: "https://via.placeholder.com/150",
    },
  });

  console.log("Created user:", user);

  // Optionally seed organizations if explicitly enabled
  const shouldSeedOrgs =
    process.env.SEED_ORGS === "true" || process.env.CLERK_ORGS_ENABLED === "true";

  if (shouldSeedOrgs) {
    const organization = await prisma.organization.create({
      data: {
        clerkId: "sample-clerk-org-id-1",
        name: "Demo Company",
        imageUrl: "https://via.placeholder.com/150",
      },
    });

    console.log("Created organization:", organization);

    const membership = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "admin",
      },
    });

    console.log("Created organization membership:", membership);
  } else {
    console.log("Skipping organization seeding (set SEED_ORGS=true to enable)");
  }

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

  // Create focused habits aligned with user goals
  const habits = await Promise.all([
    // Job Search & Networking
    prisma.habit.create({
      data: {
        name: "Job Applications",
        description: "Submit 3 quality job applications with customized cover letters daily. Building momentum in the job search!",
        icon: "briefcase",
        color: "#3b82f6", // Blue
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Network Outreach",
        description: "Connect with 2 industry professionals on LinkedIn daily. Growing your network opens doors!",
        icon: "users",
        color: "#0ea5e9", // Sky
        active: true,
        authorId: user.id,
      },
    }),
    
    // Developer Skills
    prisma.habit.create({
      data: {
        name: "LeetCode Practice",
        description: "Solve 2 LeetCode problems daily. Sharpen your problem-solving skills for interviews!",
        icon: "code",
        color: "#6366f1", // Indigo
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Python Projects",
        description: "Code for 1 hour on Python projects daily. Building your portfolio one commit at a time!",
        icon: "code-2",
        color: "#8b5cf6", // Violet
        active: true,
        authorId: user.id,
      },
    }),
    
    // Fitness & Health
    prisma.habit.create({
      data: {
        name: "Strength Training",
        description: "Complete 30 minutes of strength exercises daily. Building a stronger, healthier you!",
        icon: "dumbbell",
        color: "#ef4444", // Red
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Meal Prep",
        description: "Prepare healthy meals for tomorrow daily. Fuel your body for success!",
        icon: "utensils",
        color: "#22c55e", // Green
        active: true,
        authorId: user.id,
      },
    }),
    
    // Arabic Language
    prisma.habit.create({
      data: {
        name: "Arabic Vocabulary",
        description: "Learn 10 new Arabic words daily. Every word brings you closer to fluency!",
        icon: "book-open",
        color: "#f59e0b", // Amber
        active: true,
        authorId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        name: "Arabic Practice",
        description: "30 minutes of Arabic speaking or writing practice daily. Confidence grows with practice!",
        icon: "message-square",
        color: "#eab308", // Yellow
        active: true,
        authorId: user.id,
      },
    }),
    
    // Personal Organization
    prisma.habit.create({
      data: {
        name: "Evening Planning",
        description: "Plan tomorrow's schedule and priorities each evening. Set yourself up for success!",
        icon: "calendar",
        color: "#a855f7", // Purple
        active: true,
        authorId: user.id,
      },
    }),
  ]);

  console.log(`Created ${habits.length} habits`);

  // Create focused projects aligned with current priorities
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Job Search & Networking",
        description: "Strategic job search campaign focusing on full-stack developer positions. Building connections and preparing for interviews.",
        icon: "briefcase",
        color: "#3b82f6", // Blue
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Developer Skill Growth",
        description: "Systematic approach to enhancing technical skills through focused learning and project work.",
        icon: "code",
        color: "#6366f1", // Indigo
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Fitness & Health Plan",
        description: "Comprehensive fitness and nutrition program focused on strength training and healthy eating habits.",
        icon: "dumbbell",
        color: "#ef4444", // Red
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Arabic Language Journey",
        description: "Structured approach to achieving conversational fluency in Arabic through daily practice and immersion.",
        icon: "book-open",
        color: "#f59e0b", // Amber
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Personal Life Organization",
        description: "Establishing and maintaining productive daily routines and life management systems.",
        icon: "layout-grid",
        color: "#a855f7", // Purple
        completed: false,
        archived: false,
        authorId: user.id,
      },
    }),
  ]);

  console.log(`Created ${projects.length} projects`);

  // Create tasks for projects
  const jobSearchTasks = [
    {
      title: "Update Resume with Latest Skills",
      description: "Enhance resume with recent projects and technical skills. Focus on full-stack development achievements.",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 5),
      completedAt: subDays(new Date(), 3),
      projectId: projects[0].id,
    },
    {
      title: "Create Portfolio Website",
      description: "Build a professional portfolio showcasing your best projects and technical blog posts.",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 7),
      completedAt: null,
      projectId: projects[0].id,
    },
    {
      title: "Research Target Companies",
      description: "Create list of 20 companies hiring full-stack developers. Research their tech stacks and culture.",
      status: "in-progress",
      priority: "medium",
      dueDate: addDays(new Date(), 3),
      completedAt: null,
      projectId: projects[0].id,
    },
    {
      title: "Prepare STAR Stories",
      description: "Document 10 specific technical achievements using the STAR method for interviews.",
      status: "pending",
      priority: "high",
      dueDate: addDays(new Date(), 5),
      completedAt: null,
      projectId: projects[0].id,
    },
    {
      title: "Set up Job Search Tracking",
      description: "Create spreadsheet to track applications, follow-ups, and interview stages.",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 2),
      completedAt: null,
      projectId: projects[0].id,
    },
  ];

  const devSkillsTasks = [
    {
      title: "Complete Python Advanced Course",
      description: "Finish advanced Python course focusing on backend development and APIs.",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 14),
      completedAt: null,
      projectId: projects[1].id,
    },
    {
      title: "Build Full-Stack Project",
      description: "Create a full-stack application using Python backend and React frontend.",
      status: "pending",
      priority: "high",
      dueDate: addDays(new Date(), 30),
      completedAt: null,
      projectId: projects[1].id,
    },
    {
      title: "Complete LeetCode Study Plan",
      description: "Work through curated list of 50 essential coding problems for interviews.",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 21),
      completedAt: null,
      projectId: projects[1].id,
    },
    {
      title: "Learn System Design",
      description: "Study and document key system design patterns and architectures.",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 45),
      completedAt: null,
      projectId: projects[1].id,
    },
  ];

  const fitnessTasks = [
    {
      title: "Create Workout Schedule",
      description: "Design 4-day split workout routine focusing on strength training.",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 7),
      completedAt: subDays(new Date(), 6),
      projectId: projects[2].id,
    },
    {
      title: "Plan Meal Prep System",
      description: "Develop weekly meal prep routine with healthy, high-protein recipes.",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 3),
      completedAt: null,
      projectId: projects[2].id,
    },
    {
      title: "Set Up Home Gym",
      description: "Purchase and organize essential equipment for home workouts.",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 14),
      completedAt: null,
      projectId: projects[2].id,
    },
    {
      title: "Track Progress Metrics",
      description: "Set up system to track weight, measurements, and strength progress.",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 7),
      completedAt: null,
      projectId: projects[2].id,
    },
  ];

  const arabicTasks = [
    {
      title: "Complete Arabic Basics Course",
      description: "Finish foundational Arabic course covering essential grammar and vocabulary.",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 30),
      completedAt: subDays(new Date(), 28),
      projectId: projects[3].id,
    },
    {
      title: "Set Up Language Exchange",
      description: "Find and schedule regular practice sessions with native speakers.",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 7),
      completedAt: null,
      projectId: projects[3].id,
    },
    {
      title: "Create Vocabulary System",
      description: "Set up Anki deck for spaced repetition vocabulary practice.",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 5),
      completedAt: null,
      projectId: projects[3].id,
    },
    {
      title: "Plan Immersion Strategy",
      description: "Curate Arabic podcasts, YouTube channels, and reading materials.",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 10),
      completedAt: null,
      projectId: projects[3].id,
    },
  ];

  const personalOrgTasks = [
    {
      title: "Design Morning Routine",
      description: "Create optimal morning routine incorporating exercise and learning.",
      status: "completed",
      priority: "high",
      dueDate: subDays(new Date(), 14),
      completedAt: subDays(new Date(), 13),
      projectId: projects[4].id,
    },
    {
      title: "Set Up Task Management",
      description: "Implement GTD system for managing projects and responsibilities.",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(new Date(), 5),
      completedAt: null,
      projectId: projects[4].id,
    },
    {
      title: "Create Budget System",
      description: "Set up detailed budget tracking for job transition period.",
      status: "pending",
      priority: "high",
      dueDate: addDays(new Date(), 7),
      completedAt: null,
      projectId: projects[4].id,
    },
    {
      title: "Organize Digital Files",
      description: "Implement file organization system for documents and projects.",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 14),
      completedAt: null,
      projectId: projects[4].id,
    },
  ];

  // Create standalone tasks (not associated with any project)
  const standaloneTasks = [
    {
      title: "Schedule Health Checkup",
      description: "Book annual physical examination before job transition",
      status: "pending",
      priority: "medium",
      dueDate: addDays(new Date(), 14),
      completedAt: null,
      projectId: null,
    },
    {
      title: "Update LinkedIn Profile",
      description: "Refresh LinkedIn with latest skills and achievements",
      status: "pending",
      priority: "high",
      dueDate: addDays(new Date(), 2),
      completedAt: null,
      projectId: null,
    },
    {
      title: "Review Monthly Budget",
      description: "Adjust monthly budget for job search period",
      status: "pending",
      priority: "high",
      dueDate: addDays(new Date(), 1),
      completedAt: null,
      projectId: null,
    },
  ];

  // Combine all tasks
  const allTasks = [
    ...jobSearchTasks,
    ...devSkillsTasks,
    ...fitnessTasks,
    ...arabicTasks,
    ...personalOrgTasks,
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
    
    // Create habit logs for each entry with realistic completion patterns
    for (const habit of habits.filter(h => h.active)) {
      let completionChance = 0.65; // Base chance - realistic but showing room for improvement
      let notes = null;

      // Adjust completion chances based on habit type and difficulty
      switch (habit.name) {
        // Job Search - higher completion on weekdays
        case "Job Applications":
        case "Network Outreach":
          completionChance = entryDate.getDay() >= 1 && entryDate.getDay() <= 5 ? 0.8 : 0.3;
          break;

        // Developer Skills - steady effort with some variation
        case "LeetCode Practice":
        case "Python Projects":
          completionChance = 0.7;
          break;

        // Fitness - affected by energy levels and weekends
        case "Strength Training":
          completionChance = entryDate.getDay() === 0 ? 0.4 : 0.75; // Lower on Sundays
          break;
        case "Meal Prep":
          completionChance = entryDate.getDay() === 0 ? 0.85 : 0.7; // Higher on Sundays
          break;

        // Language Learning - steady daily practice
        case "Arabic Vocabulary":
        case "Arabic Practice":
          completionChance = 0.75; // Consistent daily effort
          break;

        // Personal Organization - high priority
        case "Evening Planning":
          completionChance = 0.85; // High completion as it's crucial for next day
          break;
      }

      // Improvement over time - show progress in habit formation
      if (i > 45) {
        completionChance -= 0.25; // Early days - still building habits
      } else if (i > 30) {
        completionChance -= 0.15; // Starting to improve
      } else if (i > 15) {
        completionChance -= 0.05; // Getting better
      }

      const completed = Math.random() < completionChance;

      // Add meaningful notes for completed habits
      if (completed) {
        switch (habit.name) {
          case "Job Applications":
            notes = "Applied to senior positions at tech companies";
            break;
          case "Network Outreach":
            notes = "Connected with developers in target companies";
            break;
          case "LeetCode Practice":
            notes = "Completed array and string manipulation problems";
            break;
          case "Python Projects":
            notes = "Worked on API implementation and testing";
            break;
          case "Strength Training":
            notes = "Completed full body workout with progressive overload";
            break;
          case "Meal Prep":
            notes = "Prepared healthy meals for next 3 days";
            break;
          case "Arabic Vocabulary":
            notes = "Learned new vocabulary for daily conversations";
            break;
          case "Arabic Practice":
            notes = "Practiced speaking with language exchange partner";
            break;
          case "Evening Planning":
            notes = "Planned tomorrow's tasks and priorities";
            break;
        }
      }

      await prisma.habitLog.create({
        data: {
          completed,
          notes,
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