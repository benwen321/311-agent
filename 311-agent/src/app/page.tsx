import Link from 'next/link';

export default function Homepage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-6">
                            <span className="text-primary-600 text-sm font-medium">
                                🏛️ Municipal Management System
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Modern <span className="text-primary-600">311 Issue</span><br />
                            Management Dashboard
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Streamline municipal operations with our comprehensive platform for tracking, 
                            managing, and resolving city infrastructure issues efficiently.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                            Access Dashboard
                        </Link>
                        <Link href="/auth/signin" className="btn-outline text-lg px-8 py-3">
                            Sign In
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                            <div className="text-gray-600">Issues Tracked</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-success-600 mb-2">85%</div>
                            <div className="text-gray-600">Resolution Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-info-600 mb-2">24/7</div>
                            <div className="text-gray-600">Monitoring</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything You Need to Manage City Issues
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From real-time tracking to comprehensive reporting, our platform provides 
                            all the tools municipal teams need.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card">
                            <div className="card-body text-center">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🗺️</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Map</h3>
                                <p className="text-gray-600">
                                    Visualize all issues on an interactive map with real-time updates and color-coded markers.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="card">
                            <div className="card-body text-center">
                                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Management</h3>
                                <p className="text-gray-600">
                                    Assign issues to team members and track progress with role-based access controls.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="card">
                            <div className="card-body text-center">
                                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics</h3>
                                <p className="text-gray-600">
                                    Comprehensive reporting and analytics to track performance and identify trends.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Modernize Your Municipal Operations?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Join progressive cities already using our platform to improve citizen services.
                    </p>
                    <Link href="/dashboard" className="inline-flex items-center px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-medium">
                        Get Started Today
                    </Link>
                </div>
            </section>
        </div>
    )
}