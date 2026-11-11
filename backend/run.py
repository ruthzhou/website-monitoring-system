from sqlalchemy import text
from app import create_app
from app.extensions import db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        try:
            db.session.execute(text("SELECT 1"))
            print("Successfully connected to PostgreSQL!")
        except Exception as error:
            print("Database connection failed:")
            print(error)

    app.run(debug=True)