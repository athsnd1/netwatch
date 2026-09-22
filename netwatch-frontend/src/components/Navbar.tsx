import { Bot } from "./animate-ui/icons/bot"
import { useAuth, UserButton } from '@clerk/react'

export default function Navbar() {
  const { isSignedIn } = useAuth()

  return (
    <div className="h-[60px] w-screen p-4 flex items-center justify-between border-b border-bordercol sticky top-0 bg-cards z-1050">

        <h1 className="flex items-center gap-1">
            <Bot animateOnHover={true} animateOnView={true} className="text-black"/>
            <span className="font-space text-lg font-semibold mt-1">NetWatch</span>
        </h1>

        {isSignedIn && (
          <UserButton />
        )}

    </div>
  )
}
