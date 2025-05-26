import Link from 'next/link'
import { LoginButton } from "./AuthComponents"

export default function Navbar() {
    return (
        <nav>
            <div>
                <Link href="/" passHref>
                    <span>Homepage</span>
                </Link>
            </div>
            <div>
                <LoginButton />
            </div>
        </nav>
    )
}