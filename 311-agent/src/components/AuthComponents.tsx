"use client"
import { signIn, signOut } from "next-auth/react"


export function LoginButton() {
  return (
    <button onClick = {() => signIn(undefined, { redirectTo: "/dashboard"})}>Login</button>
  )
}

export function SignOut() {
  return <button onClick={() => signOut()}>Sign Out</button>
}