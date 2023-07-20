#!/bin/bash

set -e

# Colorize terminal
red='\e[0;31m'
no_color='\033[0m'

# Console step increment
i=1

# Default values
BRANCH_TO_SYNC=main

# Declare script helper
TEXT_HELPER="\nThis script aims to send a synchronization request to DSO.
Following flags are available:

  -a  Api url to send the synchronization request.

  -b  Branch which is wanted to be synchronize for the given repository.
      Default is '$BRANCH_TO_SYNC'.

  -g  GitLab token to trigger the pipeline on the gitlab mirror project.

  -i  Gitlab mirror project id.

  -r  Gitlab repository name to mirror.

  -h  Print script help.\n\n"

print_help() {
  printf "$TEXT_HELPER"
}

# Parse options
while getopts :ha:b:g:i: flag
do
  case "${flag}" in
    a)
      API_URL=${OPTARG};;
    b)
      BRANCH_TO_SYNC=${OPTARG};;
    g)
      GITLAB_TRIGGER_TOKEN=${OPTARG};;
    i)
      GITLAB_MIRROR_PROJECT_ID=${OPTARG};;
    r)
      REPOSITORY_NAME=${OPTARG};;
    h | *)
      print_help
      exit 0;;
  esac
done


# Test if arguments are missing
if [ -z ${API_URL} ] || [ -z ${BRANCH_TO_SYNC} ] || [ -z ${GITLAB_TRIGGER_TOKEN} ] || [ -z ${GITLAB_MIRROR_PROJECT_ID} ] || [ -z ${REPOSITORY_NAME} ]; then
  printf "\nArgument(s) missing.\n"
  print_help
  exit 0
fi


# Send synchronization request
printf "\n\n${red}${i}.${no_color} Send request to DSO api.\n\n"

curl \
  -X POST \
  --fail \
  -F token=${GITLAB_TRIGGER_TOKEN} \
  -F ref=main \
  -F variables[GIT_BRANCH_DEPLOY]=${BRANCH_TO_SYNC} \
  -F variables[PROJECT_NAME]=${REPOSITORY_NAME} \
  "${API_URL}/api/v4/projects/${GITLAB_MIRROR_PROJECT_ID}/trigger/pipeline"
