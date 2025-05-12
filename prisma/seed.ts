import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.organizationMember.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding the database...");

  // Create a sample user
  const user = await prisma.user.create({
    data: {
      clerkId: "sample-clerk-id-1",
      email: "john@example.com",
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
