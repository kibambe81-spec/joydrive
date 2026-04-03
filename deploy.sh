#!/bin/bash
export VERCEL_TOKEN="vcp_5aLHKRw9kv0OCnK6vSvPWeqTCQMEBtptg7tawLnhKi6ZmG2rUv0YfaMZ"
export VERCEL_ORG_ID=""
export VERCEL_PROJECT_ID=""

# Déployer sans interaction
vercel --prod --yes --token $VERCEL_TOKEN
