import type {
  CityCluster,
  ContextTag,
  Emotion,
  MapCityCluster,
  RelatedCitySuggestion,
  StoryEntry,
  StoryMatchResult,
} from '../types/story'
import { emotionOptions } from '../types/story'

export const emotionLabels: Record<Emotion, string> = {
  homesick: 'Homesick',
  pressure: 'Pressure',
  lonely: 'Lonely',
  identity: 'Identity',
  hope: 'Hope',
}

export const contextLabels: Record<ContextTag, string> = {
  student: 'Student',
  'new-city': 'New city',
  'family-duty': 'Family duty',
  'work-pressure': 'Work pressure',
  'distance-from-home': 'Far from home',
}

export const defaultEntry =
  "I feel like I'm doing everything right and still falling apart."

export const stories: StoryEntry[] = [
  {
    id: 'nyc-pressure-1',
    city: 'New York',
    country: 'United States',
    areaLabel: 'Long Island City',
    postalHint: '11101',
    lat: 40.7447,
    lng: -73.9485,
    emotion: 'pressure',
    contextTags: ['student', 'family-duty', 'distance-from-home'],
    themes: ['performing okayness', 'family sacrifice', 'private unraveling'],
    resonanceHints: ['sounding strong on the phone', 'falling apart after the call', 'gratitude turning into pressure'],
    excerpt:
      'I keep sounding steady on the phone and then unraveling the second the call ends.',
    fullText:
      "Everyone back home says I sound strong, so I keep sounding strong. Then the room goes quiet and I can hear how tired I really am. I know why I came here. I know how many people helped me get here. Some nights that gratitude turns into pressure so heavy it feels like another person sitting on my chest.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'I want to talk with someone who knows what duty can do to the body.',
  },
  {
    id: 'nyc-identity-1',
    city: 'New York',
    country: 'United States',
    areaLabel: 'Jackson Heights',
    postalHint: '11372',
    lat: 40.7557,
    lng: -73.8831,
    emotion: 'identity',
    contextTags: ['new-city', 'distance-from-home'],
    themes: ['split self', 'translation fatigue', 'belonging in pieces'],
    resonanceHints: ['switching voices all day', "not knowing which voice is mine", 'explaining life like subtitles'],
    excerpt:
      "I switch voices all day and by night I can't tell which one is mine.",
    fullText:
      "At work I am quick and polished. On video calls home I soften everything so no one worries. With friends here I explain my life like subtitles. Some days I can feel the split happening in real time. It is not dramatic. It is just tiring to belong in pieces.",
    language: 'English + Nepali',
    year: 2024,
    openToChat: false,
    chatPrompt: 'I need a conversation where I do not have to translate myself first.',
  },
  {
    id: 'london-homesick-1',
    city: 'London',
    country: 'United Kingdom',
    areaLabel: 'Wembley',
    postalHint: 'HA9',
    lat: 51.556,
    lng: -0.279,
    emotion: 'homesick',
    contextTags: ['student', 'distance-from-home'],
    themes: ['missing home sounds', 'body homesickness', 'loud city loneliness'],
    resonanceHints: ['missing the silence of ghar', 'pressure cooker whistles', 'homesickness living in the body'],
    excerpt: 'I miss the version of silence that belongs to ghar.',
    fullText:
      "London is loud in a way that somehow still leaves me alone. I miss the familiar sounds of home: pressure cooker whistles, the lane outside, someone calling my name without warning. Here everything is efficient and no one knows the shape of my day. I did not realize homesickness could live in the body like weather.",
    language: 'English + Nepali',
    year: 2024,
    openToChat: true,
    chatPrompt: 'If you know what it means to miss ghar in your body, I would listen.',
  },
  {
    id: 'london-pressure-1',
    city: 'London',
    country: 'United Kingdom',
    areaLabel: 'Canary Wharf',
    postalHint: 'E14',
    lat: 51.5054,
    lng: -0.0235,
    emotion: 'pressure',
    contextTags: ['work-pressure', 'family-duty'],
    themes: ['performing okayness', 'success pressure', 'confession getting harder'],
    resonanceHints: ['the more stable I look', 'barely keeping up', 'success making confession harder'],
    excerpt:
      'The more stable I look, the harder it becomes to admit I am barely keeping up.',
    fullText:
      "My paychecks look like progress from far away. People hear that I am in London and fill in the rest of the story for themselves. I do not want to ruin that image, so I keep performing okayness even when my body is begging me to stop. The strange part is that success can make confession harder.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'I want to talk with someone who is tired of performing okayness.',
  },
  {
    id: 'toronto-lonely-1',
    city: 'Toronto',
    country: 'Canada',
    areaLabel: 'Parkdale',
    postalHint: 'M6K',
    lat: 43.6404,
    lng: -79.4369,
    emotion: 'lonely',
    contextTags: ['new-city', 'distance-from-home'],
    themes: ['crowded loneliness', 'ordinary witness', 'small-moment emptiness'],
    resonanceHints: ['around people and still alone', 'cold train platforms', 'needing one place not to explain'],
    excerpt:
      'I am always around people and still somehow carrying every hard thing alone.',
    fullText:
      "I have classmates, coworkers, roommates, and a city full of noise outside. Still, loneliness keeps finding me in the smallest moments: grocery aisles, cold train platforms, the walk home after everyone else has somewhere to be. I do not need a crowd. I just need one place where I do not have to explain why this feels hard.",
    language: 'English',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I could use a quiet conversation with someone who understands this kind of loneliness.',
  },
  {
    id: 'toronto-hope-1',
    city: 'Toronto',
    country: 'Canada',
    areaLabel: 'North York',
    postalHint: 'M2N',
    lat: 43.7615,
    lng: -79.4111,
    emotion: 'hope',
    contextTags: ['student', 'new-city'],
    themes: ['small practical hope', 'one honest sentence', 'staying with yourself'],
    resonanceHints: ['hope getting smaller and more practical', 'opening the curtain', 'not leaving yourself alone'],
    excerpt:
      'Nothing got easier all at once. I just learned that one honest sentence can keep a day from collapsing.',
    fullText:
      "I used to think hope had to feel big. These days it feels smaller and more practical. It is eating, texting back, opening the curtain, telling one friend the real version instead of the polished one. Maybe hope is not brightness. Maybe it is just not leaving yourself alone with the whole weight of it.",
    language: 'English',
    year: 2023,
    openToChat: true,
    chatPrompt: 'If your hope is small and practical right now, I think we could talk.',
  },
  {
    id: 'doha-family-duty-1',
    city: 'Doha',
    country: 'Qatar',
    areaLabel: 'Al Sadd',
    postalHint: 'Zone 38',
    lat: 25.2858,
    lng: 51.5073,
    emotion: 'pressure',
    contextTags: ['work-pressure', 'family-duty'],
    themes: ['useful and absent', 'distance guilt', 'sending money home'],
    resonanceHints: ['send money home', 'useful and absent at once', 'transfer receipt cannot hold enough'],
    excerpt:
      'I send money home and still feel guilty for every day I am not physically there.',
    fullText:
      "Work is exhausting, but the harder part is the distance. When something happens at home, I feel how little a transfer receipt can actually hold. I am helping, yes, but I am also missing birthdays, hospital visits, arguments, ordinary evenings. It is a strange life to be useful and absent at the same time.",
    language: 'English',
    year: 2024,
    openToChat: true,
    chatPrompt: 'I want to talk with someone who understands being useful and absent at once.',
  },
  {
    id: 'melbourne-hope-1',
    city: 'Melbourne',
    country: 'Australia',
    areaLabel: 'Carlton',
    postalHint: '3053',
    lat: -37.8005,
    lng: 144.9668,
    emotion: 'hope',
    contextTags: ['distance-from-home', 'new-city'],
    themes: ['first honest conversation', 'room created by honesty', 'surviving without disappearing'],
    resonanceHints: ['the first time I told the truth', 'nothing broke', 'honesty made room'],
    excerpt:
      'The first time I told the truth, nothing broke. That changed more than advice ever did.',
    fullText:
      "I kept waiting for honesty to create damage. Instead it made room. My aunt still loves me. My friend did not think less of me. The problem was never that I was too much; it was that I had been carrying too much alone. I still struggle, but I do not disappear inside it the way I used to.",
    language: 'English',
    year: 2023,
    openToChat: true,
    chatPrompt: 'If you need a first honest conversation, I would meet you there.',
  },
  {
    id: 'sydney-homesick-1',
    city: 'Sydney',
    country: 'Australia',
    areaLabel: 'Parramatta',
    postalHint: '2150',
    lat: -33.815,
    lng: 151.0011,
    emotion: 'homesick',
    contextTags: ['student', 'distance-from-home'],
    themes: ['gratitude and sadness', 'silence in bidesh', 'not knowing where to put sadness'],
    resonanceHints: ['feeling lucky and lonely at once', 'not knowing where to put sadness', 'becoming fluent in silence'],
    excerpt:
      'I can explain the city to everyone back home, but I still have not found where to put my own sadness in it.',
    fullText:
      "Sydney is bright and open and everyone says I should feel lucky here. I do feel lucky. That is part of the problem. It is hard to speak about loneliness when gratitude is sitting beside it, asking you to be quieter. I think a lot of us in bidesh become fluent in silence before we realize it.",
    language: 'English + Nepali',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I want to hear from someone who understands how gratitude and sadness can live together.',
  },
  {
    id: 'boston-pressure-1',
    city: 'Boston',
    country: 'United States',
    areaLabel: 'Allston',
    postalHint: '02134',
    lat: 42.3539,
    lng: -71.1328,
    emotion: 'pressure',
    contextTags: ['student', 'family-duty'],
    themes: ['earned rest', 'ambition sounding like fear', 'carrying sacrifice into deadlines'],
    resonanceHints: ['rest feeling earned', 'ambition sounding like fear', 'parents sacrifice in every deadline'],
    excerpt:
      'I keep treating rest like something I have to earn from people who are not even in the room.',
    fullText:
      "The deadline is never just the deadline. It is also my parents' sacrifice, my younger cousins watching, and every version of me that promised I would make it worth it. I am learning that pressure can sound like ambition when everyone else is praising it. Inside the body, though, it feels much more like fear.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'If your ambition has started sounding like fear, I would talk with you.',
  },
  {
    id: 'dallas-work-1',
    city: 'Dallas',
    country: 'United States',
    areaLabel: 'Irving',
    postalHint: '75039',
    lat: 32.8913,
    lng: -96.9587,
    emotion: 'lonely',
    contextTags: ['work-pressure', 'distance-from-home'],
    themes: ['ordinary witness', 'adult loneliness', 'small talk fatigue'],
    resonanceHints: ['no ordinary witness to my life', 'building life where no one knew me', 'conversation that does not start with small talk'],
    excerpt:
      'The hardest part is having no ordinary witness to my life here.',
    fullText:
      "People ask how work is going and I can answer that. What I cannot answer quickly is how strange it feels to build a whole life somewhere no one has known you since childhood. There is no effortless version of me here. Some days I would trade all the networking in the world for one walk with someone who already knows my silences.",
    language: 'English',
    year: 2024,
    openToChat: false,
    chatPrompt: 'I want a conversation that does not start with small talk.',
  },
  {
    id: 'lisbon-identity-1',
    city: 'Lisbon',
    country: 'Portugal',
    areaLabel: 'Arroios',
    postalHint: '1170',
    lat: 38.7297,
    lng: -9.1359,
    emotion: 'identity',
    contextTags: ['new-city', 'distance-from-home'],
    themes: ['reinvention grief', 'freedom and loneliness', 'growing versus translating'],
    resonanceHints: ['reinvention made me lonely', 'freedom can feel beautiful and lonely', 'tired of translating myself'],
    excerpt:
      'I wanted reinvention. I did not expect how much grief could hide inside it.',
    fullText:
      "Moving gave me room to become someone new, but it also took away the people who could recognize me without explanation. Freedom can feel beautiful and lonely at the same time. I am still figuring out which parts of me changed because I grew, and which parts changed because I got tired of translating myself.",
    language: 'English',
    year: 2023,
    openToChat: true,
    chatPrompt: 'If reinvention has also made you lonely, I think we would understand each other.',
  },
  {
    id: 'nyc-homesick-1',
    city: 'New York',
    country: 'United States',
    areaLabel: 'Astoria',
    postalHint: '11105',
    lat: 40.7727,
    lng: -73.9309,
    emotion: 'homesick',
    contextTags: ['student', 'distance-from-home'],
    themes: ['missing home rituals', 'kitchen sounds in memory', 'living between seasons'],
    resonanceHints: ['Dashain without home', 'pressure cooker whistle at night', 'voice notes as a bridge'],
    excerpt:
      'I miss the sounds my apartment in Queens can never learn to make.',
    fullText:
      "Astoria is full of good food and bright windows, but it still cannot replace the small sounds I grew up with. I miss Dashain in a kitchen that already knew my hands, the pressure cooker whistle, my mother calling from another room, even the ordinary scolding that meant I was home. Some homesickness is not dramatic. It is just a way the body keeps reaching for a life that is no longer around it.",
    language: 'English + Nepali',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I want to talk about missing home in a way that starts with the body.',
  },
  {
    id: 'nyc-lonely-1',
    city: 'New York',
    country: 'United States',
    areaLabel: 'Flushing',
    postalHint: '11354',
    lat: 40.7675,
    lng: -73.8331,
    emotion: 'lonely',
    contextTags: ['new-city', 'distance-from-home'],
    themes: ['crowded invisibility', 'community without witness', 'small talk fatigue'],
    resonanceHints: ['Nepali crowd and still alone', 'one person who knows my name', 'be in a room without performing'],
    excerpt:
      'There are people all around me, and still no ordinary witness to my days.',
    fullText:
      "Flushing has enough Nepali voices that I sometimes hear home in the street, and that makes the loneliness feel stranger, not smaller. I can buy the right tea, find the right groceries, and still go home feeling untouched by anyone. What I miss most is not company. It is one person who already knows my silence and does not ask me to perform it for them.",
    language: 'English + Nepali',
    year: 2024,
    openToChat: true,
    chatPrompt: 'I am looking for a quiet conversation with someone who knows this kind of loneliness.',
  },
  {
    id: 'london-identity-1',
    city: 'London',
    country: 'United Kingdom',
    areaLabel: 'Southall',
    postalHint: 'UB1',
    lat: 51.5093,
    lng: -0.3776,
    emotion: 'identity',
    contextTags: ['family-duty', 'distance-from-home'],
    themes: ['code switching', 'belonging in layers', 'softening for home'],
    resonanceHints: ['which version of me is home', 'Nepali at home, foreign outside', 'changing faces by room'],
    excerpt:
      'I am Nepali in one room, polished and foreign in the next, and tired in both.',
    fullText:
      "In Southall I hear enough Nepali around me that I feel close to home and far from myself at the same time. At work I am crisp and efficient. At home I soften my voice so my family will not worry. Even my jokes change shape depending on the room. I do not think I am fake. I think I am tired of carrying so many versions of me without a place to set them down.",
    language: 'English + Nepali',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I need a conversation where I do not have to translate myself first.',
  },
  {
    id: 'london-hope-1',
    city: 'London',
    country: 'United Kingdom',
    areaLabel: 'Hounslow',
    postalHint: 'TW3',
    lat: 51.4677,
    lng: -0.3652,
    emotion: 'hope',
    contextTags: ['student', 'new-city'],
    themes: ['tiny honest routines', 'room after confession', 'hope that is not loud'],
    resonanceHints: ['one honest sentence', 'nothing fixed but something opened', 'mornings are lighter'],
    excerpt:
      'I do not feel cured. I just feel less hidden than I did last month.',
    fullText:
      "Some days hope is just opening the curtain, answering the message, and telling one trusted person the version of the day that is not polished. Hounslow taught me that nothing needs to become perfect for the room to get a little lighter. I still carry the hard things, but I carry them with more air around them now.",
    language: 'English',
    year: 2024,
    openToChat: true,
    chatPrompt: 'If your hope is small and practical right now, I think we could talk.',
  },
  {
    id: 'toronto-pressure-1',
    city: 'Toronto',
    country: 'Canada',
    areaLabel: 'Scarborough',
    postalHint: 'M1P',
    lat: 43.7765,
    lng: -79.2318,
    emotion: 'pressure',
    contextTags: ['student', 'family-duty'],
    themes: ['tuition and sacrifice', 'deadlines as debt', 'trying not to waste opportunity'],
    resonanceHints: ['tuition paid with borrowed time', 'deadlines sound like debt', 'rest feels like a luxury'],
    excerpt:
      'Every deadline feels like it has my parents standing behind it.',
    fullText:
      "Scarborough is where I learned that pressure can wear a polite face. I know the money spent on my education was not small. I know people are watching. So even when I am exhausted, I keep moving like rest is something I must earn. The trouble is that the more I try not to waste the opportunity, the more every deadline starts sounding like debt.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'I want to talk with someone who knows what tuition and sacrifice can do to the body.',
  },
  {
    id: 'toronto-homesick-1',
    city: 'Toronto',
    country: 'Canada',
    areaLabel: 'Markham',
    postalHint: 'L3R',
    lat: 43.8561,
    lng: -79.3302,
    emotion: 'homesick',
    contextTags: ['distance-from-home', 'new-city'],
    themes: ['family kitchen memory', 'suburban quiet homesickness', 'calling home after midnight'],
    resonanceHints: ['the smell of home cooking', 'my parents old kitchen', 'quiet can be cruel'],
    excerpt:
      'I can hear my family when I call home, but I still cannot smell the kitchen.',
    fullText:
      "Markham is quiet in a way that gives homesickness too much room. I can call home, I can hear everyone's voice, I can even laugh at the right moments. Still, when the call ends, the apartment feels unfinished. What I miss is not only people. It is the smell of home cooking, the noise of the kitchen, the sense that my life belonged to more than this one room.",
    language: 'English + Nepali',
    year: 2024,
    openToChat: false,
    chatPrompt: 'I want to talk about the kind of homesickness that survives a phone call.',
  },
  {
    id: 'melbourne-lonely-1',
    city: 'Melbourne',
    country: 'Australia',
    areaLabel: 'Footscray',
    postalHint: '3011',
    lat: -37.8004,
    lng: 144.8996,
    emotion: 'lonely',
    contextTags: ['new-city', 'distance-from-home'],
    themes: ['night shifts and silence', 'no ordinary witness', 'walking home with no one waiting'],
    resonanceHints: ['after the train leaves', 'nobody to witness the small things', 'one walk with no explanation'],
    excerpt:
      'Some nights I feel like I am only visible to the checkout light and the train window.',
    fullText:
      "Footscray has movement in it, but the kind that can still leave you unseen. I finish work, ride the train, walk home, and realize there was not a single person in the whole evening who knew what kind of day I was carrying. I do not need a miracle. I just need one ordinary witness to the small things I keep surviving.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'I would like one quiet conversation that does not begin with small talk.',
  },
  {
    id: 'melbourne-identity-1',
    city: 'Melbourne',
    country: 'Australia',
    areaLabel: 'Springvale',
    postalHint: '3171',
    lat: -37.9483,
    lng: 145.1526,
    emotion: 'identity',
    contextTags: ['new-city', 'distance-from-home'],
    themes: ['language that changes shape', 'self split by context', 'Nepali in one room, stranger in another'],
    resonanceHints: ['become different by room', 'translation fatigue', 'the person my parents know'],
    excerpt:
      'I keep meeting versions of myself that only exist in different rooms.',
    fullText:
      "Springvale feels like a place where everyone is halfway translated. At home I am softer, more careful, and more Nepali in the ways my parents expect. Outside, I become quicker, flatter, easier to fit into the day. I do not think this is failure. I think it is the cost of living between versions of yourself for too long without a place that lets all of them breathe.",
    language: 'English + Nepali',
    year: 2024,
    openToChat: false,
    chatPrompt: 'I need a conversation where I do not have to choose which version of me is real.',
  },
  {
    id: 'doha-lonely-1',
    city: 'Doha',
    country: 'Qatar',
    areaLabel: 'West Bay',
    postalHint: 'Zone 63',
    lat: 25.3433,
    lng: 51.531,
    emotion: 'lonely',
    contextTags: ['work-pressure', 'distance-from-home'],
    themes: ['air-conditioned solitude', 'voices on a small screen', 'working far from the people who know you'],
    resonanceHints: ['same tower different silence', 'video call without touch', 'the city feels temporary'],
    excerpt:
      'I am surrounded by glass towers and still mostly talking to a glowing rectangle.',
    fullText:
      "West Bay is all reflections and air conditioning, and somehow that makes the loneliness feel more precise. I work hard, I send the messages home, I answer when I can, but the people who know me best are always inside a screen. There are days I feel useful and invisible at the same time, like the city is borrowing me for work but not for life.",
    language: 'English',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I want to talk about being useful and invisible at the same time.',
  },
  {
    id: 'doha-hope-1',
    city: 'Doha',
    country: 'Qatar',
    areaLabel: 'Al Wakrah',
    postalHint: 'Zone 90',
    lat: 25.171,
    lng: 51.6034,
    emotion: 'hope',
    contextTags: ['family-duty', 'distance-from-home'],
    themes: ['night walk after work', 'small plans', 'hope that can fit in a pocket'],
    resonanceHints: ['tomorrow can be smaller', 'I can tell the truth now', 'a life that does not collapse'],
    excerpt:
      'Hope looks like a quiet evening and one text I did not use to hide.',
    fullText:
      "In Al Wakrah, hope does not arrive like a revelation. It comes when I finish the shift, step outside, and realize I am still here. It is making a small plan for tomorrow without pretending tomorrow will solve everything. It is telling the truth in one message instead of ten polished ones. That is enough some days, and some days enough is a kind of relief.",
    language: 'English',
    year: 2024,
    openToChat: true,
    chatPrompt: 'If your hope can only fit in a pocket right now, I think we could still talk.',
  },
  {
    id: 'vancouver-homesick-1',
    city: 'Vancouver',
    country: 'Canada',
    areaLabel: 'Surrey',
    postalHint: 'V3T',
    lat: 49.1913,
    lng: -122.849,
    emotion: 'homesick',
    contextTags: ['distance-from-home', 'new-city'],
    themes: ['rain and memory', 'wanting home sounds', 'back home in the wrong season'],
    resonanceHints: ['rain makes me think of Kathmandu', 'my mother in the kitchen', 'I miss the shape of home'],
    excerpt:
      'Even the rain here feels like a reminder that something familiar is missing.',
    fullText:
      "Surrey is full of people who know how to build a life away from home, so I do not feel unusual here. I still feel homesick. Rain makes me think of Kathmandu in a way I cannot explain, and that feeling arrives before I can stop it. I can make a good life here and still miss the version of myself that knew exactly where home began.",
    language: 'English + Nepali',
    year: 2025,
    openToChat: true,
    chatPrompt: 'If rain or weather keeps dragging you back to home, I would listen.',
  },
  {
    id: 'sydney-pressure-1',
    city: 'Sydney',
    country: 'Australia',
    areaLabel: 'Auburn',
    postalHint: '2144',
    lat: -33.8668,
    lng: 151.0333,
    emotion: 'pressure',
    contextTags: ['student', 'family-duty'],
    themes: ['family expectations across time zones', 'always being the strong one', 'work after class after call home'],
    resonanceHints: ['calls home feel like tests', 'the pressure to be enough', 'I keep saying I am fine'],
    excerpt:
      'By the time I finish being the strong one, the day has already taken everything.',
    fullText:
      "Auburn is where I learned that a video call can feel like a test even when nobody says it out loud. I answer the questions, I keep my voice even, I tell everyone I am fine. Then I close the laptop and realize how much effort it took to stay legible. The pressure is not only work or study. It is the invisible job of being enough for everyone who sent me here.",
    language: 'English + Nepali',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I want to talk with someone who is tired of being the strong one.',
  },
  {
    id: 'auckland-hope-1',
    city: 'Auckland',
    country: 'New Zealand',
    areaLabel: 'Sandringham',
    postalHint: '1041',
    lat: -36.8844,
    lng: 174.7338,
    emotion: 'hope',
    contextTags: ['new-city', 'distance-from-home'],
    themes: ['starting over gently', 'not disappearing into ambition', 'hope as one more day'],
    resonanceHints: ['I can stay with myself', 'the day did not win', 'something in me is still here'],
    excerpt:
      'I am learning that hope can be quiet and still count.',
    fullText:
      "Sandringham has taught me that hope does not need to be loud to be real. Some mornings it is only one extra hour of sleep, one text answered honestly, one walk where I do not punish myself for being human. I used to think improvement had to be dramatic. Now I think staying with myself is already a kind of future.",
    language: 'English',
    year: 2024,
    openToChat: true,
    chatPrompt: 'If you are trying to stay with yourself, I think we could talk.',
  },
]

const emotionKeywords: Array<[Emotion, string[]]> = [
  ['homesick', ['home', 'ghar', 'miss', 'homesick', 'distance', 'pressure cooker', 'bidesh', 'return']],
  ['pressure', ['pressure', 'expectation', 'failing', 'falling apart', 'drowning', 'deadline', 'sacrifice', 'burden']],
  ['lonely', ['alone', 'lonely', 'empty', 'nobody', 'isolated', 'witness', 'invisible', 'quiet']],
  ['identity', ['between', 'belong', 'disappearing', 'identity', 'split', 'translate', 'subtitle', 'version']],
  ['hope', ['hope', 'better', 'light', 'tomorrow', 'healing', 'room', 'honest', 'curtain']],
]

function normalize(input: string) {
  return input.trim().toLowerCase()
}

function tokenize(input: string) {
  return normalize(input)
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 3)
}

function includesQuery(haystack: string, normalizedQuery: string) {
  return normalizedQuery.length > 0 && normalize(haystack).includes(normalizedQuery)
}

function includesAnyToken(haystack: string, tokens: string[]) {
  const normalizedHaystack = normalize(haystack)
  return tokens.some((token) => normalizedHaystack.includes(token))
}

function getStorySignals(story: StoryEntry) {
  return normalize(
    [
      story.themes.join(' '),
      story.resonanceHints.join(' '),
      story.excerpt,
      story.fullText,
      story.chatPrompt,
      story.city,
      story.areaLabel,
      story.postalHint,
    ].join(' '),
  )
}

function findPhraseMatch(phrases: string[], normalizedQuery: string, queryTokens: string[]) {
  return (
    phrases.find((phrase) => includesQuery(phrase, normalizedQuery)) ??
    phrases.find((phrase) => includesAnyToken(phrase, queryTokens)) ??
    null
  )
}

function scoreStoryForEntry(story: StoryEntry, entry: string, inferredEmotion: Emotion | null) {
  const normalizedEntry = normalize(entry)
  const queryTokens = tokenize(entry)
  let score = 0

  if (inferredEmotion && story.emotion === inferredEmotion) {
    score += 8
  }

  if (findPhraseMatch(story.resonanceHints, normalizedEntry, queryTokens)) {
    score += 5
  }

  if (findPhraseMatch(story.themes, normalizedEntry, queryTokens)) {
    score += 4
  }

  const contextMatch = findPhraseMatch(
    story.contextTags.map((tag) => contextLabels[tag]),
    normalizedEntry,
    queryTokens,
  )

  if (contextMatch) {
    score += 3
  }

  if (includesQuery(story.excerpt, normalizedEntry) || includesQuery(story.chatPrompt, normalizedEntry)) {
    score += 3
  }

  if (includesAnyToken(getStorySignals(story), queryTokens)) {
    score += 2
  }

  return score
}

function groupStoriesByCity(entries: StoryEntry[]) {
  const groups = new Map<
    string,
    Omit<CityCluster, 'lat' | 'lng'> & { latSum: number; lngSum: number }
  >()

  for (const story of entries) {
    const key = `${story.city}-${story.country}`.toLowerCase().replaceAll(' ', '-')
    const existing = groups.get(key)

    if (existing) {
      existing.stories.push(story)
      existing.latSum += story.lat
      existing.lngSum += story.lng
      existing.hasOpenConversation = existing.hasOpenConversation || story.openToChat
      existing.availableLocalStories += story.openToChat ? 1 : 0
      continue
    }

    groups.set(key, {
      id: key,
      city: story.city,
      country: story.country,
      latSum: story.lat,
      lngSum: story.lng,
      stories: [story],
      hasOpenConversation: story.openToChat,
      availableLocalStories: story.openToChat ? 1 : 0,
    })
  }

  return [...groups.values()]
    .map((group) => ({
      id: group.id,
      city: group.city,
      country: group.country,
      lat: group.latSum / group.stories.length,
      lng: group.lngSum / group.stories.length,
      hasOpenConversation: group.hasOpenConversation,
      availableLocalStories: group.availableLocalStories,
      stories: group.stories,
    }))
    .sort((left, right) => {
      if (right.stories.length !== left.stories.length) {
        return right.stories.length - left.stories.length
      }

      return left.city.localeCompare(right.city)
    })
}

export const cityClusters = groupStoriesByCity(stories)

export const featuredCities = cityClusters.slice(0, 4)

function buildWhySurfaced(
  story: StoryEntry,
  normalizedQuery: string,
  queryTokens: string[],
  inferredEmotion: Emotion | null,
) {
  if (normalizedQuery.length === 0) {
    return null
  }

  const hintMatch = findPhraseMatch(story.resonanceHints, normalizedQuery, queryTokens)
  if (hintMatch) {
    return `Echoes "${hintMatch}".`
  }

  const themeMatch = findPhraseMatch(story.themes, normalizedQuery, queryTokens)
  if (themeMatch) {
    return `Touches ${themeMatch}.`
  }

  const contextMatch = findPhraseMatch(
    story.contextTags.map((tag) => contextLabels[tag]),
    normalizedQuery,
    queryTokens,
  )
  if (contextMatch) {
    return `Holds ${contextMatch.toLowerCase()}.`
  }

  if (includesQuery(story.excerpt, normalizedQuery) || includesQuery(story.chatPrompt, normalizedQuery)) {
    return 'A line here stays close to your words.'
  }

  if (inferredEmotion && story.emotion === inferredEmotion) {
    return `Carries the same feeling: ${emotionLabels[story.emotion].toLowerCase()}.`
  }

  if (
    includesAnyToken(`${story.fullText} ${story.excerpt} ${story.chatPrompt}`, queryTokens)
  ) {
    return 'A nearby voice carries part of this feeling.'
  }

  return null
}

export function getMapClusters(
  selectedEmotion: Emotion | 'all',
  query: string,
): MapCityCluster[] {
  const normalizedQuery = normalize(query)
  const queryTokens = tokenize(query)
  const inferredEmotion = normalizedQuery ? inferEmotion(normalizedQuery) : null

  return cityClusters
    .map<MapCityCluster | null>((cluster) => {
      const matches = cluster.stories.flatMap<StoryMatchResult>((story) => {
        const matchesEmotion =
          selectedEmotion === 'all' || story.emotion === selectedEmotion

        if (!matchesEmotion) {
          return []
        }

        const whySurfaced = buildWhySurfaced(
          story,
          normalizedQuery,
          queryTokens,
          inferredEmotion,
        )

        if (normalizedQuery.length > 0 && !whySurfaced) {
          return []
        }

        return [{ story, whySurfaced }]
      })

      if (matches.length === 0) {
        return null
      }

      const matchedStories = matches.map((match) => match.story)

      return {
        ...cluster,
        stories: matchedStories,
        matches,
        hasOpenConversation: matchedStories.some((story) => story.openToChat),
        availableLocalStories: matchedStories.filter((story) => story.openToChat).length,
      }
    })
    .filter((cluster): cluster is MapCityCluster => cluster !== null)
}

function getSharedThemes(left: StoryEntry, right: StoryEntry) {
  return left.themes.filter((theme) =>
    right.themes.some((candidate) => normalize(candidate) === normalize(theme)),
  )
}

function getSharedContextTags(left: StoryEntry, right: StoryEntry) {
  return left.contextTags.filter((tag) => right.contextTags.includes(tag))
}

function buildRelatedReason(source: StoryEntry, candidate: StoryEntry) {
  const sharedThemes = getSharedThemes(source, candidate)
  if (sharedThemes.length > 0) {
    return `Also touches ${sharedThemes[0]}.`
  }

  const sharedContext = getSharedContextTags(source, candidate)
  if (sharedContext.length > 0) {
    return `Also carries ${contextLabels[sharedContext[0]].toLowerCase()}.`
  }

  return `Another city holding ${emotionLabels[source.emotion].toLowerCase()}.`
}

export function getRelatedCitySuggestions(
  story: StoryEntry,
  currentClusterId: string,
  candidateClusters: CityCluster[] = cityClusters,
  limit = 3,
): RelatedCitySuggestion[] {
  return candidateClusters
    .filter((cluster) => cluster.id !== currentClusterId)
    .flatMap((cluster) => {
      const candidates = cluster.stories
        .map((candidate) => {
          const sharedThemes = getSharedThemes(story, candidate).length
          const sharedContext = getSharedContextTags(story, candidate).length
          const sharedSignal = Math.max(
            ...story.resonanceHints.map((hint) =>
              getStorySignals(candidate).includes(normalize(hint)) ? 1 : 0,
            ),
            ...story.themes.map((theme) =>
              getStorySignals(candidate).includes(normalize(theme)) ? 1 : 0,
            ),
            0,
          )
          const sameEmotion = candidate.emotion === story.emotion ? 1 : 0
          const score =
            sameEmotion * 5 +
            sharedThemes * 4 +
            sharedContext * 3 +
            sharedSignal * 2 +
            (candidate.openToChat ? 1 : 0)

          return { candidate, cluster, score }
        })
        .filter(({ score }) => score > 0)
        .sort((left, right) => right.score - left.score)

      const best = candidates[0]

      if (!best) {
        return []
      }

      return [
        {
          clusterId: cluster.id,
          storyId: best.candidate.id,
          city: cluster.city,
          country: cluster.country,
          areaLabel: best.candidate.areaLabel,
          reason: buildRelatedReason(story, best.candidate),
          openToChat: best.candidate.openToChat,
          score: best.score,
        },
      ]
    })
    .sort((left, right) => right.score - left.score || left.city.localeCompare(right.city))
    .slice(0, limit)
    .map(({ clusterId, storyId, city, country, areaLabel, reason, openToChat }) => ({
      clusterId,
      storyId,
      city,
      country,
      areaLabel,
      reason,
      openToChat,
    }))
}

export function inferEmotion(entry: string): Emotion {
  const normalizedEntry = normalize(entry)

  for (const [emotion, keywords] of emotionKeywords) {
    if (keywords.some((keyword) => normalizedEntry.includes(keyword))) {
      return emotion
    }
  }

  return 'pressure'
}

export function findNarrativeMatch(entry: string) {
  const inferredEmotion = inferEmotion(entry)
  const scoredMatches = stories
    .map((story) => ({ story, score: scoreStoryForEntry(story, entry, inferredEmotion) }))
    .sort((left, right) => right.score - left.score || left.story.city.localeCompare(right.story.city))

  const bestMatch = scoredMatches.find(({ score }) => score > 0)?.story

  return (
    bestMatch ??
    stories.find((story) => story.emotion === inferredEmotion) ??
    stories.find((story) => story.emotion === emotionOptions[0]) ??
    stories[0]
  )
}

export function getStoryById(storyId: string | null | undefined) {
  if (!storyId) return null
  return stories.find((story) => story.id === storyId) ?? null
}

export function findSuggestedChatMatch(entry: string, preferredId?: string | null) {
  const preferredStory = getStoryById(preferredId)

  if (preferredStory?.openToChat) {
    return preferredStory
  }

  const inferredEmotion = inferEmotion(entry)
  const scoredMatches = stories
    .filter((story) => story.id !== preferredId && story.openToChat)
    .map((story) => ({
      story,
      score: scoreStoryForEntry(story, entry, inferredEmotion) + (story.emotion === inferredEmotion ? 2 : 0),
    }))
    .sort((left, right) => right.score - left.score || left.story.city.localeCompare(right.story.city))

  return scoredMatches[0]?.story ?? stories.find((story) => story.id !== preferredId && story.openToChat) ?? stories[0]
}

export function findConversationMatch(entry: string, excludeId?: string | null) {
  const inferredEmotion = inferEmotion(entry)
  const scoredMatches = stories
    .filter((story) => story.id !== excludeId && story.openToChat)
    .map((story) => ({
      story,
      score: scoreStoryForEntry(story, entry, inferredEmotion) + (story.emotion === inferredEmotion ? 2 : 0),
    }))
    .sort((left, right) => right.score - left.score || left.story.city.localeCompare(right.story.city))

  return scoredMatches[0]?.story ?? stories.find((story) => story.id !== excludeId && story.openToChat) ?? stories[0]
}
