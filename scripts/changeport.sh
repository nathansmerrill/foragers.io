#!/bin/bash

PROJECT="/home/merrilln/foragers.io"
cd $PROJECT
sed -i 's/port=4000/port=8020/' server.py
sed -i 's/localhost:4000/cs.catlin.edu:8020/' public/sketch.js