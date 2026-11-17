
import time
from datetime import datetime, timezone

import requests

from app.extensions import db
from app.models.website import Website
from app.models.monitor_log import MonitorLog
from app.models.alert import Alert
from app.models.notification_settings import NotificationSettings


# Response times above this value are considered slow.
SLOW_RESPONSE_THRESHOLD_MS = 2000


def create_alert(website, alert_type, message):
    """Create an in-app alert for a website."""
    alert = Alert(
        website_id=website.id,
        alert_type=alert_type,
        message=message
    )
    db.session.add(alert)


def check_website(website):
    """
    Check website availability, save monitoring results,
    and generate alerts when monitoring conditions change.
    """

    previous_log = (
        MonitorLog.query
        .filter_by(website_id=website.id)
        .order_by(
            MonitorLog.checked_at.desc(),
            MonitorLog.id.desc()
        )
        .first()
    )

    start_time = time.perf_counter()

    status_code = None
    response_time = None
    is_up = False
    error_message = None

    try:
        response = requests.get(
            website.url,
            timeout=10,
            allow_redirects=True,
            headers={
                "User-Agent": "WebsiteMonitoringSystem/1.0"
            }
        )

        status_code = response.status_code
        is_up = 200 <= status_code < 400

        if not is_up:
            error_message = f"HTTP Error: {status_code}"

    except requests.exceptions.Timeout:
        error_message = "Request timed out after 10 seconds"

    except requests.exceptions.ConnectionError:
        error_message = "Could not connect to the website"

    except requests.exceptions.RequestException as error:
        error_message = str(error)

    except Exception as error:
        error_message = f"Unexpected error: {str(error)}"

    response_time = round(
        (time.perf_counter() - start_time) * 1000,
        2
    )

    checked_at = datetime.now(timezone.utc)

    monitor_log = MonitorLog(
        website_id=website.id,
        status_code=status_code,
        response_time=response_time,
        is_up=is_up,
        error_message=error_message,
        checked_at=checked_at
    )

    website.last_checked_at = checked_at

    settings = NotificationSettings.query.filter_by(
        user_id=website.user_id
    ).first()

    # Use the model defaults if the user has no settings row yet.
    notify_on_down = (
        settings is None or settings.notify_on_down
    )
    notify_on_recovery = (
        settings is None or settings.notify_on_recovery
    )
    notify_on_slow_response = (
        settings is not None and settings.notify_on_slow_response
    )

    if previous_log is not None:

        # Online -> Offline
        if previous_log.is_up and not is_up and notify_on_down:
            create_alert(
                website,
                "website_down",
                f"{website.name} is DOWN. "
                f"{website.url} is not responding successfully."
            )

        # Offline -> Online
        elif not previous_log.is_up and is_up and notify_on_recovery:
            create_alert(
                website,
                "website_recovered",
                f"{website.name} has RECOVERED. "
                f"{website.url} is accessible again."
            )

        # Normal response -> Slow response
        was_slow = (
            previous_log.is_up
            and previous_log.response_time is not None
            and previous_log.response_time > SLOW_RESPONSE_THRESHOLD_MS
        )
        is_slow = (
            is_up
            and response_time > SLOW_RESPONSE_THRESHOLD_MS
        )

        if not was_slow and is_slow and notify_on_slow_response:
            create_alert(
                website,
                "slow_response",
                f"{website.name} is responding slowly. "
                f"Response time: {response_time} ms."
            )

    db.session.add(monitor_log)
    db.session.commit()

    return {
        "website": website.url,
        "status_code": status_code,
        "response_time": response_time,
        "is_up": is_up,
        "error_message": error_message,
        "checked_at": checked_at.isoformat()
    }
