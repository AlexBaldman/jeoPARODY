// Reviewed Season Zero content ported from AlexBaldman/Jeopardish.
// The media-bearing Saturn slot uses its reviewed text-only Sodium standby so
// the first canonical solo session remains deterministic and self-contained.

export const SEASON_ZERO_EPISODE = Object.freeze({
  "schemaVersion": 1,
  "id": "season-zero-001-extra-o",
  "title": "The Extra O Is Not an Accident",
  "description": "A ten-clue pilot broadcast that introduces the learning loop, Xander's suspicious station, and one extra letter that refuses to explain itself.",
  "contentRevision": 2,
  "reviewStatus": "reviewed",
  "episodeLength": 10,
  "provenance": {
    "source": "JeoPARODY editorial",
    "reviewedOn": "2026-07-27",
    "editorialPolicy": "Original clue wording; factual claims checked against the attached primary or institutional sources."
  },
  "finale": {
    "title": "Transmission Decoded",
    "artifactTitle": "BROADCAST O",
    "artifactBody": "The first letters of tonight's responses spell BROADCAST O. The extra O also appears in Station O's sealed records, which is either a clue or an unusually committed typo.",
    "hostLine": "Well, there it is: BROADCAST O. A perfectly normal phrase if you have never encountered language.",
    "teaser": "Next transmission: who authorized Station O, and why was the signature already crossed out?"
  },
  "clues": [
    {
      "id": "s0e1-01-braille",
      "category": "Signals You Can Touch",
      "question": "Its basic cell uses six raised-dot positions in two columns, producing 63 possible nonblank patterns for reading by touch.",
      "answer": "Braille",
      "acceptedAnswers": [
        "the Braille system"
      ],
      "value": 200,
      "explanation": "A standard braille cell has six dot positions arranged in two columns of three. Those positions can form 63 nonblank combinations used for letters, numbers, punctuation, and other symbols.",
      "difficulty": 0.2,
      "tags": [
        "accessibility",
        "language",
        "patterns"
      ],
      "performance": {
        "act": 1,
        "expression": "clue",
        "hostLine": "We begin with a communications system that works even when the studio lights have been repossessed.",
        "storyBeat": "The broadcast introduces coded communication.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-02-rip-current",
      "category": "Beach Intelligence",
      "question": "This narrow, fast-moving flow carries water away from shore; experts advise swimmers caught in one to stay calm and swim parallel to the beach.",
      "answer": "Rip current",
      "acceptedAnswers": [
        "a rip current",
        "rip tide"
      ],
      "value": 200,
      "explanation": "A rip current is a concentrated flow moving away from shore. It does not pull a swimmer underwater; the safest response is to avoid fighting it, float or tread water, and move parallel to shore when possible.",
      "difficulty": 0.25,
      "tags": [
        "ocean",
        "safety",
        "long-beach"
      ],
      "performance": {
        "act": 1,
        "expression": "clue",
        "hostLine": "Long Beach safety now, because a prize budget is no substitute for municipal rescue services.",
        "storyBeat": "The beach setting becomes part of the curriculum.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-03-ozone",
      "category": "Tiny Molecules, Large Responsibilities",
      "question": "Made of three oxygen atoms, this gas in the stratosphere absorbs much of the Sun's harmful ultraviolet radiation.",
      "answer": "Ozone",
      "acceptedAnswers": [
        "O3",
        "O-three"
      ],
      "value": 400,
      "explanation": "Ozone is O3, a molecule made of three oxygen atoms. High in the stratosphere, the ozone layer absorbs most of the Sun's damaging ultraviolet radiation.",
      "difficulty": 0.3,
      "tags": [
        "chemistry",
        "atmosphere",
        "space"
      ],
      "performance": {
        "act": 1,
        "expression": "clue",
        "hostLine": "Three atoms, one atmosphere, and somehow less paperwork than this station requires for a sandwich.",
        "storyBeat": "The recurring letter O begins to feel deliberate.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-04-apollo-11",
      "category": "Very Expensive Footprints",
      "question": "Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon during this 1969 NASA mission.",
      "answer": "Apollo 11",
      "acceptedAnswers": [
        "Apollo Eleven",
        "the Apollo 11 mission"
      ],
      "value": 400,
      "explanation": "Apollo 11 carried Neil Armstrong, Buzz Aldrin, and Michael Collins to the Moon in July 1969. Armstrong and Aldrin landed in the lunar module Eagle while Collins remained in lunar orbit.",
      "difficulty": 0.18,
      "tags": [
        "space",
        "history",
        "engineering"
      ],
      "performance": {
        "act": 2,
        "expression": "clue",
        "hostLine": "Humanity reached the Moon before this network learned to label its extension cords.",
        "storyBeat": "Act two widens the broadcast from Earth to space.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-05-denmark",
      "category": "Rotten Geography",
      "question": "In Shakespeare's Hamlet, Marcellus locates a famous odor of political corruption in this kingdom.",
      "answer": "Denmark",
      "acceptedAnswers": [
        "the Kingdom of Denmark"
      ],
      "value": 600,
      "explanation": "After Hamlet follows the ghost, Marcellus says that something is rotten in the state of Denmark. The line signals that the kingdom's political and moral order has decayed.",
      "difficulty": 0.35,
      "tags": [
        "literature",
        "shakespeare",
        "mystery"
      ],
      "performance": {
        "act": 2,
        "expression": "reveal",
        "hostLine": "A rotten state. Completely unrelated to the station's accounting department, which is more of a province.",
        "storyBeat": "Xander denies a parallel nobody mentioned.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-06-canada",
      "category": "Coasts With the Most",
      "question": "Measured along its vast mainland and island shores, this country has the world's longest coastline.",
      "answer": "Canada",
      "acceptedAnswers": [
        "the nation of Canada"
      ],
      "value": 600,
      "explanation": "Canada has the longest coastline of any country because its territory includes an enormous mainland shore and thousands of islands bordering the Atlantic, Pacific, and Arctic oceans.",
      "difficulty": 0.28,
      "tags": [
        "geography",
        "canada",
        "ocean"
      ],
      "performance": {
        "act": 2,
        "expression": "clue",
        "hostLine": "A Canadian question. I have been advised this establishes warmth without creating legal obligations.",
        "storyBeat": "The host's oddly defensive Canadian identity enters the foreground.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-07-ada-lovelace",
      "category": "Code Before Computers",
      "question": "Her notes on Charles Babbage's Analytical Engine included a published procedure for calculating Bernoulli numbers, often called the first computer program.",
      "answer": "Ada Lovelace",
      "acceptedAnswers": [
        "Augusta Ada King",
        "Countess of Lovelace",
        "Lady Lovelace"
      ],
      "value": 800,
      "explanation": "Ada Lovelace's 1843 notes on the proposed Analytical Engine included a detailed method for calculating Bernoulli numbers. It is widely described as the first published computer algorithm.",
      "difficulty": 0.42,
      "tags": [
        "computing",
        "history",
        "mathematics"
      ],
      "performance": {
        "act": 3,
        "expression": "clue",
        "hostLine": "A program written before the computer existed, the traditional relationship between software schedules and hardware reality.",
        "storyBeat": "Act three turns toward systems, authorship, and hidden instructions.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-standby-sodium",
      "category": "Emergency Elements",
      "question": "Atomic number 11 and the symbol Na identify this soft, highly reactive metal found most commonly in compounds such as table salt.",
      "answer": "Sodium",
      "acceptedAnswers": [
        "the element sodium",
        "Na"
      ],
      "value": 800,
      "explanation": "Sodium is element 11, represented by the symbol Na. The pure metal reacts vigorously with water, so sodium occurs naturally in compounds rather than as an uncombined metal.",
      "difficulty": 0.32,
      "tags": [
        "chemistry",
        "standby",
        "media-fallback"
      ],
      "performance": {
        "act": 3,
        "expression": "clue",
        "hostLine": "The picture department has left the building, so chemistry will now be portraying Saturn.",
        "storyBeat": "A text-only standby preserves the episode when media cannot air.",
        "standbyFor": "s0e1-08-saturn"
      }
    },
    {
      "id": "s0e1-09-transcontinental-railroad",
      "category": "A Country Says Done",
      "question": "A golden spike at Promontory Summit in 1869 ceremonially completed this rail link between the eastern and western United States.",
      "answer": "Transcontinental Railroad",
      "acceptedAnswers": [
        "the First Transcontinental Railroad",
        "Pacific Railroad"
      ],
      "value": 1000,
      "explanation": "On May 10, 1869, the Union Pacific and Central Pacific railroads met at Promontory Summit in Utah. The Golden Spike ceremony marked completion of the first transcontinental railroad.",
      "difficulty": 0.48,
      "tags": [
        "history",
        "transportation",
        "united-states"
      ],
      "performance": {
        "act": 3,
        "expression": "reveal",
        "hostLine": "The nation joined both coasts and immediately began arguing over who had packed the good sandwiches.",
        "storyBeat": "Connections now carry both achievement and consequence.",
        "standbyFor": null
      }
    },
    {
      "id": "s0e1-10-ocean",
      "category": "The Blue Majority",
      "question": "Covering roughly 71 percent of Earth's surface, this connected body contains about 97 percent of the planet's water.",
      "answer": "Ocean",
      "acceptedAnswers": [
        "the ocean",
        "world ocean",
        "global ocean",
        "oceans"
      ],
      "value": 1000,
      "explanation": "The ocean covers about 71 percent of Earth's surface and holds roughly 97 percent of Earth's water. Although people name separate oceans, they form one connected global body of salt water.",
      "difficulty": 0.2,
      "tags": [
        "earth-science",
        "ocean",
        "finale"
      ],
      "performance": {
        "act": 3,
        "expression": "streak",
        "hostLine": "Seventy-one percent of the planet, yet management insists the beach view is a premium feature.",
        "storyBeat": "The response completes the hidden phrase BROADCAST O.",
        "standbyFor": null
      }
    }
  ]
});

export default SEASON_ZERO_EPISODE;
