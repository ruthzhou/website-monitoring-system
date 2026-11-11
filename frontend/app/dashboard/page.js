
"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingWebsite, setEditingWebsite] = useState(null);
    const [saving, setSaving] = useState(false);


    async function fetchWebsites() {
        const token = localStorage.getItem("access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/websites/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to load websites.");
            }

            setWebsites(data.websites || []);
        } catch (err) {
            setError(err.message || "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWebsites();
    }, []);

   

    function handleLogout() {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    }

    async function handleDeleteWebsite(websiteId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this website?"
        );

        if (!confirmed) return;

        const token = localStorage.getItem("access_token");

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/api/websites/${websiteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete website.");
            }

            setWebsites((previous) =>
                previous.filter((website) => website.id !== websiteId)
            );

            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    function startEditing(website) {
        setEditingWebsite({
            id: website.id,
            name: website.name,
            url: website.url,
            check_interval_seconds: website.check_interval_seconds,
            is_active: website.is_active,
        });
    }

    async function handleUpdateWebsite(event) {
        event.preventDefault();

        const token = localStorage.getItem("access_token");
        setSaving(true);
        setError("");

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/api/websites/${editingWebsite.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editingWebsite.name,
                        url: editingWebsite.url,
                        check_interval_seconds: Number(
                            editingWebsite.check_interval_seconds
                        ),
                        is_active: editingWebsite.is_active,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to update website.");
            }

            setWebsites((previous) =>
                previous.map((website) =>
                    website.id === editingWebsite.id
                        ? { ...website, ...data.website }
                        : website
                )
            );

            setEditingWebsite(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const activeCount = websites.filter(
        (website) => website.is_active
    ).length;

    const inactiveCount = websites.length - activeCount;

    return (
        <main className="min-h-screen bg-gray-100 p-8">

            {/* HEADER */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Website Monitoring System
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Welcome to your monitoring dashboard.
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                >
                    Logout
                </button>
            </header>

            {/* STATISTICS */}
            <section className="mb-8 grid gap-6 md:grid-cols-3">

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Total Websites</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {websites.length}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Active Websites</p>
                    <h2 className="mt-2 text-3xl font-bold text-green-600">
                        {activeCount}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Inactive Websites</p>
                    <h2 className="mt-2 text-3xl font-bold text-red-600">
                        {inactiveCount}
                    </h2>
                </div>

            </section>

            {/* WEBSITE LIST */}
            <section className="rounded-xl bg-white p-6 shadow">

                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        My Websites
                    </h2>

                    <a
                        href="/dashboard/add"
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                    >
                        + Add Website
                    </a>
                </div>

                {loading && <p>Loading websites...</p>}

                {error && (
                    <p className="mb-4 text-red-600">{error}</p>
                )}

                {!loading && websites.length === 0 && (
                    <p className="text-gray-500">
                        No websites added yet.
                    </p>
                )}

                {!loading && websites.length > 0 && (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead>
                                <tr className="border-b text-gray-500">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">URL</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Check Interval</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {websites.map((website) => (

                                    <tr key={website.id} className="border-b">

                                        <td className="p-3 font-medium">
                                            {website.name}
                                        </td>

                                        <td className="p-3">
                                            <a
                                                href={website.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {website.url}
                                            </a>
                                        </td>

                                        <td className="p-3">
                                            <span
                                                className={
                                                    website.is_active
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }
                                            >
                                                {website.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            {website.check_interval_seconds} seconds
                                        </td>

                                        <td className="p-3">
                                            <div className="flex gap-2">

                                                <button
                                                    onClick={() => startEditing(website)}
                                                    className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteWebsite(website.id)}
                                                    className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </section>

            {/* EDIT WEBSITE MODAL */}
            {editingWebsite && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-xl">

                        <h2 className="mb-6 text-2xl font-bold">
                            Edit Website
                        </h2>

                        <form
                            onSubmit={handleUpdateWebsite}
                            className="space-y-5"
                        >

                            <div>
                                <label className="mb-2 block font-medium">
                                    Website Name
                                </label>

                                <input
                                    type="text"
                                    value={editingWebsite.name}
                                    onChange={(e) =>
                                        setEditingWebsite({
                                            ...editingWebsite,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-lg border p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Website URL
                                </label>

                                <input
                                    type="url"
                                    value={editingWebsite.url}
                                    onChange={(e) =>
                                        setEditingWebsite({
                                            ...editingWebsite,
                                            url: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-lg border p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Check Interval
                                </label>

                                <select
                                    value={editingWebsite.check_interval_seconds}
                                    onChange={(e) =>
                                        setEditingWebsite({
                                            ...editingWebsite,
                                            check_interval_seconds: Number(e.target.value),
                                        })
                                    }
                                    className="w-full rounded-lg border p-3"
                                >
                                    <option value={60}>Every 1 minute</option>
                                    <option value={300}>Every 5 minutes</option>
                                    <option value={600}>Every 10 minutes</option>
                                    <option value={1800}>Every 30 minutes</option>
                                    <option value={3600}>Every 1 hour</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Website Status
                                </label>

                                <select
                                    value={String(editingWebsite.is_active)}
                                    onChange={(e) =>
                                        setEditingWebsite({
                                            ...editingWebsite,
                                            is_active: e.target.value === "true",
                                        })
                                    }
                                    className="w-full rounded-lg border p-3"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditingWebsite(null)}
                                    className="rounded-lg bg-gray-200 px-5 py-3 text-gray-800 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </main>
    );
}
