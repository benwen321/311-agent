"use client"
import { signIn, signOut } from "next-auth/react"


export function LoginButton() {
  return (
    <button 
      onClick={() => signIn(undefined, { redirectTo: "/dashboard"})}
      className="btn-primary"
    >
      Sign In
    </button>
  )
}

export function SignOut() {
  return (
    <button 
      onClick={() => signOut()}
      className="btn-secondary"
    >
      Sign Out
    </button>
  )
}