local wezterm = require("wezterm")

local config = wezterm.config_builder()

-- config.automatically_reload_config = true
-- config.unix_omains = { { name = 'local' } }
config.font_size = 12
config.font = wezterm.font("MesloLGM Nerd Font Mono")
config.color_scheme = "Vs Code Dark+ (Gogh)"
config.front_end = "WebGpu"
config.default_prog = { "pwsh", "-NoLogo" }
config.window_decorations = "RESIZE"
config.hide_tab_bar_if_only_one_tab = true
config.window_background_opacity = 1
config.window_background_opacity = 0.9
config.text_background_opacity = 1.0
config.keys = {
	{ key = "h", mods = "SHIFT|ALT", action = wezterm.action.SplitHorizontal({ domain = "CurrentPaneDomain" }) },
	{ key = "v", mods = "SHIFT|ALT", action = wezterm.action.SplitVertical({ domain = "CurrentPaneDomain" }) },
	{ key = "x", mods = "SHIFT|ALT", action = wezterm.action.CloseCurrentPane({ confirm = false }) },
	{ key = "x", mods = "SHIFT|CTRL", action = wezterm.action.CloseCurrentPane({ confirm = false }) },
}
config.visual_bell = { fade_in_duration_ms = 0, fade_out_duration_ms = 0 }
config.default_gui_startup_args = { 'connect', 'local' }

return config
