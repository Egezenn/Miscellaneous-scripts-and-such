clear
echo $(date -I)

if command -v tmux &> /dev/null; then
  if [ -z "$TMUX" ]; then
    tmux attach || tmux new-session
    exit
  fi
fi

export PATH="$PATH:~/.local/bin"
export EDITOR="micro"

alias ~="cd ~"
alias ..="cd .."
alias .="pwd"
alias ls="lsd"
alias la="lsd -A"
alias lt="lsd --tree --depth 3"
alias ltd="lsd --tree"
mkcd () { mkdir -p -- "$1" && cd -P -- "$1"; }
alias c="clear"
alias cs="cd ~/storage/shared/"
alias csm="cd ~/storage/shared/Movies"
alias eprofile="micro ~/.bashrc"
alias m="micro"
alias w="micro -softwrap true"

mkbak () {
  rm -r ~/.bak
  mkdir ~/.bak
  mkdir ~/.bak/micro
  cp ~/.termux/termux.properties ~/.bak
  cp ~/.bashrc ~/.bak
  cp ~/.bash_history ~/.bak
  cp ~/.termux/init_termux.sh ~/.bak
  cp ~/.config/micro/settings.json ~/.bak/micro
  rm -r ~/storage/shared/Documents/termux_backup
  cp -r ~/.bak ~/storage/shared/Documents/termux_backup
}

reload () {
  termux-reload-settings
  source ~/.bashrc
}
