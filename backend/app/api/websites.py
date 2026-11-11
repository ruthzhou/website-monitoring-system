
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from urllib.parse import urlparse

from app.extensions import db
from app.models.website import Website


websites_bp = Blueprint("websites", __name__)


def validate_url(url):
    """Check whether a URL has a valid HTTP or HTTPS format."""
    try:
        parsed = urlparse(url)
        return (
            parsed.scheme in ("http", "https")
            and bool(parsed.netloc)
            and "." in parsed.netloc
        )
    except ValueError:
        return False


def website_to_dict(website):
    """Convert a Website object into JSON-friendly data."""
    return {
        "id": website.id,
        "name": website.name,
        "url": website.url,
        "is_active": website.is_active,
        "check_interval_seconds": website.check_interval_seconds,
        "created_at": (
            website.created_at.isoformat()
            if website.created_at else None
        ),
        "last_checked_at": (
            website.last_checked_at.isoformat()
            if website.last_checked_at else None
        )
    }


# ADD A WEBSITE
@websites_bp.route("/", methods=["POST"])
@jwt_required()
def add_website():

    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    url = data.get("url", "").strip()
    interval = data.get("check_interval_seconds", 300)

    if not name or not url:
        return jsonify({
            "message": "Website name and URL are required."
        }), 400

    if not validate_url(url):
        return jsonify({
            "message": "Please provide a valid HTTP or HTTPS URL."
        }), 400

    if type(interval) is not int or not 60 <= interval <= 86400:
        return jsonify({
            "message": "Check interval must be between 60 and 86400 seconds."
        }), 400

    website = Website(
        user_id=user_id,
        name=name,
        url=url,
        check_interval_seconds=interval
    )

    try:
        db.session.add(website)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "message": "You have already added this website."
        }), 409

    return jsonify({
        "message": "Website added successfully.",
        "website": website_to_dict(website)
    }), 201


# GET ALL WEBSITES FOR THE LOGGED-IN USER
@websites_bp.route("/", methods=["GET"])
@jwt_required()
def get_websites():

    user_id = int(get_jwt_identity())

    websites = Website.query.filter_by(
        user_id=user_id
    ).order_by(Website.id.desc()).all()

    return jsonify({
        "websites": [website_to_dict(w) for w in websites]
    }), 200


# GET ONE WEBSITE
@websites_bp.route("/<int:website_id>", methods=["GET"])
@jwt_required()
def get_website(website_id):

    user_id = int(get_jwt_identity())

    website = Website.query.filter_by(
        id=website_id,
        user_id=user_id
    ).first()

    if not website:
        return jsonify({
            "message": "Website not found."
        }), 404

    return jsonify({
        "website": website_to_dict(website)
    }), 200


# UPDATE A WEBSITE
@websites_bp.route("/<int:website_id>", methods=["PUT"])
@jwt_required()
def update_website(website_id):

    user_id = int(get_jwt_identity())

    website = Website.query.filter_by(
        id=website_id,
        user_id=user_id
    ).first()

    if not website:
        return jsonify({
            "message": "Website not found."
        }), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = data["name"]
        if not isinstance(name, str) or not name.strip():
            return jsonify({"message": "Website name cannot be empty."}), 400
        website.name = name.strip()

    if "url" in data:
        url = data["url"]
        if not isinstance(url, str) or not validate_url(url.strip()):
            return jsonify({"message": "Please provide a valid HTTP or HTTPS URL."}), 400
        website.url = url.strip()

    if "check_interval_seconds" in data:
        interval = data["check_interval_seconds"]
        if type(interval) is not int or not 60 <= interval <= 86400:
            return jsonify({
                "message": "Check interval must be between 60 and 86400 seconds."
            }), 400
        website.check_interval_seconds = interval

    if "is_active" in data:
        if type(data["is_active"]) is not bool:
            return jsonify({
                "message": "is_active must be true or false."
            }), 400
        website.is_active = data["is_active"]

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "message": "You have already added this website."
        }), 409

    return jsonify({
        "message": "Website updated successfully.",
        "website": website_to_dict(website)
    }), 200


# DELETE A WEBSITE
@websites_bp.route("/<int:website_id>", methods=["DELETE"])
@jwt_required()
def delete_website(website_id):

    user_id = int(get_jwt_identity())

    website = Website.query.filter_by(
        id=website_id,
        user_id=user_id
    ).first()

    if not website:
        return jsonify({
            "message": "Website not found."
        }), 404

    db.session.delete(website)
    db.session.commit()

    return jsonify({
        "message": "Website deleted successfully."
    }), 200
