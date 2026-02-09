termux-change-repo
termux-setup-storage
pkg update
pkg-upgrade -y

pkg install gh lazygit jq ripgrep fzf fd bat curl ffmpeg git htop lsd man perl-rename python qalc termux-api tmux uv -y

uv tool install yt-dlp
uv tool install gallery-dl
uv tool install markitdown[all]
uv tool install pyfiglet

chmod +x .shortcuts/*.sh
