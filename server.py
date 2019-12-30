#!/usr/bin/python3 -u

from aiohttp import web
import aiohttp_cors
import socketio
import random, json, math

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

class Player:
    def __init__(self, name, sid):
        self.name = name
        self.x = 1  # random.uniform(0, 40000)
        self.y = 2  # random.uniform(0, 40000)
        self.angle = 0
        self.speed = 5
        self.sid = sid

    def getDict(self):
        return self.__dict__

# sio = socketio.AsyncServer()
sio = socketio.AsyncServer(async_mode='aiohttp', cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

cors = aiohttp_cors.setup(app)
for resource in app.router._resources:
    if resource.raw_match('/socket.io/'):
        continue
    cors.add(resource, {'*': aiohttp_cors.ResourceOptions(allow_credentials=True, expose_headers='*', allow_headers='*')})

players = {}

async def index(request):
    with open('public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.event
async def connect(sid, environ):
    print('[CONNECT] ' + sid)
    await sio.emit('objects', json.dumps([object.getDict() for object in objects]), to=sid)

    players[sid] = Player('Player ' + sid, sid)
    # print([object.jsonify() for object in objects])
    # await sio.emit('ping', 'pong')

@sio.event
async def disconnect(sid):
    print('[DISCONNECT] ' + sid)
    await sio.emit('disconnect', sid)

@sio.event
async def inputs(sid, data):
    # print('Received inputs from ' + sid)
    # print(data['keyboard'])
    # Player Input

    # print(data)
    player = players[sid]
    if 'a' in data['keyboard']:
        player.x -= player.speed * data['lag']
    if 'd' in data['keyboard']:
        player.x += player.speed * data['lag']
    if 'w' in data['keyboard']:
        player.y -= player.speed * data['lag']
    if 's' in data['keyboard']:
        player.y += player.speed * data['lag']
    player.angle = data['angle']
    await sio.emit('player', json.dumps(player.getDict()))

@sio.event
async def chat(sid, data):
    await sio.emit('chat', {
        'sid': sid,
        'message': data
    })


app.router.add_get('/', index)
app.router.add_static('/', './public')

if __name__ == '__main__':
    print('[SERVER] started')
    # ObjectTypes = Enum('ObjectTypes', 'tree stone iron ruby')
    OBJECT_TYPES = ['tree', 'stone', 'iron', 'ruby']

    objects = []
    for i in range(0, 10000):
        objects.append(Object(
            random.choice(OBJECT_TYPES),
            random.uniform(20, 40020),
            random.uniform(20, 40020)
        ))

    # for object in objects:
    #     print(object.getDict())

    web.run_app(app, port=4000)