
from datetime import datetime, timezone

from app.extensions import db


class MonitorLog(db.Model):
    __tablename__ = "monitor_logs"

    id = db.Column(db.Integer, primary_key=True)

    website_id = db.Column(
        db.Integer,
        db.ForeignKey("websites.id"),
        nullable=False
    )

    status_code = db.Column(
        db.Integer,
        nullable=True
    )

    response_time = db.Column(
        db.Float,
        nullable=True
    )

    is_up = db.Column(
        db.Boolean,
        nullable=False
    )

    error_message = db.Column(
        db.Text,
        nullable=True
    )

    checked_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    website = db.relationship(
        "Website",
        back_populates="monitor_logs"
    )

    def __repr__(self):
        return f"<MonitorLog website_id={self.website_id} status={self.status_code}>"

