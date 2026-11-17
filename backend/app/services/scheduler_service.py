
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler

from app.extensions import db
from app.models.website import Website
from app.services.monitoring_service import check_website


logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone="UTC")


def check_due_websites(app):
    """
    Find active websites that are due for monitoring
    and execute their monitoring checks.
    """

    with app.app_context():

        now = datetime.now(timezone.utc)

        websites = Website.query.filter_by(
            is_active=True
        ).all()

        for website in websites:

            try:
                if website.last_checked_at is None:
                    check_website(website)
                    logger.info("First check completed: %s", website.url)
                    continue

                last_checked = website.last_checked_at

                if last_checked.tzinfo is None:
                    last_checked = last_checked.replace(
                        tzinfo=timezone.utc
                    )

                elapsed = (now - last_checked).total_seconds()

                interval = max(
                    1,
                    website.check_interval_seconds
                )

                if elapsed >= interval:
                    check_website(website)

                    logger.info(
                        "Checked website: %s",
                        website.url
                    )

            except Exception:
                db.session.rollback()

                logger.exception(
                    "Monitoring failed for website: %s",
                    website.url
                )


def start_scheduler(app):
    """Start the background monitoring scheduler."""

    if scheduler.running:
        logger.warning("Scheduler is already running.")
        return

    scheduler.add_job(
        func=check_due_websites,
        trigger="interval",
        seconds=10,
        args=[app],
        id="website_monitoring",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        next_run_time=datetime.now(timezone.utc)
    )

    scheduler.start()

    logger.info("Website monitoring scheduler started.")


def stop_scheduler():
    """Stop the background monitoring scheduler."""

    if scheduler.running:
        scheduler.shutdown(wait=True)
        logger.info("Website monitoring scheduler stopped.")
