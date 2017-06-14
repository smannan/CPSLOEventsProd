#!/bin/bash

# Script that zips neccessary Project 1 files and handins them into Staley for
# grading.

printf "=============\n"
printf "ZIPPING FILES\n"
printf "=============\n"
zip -@ Angular.zip < fileList

printf "\n==========\n"
printf "TURNING IN\n"
printf "==========\n\n"
~clint/bin/turnin ~clint/437/Angular/turnin Angular.zip
