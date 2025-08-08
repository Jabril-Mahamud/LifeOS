import prisma from '@/lib/prisma';
import type { User as DbUser } from '@prisma/client';

/**
 * Resolve the application user for a given Clerk user.
 * - Prefer match by Clerk userId
 * - If not found, match by primary email and attach the Clerk userId
 * - Otherwise, create a new user
 */
type ClerkEmailAddress = { id: string; emailAddress: string };
type ClerkUser = {
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  primaryEmailAddressId?: string | null;
  emailAddresses?: ClerkEmailAddress[];
};

export async function getOrCreateDbUser(userId: string, clerkUser: ClerkUser): Promise<DbUser> {
  if (!userId) {
    throw new Error('AUTH_REQUIRED');
  }

  const primaryEmail: string | undefined = clerkUser?.emailAddresses?.find(
    (email: ClerkEmailAddress) => email.id === clerkUser?.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    throw new Error('EMAIL_REQUIRED');
  }

  // 1) Try find by Clerk ID first
  const byClerkId = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (byClerkId) {
    return byClerkId;
  }

  // 2) If not found, try by email, then attach Clerk ID
  const byEmail = await prisma.user.findUnique({ where: { email: primaryEmail } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkId: userId,
        firstName: clerkUser?.firstName ?? byEmail.firstName,
        lastName: clerkUser?.lastName ?? byEmail.lastName,
        profileImage: clerkUser?.imageUrl ?? byEmail.profileImage,
      },
    });
  }

  // 3) Otherwise create
  return prisma.user.create({
    data: {
      clerkId: userId,
      email: primaryEmail,
      firstName: clerkUser?.firstName ?? null,
      lastName: clerkUser?.lastName ?? null,
      profileImage: clerkUser?.imageUrl ?? null,
    },
  });
}

