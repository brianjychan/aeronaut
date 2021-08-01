# Setup Scripts

The following process initializes your Firestore with necessary data.

1. Edit `src/setup.ts` with the appropriate values at the top.
2. Run `npm run script dev setup`
   - Type `setup` when it asks you to. 
## ---- Setup ends here ---




-----


### The following info is how to use this tool for further scripting. This is not needed for setup.

This is a template for creating and running admin scripts using the Firebase Node Admin SDK

Written with ES8, Typescript, and Node.js.

Use cases include emergency hotfixes and manual manipulations of your database (edits to your prod db should not be taken lightly)

--- 
## Get started

- Run `npm install` to install `firebase-admin`, `typescript`, etc.
- Add your dev/prod service account keys (e.g. ) to `/keys/`
    - Default path options:
        - `/keys/dev-service-account-key.json`
        - `/keys/prod-service-account-key.json`
    - If you use a different path instead of `/keys`, be sure to include it in `.gitignore` so you don't commit it to your VCS.
    - You can add more options or edit the name in `/src/index.ts`
    - By default, control flow for prod is commented out. Uncomment to enable

- Create your script in `src` 
    - Example: `/src/templateScript.ts`
    - Make sure to make the enclosed function the default export.
    - Note that `/src/index.ts` recognizes `scriptFileName` based on the name of the file, not the name of the exported function

- Run it using `npm run script {dev/production} scriptFilename`
    - Example: `npm run script dev templateScript` (if script is named `templateScript.ts`)
        - If `production` is used, you must follow up with `confirm production {scriptFileName}`
    - This compiles using `tsc` before running. See `package.json` for details.

- If you are adding this as a dir in your main repo, you can remove the `.git` folder in this dir
