termux-change-repo
termux-setup-storage
pkg update
pkg-upgrade -y

pkg install which gh lazygit jq ripgrep fzf fd bat curl ffmpeg git htop lsd man python qalc termux-api tmux uv -y

uv tool install yt-dlp
uv tool install gallery-dl

chmod +x .shortcuts/*.sh
