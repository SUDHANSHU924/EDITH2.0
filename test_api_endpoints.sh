#!/bin/bash

echo "================================================================================"
echo "EDITH 2.0 - HTTP API ENDPOINT TESTS"
echo "================================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:9000"
PASS_COUNT=0
FAIL_COUNT=0

test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_key=$5
    
    echo -n "Testing: $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$BASE_URL$endpoint")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    if echo "$response" | grep -q "$expected_key"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "Response: $response"
        ((FAIL_COUNT++))
    fi
}

echo "=== BASIC ENDPOINTS ==="
echo ""

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/health" "" "healthy"

# Test 2: Root Endpoint
test_endpoint "Root Endpoint" "GET" "/" "" "E.D.I.T.H"

echo ""
echo "=== ORCHESTRATOR ENDPOINTS ==="
echo ""

# Test 3: Simple Math (core system)
test_endpoint "Math: 2+2" "POST" "/api/orchestrator/think" \
    '{"input":"What is 2 + 2?","session_id":"test-1"}' "output"

# Test 4: Code Generation (code system)
test_endpoint "Code Gen" "POST" "/api/orchestrator/think" \
    '{"input":"Write hello world in Python","session_id":"test-2","system":"code"}' "output"

# Test 5: Web Search (search system)
test_endpoint "Web Search" "POST" "/api/orchestrator/think" \
    '{"input":"What is the capital of France?","session_id":"test-3","system":"search"}' "output"

# Test 6: Multilingual (multilingual system)
test_endpoint "Multilingual (Hindi)" "POST" "/api/orchestrator/think" \
    '{"input":"नमस्ते, आपका नाम क्या है?","session_id":"test-4","system":"multilingual"}' "output"

echo ""
echo "=== DESKTOP CONTROL ENDPOINTS ==="
echo ""

# Test 7: Take Screenshot
test_endpoint "Screenshot" "POST" "/api/desktop/screenshot" \
    '{"session_id":"test-5"}' "image"

# Test 8: System Info
test_endpoint "System Info" "POST" "/api/desktop/system-info" \
    '{"session_id":"test-6"}' "cpu"

# Test 9: Volume Control
test_endpoint "Set Volume" "POST" "/api/desktop/volume" \
    '{"level":50,"session_id":"test-7"}' "success"

# Test 10: Open App
test_endpoint "Open App" "POST" "/api/desktop/open-app" \
    '{"app":"firefox","session_id":"test-8"}' "success"

# Test 11: Search Web
test_endpoint "Search Web" "POST" "/api/desktop/search" \
    '{"query":"python programming","engine":"google","session_id":"test-9"}' "success"

# Test 12: Run Command
test_endpoint "Run Command" "POST" "/api/desktop/command" \
    '{"cmd":"echo EDITH_WORKING","session_id":"test-10"}' "output"

echo ""
echo "=== STREAMING ENDPOINTS ==="
echo ""

echo -n "Testing: Stream Response ... "
response=$(curl -s -X POST "$BASE_URL/api/orchestrator/think-stream" \
    -H "Content-Type: application/json" \
    -d '{"input":"Say hello in 5 words","session_id":"test-11"}')
    
if echo "$response" | grep -q "data:"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAIL_COUNT++))
fi

echo ""
echo "================================================================================"
echo "TEST RESULTS"
echo "================================================================================"
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo -e "Total:  $((PASS_COUNT + FAIL_COUNT))"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
fi

echo "================================================================================"
