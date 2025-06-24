const { App, LogLevel } = require('@slack/bolt');
require('dotenv').config();

// Validate required environment variables
function validateEnvironmentVariables() {
  const requiredVars = {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET
  };

  const missingVars = [];
  const placeholderVars = [];

  for (const [varName, value] of Object.entries(requiredVars)) {
    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('your-') || value.includes('here')) {
      placeholderVars.push(varName);
    }
  }

  if (missingVars.length > 0 || placeholderVars.length > 0) {
    console.error('❌ Slack App Configuration Error');
    console.error('');
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:');
      missingVars.forEach(varName => console.error(`  - ${varName}`));
      console.error('');
    }
    
    if (placeholderVars.length > 0) {
      console.error('Environment variables still contain placeholder values:');
      placeholderVars.forEach(varName => console.error(`  - ${varName}: ${requiredVars[varName]}`));
      console.error('');
    }
    
    console.error('To fix this:');
    console.error('1. Go to https://api.slack.com/apps');
    console.error('2. Create a new app or select an existing one');
    console.error('3. Get your Bot User OAuth Token (starts with xoxb-)');
    console.error('4. Get your Signing Secret from Basic Information');
    console.error('5. Update the .env file with your actual credentials');
    console.error('');
    console.error('Example .env file:');
    console.error('SLACK_BOT_TOKEN=xoxb-your-actual-bot-token');
    console.error('SLACK_SIGNING_SECRET=your-actual-signing-secret');
    console.error('');
    
    process.exit(1);
  }
}

// Validate environment variables before initializing the app
validateEnvironmentVariables();

// Initialize your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false, // Set to true if using Socket Mode for development
  port: process.env.PORT || 3000,
  logLevel: LogLevel.ERROR
});

// Listen for the /hello slash command
app.command('/hello', async ({ command, ack, respond }) => {
  try {
    // Acknowledge the slash command immediately
    await ack();
    
    // Respond with the greeting message
    await respond({
      text: 'Hello, Arion!',
      response_type: 'ephemeral' // Only visible to the user who ran the command
    });
    
    console.log(`Responded to /hello command from user: ${command.user_id}`);
  } catch (error) {
    console.error('Error handling /hello command:', error);
    
    // Send an error response if something goes wrong
    await respond({
      text: 'Sorry, something went wrong!',
      response_type: 'ephemeral'
    });
  }
});

// Handle app errors
app.error((error) => {
  console.error('App error:', error);
});

// Start your app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Bolt app is running!');
    console.log(`🚀 Server is listening on port ${process.env.PORT || 3000}`);
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }
})();