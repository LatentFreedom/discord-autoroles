const { MessageEmbed } = require('discord.js');
const fs = require('fs');

const getJsonData = () => {
    let rawdata = fs.readFileSync('./roles.json');
    return JSON.parse(rawdata);
}

const saveJsonData = (data) => {
    json = JSON.stringify(data, null, 4);
    fs.writeFile('./roles.json', json, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Roles data saved successfully");
        }
    });
}

const checkForCategoryUpdates = async (category, messageEmbeds) => {
    
    // Check message embeds for needed emojis
    for (let i = 0; i < messageEmbeds.length; i++) {
        
        if (messageEmbeds[i].id == category.embedId) {
            
            // Get reactions
            const reactions = messageEmbeds[i].reactions.cache;
            // console.log(reactions);
            let uneededEmojis = reactions;
            let needsUpdate = false;

            // Check reactions
            for (let iii = 0; iii < category.roles.length; iii++) {
                const role = category.roles[iii];
                if (role.custom_emoji && role.emoji === undefined) {
                    role.emoji = messageEmbeds[i].guild.emojis.cache.find(emoji => emoji.name === role.name);
                }

                // Check if needed emoji has reaction
                if (!reactions.get(role.emoji.id) && !reactions.get(role.emoji)) {
                    console.log(`${role.name} not found`)
                    console.log(`Category ${category.title} needs updating.`);
                    needsUpdate = true;
                } else {

                    // Uneeded emoji reaction found
                    if (role.custom_emoji) {
                        uneededEmojis.delete(role.emoji.id);
                    } else {
                        uneededEmojis.delete(role.emoji);
                    }

                }
            }

            // Determine if emojis need removal
            if (uneededEmojis.size > 0) {
                console.log(`Removing uneeded emojis: ${[...uneededEmojis.keys()]}`);
                for (const emoji of uneededEmojis) {
                    messageEmbeds[i].reactions.resolve(emoji[0]).remove();
                }
                needsUpdate = true;
            }

            // Determine if embed needs description update
            if (needsUpdate) {
                editCategoryEmbed(category, messageEmbeds[i]);
                return true;
            }
            
        }

    }
    return false;

}

const sendCategoryEmbed = async (category, message) => {
    // Create message description that includes emojis with role
    let description = "";
    // Loop through roles and build message
    for (let i = 0; i < category.roles.length; i++) {
        const savedRole = category.roles[i];
        // Check for custom emoji
        if (savedRole.custom_emoji) {
            // Get the custom emoji data
            const emoji = message.guild.emojis.cache.find(emoji => emoji.name === savedRole.name);
            savedRole.emoji = emoji;
        } else {
            // Non custom emoji images are the emoji
            savedRole.emoji = savedRole.image;
            
        }
        const r = message.guild.roles.cache.find(role => role.name === savedRole.name);
        savedRole.role = r;
        description += `${savedRole.emoji} for ${savedRole.description}\n`;
        
    }

    const embed = new MessageEmbed()
        .setTitle(`${category.title} roles`)
        .setDescription(`${category.description}\n\n` + description);

    // Send message
    let messageEmbed = await message.channel.send({embeds: [embed]});

    // Set embedId
    // NOTE: embed will not be posted twice when embedId is set
    category.embedId = messageEmbed.id;

    // Send reactions
    for (let i = 0; i < category.roles.length; i++) {
        const role = category.roles[i];
        await messageEmbed.react(role.emoji);
    }
}

const editCategoryEmbed = async (category, message) => {
    // Create message description that includes emojis with role
    let description = "";
    // Loop through roles and build message
    for (let i = 0; i < category.roles.length; i++) {
        const savedRole = category.roles[i];
        // Check for custom emoji
        if (savedRole.custom_emoji) {
            // Get the custom emoji data
            const emoji = message.guild.emojis.cache.find(emoji => emoji.name === savedRole.name);
            savedRole.emoji = emoji;
        } else {
            // Non custom emoji images are the emoji
            savedRole.emoji = savedRole.image;
            
        }
        const r = message.guild.roles.cache.find(role => role.name === savedRole.name);
        savedRole.role = r;
        description += `${savedRole.emoji} for ${savedRole.description}\n`;
        
    }

    const embed = new MessageEmbed()
        .setTitle(`${category.title} roles`)
        .setDescription(`${category.description}\n\n` + description);

    // Send message
    let messageEmbed = await message.edit({embeds: [embed]});

    // Set embedId
    // NOTE: embed will not be posted twice when embedId is set
    category.embedId = messageEmbed.id;

    // Send reactions
    for (let i = 0; i < category.roles.length; i++) {
        const role = category.roles[i];
        await messageEmbed.react(role.emoji);
    }
}

module.exports = {
	name : 'reactionrole',
    description : 'Set up a reaction role message',
	async execute(message, args, client) {

        // get saved role data
        const savedData = getJsonData();

        // Check if channel already has role messages
        const channel = client.channels.cache.get(savedData.channel);
        const messageIds = [];
        const messageEmbeds = [];
        await channel.messages.fetch({ limit: 10 }).then(messages => {
            // console.log(`Received ${messages.size} messages`);
            // Iterate through the messages here with the variable "messages".
            messages.forEach(message => {
                messageIds.push(message.id);
                messageEmbeds.push(message);
            });
        });
        
        for (const category of savedData.categories) {
            // Check if message already posted
            if (messageIds.includes(category.embedId)) {
                await checkForCategoryUpdates(category, messageEmbeds);
                continue;
            }
            await sendCategoryEmbed(category, message);
        }

        client.on('messageReactionAdd', async (reaction, user) => {

            if (user.bot) return;
            if (!reaction.message.guild) return;
            if (reaction.message.channel.id == savedData.channel) {

                let role = undefined;
                // Find role given reaction emoji name
                for (let i = 0; i < savedData.categories.length; i++) {
                    const category = savedData.categories[i];
                    // Loop through category roles
                    for (let ii = 0; ii < category.roles.length; ii++) {
                        const r = category.roles[ii];
                        if (r.name == reaction.emoji.name || r.emoji == reaction.emoji.name) {
                            role = message.guild.roles.cache.find(role => role.name === r.name);
                            break;
                        }
                    }
                    if (role !== undefined) {
                        break;
                    }
                }

                if (role !== undefined) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role.id);
                }

            } else {
                return;
            }
        });

        client.on('messageReactionRemove', async (reaction, user) => {

            if (user.bot) return;
            if (!reaction.message.guild) return;
            if (reaction.message.channel.id == savedData.channel) {
                
                let role = undefined;
                // Find role given reaction emoji name
                for (let i = 0; i < savedData.categories.length; i++) {
                    const category = savedData.categories[i];
                    // Loop through category roles
                    for (let ii = 0; ii < category.roles.length; ii++) {
                        const r = category.roles[ii];
                        if (r.name == reaction.emoji.name || r.emoji == reaction.emoji.name) {
                            role = message.guild.roles.cache.find(role => role.name === r.name);
                            break;
                        }
                    }
                    if (role !== undefined) {
                        break;
                    }
                }

                if (role !== undefined) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role.id);
                }

            } else {
                return;
            }
        });

        saveJsonData(savedData);

	},
};