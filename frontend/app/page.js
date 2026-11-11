export default function Home() {
    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Website Monitoring System
                    </h1>

                    <p className="text-gray-500 mt-3">
                        Monitor your websites. Detect downtime. Stay informed.
                    </p>
                </div>

                <div className="space-y-4">

                    <a
                        href="/login"
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                    >
                        Login
                    </a>

                    <a
                        href="/register"
                        className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
                    >
                        Create an Account
                    </a>

                </div>

                <p className="text-center text-sm text-gray-400 mt-8">
                    © 2026 Website Monitoring System
                </p>

            </div>

        </main>
    );
}