clear
echo $(date -I)

if command -v tmux &> /dev/null; then
  if [ -z "$TMUX" ]; then
    tmux attach || tmux new-session
    exit
  fi
fi

export PATH="$PATH:~/.local/bin"
export LOCALSTORE="~/storage/shared"

alias n="nano"
alias ~="cd ~"
alias ..="cd .."
alias .="pwd"
alias ls="lsd --icon never -I 'storage'"
alias l="ls -l --blocks 'permission,size,name'"
alias ld="ls -l --blocks 'permission,size,date,name' --date '+%Y-%m-%d_%H-%M'"
alias la="ls -A"
alias lt="ls --tree --depth 3"
alias ltd="ls --tree"
mkcd () { mkdir -p -- "$1" && cd -P -- "$1"; }
alias cs="cd ~/storage/shared/"
alias csm="cd ~/storage/shared/Movies"

alias c="clear"
alias cx="chmod +x"
xsh () { chmod +x "$1" && sh "$1"; }

alias pkgu="pkg update && pkg upgrade -y"
alias eprofile="nano ~/.bashrc"
alias hgrep="history | rg"
alias rgn="rg -NI --color never"

mkbak () {
  rm -r ~/.bak
  mkdir ~/.bak
  cp ~/.termux/termux.properties ~/.bak
  cp ~/.bashrc ~/.bak
  cp ~/.bash_history ~/.bak
  cp ~/.termux/init_termux.sh ~/.bak
  cp -r ~/.shortcuts ~/.bak
  rm -r ~/storage/shared/Documents/termux_backup
  cp -r ~/.bak ~/storage/shared/Documents/termux_backup
  rm -r ~/.bak
}

alias reload="source ~/.bashrc"
reloadf () {
  termux-reload-settings
  source ~/.bashrc
}
