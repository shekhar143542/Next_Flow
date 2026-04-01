'use server'

import { auth, currentUser } from '@clerk/nextjs/server'

type AuthResult = {
  status: 200 | 201 | 400 | 403 | 500
  user?: unknown
  message?: string
}

export const onAuthenticateUser = async (): Promise<AuthResult> => {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { status: 403 }
    }

    let user = await currentUser()


    if (!user) {
      return {
        status: 200,
        user: {
          clerkId: userId,
          email: '',
          name: '',
          profileImage: '',
        },
      }
    }

    let db: {
      user?: {
        findUnique: (args: { where: { clerkId: string } }) => Promise<unknown | null>
        create: (args: {
          data: {
            clerkId: string
            email: string
            name: string
            profileImage: string
          }
        }) => Promise<unknown>
      }
    } = {}


    try {
      const { prisma: client } = await import('@/lib/prisma')
      db = client as unknown as typeof db
    } catch {
      db = {}
    }

    // If the Prisma User model is not available yet, continue auth with Clerk user data.
    if (!db.user) {
      return {
        status: 200,
        user: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? '',
          name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
          profileImage: user.imageUrl,
        },
      }
    }

    const userExists = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    if (userExists) {
      return {
        status: 200,
        user: userExists,
      }
    }

    const newUser = await db.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress ?? '',
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        profileImage: user.imageUrl,
      },
    })

    if (newUser) {
      return {
        status: 201,
        user: newUser,
      }
    }

    return {
      status: 400,
    }
  } catch (_error) {
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}
