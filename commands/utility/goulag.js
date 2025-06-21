const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config()

const activeGoulagTimers = new Map()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('goulag')
		.setDescription('Dégage un mec chiant/désinvolte au goulag pendant 3 min!')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('Le mec chiant')
                .setRequired(true)
        ),
	async execute(interaction) {
		const user = interaction.options.getUser('user')
        const member = interaction.guild.members.cache.get(user.id)
        const goulagChannelId = process.env.GOULAG_CHANNEL_ID

        if (activeGoulagTimers.has(user.id)) {
            return interaction.reply({ content: 'Il est déjà au goulag tqt', ephemeral: true })
        }

        if (!member.voice.channel) {
            return interaction.reply({ content: 'Il est pas connecté ce fou, donc ça marchera pas', ephemeral: true })
        }

        try {
            const originalRoles = member.roles.cache.map(role => role.id);
            const originalChannelId = member.voice.channelId;

            await member.roles.set([]);
            await member.voice.setChannel(goulagChannelId)
            await interaction.reply(`${user.username} a été envoyé au Goulag !`)

            // Attendre 3 minutes
            const timeout = setTimeout(async () => {
                try {
                    // Revenir à son canal d'origine ou à un autre traitement
                    await member.roles.set(originalRoles);
                    await member.voice.setChannel(originalChannelId && member.voice.channel ? originalChannelId : null);
                    await interaction.followUp(`${user.username} est sorti du goulag.`);
                } catch (error) {
                    interaction.reply(`Un problème est survenu pour faire revenir ${user.username}`)
                    console.error(error)
                }
            }, 3 * 60 * 1000); // 3 minutes en millisecondes

            activeGoulagTimers.set(user.id, timeout)
        } catch (error) {
            console.error('Erreur lors du déplacement du membre:', error);
            await interaction.reply('Une erreur est survenue lors du déplacement du membre.');
        }
	},
};
