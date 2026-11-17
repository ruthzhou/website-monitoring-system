
"use client";

import { useState } from "react";

export default function AddWebsitePage() {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [interval, setInterval] = useState(300);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        const token = localStorage.getItem("access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/websites/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        url,
                        check_interval_seconds: Number(interval),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || data.error || "Could not add website.");
                return;
            }

            window.location.href = "/dashboard";
        } catch (error) {
            setMessage("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    const inputStyle =
        "w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const labelStyle = "mb-2 block font-medium text-gray-700";

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">

                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    Add Website
                </h1>

                <p className="mb-6 text-gray-600">
                    Enter the details of the website you want to monitor.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label htmlFor="name" className={labelStyle}>
                            Website Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Company Website"
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label htmlFor="url" className={labelStyle}>
                            Website URL
                        </label>
                        <input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label htmlFor="interval" className={labelStyle}>
                            Check Interval (seconds)
                        </label>
                        <select
                            id="interval"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            className={inputStyle}
                        >
                            <option value={60}>Every 1 minute</option>
                            <option value={300}>Every 5 minutes</option>
                            <option value={600}>Every 10 minutes</option>
                            <option value={1800}>Every 30 minutes</option>
                            <option value={3600}>Every 1 hour</option>
                        </select>
                    </div>

                    {message && (
                        <p className="text-sm text-red-600">
                            {message}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Add Website"}
                        </button>

                        <a
                            href="/dashboard"
                            className="rounded-lg bg-gray-200 px-5 py-3 font-medium text-gray-800 hover:bg-gray-300"
                        >
                            Cancel
                        </a>
                    </div>

                </form>
            </div>
        </main>
    );
}
