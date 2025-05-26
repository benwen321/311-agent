import { auth } from "@/auth"
import { redirect } from 'next/navigation'

export default async function Dashboard() {
    const session = await auth()

    if (!session) {
        redirect("/api/auth/signin")
    }
    return (
        <div> 
            <text>dashboard</text>
        </div>
    )
}