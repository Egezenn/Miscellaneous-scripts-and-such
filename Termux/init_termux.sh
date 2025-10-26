termux-change-repo
termux-setup-storage
pkg update
pkg-upgrade -y

pkg install jq rg fzf fd gcc bat curl ffmpeg git htop lsd man perl-rename python qalc termux-api tmux uv -y
pkg install node nvim
git clone https://github.com/LazyVim/starter ~/.config/nvim
rm -rf ~/.config/nvim/.git

uv tool install yt-dlp
uv tool install gallery-dl

chmod +x .shortcuts/*.sh

