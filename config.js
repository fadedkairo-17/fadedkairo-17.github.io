/*
  Everything you are likely to change lives in this file.
  Leave a link as "" and its button or row disappears from the page.
*/
window.SITE = {
  name: "fadedkairo", // shown in "I'm ..." and the footer; swap for your real name if you want
  handle: "fadedkairo",

  // Contact
  github: "fadedkairo-17",              // just the username, not the full URL
  contact: "https://noiz.bio/Iarping",  // where the Contact row sends people

  untitled: {
    videoId: "V5RtXuj6d9k", // the part after watch?v= in the YouTube link
    site: ""                // public URL of the Untitled site
  },

  combo: {
    download: "", // where people get Combo Client
    discord: "",  // Combo Client's Discord invite

    // The big image at the top of the Combo Client section.
    // A .gif works here too: drop it in assets/combo/ and point src at it.
    lead: {
      src: "assets/combo/keystrokes.webp",
      alt: "Combo Client in a Minecraft lobby at night, with the keystrokes overlay showing W, A, S, D and both mouse buttons.",
      caption: "Keystrokes overlay, in game"
    },

    // To add a screenshot: put the file in assets/combo/ and add a line here.
    gallery: [
      {
        src: "assets/combo/night-sky.webp",
        alt: "Minecraft night sky with an aurora. Combo Client readouts for combo, ping, speed and memory run down the left edge.",
        caption: "HUD readouts: combo, ping, speed, memory"
      },
      {
        src: "assets/combo/modules.png",
        alt: "Combo Client modules panel listing 47 modules with HUD, PvP, Visual and Utility filters and a toggle on each row.",
        caption: "Modules panel",
        focus: "left bottom"
      },
      {
        src: "assets/combo/demo.webp",
        alt: "Combo Client running in a Minecraft lobby at sunset.",
        caption: "In the lobby"
      }
    ]
  }
};
