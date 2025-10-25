#!/usr/bin/env python3
"""
Test authentication directly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import User
from app.api.v1.auth import verify_password

def test_auth():
    """Test authentication directly"""
    db = SessionLocal()
    try:
        # Test with admin user
        username = "admin"
        password = "admin123"
        
        user = db.query(User).filter(User.username == username).first()
        print(f"Testing login for: {username} / {password}")
        
        if user:
            print(f"User found: {user.username}")
            print(f"Stored password: '{user.hashed_password}'")
            print(f"Input password: '{password}'")
            print(f"Password comparison: '{user.hashed_password}' == '{password}' = {user.hashed_password == password}")
            
            # Test plain text comparison
            if user.hashed_password == password:
                print("✅ Plain text password match!")
            else:
                print("❌ Plain text password mismatch")
                
                # Try bcrypt
                try:
                    bcrypt_result = verify_password(password, user.hashed_password)
                    print(f"Bcrypt result: {bcrypt_result}")
                except Exception as e:
                    print(f"Bcrypt error: {e}")
        else:
            print("❌ User not found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_auth()