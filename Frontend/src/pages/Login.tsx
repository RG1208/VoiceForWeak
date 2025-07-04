import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleChange(event: { target: { name: any; value: any; }; }) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(e: { preventDefault: () => void; }) {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_id", data.user_id);

                navigate("/dashboard")
            }

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
                    Login to Your Account
                </h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        New User?{" "}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Register now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
