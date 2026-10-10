const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType, PermissionsBitField, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');

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

const commands = [
    new SlashCommandBuilder().setName('yardim').setDescription('Tüm bot komutlarını ve yardım menüsünü gösterir.'),
    new SlashCommandBuilder().setName('ping').setDescription('Botun gecikme sürelerini gösterir.'),
    new SlashCommandBuilder().setName('sunucu-bilgi').setDescription('Bulunduğunuz sunucu hakkında detaylı bilgi verir.'),
    new SlashCommandBuilder().setName('kullanici-bilgi').setDescription('Kendi profiliniz veya etiketlenen kişi hakkında bilgi verir.').addUserOption(o => o.setName('kullanici').setDescription('Bilgisi bakılacak kişi').setRequired(false)),
    new SlashCommandBuilder().setName('avatar').setDescription('Profil veya etiketlenen kişinin avatarını gösterir.').addUserOption(o => o.setName('kullanici').setDescription('Avatarı alınacak kişi').setRequired(false)),
    new SlashCommandBuilder().setName('istatistik').setDescription('Botun genel istatistiklerini ve sistem durumunu gösterir.'),
    new SlashCommandBuilder().setName('ayar').setDescription('Sunucu yönetim panelini açar (Yönetici).'),
    new SlashCommandBuilder().setName('ban').setDescription('Belirtilen kullanıcıyı sunucudan yasaklar.').addUserOption(o => o.setName('kullanici').setDescription('Yasaklanacak kişi').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Yasaklama sebebi').setRequired(false)),
    new SlashCommandBuilder().setName('kick').setDescription('Belirtilen kullanıcıyı sunucudan atar.').addUserOption(o => o.setName('kullanici').setDescription('Atılacak kişi').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Atılma sebebi').setRequired(false)),
    new SlashCommandBuilder().setName('timeout').setDescription('Kullanıcıya zaman aşımı (mute) uygular.').addUserOption(o => o.setName('kullanici').setDescription('Susturulacak kişi').setRequired(true)).addIntegerOption(o => o.setName('sure').setDescription('Dakika cinsinden süre').setRequired(true)),
    new SlashCommandBuilder().setName('temizle').setDescription('Belirtilen miktarda mesajı siler (1-100).').addIntegerOption(o => o.setName('sayi').setDescription('Silinecek mesaj sayısı').setRequired(true)),
    new SlashCommandBuilder().setName('duyuru').setDescription('Özel bir duyuru embedi hazırlar ve gönderir.').addStringOption(o => o.setName('mesaj').setDescription('Duyuru metni').setRequired(true)),
    new SlashCommandBuilder().setName('yavas-mod').setDescription('Kanalda yavaş mod (slowmode) süresini ayarlar.').addIntegerOption(o => o.setName('sure').setDescription('Saniye cinsinden süre (0 kapatır)').setRequired(true)),
    new SlashCommandBuilder().setName('kanal-kilitle').setDescription('Bulunduğunuz kanalı mesaj gönderimine kapatır.'),
    new SlashCommandBuilder().setName('kanal-ac').setDescription('Kilitli olan kanalı tekrar mesaj gönderimine açar.'),
    new SlashCommandBuilder().setName('rol-ver').setDescription('Bir kullanıcıya belirtilen rolü verir.').addUserOption(o => o.setName('kullanici').setDescription('Hedef kullanıcı').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Verilecek rol').setRequired(true)),
    new SlashCommandBuilder().setName('rol-al').setDescription('Bir kullanıcıdan belirtilen rolü alır.').addUserOption(o => o.setName('kullanici').setDescription('Hedef kullanıcı').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Alınacak rol').setRequired(true)),
    new SlashCommandBuilder().setName('ticket-kur').setDescription('Destek bilet panelini kanala gönderir.'),
    new SlashCommandBuilder().setName('çekiliş').setDescription('Hızlı bir çekiliş başlatır.').addStringOption(o => o.setName('odul').setDescription('Çekiliş ödülü').setRequired(true)),
    new SlashCommandBuilder().setName('zar-at').setDescription('1 ile 6 arasında rastgele bir zar atar.'),
    new SlashCommandBuilder().setName('yazi-tura').setDescription('Yazı mı tura mı atar.'),
    new SlashCommandBuilder().setName('espri').setDescription('Rastgele eğlenceli bir espri patlatır.'),
    new SlashCommandBuilder().setName('anket').setDescription('Sunucuda hızlı bir oylama anketi açar.').addStringOption(o => o.setName('soru').setDescription('Anket sorusu').setRequired(true)),
    new SlashCommandBuilder().setName('bot-bilgi').setDescription('Botun geliştiricisi ve altyapısı hakkında bilgi verir.'),
    new SlashCommandBuilder().setName('rol-bilgi').setDescription('Sunucudaki bir rol hakkında detaylı bilgi verir.').addRoleOption(o => o.setName('rol').setDescription('Bilgisi alınacak rol').setRequired(true)),
    new SlashCommandBuilder().setName('emoji-ekle').setDescription('Sunucuya bağlantıdan emoji ekler.').addStringOption(o => o.setName('link').setDescription('Emoji görsel bağlantısı').setRequired(true)).addStringOption(o => o.setName('isim').setDescription('Emoji adı').setRequired(true)),
    new SlashCommandBuilder().setName('afk').setDescription('AFK moduna geçmenizi sağlar.').addStringOption(o => o.setName('sebep').setDescription('AFK sebebi').setRequired(false)),
    new SlashCommandBuilder().setName('hatirlatici').setDescription('Belirli bir süre sonra size hatırlatma yapar.').addIntegerOption(o => o.setName('dakika').setDescription('Kaç dakika sonra').setRequired(true)).addStringOption(o => o.setName('mesaj').setDescription('Hatırlatma içeriği').setRequired(true)),
    new SlashCommandBuilder().setName('sunucu-ikon').setDescription('Sunucunun büyük ikon fotoğrafını gösterir.'),
    new SlashCommandBuilder().setName('istatistikler').setDescription('Detaylı bellek ve CPU kullanım durumunu gösterir.')
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`[+] ${client.user.tag} aktif ve kullanıma hazır!`);
    client.user.setPresence({ activities: [{ name: 's.ayar | /yardim' }], status: 'online' });

    if (process.env.TOKEN) {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        try {
            await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
            console.log('[+] Slash (/) komutları başarıyla yüklendi!');
        } catch (error) {
            console.error(error);
        }
    }
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
        const embed = new EmbedBuilder().setColor('#2b2d31').setTitle('⚙️ Yönetim Paneli').addFields({ name: '🎟️ Yetkili Rolleri', value: rolesText, inline: false });
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('settings_menu').setPlaceholder('İşlem seçin...').addOptions([
                { label: 'Log Kanalları Kur', value: 'kur_log', emoji: '🛡️' },
                { label: 'Bilet Rolleri Seç', value: 'sec_ticket_rol', emoji: '🎟️' },
                { label: 'Destek Paneli Gönder', value: 'kur_ticket', emoji: '📫' }
            ])
        );
        return message.reply({ embeds: [embed], components: [row] });
    }

    if (command === 'yardım') return message.reply("✨ `s.ayar` yazarak veya `/yardim` komutunu kullanarak tüm detaylı komutlara ulaşabilirsiniz.");
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
        const { commandName } = interaction;

        if (commandName === 'yardim') {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📜 Komut Listesi ve Yardım')
                .setDescription('Botumuzda bulunan tüm komutları hem `s.` önekiyle hem de `/` slash komutları olarak kullanabilirsiniz.')
                .addFields(
                    { name: '🛡️ Moderasyon', value: '`/ban`, `/kick`, `/timeout`, `/temizle`, `/yavas-mod`, `/kanal-kilitle`, `/kanal-ac`', inline: false },
                    { name: '⚙️ Yönetim & Sistem', value: '`/ayar`, `/ticket-kur`, `/duyuru`, `/rol-ver`, `/rol-al`, `/anket`', inline: false },
                    { name: '👤 Kullanıcı & Bilgi', value: '`/ping`, `/yardim`, `/sunucu-bilgi`, `/kullanici-bilgi`, `/avatar`, `/istatistik`', inline: false },
                    { name: '🎉 Eğlence & Mini', value: '`/zar-at`, `/yazi-tura`, `/espri`, `/hatirlatici`, `/afk`', inline: false }
                );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (commandName === 'ping') return interaction.reply({ content: `🏓 Gecikme süresi: **${client.ws.ping}ms**`, ephemeral: true });
        if (commandName === 'sunucu-bilgi') return interaction.reply({ content: `📊 Sunucu Adı: **${interaction.guild.name}**\n👥 Üye Sayısı: **${interaction.guild.memberCount}**`, ephemeral: true });
        if (commandName === 'espri') {
            const espriler = [
                "Geçen gün takaksiye bindim, taksi kısa mesafe dedi inecek var dedim.",
                "Denizde balıklar neden konuşamaz? Çünkü su kaçar.",
                "Adamın biri kafede yatmış, o da tatlı uyku olmuş."
            ];
            return interaction.reply({ content: espriler[Math.floor(Math.random() * espriler.length)], ephemeral: true });
        }
        if (commandName === 'ayar') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "Yetkiniz yok.", ephemeral: true });
            const guildId = interaction.guild.id;
            let settings = serverSettings.get(guildId) || { ticketRoles: [] };
            const rolesText = settings.ticketRoles.length > 0 ? settings.ticketRoles.map(id => `<@&${id}>`).join(', ') : '`Seçilmedi`';

            const embed = new EmbedBuilder().setColor('#2b2d31').setTitle('⚙️ Yönetim Paneli').addFields({ name: '🎟️ Yetkili Rolleri', value: rolesText, inline: false });
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('settings_menu').setPlaceholder('İşlem seçin...').addOptions([
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
                    overwrites.push({ id: roleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] });
                }
            }

            const channel = await interaction.guild.channels.create({ name: channelName, type: ChannelType.GuildType ? ChannelType.GuildText : 0, permissionOverwrites: overwrites });
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
                new RoleSelectMenuBuilder().setCustomId('role_select_ticket').setPlaceholder('Rolleri seçin...').setMinValues(1).setMaxValues(5)
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
