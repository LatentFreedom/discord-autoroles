# Discord Auto Roles Bot
Get a bot to set roles for a discord.

## Sites Used
1. Discord Dev URL **[https://discord.com/developers/applications](https://discord.com/developers/applications)**
2. Discord Bot Docs **[https://discord.com/developers/docs/intro](https://discord.com/developers/docs/intro)**
3. Discord Role Manager **[https://discord.js.org/#/docs/main/stable/class/RoleManager](https://discord.js.org/#/docs/main/stable/class/RoleManager)**
4. Discord Reactions **[https://discordjs.guide/popular-topics/reactions.html#reacting-to-messages](https://discordjs.guide/popular-topics/reactions.html#reacting-to-messages)**

## Running the bot
1. Get the needed packages with `npm install`
2. Create `.env` and fill it with the needed values
3. Create `roles.json` and fill it with the needed values
4. Add images to `./images/`
5. run with `node index.js`

## Values in `.env`
```
DISCORD_TOKEN=
# guild id for the discord server that commands will be in
GUILD_ID=
# channel id for the channel that will reply to the commands
CHANNEL_ID=
```

## Values in `roles.json`
```
{
    "channel" : "0",
    "categories" : [
        {
            "title" : "title1",
            "description" : "description1",
            "embedId" : "",
            "roles": [
                {
                    "role" : "roleName1",
                    "description" : "**roleName1** notifications",
                    "custom_emoji" : true,
                    "image" : "role1.jpeg"
                },
                {
                    "role" : "roleName2",
                    "description" : "**roleName2** notifications",
                    "custom_emoji" : false,
                    "image" : "🎮",
                    "emoji" : ":video_game:"
                }
            ]
        }
    ]
}
```

## Discord -Commands
1. **-reactionrole:** Send message where reactions will be processed for roles