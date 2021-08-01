# Aeronaut functions Setup

This deploys the backend functions for Aeronaut, which watches for uploaded videos and then sends notifications if necessary.

Chat Notifications Setup
0. Set up a Telegram bot to notify you. Head over to [Telegram](https://telegram.org/). Create an account and download the interface you want.
1. In Telegram, create a new Group. 
2. Add `@getidsbot` to the Group. It will tell you some details about the group chat; save the chat `id`.
3. Create your Telegram bot [here](`https://t.me/botfather`). See more info [here](https://core.telegram.org/bots#3-how-do-i-create-a-bot). Save your `token`.
4. Add your bot to the Group you made as a normal user.
5. In this directory, run `firebase functions:config:set telegram.id={id} telegram.token={token}`, replacing {id} and {token} with the values you got above.    
6. Run `npm run deploy`