#!/bin/bash
echo "🧪 Testing QR Bus Ticketing Backend API"
echo "=========================================="

# Test 1: Register User
echo -e "\n✅ Test 1: Register User"
RESPONSE=$(curl -s -X POST http://localhost:5001/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test User"}')
echo "$RESPONSE"
USER_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "User ID: $USER_ID"

# Test 2: Recharge Wallet
echo -e "\n✅ Test 2: Recharge Wallet (₹100)"
curl -s -X POST http://localhost:5001/api/recharge \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"amount\":100}"

# Test 3: Get User Details
echo -e "\n\n✅ Test 3: Get User Details"
curl -s http://localhost:5001/api/user/$USER_ID

# Test 4: Generate Ticket
echo -e "\n\n✅ Test 4: Generate Ticket"
TICKET_RESPONSE=$(curl -s -X POST http://localhost:5001/api/generate-ticket \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\"}")
TICKET_ID=$(echo "$TICKET_RESPONSE" | grep -o '"ticketId":"[^"]*"' | cut -d'"' -f4)
echo "Ticket ID: $TICKET_ID"

# Test 5: Validate First Time
echo -e "\n✅ Test 5: Validate Ticket (First Time)"
curl -s -X POST http://localhost:5001/api/validate \
  -H "Content-Type: application/json" \
  -d "{\"ticketId\":\"$TICKET_ID\"}"

# Test 6: Validate Second Time
echo -e "\n\n✅ Test 6: Validate Ticket (Second Time)"
curl -s -X POST http://localhost:5001/api/validate \
  -H "Content-Type: application/json" \
  -d "{\"ticketId\":\"$TICKET_ID\"}"

# Test 7: Get Ticket History
echo -e "\n\n✅ Test 7: Get User Ticket History"
curl -s http://localhost:5001/api/user/$USER_ID/tickets

echo -e "\n\n🎉 All API tests completed!"
