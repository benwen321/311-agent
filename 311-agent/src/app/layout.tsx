import Navbar from "@/components/Navbar";
export default function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html>
            <body>
                <div>
                    <Navbar/>
                </div>
                {children}
            </body>
        </html>
    )
}