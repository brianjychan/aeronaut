# Aeronaut Web console setup


Deploy your website on the Internet. Note that only you can log in using the credentials you set up earlier.

1. Make sure you've forked this Github repo.
2. In the Firebase Console, register another app (use "Web" again). You can nickname it `console`. 
   - Leave Firebase Hosting unchecked.
3. Head over to `https://netlify.com`, log in with Github, and choose "New site from Git". Choose Github, then the repo you forked.
4. Before Deploying, choose "Show Advanced". Choose "New variable" several times, each time inputting one of the keys from the Firebase Console configuration from step 2. Use the following naming convention:
   - ```js
      REACT_APP_API_KEY
      REACT_APP_AUTH_DOMAIN
      REACT_APP_DATABASE_URL
      REACT_APP_PROJECT_ID
      REACT_APP_STORAGE_BUCKET
      REACT_APP_MESSAGING_SENDER_ID
      REACT_APP_APP_ID
      REACT_APP_MEASUREMENT_ID
      ```
5. After it deploys and builds, you will be able to access it from anywhere online.

Run locally only:

1. Run `npm install`
2. Create an `.env` file in this directory. Put your firebase config details there, using the following format (first line filled out with an example):
    - ```js
      REACT_APP_API_KEY=AIzaSyA1u-RM3ZZMdLwPJ1xGZgSabGQi8kzIYQg
      REACT_APP_AUTH_DOMAIN=
      REACT_APP_DATABASE_URL=
      REACT_APP_PROJECT_ID=
      REACT_APP_STORAGE_BUCKET=
      REACT_APP_MESSAGING_SENDER_ID=
      REACT_APP_APP_ID=
      REACT_APP_MEASUREMENT_ID=
      ```
3. Run `npm run start`

