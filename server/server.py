#!/usr/bin/python3 -u

from aiohttp import web
import aiohttp_cors
import socketio
import random, json, time

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
        self.speed = 1
        self.sid = sid
        self.lastMoved = currentTimeMillis()

    def getMovementSpeed(self):
        return (self.speed * (currentTimeMillis() - self.lastMoved)) * 0.015
        # return (self.speed * (currentTimeMillis() - self.lastMoved)) * 0.1

    def move(self):
        self.lastMoved = currentTimeMillis()

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

def currentTimeMillis():
    # return int(round(time.time() * 1000))
    return time.time() * 1000

async def index(request):
    with open('public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.event
async def connect(sid, environ):
    print('[CONNECT] ' + sid)
    await sio.emit('objects', [object.getDict() for object in objects], to=sid)
    await sio.emit('join', sid)
    players[sid] = Player('Player ' + sid, sid)

@sio.event
async def disconnect(sid):
    print('[DISCONNECT] ' + sid)
    players.pop(sid, None)
    await sio.emit('leave', sid)

@sio.event
async def inputs(sid, data):
    # print('Received inputs from ' + sid)
    # print(data['keyboard'])
    # Player Input

    # print(data)
    player = players[sid]
    if 'a' in data['keyboard']:
        player.x -= player.getMovementSpeed()
    if 'd' in data['keyboard']:
        player.x += player.getMovementSpeed()
    if 'w' in data['keyboard']:
        player.y -= player.getMovementSpeed()
    if 's' in data['keyboard']:
        player.y += player.getMovementSpeed()
    player.angle = data['angle']
    player.move()
    await sio.emit('player', player.getDict())

@sio.event
async def chat(sid, data):
    print('[CHAT] ' + sid + ': ' + data)
    message = data
    splitMessage = data.split()
    # Chat filter
    for i, chatWord in enumerate(splitMessage):
        for filter in filters:
            for blockedWord in filter['blocked']:
                if chatWord == blockedWord:
                    replacementWord = random.choice(filter['replacements'])
                    if ('entireMessage' in filter) and filter['entireMessage']:
                        message = replacementWord
                    else:
                        splitMessage[i] = replacementWord
                        message = ' '.join(splitMessage)
    await sio.emit('chat', {
        'sid': sid,
        'message': message
    })

app.router.add_get('/', index)
app.router.add_static('/', 'public')

if __name__ == '__main__':
    print('[SERVER] started')
    # ObjectTypes = Enum('ObjectTypes', 'wood stone iron ruby')
    OBJECT_TYPES = ['wood', 'stone', 'iron', 'ruby']

    with open('server/filter.json', 'r') as filtersFile:
        filters = json.load(filtersFile)

    print('[SERVER] Generating terrain...')
    objects = []
    for i in range(0, 10000):
        objects.append(Object(
            random.choice(OBJECT_TYPES),
            random.uniform(0, 2000),
            random.uniform(0, 2000)
        ))
    print('[SERVER] Terrain generation complete')

    web.run_app(app, port=4000)
