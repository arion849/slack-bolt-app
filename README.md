# Slack Bolt App

A Slack bot built with Bolt for JavaScript, plus the CI/CD pipeline that ships it to Kubernetes the GitOps way. The bot answers the `/hello` slash command. Most of the work is in the pipeline.

## Deployment pipeline

```mermaid
flowchart LR
    A[push to main] --> B[GitHub Actions]
    B --> C[bump version tag]
    C --> D[build and push image to JFrog]
    D --> E[update image tag in ArgoCD repo]
    E --> F[ArgoCD syncs to Kubernetes]
```

On every push to `main`, [`.github/workflows/main.yml`](.github/workflows/main.yml):

1. Reads the latest `major.minor` git tag, bumps the minor version and pushes the new tag.
2. Builds the Docker image with Buildx and pushes it to a JFrog Artifactory registry as `latest` plus the version tag, reusing the registry layer cache.
3. Clones the deployment repo, [arion849/ArgoCD](https://github.com/arion849/ArgoCD), rewrites the image tag in `k8s/deployment.yaml` and commits it.

ArgoCD watches that repo and rolls the new version out to the cluster. The app's code and its deployment config live in separate repos, so every release shows up as a commit in the deployment history.

Bot credentials are injected from a Kubernetes secret (`slack-env`). Registry and GitHub credentials are GitHub Actions secrets.

## Setup Instructions

### 1. Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" and choose "From scratch"
3. Give your app a name (e.g., "Hello Bot") and select your workspace
4. Click "Create App"

### 2. Configure Your App

1. **OAuth & Permissions**: Add the following bot token scopes:
   - `commands` - Add slash commands
   - `incoming-webhook` - Send messages as your app

2. **Slash Commands**: Create a new slash command:
   - Command: `/hello`
   - Request URL: `https://your-domain.com/slack/events` (you'll need to deploy this)
   - Short Description: "Say hello to Arion"

3. **Install App**: Install the app to your workspace to get your bot token

### 3. Get Your Credentials

1. **Bot Token**: Found in "OAuth & Permissions" → "Bot User OAuth Token" (starts with `xoxb-`)
2. **Signing Secret**: Found in "Basic Information" → "App Credentials" → "Signing Secret"

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Replace the placeholder values with your actual Slack app credentials:
   ```
   SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
   SLACK_SIGNING_SECRET=your-actual-signing-secret
   PORT=3000
   ```

### 5. Run the App

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The app will start on port 3000 by default.

### 6. Expose Your Local Server (for Development)

To test locally, you'll need to expose your local server to the internet using a tool like:
- [ngrok](https://ngrok.com/): `ngrok http 3000`
- [localtunnel](https://localtunnel.github.io/www/): `npx localtunnel --port 3000`

Update your Slack app's Request URL with the public URL provided by these tools.

## Usage

Once set up, users in your Slack workspace can use the `/hello` command:

```
/hello
```

The bot will respond with: "Hello, Arion!"

## Features

- Responds to `/hello` slash command
- Ephemeral responses (only visible to the user who ran the command)
- Error handling and logging
- Environment-based configuration
- Ready for deployment to cloud platforms
