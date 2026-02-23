# LoL Stat Tracker (Locked Account)

Personal League of Legends stat tracker using Riot API, locked to EUW1 and one account:
`feelsbanman#EUW`

## Requirements

- Python 3.10+
- Riot API key

## Run

In PowerShell:

```powershell
cd "c:\Users\Adonis PH\Fun\lol-stat-tracker"
$env:RIOT_API_KEY="YOUR_RIOT_API_KEY"
py server.py
```

Then open:

`http://localhost:8090`

## Deploy From GitHub (Public URL)

Use Render with this repo. GitHub Pages is not suitable because this app has a Python backend and a secret API key.

1. Create a GitHub repo and push this folder:

```powershell
cd "c:\Users\Adonis PH\Fun\lol-stat-tracker"
git init
git add .
git commit -m "Initial Karma tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

2. In Render:
- New `Blueprint` deploy
- Connect your GitHub repo
- Render will detect `render.yaml`
- Add environment variable: `RIOT_API_KEY=YOUR_RIOT_API_KEY`
- Deploy

3. Share the Render URL with others (works across different networks).

## What it shows

- Player identity and level
- Latest 5 matches (fixed display)
- Aggregate stats (win rate, KDA, CS)
- Support-focused metrics (vision, control wards, kill participation, ally utility)
- KR Deeplol Karma OTP comparison with selectable OTP profiles
- Build pictures for OTP and your setup
- Rune popup for OTP and your setup
- Karma setup inference sampled from latest 30 games
- Top 5 KR OTP average benchmark with delta badges
- Karma trend view, lane-phase summary, matchup breakdown, and improvement score

## Notes

- The app uses Riot ID format: `GameName#Tag`.
- The tracker is EUW-only (`euw1`) and account-locked in server code.
- Requests for other accounts are ignored by design.
- Deeplol OTP benchmark data is fetched from `b2c-api-cdn.deeplol.gg` and cached for 5 minutes.
- For production, run behind HTTPS and keep your API key on the server only.
