#!/bin/bash
cd /home/kavia/workspace/code-generation/sp-500-stock-ranking-dashboard-f2f16f22/dashboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

