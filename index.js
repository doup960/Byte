if (command === 'role') {
    const roleId = args[0];
    if (!roleId) return message.reply('Please provide a role ID.');

    const member = message.member;
    const hasAdminRole = member.roles.cache.some(role => adminRoles.has(role.id));

    if (!hasAdminRole) {
        return message.reply('You do not have permission to use this command.');
    }

    const roleToGive = message.guild.roles.cache.get(roleId);
    if (!roleToGive) return message.reply('Role not found in this server.');

    if (member.roles.cache.has(roleId)) {
        return message.reply(`You already have the role **${roleToGive.name}**.`);
    }

    try {
        await member.roles.add(roleToGive);
        message.reply(`You have been given the **${roleToGive.name}** role.`);
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to assign the role.');
    }
}
