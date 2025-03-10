#!/bin/bash

# Tier'd Deployment Verification Script
# This script checks if all components of the deployed Tier'd application are working correctly

echo "🔍 Tier'd Deployment Verification"
echo "--------------------------------"

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local description=$2
    local expected_status=$3
    
    echo -n "🌐 Checking $description... "
    
    # Use curl to check if the URL is accessible
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ Success! (HTTP $response)"
        return 0
    else
        echo "❌ Failed! (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Function to check API endpoints
check_api() {
    local url=$1
    local endpoint=$2
    local description=$3
    
    echo -n "🔌 Checking $description... "
    
    # Use curl to check if the API endpoint returns valid JSON
    response=$(curl -s "$url$endpoint")
    
    # Check if the response is valid JSON
    if echo "$response" | jq -e . >/dev/null 2>&1; then
        echo "✅ Success! (Valid JSON response)"
        return 0
    else
        echo "❌ Failed! (Invalid or empty response)"
        return 1
    fi
}

# Ask for the deployment URL
read -p "Enter your deployment URL (e.g., https://tierd.vercel.app): " DEPLOY_URL

# Remove trailing slash if present
DEPLOY_URL=${DEPLOY_URL%/}

# Check if URL is valid
if [[ ! $DEPLOY_URL =~ ^https?:// ]]; then
    echo "❌ Invalid URL format. Please include the protocol (http:// or https://)"
    exit 1
fi

echo ""
echo "Running verification checks for $DEPLOY_URL..."
echo ""

# Count successful and failed checks
success_count=0
failed_count=0

# Check main pages
check_url "$DEPLOY_URL" "Main Homepage" "200"
if [ $? -eq 0 ]; then ((success_count++)); else ((failed_count++)); fi

check_url "$DEPLOY_URL/products" "Products Page" "200"
if [ $? -eq 0 ]; then ((success_count++)); else ((failed_count++)); fi

check_url "$DEPLOY_URL/admin" "Admin Login Page" "200"
if [ $? -eq 0 ]; then ((success_count++)); else ((failed_count++)); fi

# Check API endpoints
check_api "$DEPLOY_URL" "/api/products" "Products API"
if [ $? -eq 0 ]; then ((success_count++)); else ((failed_count++)); fi

check_api "$DEPLOY_URL" "/api/vote?productId=1" "Vote Status API"
if [ $? -eq 0 ]; then ((success_count++)); else ((failed_count++)); fi

echo ""
echo "🔍 Checking admin login functionality..."

# Try to log in as admin
admin_response=$(curl -s -c cookies.txt -X POST "$DEPLOY_URL/api/auth" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

# Check if login was successful by looking for success message in response
if echo "$admin_response" | grep -q "success"; then
    echo "✅ Admin login successful!"
    ((success_count++))
    
    # Try to access admin dashboard with the session cookie
    admin_dashboard=$(curl -s -b cookies.txt "$DEPLOY_URL/admin/dashboard")
    
    # Clean up cookies file
    rm cookies.txt
    
    # Roughly check if we got the admin dashboard by looking for specific words
    if echo "$admin_dashboard" | grep -q -E "dashboard|analytics|admin"; then
        echo "✅ Admin dashboard accessible!"
        ((success_count++))
    else
        echo "❌ Admin dashboard access failed!"
        ((failed_count++))
    fi
else
    echo "❌ Admin login failed!"
    ((failed_count++))
    
    # Clean up cookies file
    rm -f cookies.txt
fi

echo ""
echo "📊 Verification Summary:"
echo "✅ Successful checks: $success_count"
echo "❌ Failed checks: $failed_count"
echo ""

# Calculate overall percentage
total=$((success_count + failed_count))
percentage=$((success_count * 100 / total))

echo "🔍 Deployment health: $percentage%"

if [ $percentage -eq 100 ]; then
    echo "🎉 All checks passed! Your Tier'd deployment is fully functional."
    echo "   You can access the admin dashboard at $DEPLOY_URL/admin"
    echo "   Username: admin"
    echo "   Password: admin123"
elif [ $percentage -ge 80 ]; then
    echo "⚠️ Most checks passed, but some issues were detected."
    echo "   Please review the failed checks and fix any issues."
elif [ $percentage -ge 50 ]; then
    echo "⚠️ Several checks failed. Your deployment has significant issues."
    echo "   Please review the failed checks and fix the issues before using."
else
    echo "❌ Most checks failed. Your deployment has major issues."
    echo "   Please review the deployment process and try again."
fi

echo ""
echo "📝 Detailed Logs:"
echo "Deployment URL: $DEPLOY_URL"
echo "Verification Date: $(date)"
echo "Verification Result: $percentage% passed"

# Offer to save the results to a file
read -p "Do you want to save these results to a file? (y/n): " save_results
if [[ $save_results == "y" ]]; then
    filename="deployment_verification_$(date +%Y%m%d_%H%M%S).log"
    
    {
        echo "Tier'd Deployment Verification Log"
        echo "=================================="
        echo ""
        echo "Deployment URL: $DEPLOY_URL"
        echo "Verification Date: $(date)"
        echo "Verification Result: $percentage% passed"
        echo ""
        echo "Summary:"
        echo "- Successful checks: $success_count"
        echo "- Failed checks: $failed_count"
        echo ""
        echo "Recommendation:"
        if [ $percentage -eq 100 ]; then
            echo "All checks passed! Your Tier'd deployment is fully functional."
        elif [ $percentage -ge 80 ]; then
            echo "Most checks passed, but some issues were detected."
            echo "Please review the failed checks and fix any issues."
        elif [ $percentage -ge 50 ]; then
            echo "Several checks failed. Your deployment has significant issues."
            echo "Please review the failed checks and fix the issues before using."
        else
            echo "Most checks failed. Your deployment has major issues."
            echo "Please review the deployment process and try again."
        fi
    } > "$filename"
    
    echo "✅ Results saved to $filename"
fi

echo ""
echo "🚀 Verification process completed!" 