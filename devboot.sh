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
    virtualenv -p /usr/local/bin/python2.7 $CLIMS_VIRTUALENV2
fi

if [ ! -d $CLIMS_VIRTUALENV3 ]; then
    virtualenv -p /usr/bin/python3 $CLIMS_VIRTUALENV3
fi

echo "Activating default virtualenv $CLIMS_DEFAULT_VIRTUALENV"
source $CLIMS_DEFAULT_VIRTUALENV/bin/activate

echo "Activating recommended node version"
nvm use $(cat .nvmrc)
