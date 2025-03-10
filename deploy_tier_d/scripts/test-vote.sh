#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:3000/api"
CLIENT_ID="test-cli-$(date +%s)"
PRODUCT_ID=${1:-"p1"}  # Default to p1 if not provided

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      Voting API Test Script           ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Using client ID:${NC} $CLIENT_ID"
echo -e "${YELLOW}Testing product:${NC} $PRODUCT_ID"
echo

# Step 1: Check product details
echo -e "${BLUE}Step 1: Fetching product details...${NC}"
PRODUCT_RESPONSE=$(curl -s "$API_BASE/products/product?id=$PRODUCT_ID&clientId=$CLIENT_ID")
echo "$PRODUCT_RESPONSE" | jq '.'
echo

# Step 2: Check initial vote status
echo -e "${BLUE}Step 2: Checking initial vote status...${NC}"
VOTE_STATUS_RESPONSE=$(curl -s "$API_BASE/vote?productId=$PRODUCT_ID&clientId=$CLIENT_ID")
echo "$VOTE_STATUS_RESPONSE" | jq '.'

INITIAL_UPVOTES=$(echo "$VOTE_STATUS_RESPONSE" | jq '.upvotes')
INITIAL_DOWNVOTES=$(echo "$VOTE_STATUS_RESPONSE" | jq '.downvotes')
INITIAL_SCORE=$(echo "$VOTE_STATUS_RESPONSE" | jq '.score')

echo -e "${YELLOW}Initial votes:${NC} ⬆️ $INITIAL_UPVOTES ⬇️ $INITIAL_DOWNVOTES (Score: $INITIAL_SCORE)"
echo

# Step 3: Cast an upvote
echo -e "${BLUE}Step 3: Casting an upvote...${NC}"
UPVOTE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"voteType\":1,\"clientId\":\"$CLIENT_ID\"}" \
  "$API_BASE/vote")
echo "$UPVOTE_RESPONSE" | jq '.'

NEW_UPVOTES=$(echo "$UPVOTE_RESPONSE" | jq '.upvotes')
NEW_DOWNVOTES=$(echo "$UPVOTE_RESPONSE" | jq '.downvotes')
NEW_SCORE=$(echo "$UPVOTE_RESPONSE" | jq '.score')
NEW_VOTE_TYPE=$(echo "$UPVOTE_RESPONSE" | jq '.voteType')

echo -e "${YELLOW}After upvote:${NC} ⬆️ $NEW_UPVOTES ⬇️ $NEW_DOWNVOTES (Score: $NEW_SCORE, My vote: $NEW_VOTE_TYPE)"
echo

# Sleep to ensure the API has time to process
sleep 1

# Step 4: Check vote status after upvote
echo -e "${BLUE}Step 4: Verifying vote status after upvote...${NC}"
VOTE_STATUS_RESPONSE=$(curl -s "$API_BASE/vote?productId=$PRODUCT_ID&clientId=$CLIENT_ID")
echo "$VOTE_STATUS_RESPONSE" | jq '.'

# Sleep to ensure the API has time to process
sleep 1

# Step 5: Toggle the upvote (remove it)
echo -e "${BLUE}Step 5: Toggling upvote (should remove it)...${NC}"
TOGGLE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"voteType\":1,\"clientId\":\"$CLIENT_ID\"}" \
  "$API_BASE/vote")
echo "$TOGGLE_RESPONSE" | jq '.'

TOGGLE_UPVOTES=$(echo "$TOGGLE_RESPONSE" | jq '.upvotes')
TOGGLE_DOWNVOTES=$(echo "$TOGGLE_RESPONSE" | jq '.downvotes')
TOGGLE_SCORE=$(echo "$TOGGLE_RESPONSE" | jq '.score')
TOGGLE_VOTE_TYPE=$(echo "$TOGGLE_RESPONSE" | jq '.voteType')

echo -e "${YELLOW}After toggle:${NC} ⬆️ $TOGGLE_UPVOTES ⬇️ $TOGGLE_DOWNVOTES (Score: $TOGGLE_SCORE, My vote: $TOGGLE_VOTE_TYPE)"
echo

# Sleep to ensure the API has time to process
sleep 1

# Step 6: Cast a downvote
echo -e "${BLUE}Step 6: Casting a downvote...${NC}"
DOWNVOTE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"voteType\":-1,\"clientId\":\"$CLIENT_ID\"}" \
  "$API_BASE/vote")
echo "$DOWNVOTE_RESPONSE" | jq '.'

DOWN_UPVOTES=$(echo "$DOWNVOTE_RESPONSE" | jq '.upvotes')
DOWN_DOWNVOTES=$(echo "$DOWNVOTE_RESPONSE" | jq '.downvotes')
DOWN_SCORE=$(echo "$DOWNVOTE_RESPONSE" | jq '.score')
DOWN_VOTE_TYPE=$(echo "$DOWNVOTE_RESPONSE" | jq '.voteType')

echo -e "${YELLOW}After downvote:${NC} ⬆️ $DOWN_UPVOTES ⬇️ $DOWN_DOWNVOTES (Score: $DOWN_SCORE, My vote: $DOWN_VOTE_TYPE)"
echo

# Sleep to ensure the API has time to process
sleep 1

# Step 7: Change vote from downvote to upvote
echo -e "${BLUE}Step 7: Changing vote from downvote to upvote...${NC}"
CHANGE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"voteType\":1,\"clientId\":\"$CLIENT_ID\"}" \
  "$API_BASE/vote")
echo "$CHANGE_RESPONSE" | jq '.'

CHANGE_UPVOTES=$(echo "$CHANGE_RESPONSE" | jq '.upvotes')
CHANGE_DOWNVOTES=$(echo "$CHANGE_RESPONSE" | jq '.downvotes')
CHANGE_SCORE=$(echo "$CHANGE_RESPONSE" | jq '.score')
CHANGE_VOTE_TYPE=$(echo "$CHANGE_RESPONSE" | jq '.voteType')

echo -e "${YELLOW}After change:${NC} ⬆️ $CHANGE_UPVOTES ⬇️ $CHANGE_DOWNVOTES (Score: $CHANGE_SCORE, My vote: $CHANGE_VOTE_TYPE)"
echo

# Sleep to ensure the API has time to process
sleep 1

# Step 8: Check remaining votes
echo -e "${BLUE}Step 8: Checking remaining votes...${NC}"
REMAINING_RESPONSE=$(curl -s "$API_BASE/vote/remaining-votes?clientId=$CLIENT_ID")
echo "$REMAINING_RESPONSE" | jq '.'

REMAINING_VOTES=$(echo "$REMAINING_RESPONSE" | jq '.remainingVotes')
echo -e "${YELLOW}Remaining votes:${NC} $REMAINING_VOTES"
echo

# Step 9: Final vote status check
echo -e "${BLUE}Step 9: Final vote status check...${NC}"
FINAL_STATUS=$(curl -s "$API_BASE/vote?productId=$PRODUCT_ID&clientId=$CLIENT_ID")
echo "$FINAL_STATUS" | jq '.'
echo

echo -e "${GREEN}Test completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      Vote Test Summary               ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Product ID: $PRODUCT_ID"
echo -e "Client ID: $CLIENT_ID"
echo -e "Initial: ⬆️ $INITIAL_UPVOTES ⬇️ $INITIAL_DOWNVOTES (Score: $INITIAL_SCORE)"
echo -e "Final:   ⬆️ $CHANGE_UPVOTES ⬇️ $CHANGE_DOWNVOTES (Score: $CHANGE_SCORE)"
echo -e "My Vote: $CHANGE_VOTE_TYPE"
echo -e "Remaining Votes: $REMAINING_VOTES"
echo -e "${BLUE}========================================${NC}" 