
import logging
from threading import Event

from app import create_app
from app.services.scheduler_service import (
    start_scheduler,
    stop_scheduler
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def main():

    app = create_app()

    start_scheduler(app)

    print("Website Monitoring Scheduler is running.")
    print("Press CTRL+C to stop.")

    try:
        Event().wait()

    except KeyboardInterrupt:
        print("Stopping scheduler...")
        stop_scheduler()


if __name__ == "__main__":
    main()
