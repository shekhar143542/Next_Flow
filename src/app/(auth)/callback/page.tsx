import { onAuthenticateUser } from '@/app/(auth)/actions/user'
import { auth as clerkAuth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const AuthCallBackPage = async () => {
    const { userId } = await clerkAuth()

    if (!userId) {
        redirect('/sign-in')
    }

    const authResult = await onAuthenticateUser()

    if (authResult.status === 200 || authResult.status === 201) {
        redirect('/home')
    }

    // Prevent callback <-> sign-in loops for authenticated users if DB sync fails.
    redirect('/home')
}

export default AuthCallBackPage