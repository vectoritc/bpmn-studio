#!/bin/bash

name='bpmn-studio'

if [[ $(docker ps -f "name=$name" --format '{{.Names}}') != "$name" ]]; then
    docker run --name "$name" -d -p 8000:8000 -p 9000:9000 5minds/bpmn-studio-bundle:latest 
else
    docker rm -v -f "$name"
    docker run --name "$name" -d -p 8000:8000 -p 9000:9000 5minds/bpmn-studio-bundle:latest 
fi
