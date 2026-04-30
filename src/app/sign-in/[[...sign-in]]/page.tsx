'use client'
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  console.log('nextflow Candidate Linkedin: https://www.linkedin.com/in/rajanayak/')
  return <SignIn routing="path" path="/sign-in" />
}