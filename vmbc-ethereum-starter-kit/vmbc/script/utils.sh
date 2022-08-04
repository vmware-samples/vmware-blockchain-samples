#!/bin/bash

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[0;33m'


# println echos string no color
function println() {
  echo -e "$1"
}

# red for error
function errorln() {
  println "${C_RED}${1}${C_RESET}"
}

# green for success
function successln() {
  println "${C_GREEN}${1}${C_RESET}"
}

# blue for information
function infoln() {
  println "${C_BLUE}${1}${C_RESET}"
}

# yellow for warning
function warnln() {
  println "${C_YELLOW}${1}${C_RESET}"
}

# red for fatal and exit 
function fatalln() {
  errorln "$1"
  exit 1
}

export -f errorln
export -f successln
export -f infoln
export -f warnln
