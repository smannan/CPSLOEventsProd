#!/bin/bash

# Script that opens all relevant files

# Directories
R="Routes"
A="Account"
C="Conversation"

# Usage message
if [ $# -ne 0 ]
then
   echo "Usage: $0";
   exit -1;
fi

# Kill the server (that we probably ran previously)
./killMain.sh

vim -p $R/*.js $R/$A/*.js $R/$C/*.js main.js
