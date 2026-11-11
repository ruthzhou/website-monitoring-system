
from datetime import datetime, timezone

from app.extensions import db


class NotificationSettings(db.Model):
    __tablename__ = "notification_settings"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    email_enabled = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    notify_on_down = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    notify_on_recovery = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    notify_on_slow_response = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = db.relationship(
        "User",
        back_populates="notification_settings"
    )

    def __repr__(self):
        return f"<NotificationSettings user_id={self.user_id}>"

