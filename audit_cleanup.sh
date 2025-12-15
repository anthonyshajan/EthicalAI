#!/bin/bash

echo "======================================================================"
echo "ETHICALAI PROJECT AUDIT - READ ONLY"
echo "======================================================================"
echo ""

echo "1. Searching for 'base app 44' references..."
echo "----------------------------------------------------------------------"
grep -r -i "base app" --include="*.py" --include="*.jsx" --include="*.js" --include="*.json" --include="*.md" . 2>/dev/null || echo "No 'base app' references found"
echo ""

echo "2. Searching for 'baseapp' references..."
echo "----------------------------------------------------------------------"
grep -r -i "baseapp" --include="*.py" --include="*.jsx" --include="*.js" --include="*.json" . 2>/dev/null || echo "No 'baseapp' references found"
echo ""

echo "3. All Lucide icon imports in frontend..."
echo "----------------------------------------------------------------------"
grep -r "from 'lucide-react'" frontend/src --include="*.jsx" --include="*.js" 2>/dev/null | head -30
echo ""

echo "4. Checking which pages use which icons..."
echo "----------------------------------------------------------------------"
echo "=== Landing.jsx ===" 
grep "from 'lucide-react'" frontend/src/pages/Landing.jsx 2>/dev/null || echo "No icons"
echo ""
echo "=== Chat.jsx ===" 
grep "from 'lucide-react'" frontend/src/pages/Chat.jsx 2>/dev/null || echo "No icons"
echo ""
echo "=== CheckWork.jsx ===" 
grep "from 'lucide-react'" frontend/src/pages/CheckWork.jsx 2>/dev/null || echo "No icons"
echo ""
echo "=== Upload.jsx ===" 
grep "from 'lucide-react'" frontend/src/pages/Upload.jsx 2>/dev/null || echo "No icons"
echo ""
echo "=== MyWork.jsx ===" 
grep "from 'lucide-react'" frontend/src/pages/MyWork.jsx 2>/dev/null || echo "No icons"
echo ""
echo "=== Profile.jsx ===" 
grep "from 'lucide-react'" frontend/src/pages/Profile.jsx 2>/dev/null || echo "No icons"
echo ""
echo "=== Layout.jsx ===" 
grep "from 'lucide-react'" frontend/src/components/Layout.jsx 2>/dev/null || echo "No icons"
echo ""

echo "5. Frontend package.json dependencies..."
echo "----------------------------------------------------------------------"
cat frontend/package.json | grep -A 25 '"dependencies"'
echo ""

echo "6. Backend requirements.txt..."
echo "----------------------------------------------------------------------"
cat backend/requirements.txt
echo ""

echo "7. Checking for unused component files..."
echo "----------------------------------------------------------------------"
ls -la frontend/src/components/ 2>/dev/null
echo ""

echo "8. Checking backend route files..."
echo "----------------------------------------------------------------------"
ls -la backend/routes/ 2>/dev/null
echo ""

echo "9. Checking for any TODO or FIXME comments..."
echo "----------------------------------------------------------------------"
grep -r "TODO\|FIXME" --include="*.py" --include="*.jsx" --include="*.js" backend/ frontend/src/ 2>/dev/null || echo "No TODO/FIXME found"
echo ""

echo "======================================================================"
echo "AUDIT COMPLETE - No files modified"
echo "======================================================================"
