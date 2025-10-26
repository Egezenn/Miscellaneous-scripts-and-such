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
alias ls="lsd -I 'storage'"
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

alias eprofile="micro ~/.bashrc"
alias m="micro"
alias w="micro -softwrap true"
alias hgrep="history | rg"
alias rgn="rg -NI --color never"


# permanent solution to backups
mkbak () {
  rm -r ~/.bak
  rm -r ~/storage/shared/Documents/termux_backup
  
  mkdir ~/.bak
  mkdir ~/.bak/micro

  cp ~/.termux/termux.properties ~/.bak
  cp ~/.bashrc ~/.bak
  cp ~/.bash_history ~/.bak
  cp ~/.termux/init_termux.sh ~/.bak
  cp ~/.config/micro/settings.json ~/.bak/micro
  
  cp -r ~/.shortcuts ~/.bak
  cp -r ~/.bak ~/storage/shared/Documents/termux_backup
}

LAST_BACKUP_DATE_FILE="~/.bak/date.txt"
backup_interval=$((7*24*60*60))
current_time=$(date +%s)

if [ -f "$LAST_BACKUP_DATE_FILE" ]; then
  last_backup_date=$(cat "$LAST_BACKUP_DATE_FILE")
else
  last_backup_date=0
fi

if (( current_time - last_backup_date > backup_interval )); then
  mkbak()
  echo $current_time > "$LAST_BACKUP_DATE_FILE"
fi

alias reload="source ~/.bashrc"
reloadf () {
  termux-reload-settings
  source ~/.bashrc
}
