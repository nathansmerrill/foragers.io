#!/usr/bin/python3

from aiohttp import web
import socketio
from enum import Enum
import random, json

class Object:
    def __init__(self, type, x, y):
        self.type = type
        self.x = round(x)
        self.y = round(y)

    def getDict(self):
        # return json.dumps(self.__dict__)
        # return str(self.__dict__)
        return self.__dict__
        # return vars(self)

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

async def index(request):
    with open('public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.event
async def connect(sid, environ):
    print('Client connected ' + sid)
    await sio.emit('objects', json.dumps([object.getDict() for object in objects]), to=sid)
    # print([object.jsonify() for object in objects])
    await sio.emit('ping', 'pong')

@sio.event
async def disconnect(sid):
    print('Client disconnected ' + sid)

app.router.add_get('/', index)
app.router.add_static('/', './public')

if __name__ == '__main__':
    # ObjectTypes = Enum('ObjectTypes', 'tree stone iron ruby')
    OBJECT_TYPES = ['tree', 'stone', 'iron', 'ruby']

    objects = []
    for i in range(0, 10000):
        objects.append(Object(
            random.choice(OBJECT_TYPES),
            random.uniform(20, 40020),
            random.uniform(20, 40020)
        ))

    for object in objects:
        print(object.getDict())

    web.run_app(app, port=4000)