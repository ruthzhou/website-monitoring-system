
from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate, jwt


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(
        app,
        resources={
            r"/api/.*": {
                "origins": ["http://localhost:3000"]
            }
        }
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app import models
    from app.api.auth import auth_bp
    from app.api.websites import websites_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(websites_bp, url_prefix="/api/websites")

    return app
