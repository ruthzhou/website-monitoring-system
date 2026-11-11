
from datetime import datetime, timezone

from app.extensions import db


class Website(db.Model):
    __tablename__ = "websites"

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "url",
            name="uq_user_website_url"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    name = db.Column(db.String(150), nullable=False)
    url = db.Column(db.String(2048), nullable=False)

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    check_interval_seconds = db.Column(
        db.Integer,
        default=300,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    last_checked_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True
    )

    user = db.relationship(
        "User",
        back_populates="websites"
    )

    monitor_logs = db.relationship(
        "MonitorLog",
        back_populates="website",
        cascade="all, delete-orphan"
    )

    alerts = db.relationship(
        "Alert",
        back_populates="website",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Website {self.url}>"
