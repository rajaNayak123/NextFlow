import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  console.log('nextflow Candidate Linkedin: https://www.linkedin.com/in/your-profile/')
  return <SignUp routing="path" path="/sign-up" />
}