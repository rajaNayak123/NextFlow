import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  console.log('nextflow Candidate Linkedin: https://www.linkedin.com/in/your-profile/')
  return <SignIn routing="path" path="/sign-in" />
}