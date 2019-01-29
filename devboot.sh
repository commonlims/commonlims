# This file must be sourced

echo "Activating default virtualenv"
source ./env/bin/activate

echo "Activating recommended node version"
nvm use $(cat .nvmrc)
