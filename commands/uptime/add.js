const UrlsConfig = require("./../../database/models/UrlsConfig");
const discord = require("discord.js");
const fetch = require("node-fetch");
const validUrl = require("valid-url");

module.exports = {
  name: "add",
  description: "Adds monitor to your project.",
  aliases: ["host"],
  category: "uptime",
  botPermission: [],
  authorPermission: [],
  ownerOnly: false,
  run: async (client, message, args) => {
    var url = args[0];

    // CHECKS THE URL IF PROVIDED OR WRONG
    if (!url) return message.reply("Please give a project url!");
    if (!validUrl.isUri(url)) {
      return message.channel.send("Please provide a vaild url!");
    }

    // LOADING
    let waitEmbed = new discord.MessageEmbed().setDescription(
      "<a:tick:845714523818426388> Please wait..."
    );
    var messageAlert = await message.reply(waitEmbed);

    // CHECKS IF THE PROJECT IS ALREADY REGISTERED
    var checkIfExsists = await UrlsConfig.findOne({
      projectURL: url,
    });

    if (checkIfExsists === null) {
      // RUNS WHEN PROJECT IS NOT REGISTERED
      await UrlsConfig.create({
        authorID: message.author.id,
        projectURL: url,
        pinged: 0,
      }).then(async () => {
        // RUNS AFTER THE PROJECT STORES THE DATA IN DATABASE
        try {
          // TRIES TO PING PROJECT
          await fetch(url);
        } catch (e) {
          // ERRORS HANDLING
          await UrlsConfig.findOneAndUpdate(
            { projectURL: url },
            { error: true, errorText: e.message },
            { new: true }
          );
          message.reply("Fetching Error");
        }

        client.projects.push(url);

        // NOTIFIES WITH AN EMBED THAT PROJECT IS SUCCESSFULLY REGISTERED
        let embed = new discord.MessageEmbed()
          .setTitle("✅ Added Succesfully!")
          .setDescription("Thanks for using me")
          .setColor("RANDOM")
          .setTimestamp();
        await messageAlert.edit(embed);
        return message.delete();
      });
    } else {
      // RUNS WHEN THE PROJECT IS ALREADY IN DATABASE
      let embed = new discord.MessageEmbed()
        .setTitle(
          "<a:tick:845714523818426388> Project is already Registered!"
        )
        .setDescription(
          "The project you're trying to register is already in the Database"
        )
        .setColor("#FF0000")
        .setTimestamp();

      await messageAlert.edit(embed);
      return message.delete();
    }
  },
};
