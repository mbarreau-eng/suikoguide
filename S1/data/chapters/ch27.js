guideData.chapters.push({
  id: 27,
  title: "Dragon's Den, allies of the skies",
  equipment: ["Goldlet", "Power Gloves"],
  collectibles: ["Old Book Vol. 5","Window Set 2","Old Book Vol. 4"],
  enemies: [
    "Black Elemental (PS1) / Ephemero (Remaster)",
    "Magic Shield",
    "Sunshine King (PS1) / Sun King (Remaster)",
  ],
  party: [
    { name: "Flik", level: "49" },
    { name: "Pesmerga", level: "48" },
    { name: "Humphrey", level: "46" },
    { name: "Hero", level: "49" },
    { name: "Clive", level: "47" },
    { name: "Liukan", level: "19" },
  ],
  recruits: [{ id: 95 }, { id: 96 }, { id: 97 }],
  paragraphs: [
    {
      type: "plain",
      picture: "27/27-1.png",
      text: "When you get to the Dragon's Den, talk to the knight here to be told that no one is permitted to enter, not even the Emperor himself. Flik suggests heading over to Antei so we can gather some information, so do so. Once you're there, talk to the man named Vincent as soon as you enter; it turns out that he tried to eat and run, and he got caught. You'll then be introduced to him.",
    },
    {
      type: "choices",
      items: ["Greetings, sir.", "Sure, I'll bet."],
    },
    {
      type: "plain",
      picture: "27/27-2.png",
      text: "Choose either option, then he'll leave to go talk to Joshua of the Dragon's Den, leaving you with the bill of a measly 200 Bits. Leave Antei and head back to the Dragon's Den. When you get there, talk to Vincent to hear him trying to lie his way in. After you talk to him, he will recognize Humphrey, then decide that he's going to help you out. He will tell you that you can get into the Dragon Knights' Domain by going through this hidden path behind the rock. This is our only choice, so go up to the rock and enter the cave.",
    },
    {
      type: "note",
      text: "Fight the Sunshine Kings in here until you get Window Setting 3. The Sunshine Kings can also drop Cyclone Crystals, and the Magic Shields can drop Earth Shields. Earth Shields can also be purchased later on.",
    },
    {
      type: "plain",
      picture: "27/27-3.png",
      text: "Head north to the next screen, then grab the [_GOLDLET_] to your right. Continue following the path, grabbing the [_OLD BOOK VOL. 5_] along the way. Head up to the next screen and go up the stairs here, then go north to the next screen to a fork; grab the [_POWER GLOVES_] to the east, then head west and down to fall into a room full of dragons!",
    },
    {
      type: "plain",
      picture: "27/27-4.png",
      text: "A woman named Milia will demand to know what you're doing here, then Futch will recognize you! Milia will also recognize you as the leader of the Liberation Army when Futch mentions your name, but when Flik asks why the dragons are sleeping, she gets all defensive again. She decides that you have to meet Joshua just to report what they've seen, so leave this area to the west, then south to be at the World Map.",
    },
    {
      type: "place",
      text: "World Map",
      places: [" W. Dragon's Den", "Dragon Knights' Fortress Area"],
      enemies: ["Ivy (PS1) / Killer Ivy (Remaster)", "Mirage", "Shadow Man"],
    },
    {
      type: "note",
      text: "The Mirages here drop Speed Rings; if you like, try to get at least one, it'll help give Clive (as well as the rest of your party, if he has the Spark Rune equipped) a nice speed boost!",
    },
    {
      type: "plain",
      picture: "27/27-5.png",
      text: "Head west from the Dragon's Den to arrive at the Dragon Knights' Fortress.",
    },
    {
      type: "place",
      text: "Dragon Knights' Fortress",
      party: [
        { name: "Flik", level: "52" },
        { name: "Pesmerga", level: "51" },
        { name: "Humphrey", level: "51" },
        { name: "Hero", level: "52" },
        { name: "Clive", level: "51" },
        { name: "Liukan", level: "49" },
      ],
      savepoints:["Woman inside, upper right"]
    },
    {
      type:"plain",
      picture:"27/27-6.png",
      text:" First off, go to the top right of the screen  and you should see someone hiding; talk to  him to find out that he is a Ninja called  Fuma. Recruit him as well, then head inside the Fortress and talk to the guy on the upper left; he's Kreutz. He used to be a member the old Emperor's army, Emperor Geil, that fought against Barbarossa before he became Emperor, and Humphrey fought against Kreutz as part of Barbarossa's army. Humphrey will ask him to join him in the Liberation Army, and since it may mean a chance to kill the man who killed his master, Kreutz will be glad to join. Go to the second floor and enter the top room to meet with Joshua. He will want to ask you the purpose of your visit."
    },
    {
      type: "choices",
      items: ["We need your help.", "Please let me fly on a dragon."],
    },
    {
      type:"plain",
      picture:"27/27-7.png",
      text:"Haha, choose either option, and Joshua admits that he doesn't know what's wrong with the dragons; they fell asleep a few months ago and have not woken up since. They've brought in many doctors and none have been able to cure them. They went looking for Liukan once, but they couldn't find him. Liukan introduce himself to Joshua and he will ask him to look at the dragons. (If you didn't bring him with you, you need to go back to HQ and bring him back.)"
    },
    {
      type:"plain",
      picture:"27/27-8.png",
      text:"Back at the Dragon's Den, Liukan will look at them and tell Joshua that they've been poisoned; to cure it, we need Moonlight Weed, Black Dragon Orchid, and one other thing to be mentioned later. We must go to Seek Valley to get the Moonlight Weed. To get there, we'll have to fly, and the only two dragons awake are Black and Thrash, Milia's dragon, so Milia will join our party to take us there! Leave the Dragon's Den."
    },
    {
      type:"plain",
      text:"Head back to Headquarters first and put Kai in your party in place of Liukan because the enemies are tough at Seek Valley and they are much easier with him. Also, upgrade Milia's equipment before moving on. Head back to the Dragon Knights' Fortress."
    },
    {
      type:"plain",
      text:"Go back up to Joshua's room. Open the chest on the left for [_WINDOW SETTING 2_], then check the bookshelf on the right for [_OLD BOOK VOL. 4_]. Head back out to the front and go over to the big red dragon to your left; this is Milia's dragon, Thrash, and she'll fly you over to Seek Valley on it."
    }
  ],
});
