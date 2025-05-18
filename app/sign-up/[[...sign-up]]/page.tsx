// This updated version uses shadcn/ui components for the sign-up page
import { SignUp } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="container flex h-screen items-center justify-center py-20">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Sign up to start tracking your journal entries and habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                header: "hidden",
                footer: "hidden"
              }
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}