
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [websites, setWebsites] = useState([]);
    const [statistics, setStatistics] = useState({
        total_websites: 0,
        active_websites: 0,
        inactive_websites: 0,
        online_websites: 0,
        offline_websites: 0,
        unknown_websites: 0,
        average_response_time: null,
    });

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingWebsite, setEditingWebsite] = useState(null);
    const [saving, setSaving] = useState(false);

    // FETCH DASHBOARD DATA
    async function fetchDashboard() {
        const token = localStorage.getItem("access_token");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/websites/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Failed to load dashboard."
                );
            }

            setStatistics(data.statistics || {});
            setWebsites(data.websites || []);
            setError("");
        } catch (err) {
            setError(err.message || "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function fetchInitialDashboard() {
            const token = localStorage.getItem("access_token");

            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/api/websites/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401) {
                    localStorage.removeItem("access_token");
                    router.push("/login");
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not load dashboard.");
                }

                if (!cancelled) {
                    setStatistics(data.statistics || {});
                    setWebsites(data.websites || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchInitialDashboard();

        return () => {
            cancelled = true;
        };
    }, [router]);

    // LOGOUT
    function handleLogout() {
        localStorage.removeItem("access_token");
        router.push("/login");
    }

    // DELETE WEBSITE
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

            await fetchDashboard();
        } catch (err) {
            setError(err.message);
        }
    }

    // START EDITING
    function startEditing(website) {
        setEditingWebsite({
            id: website.id,
            name: website.name,
            url: website.url,
            check_interval_seconds: website.check_interval_seconds,
            is_active: website.is_active,
        });
    }

    // UPDATE WEBSITE
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
                throw new Error(
                    data.message || data.error || "Failed to update website."
                );
            }

            setEditingWebsite(null);
            await fetchDashboard();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    // WEBSITE STATUS DISPLAY
    function getMonitoringStatus(website) {
        if (!website.is_active) {
            return {
                label: "Monitoring disabled",
                className: "text-gray-500",
            };
        }

        if (website.monitoring_status === "online") {
            return {
                label: "Online",
                className: "text-green-600",
            };
        }

        if (website.monitoring_status === "offline") {
            return {
                label: "Offline",
                className: "text-red-600",
            };
        }

        return {
            label: "Unknown",
            className: "text-yellow-600",
        };
    }

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

            <button
                onClick={() => router.push("/dashboard/alerts")}
                style={{
                    padding: "10px 16px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                }}
            >
                Alerts & Notifications
            </button>

            {/* DASHBOARD STATISTICS */}
            <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Total Websites</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {statistics.total_websites ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Online Websites</p>
                    <h2 className="mt-2 text-3xl font-bold text-green-600">
                        {statistics.online_websites ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Offline Websites</p>
                    <h2 className="mt-2 text-3xl font-bold text-red-600">
                        {statistics.offline_websites ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Active Monitoring</p>
                    <h2 className="mt-2 text-3xl font-bold text-blue-600">
                        {statistics.active_websites ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Inactive Monitoring</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-600">
                        {statistics.inactive_websites ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-gray-500">Average Response Time</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {statistics.average_response_time != null
                            ? `${statistics.average_response_time} ms`
                            : "N/A"}
                    </h2>
                </div>

            </section>

            {/* UNKNOWN STATUS NOTICE */}
            {(statistics.unknown_websites ?? 0) > 0 && (
                <p className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
                    {statistics.unknown_websites} active website(s) have not
                    been checked yet.
                </p>
            )}

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

                {loading && (
                    <p className="text-gray-700">Loading dashboard...</p>
                )}

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
                                <tr className="border-b text-gray-600">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">URL</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">HTTP Code</th>
                                    <th className="p-3">Response Time</th>
                                    <th className="p-3">Check Interval</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {websites.map((website) => {
                                    const status = getMonitoringStatus(website);

                                    return (
                                        <tr key={website.id} className="border-b">

                                            <td className="p-3 font-medium text-gray-900">
                                                {website.name}
                                            </td>

                                            <td className="p-3 text-gray-900">
                                                <a
                                                    href={website.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {website.url}
                                                </a>
                                            </td>

                                            <td className={`p-3 font-medium ${status.className}`}>
                                                {status.label}
                                            </td>

                                            <td className="p-3 font-medium text-gray-900">
                                                {website.latest_status_code ?? "N/A"}
                                            </td>

                                            <td className="p-3 text-gray-900">
                                                {website.latest_response_time != null
                                                    ? `${website.latest_response_time} ms`
                                                    : "N/A"}
                                            </td>

                                            <td className="p-3 text-gray-900">
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
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                )}

            </section>

            {/* EDIT WEBSITE MODAL */}
            {editingWebsite && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-xl">

                        <h2 className="mb-6 text-2xl font-bold text-gray-900">
                            Edit Website
                        </h2>

                        <form
                            onSubmit={handleUpdateWebsite}
                            className="space-y-5"
                        >

                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value={60}>Every 1 minute</option>
                                    <option value={300}>Every 5 minutes</option>
                                    <option value={600}>Every 10 minutes</option>
                                    <option value={1800}>Every 30 minutes</option>
                                    <option value={3600}>Every 1 hour</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
