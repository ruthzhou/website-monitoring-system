
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.notification_settings import NotificationSettings


notification_settings_bp = Blueprint(
    "notification_settings",
    __name__
)


def get_or_create_settings(user_id):
    settings = NotificationSettings.query.filter_by(
        user_id=user_id
    ).first()

    if settings is None:
        settings = NotificationSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()

    return settings


def settings_to_dict(settings):
    return {
        "email_enabled": settings.email_enabled,
        "notify_on_down": settings.notify_on_down,
        "notify_on_recovery": settings.notify_on_recovery,
        "notify_on_slow_response": settings.notify_on_slow_response
    }


# GET NOTIFICATION PREFERENCES
@notification_settings_bp.route("/", methods=["GET"])
@jwt_required()
def get_notification_settings():
    user_id = int(get_jwt_identity())

    settings = get_or_create_settings(user_id)

    return jsonify({
        "settings": settings_to_dict(settings)
    }), 200


# UPDATE NOTIFICATION PREFERENCES
@notification_settings_bp.route("/", methods=["PUT"])
@jwt_required()
def update_notification_settings():
    user_id = int(get_jwt_identity())

    data = request.get_json(silent=True) or {}

    allowed_fields = {
        "email_enabled",
        "notify_on_down",
        "notify_on_recovery",
        "notify_on_slow_response"
    }

    for field in data:
        if field not in allowed_fields:
            return jsonify({
                "message": f"Invalid setting: {field}"
            }), 400

        if type(data[field]) is not bool:
            return jsonify({
                "message": f"{field} must be true or false."
            }), 400

    settings = get_or_create_settings(user_id)

    for field, value in data.items():
        setattr(settings, field, value)

    db.session.commit()

    return jsonify({
        "message": "Notification settings updated successfully.",
        "settings": settings_to_dict(settings)
    }), 200
