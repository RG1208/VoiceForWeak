/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function Register() {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
    });

    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const lang = localStorage.getItem('language_preference');
        if (lang && lang !== i18n.language) {
            i18n.changeLanguage(lang);
        }
    }, [i18n]);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Registration successful!");
                navigate("/login");
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Network error during registration.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
                    {t('register_title')}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t('register_email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('register_email_placeholder')}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t('register_name')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('register_name_placeholder')}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t('register_password')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('register_password_placeholder')}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        {t('register_button')}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {t('register_already_user')} {" "}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            {t('register_signin_now')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
