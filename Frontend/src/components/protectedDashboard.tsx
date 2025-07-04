export default function Dashboard() {
    const userId = localStorage.getItem("user_id");

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="p-8">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
                    Welcome Back, User {userId}!
                </h2>
                <p className="text-gray-700 mb-8">
                    You're logged in to <strong>Voice for Weak</strong>, a platform built to empower citizens with access to human rights resources and government schemes.
                </p>

                <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
                    <h3 className="text-2xl font-bold text-blue-700 mb-4">
                        About This Project
                    </h3>
                    <p className="text-gray-700">
                        Voice for Weak is an initiative to bridge the gap between citizens and available legal resources. It leverages AI to assist users in two critical areas:
                    </p>
                    <ul className="list-disc pl-6 mt-4 text-gray-700 space-y-2">
                        <li><strong>Human Rights Voice Assistant:</strong> Users can ask questions via voice to get guidance on human rights issues.</li>
                        <li><strong>Government Scheme Recommender:</strong> Recommends the most suitable government welfare schemes based on user inputs.</li>
                    </ul>
                </section>

                <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-blue-700 mb-4">
                        Key Features
                    </h3>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-2">
                        <li>Voice-enabled legal rights assistant powered by AI.</li>
                        <li>Personalized scheme recommendations based on your needs.</li>
                        <li>User-friendly and secure platform with role-based access.</li>
                        <li>Seamless integration of voice and form-based inputs.</li>
                    </ul>
                </section>

                <div className="mt-8 text-center text-gray-600">
                    <p className="italic">
                        “Empowering every citizen to know their rights and access their entitlements.”
                    </p>
                </div>
            </div>
        </div>
    );
}
