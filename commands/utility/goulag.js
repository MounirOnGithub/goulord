const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config()

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

        try {
            const originalRoles = member.roles.cache.map(role => role.id);
            const originalChannelId = member.voice.channelId;

            await member.roles.set([]);
            await member.voice.setChannel(goulagChannelId)
            await interaction.reply(`${user.username} a été envoyé au Goulag !`)

            // Attendre 3 minutes
            setTimeout(async () => {
                // Revenir à son canal d'origine ou à un autre traitement
                await member.roles.set(originalRoles);
                await member.voice.setChannel(originalChannelId ? originalChannelId : null);
                await interaction.followUp(`${user.username} est sorti du goulag.`);
            }, 3 * 60 * 1000); // 3 minutes en millisecondes
        } catch (error) {
            console.error('Erreur lors du déplacement du membre:', error);
            await interaction.reply('Une erreur est survenue lors du déplacement du membre.');
        }
	},
};
