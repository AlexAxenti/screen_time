# Screen Time

A windows app and background agent that tracks screen time and application usage and provides detailed statistics.

## Key Features

- Tracks active foreground applications.
- Detects idle/AFK time so usage doesn’t keep counting when you’re away.
- Dashboard views for Daily / Weekly summaries, top apps, timelines and other interesting statistics.
- Settings to tailor performance + privacy (hide vs destroy on close, start on windows start up, disable tracking specific apps, pause / resume tracking).
- Local-first by design: all data stays on-device in SQLite.

## Installation

Header over to the repository's [Releases](https://github.com/AlexAxenti/screen_time/releases) page and select the most recent one. Download either the setup.exe or the msi install file, as you prefer.

To update your current installation, follow these same steps and simply run the newest installer.

## Technical Highlights

The app is built as a Rust background agent along with a Tauri + React desktop UI that reads analytics from a local SQLite database.

For performance and communication, the agent uses multiple threads (foreground sampling vs sql writing) with channel-based communication.

The background usage of the agent is very small, usually ~2 MB of RAM. The desktop UI also comes with a 'destroy on close' settings option that prevents background minimization to avoid unnecessary RAM usage while the UI is unused.