import Link from 'next/link'
import { LoginButton } from "./AuthComponents"

export default function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium ring-2 ring-primary-100">
                                <span className="text-white text-lg font-bold">🏛️</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                                    Municipal Dashboard
                                </h1>
                                <p className="text-xs text-gray-500 leading-tight">
                                    311 Issue Management
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/dashboard" 
                            className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                        >
                            Dashboard
                        </Link>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-4">
                        <LoginButton />
                    </div>
                </div>
            </div>
        </nav>
    )
}