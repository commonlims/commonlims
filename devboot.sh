# This file must be sourced

if [ -z $CLIMS_VIRTUALENV2 ]; then
    CLIMS_VIRTUALENV2=~/.virtualenvs/clims2
fi

if [ -z $CLIMS_VIRTUALENV3 ]; then
    CLIMS_VIRTUALENV3=~/.virtualenvs/clims3
fi

if [ -z $CLIMS_DEFAULT_VIRTUALENV ]; then
    if $(git branch | grep "*" | grep -q py3); then
        CLIMS_DEFAULT_VIRTUALENV=$CLIMS_VIRTUALENV3
    else
        CLIMS_DEFAULT_VIRTUALENV=$CLIMS_VIRTUALENV2
    fi
fi

echo "python2: $CLIMS_VIRTUALENV2"
echo "python3: $CLIMS_VIRTUALENV3"
echo "using:   $CLIMS_DEFAULT_VIRTUALENV"

# TODO: don't use hardcoded python paths
if [ ! -d $CLIMS_VIRTUALENV2 ]; then
    virtualenv -p python $CLIMS_VIRTUALENV2
fi

if [ ! -d $CLIMS_VIRTUALENV3 ]; then
    virtualenv -p python3 $CLIMS_VIRTUALENV3
fi

echo "Activating default virtualenv $CLIMS_DEFAULT_VIRTUALENV"
source $CLIMS_DEFAULT_VIRTUALENV/bin/activate

echo "Installing nvm"
if ! type "nvm" > /dev/null; then
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
  source ~/.bashrc
fi

echo "Installing correct node version"
nvm install $(cat .nvmrc)

echo "Activating recommended node version"
nvm use $(cat .nvmrc)

sudo apt install -y libgeoip1 libgeoip-dev geoip-bin libxmlsec1-dev
sudo apt install -y redis
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
sudo apt-get update
sudo apt install -y postgresql-9.6
