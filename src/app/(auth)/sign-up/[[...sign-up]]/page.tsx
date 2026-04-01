import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const Signup = async () => {
  const { userId } = await auth()

  if (userId) {
    redirect('/home')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06080f] px-4">
      <SignUp
        forceRedirectUrl="/home"
        fallbackRedirectUrl="/home"
        appearance={{
          variables: {
            colorBackground: '#0b1220',
            colorText: '#f9fafb',
            colorTextSecondary: '#d1d5db',
            colorInputBackground: '#111827',
            colorInputText: '#f9fafb',
            colorPrimary: '#38bdf8',
            colorDanger: '#fda4af',
          },
          elements: {
            rootBox: 'w-full flex justify-center',
            cardBox: 'w-full max-w-md',
            card: 'bg-[#0b1220] border border-white/10 shadow-2xl !text-gray-100',
            headerTitle: '!text-white',
            headerSubtitle: '!text-slate-300',
            formHeaderTitle: '!text-white',
            formHeaderSubtitle: '!text-slate-300',
            socialButtonsBlockButton:
              'bg-slate-900 border border-white/45 ring-1 ring-white/25 !text-slate-100 hover:bg-slate-800',
            socialButtonsBlockButtonText: '!text-slate-100',
            socialButtonsBlockButtonArrow: '!text-slate-200',
            socialButtonsProviderIconBox:
              'inline-flex items-center justify-center min-w-11 h-8 px-2 rounded-full border border-white/60 bg-white',
            socialButtonsProviderIcon: '!h-5 !w-5',
            dividerLine: 'bg-white/10',
            dividerText: '!text-slate-400',
            formFieldLabel: '!text-slate-200',
            formFieldInput:
              'bg-slate-900 border border-white/15 !text-slate-100 placeholder:!text-slate-400',
            formFieldInputShowPasswordButton: '!text-slate-300 hover:!text-white',
            formFieldErrorText: '!text-rose-300',
            formFieldSuccessText: '!text-emerald-300',
            formButtonPrimary:
              'bg-sky-400 !text-slate-950 hover:bg-sky-300 shadow-md shadow-sky-500/30',
            identityPreviewText: '!text-slate-100',
            identityPreviewEditButton: '!text-slate-300 hover:!text-white',
            footerActionText: '!text-slate-300',
            footerActionLink: '!text-white hover:!text-sky-300',
            formResendCodeLink: '!text-sky-300 hover:!text-sky-200',
          },
        }}
      />
    </main>
  )
}

export default Signup