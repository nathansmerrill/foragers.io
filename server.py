#!/usr/bin/python

from aiohttp import web
import socketio

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

async def index(request):
    with open('public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.event
async def connect(sid, environ):
    print('Client connected ' + sid)

@sio.event
async def disconnect(sid):
    print('Client disconnected ' + sid)

app.router.add_get('/', index)
app.router.add_static('/', './public')

if __name__ == '__main__':
    web.run_app(app, port=4000)