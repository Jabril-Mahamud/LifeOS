import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }
    
    // Find or create user in our database based on Clerk ID
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If we don't have this user in our database yet, create them
    if (!dbUser) {
      // Get primary email from the Clerk user
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      
      if (!primaryEmail) {
        return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
      }
      
      // Create a new user in our database with data from Clerk
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          profileImage: clerkUser.imageUrl,
        },
      });
      
      console.log('Created new user in database:', dbUser);
    }

    // Get user's posts
    const posts = await prisma.post.findMany({
      where: { authorId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      user: dbUser, 
      posts,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' }, 
        { status: 400 }
      );
    }

    // Find the user in our database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If user doesn't exist in our database yet, create them
    if (!dbUser) {
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }
      
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      
      if (!primaryEmail) {
        return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
      }
      
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          profileImage: clerkUser.imageUrl,
        },
      });
    }

    // Create a new post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: dbUser.id,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}