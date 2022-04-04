const { MessageEmbed } = require('discord.js');
const fs = require('fs');

const getJsonData = () => {
    let rawdata = fs.readFileSync('./roles.json');
    return JSON.parse(rawdata);
}

module.exports = {
	name : 'reactionrole',
    description : 'Set up a reaction role message',
	async execute(message, args, client) {

        // get saved role data
        const savedData = getJsonData();

        // Create message description that includes emojis with role
        let description = "";
        for (let i = 0; i < savedData.roles.length; i++) {
            const savedRole = savedData.roles[i];
            // console.log(role);
            if (savedRole.custom_emoji) {
                const emoji = message.guild.emojis.cache.find(emoji => emoji.name === savedRole.name);
                savedRole.emoji = emoji;
            } else {
                savedRole.emoji = savedRole.image;
                
            }
            const r = message.guild.roles.cache.find(role => role.name === savedRole.name);
            savedRole.role = r;
            client.roles.set(savedRole.name, savedRole);
            description += `${savedRole.emoji} for ${savedRole.description}\n`;
            
        }

        const embed = new MessageEmbed()
            .setTitle(`${savedData.title} roles`)
            .setDescription(`${savedData.description}\n\n` + description);
       
        // Send message
        let messageEmbed = await message.channel.send({embeds: [embed]});

        // Send reactions
        for (let i = 0; i < savedData.roles.length; i++) {
            const role = savedData.roles[i];
            await messageEmbed.react(role.emoji);
        }

        client.on('messageReactionAdd', async (reaction, user) => {

            if (user.bot) return;
            if (!reaction.message.guild) return;
            if (reaction.message.channel.id == savedData.channel) {

                let role = client.roles.get(reaction.emoji.name);

                if (role === undefined) {
                    for (const [name,r] of client.roles) {
                        if (r.custom_emoji) {
                            continue;
                        }
                        if (reaction.emoji.name == r.image) {
                            role = r;
                            break;
                        }
                    }
                }

                if (reaction.emoji.name === role.name || reaction.emoji.name === role.emoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role.role.id);
                }

            } else {
                return;
            }
        });

        client.on('messageReactionRemove', async (reaction, user) => {
            if (user.bot) return;
            if (!reaction.message.guild) return;
            if (reaction.message.channel.id == savedData.channel) {
                
                let role = client.roles.get(reaction.emoji.name);

                if (role === undefined) {
                    for (const [name,r] of client.roles) {
                        if (r.custom_emoji) {
                            continue;
                        }
                        if (reaction.emoji.name == r.image) {
                            role = r;
                            break;
                        }
                    }
                }

                if (reaction.emoji.name === role.name || reaction.emoji.name === role.emoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role.role.id);
                }

            } else {
                return;
            }
        });

	},
};