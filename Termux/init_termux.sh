termux-change-repo
termux-setup-storage
pkg update
pkg-upgrade -y

pkg install bat ffmpeg gcc git htop lsd man perl-rename python qalc termux-api tmux url uv -y

uv tool install yt-dlp
uv tool install gallery-dl
