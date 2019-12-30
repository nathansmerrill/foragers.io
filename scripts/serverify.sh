#!/bin/bash

PROJECT="/home/merrilln/foragers.io"
cd $PROJECT
sed -i 's/port=4000/port=8020/' server.py
sed -i "s/app.router.add_get('\/', index)/# app.router.add_get('\/', index)/" server.py
sed -i "s/app.router.add_static('\/', '.\/public')/# app.router.add_static('\/', '.\/public')/" server.py
sed -i 's/localhost:4000/cs.catlin.edu:8020/' public/sketch.js