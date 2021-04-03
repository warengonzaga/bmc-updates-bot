const Discord = require('discord.js')
const config = require('./config.json')
const Turndown = require('turndown')

const truncate = function (str, length, ending) {
    if (length == null) {length = 2000} /* The limit of description characters is 2048. https://discord.com/developers/docs/resources/channel#embed-limits-limits */
    /*
    Two way for the RSS feed of BMC
    https://www.buymeacoffee.com/library/rss
    https://blog.buymeacoffee.com/feed
     */
    if (ending == null) {ending = '...'}
    if (str.length > length) {
        return str.substring(0, length - ending.length) + ending
    } else {
        return str
    }
}
const { prefix, WebhookRedditRSS } = config
const WebhookRedditRSSc = new Discord.WebhookClient(WebhookRedditRSS.id, WebhookRedditRSS.token)

const Watcher  = require('feed-watcher'),
    feed = config.RSSFeedOfBlog,
    interval = 60

const watcher = new Watcher(feed, interval)

const client = new Discord.Client({
    fetchAllMembers: true
})

// ---------------------- Ready ----------------------
client.on('ready', async ()  =>  {    
    watcher.start()
        .then(function(entries) {})
        .catch(function(error) { console.log(error)})
    watcher.on('new entries', function(entries) {
        entries.forEach(function(entry) {
            let htmltomd = new Turndown()
            let markdown = htmltomd.turndown(entry.description)
            console.log(markdown)
            WebhookRedditRSSc.send(new Discord.MessageEmbed()
                .setColor(config.colors.Secondary)
                .setAuthor(`${entry.title}`, client.user.displayAvatarURL(),entry.link)
                .setDescription(truncate(markdown))
                .setThumbnail(entry.media || client.user.displayAvatarURL() || null)
                .setTimestamp(entry.timestamp || entry.pubDate)
                .setFooter('New post on BMC Blog')
            ).catch(e => console.error(e))
            console.log('New entry \nTitle : ' + entry.title +
            "\nURL : " + (entry.url || entry.link) + "\n\n")
        })
    })

    console.log(`Connected to ${client.user.username} (ID : ${client.user.id})\n`)
    client.user.setActivity('members', { type: 'WATCHING' }).catch(console.error)

})

// ---------------------- Messages ----------------------
client.on('message', (msg) => { 

    if (msg.author.client) return
    if (msg.channel.type.dm) return

})

client.login(config.token)
    .catch(e => console.error(e.message))
