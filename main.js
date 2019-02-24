const Discord = require('discord.js');
const { config } = require('./config')
const client = new Discord.Client();

client.login(config.token);

// Initialize the invite cache
const invites = {};

// A pretty useful method to create a delay without blocking the whole script.
const wait = require('util').promisify(setTimeout);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // "ready" isn't really ready. We need to wait a spell.
  wait(1000);

  // Load all invites for all guilds and save them to the cache.
  client.guilds.forEach(g => {
    g.fetchInvites().then(guildInvites => {
      invites[g.id] = guildInvites;
    });
  });
});

client.on('guildMemberAdd', member => {

  // Loads the invites
  member.guild.fetchInvites().then(guildInvites => {

    // This is the *existing* invites for the guild.
    const ei = invites[member.guild.id];

    // Update the cached invites for the guild.
    invites[member.guild.id] = guildInvites;

    // Look through the invites, find the one for which the uses went up.
    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    const inviter = client.users.get(invite.inviter.id); // Retrieve the inviter

    client.guilds.forEach(g => {
      member.setNickname((g.members.get(inviter.id)).nickname.slice(0, 2) + " " + member.user.username); // Rename with inviter icon (first 2 chars)
      member.setRoles([g.roles.get('231136995357884416')]); // Add to Invités role
    })
  });
});