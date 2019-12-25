PROJECT="/home/merrilln/foragers.io"
cd $PROJECT
if [ -s server.pid ]; then
  echo Server running with pid $(cat server.pid)
else
  echo Server not running
fi