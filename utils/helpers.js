import fs from 'fs'

const getJsonData = (fileName) => {
    let rawdata = fs.readFileSync(fileName)
    const data = JSON.parse(rawdata)
    return data
}

const saveJsonData = async (data, fileName) => {
    const json = JSON.stringify(data, null, 4)
    fs.writeFile(fileName, json, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log(`${fileName} data saved successfully`)
        }
    })
}

const deleteCommands = async () => {
	console.log(client.application.commands.cache)
	client.application.commands.set([])
	let commands = await client.guilds.cache.get(process.env.GUILD_ID).commands.fetch()
	commands.forEach(command => {
		command.delete()
	})
}

const setPresence = async (client, name, type, status) => {
	client.user.setPresence({
        activities: [
			{
				name: name,
				type: type
			}
		],
		status: status
    })
}

export { getJsonData, saveJsonData, setPresence }