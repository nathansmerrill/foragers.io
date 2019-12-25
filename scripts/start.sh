PROJECT="/home/merrilln/foragers.io"
cd $PROJECT
nohup ./server.py 1>server.log 2>server.err &
echo $! > server.pid
echo Server Started