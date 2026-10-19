// Words, animals and countries used by the lessons and games. Pictures: public/emoji/<emoji>.png.
// Facts are kept simple and true for young children; each was checked against general reference sources
// (to verify again before the v1 release: see ROADMAP).

export interface Fruit {
  /** public/emoji/fruit-<id>.png */
  id: string
  name: string
}

export const FRUITS: Fruit[] = [
  { id: 'apple', name: 'apple' },
  { id: 'banana', name: 'banana' },
  { id: 'grapes', name: 'grapes' },
  { id: 'strawberry', name: 'strawberry' },
  { id: 'cherries', name: 'cherries' },
  { id: 'watermelon', name: 'watermelon' },
  { id: 'pear', name: 'pear' },
  { id: 'pineapple', name: 'pineapple' },
  { id: 'lemon', name: 'lemon' },
  { id: 'kiwi', name: 'kiwi' },
  { id: 'peach', name: 'peach' },
  { id: 'mango', name: 'mango' },
  { id: 'blueberries', name: 'blueberries' },
  { id: 'coconut', name: 'coconut' },
]

export interface Animal {
  /** public/emoji/animal-<id>.png */
  id: string
  name: string
  /** One simple, true fact, written with "It" so it can be asked as "Which animal is this?". */
  fact: string
  sea?: boolean
}

export const ANIMALS: Animal[] = [
  { id: 'fox', name: 'fox', fact: 'It hears so well that it can hear a mouse under the snow.' },
  { id: 'owl', name: 'owl', fact: 'It can turn its head a very long way round.' },
  { id: 'hedgehog', name: 'hedgehog', fact: 'It has thousands of spines on its back.' },
  { id: 'elephant', name: 'elephant', fact: 'It sucks up water with its trunk and squirts it into its mouth.' },
  { id: 'giraffe', name: 'giraffe', fact: 'It is the tallest animal on land.' },
  { id: 'penguin', name: 'penguin', fact: 'It cannot fly, but it swims very well.' },
  { id: 'dolphin', name: 'dolphin', fact: 'It is a clever sea animal that clicks and whistles to talk to others.', sea: true },
  { id: 'lion', name: 'lion', fact: 'It lives in a group called a pride.' },
  { id: 'panda', name: 'panda', fact: 'It eats almost nothing but bamboo.' },
  { id: 'koala', name: 'koala', fact: 'It eats the leaves of eucalyptus trees.' },
  { id: 'turtle', name: 'turtle', fact: 'It has a hard shell and can live for a very long time.' },
  { id: 'butterfly', name: 'butterfly', fact: 'It used to be a caterpillar.' },
  { id: 'honeybee', name: 'bee', fact: 'It makes honey from the nectar of flowers.' },
  { id: 'octopus', name: 'octopus', fact: 'It has eight arms.', sea: true },
  { id: 'frog', name: 'frog', fact: 'As a baby it was a tadpole in the water.' },
  { id: 'rabbit', name: 'rabbit', fact: 'It hops, has long ears and loves to nibble plants.' },
  { id: 'chipmunk', name: 'chipmunk', fact: 'It carries nuts in its cheeks.' },
  { id: 'bear', name: 'bear', fact: 'It is very big and furry, and in winter it sleeps for a long time in a den.' },
  { id: 'tiger', name: 'tiger', fact: 'It is the biggest wild cat in the world.' },
  { id: 'zebra', name: 'zebra', fact: 'It lives in a big herd and has black and white stripes.' },
  { id: 'kangaroo', name: 'kangaroo', fact: 'It carries its baby in a pouch on its tummy.' },
  { id: 'spouting-whale', name: 'whale', fact: 'The blue one is the biggest animal in the world.', sea: true },
  { id: 'parrot', name: 'parrot', fact: 'Some of them can copy words.' },
  { id: 'flamingo', name: 'flamingo', fact: 'It is pink because it eats tiny pink shrimps.' },
  { id: 'snail', name: 'snail', fact: 'Its eyes sit on top of its feelers.' },
  { id: 'lady-beetle', name: 'ladybird', fact: 'It eats tiny bugs called aphids and so helps plants.' },
  { id: 'crab', name: 'crab', fact: 'It often walks sideways.', sea: true },
  { id: 'horse', name: 'horse', fact: 'People ride on it, and it eats hay and grass.' },
  { id: 'cow', name: 'cow', fact: 'It eats grass and gives us milk.' },
  { id: 'hippopotamus', name: 'hippo', fact: "Its name means 'river horse'." },
  { id: 'camel', name: 'camel', fact: 'It has a hump on its back and can go a long time without water.' },
  { id: 'bat', name: 'bat', fact: 'It flies at night and finds its way with sounds.' },
  { id: 'peacock', name: 'peacock', fact: 'The male has colourful tail feathers.' },
  { id: 'shark', name: 'shark', fact: 'It keeps growing new teeth.', sea: true },
  { id: 'sloth', name: 'sloth', fact: 'It moves very, very slowly and hangs upside down in trees.' },
  { id: 'otter', name: 'otter', fact: 'Some of them float on their backs and hold paws while they sleep.' },
  { id: 'beaver', name: 'beaver', fact: 'It builds dams out of branches.' },
  { id: 'seal', name: 'seal', fact: 'On land it moves by wriggling along on its tummy.', sea: true },
  { id: 'swan', name: 'swan', fact: 'Its babies are grey.' },
  { id: 'mouse', name: 'mouse', fact: 'It is small, has a long thin tail and squeaks.' },
]

/** Days since 1 Jan 1970 in local time. */
const dayNumber = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000)

/** Today's animal: a new one every day, all of them before one comes again. */
export const animalOfTheDay = (d: Date): Animal => ANIMALS[dayNumber(d) % ANIMALS.length]

/** A word with a picture (animals and fruit), for spelling and the word games. */
export interface Word {
  emoji: string
  word: string
}

export const WORDS: Word[] = [...ANIMALS.map((a) => ({ emoji: `animal-${a.id}`, word: a.name })), ...FRUITS.map((f) => ({ emoji: `fruit-${f.id}`, word: f.name }))]

// ---- Countries ----

// Flags drawn by the app itself (no pictures to download or licence): stripes, a cross or a disc.
// Only flags simple enough to draw exactly. Stripes of equal height; a colour listed twice makes a double stripe.

export type FlagShape =
  | { kind: 'h'; colors: string[] } // horizontal stripes, top to bottom
  | { kind: 'v'; colors: string[] } // vertical stripes, left to right
  | { kind: 'cross'; field: string; cross: string; nordic: boolean }
  | { kind: 'disc'; field: string; disc: string }

export type Continent = 'Europe' | 'Africa' | 'Asia' | 'South America'

export interface Country {
  id: string
  name: string
  capital: string
  continent: Continent
  shape: FlagShape
}

export const COUNTRIES: Country[] = [
  { id: 'de', name: 'Germany', capital: 'Berlin', continent: 'Europe', shape: { kind: 'h', colors: ['#000000', '#dd0000', '#ffce00'] } },
  { id: 'fr', name: 'France', capital: 'Paris', continent: 'Europe', shape: { kind: 'v', colors: ['#0055a4', '#ffffff', '#ef4135'] } },
  { id: 'it', name: 'Italy', capital: 'Rome', continent: 'Europe', shape: { kind: 'v', colors: ['#009246', '#ffffff', '#ce2b37'] } },
  { id: 'ie', name: 'Ireland', capital: 'Dublin', continent: 'Europe', shape: { kind: 'v', colors: ['#169b62', '#ffffff', '#ff883e'] } },
  { id: 'be', name: 'Belgium', capital: 'Brussels', continent: 'Europe', shape: { kind: 'v', colors: ['#000000', '#fdda24', '#ef3340'] } },
  { id: 'at', name: 'Austria', capital: 'Vienna', continent: 'Europe', shape: { kind: 'h', colors: ['#ed2939', '#ffffff', '#ed2939'] } },
  { id: 'nl', name: 'the Netherlands', capital: 'Amsterdam', continent: 'Europe', shape: { kind: 'h', colors: ['#ae1c28', '#ffffff', '#21468b'] } },
  { id: 'pl', name: 'Poland', capital: 'Warsaw', continent: 'Europe', shape: { kind: 'h', colors: ['#ffffff', '#dc143c'] } },
  { id: 'ua', name: 'Ukraine', capital: 'Kyiv', continent: 'Europe', shape: { kind: 'h', colors: ['#0057b7', '#ffd700'] } },
  { id: 'hu', name: 'Hungary', capital: 'Budapest', continent: 'Europe', shape: { kind: 'h', colors: ['#cd2a3e', '#ffffff', '#436f4d'] } },
  { id: 'ee', name: 'Estonia', capital: 'Tallinn', continent: 'Europe', shape: { kind: 'h', colors: ['#0072ce', '#000000', '#ffffff'] } },
  { id: 'se', name: 'Sweden', capital: 'Stockholm', continent: 'Europe', shape: { kind: 'cross', field: '#006aa7', cross: '#fecc00', nordic: true } },
  { id: 'dk', name: 'Denmark', capital: 'Copenhagen', continent: 'Europe', shape: { kind: 'cross', field: '#c8102e', cross: '#ffffff', nordic: true } },
  { id: 'fi', name: 'Finland', capital: 'Helsinki', continent: 'Europe', shape: { kind: 'cross', field: '#ffffff', cross: '#002f6c', nordic: true } },
  { id: 'ch', name: 'Switzerland', capital: 'Bern', continent: 'Europe', shape: { kind: 'cross', field: '#da291c', cross: '#ffffff', nordic: false } },
  { id: 'ng', name: 'Nigeria', capital: 'Abuja', continent: 'Africa', shape: { kind: 'v', colors: ['#008751', '#ffffff', '#008751'] } },
  { id: 'ml', name: 'Mali', capital: 'Bamako', continent: 'Africa', shape: { kind: 'v', colors: ['#14b53a', '#fcd116', '#ce1126'] } },
  { id: 'gn', name: 'Guinea', capital: 'Conakry', continent: 'Africa', shape: { kind: 'v', colors: ['#ce1126', '#fcd116', '#009460'] } },
  { id: 'td', name: 'Chad', capital: "N'Djamena", continent: 'Africa', shape: { kind: 'v', colors: ['#002664', '#fecb00', '#c60c30'] } },
  { id: 'ci', name: "Côte d'Ivoire", capital: 'Yamoussoukro', continent: 'Africa', shape: { kind: 'v', colors: ['#f77f00', '#ffffff', '#009e60'] } },
  { id: 'sl', name: 'Sierra Leone', capital: 'Freetown', continent: 'Africa', shape: { kind: 'h', colors: ['#1eb53a', '#ffffff', '#0072c6'] } },
  { id: 'ga', name: 'Gabon', capital: 'Libreville', continent: 'Africa', shape: { kind: 'h', colors: ['#009e60', '#fcd116', '#3a75c4'] } },
  { id: 'jp', name: 'Japan', capital: 'Tokyo', continent: 'Asia', shape: { kind: 'disc', field: '#ffffff', disc: '#bc002d' } },
  { id: 'id', name: 'Indonesia', capital: 'Jakarta', continent: 'Asia', shape: { kind: 'h', colors: ['#ce1126', '#ffffff'] } },
  { id: 'th', name: 'Thailand', capital: 'Bangkok', continent: 'Asia', shape: { kind: 'h', colors: ['#a51931', '#f4f5f8', '#2d2a4a', '#2d2a4a', '#f4f5f8', '#a51931'] } },
  { id: 'ye', name: 'Yemen', capital: "Sana'a", continent: 'Asia', shape: { kind: 'h', colors: ['#ce1126', '#ffffff', '#000000'] } },
  { id: 'pe', name: 'Peru', capital: 'Lima', continent: 'South America', shape: { kind: 'v', colors: ['#d91023', '#ffffff', '#d91023'] } },
]

export const CONTINENTS: Continent[] = ['Europe', 'Africa', 'Asia', 'South America']

// ---- English word lists ----

export const PLURALS: [string, string][] = [
  ['cat', 'cats'], ['dog', 'dogs'], ['fox', 'foxes'], ['bus', 'buses'], ['box', 'boxes'], ['dress', 'dresses'],
  ['brush', 'brushes'], ['peach', 'peaches'], ['baby', 'babies'], ['cherry', 'cherries'], ['toy', 'toys'],
  ['key', 'keys'], ['mouse', 'mice'], ['child', 'children'], ['foot', 'feet'], ['tooth', 'teeth'], ['man', 'men'],
  ['woman', 'women'], ['sheep', 'sheep'], ['leaf', 'leaves'], ['wolf', 'wolves'], ['knife', 'knives'],
  ['tomato', 'tomatoes'], ['potato', 'potatoes'],
]

export const PAST_TENSES: [string, string][] = [
  ['play', 'played'], ['jump', 'jumped'], ['walk', 'walked'], ['like', 'liked'], ['dance', 'danced'], ['hop', 'hopped'],
  ['stop', 'stopped'], ['cry', 'cried'], ['try', 'tried'], ['run', 'ran'], ['go', 'went'], ['see', 'saw'], ['eat', 'ate'],
  ['swim', 'swam'], ['sing', 'sang'], ['sit', 'sat'], ['make', 'made'], ['take', 'took'], ['write', 'wrote'],
  ['come', 'came'], ['have', 'had'], ['say', 'said'], ['find', 'found'], ['drink', 'drank'], ['fly', 'flew'],
]

export const OPPOSITES: [string, string][] = [
  ['big', 'small'], ['hot', 'cold'], ['up', 'down'], ['happy', 'sad'], ['fast', 'slow'], ['open', 'closed'],
  ['day', 'night'], ['full', 'empty'], ['wet', 'dry'], ['loud', 'quiet'], ['light', 'dark'], ['first', 'last'],
  ['in', 'out'], ['hard', 'soft'], ['early', 'late'], ['high', 'low'],
]

/** Words for "a" or "an" (no tricky ones like "hour" or "unicorn" at this stage). */
export const A_AN: { word: string; emoji?: string }[] = [
  { word: 'apple', emoji: 'fruit-apple' }, { word: 'owl', emoji: 'animal-owl' }, { word: 'elephant', emoji: 'animal-elephant' },
  { word: 'octopus', emoji: 'animal-octopus' }, { word: 'otter', emoji: 'animal-otter' }, { word: 'umbrella', emoji: 'umbrella' },
  { word: 'fox', emoji: 'animal-fox' }, { word: 'banana', emoji: 'fruit-banana' }, { word: 'lion', emoji: 'animal-lion' },
  { word: 'pear', emoji: 'fruit-pear' }, { word: 'bear', emoji: 'animal-bear' }, { word: 'snail', emoji: 'animal-snail' },
  { word: 'cake', emoji: 'cake' }, { word: 'bus', emoji: 'bus' },
]
