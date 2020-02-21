#!/usr/bin/python3 -u

from datetime import datetime
import socketio, eventlet
import random, json, time, math

class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def len(self):
        return math.sqrt(
            (self.x ** 2) +
            (self.y ** 2)
        )

    def add(self, vector):
        self.x += vector.x
        self.y += vector.y

    def multiply(self, value):
        self.x *= value
        self.y *= value

    def divide(self, value):
        if value != 0:
            self.x /= value
            self.y /= value

    def normalize(self, value=1):
        self.divide(self.len())
        self.multiply(value)

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
        self.resources = {
            'wood': 0,
            'stone': 0,
            'iron': 0,
            'ruby': 0
        }
        self.angle = 0
        self.speed = 1
        self.sid = sid
        self.move()

    def getMovementSpeed(self):
        return (self.speed * (currentTimeMillis() - self.lastMoved)) * 0.02
        # return (self.speed * (currentTimeMillis() - self.lastMoved)) * 0.5

    def move(self):
        self.lastMoved = currentTimeMillis()

    def getDict(self):
        return self.__dict__


def calcBellCurve(x, offset, width, height):
    return height * math.exp(-(math.pow(x - offset, 2) / (width)))

sio = socketio.Server(async_mode='eventlet', cors_allowed_origins='*')
staticFiles = {
    '/': '../public/index.html',
    '/static': '../public'
}
app = socketio.WSGIApp(sio, static_files=staticFiles)

def currentTimeMillis():
    # return int(round(time.time() * 1000))
    return time.time() * 1000

def sprint(tag, message, timestamp=True):
    out = '['
    out += tag
    if timestamp:
        out += ' '
        out += datetime.now().strftime("%d-%b-%Y %-I:%M:%S %p")
    out += '] '
    out += message
    print(out)

@sio.event
def connect(sid, environ):
    sprint('CONNECT', sid)
    sio.emit('objects', [object.getDict() for object in objects], to=sid)
    sio.emit('display', '<strong>Welcome. ' + str(len(players)) + ' ' +
                   ('player' if len(players) == 1 else 'players')
                   + ' online', to=sid)
    sio.emit('display', '<strong>' + sid + '</strong> joined', skip_sid=sid)
    if ('420' in sid) or ('69' in sid):
        sio.emit('display', 'Nice')
    players[sid] = Player('Player ' + sid, sid)

@sio.event
def disconnect(sid):
    sprint('DISCONNECT', sid)
    players.pop(sid, None)
    sio.emit('leave', sid)

@sio.event
def inputs(sid, data):
    # print('Received inputs from ' + sid)
    # print(data['keyboard'])
    # Player Input

    # print(data)
    player = players[sid]
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
    # World borders
    if player.x < 0:
        player.x = 0
    if player.x > mapWidth:
        player.x = mapWidth
    if player.y < 0:
        player.y = 0
    if player.y > mapHeight:
        player.y = mapHeight

    # Objects
    for object in objects:
        objectSize = objectTypes[object.type]
        if abs(player.x - object.x) <= objectSize and abs(player.y - object.y) <= objectSize:
            # print('close to object')
            objectToPlayer = Vector(player.x - object.x, player.y - object.y)
            if objectToPlayer.len() <= objectSize:
                objectToPlayer.normalize(objectSize)
                player.x = object.x + objectToPlayer.x
                player.y = object.y + objectToPlayer.y

    player.move()
    sio.emit('player', player.getDict())

@sio.event
def chat(sid, data):
    sprint('CHAT', f'{sid}: {data}')
    if '<' in data and '>' in data:
        sio.emit('display', '<span class=\"chat-line\"><strong>' + sid + '</strong> is a M1G H4CK3R 0110100100</span>')
        return
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
                splitMessage[i] = "<img class='chat-emote' src='/static/assets/img/emotes/" + emoteImage + "." + emote[1] + "'>"

    sio.emit('display', '<span class=\"chat-line\"><strong>' + sid + ': </strong>' + ' '.join(splitMessage) + '</span>')

def getRandomObject(x, y):
    z = random.uniform(0, 100)
    ix = calcBellCurve(x, 1000, 422500, 10)
    iy = calcBellCurve(y, 1000, 422500, 10)
    if ix > z and iy > z:
        return 'ruby'
    ix += calcBellCurve(x, 1000, 1200000, 20)
    iy += calcBellCurve(y, 1000, 1200000, 20)
    if ix > z and iy > z:
        return 'iron'
    ix += calcBellCurve(x, 1000, 3240000, 50)
    iy += calcBellCurve(y, 1000, 3240000, 50)
    if ix > z and iy > z:
        return 'stone'
    return 'wood'

if __name__ == '__main__':
    sprint('SERVER', 'Server initializing...')
    objects = []
    players = {}
    mapWidth = 2000
    mapHeight = 2000
    # This maps the resource type to the hitbox size
    objectTypes = {
        'wood': 8.5,
        'stone': 5,
        'iron': 5,
        'ruby': 5
    }

    # Loading files
    with open('filter.json', 'r') as filtersFile:
        filters = json.load(filtersFile)
    with open('emotes.json', 'r') as emotesFile:
        emotes = json.load(emotesFile)

    # Terrain generation
    sprint('SERVER', 'Generating terrain...')
    terrainGenStarted = currentTimeMillis()
#   Good new terrain
#   for i in range(0, 8000):
#       if i % 400 == 0:
#           sprint('SERVER', f'Generating Terrain: {i / 80}% [{"█" * int(i / 400)}{"." * (20 - int(i / 400))}]',)
#       x = random.uniform(0, mapWidth)
#       y = random.uniform(0, mapHeight)
#       closeLimit = False
#       for o in objects:
#           if Vector(x - o.x, y - o.y).len() < 6:
#               closeLimit = True
#       if not closeLimit:
#           if (random.uniform(0, 1) < calcBellCurve(x, 1000, 1000000, 1) and
#                   random.uniform(0, 1) < calcBellCurve(y, 1000, 1000000, 1)):
#               objects.append(Object(
#                   getRandomObject(x, y),
#                   x,
#                   y
#               ))
    # Bad old terrain - used for testing
    for i in range(0, 10000):
        objects.append(Object(
            random.choice(list(objectTypes.keys())),
            random.uniform(0, mapWidth),
            random.uniform(0, mapHeight)
        ))

    sprint('SERVER', f'Terrain generation complete ({round(((currentTimeMillis() - terrainGenStarted) / 1000), 2)}s)')

    eventlet.wsgi.server(eventlet.listen(('', 4000)), app, log_format='%(client_ip)s disconnected...')
