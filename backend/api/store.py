"""
Global store instance for API routes.

Phase 3: Now uses DatabaseStore with SQLite + SQLAlchemy persistence.
"""

from backend.persistence.database import init_db, get_session
from backend.persistence.store import DatabaseStore

# Initialize database on module import
init_db()

# Create global store instance with database session
store = DatabaseStore(session=get_session())
