## 🚀 Step-by-Step Setup

### Step 1: Create React App

```bash
# Install Node.js (if not installed)
# Download from: https://nodejs.org/

# Create React app
npx create-react-app swasthyachain-frontend

# Navigate to project
cd swasthyachain-frontend
```

### Step 2: Install Dependencies

```bash
npm install axios react-router-dom lucide-react
npm install recharts date-fns
```

**Dependencies Explained:**
- `axios` - HTTP client for API calls
- `react-router-dom` - Routing
- `lucide-react` - Icon library
- `recharts` - Charts for AI insights
- `date-fns` - Date formatting

### Step 3: Create Environment File

Create `.env` in root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_API_URL=http://localhost:8000
```

### Step 4: Create Folder Structure

```bash
# Create all directories
mkdir -p src/components/layout
mkdir -p src/components/auth
mkdir -p src/components/records
mkdir -p src/components/consent
mkdir -p src/components/ai
mkdir -p src/components/common
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/context
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/styles
```
