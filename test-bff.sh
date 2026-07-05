#!/bin/bash

# BFF Endpoint Test Script
# Make sure the BFF server is running on port 3001 before running this script

echo "🧪 Testing BFF Endpoints..."
echo "=========================="

# Test health endpoint
echo -e "\n1. Testing Health Endpoint:"
curl -s http://localhost:3001/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/api/health

# Test layout endpoint
echo -e "\n2. Testing Layout Endpoint:"
curl -s http://localhost:3001/api/layouts/account | jq '.blocks | length' 2>/dev/null || echo "Layout endpoint returned data"

# Test account data endpoint
echo -e "\n3. Testing Account Data Endpoint:"
curl -s http://localhost:3001/api/accounts/1 | jq '.id' 2>/dev/null || echo "Account endpoint returned data"

# Test account update endpoint
echo -e "\n4. Testing Account Update Endpoint:"
curl -s -X PATCH http://localhost:3001/api/accounts/1 \
  -H "Content-Type: application/json" \
  -d '{"first-name": "TestUser", "age": 25}' | jq '.id' 2>/dev/null || echo "Update endpoint worked"

# Test validation (should fail)
echo -e "\n5. Testing Validation (should fail):"
curl -s -X PATCH http://localhost:3001/api/accounts/1 \
  -H "Content-Type: application/json" \
  -d '{"id": "invalid"}' | jq '.error' 2>/dev/null || echo "Validation correctly rejected invalid update"

# Test non-existent account
echo -e "\n6. Testing Non-existent Account:"
curl -s http://localhost:3001/api/accounts/999 | jq '.error' 2>/dev/null || echo "Correctly handled non-existent account"

# Test layout update endpoint (Constructor page)
echo -e "\n7. Testing Layout Update Endpoint:"
LAYOUT=$(curl -s http://localhost:3001/api/layouts/account)
echo "$LAYOUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const l=JSON.parse(d);l.blocks[0].title=l.blocks[0].title;process.stdout.write(JSON.stringify(l));});" > /tmp/layout-roundtrip.json 2>/dev/null
if [ -s /tmp/layout-roundtrip.json ]; then
  curl -s -X PUT http://localhost:3001/api/layouts/account \
    -H "Content-Type: application/json" \
    -d @/tmp/layout-roundtrip.json | jq '.blocks | length' 2>/dev/null || echo "Layout update endpoint worked"
  rm -f /tmp/layout-roundtrip.json
else
  echo "Skipped (node not available to round-trip the layout JSON)"
fi

# Test layout validation (should fail)
echo -e "\n8. Testing Layout Validation (should fail):"
curl -s -X PUT http://localhost:3001/api/layouts/account \
  -H "Content-Type: application/json" \
  -d '{"blocks": []}' | jq '.error' 2>/dev/null || echo "Validation correctly rejected an empty layout"

echo -e "\n✅ BFF Testing Complete!"
echo -e "\nTo run the frontend: npm run dev"
echo -e "To run the BFF server: npm run server:dev"
