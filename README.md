# Human in the Loop

A free, open-source browser game in which the player runs an AI startup from a garage toward the singularity, entirely inside a fake company workspace: a Stripe-like dashboard, a Slack-like chat, and a DM with the company's own AI. There are no game graphics; the comedy is how closely interface and writing mirror the industry its players work in.

Play it at **https://hitl-game.github.io/**. No account, no tracking, no network calls after load.

## Development

```bash
nvm use        # Node 24
npm ci
npx playwright install
npm run dev
```

Run `npm run check` before opening a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the rules and [AGENTS.md](AGENTS.md) if you work with an AI agent.

## License

[MIT](LICENSE)
