// Written by the story editor (npm start, then /kit/editor/). Edit it there.
export default {
  "game": {
    "title": "Low Water at Saltmarrow",
    "intro": "Saltmarrow Light has been dark for two nights.\n\nThe Harbour Board has sent its most junior surveyor (you) out across the causeway on the afternoon low water, to find out why, and to find the keeper, Imre Vass, who has not answered a signal since Thursday.\n\nThe tide has already turned behind you. Whatever you find, you will be finding it on the island until morning.\n\n(Type HELP for how to play, or HINT if you are stuck.)",
    "questions": [
      {
        "var": "name",
        "label": "Your name"
      }
    ],
    "start": {
      "room": "causeway",
      "near": "tidePost"
    },
    "player": {
      "description": "{name}, junior surveyor to the Harbour Board: an oilskin coat a size too big, a satchel of instruments you have never yet needed, and boots that have already found every puddle on the causeway.",
      "nouns": [
        "me",
        "myself",
        "self",
        "yourself"
      ]
    },
    "messages": {
      "cantGo": "You can't go that way.",
      "wait": "{if dusk >= 2}{either Time passes. The night gets darker.|You wait. Somewhere out on the water, a bell buoy clanks.}{else}{either Time passes.|You wait. The sea goes on doing what it does.|Time passes, and the tide with it.}{/if}",
      "ownVerb": "That doesn't seem to do anything useful."
    }
  },
  "areas": {
    "island": {
      "name": "Saltmarrow",
      "parent": ""
    },
    "light": {
      "name": "The Light",
      "parent": "island"
    },
    "shore": {
      "name": "The Shore",
      "parent": "island"
    },
    "home": {
      "name": "The Cottage",
      "parent": "island"
    }
  },
  "areaOf": {
    "causeway": "island",
    "slope": "light",
    "yard": "light",
    "oilStore": "light",
    "towerBase": "light",
    "watchRoom": "light",
    "lampRoom": "light",
    "gallery": "light",
    "cottage": "home",
    "leanTo": "home",
    "strand": "shore",
    "teeth": "shore",
    "cave": "shore"
  },
  "layout": {
    "lampRoom": {
      "x": 440,
      "y": 20
    },
    "gallery": {
      "x": 680,
      "y": 20
    },
    "watchRoom": {
      "x": 440,
      "y": 140
    },
    "towerBase": {
      "x": 440,
      "y": 260
    },
    "yard": {
      "x": 440,
      "y": 380
    },
    "oilStore": {
      "x": 680,
      "y": 380
    },
    "slope": {
      "x": 440,
      "y": 500
    },
    "leanTo": {
      "x": 680,
      "y": 500
    },
    "causeway": {
      "x": 440,
      "y": 620
    },
    "cottage": {
      "x": 680,
      "y": 620
    },
    "strand": {
      "x": 200,
      "y": 620
    },
    "teeth": {
      "x": 200,
      "y": 740
    },
    "cave": {
      "x": -40,
      "y": 740
    }
  },
  "locations": {
    "causeway": {
      "title": "Causeway Head",
      "name": "causeway head",
      "nouns": [
        "causeway"
      ],
      "description": "The causeway ends here in a ramp of cobbles slick with green weed, and behind you {if dusk >= 2}the flats are gone under black, moving water{else}the mudflats are already shining with returning water{/if}. A path climbs north through the gorse towards the white tower of the light. A low stone cottage sits to the east, and westward a bank of shingle drops to the strand under the cliff.{if dusk >= 2} The tower stands black against the dusk, unlit.{/if}",
      "size": {
        "w": 60,
        "h": 40
      },
      "refuse": {
        "s": "The causeway is a ribbon of water already, and you were sent to find out what is wrong. There is no going back until the morning low tide."
      },
      "look": {
        "s": "The mainland is a grey line, with a few early lamps in the harbour windows. Somebody over there is watching this dark tower and wondering about it.",
        "n": "The lighthouse stands at the top of the island, white and blind. The gorse path climbs towards it."
      },
      "smell": "Mud, weed and cold salt: the whole sea floor laid out to dry.",
      "listen": "{if dusk >= 1}The tide talks to itself as it comes in over the flats.{else}Curlews, a long way off, and the creep and click of the tide coming in.{/if}",
      "ambient": {
        "chance": 25,
        "lines": [
          "A curlew calls somewhere out on the flats.",
          "Water slides in over the mud in a long thin sheet.",
          "{if dusk >= 1}A lamp is lit in a mainland window, then another.{else}A gull lands on the causeway ramp, looks at you, and leaves.{/if}"
        ]
      },
      "arriveNear": "tidePost",
      "details": [
        {
          "nouns": [
            "lighthouse",
            "tower",
            "light"
          ],
          "adjectives": [
            "white"
          ],
          "description": "{if lit}The light is burning, white and strong, and the beam goes round.{else}The tower of Saltmarrow Light, white and blind{if dusk >= 2}, black against the dark{/if}.{/if}"
        },
        {
          "nouns": [
            "mudflats",
            "flats",
            "mud",
            "beds"
          ],
          "adjectives": [
            "cockle"
          ],
          "description": "The flats shine like wet slate. The tide is coming in over them faster than you would think possible."
        },
        {
          "nouns": [
            "cobbles",
            "ramp"
          ],
          "adjectives": [],
          "description": "Old cobbles, green with weed and treacherous."
        },
        {
          "nouns": [
            "basket"
          ],
          "adjectives": [
            "cockle"
          ],
          "description": "Ottoline's cockle basket, half full and dripping."
        },
        {
          "nouns": [
            "mainland",
            "harbour",
            "lamps",
            "windows"
          ],
          "adjectives": [],
          "description": "A grey line of shore, and the harbour, where the first lamps are coming on."
        },
        {
          "nouns": [
            "gorse"
          ],
          "adjectives": [],
          "description": "Yellow gorse, all the way up the hill to the tower."
        },
        {
          "nouns": [
            "weed"
          ],
          "adjectives": [
            "green"
          ],
          "description": "Green weed on the cobbles, slick as soap."
        }
      ]
    },
    "slope": {
      "title": "Gorse Slope",
      "name": "gorse slope",
      "nouns": [
        "slope"
      ],
      "description": "The path switchbacks up through gorse so thick and yellow that it smells of coconut. Above, steps cut into the rock lead north to the lighthouse yard; below, the path runs down to the causeway.{if gloveTaken}{else} Something dark lies in the grass at the edge of the path.{/if}",
      "size": {
        "w": 40,
        "h": 50
      },
      "smell": "Warm gorse: coconut and honey, out of all reason, on a cold coast.",
      "listen": "Bees in the gorse, still working, and the sea underneath everything.",
      "look": {
        "w": "Over the gorse you can see down to the strand, and the black rocks at its far end that the chart calls the Teeth."
      },
      "details": [
        {
          "nouns": [
            "lighthouse",
            "tower",
            "light"
          ],
          "adjectives": [
            "white"
          ],
          "description": "{if lit}The light is burning, white and strong, and the beam goes round.{else}The tower of Saltmarrow Light, white and blind{if dusk >= 2}, black against the dark{/if}.{/if}"
        },
        {
          "nouns": [
            "teeth",
            "reef",
            "rocks"
          ],
          "adjectives": [
            "black"
          ],
          "description": "A reef of black rocks off the end of the strand, pooled and weedy at low water, with the cliff rising sheer behind them."
        },
        {
          "nouns": [
            "gorse",
            "bees"
          ],
          "adjectives": [
            "yellow"
          ],
          "description": "Thick yellow gorse, smelling of coconut, busy with late bees."
        },
        {
          "nouns": [
            "grass"
          ],
          "adjectives": [],
          "description": "Coarse grass at the edge of the path{if gloveTaken}.{else}, with something dark lying in it.{/if}"
        }
      ]
    },
    "yard": {
      "title": "Lighthouse Yard",
      "name": "the yard",
      "nouns": [
        "yard"
      ],
      "description": "A walled yard of beaten earth around the foot of the tower. The tower door is to the north, and a low stone store with a slate roof huddles against the east wall. To the west the yard ends at an iron railing and a long drop to the sea. A signal mast stands in the middle of it all{if dusk >= 2}, a thin black line against the stars{else}{if dusk >= 1}, a thin black line against the evening{/if}{/if}.",
      "size": {
        "w": 60,
        "h": 50
      },
      "refuse": {
        "w": "There is a railing, and then a great deal of air, and then the sea."
      },
      "look": {
        "w": "From the railing you can see right down onto the Teeth: a reef of black rocks off the end of the strand, pooled and weedy at low water, with the cliff rising sheer behind them.",
        "n": "The tower goes up and up, white paint flaking, to the glass lantern at the top. No light in it."
      },
      "listen": "The halyards of the mast tap and tap in the wind.",
      "ambient": {
        "chance": 20,
        "lines": [
          "A gust thrums in the railing.",
          "The loose halyards of the mast clack against the pole."
        ]
      },
      "details": [
        {
          "nouns": [
            "tower",
            "lighthouse",
            "light"
          ],
          "adjectives": [
            "white"
          ],
          "description": "{if lit}Blazing at the top, now.{else}The tower goes up and up, white paint flaking, to the glass lantern at the top. No light in it.{/if}"
        },
        {
          "nouns": [
            "teeth",
            "reef",
            "rocks"
          ],
          "adjectives": [
            "black"
          ],
          "description": "A reef of black rocks off the end of the strand, pooled and weedy at low water, with the cliff rising sheer behind them."
        },
        {
          "nouns": [
            "store",
            "roof",
            "slate"
          ],
          "adjectives": [
            "stone",
            "slate"
          ],
          "description": "A low stone store with a slate roof, against the east wall."
        },
        {
          "nouns": [
            "wall",
            "walls"
          ],
          "adjectives": [],
          "description": "A drystone wall, waist high, round the whole yard."
        }
      ]
    },
    "oilStore": {
      "title": "Oil Store",
      "name": "oil store",
      "nouns": [
        "store"
      ],
      "description": "Cool and dim, and smelling powerfully of paraffin. Six iron drums stand in a row along the back wall, and a shelf by the door holds the keeper's measures and cans. The door back out to the yard is to the west.",
      "size": {
        "w": 40,
        "h": 30
      },
      "smell": "Paraffin, so strong it makes your eyes water.",
      "details": [
        {
          "nouns": [
            "floor"
          ],
          "adjectives": [],
          "description": "Dry stone, and spotless. Not a drop has leaked."
        },
        {
          "nouns": [
            "funnels",
            "funnel"
          ],
          "adjectives": [],
          "description": "Funnels and brass measures, in their places. Imre is a tidy man."
        }
      ]
    },
    "towerBase": {
      "title": "Foot of the Tower",
      "name": "foot of the tower",
      "nouns": [
        "tower"
      ],
      "description": "The ground floor of the tower is mostly stair: an iron spiral winding up through the middle of the room and out of sight. Oilskins hang on pegs around the curved wall, and a bench under the window is cluttered with lamp chimneys and polishing things. The door out to the yard is to the south.",
      "size": {
        "w": 40,
        "h": 40
      },
      "smell": "Paraffin and wet wool.",
      "listen": "The tower creaks very slightly in the wind, like a ship.",
      "details": [
        {
          "nouns": [
            "window"
          ],
          "adjectives": [],
          "description": "A small deep window looking out over the yard."
        },
        {
          "nouns": [
            "polish",
            "tins",
            "trimmers"
          ],
          "adjectives": [
            "wick"
          ],
          "description": "Tins of brass polish and a pair of wick trimmers. Nothing you need: the wick in the great lamp is trimmed already."
        }
      ]
    },
    "watchRoom": {
      "title": "Watch Room",
      "name": "watch room",
      "nouns": [
        "room"
      ],
      "description": "A small round room halfway up the tower, with a window on every side and the keeper's desk under the seaward one. A barometer hangs by the stair. In the ceiling, a heavy hatch leads up to the lantern.",
      "size": {
        "w": 40,
        "h": 40
      },
      "look": {
        "w": "Through the seaward window: the Teeth, the strand, and nothing but grey sea out to the line of the sky."
      },
      "listen": "Wind fluting in the window frames.",
      "details": [
        {
          "nouns": [
            "window",
            "windows"
          ],
          "adjectives": [
            "seaward"
          ],
          "description": "Windows on every side. The seaward one looks over the Teeth and the strand."
        },
        {
          "nouns": [
            "inkwell",
            "ink"
          ],
          "adjectives": [],
          "description": "A brass inkwell screwed to the desk, nearly dry."
        },
        {
          "nouns": [
            "teeth",
            "reef",
            "rocks"
          ],
          "adjectives": [
            "black"
          ],
          "description": "A reef of black rocks off the end of the strand, pooled and weedy at low water, with the cliff rising sheer behind them."
        }
      ]
    },
    "lampRoom": {
      "title": "Lantern Room",
      "name": "lantern room",
      "nouns": [
        "lantern",
        "room"
      ],
      "description": "The lantern room is all glass and brass. The great lens rises in the middle {if lensClean}like a beehive made of ice{else}like a beehive, fogged grey with soot{/if}, with the lamp sitting {if lit}ablaze{else}cold{/if} inside it. A narrow door opens east onto the gallery, and the hatch leads back down.",
      "size": {
        "w": 40,
        "h": 40
      },
      "smell": "Hot brass would be the smell, if anything here were hot. Old soot, instead.",
      "details": [
        {
          "nouns": [
            "brass",
            "glass",
            "windows"
          ],
          "adjectives": [],
          "description": "The lantern's storm glass, all round, salted at the edges."
        }
      ]
    },
    "gallery": {
      "title": "The Gallery",
      "name": "the gallery",
      "nouns": [
        "gallery",
        "walkway"
      ],
      "description": "A narrow iron walkway rings the outside of the lantern, with a rail at waist height and the whole sea spread out below. The wind up here is constant and personal. The door back into the lantern room is to the west.",
      "size": {
        "w": 50,
        "h": 30
      },
      "style": "balcony",
      "wallSide": "w",
      "refuse": {
        "e": "Not without wings.",
        "n": "The walkway goes round, but there is nothing on the far side that you can't see from here.",
        "s": "The walkway goes round, but there is nothing on the far side that you can't see from here."
      },
      "look": {
        "w": "{if dusk >= 2}Out past the Teeth, a dark sail is standing in towards the reef, showing no lights at all.{else}Far below, the Teeth, and the strand, and the dinghy on it like a dropped glove.{/if}",
        "s": "The causeway is gone under the sea. The mainland harbour is a scatter of yellow lights.",
        "e": "{if dusk >= 1}Round the point, very small, the sails of a ship coming in for the harbour: the Larkspur, from Amble, if Imre is right.{else}Open sea, all the way to the edge.{/if}"
      },
      "ambient": {
        "chance": 30,
        "lines": [
          "The wind tries to take your coat off your back.",
          "Far below, a wave breaks white across the Teeth."
        ]
      },
      "details": [
        {
          "nouns": [
            "larkspur",
            "ship",
            "sails",
            "sail",
            "lugger",
            "boat"
          ],
          "adjectives": [],
          "description": "{if dusk >= 2}Out past the Teeth, a dark sail without lights; further out, the riding lights of the Larkspur.{else}{if dusk >= 1}The Larkspur, from Amble, rounding the point under all her sail.{else}Nothing yet but sea.{/if}{/if}"
        },
        {
          "nouns": [
            "mainland",
            "harbour",
            "lights"
          ],
          "adjectives": [],
          "description": "The harbour, small and yellow and far off."
        },
        {
          "nouns": [
            "teeth",
            "reef",
            "rocks"
          ],
          "adjectives": [
            "black"
          ],
          "description": "A reef of black rocks off the end of the strand, pooled and weedy at low water, with the cliff rising sheer behind them."
        },
        {
          "nouns": [
            "rail",
            "walkway"
          ],
          "adjectives": [],
          "description": "An iron rail at waist height, cold enough to hurt."
        }
      ]
    },
    "cottage": {
      "title": "Keeper's Cottage",
      "name": "the cottage",
      "nouns": [
        "cottage",
        "kitchen"
      ],
      "description": "One low room does for everything here: a black iron stove, a scrubbed table, a dresser of blue plates with a cupboard underneath, and a bed in an alcove behind a curtain. It is tidy in the way of someone who lives alone and expects no visitors. {if imreHome}Imre sits by the stove, which is roaring.{else}The stove is cold.{/if} The front door is to the west, and a back door leads north into the lean-to.",
      "size": {
        "w": 60,
        "h": 40
      },
      "smell": "{if imreHome}Woodsmoke, and tea.{else}Cold ashes, and cat.{/if}",
      "listen": "{if catFed}Silence, of the satisfied kind.{else}A cat, somewhere, expressing an opinion.{/if}",
      "details": [
        {
          "nouns": [
            "clock"
          ],
          "adjectives": [],
          "description": "A clock on the mantelpiece, stopped at ten past four."
        },
        {
          "nouns": [
            "jar",
            "spills"
          ],
          "adjectives": [],
          "description": "An empty jar. The matches are not in it."
        },
        {
          "nouns": [
            "horseshoe"
          ],
          "adjectives": [],
          "description": "Points up, to keep the luck in."
        }
      ]
    },
    "leanTo": {
      "title": "Lean-to",
      "name": "the lean-to",
      "nouns": [
        "shed"
      ],
      "description": "A lean-to of tarred planks against the back of the cottage, full of the keeper's tackle: lobster pots, a coil of rope, and a rack of oars along the wall. The door back into the cottage is to the south.",
      "size": {
        "w": 40,
        "h": 25
      },
      "smell": "Tar, rope and old bait.",
      "details": [
        {
          "nouns": [
            "rack",
            "oars"
          ],
          "adjectives": [],
          "description": "A rack of oars. {if imreFree}One is missing: Imre has it.{else}One of them would make a decent crutch.{/if}"
        }
      ]
    },
    "strand": {
      "title": "The Strand",
      "name": "the strand",
      "nouns": [
        "strand",
        "beach"
      ],
      "description": "Shingle rattles under your boots. The strand runs in a long curve below the cliff, littered with weed and broken crab shells, and at its southern end the black rocks of the Teeth stand up out of the shallows. A small boat has been dragged up above the tideline. The shingle bank climbs back east to the causeway.",
      "size": {
        "w": 70,
        "h": 35
      },
      "smell": "Rotting weed. Not unpleasant, exactly. Honest.",
      "listen": "Every wave drags the shingle back with a long hiss.",
      "ambient": {
        "chance": 25,
        "lines": [
          "A wave runs further up the shingle than the last one did.",
          "Sandhoppers spring away from your boots."
        ]
      },
      "details": [
        {
          "nouns": [
            "teeth",
            "reef",
            "rocks"
          ],
          "adjectives": [
            "black"
          ],
          "description": "A reef of black rocks off the end of the strand, pooled and weedy at low water, with the cliff rising sheer behind them."
        },
        {
          "nouns": [
            "cliff",
            "weed",
            "curtains"
          ],
          "adjectives": [
            "black"
          ],
          "description": "The cliff rises behind the strand, hung with weed. It is hard to see detail from here: the Teeth, at the south end, would be the place to look."
        },
        {
          "nouns": [
            "shells",
            "crab",
            "crabs"
          ],
          "adjectives": [
            "crab"
          ],
          "description": "Broken crab shells, pink and white, where the gulls have been at them."
        }
      ]
    },
    "teeth": {
      "title": "The Teeth",
      "name": "the teeth",
      "nouns": [
        "teeth",
        "reef",
        "rocks"
      ],
      "description": "The rocks are slick with weed and pocked with pools, {if dusk >= 2}black now, and brimming as the tide pushes up into them{else}each one holding a piece of sky{/if}. On the seaward side the water is already sucking and slapping at the reef. The cliff rises sheer behind you, hung with long curtains of weed{if caveFound}, and in it, behind the weed you pulled aside, is the black mouth of a cave{/if}. The boulders lead back north to the strand.",
      "size": {
        "w": 60,
        "h": 40
      },
      "look": {
        "w": "{if caveFound}The cave mouth: a tall cleft of darkness in the cliff.{else}The cliff, and the heavy curtains of weed hanging down it.{/if}"
      },
      "smell": "Weed and wet stone, and somewhere, oddly, paraffin.",
      "listen": "{if caveFound}A faint voice, from inside the cliff.{else}The sea, and under it, faintly, something like a cough.{/if}",
      "ambient": {
        "chance": 35,
        "lines": [
          "A wave breaks over the seaward rocks and sends spray across the pools.",
          "The water in the pools trembles as the tide pushes in underneath.",
          "{if imreFree}A wave climbs the rocks where the cave mouth is, and slides back.{else}{if metImre}From the cave, faintly, Imre is singing something rude about the Harbour Board.{else}{if caveFound}From the cave comes a voice: \"Well? Are you coming in or not?\"{else}Did someone cough? It is hard to tell with the sea so loud.{/if}{/if}{/if}"
        ]
      },
      "details": [
        {
          "nouns": [
            "sky"
          ],
          "adjectives": [],
          "description": "{if dusk >= 2}Dark, with a few stars.{else}Pale and huge, and full of gulls.{/if}"
        },
        {
          "nouns": [
            "spray",
            "waves"
          ],
          "adjectives": [],
          "description": "The sea, breaking on the seaward rocks."
        }
      ]
    },
    "cave": {
      "title": "Sea Cave",
      "name": "the hollow",
      "nouns": [],
      "description": "The lantern light runs over wet black walls and finds, stacked on a shelf of rock above the tideline, a dozen small barrels that reek of paraffin. So this is where the Saltmarrow oil went. {if imreFree}The place where Imre sat is an empty dent in the shingle.{else}Propped against the barrels, grey-faced, one leg stuck out stiffly in front of him, is a man in a keeper's jersey.{/if} {if dusk >= 2}The way out, to the east, is only a lesser darkness now.{else}Daylight is a thin crack back out to the east.{/if}",
      "size": {
        "w": 50,
        "h": 35
      },
      "dark": true,
      "darkText": "It is pitch dark in here. Water drips somewhere ahead, and from the same direction comes the sound of someone trying not to groan. The way out is {if dusk >= 2}a gap of lesser darkness{else}a thin crack of daylight{/if} to the east.",
      "smell": "Paraffin. A great deal of it.",
      "listen": "{if imreFree}Drips, and echoes.{else}Drips, echoes, and Imre's breathing.{/if}",
      "details": [
        {
          "nouns": [
            "walls",
            "wall",
            "darkness"
          ],
          "adjectives": [],
          "description": "Wet black rock, gleaming in the lantern light."
        },
        {
          "nouns": [
            "dent",
            "shingle"
          ],
          "adjectives": [],
          "description": "{if imreFree}The dent where Imre sat for a day and a night.{else}Shingle, and Imre sitting on it.{/if}"
        }
      ]
    }
  },
  "passages": {
    "causewayPath": {
      "kind": "passage",
      "name": "path",
      "nouns": [
        "path",
        "track"
      ],
      "adjectives": [
        "gorse"
      ],
      "description": "A sandy path, climbing through the gorse.",
      "a": {
        "room": "causeway",
        "dir": "n",
        "also": [
          "u"
        ],
        "wall": "n",
        "pos": 50
      },
      "b": {
        "room": "slope",
        "dir": "s",
        "also": [
          "d"
        ],
        "wall": "s",
        "pos": 50
      }
    },
    "slopeSteps": {
      "kind": "passage",
      "name": "cut steps",
      "nouns": [
        "steps"
      ],
      "adjectives": [
        "cut",
        "rock"
      ],
      "description": "Steps cut into the rock, worn hollow in the middle by a century of keepers.",
      "a": {
        "room": "slope",
        "dir": "n",
        "also": [
          "u"
        ],
        "wall": "n",
        "pos": 50
      },
      "b": {
        "room": "yard",
        "dir": "s",
        "also": [
          "d"
        ],
        "wall": "s",
        "pos": 40
      }
    },
    "towerDoor": {
      "kind": "door",
      "name": "tower door",
      "nouns": [
        "door"
      ],
      "adjectives": [
        "tower",
        "green"
      ],
      "open": true,
      "description": "A heavy door, painted the Board's green a long time ago.",
      "a": {
        "room": "yard",
        "dir": "n",
        "also": [
          "in"
        ],
        "wall": "n",
        "pos": 50
      },
      "b": {
        "room": "towerBase",
        "dir": "s",
        "also": [
          "out"
        ],
        "wall": "s",
        "pos": 50
      }
    },
    "storeDoor": {
      "kind": "door",
      "name": "store door",
      "nouns": [
        "door"
      ],
      "adjectives": [
        "store",
        "broken"
      ],
      "description": "{if drumsChecked}The hasp has been levered clean off the frame. Imre's padlock still hangs from it, locked, and useless.{else}A plank door with a broken hasp.{/if}",
      "a": {
        "room": "yard",
        "dir": "e",
        "wall": "e",
        "pos": 60
      },
      "b": {
        "room": "oilStore",
        "dir": "w",
        "also": [
          "out"
        ],
        "wall": "w",
        "pos": 50
      }
    },
    "spiral": {
      "kind": "stairs",
      "name": "spiral stair",
      "nouns": [
        "stair",
        "stairs",
        "staircase",
        "spiral"
      ],
      "adjectives": [
        "iron",
        "spiral"
      ],
      "description": "An iron spiral, the treads worn bright.",
      "a": {
        "room": "towerBase",
        "dir": "u",
        "box": {
          "x": 14,
          "y": 12,
          "w": 12,
          "h": 10
        }
      },
      "b": {
        "room": "watchRoom",
        "dir": "d",
        "box": {
          "x": 5,
          "y": 24,
          "w": 10,
          "h": 8
        }
      }
    },
    "hatch": {
      "kind": "door",
      "name": "hatch",
      "nouns": [
        "hatch",
        "trapdoor",
        "padlock",
        "lock",
        "hasp",
        "ladder"
      ],
      "adjectives": [
        "heavy"
      ],
      "locked": true,
      "key": "hatchKey",
      "description": "A heavy wooden hatch in the ceiling, with a short iron ladder up to it.{if hatchOpened} The padlock hangs open.{else} A brass padlock hangs through its hasp.{/if}",
      "a": {
        "room": "watchRoom",
        "dir": "u",
        "wall": "n",
        "pos": 50
      },
      "b": {
        "room": "lampRoom",
        "dir": "d",
        "wall": "s",
        "pos": 50
      }
    },
    "galleryDoor": {
      "kind": "door",
      "name": "gallery door",
      "nouns": [
        "door"
      ],
      "adjectives": [
        "narrow",
        "gallery"
      ],
      "open": true,
      "description": "A narrow door, half glass, salted white by spray.",
      "a": {
        "room": "lampRoom",
        "dir": "e",
        "also": [
          "out"
        ],
        "wall": "e",
        "pos": 50
      },
      "b": {
        "room": "gallery",
        "dir": "w",
        "also": [
          "in"
        ],
        "wall": "w",
        "pos": 50
      }
    },
    "cottageDoor": {
      "kind": "door",
      "name": "cottage door",
      "nouns": [
        "door"
      ],
      "adjectives": [
        "front",
        "cottage",
        "blue"
      ],
      "description": "A blue front door with a horseshoe nailed over it, points up.",
      "a": {
        "room": "causeway",
        "dir": "e",
        "wall": "e",
        "pos": 40
      },
      "b": {
        "room": "cottage",
        "dir": "w",
        "also": [
          "out"
        ],
        "wall": "w",
        "pos": 50
      }
    },
    "backDoor": {
      "kind": "door",
      "name": "back door",
      "nouns": [
        "door"
      ],
      "adjectives": [
        "back"
      ],
      "open": true,
      "description": "A plank door, propped open with a brick.",
      "a": {
        "room": "cottage",
        "dir": "n",
        "wall": "n",
        "pos": 75
      },
      "b": {
        "room": "leanTo",
        "dir": "s",
        "also": [
          "out"
        ],
        "wall": "s",
        "pos": 50
      }
    },
    "shingleBank": {
      "kind": "passage",
      "name": "shingle bank",
      "nouns": [
        "bank",
        "shingle"
      ],
      "adjectives": [
        "shingle"
      ],
      "description": "A steep bank of rattling shingle.",
      "a": {
        "room": "causeway",
        "dir": "w",
        "also": [
          "d"
        ],
        "wall": "w",
        "pos": 60
      },
      "b": {
        "room": "strand",
        "dir": "e",
        "also": [
          "u"
        ],
        "wall": "e",
        "pos": 40
      }
    },
    "boulders": {
      "kind": "passage",
      "name": "boulders",
      "nouns": [
        "boulders"
      ],
      "adjectives": [
        "tumbled"
      ],
      "description": "Tumbled boulders, the way out over the rocks.",
      "a": {
        "room": "strand",
        "dir": "s",
        "wall": "s",
        "pos": 75
      },
      "b": {
        "room": "teeth",
        "dir": "n",
        "wall": "n",
        "pos": 50
      }
    },
    "caveMouth": {
      "kind": "passage",
      "name": "cave mouth",
      "nouns": [
        "cave",
        "mouth",
        "cleft",
        "opening"
      ],
      "adjectives": [
        "dark",
        "black"
      ],
      "hidden": true,
      "description": "A tall cleft in the cliff, just wide enough to walk into sideways.",
      "a": {
        "room": "teeth",
        "dir": "w",
        "also": [
          "in"
        ],
        "wall": "w",
        "pos": 40,
        "description": "A tall cleft in the cliff, just wide enough to walk into sideways. A cold breath comes out of it, smelling of paraffin."
      },
      "b": {
        "room": "cave",
        "dir": "e",
        "also": [
          "out"
        ],
        "wall": "e",
        "pos": 50,
        "description": "A thin crack of grey daylight, back out to the Teeth."
      }
    }
  },
  "objects": {
    "letter": {
      "name": "letter of commission",
      "nouns": [
        "letter",
        "commission",
        "paper"
      ],
      "adjectives": [
        "folded"
      ],
      "description": "A folded letter on the Harbour Board's thick paper, sealed in green.",
      "readText": "\"To all whom it may concern: the bearer, {name}, is a surveyor of this Board, sent to inspect Saltmarrow Light and to report on the condition of its keeper. Render every assistance.\" Then a signature you have never been able to read.",
      "in": "player",
      "reactions": [
        {
          "action": "open",
          "instead": true,
          "effects": [
            {
              "type": "command",
              "text": "read letter"
            }
          ]
        }
      ]
    },
    "tidePost": {
      "name": "tide post",
      "nouns": [
        "post",
        "gauge"
      ],
      "adjectives": [
        "tide",
        "painted"
      ],
      "scenery": true,
      "fixed": true,
      "description": "A tall post painted with rings and words to measure the tide by: DRY at the bottom, then NEAP, SPRING, and at the very top, DROWNED. The water is lapping at NEAP{if dusk >= 1} and climbing{/if}.",
      "readText": "DRY. NEAP. SPRING. DROWNED. Someone has carved \"I.V. 1891\" near the bottom.",
      "in": "causeway",
      "shape": {
        "x": 8,
        "y": 26,
        "w": 4,
        "h": 4,
        "round": true
      }
    },
    "signpost": {
      "name": "signpost",
      "nouns": [
        "signpost",
        "sign"
      ],
      "scenery": true,
      "fixed": true,
      "description": "A weathered finger-post.",
      "readText": "In faded white paint: LIGHT (north), COTTAGE (east), STRAND (west).",
      "in": "causeway",
      "shape": {
        "x": 28,
        "y": 8,
        "w": 4,
        "h": 4,
        "round": true
      }
    },
    "sea": {
      "name": "sea",
      "nouns": [
        "sea",
        "water",
        "tide",
        "waves"
      ],
      "scenery": true,
      "fixed": true,
      "description": "{if dusk >= 2}Black now, and loud, and coming in.{else}{if dusk >= 1}Pewter-grey and turning in the last of the light.{else}Grey-green and patient. The tide is coming in.{/if}{/if}",
      "fixedText": "You would need a bigger satchel.",
      "in": "causeway",
      "alsoIn": [
        "strand",
        "teeth",
        "gallery",
        "yard"
      ]
    },
    "glove": {
      "name": "leather glove",
      "nouns": [
        "glove"
      ],
      "adjectives": [
        "leather",
        "dark"
      ],
      "description": "A heavy leather work glove, worn smooth at the fingertips. Inside the cuff someone has stitched the initials I.V.",
      "in": "slope",
      "shape": {
        "x": 6,
        "y": 30,
        "w": 5,
        "h": 3
      },
      "reactions": [
        {
          "action": "take",
          "once": true,
          "effects": [
            {
              "type": "setVar",
              "name": "gloveTaken",
              "value": true
            },
            {
              "type": "say",
              "text": "It is wet through. It has been out here at least a night."
            }
          ]
        }
      ]
    },
    "mast": {
      "name": "signal mast",
      "nouns": [
        "mast",
        "flagpole",
        "pole",
        "halyards",
        "halyard"
      ],
      "adjectives": [
        "signal"
      ],
      "scenery": true,
      "fixed": true,
      "description": "The keeper's signal mast. No flags are flying, which is why the Board heard nothing. When you look closer, you see that the halyards have been cut, cleanly, about head height.",
      "in": "yard",
      "shape": {
        "x": 28,
        "y": 22,
        "w": 4,
        "h": 4,
        "round": true
      }
    },
    "railing": {
      "name": "railing",
      "nouns": [
        "railing",
        "rail"
      ],
      "adjectives": [
        "iron"
      ],
      "scenery": true,
      "fixed": true,
      "description": "An iron railing, rusted to lace in places. From here you can see down onto the Teeth.",
      "in": "yard",
      "shape": {
        "x": 4,
        "y": 10,
        "w": 3,
        "h": 30
      }
    },
    "drums": {
      "name": "oil drums",
      "article": "some",
      "nouns": [
        "drums",
        "drum",
        "bungs"
      ],
      "adjectives": [
        "iron",
        "oil",
        "six"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Every drum rings hollow when you rap it. They have not leaked: the floor is dry, and each bung has been screwed neatly back in. Someone drained them on purpose.",
      "in": "oilStore",
      "shape": {
        "x": 6,
        "y": 5,
        "w": 28,
        "h": 6
      },
      "reactions": [
        {
          "action": "examine",
          "effects": [
            {
              "type": "setVar",
              "name": "drumsChecked",
              "value": true
            }
          ]
        }
      ]
    },
    "shelf": {
      "name": "shelf",
      "nouns": [
        "shelf",
        "measures"
      ],
      "scenery": true,
      "fixed": true,
      "supporter": true,
      "description": "A plank shelf of funnels and brass measures.",
      "in": "oilStore",
      "shape": {
        "x": 6,
        "y": 20,
        "w": 10,
        "h": 4
      }
    },
    "oilCan": {
      "name": "oil can",
      "nouns": [
        "can",
        "oilcan"
      ],
      "adjectives": [
        "oil",
        "copper",
        "empty",
        "dented"
      ],
      "description": "A dented copper can with a long spout, stamped HARBOUR BOARD: SALTMARROW. Empty.",
      "in": "shelf"
    },
    "fullCan": {
      "name": "full oil can",
      "nouns": [
        "can",
        "oilcan",
        "oil"
      ],
      "adjectives": [
        "oil",
        "copper",
        "full",
        "dented"
      ],
      "description": "The copper oil can, heavy now and sloshing with paraffin.",
      "smell": "Paraffin.",
      "in": ""
    },
    "oilskins": {
      "name": "oilskins",
      "article": "some",
      "nouns": [
        "oilskins",
        "pegs",
        "coats"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Three oilskin coats and a sou'wester, all far too big for anybody but Imre. One peg is empty.",
      "fixedText": "You have a coat already, and it is already too big.",
      "in": "towerBase"
    },
    "bench": {
      "name": "bench",
      "nouns": [
        "bench",
        "chimneys"
      ],
      "adjectives": [
        "work"
      ],
      "scenery": true,
      "fixed": true,
      "supporter": true,
      "description": "A work bench under the window, covered in spare lamp chimneys, wick trimmers and tins of polish.",
      "in": "towerBase",
      "shape": {
        "x": 24,
        "y": 28,
        "w": 12,
        "h": 5
      }
    },
    "cloth": {
      "name": "chamois cloth",
      "nouns": [
        "cloth",
        "chamois",
        "rag",
        "leather"
      ],
      "adjectives": [
        "chamois",
        "soft",
        "polishing"
      ],
      "description": "A square of soft chamois, grey with old polish. The kind of thing you clean glass with.",
      "in": "bench"
    },
    "desk": {
      "name": "desk",
      "nouns": [
        "desk"
      ],
      "adjectives": [
        "keeper's"
      ],
      "scenery": true,
      "fixed": true,
      "supporter": true,
      "description": "A sloped desk under the seaward window, with an inkwell screwed to it so the wind can't take it.",
      "in": "watchRoom",
      "shape": {
        "x": 22,
        "y": 6,
        "w": 12,
        "h": 6
      }
    },
    "logbook": {
      "name": "logbook",
      "nouns": [
        "logbook",
        "log",
        "book",
        "entries"
      ],
      "adjectives": [
        "keeper's",
        "black"
      ],
      "description": "The station log: a black ledger with the Board's crest on the cover, half full of a big upright hand.",
      "readText": "The last entries:\n\nTues. Fair, wind SW. Oil store down by two drums, I would swear to it. Locked it after.\n\nWed. Store lock broken in the night. Drums EMPTY. Lamp burned on what was left in it and smoked something terrible. Lights again out on the Teeth after midnight: a lantern, low down, moving about. No boat of mine.\n\nThurs. Wrote to the Board. Ran up the flags. Flags gone by morning, halyards cut.\n\nFri. They come at the bottom of the tide, I am sure of it, and hide whatever it is in the rocks. Going down to the Teeth this afternoon at low water with my good lantern to see. (The old storm lantern is in the lean-to if this one gives out.) If anybody reads this and I am not back, tell Ottoline the cat is to be fed.",
      "in": "desk",
      "reactions": [
        {
          "action": "read",
          "effects": [
            {
              "type": "setVar",
              "name": "readLog",
              "value": true
            }
          ]
        }
      ]
    },
    "barometer": {
      "name": "barometer",
      "nouns": [
        "barometer",
        "glass",
        "needle"
      ],
      "scenery": true,
      "fixed": true,
      "description": "The needle points firmly at CHANGE. There is a bright spot on the glass where it has been tapped a thousand times.",
      "in": "watchRoom",
      "reactions": [
        {
          "action": "touch",
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You tap the glass. The needle shivers, and stays at CHANGE."
            }
          ]
        }
      ]
    },
    "lamp": {
      "name": "great lamp",
      "nouns": [
        "lamp",
        "wick",
        "reservoir",
        "light"
      ],
      "adjectives": [
        "great",
        "paraffin"
      ],
      "fixed": true,
      "scenery": true,
      "switchable": true,
      "light": true,
      "description": "A paraffin lamp with a broad flat wick, set at the very heart of the lens.{if lampOiled} Its reservoir is full to the brim.{else} Its reservoir is bone dry.{/if}",
      "offText": "It is cold.",
      "onText": "It burns with a steady white flame.",
      "fixedText": "It is bolted to the heart of the lens, and it weighs more than you do.",
      "in": "lampRoom",
      "shape": {
        "x": 16,
        "y": 14,
        "w": 8,
        "h": 8,
        "round": true
      },
      "reactions": [
        {
          "action": "switchOn",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "effects": [
            {
              "type": "say",
              "text": "With no oil in it, there is nothing to light."
            }
          ]
        },
        {
          "action": "switchOn",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "has",
              "item": "matchbox"
            }
          ],
          "effects": [
            {
              "type": "say",
              "text": "You strike a match and the wick catches. But through the sooted lens the light is a sullen orange smear that would not reach the strand, let alone the sea. You pinch it out again. The lens needs cleaning first."
            }
          ]
        },
        {
          "action": "switchOn",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true
            },
            {
              "type": "has",
              "item": "matchbox",
              "not": true
            }
          ],
          "effects": [
            {
              "type": "say",
              "text": "You have nothing to light it with."
            }
          ]
        },
        {
          "action": "switchOn",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true
            },
            {
              "type": "has",
              "item": "matchbox"
            }
          ],
          "effects": [
            {
              "type": "setVar",
              "name": "lit",
              "value": true
            },
            {
              "type": "setSwitch",
              "thing": "lamp",
              "state": "on"
            },
            {
              "type": "fireEvent",
              "event": "lampLit"
            }
          ]
        }
      ]
    },
    "lens": {
      "name": "lens",
      "nouns": [
        "lens",
        "prisms",
        "prism",
        "glass"
      ],
      "adjectives": [
        "great",
        "sooty"
      ],
      "scenery": true,
      "fixed": true,
      "description": "{if lensClean}Clean now. The prisms catch every scrap of light in the room and throw it back multiplied.{else}A fog of soot coats the inside of the prisms. The lamp must have smoked badly the last night it burned.{/if}",
      "fixedText": "It is taller than you are, and made of glass, and you are not touching it with anything but a cloth.",
      "in": "lampRoom"
    },
    "stove": {
      "name": "stove",
      "nouns": [
        "stove",
        "range"
      ],
      "adjectives": [
        "iron",
        "black"
      ],
      "scenery": true,
      "fixed": true,
      "description": "{if imreHome}Roaring. Imre has his good foot up on the fender.{else}As cold as the sea. Nobody has lit it since yesterday at least.{/if}",
      "in": "cottage",
      "shape": {
        "x": 4,
        "y": 6,
        "w": 10,
        "h": 6
      }
    },
    "table": {
      "name": "table",
      "nouns": [
        "table"
      ],
      "adjectives": [
        "scrubbed",
        "kitchen"
      ],
      "scenery": true,
      "fixed": true,
      "supporter": true,
      "description": "A scrubbed deal table.{if catFed}{else} A large ginger cat is lying on it, on top of a box of matches.{/if}",
      "in": "cottage",
      "shape": {
        "x": 24,
        "y": 16,
        "w": 14,
        "h": 8
      }
    },
    "cups": {
      "name": "cups",
      "article": "some",
      "nouns": [
        "cups",
        "cup",
        "mug",
        "china"
      ],
      "adjectives": [
        "two",
        "china",
        "chipped"
      ],
      "description": "Two cups, both with a tidemark of cold tea. One is the keeper's big chipped mug. The other is good china, the kind brought out for company.",
      "fixedText": "Better leave them. They are, in their way, evidence.",
      "fixed": true,
      "in": "table"
    },
    "mantel": {
      "name": "mantelpiece",
      "nouns": [
        "mantelpiece",
        "mantel",
        "shelf"
      ],
      "scenery": true,
      "fixed": true,
      "supporter": true,
      "description": "A shelf over the stove, with a clock that has stopped at ten past four and an empty jar where the matches ought to be.",
      "in": "cottage"
    },
    "matchbox": {
      "name": "box of matches",
      "nouns": [
        "matches",
        "box",
        "matchbox",
        "match"
      ],
      "adjectives": [
        "match"
      ],
      "description": "A box of Bryant & May matches, about half full.{if catFed}{else} Pilot is lying on it.{/if}",
      "in": "table",
      "reactions": [
        {
          "action": "take",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "catFed",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "effects": [
            {
              "type": "say",
              "text": "You reach for the matches. Pilot lays his ears flat and makes a noise like a kettle coming to the boil. He is lying squarely on the box, and he is not moving: not for you, and not on an empty stomach."
            }
          ]
        }
      ]
    },
    "dresser": {
      "name": "dresser",
      "nouns": [
        "dresser",
        "plates"
      ],
      "adjectives": [
        "blue"
      ],
      "scenery": true,
      "fixed": true,
      "description": "A dresser of blue and white plates, with a cupboard underneath.",
      "in": "cottage",
      "shape": {
        "x": 44,
        "y": 4,
        "w": 12,
        "h": 5
      }
    },
    "cupboard": {
      "name": "cupboard",
      "nouns": [
        "cupboard"
      ],
      "scenery": true,
      "fixed": true,
      "container": true,
      "openable": true,
      "description": "The cupboard under the dresser.",
      "in": "cottage"
    },
    "pilchards": {
      "name": "tin of pilchards",
      "nouns": [
        "tin",
        "pilchards",
        "fish"
      ],
      "adjectives": [
        "pilchard"
      ],
      "description": "A flat tin of pilchards in tomato sauce, with a picture of a smiling fisherman on the lid.",
      "in": "cupboard",
      "reactions": [
        {
          "action": "eat",
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You are not that hungry. Pilot, watching you, clearly is."
            }
          ]
        },
        {
          "action": "open",
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You could, but it would only be for one customer, and he is watching you. FEED PILOT, or GIVE the tin TO him."
            }
          ]
        }
      ]
    },
    "emptyTin": {
      "name": "empty tin",
      "nouns": [
        "tin"
      ],
      "adjectives": [
        "empty",
        "pilchard"
      ],
      "description": "Licked so clean you could see your face in it.",
      "in": ""
    },
    "satchel": {
      "name": "satchel",
      "nouns": [
        "satchel",
        "instruments",
        "bag",
        "compass",
        "chain",
        "level",
        "notebook"
      ],
      "adjectives": [
        "leather"
      ],
      "description": "Your satchel of surveyor's instruments: compass, chain, level, a notebook full of nothing yet. None of it is any use tonight, but you would be in trouble if you came back without it.",
      "in": "player",
      "reactions": [
        {
          "action": "drop",
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "The Board would want to know where it went. You keep it."
            }
          ]
        },
        {
          "action": "open",
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You check your instruments. They are all there, and none of them is any use tonight."
            }
          ]
        },
        {
          "action": "throw",
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "The Board would want to know where it went. You keep it."
            }
          ]
        }
      ]
    },
    "bed": {
      "name": "bed",
      "nouns": [
        "bed",
        "alcove",
        "curtain"
      ],
      "scenery": true,
      "fixed": true,
      "description": "A narrow bed in an alcove, made up tight as a ship's bunk. It has not been slept in.",
      "in": "cottage"
    },
    "lantern": {
      "name": "storm lantern",
      "nouns": [
        "lantern"
      ],
      "adjectives": [
        "storm",
        "tin",
        "old"
      ],
      "switchable": true,
      "light": true,
      "description": "A battered tin storm lantern with a glass chimney, its wick trimmed and its tank half full.",
      "onText": "It burns with a small, steady, yellow flame.",
      "offText": "It is not lit.",
      "switchOnText": "You strike a match, lift the chimney and touch the flame to the wick. The lantern settles into a steady yellow glow.",
      "switchOffText": "You turn the wick down until the flame goes out.",
      "in": "leanTo",
      "shape": {
        "x": 30,
        "y": 4,
        "w": 4,
        "h": 4,
        "round": true
      },
      "reactions": [
        {
          "action": "switchOn",
          "instead": true,
          "when": [
            {
              "type": "has",
              "item": "matchbox",
              "not": true
            }
          ],
          "effects": [
            {
              "type": "say",
              "text": "You need something to light it with."
            }
          ]
        }
      ]
    },
    "oar": {
      "name": "oar",
      "nouns": [
        "oar",
        "oars"
      ],
      "adjectives": [
        "ash",
        "long"
      ],
      "description": "A long ash oar, worn pale at the grip. Sturdy enough to lean your whole weight on.",
      "in": "leanTo",
      "shape": {
        "x": 4,
        "y": 4,
        "w": 3,
        "h": 16
      }
    },
    "tackle": {
      "name": "tackle",
      "article": "some",
      "nouns": [
        "tackle",
        "pots",
        "rope",
        "coil"
      ],
      "adjectives": [
        "lobster"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Lobster pots, a coil of good rope, net floats. Nothing you need tonight.",
      "in": "leanTo"
    },
    "dinghy": {
      "name": "dinghy",
      "nouns": [
        "dinghy",
        "boat",
        "transom",
        "thwart",
        "name"
      ],
      "adjectives": [
        "small",
        "tarred"
      ],
      "fixed": true,
      "description": "A tarred dinghy, and not the keeper's: its name has been painted out across the transom, though under the black you can still make out a C. Under the thwart lies a coil of cut halyard with two signal flags still bent onto it.",
      "fixedText": "It is heavier than it looks, and it is not yours.",
      "scenery": true,
      "in": "strand",
      "shape": {
        "x": 30,
        "y": 12,
        "w": 12,
        "h": 6
      },
      "reactions": [
        {
          "action": "search",
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Under the thwart: the keeper's cut halyard, with two signal flags still bent onto it. Whoever cut the flags down kept them, which is either careless or a joke."
            }
          ]
        }
      ]
    },
    "flags": {
      "name": "signal flags",
      "article": "some",
      "nouns": [
        "flags",
        "flag",
        "halyard",
        "halyards"
      ],
      "adjectives": [
        "signal",
        "cut"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Two of Imre's signal flags, still bent onto a length of cut halyard: the pair that means I REQUIRE ASSISTANCE. Whoever cut them down kept them.",
      "fixedText": "Better leave them where they are. They are evidence, and the Board will want to see them where they were found.",
      "in": "strand"
    },
    "weed": {
      "name": "curtains of weed",
      "article": "some",
      "nouns": [
        "weed",
        "curtain",
        "curtains",
        "seaweed",
        "kelp"
      ],
      "adjectives": [
        "hanging",
        "long"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Long brown weed hangs down the cliff face in heavy curtains.{if caveFound} One has been pulled aside from the mouth of a cave.{else} One of them hangs oddly, flat and still, as if there were nothing behind it to lie against.{/if}",
      "fixedText": "It is rooted to the rock. You could pull it aside, though.",
      "in": "teeth",
      "shape": {
        "x": 4,
        "y": 8,
        "w": 4,
        "h": 24
      },
      "reactions": [
        {
          "action": "search",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "effects": [
            {
              "type": "fireEvent",
              "event": "revealCave"
            }
          ]
        },
        {
          "action": "touch",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "effects": [
            {
              "type": "fireEvent",
              "event": "revealCave"
            }
          ]
        }
      ]
    },
    "cliff": {
      "name": "cliff",
      "nouns": [
        "cliff",
        "rock",
        "face"
      ],
      "adjectives": [
        "sheer",
        "black"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Sheer black rock, hung with curtains of weed.{if caveFound} A cave opens in it behind one of them.{else} One of the curtains hangs oddly.{/if}",
      "in": "teeth"
    },
    "pools": {
      "name": "rock pools",
      "article": "some",
      "nouns": [
        "pools",
        "pool",
        "anemones",
        "crabs",
        "glint",
        "glass"
      ],
      "adjectives": [
        "rock",
        "deep",
        "deepest"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Anemones, a crab that reverses under a ledge, and at the bottom of one pool the broken glass of a lantern. Not old.{if keyFound}{else} In the deepest pool, under a frond of weed, something glints.{/if}",
      "in": "teeth",
      "reactions": [
        {
          "action": "search",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "keyFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "effects": [
            {
              "type": "fireEvent",
              "event": "findKey"
            }
          ]
        },
        {
          "action": "touch",
          "instead": true,
          "when": [
            {
              "type": "var",
              "name": "keyFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "effects": [
            {
              "type": "fireEvent",
              "event": "findKey"
            }
          ]
        }
      ]
    },
    "barrels": {
      "name": "barrels",
      "article": "some",
      "nouns": [
        "barrels",
        "barrel",
        "casks",
        "cask",
        "shelf",
        "bung"
      ],
      "adjectives": [
        "small",
        "oil"
      ],
      "scenery": true,
      "fixed": true,
      "description": "Small casks, the kind that are easy to row out to a ship at night. Your Board's oil, by the smell. One has its bung out.",
      "fixedText": "They are far too heavy to carry, even one.",
      "in": "cave",
      "shape": {
        "x": 4,
        "y": 4,
        "w": 16,
        "h": 6
      }
    },
    "hatchKey": {
      "name": "brass key",
      "nouns": [
        "key",
        "lanyard",
        "cord"
      ],
      "adjectives": [
        "brass",
        "hatch"
      ],
      "description": "A brass key on a snapped cord, cold from the pool.",
      "in": ""
    }
  },
  "actors": {
    "ottoline": {
      "name": "Ottoline Brack",
      "article": "none",
      "nouns": [
        "ottoline",
        "brack",
        "woman",
        "cockler",
        "picker"
      ],
      "adjectives": [
        "broad"
      ],
      "description": "A broad woman in a man's oilskin, with a cockle basket on her hip and a face like weathered teak. She has picked these flats for thirty years and she does not look as though she means to stop.",
      "marker": "person",
      "place": {
        "room": "causeway",
        "x": 40,
        "y": 22
      },
      "conversation": {
        "start": "hello",
        "again": "again",
        "leave": "{if dusk >= 2}Ottoline nods, and pulls her oilskin tighter against the night.{else}Ottoline nods and bends back to the cockle beds.{/if}",
        "nodes": {
          "hello": {
            "say": "\"You'll be the Board's,\" she says, straightening up. \"Took them long enough. Ottoline Brack. I've picked these flats thirty years and I never knew that light go out two nights together.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "again": {
            "say": "{if ottolineSawImre}Ottoline is still smiling. \"Well?\"{else}{if dusk >= 2}Ottoline is a dark shape at the water's edge, her basket on her hip. \"Well?\"{else}Ottoline looks up from her basket. \"Well?\"{/if}{/if}",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "keeper": {
            "say": "\"Not since yesterday morning, when he came down for his milk and a grumble. He wasn't at the door this morning, and that cat of his was yowling fit to wake the dead.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "strange": {
            "say": "\"Lights on the Teeth after midnight. Not his. And a boat on the strand that isn't any boat I know, with its name painted out.\" She spits, neatly, into the mud. \"You didn't hear that from me. The Corvanes have long memories.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "corvanes": {
            "say": "\"Mal and his brother. They run a lugger out of the next bay along. Fishing, they call it.\" She looks at you. \"Nobody catches that many fish at night.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "start": {
            "say": "\"The tower, if I were you. Imre writes everything down in that log of his: weather, ships, what he had for his breakfast. Then the cottage. And go canny on the Teeth, with the tide making.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "cat": {
            "say": "\"Pilot? Spoilt rotten. If he's yowling, he's hungry, and if he's hungry he'll sit on whatever you want most until he's fed. There's pilchards in Imre's cupboard, there always are.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "found": {
            "say": "\"In a—\" She sets down her basket. \"I can't get to him across that water now, not with the tide making. You see to the light, {name}. And if you can get him off that rock, do; he'll not thank you, but do it.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "rescued": {
            "say": "She closes her eyes for a moment. \"Then get him by a fire,\" she says, \"and get that light lit, and I'll see to the rest of him in the morning.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          },
          "home": {
            "say": "For a moment Ottoline says nothing at all. Then she wipes her face with the back of a muddy hand and says, \"Well. Somebody had better put the kettle on, then.\"",
            "options": [
              {
                "text": "Have you seen the keeper?",
                "go": "keeper",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Have you seen anything strange?",
                "go": "strange"
              },
              {
                "text": "Who are the Corvanes?",
                "go": "corvanes",
                "when": [
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "strange"
                  }
                ]
              },
              {
                "text": "Where should I start?",
                "go": "start",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "What about the cat?",
                "go": "cat",
                "when": [
                  {
                    "type": "var",
                    "name": "catFed",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "I found Imre. He's hurt, in a cave on the Teeth.",
                "go": "found",
                "when": [
                  {
                    "type": "var",
                    "name": "metImre",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "found",
                    "not": true
                  }
                ]
              },
              {
                "text": "I've got Imre out of the cave.",
                "go": "rescued",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "var",
                    "name": "ottolineSawImre",
                    "op": "is",
                    "value": true,
                    "not": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "rescued",
                    "not": true
                  }
                ]
              },
              {
                "text": "Imre is home, by his stove.",
                "go": "home",
                "when": [
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "seenNode",
                    "actor": "ottoline",
                    "node": "home",
                    "not": true
                  }
                ]
              }
            ]
          }
        }
      }
    },
    "pilot": {
      "name": "Pilot",
      "article": "none",
      "nouns": [
        "pilot",
        "cat",
        "tom"
      ],
      "adjectives": [
        "ginger",
        "large"
      ],
      "description": "{if catFed}Pilot, Imre's ginger tom, now your shadow. He has a torn ear and the air of someone who has seen a great many surveyors come and go.{else}A large ginger cat with a torn ear, lying on the table and regarding you with enormous disapproval. He is lying on a box of matches as if he were hatching it. He looks very hungry, and very much as though this is your fault.{/if}",
      "talk": "{if catFed}Pilot blinks at you slowly, which in cat is a long and affectionate speech.{else}Pilot says nothing, but he says it very loudly.{/if}",
      "marker": "person",
      "place": {
        "room": "cottage",
        "x": 28,
        "y": 12
      },
      "followText": "{once}Pilot pads after you, tail straight up like a flag.{/once}"
    },
    "imre": {
      "name": "Imre Vass",
      "article": "none",
      "nouns": [
        "imre",
        "vass",
        "keeper",
        "man",
        "leg",
        "ankle"
      ],
      "adjectives": [
        "grey-faced"
      ],
      "description": "{if imreHome}Imre Vass, keeper of Saltmarrow, in his own chair by his own stove, with his bad foot up and his colour coming back.{else}{if imreFree}Imre Vass, keeper of Saltmarrow, hopping on one leg and an oar, and furious about all of it.{else}A big grey-bearded man in a keeper's jersey, his left leg stuck out stiffly in front of him. He looks cold, and in pain, and very, very cross.{/if}{/if}",
      "marker": "person",
      "place": {
        "room": "cave",
        "x": 22,
        "y": 16
      },
      "followText": "{once}Imre hobbles after you on his oar, swearing steadily under his breath.{/once}",
      "conversation": {
        "start": "hello",
        "again": "menu",
        "leave": "{if imreHome}\"Go on,\" says Imre. \"The lamp.\"{else}{if imreAtTower}\"Go on up,\" says Imre. \"I'll be here.\"{else}{if imreFree}\"After you,\" says Imre.{else}\"Go on, then,\" says Imre. \"I'll not be going anywhere.\"{/if}{/if}{/if}",
        "nodes": {
          "hello": {
            "say": "\"Who's that? Put that lantern down, you'll blind me—\" He squints past the flame. \"Harbour Board? They've sent a child. Well. Thank God for children. I've done my ankle, and I've been sat here in the dark with Corvane's barrels since yesterday afternoon, listening to the tide come in and go out again.\"",
            "effects": [
              {
                "type": "setVar",
                "name": "metImre",
                "value": true
              },
              {
                "type": "later",
                "event": "dusk1",
                "turns": 15
              },
              {
                "type": "later",
                "event": "dusk2",
                "turns": 30
              }
            ],
            "options": [
              {
                "text": "What happened to the light?",
                "go": "light"
              },
              {
                "text": "Are you badly hurt?",
                "go": "hurt",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "How is the ankle?",
                "go": "ankle",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  }
                ]
              },
              {
                "text": "What can I do?",
                "go": "task",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Tell me again what I need to do.",
                "go": "remind",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "lit",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Here, lean on this oar.",
                "end": true,
                "effects": [
                  {
                    "type": "fireEvent",
                    "event": "imreUp"
                  }
                ],
                "when": [
                  {
                    "type": "has",
                    "item": "oar"
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Come on. I'll get you home to your stove.",
                "end": true,
                "when": [
                  {
                    "type": "var",
                    "name": "imreAtTower",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ],
                "effects": [
                  {
                    "type": "setVar",
                    "name": "imreAtTower",
                    "value": false
                  },
                  {
                    "type": "follow",
                    "actor": "imre"
                  },
                  {
                    "type": "say",
                    "text": "\"Now that,\" says Imre, hauling himself up on the oar, \"is the first sensible thing anybody from the Board has said to me in twenty years.\""
                  }
                ]
              }
            ]
          },
          "menu": {
            "say": "{if lit}\"Well done,\" says Imre.{else}{if task}\"Well?\" says Imre. \"That lamp won't light itself.\"{else}\"Well?\" says Imre.{/if}{/if}",
            "options": [
              {
                "text": "What happened to the light?",
                "go": "light"
              },
              {
                "text": "Are you badly hurt?",
                "go": "hurt",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "How is the ankle?",
                "go": "ankle",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  }
                ]
              },
              {
                "text": "What can I do?",
                "go": "task",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Tell me again what I need to do.",
                "go": "remind",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "lit",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Here, lean on this oar.",
                "end": true,
                "effects": [
                  {
                    "type": "fireEvent",
                    "event": "imreUp"
                  }
                ],
                "when": [
                  {
                    "type": "has",
                    "item": "oar"
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Come on. I'll get you home to your stove.",
                "end": true,
                "when": [
                  {
                    "type": "var",
                    "name": "imreAtTower",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ],
                "effects": [
                  {
                    "type": "setVar",
                    "name": "imreAtTower",
                    "value": false
                  },
                  {
                    "type": "follow",
                    "actor": "imre"
                  },
                  {
                    "type": "say",
                    "text": "\"Now that,\" says Imre, hauling himself up on the oar, \"is the first sensible thing anybody from the Board has said to me in twenty years.\""
                  }
                ]
              }
            ]
          },
          "light": {
            "say": "\"Mal Corvane happened. Him and his brother run brandy and worse in from the French side, and they want the Teeth dark so they can slip in under the cliff at night with no one the wiser. Mal came up for a cup of tea on Tuesday, all smiles, and told me to mind the lamp and not the beach. Next night my oil was gone. Then the flags. So I came down here to see where they hide it, and the rocks had my ankle.\"",
            "options": [
              {
                "text": "What happened to the light?",
                "go": "light"
              },
              {
                "text": "Are you badly hurt?",
                "go": "hurt",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "How is the ankle?",
                "go": "ankle",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  }
                ]
              },
              {
                "text": "What can I do?",
                "go": "task",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Tell me again what I need to do.",
                "go": "remind",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "lit",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Here, lean on this oar.",
                "end": true,
                "effects": [
                  {
                    "type": "fireEvent",
                    "event": "imreUp"
                  }
                ],
                "when": [
                  {
                    "type": "has",
                    "item": "oar"
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Come on. I'll get you home to your stove.",
                "end": true,
                "when": [
                  {
                    "type": "var",
                    "name": "imreAtTower",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ],
                "effects": [
                  {
                    "type": "setVar",
                    "name": "imreAtTower",
                    "value": false
                  },
                  {
                    "type": "follow",
                    "actor": "imre"
                  },
                  {
                    "type": "say",
                    "text": "\"Now that,\" says Imre, hauling himself up on the oar, \"is the first sensible thing anybody from the Board has said to me in twenty years.\""
                  }
                ]
              }
            ]
          },
          "hurt": {
            "say": "\"Broken, or near enough. I could hobble out of here if I had something to lean on. An oar would do. There's a rack of them in my lean-to, behind the cottage.\"",
            "options": [
              {
                "text": "What happened to the light?",
                "go": "light"
              },
              {
                "text": "Are you badly hurt?",
                "go": "hurt",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "How is the ankle?",
                "go": "ankle",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  }
                ]
              },
              {
                "text": "What can I do?",
                "go": "task",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Tell me again what I need to do.",
                "go": "remind",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "lit",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Here, lean on this oar.",
                "end": true,
                "effects": [
                  {
                    "type": "fireEvent",
                    "event": "imreUp"
                  }
                ],
                "when": [
                  {
                    "type": "has",
                    "item": "oar"
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Come on. I'll get you home to your stove.",
                "end": true,
                "when": [
                  {
                    "type": "var",
                    "name": "imreAtTower",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ],
                "effects": [
                  {
                    "type": "setVar",
                    "name": "imreAtTower",
                    "value": false
                  },
                  {
                    "type": "follow",
                    "actor": "imre"
                  },
                  {
                    "type": "say",
                    "text": "\"Now that,\" says Imre, hauling himself up on the oar, \"is the first sensible thing anybody from the Board has said to me in twenty years.\""
                  }
                ]
              }
            ]
          },
          "ankle": {
            "say": "\"Worse for the walking,\" says Imre. \"Never mind it.\"",
            "options": [
              {
                "text": "What happened to the light?",
                "go": "light"
              },
              {
                "text": "Are you badly hurt?",
                "go": "hurt",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "How is the ankle?",
                "go": "ankle",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  }
                ]
              },
              {
                "text": "What can I do?",
                "go": "task",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Tell me again what I need to do.",
                "go": "remind",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "lit",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Here, lean on this oar.",
                "end": true,
                "effects": [
                  {
                    "type": "fireEvent",
                    "event": "imreUp"
                  }
                ],
                "when": [
                  {
                    "type": "has",
                    "item": "oar"
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Come on. I'll get you home to your stove.",
                "end": true,
                "when": [
                  {
                    "type": "var",
                    "name": "imreAtTower",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ],
                "effects": [
                  {
                    "type": "setVar",
                    "name": "imreAtTower",
                    "value": false
                  },
                  {
                    "type": "follow",
                    "actor": "imre"
                  },
                  {
                    "type": "say",
                    "text": "\"Now that,\" says Imre, hauling himself up on the oar, \"is the first sensible thing anybody from the Board has said to me in twenty years.\""
                  }
                ]
              }
            ]
          },
          "task": {
            "say": "\"Light the lamp. Corvane's lugger comes in on tonight's tide, and the Larkspur is due round the point from Amble with forty souls aboard, and both of them will be looking for my light to tell them where the Teeth are.\" {if keyFound}He sees the brass key in your hand. \"And you've found my hatch key. Good. The cord snapped when I fell. Now, fill a can from one of these barrels.{else}He gropes at his neck and swears. \"And my hatch key's gone. The cord snapped when I went down out there on the rocks. It'll be in one of the pools, if the sea hasn't had it. Find it, and fill a can from one of these barrels.{/if} It's my oil, and I'll not be lectured about evidence. And the lens will want a wipe; it smoked something terrible the last night I lit it.\"",
            "effects": [
              {
                "type": "setVar",
                "name": "task",
                "value": true
              }
            ],
            "options": [
              {
                "text": "What happened to the light?",
                "go": "light"
              },
              {
                "text": "Are you badly hurt?",
                "go": "hurt",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "How is the ankle?",
                "go": "ankle",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  }
                ]
              },
              {
                "text": "What can I do?",
                "go": "task",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Tell me again what I need to do.",
                "go": "remind",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "lit",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Here, lean on this oar.",
                "end": true,
                "effects": [
                  {
                    "type": "fireEvent",
                    "event": "imreUp"
                  }
                ],
                "when": [
                  {
                    "type": "has",
                    "item": "oar"
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Come on. I'll get you home to your stove.",
                "end": true,
                "when": [
                  {
                    "type": "var",
                    "name": "imreAtTower",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ],
                "effects": [
                  {
                    "type": "setVar",
                    "name": "imreAtTower",
                    "value": false
                  },
                  {
                    "type": "follow",
                    "actor": "imre"
                  },
                  {
                    "type": "say",
                    "text": "\"Now that,\" says Imre, hauling himself up on the oar, \"is the first sensible thing anybody from the Board has said to me in twenty years.\""
                  }
                ]
              }
            ]
          },
          "remind": {
            "say": "\"{if keyFound}{else}Find my key, in the pools out on the rocks. {/if}{if lampOiled}{else}{if oilFetched}Get that oil up the tower{else}Fill a can with oil, from Corvane's barrels{/if}, through the hatch, and into the lamp. {/if}{if lensClean}{else}Wipe the lens. {/if}Light it. And look sharp about it, {name}{if dusk >= 1}: it's getting dark out there{/if}.\"",
            "options": [
              {
                "text": "What happened to the light?",
                "go": "light"
              },
              {
                "text": "Are you badly hurt?",
                "go": "hurt",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "How is the ankle?",
                "go": "ankle",
                "when": [
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true
                  }
                ]
              },
              {
                "text": "What can I do?",
                "go": "task",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Tell me again what I need to do.",
                "go": "remind",
                "when": [
                  {
                    "type": "var",
                    "name": "task",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "lit",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Here, lean on this oar.",
                "end": true,
                "effects": [
                  {
                    "type": "fireEvent",
                    "event": "imreUp"
                  }
                ],
                "when": [
                  {
                    "type": "has",
                    "item": "oar"
                  },
                  {
                    "type": "var",
                    "name": "imreFree",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ]
              },
              {
                "text": "Come on. I'll get you home to your stove.",
                "end": true,
                "when": [
                  {
                    "type": "var",
                    "name": "imreAtTower",
                    "op": "is",
                    "value": true
                  },
                  {
                    "type": "var",
                    "name": "imreHome",
                    "op": "is",
                    "value": true,
                    "not": true
                  }
                ],
                "effects": [
                  {
                    "type": "setVar",
                    "name": "imreAtTower",
                    "value": false
                  },
                  {
                    "type": "follow",
                    "actor": "imre"
                  },
                  {
                    "type": "say",
                    "text": "\"Now that,\" says Imre, hauling himself up on the oar, \"is the first sensible thing anybody from the Board has said to me in twenty years.\""
                  }
                ]
              }
            ]
          }
        }
      }
    }
  },
  "verbs": {
    "light": {
      "name": "light",
      "patterns": [
        "light [thing]",
        "light [thing] with [carried]",
        "ignite [thing]",
        "kindle [thing]",
        "strike [thing]"
      ],
      "reply": "That is not something you can light.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lantern"
            }
          ],
          "effects": [
            {
              "type": "command",
              "text": "turn on lantern"
            }
          ],
          "instead": true
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lamp"
            }
          ],
          "effects": [
            {
              "type": "command",
              "text": "turn on lamp"
            }
          ],
          "instead": true
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "matchbox"
            }
          ],
          "effects": [
            {
              "type": "say",
              "text": "You strike a match. It flares, burns down to your fingers, and goes out. Better save them for something that matters."
            }
          ],
          "instead": true
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "stove"
            }
          ],
          "effects": [
            {
              "type": "say",
              "text": "There is no time for that. The lamp matters more than your cold hands."
            }
          ],
          "instead": true
        }
      ]
    },
    "fill": {
      "name": "fill / pour",
      "patterns": [
        "fill [thing]",
        "fill [thing] from [thing]",
        "fill [thing] at [thing]",
        "fill [thing] with [thing]",
        "refill [thing]",
        "pour [carried] into [thing]",
        "pour [carried] in [thing]",
        "pour [carried]",
        "pour [carried] on [thing]",
        "empty [carried]",
        "empty [carried] into [thing]",
        "fill lamp with oil",
        "pour oil"
      ],
      "reply": "There is nothing to fill that with here.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "oilCan"
            },
            {
              "type": "inRoom",
              "room": "cave"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "move",
              "thing": "oilCan",
              "to": ""
            },
            {
              "type": "move",
              "thing": "fullCan",
              "to": "player"
            },
            {
              "type": "setVar",
              "name": "oilFetched",
              "value": true
            },
            {
              "type": "say",
              "text": "You hold the can under the open barrel and tip it. Paraffin glugs out, cold and stinking, until the can is heavy and full. You stopper it with your thumb and wipe your hands on your coat, which will never be the same."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "oilCan"
            },
            {
              "type": "inRoom",
              "room": "cave",
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "There is nothing here to fill it from. The drums in the store are bone dry."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lamp"
            },
            {
              "type": "has",
              "item": "fullCan"
            },
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "oilLamp"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "fullCan"
            },
            {
              "type": "otherIs",
              "thing": "lamp"
            },
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "oilLamp"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "fullCan"
            },
            {
              "type": "inRoom",
              "room": "lampRoom"
            },
            {
              "type": "otherIs",
              "thing": "lamp",
              "not": true
            },
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "oilLamp"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "fullCan"
            },
            {
              "type": "inRoom",
              "room": "lampRoom",
              "not": true
            },
            {
              "type": "otherIs",
              "thing": "lamp",
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "The can is full already, and you would be pouring away the only lamp oil you know of. Save it for the lamp."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "emptyTin"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Not with paraffin. Pilot would never forgive you."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pilchards"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "It is full of pilchards already."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lamp"
            },
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "It is full already."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lamp"
            },
            {
              "type": "has",
              "item": "fullCan",
              "not": true
            },
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You have nothing to fill it with. The lamp burns paraffin, and there is none left on the island that you know of."
            }
          ]
        }
      ]
    },
    "clean": {
      "name": "clean",
      "patterns": [
        "clean [thing]",
        "clean [thing] with [carried]",
        "polish [thing]",
        "polish [thing] with [carried]",
        "wipe [thing]",
        "wipe [thing] with [carried]",
        "rub [thing]"
      ],
      "reply": "Cleaning that will not help anybody.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lens"
            },
            {
              "type": "has",
              "item": "cloth"
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "setVar",
              "name": "lensClean",
              "value": true
            },
            {
              "type": "say",
              "text": "You climb inside the lens and work round it prism by prism with the chamois, breathing on the glass and wiping, until the soot is gone and the whole great hive of it is clear as water and full of your own small reflections."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lens"
            },
            {
              "type": "has",
              "item": "cloth",
              "not": true
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You try your sleeve and only smear the soot about. You need a proper cloth for glass like this."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "lens"
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "It is as clean as it is ever going to be."
            }
          ]
        }
      ]
    },
    "give": {
      "name": "give / feed",
      "patterns": [
        "give [carried] to [thing]",
        "offer [carried] to [thing]",
        "feed [thing]",
        "feed [carried] to [thing]",
        "feed [thing] [carried]"
      ],
      "reply": "Nobody here seems to want that.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pilchards"
            },
            {
              "type": "otherIs",
              "thing": "pilot"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "feedCat"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pilot"
            },
            {
              "type": "has",
              "item": "pilchards"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "feedCat"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pilot"
            },
            {
              "type": "has",
              "item": "pilchards",
              "not": true
            },
            {
              "type": "var",
              "name": "catFed",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Pilot looks at your empty hands, and then at you, with contempt."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pilot"
            },
            {
              "type": "var",
              "name": "catFed",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Pilot has eaten, thank you, and is not a glutton."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "oar"
            },
            {
              "type": "otherIs",
              "thing": "imre"
            },
            {
              "type": "var",
              "name": "imreFree",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "imreUp"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "letter"
            },
            {
              "type": "otherIs",
              "thing": "ottoline"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Ottoline reads it, upside down, and hands it back. \"Very nice,\" she says."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "letter"
            },
            {
              "type": "otherIs",
              "thing": "imre"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "\"I know who you are,\" says Imre. \"Put it away and get on.\""
            }
          ]
        }
      ]
    },
    "lean": {
      "name": "lean (for Imre)",
      "patterns": [
        "lean"
      ],
      "reply": "You lean against the nearest thing. It does not help.",
      "rules": [
        {
          "when": [
            {
              "type": "inRoom",
              "room": "cave"
            },
            {
              "type": "has",
              "item": "oar"
            },
            {
              "type": "var",
              "name": "imreFree",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "imreUp"
            }
          ]
        }
      ]
    },
    "pull": {
      "name": "pull aside",
      "patterns": [
        "look behind [thing]",
        "go behind [thing]",
        "reach behind [thing]",
        "reach into [thing]",
        "reach in [thing]",
        "feel in [thing]",
        "put hand in [thing]",
        "pull [thing]",
        "pull [thing] aside",
        "pull aside [thing]",
        "move [thing]",
        "move [thing] aside",
        "lift [thing]",
        "part [thing]",
        "push [thing]",
        "push [thing] aside",
        "push aside [thing]"
      ],
      "reply": "It will not budge.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "weed"
            },
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "revealCave"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "weed"
            },
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "It is already held aside, hooked over a knob of rock."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "cliff"
            },
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "revealCave"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pools"
            },
            {
              "type": "var",
              "name": "keyFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "fireEvent",
              "event": "findKey"
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "bed"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Behind the curtain: the bed, made up tight as a ship's bunk, and not slept in."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pools"
            },
            {
              "type": "var",
              "name": "keyFound",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Nothing else down there but anemones, and they object."
            }
          ]
        }
      ]
    },
    "shout": {
      "name": "shout",
      "patterns": [
        "shout",
        "call",
        "yell",
        "shout for [thing]",
        "call for [thing]",
        "shout imre",
        "call imre",
        "call out"
      ],
      "reply": "You shout. Only the gulls answer.",
      "rules": [
        {
          "when": [
            {
              "type": "inRoom",
              "room": "teeth"
            },
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You shout Imre's name. From very close by (from inside the cliff, surely) a voice shouts back something unrepeatable. It seems to come from behind the hanging weed."
            }
          ]
        },
        {
          "when": [
            {
              "type": "inRoom",
              "room": "teeth"
            },
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "\"In here!\" from the cave. \"And bring a light, whoever you are!\""
            }
          ]
        },
        {
          "when": [
            {
              "type": "inRoom",
              "room": "cave"
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Your voice booms round the cave. \"Over here,\" says a hoarse voice out of the dark. \"And for pity's sake, bring a light.\""
            }
          ]
        },
        {
          "when": [
            {
              "type": "inRoom",
              "room": "cave"
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Your voice booms round the cave. \"There's no need for that,\" says Imre."
            }
          ]
        }
      ]
    },
    "tap": {
      "name": "tap / knock",
      "patterns": [
        "tap [thing]",
        "knock [thing]",
        "knock on [thing]",
        "rap [thing]",
        "rap on [thing]"
      ],
      "reply": "You tap it. Nothing happens.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "barometer"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You tap the glass. The needle shivers, and stays at CHANGE."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "drums"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Hollow, every one. Bong, bong, bong."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "cottageDoor"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "You knock. Inside, a cat says something indignant. Nobody else answers."
            }
          ]
        }
      ]
    },
    "pet": {
      "name": "pet",
      "patterns": [
        "pet [thing]",
        "stroke [thing]",
        "pat [thing]",
        "scratch [thing]",
        "cuddle [thing]",
        "hug [thing]"
      ],
      "reply": "That would be strange.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pilot"
            },
            {
              "type": "var",
              "name": "catFed",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Pilot flattens his ears and lets you know, in detail, that affection is not what he is short of."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "pilot"
            },
            {
              "type": "var",
              "name": "catFed",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Pilot leans into your hand and purrs like a donkey engine."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "imre"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Imre gives you a look that would strip paint."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "ottoline"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "Ottoline raises one eyebrow, and you think better of it."
            }
          ]
        }
      ]
    },
    "jump": {
      "name": "jump",
      "patterns": [
        "jump",
        "jump off [thing]",
        "jump over [thing]",
        "jump in [thing]",
        "jump into [thing]",
        "leap"
      ],
      "reply": "You jump on the spot. It does not help, but it warms you up.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "railing"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "There is a railing, and then a great deal of air, and then the sea. No."
            }
          ]
        },
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "sea"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "The water is cold enough to stop your heart. No."
            }
          ]
        }
      ]
    },
    "breakIt": {
      "name": "break",
      "patterns": [
        "break [thing]",
        "break [thing] with [carried]",
        "smash [thing]",
        "force [thing]",
        "force [thing] with [carried]",
        "kick [thing]",
        "hit [thing]"
      ],
      "reply": "Violence would not help.",
      "rules": [
        {
          "when": [
            {
              "type": "thingIs",
              "thing": "hatch"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "The hatch is two inches of oak and the padlock is good brass. Imre will have a key somewhere."
            }
          ]
        }
      ]
    },
    "swim": {
      "name": "swim",
      "patterns": [
        "swim",
        "swim in [thing]",
        "wade",
        "dive"
      ],
      "reply": "The water here is cold enough to stop your heart, and the tide is running hard. No."
    },
    "sleep": {
      "name": "sleep",
      "patterns": [
        "sleep",
        "nap",
        "rest"
      ],
      "reply": "Not with the light out."
    },
    "signal": {
      "name": "signal",
      "patterns": [
        "signal",
        "wave",
        "wave at [thing]",
        "raise flags",
        "hoist flags",
        "fly flags"
      ],
      "reply": "Nobody is looking at this island except to wonder why it is dark. The light is the signal that matters."
    },
    "hint": {
      "name": "hint",
      "patterns": [
        "hint",
        "hints",
        "clue",
        "clues"
      ],
      "reply": "Explore, read what there is to read, and talk to people.",
      "rules": [
        {
          "when": [
            {
              "type": "var",
              "name": "readLog",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(The keeper keeps a log. It will be in the tower, up the stairs: try READ LOG.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "readLog",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(Imre went down to the Teeth, at the south end of the strand. Look closely at the cliff there, or try SHOUT.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "switchIs",
              "thing": "lantern",
              "state": "on",
              "not": true
            },
            {
              "type": "has",
              "item": "matchbox"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(The cave is pitch dark. The log mentions a storm lantern in the lean-to behind the cottage. LIGHT LANTERN.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "switchIs",
              "thing": "lantern",
              "state": "on",
              "not": true
            },
            {
              "type": "has",
              "item": "matchbox",
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(The cave is pitch dark: you need the storm lantern from the lean-to, and something to light it with. There are matches in the cottage, under a hungry cat.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "caveFound",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "switchIs",
              "thing": "lantern",
              "state": "on"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(Take your lit lantern into the cave and talk to whoever is in there.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "metImre",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "task",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(Ask Imre what you can do.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "task",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "keyFound",
              "op": "is",
              "value": true,
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(Imre lost his hatch key in the rock pools on the Teeth: SEARCH POOLS.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "task",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "keyFound",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "has",
              "item": "fullCan",
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(You need oil. There is a can on the shelf in the oil store by the tower; FILL CAN in the cave.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "task",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "keyFound",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "has",
              "item": "fullCan"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(Take the oil up the tower. UNLOCK HATCH WITH KEY in the watch room, go up, then FILL LAMP.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "has",
              "item": "cloth",
              "not": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(The lens is sooty. The chamois cloth on the bench at the foot of the tower would clean it: CLEAN LENS.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true,
              "not": true
            },
            {
              "type": "has",
              "item": "cloth"
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(The lens is sooty, and you have a cloth: CLEAN LENS.)"
            }
          ]
        },
        {
          "when": [
            {
              "type": "var",
              "name": "lampOiled",
              "op": "is",
              "value": true
            },
            {
              "type": "var",
              "name": "lensClean",
              "op": "is",
              "value": true
            }
          ],
          "instead": true,
          "effects": [
            {
              "type": "say",
              "text": "(LIGHT LAMP. You will need the matches.)"
            }
          ]
        }
      ]
    }
  },
  "events": {
    "revealCave": {
      "name": "The cave is found",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "setDoor",
          "thing": "caveMouth",
          "state": "shown"
        },
        {
          "type": "setVar",
          "name": "caveFound",
          "value": true
        },
        {
          "type": "say",
          "text": "You drag the odd curtain of weed aside and hook it over a knob of rock. Behind it is not more rock but darkness: a tall cleft in the cliff, just wide enough to walk into. A cold breath comes out of it, smelling powerfully of paraffin. And from somewhere inside, a voice says, \"About time.\""
        }
      ]
    },
    "findKey": {
      "name": "The key is found",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "move",
          "thing": "hatchKey",
          "to": "player"
        },
        {
          "type": "setVar",
          "name": "keyFound",
          "value": true
        },
        {
          "type": "say",
          "text": "You roll up your sleeve and plunge your arm into the deepest pool. The cold is astonishing. Your fingers close on a cord, and you draw up a brass key on a snapped lanyard, streaming water.{if task} Imre's hatch key.{/if}"
        }
      ]
    },
    "oilLamp": {
      "name": "The lamp is filled",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "move",
          "thing": "fullCan",
          "to": ""
        },
        {
          "type": "move",
          "thing": "oilCan",
          "to": "player"
        },
        {
          "type": "setVar",
          "name": "lampOiled",
          "value": true
        },
        {
          "type": "say",
          "text": "You unscrew the cap of the reservoir and pour, slowly, so as not to spill a drop, until the paraffin stands at the brim. The empty can is light again in your hand."
        }
      ]
    },
    "feedCat": {
      "name": "Pilot is fed",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "move",
          "thing": "pilchards",
          "to": ""
        },
        {
          "type": "move",
          "thing": "emptyTin",
          "to": "cottage"
        },
        {
          "type": "setVar",
          "name": "catFed",
          "value": true
        },
        {
          "type": "follow",
          "actor": "pilot"
        },
        {
          "type": "say",
          "text": "You prise open the tin (it takes some doing) and set it on the floor. Pilot is off the table before it touches the boards. He eats with the concentration of a professional, washes his face very thoroughly, and then, having decided you will do, falls in at your heels."
        }
      ]
    },
    "imreUp": {
      "name": "Imre gets up",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "move",
          "thing": "oar",
          "to": ""
        },
        {
          "type": "setVar",
          "name": "imreFree",
          "value": true
        },
        {
          "type": "follow",
          "actor": "imre"
        },
        {
          "type": "say",
          "text": "You hand Imre the oar. He gets it under his arm and hauls himself upright with a word your mother would not like."
        }
      ]
    },
    "hatchUnlocked": {
      "name": "The hatch is unlocked",
      "when": [
        {
          "type": "doorIs",
          "thing": "hatch",
          "state": "unlocked"
        }
      ],
      "effects": [
        {
          "type": "setVar",
          "name": "hatchOpened",
          "value": true
        }
      ]
    },
    "ottolineSeesImre": {
      "name": "Ottoline sees Imre pass",
      "when": [
        {
          "type": "var",
          "name": "imreFree",
          "op": "is",
          "value": true
        },
        {
          "type": "var",
          "name": "imreHome",
          "op": "is",
          "value": true,
          "not": true
        },
        {
          "type": "inRoom",
          "room": "causeway"
        },
        {
          "type": "thingIn",
          "thing": "imre",
          "where": "causeway"
        }
      ],
      "effects": [
        {
          "type": "setVar",
          "name": "ottolineSawImre",
          "value": true
        },
        {
          "type": "say",
          "text": "Ottoline drops her basket. \"Imre Vass, you great fool,\" she says, and her voice is not quite steady. Imre says something back that makes her laugh out loud."
        }
      ]
    },
    "imreAtTower": {
      "name": "Imre stops at the stairs",
      "when": [
        {
          "type": "var",
          "name": "imreFree",
          "op": "is",
          "value": true
        },
        {
          "type": "var",
          "name": "imreHome",
          "op": "is",
          "value": true,
          "not": true
        },
        {
          "type": "var",
          "name": "imreAtTower",
          "op": "is",
          "value": true,
          "not": true
        },
        {
          "type": "thingIn",
          "thing": "imre",
          "where": "towerBase"
        }
      ],
      "once": false,
      "effects": [
        {
          "type": "stopFollowing",
          "actor": "imre"
        },
        {
          "type": "setVar",
          "name": "imreAtTower",
          "value": true
        },
        {
          "type": "say",
          "text": "Imre looks up the spiral stair, and then down at his ankle, and lowers himself onto the bottom step. \"Not a hope,\" he says. \"Not with this. I'll sit here and shout encouragement. Go on.\""
        }
      ]
    },
    "imreHome": {
      "name": "Imre gets home",
      "when": [
        {
          "type": "var",
          "name": "imreFree",
          "op": "is",
          "value": true
        },
        {
          "type": "thingIn",
          "thing": "imre",
          "where": "cottage"
        },
        {
          "type": "var",
          "name": "imreHome",
          "op": "is",
          "value": true,
          "not": true
        },
        {
          "type": "var",
          "name": "imreAtTower",
          "op": "is",
          "value": true,
          "not": true
        }
      ],
      "effects": [
        {
          "type": "stopFollowing",
          "actor": "imre"
        },
        {
          "type": "setVar",
          "name": "imreHome",
          "value": true
        },
        {
          "type": "move",
          "thing": "imre",
          "to": "cottage"
        },
        {
          "type": "say",
          "text": "Imre lowers himself into the chair by the stove with a groan of pure relief, and starts feeding it kindling with shaking hands. \"That'll do me,\" he says. \"Go on. The lamp.\""
        }
      ]
    },
    "dusk1": {
      "name": "Sunset",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "setVar",
          "name": "dusk",
          "value": 1
        },
        {
          "type": "say",
          "text": "The sun drops behind the mainland hills. All at once the sea goes the colour of pewter, and the wind has an edge to it."
        }
      ]
    },
    "dusk2": {
      "name": "Dark",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "setVar",
          "name": "dusk",
          "value": 2
        },
        {
          "type": "say",
          "text": "It is dark now. Far out beyond the Teeth, very faint, you think you see a sail, showing no lights at all."
        }
      ]
    },
    "lampLit": {
      "name": "The light is lit (the end)",
      "onlyTriggered": true,
      "effects": [
        {
          "type": "endGame",
          "text": "You strike a match. The wick takes, and the flame climbs white and steady, and the great lens wakes around it: every prism catching fire at once, until the lantern room is too bright to look at, and the beam swings out over the sea like a held breath let go.\n\n{if dusk >= 2}Out past the Teeth, a dark sail that was running straight at the reef heels over hard and claws away to the north. Further out, the riding lights of the Larkspur alter course, unhurried, for the harbour.{else}Out on the grey water the Larkspur's sails catch the beam as she rounds the point, and settle onto her course for the harbour as if nothing had ever been wrong.{/if}\n\n{if imreHome}Down at the cottage, a window lights up too: Imre has the stove going.{else}{if imreAtTower}From far below, at the foot of the stair, comes Imre's voice, hoarse and delighted: \"That's my light! That's my light!\"{else}{if imreFree}Imre, beside you, leaning on his oar and breathing hard from the climb, watches the beam go round. \"That's my light,\" he says.{else}You think of Imre in his cave, watching the beam sweep over the Teeth, and you are sure he is smiling, in his way.{/if}{/if}{/if}{if catFed} Pilot, who has followed you every step of the way, sits in the warm glow of the lamp and washes one paw.{/if}\n\nIn the morning there will be a report to write for the Board, and a word to be had with the Corvanes. But tonight Saltmarrow Light is burning, and {name} lit it."
        }
      ]
    }
  },
  "walkthroughs": {
    "opening": {
      "name": "Opening: lantern lit, cave found",
      "answers": {
        "name": "Wren"
      },
      "steps": [
        {
          "command": "hint",
          "expect": [
            "log"
          ]
        },
        {
          "command": "talk to ottoline",
          "expect": [
            "Took them long enough"
          ]
        },
        {
          "command": "2",
          "expect": [
            "Lights on the Teeth"
          ]
        },
        {
          "command": "leave"
        },
        {
          "command": "n",
          "expect": [
            "Gorse Slope"
          ]
        },
        {
          "command": "n",
          "expect": [
            "Lighthouse Yard"
          ]
        },
        {
          "command": "e",
          "expect": [
            "Oil Store",
            "oil can"
          ]
        },
        {
          "command": "take can",
          "expect": [
            "Taken"
          ]
        },
        {
          "command": "w"
        },
        {
          "command": "n",
          "expect": [
            "chamois cloth"
          ]
        },
        {
          "command": "take cloth",
          "expect": [
            "Taken"
          ]
        },
        {
          "command": "u",
          "expect": [
            "Watch Room"
          ]
        },
        {
          "command": "u",
          "expect": [
            "locked"
          ]
        },
        {
          "command": "read log",
          "expect": [
            "storm lantern is in the lean-to"
          ]
        },
        {
          "command": "hint",
          "expect": [
            "Teeth"
          ]
        },
        {
          "command": "d"
        },
        {
          "command": "s"
        },
        {
          "command": "s"
        },
        {
          "command": "s",
          "expect": [
            "Causeway Head"
          ]
        },
        {
          "command": "e",
          "expect": [
            "Keeper's Cottage",
            "Pilot"
          ]
        },
        {
          "command": "take matches",
          "expect": [
            "not moving"
          ],
          "reject": [
            "Taken"
          ]
        },
        {
          "command": "open cupboard",
          "expect": [
            "tin of pilchards"
          ]
        },
        {
          "command": "take tin",
          "expect": [
            "Taken"
          ]
        },
        {
          "command": "feed cat",
          "expect": [
            "falls in at your heels"
          ],
          "reject": [
            "not a glutton"
          ]
        },
        {
          "command": "take matches",
          "expect": [
            "Taken"
          ]
        },
        {
          "command": "n",
          "expect": [
            "Lean-to",
            "Pilot pads after you"
          ]
        },
        {
          "command": "take lantern",
          "expect": [
            "Taken"
          ]
        },
        {
          "command": "take oar",
          "expect": [
            "Taken"
          ]
        },
        {
          "command": "s",
          "reject": [
            "Pilot pads after you"
          ]
        },
        {
          "command": "w"
        },
        {
          "command": "w",
          "expect": [
            "The Strand",
            "small boat"
          ],
          "reject": [
            "You can also see a dinghy"
          ]
        },
        {
          "command": "search dinghy",
          "expect": [
            "signal flags"
          ]
        },
        {
          "command": "s",
          "expect": [
            "The Teeth"
          ],
          "reject": [
            "cave mouth"
          ]
        },
        {
          "command": "in",
          "expect": [
            "can't go that way"
          ]
        },
        {
          "command": "shout",
          "expect": [
            "behind the hanging weed"
          ]
        },
        {
          "command": "x weed",
          "expect": [
            "hangs oddly"
          ],
          "reject": [
            "tall cleft"
          ]
        },
        {
          "command": "look behind weed",
          "expect": [
            "tall cleft"
          ]
        },
        {
          "command": "in",
          "expect": [
            "pitch dark"
          ],
          "reject": [
            "barrels"
          ]
        },
        {
          "command": "x imre",
          "expect": [
            "can't see"
          ]
        },
        {
          "command": "out"
        },
        {
          "command": "light lantern",
          "expect": [
            "steady yellow glow"
          ]
        }
      ]
    },
    "rescue": {
      "name": "Ending: Imre home, Pilot fed",
      "from": "opening",
      "steps": [
        {
          "command": "in",
          "expect": [
            "barrels",
            "keeper's jersey"
          ]
        },
        {
          "command": "x imre",
          "expect": [
            "Harbour Board?"
          ]
        },
        {
          "command": "3",
          "expect": [
            "hatch key's gone"
          ]
        },
        {
          "command": "ask imre about the oar",
          "expect": [
            "Talking with Imre",
            "lean on this oar"
          ],
          "reject": [
            "step away"
          ]
        },
        {
          "command": "4",
          "expect": [
            "hauls himself upright",
            "After you"
          ]
        },
        {
          "command": "fill can",
          "expect": [
            "heavy and full"
          ]
        },
        {
          "command": "out",
          "expect": [
            "Imre hobbles after you"
          ]
        },
        {
          "command": "hint",
          "expect": [
            "SEARCH POOLS"
          ]
        },
        {
          "command": "search pools",
          "expect": [
            "brass key",
            "hatch key"
          ]
        },
        {
          "command": "n"
        },
        {
          "command": "e",
          "reject": [
            "hobbles after you"
          ]
        },
        {
          "command": "e",
          "expect": [
            "groan of pure relief"
          ]
        },
        {
          "command": "w"
        },
        {
          "command": "n"
        },
        {
          "command": "n"
        },
        {
          "command": "n"
        },
        {
          "command": "u"
        },
        {
          "command": "unlock hatch with key",
          "expect": [
            "unlock"
          ]
        },
        {
          "command": "u",
          "expect": [
            "Lantern Room"
          ]
        },
        {
          "command": "light lamp",
          "expect": [
            "nothing to light"
          ]
        },
        {
          "command": "fill lamp",
          "expect": [
            "brim"
          ]
        },
        {
          "command": "light lamp",
          "expect": [
            "lens needs cleaning"
          ]
        },
        {
          "command": "clean lens",
          "expect": [
            "clear as water"
          ]
        },
        {
          "command": "light lamp",
          "expect": [
            "Imre has the stove going",
            "Pilot",
            "Wren lit it"
          ],
          "reject": [
            "dark sail"
          ]
        }
      ]
    },
    "alone": {
      "name": "Ending: Imre left in the cave, after dark",
      "from": "opening",
      "steps": [
        {
          "command": "search pools",
          "expect": [
            "brass key"
          ],
          "reject": [
            "hatch key"
          ]
        },
        {
          "command": "in"
        },
        {
          "command": "talk to imre"
        },
        {
          "command": "1",
          "expect": [
            "Mal Corvane"
          ]
        },
        {
          "command": "leave",
          "expect": [
            "not be going anywhere"
          ]
        },
        {
          "command": "drop oar",
          "expect": [
            "Dropped"
          ]
        },
        {
          "command": "fill can",
          "expect": [
            "heavy and full"
          ]
        },
        {
          "command": "out"
        },
        {
          "command": "n"
        },
        {
          "command": "e"
        },
        {
          "command": "n"
        },
        {
          "command": "n"
        },
        {
          "command": "n"
        },
        {
          "command": "u"
        },
        {
          "command": "unlock hatch with key"
        },
        {
          "command": "u"
        },
        {
          "command": "fill lamp",
          "expect": [
            "brim"
          ]
        },
        {
          "command": "clean lens",
          "expect": [
            "clear as water"
          ]
        },
        {
          "command": "e",
          "expect": [
            "The Gallery"
          ]
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z"
        },
        {
          "command": "z",
          "expect": [
            "dark now"
          ]
        },
        {
          "command": "look west",
          "expect": [
            "dark sail"
          ]
        },
        {
          "command": "w"
        },
        {
          "command": "light lamp",
          "expect": [
            "dark sail",
            "smiling",
            "Pilot"
          ],
          "reject": [
            "stove going",
            "Lead on"
          ]
        }
      ]
    },
    "stairs": {
      "name": "Ending: Imre waits at the foot of the tower",
      "from": "opening",
      "steps": [
        {
          "command": "in"
        },
        {
          "command": "give oar to imre",
          "expect": [
            "hauls himself upright"
          ],
          "check": [
            {
              "type": "var",
              "name": "imreFree",
              "op": "is",
              "value": true
            }
          ]
        },
        {
          "command": "fill can",
          "expect": [
            "heavy and full"
          ]
        },
        {
          "command": "out",
          "expect": [
            "hobbles after you"
          ]
        },
        {
          "command": "search pools",
          "expect": [
            "brass key"
          ]
        },
        {
          "command": "n"
        },
        {
          "command": "e",
          "expect": [
            "Imre Vass, you great fool"
          ]
        },
        {
          "command": "talk to ottoline",
          "expect": [
            "still smiling"
          ]
        },
        {
          "command": "leave"
        },
        {
          "command": "n"
        },
        {
          "command": "n"
        },
        {
          "command": "n",
          "expect": [
            "Foot of the Tower",
            "Not a hope"
          ],
          "check": [
            {
              "type": "var",
              "name": "imreAtTower",
              "op": "is",
              "value": true
            }
          ]
        },
        {
          "command": "u",
          "expect": [
            "Watch Room"
          ],
          "reject": [
            "Imre"
          ]
        },
        {
          "command": "unlock hatch with key"
        },
        {
          "command": "x hatch",
          "expect": [
            "padlock hangs open"
          ]
        },
        {
          "command": "u"
        },
        {
          "command": "pour oil into lamp",
          "expect": [
            "brim"
          ],
          "reject": [
            "full already"
          ]
        },
        {
          "command": "clean lens"
        },
        {
          "command": "light lamp",
          "expect": [
            "That's my light! That's my light!"
          ],
          "reject": [
            "stove going",
            "smiling"
          ]
        }
      ]
    },
    "oddities": {
      "name": "Things the player might try",
      "answers": {
        "name": "Wren"
      },
      "steps": [
        {
          "command": "s",
          "expect": [
            "morning low tide"
          ]
        },
        {
          "command": "swim",
          "expect": [
            "No."
          ]
        },
        {
          "command": "x sea",
          "expect": [
            "tide is coming in"
          ]
        },
        {
          "command": "take sea",
          "expect": [
            "bigger satchel"
          ]
        },
        {
          "command": "read letter",
          "expect": [
            "Render every assistance",
            "Wren"
          ]
        },
        {
          "command": "look south",
          "expect": [
            "mainland"
          ]
        },
        {
          "command": "n"
        },
        {
          "command": "take glove",
          "expect": [
            "wet through",
            "Taken"
          ]
        },
        {
          "command": "n"
        },
        {
          "command": "x mast",
          "expect": [
            "halyards have been cut"
          ]
        },
        {
          "command": "w",
          "expect": [
            "great deal of air"
          ]
        },
        {
          "command": "n"
        },
        {
          "command": "u"
        },
        {
          "command": "tap barometer",
          "expect": [
            "CHANGE"
          ]
        },
        {
          "command": "sleep",
          "expect": [
            "Not with the light out"
          ]
        },
        {
          "command": "clean desk",
          "expect": [
            "will not help"
          ]
        },
        {
          "command": "light log",
          "expect": [
            "not something you can light"
          ]
        },
        {
          "command": "help",
          "expect": [
            "Type commands"
          ]
        }
      ]
    }
  }
};
