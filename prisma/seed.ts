import { PrismaClient } from "@prisma/client";
import { startOfDay, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.habitLog.deleteMany({});
  await prisma.habit.deleteMany({});
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
      name: "Acme Inc",
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
      title: "Hello World",
      content: "This is my first post with Prisma!",
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
        description: "Daily mindfulness practice",
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
  ]);

  console.log(`Created ${habits.length} habits`);

  // Sample moods for journal entries
  const moods = ["happy", "calm", "neutral", "anxious", "sad", "excited", "tired"];
  
  // Create sample journal entries for the past 90 days
  const journalEntries = [];
  
  for (let i = 90; i >= 0; i--) {
    // Skip some days to make it realistic
    if (i === 5 || i === 10 || i === 15 || i === 20 || i === 30 || i === 40 || i === 50 || i === 60 || i === 70) continue;
    
    const entryDate = startOfDay(subDays(new Date(), i));
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    
    const journalEntry = await prisma.journal.create({
      data: {
        title: `Journal Entry for ${entryDate.toLocaleDateString()}`,
        content: `Today was a ${randomMood} day. ${getSampleContent(randomMood)}`,
        mood: randomMood,
        date: entryDate,
        authorId: user.id,
      },
    });
    
    journalEntries.push(journalEntry);
    
    // Create habit logs for each entry (with some randomness for completion)
    for (const habit of habits.filter(h => h.active)) {
      // Randomly decide if the habit was completed (more likely to be completed than not)
      const completed = Math.random() > 0.3;
      
      await prisma.habitLog.create({
        data: {
          completed,
          notes: completed ? getSampleHabitNote(habit.name) : null,
          journalId: journalEntry.id,
          habitId: habit.id,
        },
      });
    }
  }

  console.log(`Created ${journalEntries.length} journal entries with habit logs`);
  
  console.log("Database seeding completed.");
}

// Helper function to get sample content based on mood
function getSampleContent(mood: string): string {
  switch(mood) {
    case "happy":
      return "I accomplished several tasks and had a productive day. I'm feeling optimistic about my progress.";
    case "calm":
      return "I took time to relax and clear my mind. The meditation session was particularly effective today.";
    case "neutral":
      return "Nothing remarkable happened today. I went through my regular routine and tasks.";
    case "anxious":
      return "I felt a bit overwhelmed with work today. I need to practice more mindfulness to manage stress better.";
    case "sad":
      return "Today was challenging emotionally. I'm reminding myself that it's okay to have down days.";
    case "excited":
      return "I received some great news today! I'm looking forward to the opportunities ahead.";
    case "tired":
      return "I didn't sleep well last night, which affected my energy levels today. I should aim for an earlier bedtime.";
    default:
      return "Today was an average day. Looking forward to tomorrow.";
  }
}

// Helper function to get sample habit notes
function getSampleHabitNote(habitName: string): string {
  switch(habitName) {
    case "Meditation":
      return "10 minutes of guided meditation. Felt very calming.";
    case "Read 30 minutes":
      return "Read 2 chapters of 'Atomic Habits'.";
    case "Exercise":
      return "30 minute jog in the park.";
    case "Drink water":
      return "Finished my water bottle 3 times today.";
    default:
      return "Completed successfully.";
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });