// Written by the story editor (npm start, then /kit/editor/). Edit it there.
export default {
  "game": {
    "title": "yuriful-tba",
    "intro": "Your father's illness has kept him from the Duke's hall tonight, so the invitation, and the duty, have passed to you.\n\nThe Duke's daughter makes her debut this evening. You rank high enough to be here, and low enough that nobody will be watching you.\n\n(Type HELP for a list of commands. You can interact directly with the map)",
    "questions": [
      {
        "var": "pname",
        "label": "Your name"
      },
      {
        "var": "phouse",
        "label": "Your house"
      }
    ],
    "start": {
      "room": "location1"
    },
    "player": {
      "description": "{pname}, of House {phouse}. You are dressed well enough to belong here, and plainly enough not to be remembered.",
      "nouns": [
        "me",
        "myself",
        "self",
        "yourself"
      ]
    }
  },
  "actors": {
    "guests": {
      "name": "crowd",
      "article": "the",
      "nouns": [
        "crowd",
        "people",
        "everyone",
        "nobles",
        "courtiers"
      ],
      "adjectives": [],
      "description": "Nobles of every rank, most of them grander than you. You recognise a few faces; few of them recognise yours.",
      "scenery": true,
      "talk": "TODO: conversation isn't built yet.",
      "marker": "group",
      "place": {
        "room": "hall"
      },
      "notes": "",
      "conversation": null
    },
    "wineGroup": {
      "name": "guests by the wine table",
      "article": "the",
      "nouns": [
        "group",
        "guests",
        "party"
      ],
      "adjectives": [
        "wine"
      ],
      "description": "TODO: describe the guests by the wine table.",
      "marker": "group",
      "place": {
        "room": "hall",
        "x": 15,
        "y": 50
      },
      "notes": "",
      "conversation": {
        "start": "opening",
        "again": "rejoin",
        "leave": "",
        "nodes": {
          "opening": {
            "say": "TODO: what the guests by the wine table say when you join them.",
            "options": [
              {
                "text": "TODO: first reply.",
                "go": "reply1"
              },
              {
                "text": "TODO: second reply.",
                "go": "reply2"
              }
            ],
            "pos": {
              "x": 24,
              "y": 24
            }
          },
          "reply1": {
            "say": "TODO: their answer to the first reply.",
            "options": [
              {
                "text": "TODO: follow-up question.",
                "go": "opening"
              }
            ],
            "pos": {
              "x": 314,
              "y": 24
            }
          },
          "reply2": {
            "say": "TODO: their answer to the second reply.",
            "options": [
              {
                "text": "TODO: an action instead of words (this one looks around the room).",
                "effects": [
                  {
                    "type": "command",
                    "text": "look"
                  }
                ]
              }
            ],
            "pos": {
              "x": 314,
              "y": 214
            }
          },
          "rejoin": {
            "say": "TODO: what the guests by the wine table say when you come back.",
            "options": [
              {
                "text": "TODO: first reply.",
                "go": "reply1"
              }
            ],
            "pos": {
              "x": 24,
              "y": 214
            }
          }
        }
      }
    },
    "pastryGroup": {
      "name": "guests by the pastry table",
      "article": "the",
      "nouns": [
        "group",
        "guests",
        "party"
      ],
      "adjectives": [
        "pastry"
      ],
      "description": "TODO: describe the guests by the pastry table.",
      "marker": "group",
      "place": {
        "room": "hall",
        "x": 84,
        "y": 56
      },
      "notes": "",
      "conversation": {
        "start": "opening",
        "again": "rejoin",
        "leave": "",
        "nodes": {
          "opening": {
            "say": "TODO: what the guests by the pastry table say when you join them.",
            "options": [
              {
                "text": "TODO: first reply.",
                "go": "reply1"
              },
              {
                "text": "TODO: second reply.",
                "go": "reply2"
              }
            ],
            "pos": {
              "x": 24,
              "y": 24
            }
          },
          "reply1": {
            "say": "TODO: their answer to the first reply.",
            "options": [
              {
                "text": "TODO: follow-up question.",
                "go": "opening"
              }
            ],
            "pos": {
              "x": 314,
              "y": 24
            }
          },
          "reply2": {
            "say": "TODO: their answer to the second reply.",
            "options": [
              {
                "text": "TODO: an action instead of words (this one looks around the room).",
                "effects": [
                  {
                    "type": "command",
                    "text": "look"
                  }
                ]
              }
            ],
            "pos": {
              "x": 314,
              "y": 214
            }
          },
          "rejoin": {
            "say": "TODO: what the guests by the pastry table say when you come back.",
            "options": [
              {
                "text": "TODO: first reply.",
                "go": "reply1"
              }
            ],
            "pos": {
              "x": 24,
              "y": 214
            }
          }
        }
      }
    },
    "balconyGroup": {
      "name": "guests on the south balcony",
      "article": "the",
      "nouns": [
        "group",
        "guests",
        "party"
      ],
      "adjectives": [
        "balcony",
        "south"
      ],
      "description": "TODO: describe the guests on the south balcony.",
      "marker": "group",
      "place": {
        "room": "southBalcony",
        "x": 34,
        "y": 55
      },
      "notes": "",
      "conversation": {
        "start": "opening",
        "again": "rejoin",
        "leave": "",
        "nodes": {
          "opening": {
            "say": "TODO: what the guests on the south balcony say when you join them.",
            "options": [
              {
                "text": "TODO: first reply.",
                "go": "reply1"
              },
              {
                "text": "TODO: second reply.",
                "go": "reply2"
              }
            ],
            "pos": {
              "x": 24,
              "y": 24
            }
          },
          "reply1": {
            "say": "TODO: their answer to the first reply.",
            "options": [
              {
                "text": "TODO: follow-up question.",
                "go": "opening"
              }
            ],
            "pos": {
              "x": 314,
              "y": 24
            }
          },
          "reply2": {
            "say": "TODO: their answer to the second reply.",
            "options": [
              {
                "text": "TODO: an action instead of words (this one looks around the room).",
                "effects": [
                  {
                    "type": "command",
                    "text": "look"
                  }
                ]
              }
            ],
            "pos": {
              "x": 314,
              "y": 214
            }
          },
          "rejoin": {
            "say": "TODO: what the guests on the south balcony say when you come back.",
            "options": [
              {
                "text": "TODO: first reply.",
                "go": "reply1"
              }
            ],
            "pos": {
              "x": 24,
              "y": 214
            }
          }
        }
      }
    },
    "actor1": {
      "name": "Entrance Guards",
      "article": "the",
      "nouns": [
        "guards",
        "security"
      ],
      "adjectives": [
        "sharp",
        "well dressed",
        "alert."
      ],
      "description": "Two of the Duke's men, barring entry to any undesirables who don't belong.",
      "marker": "person",
      "place": {
        "room": "location1",
        "x": 20,
        "y": 9
      },
      "notes": "",
      "conversation": {
        "start": "start",
        "nodes": {
          "start": {
            "say": "Halt! Who approaches the Duke's estate",
            "options": [
              {
                "text": "I am {pname} of House {phouse}, sent on behalf of my sick father to attend tonight's festivities.",
                "when": [],
                "effects": [],
                "go": "line1"
              }
            ],
            "effects": [],
            "pos": {
              "x": 24,
              "y": 24
            }
          },
          "line1": {
            "say": "a {phouse} eh? You ever hear of that? Some minor house out in the sticks?\n\nSeems like it. but what business do you have at the Duke's manor on such an occasion? Present some documentation or be gone with ye.",
            "options": [
              {
                "text": "Here you are. (hand over the invitation)",
                "when": [
                  {
                    "type": "has",
                    "item": "invitation"
                  }
                ],
                "effects": [
                  {
                    "type": "move",
                    "thing": "invitation"
                  }
                ],
                "go": "line2"
              }
            ],
            "pos": {
              "x": 314,
              "y": 24
            },
            "effects": []
          },
          "line2": {
            "say": "Well I'll be... everything seems to be in order. Carry on, and don't cause any trouble little lord.",
            "options": [],
            "pos": {
              "x": 604,
              "y": 24
            },
            "effects": [
              {
                "type": "fireEvent",
                "event": "Gate"
              }
            ]
          }
        }
      }
    },
    "actor2": {
      "name": "The Duke",
      "article": "the",
      "nouns": [
        "duke"
      ],
      "adjectives": [],
      "description": "The Duke of the castle, hosting the debut of his precious daughter in his Castle.",
      "marker": "person",
      "place": {
        "room": "hall",
        "x": 50,
        "y": 8
      },
      "notes": "",
      "conversation": {
        "start": "start",
        "nodes": {
          "start": {
            "say": "Congratulations you! You win the game!",
            "options": [
              {
                "text": "Yippee!",
                "when": [],
                "effects": [
                  {
                    "type": "endGame"
                  }
                ]
              },
              {
                "text": "Nah",
                "when": [],
                "effects": [
                  {
                    "type": "endGame"
                  }
                ]
              }
            ],
            "effects": [],
            "pos": {
              "x": 24,
              "y": 24
            }
          }
        }
      }
    }
  },
  "events": {
    "Gate": {
      "name": "Gateopen",
      "notes": "",
      "when": [],
      "effects": [
        {
          "type": "setDoor",
          "state": "unlocked",
          "thing": "entrance"
        }
      ],
      "onlyTriggered": true
    }
  },
  "locations": {
    "hall": {
      "title": "Receiving Hall",
      "name": "Receiving Hall",
      "nouns": [
        "hall",
        "room"
      ],
      "adjectives": [
        "receiving",
        "great"
      ],
      "description": "The castle's receiving hall runs long and rectangular from the entrance at your back to a double staircase at the far north end, its two flights curving up to meet at a landing. Doors are set into the walls on either side, two to the west and two to the east. Tables laid with refreshments and decorations stand scattered across the floor, and guests in their finery drift between them under the chandeliers.",
      "smell": "Beeswax, wine and too many perfumes at once.",
      "listen": "Conversation, a hundred voices at once, and somewhere above, musicians tuning.",
      "size": {
        "w": 100,
        "h": 70
      },
      "arriveNear": "entrance",
      "listExits": false,
      "refuse": {
        "w": "There are two doors in the west wall: the northwest door and the southwest door.",
        "e": "There are two doors in the east wall: the northeast door and the southeast door."
      },
      "ambient": {
        "chance": 20,
        "lines": [
          "Somewhere above, musicians tune their strings.",
          "A footman passes with a tray of fresh glasses.",
          "Laughter rises from a knot of guests near the stairs.",
          "The chandeliers sway slightly in a draught from the doors."
        ]
      },
      "notes": "",
      "overlooks": [
        "northBalcony",
        "southBalcony"
      ]
    },
    "northBalcony": {
      "title": "North Balcony",
      "name": "north balcony",
      "nouns": [
        "balcony"
      ],
      "adjectives": [
        "north",
        "northern",
        "first"
      ],
      "description": "TODO: describe the north balcony.",
      "size": {
        "w": 60,
        "h": 70
      },
      "floor": {
        "x": 4,
        "y": 4,
        "w": 52,
        "h": 22
      },
      "style": "balcony",
      "wallSide": "w",
      "views": [
        {
          "room": "southBalcony",
          "x": 4,
          "y": 44,
          "w": 52,
          "h": 22
        }
      ],
      "overlooks": [
        "southBalcony"
      ],
      "arriveNear": "neDoor",
      "listExits": false,
      "notes": ""
    },
    "southBalcony": {
      "title": "South Balcony",
      "name": "south balcony",
      "nouns": [
        "balcony"
      ],
      "adjectives": [
        "south",
        "southern",
        "second"
      ],
      "description": "TODO: describe the south balcony.",
      "size": {
        "w": 60,
        "h": 70
      },
      "floor": {
        "x": 4,
        "y": 44,
        "w": 52,
        "h": 22
      },
      "style": "balcony",
      "wallSide": "w",
      "views": [
        {
          "room": "northBalcony",
          "x": 4,
          "y": 4,
          "w": 52,
          "h": 22
        }
      ],
      "overlooks": [
        "northBalcony"
      ],
      "arriveNear": "seDoor",
      "listExits": false,
      "notes": ""
    },
    "location1": {
      "title": "The Gates",
      "name": "",
      "nouns": [],
      "adjectives": [],
      "description": "",
      "size": {
        "w": 40,
        "h": 60
      },
      "notes": "",
      "refuse": {},
      "views": []
    }
  },
  "passages": {
    "entrance": {
      "kind": "door",
      "name": "Gate",
      "nouns": [
        "entrance",
        "archway",
        "doorway",
        "arch",
        "gate"
      ],
      "adjectives": [
        "ornate",
        "reinforced",
        "grandiose"
      ],
      "description": "The looming gates of the Duke's castle. The irons look heavy, you won't be able to get past by yourself.",
      "blocked": "You've only just arrived. Leaving before the Duke's daughter is presented would be noticed, and remembered.",
      "a": {
        "room": "location1",
        "dir": "n",
        "wall": "n",
        "pos": 49
      },
      "b": {
        "room": "hall",
        "dir": "s",
        "wall": "s",
        "pos": 50,
        "also": [
          "out"
        ],
        "len": 14
      },
      "locked": true,
      "oneWay": true
    },
    "staircase": {
      "kind": "stairs",
      "name": "double staircase",
      "nouns": [
        "staircase",
        "stairs",
        "stair",
        "steps",
        "flights",
        "landing"
      ],
      "adjectives": [
        "double",
        "grand",
        "stone"
      ],
      "description": "Two flights of pale stone curve up from either side of the far end and meet at a landing above. TODO: the upper floor isn't built yet.",
      "blocked": "TODO: the upper floor isn't built yet.",
      "a": {
        "room": "hall",
        "dir": "u",
        "wall": "n",
        "pos": 50,
        "also": [
          "n"
        ],
        "box": {
          "x": 30,
          "y": 5,
          "w": 40,
          "h": 15
        }
      },
      "b": null
    },
    "nwDoor": {
      "kind": "door",
      "name": "northwest door",
      "nouns": [
        "door",
        "doors"
      ],
      "adjectives": [
        "northwest",
        "nw",
        "west",
        "far",
        "left"
      ],
      "description": "A tall oak door in the west wall, near the staircase.",
      "locked": true,
      "blocked": "TODO: the room beyond this door isn't built yet.",
      "a": {
        "room": "hall",
        "dir": "nw",
        "wall": "w",
        "pos": 29
      },
      "b": null
    },
    "swDoor": {
      "kind": "door",
      "name": "southwest door",
      "nouns": [
        "door",
        "doors"
      ],
      "adjectives": [
        "southwest",
        "sw",
        "west",
        "near",
        "left"
      ],
      "description": "A tall oak door in the west wall, near the entrance.",
      "locked": true,
      "blocked": "TODO: the room beyond this door isn't built yet.",
      "a": {
        "room": "hall",
        "dir": "sw",
        "wall": "w",
        "pos": 71
      },
      "b": null
    },
    "neDoor": {
      "kind": "door",
      "name": "northeast door",
      "nouns": [
        "door",
        "doors"
      ],
      "adjectives": [
        "northeast",
        "ne",
        "east",
        "far",
        "right"
      ],
      "description": "A tall oak door in the east wall, near the staircase.",
      "a": {
        "room": "hall",
        "dir": "ne",
        "wall": "e",
        "pos": 29
      },
      "b": {
        "room": "northBalcony",
        "dir": "w",
        "wall": "w",
        "pos": 50,
        "also": [
          "in"
        ]
      }
    },
    "seDoor": {
      "kind": "door",
      "name": "southeast door",
      "nouns": [
        "door",
        "doors"
      ],
      "adjectives": [
        "southeast",
        "se",
        "east",
        "near",
        "right"
      ],
      "description": "A tall oak door in the east wall, near the entrance.",
      "a": {
        "room": "hall",
        "dir": "se",
        "wall": "e",
        "pos": 71
      },
      "b": {
        "room": "southBalcony",
        "dir": "w",
        "wall": "w",
        "pos": 50,
        "also": [
          "in"
        ]
      }
    },
    "passage1": {
      "kind": "passage",
      "name": "right hallway",
      "nouns": [],
      "adjectives": [],
      "description": "",
      "a": {
        "room": "hall",
        "pos": 87,
        "wall": "n"
      },
      "b": null
    },
    "passage2": {
      "kind": "passage",
      "name": "left hallway",
      "nouns": [],
      "adjectives": [],
      "description": "",
      "a": {
        "room": "hall",
        "pos": 16,
        "wall": "n"
      },
      "b": null
    }
  },
  "layout": {
    "hall": {
      "x": 300,
      "y": 167
    },
    "northBalcony": {
      "x": 558,
      "y": 48
    },
    "southBalcony": {
      "x": 677,
      "y": 304
    },
    "location1": {
      "x": 48,
      "y": 176
    }
  },
  "objects": {
    "chandeliers": {
      "name": "chandeliers",
      "article": "some",
      "nouns": [
        "chandeliers",
        "chandelier",
        "candles",
        "lights",
        "ceiling"
      ],
      "adjectives": [],
      "description": "Three chandeliers, each holding more candles than you could count before they gutter.",
      "in": "hall",
      "notes": "",
      "scenery": true,
      "fixed": true,
      "fixedText": "They hang well out of reach."
    },
    "decorations": {
      "name": "decorations",
      "article": "some",
      "nouns": [
        "decorations",
        "decoration",
        "banners",
        "banner",
        "garlands",
        "garland",
        "ribbons"
      ],
      "adjectives": [],
      "description": "Banners hang between the windows, and garlands of greenery are wound along the banisters.",
      "in": "hall",
      "notes": "",
      "scenery": true
    },
    "wineTable": {
      "name": "wine table",
      "article": "",
      "nouns": [
        "table",
        "tables"
      ],
      "adjectives": [
        "wine",
        "refreshment",
        "long",
        "linen"
      ],
      "description": "A long table draped in linen, near the west wall.",
      "in": "hall",
      "notes": "",
      "scenery": true,
      "supporter": true,
      "shape": {
        "x": 17,
        "y": 29,
        "w": 16,
        "h": 6
      }
    },
    "glassOfWine": {
      "name": "glass of wine",
      "article": "",
      "nouns": [
        "glass",
        "wine",
        "drink",
        "goblet"
      ],
      "adjectives": [
        "wine",
        "full"
      ],
      "description": "A glass of something red and expensive.",
      "in": "wineTable",
      "notes": "",
      "drinkable": true,
      "becomes": "emptyGlass",
      "drunkText": "You drink the wine. It's better than anything your family's cellar has held in years."
    },
    "emptyGlass": {
      "name": "empty glass",
      "article": "",
      "nouns": [
        "glass",
        "goblet"
      ],
      "adjectives": [
        "empty"
      ],
      "description": "An empty wine glass.",
      "in": "",
      "notes": ""
    },
    "pastryTable": {
      "name": "pastry table",
      "article": "",
      "nouns": [
        "table",
        "tables"
      ],
      "adjectives": [
        "pastry",
        "cake",
        "refreshment"
      ],
      "description": "A table laden with platters of small cakes, near the east wall.",
      "in": "hall",
      "notes": "",
      "scenery": true,
      "supporter": true,
      "shape": {
        "x": 66,
        "y": 38,
        "w": 16,
        "h": 6
      }
    },
    "honeyCake": {
      "name": "honey cake",
      "article": "",
      "nouns": [
        "cake",
        "pastry",
        "pastries"
      ],
      "adjectives": [
        "honey",
        "small"
      ],
      "description": "A small round cake, glazed with honey.",
      "in": "pastryTable",
      "notes": "",
      "edible": true,
      "eatenText": "You eat the honey cake in two bites, and brush the crumbs from your sleeve before anyone notices."
    },
    "flowerTable": {
      "name": "flower table",
      "article": "",
      "nouns": [
        "table",
        "tables"
      ],
      "adjectives": [
        "flower",
        "decorated",
        "round",
        "middle",
        "centre",
        "center"
      ],
      "description": "A round table in the middle of the floor, given over entirely to decoration.",
      "in": "hall",
      "notes": "",
      "scenery": true,
      "supporter": true,
      "shape": {
        "x": 43,
        "y": 34,
        "w": 13,
        "h": 10,
        "round": true
      }
    },
    "centerpiece": {
      "name": "centrepiece",
      "article": "",
      "nouns": [
        "centrepiece",
        "centerpiece",
        "arrangement",
        "flowers"
      ],
      "adjectives": [
        "flower",
        "tall"
      ],
      "description": "A tall arrangement of white lilies and greenery.",
      "in": "flowerTable",
      "notes": "",
      "scenery": true,
      "fixed": true,
      "fixedText": "It's far too big to carry, and it would definitely be missed.",
      "smell": "Lilies, heavy and sweet."
    },
    "lily": {
      "name": "lily",
      "article": "",
      "nouns": [
        "lily",
        "flower"
      ],
      "adjectives": [
        "white",
        "single",
        "loose"
      ],
      "description": "A single white lily that has worked loose from the arrangement.",
      "in": "flowerTable",
      "notes": "",
      "wearable": true,
      "wornText": "You tuck the lily into your buttonhole.",
      "smell": "Heavy and sweet."
    },
    "invitation": {
      "name": "invitation",
      "article": "",
      "nouns": [
        "invitation",
        "card",
        "letter"
      ],
      "adjectives": [
        "gilt",
        "gilded"
      ],
      "description": "A card of heavy cream stock, edged in gilt.",
      "in": "player",
      "notes": "",
      "readText": "The invitation is addressed to your father. Below his name, in a different hand, someone has added: 'or a member of his house.'"
    },
    "ring": {
      "name": "signet ring",
      "article": "",
      "nouns": [
        "ring",
        "signet"
      ],
      "adjectives": [
        "signet",
        "fathers"
      ],
      "description": "Your father's signet ring, heavy and a little loose on your finger. It's the reason the footmen let you in.",
      "in": "player",
      "notes": "",
      "wearable": true,
      "worn": true
    }
  },
  "areas": {
    "area1": {
      "name": "The Castle",
      "parent": ""
    }
  },
  "areaOf": {
    "hall": "area1",
    "northBalcony": "area1",
    "southBalcony": "area1"
  }
};
