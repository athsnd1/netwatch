import Footer from "@/components/Footer"
import { SignIn } from "@clerk/react"

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center bg-light pt-12 h-dvh">
        <SignIn 
            forceRedirectUrl="/dashboard"
            appearance={{
                options: {
                    elevation: "flush"
                },
                elements: {
                    card: { boxShadow: "none", border: "1px solid #E5E5E5", borderRadius: "0px", padding: "1.25em", backgroundColor: "#ffffff" },
                    headerTitle: { fontFamily: "Space Grotesk"},
                    headerSubtitle: { fontFamily: "JetBrains Mono" },
                    socialButtons: { fontFamily: "Space Grotesk", border: "1px solid #E5E5E5",  },
                    socialButtonsBlockButton: { borderRadius: "0px" },
                    formFieldInput: { fontFamily: "Space Grotesk", borderRadius: "0px" },
                    formFieldLabel: { fontFamily: "Space Grotesk" },
                    formFieldAction: { fontFamily: "JetBrains Mono" },
                    formButtonPrimary: { fontFamily: "Space Grotesk", borderRadius: "0px", backgroundColor: "#111111" },
                    footerAction: { fontFamily: "Space Grotesk" },
                    dividerRow: { fontFamily: "Space Grotesk" },
                    formFieldErrorText: { fontFamily: "Space Grotesk" },
                    alert: { fontFamily: "Space Grotesk" },
                    footerActionLink: { fontFamily: "JetBrains Mono" },
                }
            }}    
        />

        <Footer />
    </div>
  )
}
