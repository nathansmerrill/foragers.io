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
        self.move()

    def getMovementSpeed(self):
        return (self.speed * (currentTimeMillis() - self.lastMoved)) * 0.02
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

def currentTimeMillis():
    # return int(round(time.time() * 1000))
    return time.time() * 1000

async def index(request):
    with open('../public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.event
async def connect(sid, environ):
    print('[CONNECT] ' + sid)
    await sio.emit('objects', [object.getDict() for object in objects], to=sid)
    await sio.emit('display', '<strong>Welcome. ' + str(len(players)) + ' ' +
                   ('player' if len(players) == 1 else 'players')
                   + ' online', to=sid)
    await sio.emit('join', sid, skip_sid=sid)
    if ('420' in sid) or ('69' in sid):
        await sio.emit('display', 'Nice')
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
    oldPlayer = player
    movementSpeed = player.getMovementSpeed()
    if 'a' in data['keyboard']:
        player.x -= movementSpeed
    if 'd' in data['keyboard']:
        player.x += movementSpeed
    if 'w' in data['keyboard']:
        player.y -= movementSpeed
    if 's' in data['keyboard']:
        player.y += movementSpeed
    player.angle = data['angle']

    # Movement validation
    if player.x < 0:
        player.x = 0
    if player.x > mapWidth:
        player.x = mapWidth
    if player.y < 0:
        player.y = 0
    if player.y > mapHeight:
        player.y = mapHeight

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
                        splitMessage = replacementWord.split()
                    else:
                        splitMessage[i] = replacementWord
        # Chat emotes
        for emote in emotes:
            if chatWord == emote[0]:
                if len(emote) == 3:
                    emoteImage = emote[2]
                else:
                    emoteImage = emote[0]
                splitMessage[i] = "<img class='chat-emote' src='assets/img/emotes/" + emoteImage + "." + emote[1] + "'>"

    await sio.emit('display', '<span class=\"chat-line\"><strong>' + sid + ': </strong>' + ' '.join(splitMessage) + '</span>')

app.router.add_get('/', index)
app.router.add_static('/', '../public')

if __name__ == '__main__':
    print('[SERVER] started')
    players = {}
    mapWidth = 2000
    mapHeight = 2000
    # ObjectTypes = Enum('ObjectTypes', 'wood stone iron ruby')
    objectTypes = ['wood', 'stone', 'iron', 'ruby']

    with open('filter.json', 'r') as filtersFile:
        filters = json.load(filtersFile)
    with open('emotes.json', 'r') as emotesFile:
        emotes = json.load(emotesFile)

    print('[SERVER] Generating terrain...')
    objects = []
    for i in range(0, 10000):
        objects.append(Object(
            random.choice(objectTypes),
            random.uniform(0, mapWidth),
            random.uniform(0, mapHeight)
        ))
    print('[SERVER] Terrain generation complete')

    web.run_app(app, port=4000)
