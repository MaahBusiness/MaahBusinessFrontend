#!/usr/bin/env bash
# Lance le serveur de dev avec Node 20 (sans dépendre de nvm en zsh)
NODE20="$HOME/.nvm/versions/node/v20.20.0/bin"
export PATH="$NODE20:$PATH"
exec "$NODE20/npm" run dev
