const guideData = {
  "recruits": [
    {
      "id": 1,
      "name": "Hero",
      "condition": "Joins automatically through the storyline. ",
      "range": "M"
    },
    {
      "id": 2,
      "name": "Gremio",
      "condition": "Joins automatically through the storyline. ",
      "range": "M"
    },
    {
      "id": 3,
      "name": "Cleo",
      "condition": "Joins automatically through the storyline. ",
      "range": "L"
    },
    {
      "id": 4,
      "name": "Viktor",
      "condition": "Joins automatically through the storyline.",
      "range": "S"
    },
    {
      "id": 5,
      "name": "Mathiu",
      "condition": "Joins automatically through the storyline.",
      "range": "NP"
    },
    {
      "id": 40,
      "name": "Fu Su Lu",
      "condition": "Pay 10,000 bits for his meal at the Inn of the Kobold Village area of the Great Forest to recruit.",
      "range": "S"
    }
  ],
  "enemies":[
    {
    "BonBon": 
      {
        "type": "normal",
        "picture": "bonbon.gif",
        "Level":5,
        "HP":18,
        "power":31,
        "skill":5,
        "defense":5,
        "speed":16,
        "magic":9,
        "luck":12,
        "bits":70,
        "weaknesses":  [
          {
          "water":"",
          "fire":"weak",
          "thunder":"",
          "earth":"",
          "wind":"",
          "holy":"",
          "death":""
          }
        ],
        "drop":[
          {
          "name":"Failure Urn",
          "Rarity":"0.78%"
          },
          {
            "name":"Octopus Urn",
            "Rarity":"0.78%"
          },
          {
            "name":"Celadon  Urn",
            "Rarity":"0.26%"
          }
        ]
      },
      "Golem": 
      {
        "type": "boss",
        "Level":12,
        "HP":30,
        "power":40,
        "skill":21,
        "defense":2,
        "speed":17,
        "magic":25,
        "luck":20,
        "bits":1500,
        "weaknesses":  [
          {
          "water":"",
          "fire":"strong",
          "thunder":"weak",
          "earth":"",
          "wind":"strong",
          "holy":"",
          "death":""
          }
        ],
        "drop":[
          {
          "name":"Medicine x 6",
          "Rarity":"1.96%%"
          }
        ]
      }
    }
  ],
  "chapters": [
    {
      "id": 1,
      "title": "Gregminster, the Golden Capital",
      "party": [
        {
          "level": "01",
          "name": "Hero"
        }
      ],
      "savePoints": [
        "Hero's Desk",
        "Inn"
      ],
      "bits": [
        "100"
      ],
      "recruits": [
        {
          "id": 1
        },
        {
          "id": null,
          "name": "Ted",
          "range": "M"
        }
      ],
      "items": [],
      "equipment": [],
      "runes": [],
      "enemies": [],
      "paragraphs": [
        {
          "type": "plain",
          "text": "You'll start off in the Emperor's Palace in Gregminster. Talk to your father, Teo, and you'll be taken to an audience with Emperor Barbarossa. After the chat between Teo, Barbarossa, and Windy, the Emperor will decide to send Teo to the northern border to protect it from the United City-States of Jowston. He'll give Teo his sword, Prakk, and then he'll ask you if you would like to help the Empire while Teo is away."
        },
        {
          "type": "choices",
          "items": [
            "Yes, Your Highness.",
            "I don't wanna."
          ]
        },
        {
          "type": "plain",
          "text": "Choose either one, and he'll be happy to hear what you have to say. Commander Kraze will be assigned to watch over you, then you'll be wished luck. You'll automatically head back a little ways before you gain control. Head right, all the way up, then right and down the stairs. Go right and down some more to have Teo tell you to introduce yourself to Kraze. Before you do that, move right into this room and check the statue in the right corner; you'll find [_100 BITS_] here. After you've grabbed that, head left and talk to Kraze, then go back and talk to Teo to head back home."
        },
        {
          "type": "plain",
          "text": "Back at home, Gremio will rush over to you and welcome you back. After a little more discussion with him, he'll tell you that Ted is here to congratulate you, then he'll run back to check on his stew."
        },
        {
          "type": "note",
          "text": "Before doing ANYTHING, you have a couple of choices. You can obtain this rune will increase the amount of EXP you receive after battle. The second is the Prosperity Rune; this rune will increase the amount of Bits you receive after battle. If you don't want either of these items, just skip to the section \"Back to -Gregminster-\"."
        },
        {
          "type": "plain",
          "text": "To get the Fortune Rune, used for increasing EXP, DO NOT go up the stairs and talk to Ted, but leave the house right away. This rune also can be purchased later in the game at an Item Shop."
        },
        {
          "type": "plain",
          "text": "If you want the Prosperity Rune, used for increasing Bits, go upstairs and talk to Ted, then leave the house right away. This rune can also be acquired later in the game via an enemy drop, but it's more rare."
        },
        {
          "type": "plain",
          "text": "Again, this is completely optional and a little difficult. I went by myself first and gained some levels because you gain levels quicker when there are fewer people in your party, then I went and got Ted, because I prefer Bits over EXP, due to the fact that EXP is variable by level."
        },
        {
          "type": "plain",
          "text": "After you leave the house, go to the Inn and save your game, then leave Gregminster via the south gate out to the World Map."
        },
        {
          "type": "place",
          "text": "World Map",
          "places": [
            "Gregminster",
            "Lenankamp",
            "Mt. Tigerwolf",
            "Sarady",
            "Rockland",
            "Mt. Seifu",
            "N. Kwaba Area"
          ],
          "enemies": [
            "BonBon",
            "Crow",
            "Mosquito",
            "Red Soldier Ant",
            "Wild Boar"
          ]
        },
        {
          "type": "plain",
          "text": "Walk south to Lenankamp, but be careful; if  you run into enemies other than the BonBon or maybe a Crow or two, run away, as you'll probably be decimated. In Lenankamp, go up the eastern stairs and into the Armory. You can only afford one good item in here, so grab the Pointed Hat, then go to the western side of town and go into the Blacksmith's shop to the north and sharpen our weapon to level 2. Don't bother getting Ted armor or sharpening his weapon; he's not a permanent party member. Leave Lenankamp and start walking around and fighting some BonBons to level up and get more money. As you level up, go back and forth from fighting and sharpening your weapons or upgrading your equipment. I stopped with a level 5 Dragon Fang Staff, and Hero at level 12, along with some Brass Armor."
        },
        {
          "type": "note",
          "text": "If you want, head east of Gregminster to a town called Rockland. Go to the Inn and save, then talk to the person named Marco outside of the Inn. Place a 100 coin bet, then watch where the coin goes. Write down where it ends up, then repeat about 15 times, keeping track of where it lands. Quit and talk to Marco again; you have now written down the first 15 places that the coin ends up every time you restart the game. The trick is that the coin always follows the same pattern, no matter how much you bet,  but only while Marco is in Rockland. If, for example, the coin lands Right, Left, Right, Middle... When you bet 100 bits, you can now bet 10,000, and the coin will still land, Right, Left, Right, Middle. Just remember, the coin follows the same pattern, no matter how much you bet. This works wonders if you play it long enough to get your pattern going to where you'll start rolling! For these strategies, every game/disc has different patterns, so someone else's strategy won't always work. So instead of  following a pattern that someone else tells you, follow the previously mentioned method by writing down what your pattern is and using it from there."
        },
        {
          "type": "plain",
          "text": "After resting and preparing, head to the southwest of Gregminster / northwest of Lenankamp to a bridge. Cross it, then go northwest and up the mountain path to Mt. Tigerwolf."
        },
        {
          "type": "note",
          "text": "The Mosquitoes on the World Map have a chance of dropping a Holy Crystal, in case you wanted to acquire one early. They can be bought later."
        },
        {
          "type": "place",
          "text": "Mt. Tigerwolf",
          "places": [],
          "enemies": [
            "Giant Snail",
            "Killer Slime",
            "Slasher Rabbit"
          ],
          "party": [
            {
              "level": "12",
              "name": "Hero"
            },
            {
              "level": "05",
              "name": "Ted"
            }
          ],
          "bits": [
            "1000"
          ],
          "items": [
            "Medicine",
            "Wind Rune Piece",
            "Antique",
            "Medicine"
          ],
          "equipment": [
            "Circlet",
            "Gloves"
          ],
          "runes": [
            "Clone Crystal"
          ]
        },
        {
          "type": "plain",
          "text": "Follow the path, then grab the [_CIRCLET_] to your south. Go right to the next screen, follow the path as it goes up  stairs, then grab the [_MEDICINE_] before going up to the next area. Move left, down the stairs, then open the chest to the west to find some [_GLOVES_]. Go up the nearby stairs, then right across the bridge and up to the next area. Continue up some more to the next area. Head left to a fork; to the left is another chest with a [_WIND RUNE PIECE_], so get that, then go up under the bridge. If you're running out of space, either discard something or just wait until later to grab it, along with the rest of the items here. Follow the path as it goes left across the bridge, then up to the next area. Move right and up past the locked  building to the next area. Head up yet another screen, then move left, up, and right to grab the [_ANTIQUE_] before going up to the next screen. Go up a little, then open the chest to your left for another [_MEDICINE_]. Take the eastern path up and get the [_CLONE CRYSTAL_] out of the chest here, then head back and go up the western stairs. Continue up, but grab the [_1000 BITS_] to your right. Now head north back out to the World Map, then go north and enter Sarady."
        },
        {
          "type": "place",
          "text": "Sarady",
          "places": [],
          "enemies": [],
          "party": [
            {
              "level": "13",
              "name": "Hero"
            },
            {
              "level": "08",
              "name": "Ted"
            }
          ],
          "savepoints": [
            "Inn"
          ],
          "items": [],
          "equipment": [],
          "runes": [
            "Fortune Crystal *",
            "Prosperity Crystal *"
          ]
        },
        {
          "type": "plain",
          "text": "Go into the northeasternmost house and talk to the man in here. If you're alone, you'll receive the [_FORTUNE CRYSTAL_], but if Ted is with you, you'll receive the [_PROSPERITY CRYSTAL_]. I always drag Ted along and get the Prosperity Rune, because the EXP in this game is variable depending on levels. Also, DO NOT EQUIP EITHER ONE ON HERO! Wait until Gremio joins your party, then put it on him. Hero will automatically gain a rune of his own through the storyline, and if he has another one equipped at that point, he'll lose it for good! Buy some Medicine or rest at the Inn if you want, then make your way ALL THE WAY back to Gregminster to your house. Now, we continue the story."
        },
        {
          "type": "note",
          "text": "When fighting the Killer Slimes, you may have gotten some Water Rune Pieces. If so, you should stop at the Blacksmith in Lenankamp and equip them onto the Hero, as they help recover HP each turn; the more you put on, the more he'll recover."
        },
        {
          "type":"place",
          "text":"Back to Gregminster",
          "savepoints": [
            "Hero's Desk",
            "Inn"
          ],
          recruits: [
            {
              "id": 2
            },
            {
              "id": null,
              "name": "Pahn",
              "range": "S"
            },
            {
              "id":3
            },
            {
              "id": null,
              "name": "Ted",
              "range": "M"
            },
          ],
          "party":[ 
            {
              "level": "13",
              "name": "Hero"
            },
            {
              "level": "08",
              "name": "Ted"
            }
          ]
        },
        {
          "type": "plain",
          "text":"Head back to the McDohl residence and go to the second floor, then to Hero's room on the left with Ted. Ted will ask to join your party to pay back the McDohl family for adopting him when he was an orphan."
        },
        {
          "type":"choices",
          "items":[
            "Of course.",
            "Gee, I dunno."
          ]
        },
        {
          "type":"plain",
          "text":"Choose 1, then listen to him asking you questions about your meeting with the Emperor. After that, Ted will start to tell you something, only to be interrupted by Gremio telling you that it's time to eat. Go sit in the chair beside your father, Teo. He tells  everyone that he's heading north tomorrow, so he'll leave everything to you. It's up to Gremio and two of Teo's other servants, Cleo and Pahn, to take care of him."
        },
        {
          "type":"plain",
          "text":"During the early morning, Teo visits you to say goodbye, and a while after he leaves, Gremio wakes you up, telling you that today you'll be a working member of the Imperial forces. Gremio will then join your party! If you want, you can examine the desk in your room to find Hero's Diary, where you can save your game. Go back downstairs to have Pahn and Cleo also join your party! Start to leave your house to have Ted rejoin, then leave."
        },
        {
          "type":"plain",
          "text": "Before going to the Imperial Palace, and if you have the money, head to the Armory to the lower right of Gregminster and update Gremio and Cleo's equipment (don't worry about Pahn for now; he's a temporary member at this moment, like Ted). Also, put either the Fortune or Prosperity Rune on Gremio if you have the money. Make SURE that you actually LOOK at the armor here; notice that they have Wing Boots for 10,200 Bits; these are the only place in the game that you can buy them, so just look at them so you'll be able to buy them later in the game. After that, head north and into the Imperial Palace."
        },
        {
          "type":"plain",
          "text":"Once inside, go up a little bit, then left into Kraze's room. He'll scold you for being late, then he'll give you your first assignment; you have to go northeast of Gregminster to a place called Magician's Island to see a woman known as Leknaat the Seer, to retrieve the astrological results. He'll then ask if you were listening, and where to go."
        },
        {
          "type":"choices",
          "items":[
            "Northeast of Gregminster.",
            "Northwest of Gregminster.",
            "Somewhere on this earth."
          ]
        },
        {
          "type":"plain",
          "text":"Option 1 is the correct answer, but choose however you like. He'll tell you that a Dragon Knight from the Dragon's Den will take you there, so head back outside of the palace. After listening to the party's  opinions on the errand, talk to the Dragon Knight to your far right where the stables are. This kid is Futch, with his Dragon, Black. (This is probably redundant, and a well known fact, but why do the dragons in this game sound like elephants? *sigh*) Futch has a bit of a temper, as does Ted, and the sparks will fly between the two of them every time they talk to each other. Notice that Ted mentions that he happens to be 300-years... After climbing on Black's back, you'll fly off to Magician's Island."
        },
      ]
    },
    {
      "id": 2,
      "title": "Magician's Island, the future in the stars",
      "party": [
        {
          "level": "13",
          "name": "Hero"
        },
        {
          "level": "01",
          "name": "Gremio"
        },
        {
          "level": "01",
          "name": "Pahn"
        },
        {
          "level": "01",
          "name": "Cleo"
        },
        {
          "level": "08",
          "name": "Ted"
        }
      ],
      "items": [
          "Medicine",
          "Astral Conclusions"
      ],
      "equipment": [
        "Leather Coat"
      ],
      "runes": [
        "Fire Crystal"
      ],
      "enemies": [
        "Furfur",
        "Holly Boy",
        {
          "type": "Boss",
          "name": "Golem"
        }
      ],
      "paragraphs": [
        {
          "type": "plain",
          "text":"Move north to go into the forest, then follow the straightforward path to the next area. Once there, head northwest and grab the [_MEDICINE_] out of the chest. Make your way northeast and follow the path to the next area. Keep following the path until you reach a fork; take the eastern path north to find a chest containing a [_LEATHER COAT_]. Go back and take the western path north, following it some more to run into a kid named Luc. He'll summon a Golem to battle you."
        },
        {
          "type":"boss",
          "name":"Golem",
          "reward": "1500 Bits",
          "picture": "golem.gif",
          "text":"Have Gremio and Pahn use the Unite command to perform their Talisman Attack, and have Hero, Cleo, and Ted attack. This battle should be really easy if you took  the time to travel to Sarady to get one of those runes. Even if you didn't, it isn't too terribly hard. "
        }
      ]
    },
    {
      "id": 3,
      "title": "Rockland, capturing tax thieves"
    },
    {
      "id": 4,
      "title": "Gregminster, the rain's dark omen"
    },
    {
      "id": 5,
      "title": "Lenankamp, meeting a new ally"
    },
    {
      "id": 6,
      "title": "Rockland, bandits in need"
    },
    {
      "id": 7,
      "title": "Lenankamp, plans for a flaming spear"
    },
    {
      "id": 8,
      "title": "Lenankamp, the end of one era; the beginning of another"
    },
    {
      "id": 9,
      "title": "Kwaba, the Fortress of Lord Ain Gide"
    },
    {
      "id": 10,
      "title": "Seika, a new leader is born"
    },
    {
      "id": 11,
      "title": "Kaku, off to the Lake Toran Castle"
    },
    {
      "id": 12,
      "title": "Headquarters, building a new army"
    },
    {
      "id": 13,
      "title": "Kouan, the theft of the great Kirinji"
    },
    {
      "id": 14,
      "title": "Great Forest, the path to different cultures"
    },
    {
      "id": 15,
      "title": "Village of the Elves, will everything turn to ashes?"
    },
    {
      "id": 16,
      "title": "Village of the Dwarves, proving our story"
    },
    {
      "id": 17,
      "title": "Pannu Yakuta, the rising of the Liberation Army"
    },
    {
      "id": 18,
      "title": "Headquarters, three months later"
    },
    {
      "id": 19,
      "title": "Teien, looking for an antidote"
    },
    {
      "id": 20,
      "title": "Soniere, the sacrifice"
    },
    {
      "id": 21,
      "title": "Scarleticia, avenging an ally"
    },
    {
      "id": 22,
      "title": "Kirov, retrieving our final gift"
    },
    {
      "id": 23,
      "title": "Headquarters, a son surpasses his father"
    },
    {
      "id": 24,
      "title": "Lorimar, a resurgence of Viktor's past"
    },
    {
      "id": 25,
      "title": "Qlon, where the Star Dragon Sword sleeps"
    },
    {
      "id": 26,
      "title": "Neclord's Castle, the symphony ends here"
    },
    {
      "id": 27,
      "title": "Dragon's Den, allies of the skies"
    },
    {
      "id": 28,
      "title": "Seek Valley, the fallen dragon"
    },
    {
      "id": 29,
      "title": "Headquarters, filtering out a spy"
    },
    {
      "id": 30,
      "title": "Moravia, rescuing a noble and a bear"
    },
    {
      "id": 31,
      "title": "Shasarazade, the war is near its end"
    },
    {
      "id": 32,
      "title": "Gregminster, the end of the Scarlet Moon Empire"
    }
  ]
};