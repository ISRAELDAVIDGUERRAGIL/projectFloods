#!/bin/bash

# Build backend
cd backend
npm install
cd ..

# Build frontend
cd frontend
npm install
npm run build
cd ..
