require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType, PermissionsBitField, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = "s.";
const serverSettings = new Map();

const badWords = [
    "amk", "aq", "orospu", "oç", "piç", "sik", "anan", "amcık", "yarrak", "göt", "taşak", "meme", 
    "kahpe", "pezevenk", "götveren", "ibne", "cani", "salak", "mal", "aptal", "gerizekalı", "orospucocugu",
    "sikik", "sikerim", "amina", "aminakoyim", "got", "yarak", "sikis", "sikiş", "orc", "sikeli", "ananı",
    "siktir", "haysiyetsiz", "şerefsiz", "namussuz", "pezo", "orosbu", "amq", "mq", "aqm", "aqo", "siktiğim",
    "siktiğimin", "o.ç.", "oc", "ocu", "sikiyim", "siktim", "sikti", "sikecem", "sikeceğim", "amın", " amina",
    "amina koyayim", "sikici", "amcik", "amciga", "amciktir", "siktirgit", "siktir lan", "ananin ami", "bacini",
    "avradini", "sülaleni", "orosbucocugu", "orospucocugu", "orospu cocugu", "orospu evladi", "orsbu", "orosbu cocugu",
    "sik kafalı", "orospu çocuğu", "amına koyim", "amk ya", "aq ya"
];

client.once('ready', () => {
    console.log(`[+] ${client.user.tag} aktif ve kullanıma hazır!`);
    client.user.setPresence({ activities: [{ name: 's.ayar | /ayar' }], status: 'online' });
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    let settings = serverSettings.get(guildId);
    if (!settings) {
        settings = { ticketRoles: [] };
        serverSettings.set(guildId, settings);
    }

    const content = message.content.toLowerCase();
    const isLink = content.includes('http://') || content.includes('https://') || content.includes('www.') || content.includes('discord.gg/') || content.includes('.com');
    
    if (isLink && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        try {
            await message.delete();
            message.channel.send(`⚠️ <@${message.author.id}>, bu sunucuda link paylaşmak yasaktır!`);
            return;
        } catch (err) {}
    }

    const hasBadWord = badWords.some(word => content.includes(word));
    if (hasBadWord) {
        try {
            await message.delete();
            message.channel.send(`⚠️ <@${message.author.id}>, küfür etmek yasaktır!`);
            return;
        } catch (err) {}
    }

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ayar' || command === 'ayarlar') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const rolesText = settings.ticketRoles.length > 0 ? settings.ticketRoles.map(id => `<@&${id}>`).join(', ') : '`Seçilmedi`';

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('⚙️ Yönetim Paneli')
            .addFields(
                { name: '🎟️ Yetkili Rolleri', value: rolesText, inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('settings_menu')
                .setPlaceholder('İşlem seçin...')
                .addOptions([
                    { label: 'Log Kanalları Kur', value: 'kur_log', emoji: '🛡️' },
                    { label: 'Bilet Rolleri Seç', value: 'sec_ticket_rol', emoji: '🎟️' },
                    { label: 'Destek Paneli Gönder', value: 'kur_ticket', emoji: '📫' }
                ])
        );

        return message.reply({ embeds: [embed], components: [row] });
    }

    if (command === 'yardım') return message.reply("✨ `s.ayar` yazarak yönetim paneline ulaşabilirsiniz.");
    if (command === 'ping') return message.reply(`🏓 ${client.ws.ping}ms`);
    
    if (command === 'temizle' || command === 'sil') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const count = parseInt(args[0]);
        if (!count) return;
        await message.channel.bulkDelete(count, true);
        return message.reply(`🧹 ${count} mesaj silindi.`).then(msg => setTimeout(() => msg.delete(), 3000));
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'yardim') return interaction.reply({ content: "✨ Komutlar aktif." });
        if (interaction.commandName === 'ping') return interaction.reply({ content: `🏓 ${client.ws.ping}ms` });
        if (interaction.commandName === 'sunucu-bilgi') return interaction.reply({ content: `📊 ${interaction.guild.name}` });
        if (interaction.commandName === 'ayar') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "Yetkiniz yok.", ephemeral: true });
            const guildId = interaction.guild.id;
            let settings = serverSettings.get(guildId) || { ticketRoles: [] };
            const rolesText = settings.ticketRoles.length > 0 ? settings.ticketRoles.map(id => `<@&${id}>`).join(', ') : '`Seçilmedi`';

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('⚙️ Yönetim Paneli')
                .addFields(
                    { name: '🎟️ Yetkili Rolleri', value: rolesText, inline: false }
                );

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('settings_menu')
                    .setPlaceholder('İşlem seçin...')
                    .addOptions([
                        { label: 'Log Kanalları Kur', value: 'kur_log', emoji: '🛡️' },
                        { label: 'Bilet Rolleri Seç', value: 'sec_ticket_rol', emoji: '🎟️' },
                        { label: 'Destek Paneli Gönder', value: 'kur_ticket', emoji: '📫' }
                    ])
            );
            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
    }

    if (interaction.isRoleSelectMenu() && interaction.customId === 'role_select_ticket') {
        const guildId = interaction.guild.id;
        let settings = serverSettings.get(guildId) || { ticketRoles: [] };
        settings.ticketRoles = interaction.values;
        serverSettings.set(guildId, settings);

        const rolesText = interaction.values.map(id => `<@&${id}>`).join(', ');
        return interaction.update({ content: `✅ Yetkili roller başarıyla güncellendi: ${rolesText}`, embeds: [], components: [] });
    }

    if (interaction.isButton()) {
        const guildId = interaction.guild.id;
        let settings = serverSettings.get(guildId) || { ticketRoles: [] };

        if (interaction.customId === 'create_ticket') {
            const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🎟️ Destek Talebi');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_genel').setLabel('Genel').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('ticket_sikayet').setLabel('Şikayet').setStyle(ButtonStyle.Danger)
            );
            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        if (interaction.customId.startsWith('ticket_')) {
            const channelName = `ticket-${interaction.user.username}`;
            if (interaction.guild.channels.cache.find(c => c.name === channelName)) return interaction.reply({ content: "Zaten açık biletiniz var.", ephemeral: true });

            let overwrites = [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ];

            if (settings.ticketRoles && settings.ticketRoles.length > 0) {
                for (const roleId of settings.ticketRoles) {
                    overwrites.push({
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    });
                }
            }

            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: overwrites
            });

            const rolesMention = settings.ticketRoles.length > 0 ? settings.ticketRoles.map(id => `<@&${id}>`).join(' ') : '';
            const embed = new EmbedBuilder().setColor('Green').setTitle('Destek Kanalı');
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Kapat').setStyle(ButtonStyle.Danger));
            
            await channel.send({ content: `${interaction.user} ${rolesMention}`, embeds: [embed], components: [row] });
            return interaction.reply({ content: `✅ Kanal açıldı: ${channel}`, ephemeral: true });
        }

        if (interaction.customId === 'close_ticket') {
            await interaction.reply({ content: "Kapatılıyor..." });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    }

    if (!interaction.isStringSelectMenu()) return;
    const guildId = interaction.guild.id;
    let settings = serverSettings.get(guildId) || { ticketRoles: [] };

    if (interaction.customId === 'settings_menu') {
        const val = interaction.values[0];

        if (val === 'kur_log') {
            await interaction.deferReply({ ephemeral: true });
            const cat = await interaction.guild.channels.create({ name: 'LOGLAR', type: ChannelType.GuildCategory });
            for (const name of ['ban-log', 'kick-log', 'mesaj-log', 'koruma-log']) {
                const ch = await interaction.guild.channels.create({ name, type: ChannelType.GuildText, parent: cat.id });
                await ch.createWebhook({ name: `Log - ${name}`, avatar: client.user.displayAvatarURL() });
            }
            return interaction.editReply("✅ Log kanalları kuruldu!");
        }

        if (val === 'sec_ticket_rol') {
            const row = new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId('role_select_ticket')
                    .setPlaceholder('Rolleri seçin...')
                    .setMinValues(1)
                    .setMaxValues(5)
            );
            return interaction.reply({ content: "👇 İstediğiniz kadar bilet rolü seçebilirsiniz:", components: [row], ephemeral: true });
        }

        if (val === 'kur_ticket') {
            const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🎟️ Destek').setDescription('Destek açmak için tıklayın.');
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_ticket').setLabel('Destek Aç').setStyle(ButtonStyle.Primary));
            await interaction.channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: "✅ Panel kuruldu!", ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);