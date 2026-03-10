#!/usr/bin/env python3
"""Create test user for delete account testing."""
import subprocess, bcrypt

password = "Test1234!"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()
subprocess.run(f'''PGPASSWORD=datev_secret psql -U datev -d konverter_pro -h 127.0.0.1 -c "
DELETE FROM users WHERE email = 'test-delete@konverter-pro.de';
INSERT INTO users (id, email, name, password_hash, email_verified, language, created_at, updated_at)
VALUES (gen_random_uuid(), 'test-delete@konverter-pro.de', 'Test User', '{hashed}', true, 'de', NOW(), NOW());"''', shell=True)
print("✓ Created: test-delete@konverter-pro.de / Test1234!")