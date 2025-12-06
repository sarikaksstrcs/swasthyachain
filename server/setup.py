# setup.py - Automated setup script for SwasthyaChain Backend
import os
import secrets
import base64
import subprocess
import sys

def print_step(step_num, message):
    """Print formatted step message"""
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {message}")
    print('='*60)

def create_directory_structure():
    """Create all necessary directories"""
    print_step(1, "Creating Directory Structure")
    
    directories = [
        "app",
        "app/core",
        "app/models",
        "app/services",
        "app/api",
        "app/api/v1",
        "app/api/v1/endpoints",
        "data",
        "data/db",
        "logs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created: {directory}")
    
    # Create __init__.py files
    init_files = [
        "app/__init__.py",
        "app/core/__init__.py",
        "app/models/__init__.py",
        "app/services/__init__.py",
        "app/api/__init__.py",
        "app/api/v1/__init__.py",
        "app/api/v1/endpoints/__init__.py"
    ]
    
    for init_file in init_files:
        open(init_file, 'a').close()
        print(f"✓ Created: {init_file}")

def generate_env_file():
    """Generate .env file with secure keys"""
    print_step(2, "Generating Environment Variables")
    
    # Generate secure keys
    secret_key = secrets.token_urlsafe(32)
    encryption_key = base64.b64encode(os.urandom(32)).decode()
    
    env_content = f"""# SwasthyaChain Backend Configuration
# Generated automatically by setup.py

# Security
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=swasthyachain

# IPFS (Optional)
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=http://localhost:8080

# Blockchain (Hyperledger Fabric)
FABRIC_NETWORK_PATH=./fabric-network
FABRIC_CHANNEL_NAME=healthchannel
FABRIC_CHAINCODE_NAME=swasthyachain

# AI (Google Gemini)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-pro

# Encryption
ENCRYPTION_KEY={encryption_key}
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✓ Generated .env file with secure keys")
    print(f"✓ SECRET_KEY: {secret_key[:20]}...")
    print(f"✓ ENCRYPTION_KEY: {encryption_key[:20]}...")

def create_run_script():
    """Create run.py entry point"""
    print_step(3, "Creating Entry Point Script")
    
    run_content = """# run.py - SwasthyaChain Backend Entry Point
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
"""
    
    with open('run.py', 'w') as f:
        f.write(run_content)
    
    print("✓ Created run.py")

def create_gitignore():
    """Create .gitignore file"""
    print_step(4, "Creating .gitignore")
    
    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Data
data/
*.db
*.sqlite

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IPFS
ipfs_data/

# Blockchain
fabric-network/
"""
    
    with open('.gitignore', 'w') as f:
        f.write(gitignore_content)
    
    print("✓ Created .gitignore")

def install_dependencies():
    """Install Python dependencies"""
    print_step(5, "Installing Dependencies")
    
    print("Installing packages... This may take a few minutes.")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ All dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("✗ Failed to install dependencies")
        print("  Please run: pip install -r requirements.txt")

def create_test_script():
    """Create test script"""
    print_step(6, "Creating Test Script")
    
    test_content = """# test_api.py - Quick API Test Script
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    \"\"\"Test health endpoint\"\"\"
    print("Testing health endpoint...")
    response = requests.get("http://localhost:8000/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_register():
    \"\"\"Test user registration\"\"\"
    print("Testing user registration...")
    data = {
        "email": "test@example.com",
        "password": "test123",
        "full_name": "Test User",
        "role": "patient",
        "phone": "+919876543210"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()
    return response.json()

def test_login():
    \"\"\"Test user login\"\"\"
    print("Testing user login...")
    data = {
        "email": "test@example.com",
        "password": "test123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"Token: {token[:30]}...")
        return token
    print(f"Response: {response.json()}")
    print()
    return None

def test_me(token):
    \"\"\"Test get current user\"\"\"
    print("Testing get current user...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("SwasthyaChain API Test Script")
    print("=" * 60)
    print()
    
    try:
        test_health()
        test_register()
        token = test_login()
        if token:
            test_me(token)
        
        print("=" * 60)
        print("All tests completed!")
        print("=" * 60)
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API")
        print("Make sure the server is running: python run.py")
"""
    
    with open('test_api.py', 'w') as f:
        f.write(test_content)
    
    print("✓ Created test_api.py")

def print_next_steps():
    """Print next steps for user"""
    print_step(7, "Setup Complete! 🎉")
    
    print("""
Next Steps:
-----------

1. Start MongoDB (if not running):
   mongod --dbpath ./data/db

2. (Optional) Add Gemini API Key to .env:
   Get key from: https://ai.google.dev
   Edit .env and add: GEMINI_API_KEY=your-key-here

3. Start the API server:
   python run.py
   
   Or:
   uvicorn app.main:app --reload

4. Access the API:
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

5. Test the API:
   python test_api.py

6. View all endpoints:
   Open http://localhost:8000/docs in your browser

Important Notes:
----------------
✓ All code files need to be copied to their respective locations
✓ Check the README.md for complete file structure
✓ MongoDB must be running before starting the API
✓ Use the interactive docs at /docs for testing

For detailed documentation, see README.md
""")

def main():
    """Main setup function"""
    print("""
╔══════════════════════════════════════════════════════════╗
║        SwasthyaChain Backend Setup Script                ║
║   Blockchain, Cloud & AI Health Management System        ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    try:
        create_directory_structure()
        generate_env_file()
        create_run_script()
        create_gitignore()
        
        # Ask about dependency installation
        install = input("\nInstall dependencies now? (y/n): ").lower()
        if install == 'y':
            install_dependencies()
        else:
            print("\nSkipping dependency installation.")
            print("Run later: pip install -r requirements.txt")
        
        create_test_script()
        print_next_steps()
        
    except Exception as e:
        print(f"\n✗ Setup failed: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())