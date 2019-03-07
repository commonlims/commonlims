# This file must be sourced

if $(git branch | grep "*" | grep -q py3); then
    CLIMS_PYTHON_VERSION="3.7"
    CLIMS_CONDA_ENV="commonlims3"
else
    CLIMS_PYTHON_VERSION="2.7"
    CLIMS_CONDA_ENV="commonlims2"
fi

conda create --name=$CLIMS_CONDA_ENV python="$CLIMS_PYTHON_VERSION"
source activate $CLIMS_CONDA_ENV
export $CLIMS_PYTHON_PATH=$(which python)  # For use in e.g. vscode

echo "using conda env: $CLIMS_CONDA_ENV"

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:`echo $CONDA_EXE | awk '{gsub("bin/conda", "lib")}1'`
echo "set LD_LIBRARY_PATH to $LD_LIBRARY_PATH"

echo "Installing nvm"
if ! type "nvm" > /dev/null; then
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
  source ~/.bashrc
fi

echo "Installing correct node version"
nvm install $(cat .nvmrc)

echo "Activating recommended node version"
nvm use $(cat .nvmrc)
