
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.alert import Alert
from app.models.website import Website


alerts_bp = Blueprint("alerts", __name__)


def alert_to_dict(alert):
    return {
        "id": alert.id,
        "website_id": alert.website_id,
        "website_name": alert.website.name,
        "website_url": alert.website.url,
        "alert_type": alert.alert_type,
        "message": alert.message,
        "is_read": alert.is_read,
        "created_at": (
            alert.created_at.isoformat()
            if alert.created_at else None
        )
    }


# GET ALL ALERTS FOR THE LOGGED-IN USER
@alerts_bp.route("/", methods=["GET"])
@jwt_required()
def get_alerts():
    user_id = int(get_jwt_identity())

    alerts = (
        Alert.query
        .join(Website)
        .filter(Website.user_id == user_id)
        .order_by(Alert.created_at.desc())
        .all()
    )

    unread_count = sum(1 for alert in alerts if not alert.is_read)

    return jsonify({
        "alerts": [alert_to_dict(alert) for alert in alerts],
        "unread_count": unread_count
    }), 200


# MARK ONE ALERT AS READ
@alerts_bp.route("/<int:alert_id>/read", methods=["PATCH"])
@jwt_required()
def mark_alert_read(alert_id):
    user_id = int(get_jwt_identity())

    alert = (
        Alert.query
        .join(Website)
        .filter(
            Alert.id == alert_id,
            Website.user_id == user_id
        )
        .first()
    )

    if not alert:
        return jsonify({"message": "Alert not found."}), 404

    alert.is_read = True
    db.session.commit()

    return jsonify({
        "message": "Alert marked as read."
    }), 200


# MARK ALL ALERTS AS READ
@alerts_bp.route("/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_alerts_read():
    user_id = int(get_jwt_identity())

    alerts = (
        Alert.query
        .join(Website)
        .filter(
            Website.user_id == user_id,
            Alert.is_read.is_(False)
        )
        .all()
    )

    for alert in alerts:
        alert.is_read = True

    db.session.commit()

    return jsonify({
        "message": "All alerts marked as read.",
        "updated_count": len(alerts)
    }), 200


# DELETE ONE ALERT
@alerts_bp.route("/<int:alert_id>", methods=["DELETE"])
@jwt_required()
def delete_alert(alert_id):
    user_id = int(get_jwt_identity())

    alert = (
        Alert.query
        .join(Website)
        .filter(
            Alert.id == alert_id,
            Website.user_id == user_id
        )
        .first()
    )

    if not alert:
        return jsonify({"message": "Alert not found."}), 404

    db.session.delete(alert)
    db.session.commit()

    return jsonify({
        "message": "Alert deleted successfully."
    }), 200
