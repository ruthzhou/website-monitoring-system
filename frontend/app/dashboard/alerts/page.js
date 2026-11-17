
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:5000";

export default function AlertsPage() {
	const [alerts, setAlerts] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [settings, setSettings] = useState({
		email_enabled: true,
		notify_on_down: true,
		notify_on_recovery: true,
		notify_on_slow_response: false,
	});
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const getToken = () => localStorage.getItem("access_token");

	async function loadData() {
		const token = getToken();

		if (!token) {
			router.push("/login");
			return;
		}

		try {
			const headers = {
				Authorization: `Bearer ${token}`,
			};

			const [alertsResponse, settingsResponse] = await Promise.all([
				fetch(`${API_URL}/api/alerts/`, { headers }),
				fetch(`${API_URL}/api/notifications/settings/`, { headers }),
			]);

			if (alertsResponse.status === 401 || settingsResponse.status === 401) {
				localStorage.removeItem("access_token");
				router.push("/login");
				return;
			}

			const alertsData = await alertsResponse.json();
			const settingsData = await settingsResponse.json();

			if (!alertsResponse.ok) {
				throw new Error(alertsData.message || "Could not load alerts.");
			}

			if (!settingsResponse.ok) {
				throw new Error(settingsData.message || "Could not load settings.");
			}

			setAlerts(alertsData.alerts || []);
			setUnreadCount(alertsData.unread_count || 0);
			setSettings(settingsData.settings);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		let cancelled = false;

		async function fetchInitialData() {
			const token = localStorage.getItem("access_token");

			if (!token) {
				router.push("/login");
				return;
			}

			try {
				const headers = {
					Authorization: `Bearer ${token}`,
				};

				const [alertsResponse, settingsResponse] = await Promise.all([
					fetch(`${API_URL}/api/alerts/`, { headers }),
					fetch(`${API_URL}/api/notifications/settings/`, { headers }),
				]);

				if (alertsResponse.status === 401 || settingsResponse.status === 401) {
					localStorage.removeItem("access_token");
					router.push("/login");
					return;
				}

				const alertsData = await alertsResponse.json();
				const settingsData = await settingsResponse.json();

				if (!alertsResponse.ok) {
					throw new Error(alertsData.message || "Could not load alerts.");
				}

				if (!settingsResponse.ok) {
					throw new Error(settingsData.message || "Could not load settings.");
				}

				if (!cancelled) {
					setAlerts(alertsData.alerts || []);
					setUnreadCount(alertsData.unread_count || 0);
					setSettings(settingsData.settings);
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

		fetchInitialData();

		return () => {
			cancelled = true;
		};
	}, [router]);

	async function markAsRead(alertId) {
		const token = getToken();

		try {
			const response = await fetch(
				`${API_URL}/api/alerts/${alertId}/read`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Could not update alert.");
			}

			await loadData();
		} catch (err) {
			setError(err.message);
		}
	}

	async function markAllAsRead() {
		const token = getToken();

		try {
			const response = await fetch(`${API_URL}/api/alerts/read-all`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Could not update alerts.");
			}

			await loadData();
		} catch (err) {
			setError(err.message);
		}
	}

	async function deleteAlert(alertId) {
		const token = getToken();

		try {
			const response = await fetch(
				`${API_URL}/api/alerts/${alertId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Could not delete alert.");
			}

			await loadData();
		} catch (err) {
			setError(err.message);
		}
	}

	async function updateSetting(field, value) {
		const token = getToken();
		const updatedSettings = {
			...settings,
			[field]: value,
		};

		setSettings(updatedSettings);
		setSaving(true);
		setMessage("");
		setError("");

		try {
			const response = await fetch(
				`${API_URL}/api/notifications/settings/`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ [field]: value }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Could not save preferences.");
			}

			setSettings(data.settings);
			setMessage("Preferences saved successfully.");
		} catch (err) {
			setSettings(settings);
			setError(err.message);
		} finally {
			setSaving(false);
		}
	}

	function getAlertLabel(type) {
		switch (type) {
			case "website_down":
				return "Website Down";
			case "website_recovered":
				return "Website Recovered";
			case "slow_response":
				return "Slow Response";
			default:
				return type;
		}
	}

	function getAlertColor(type) {
		switch (type) {
			case "website_down":
				return "#dc2626";
			case "website_recovered":
				return "#16a34a";
			case "slow_response":
				return "#d97706";
			default:
				return "#64748b";
		}
	}

	if (loading) {
		return <main style={{ padding: "32px" }}>Loading alerts...</main>;
	}

	return (
		<main style={styles.container}>
			<header style={styles.header}>
				<div>
					<h1 style={styles.heading}>Alerts & Notifications</h1>
					<p style={styles.subtitle}>
						Monitor website incidents and manage your preferences.
					</p>
				</div>

				<a href="/dashboard" style={styles.link}>
					Back to Dashboard
				</a>
			</header>

			{error && <p style={styles.error}>{error}</p>}
			{message && <p style={styles.success}>{message}</p>}

			<section style={styles.card}>
				<div style={styles.sectionHeader}>
					<div>
						<h2 style={styles.subheading}>Your Alerts</h2>
						<p style={styles.subtitle}>
							{unreadCount} unread alert(s)
						</p>
					</div>

					{unreadCount > 0 && (
						<button style={styles.button} onClick={markAllAsRead}>
							Mark all as read
						</button>
					)}
				</div>

				{alerts.length === 0 ? (
					<p style={styles.empty}>
						No alerts yet. Your website monitoring system is ready.
					</p>
				) : (
					<div>
						{alerts.map((alert) => (
							<article
								key={alert.id}
								style={{
									...styles.alert,
									background: alert.is_read ? "#ffffff" : "#f1f5f9",
								}}
							>
								<div style={styles.alertTop}>
									<strong
										style={{
											color: getAlertColor(alert.alert_type),
										}}
									>
										{getAlertLabel(alert.alert_type)}
									</strong>

									<span style={styles.date}>
										{new Date(alert.created_at).toLocaleString()}
									</span>
								</div>

								<p style={styles.alertMessage}>{alert.message}</p>

								<p style={styles.website}>
									{alert.website_name} · {alert.website_url}
								</p>

								<div style={styles.actions}>
									{!alert.is_read && (
										<button
											style={styles.smallButton}
											onClick={() => markAsRead(alert.id)}
										>
											Mark as read
										</button>
									)}

									<button
										style={styles.deleteButton}
										onClick={() => deleteAlert(alert.id)}
									>
										Delete
									</button>
								</div>
							</article>
						))}
					</div>
				)}
			</section>

			<section style={styles.card}>
				<h2 style={styles.subheading}>Notification Preferences</h2>
				<p style={styles.subtitle}>
					Choose which events should generate in-app alerts.
				</p>

				<Setting
					label="Website goes offline"
					description="Alert me when a monitored website becomes unavailable."
					checked={settings.notify_on_down}
					onChange={(value) => updateSetting("notify_on_down", value)}
				/>

				<Setting
					label="Website recovers"
					description="Alert me when a previously unavailable website comes back online."
					checked={settings.notify_on_recovery}
					onChange={(value) => updateSetting("notify_on_recovery", value)}
				/>

				<Setting
					label="Slow response time"
					description="Alert me when response time crosses 2,000 ms."
					checked={settings.notify_on_slow_response}
					onChange={(value) =>
						updateSetting("notify_on_slow_response", value)
					}
				/>

				<hr style={styles.divider} />

				<Setting
					label="Email notifications"
					description="Preference only: actual email delivery requires email-provider configuration."
					checked={settings.email_enabled}
					onChange={(value) => updateSetting("email_enabled", value)}
				/>

				{saving && <p style={styles.subtitle}>Saving preferences...</p>}
			</section>
		</main>
	);
}

function Setting({ label, description, checked, onChange }) {
	return (
		<div style={styles.setting}>
			<div>
				<strong>{label}</strong>
				<p style={styles.subtitle}>{description}</p>
			</div>

			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
		</div>
	);
}

const styles = {
	container: {
		maxWidth: "1100px",
		margin: "0 auto",
		padding: "32px 20px",
		color: "#0f172a",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		flexWrap: "wrap",
		gap: "16px",
		marginBottom: "28px",
	},
	heading: {
		fontSize: "28px",
		fontWeight: "700",
		margin: "0 0 8px",
	},
	subheading: {
		fontSize: "20px",
		fontWeight: "650",
		margin: "0 0 8px",
	},
	subtitle: {
		color: "#64748b",
		fontSize: "14px",
		margin: "5px 0",
	},
	link: {
		color: "#2563eb",
		textDecoration: "none",
		fontWeight: "600",
	},
	card: {
		background: "#ffffff",
		border: "1px solid #e2e8f0",
		borderRadius: "12px",
		padding: "22px",
		marginBottom: "24px",
	},
	sectionHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		flexWrap: "wrap",
		gap: "12px",
		marginBottom: "15px",
	},
	alert: {
		border: "1px solid #e2e8f0",
		borderRadius: "8px",
		padding: "16px",
		marginTop: "12px",
	},
	alertTop: {
		display: "flex",
		justifyContent: "space-between",
		flexWrap: "wrap",
		gap: "8px",
	},
	alertMessage: {
		margin: "12px 0 6px",
		fontSize: "14px",
	},
	website: {
		color: "#64748b",
		fontSize: "13px",
		overflowWrap: "anywhere",
	},
	date: {
		color: "#64748b",
		fontSize: "12px",
	},
	actions: {
		display: "flex",
		gap: "12px",
		marginTop: "12px",
	},
	button: {
		padding: "9px 14px",
		border: "none",
		borderRadius: "6px",
		background: "#2563eb",
		color: "#ffffff",
		cursor: "pointer",
	},
	smallButton: {
		border: "none",
		background: "none",
		color: "#2563eb",
		cursor: "pointer",
	},
	deleteButton: {
		border: "none",
		background: "none",
		color: "#dc2626",
		cursor: "pointer",
	},
	setting: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		gap: "20px",
		padding: "16px 0",
		borderBottom: "1px solid #e2e8f0",
	},
	divider: {
		border: "none",
		borderTop: "1px solid #e2e8f0",
		margin: "20px 0",
	},
	empty: {
		padding: "24px 0",
		color: "#64748b",
	},
	error: {
		color: "#dc2626",
		background: "#fef2f2",
		padding: "12px",
		borderRadius: "6px",
	},
	success: {
		color: "#15803d",
		background: "#f0fdf4",
		padding: "12px",
		borderRadius: "6px",
	},
};
