#!/bin/bash

printf "=======================\n"
printf "SEARCHING FOR 80+ LINES\n"
printf "=======================\n"
# Iterate through all lines in fileList, use those are files we're checking
while read line; 
do
   printf "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"
   printf "CHECKING $line\n"
   printf "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n"
   sed -n '/.\{80\}/p' $line
# The input file
done <fileList

