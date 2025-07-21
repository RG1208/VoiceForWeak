import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
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
                localStorage.setItem("name", data.name);

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
                    {t('login_title')}
                </h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            {t('login_email')}
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('login_email_placeholder')}
                            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            {t('login_password')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('login_password_placeholder')}
                            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        {t('login_button')}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {t('login_new_user')} {" "}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            {t('login_register_now')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
