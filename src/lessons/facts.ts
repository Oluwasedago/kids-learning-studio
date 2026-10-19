import { shuffled } from './question'

// "Did you know?": short, true facts about the world, science, nature, space and history, one at a time in a
// random order. Written for young children; each is a widely documented fact (to verify again before v1:
// ROADMAP.md). To add one: add a line with a topic, a picture from public/emoji and the text.

export type FactTopic = 'space' | 'science' | 'nature' | 'world' | 'history'

export interface Fact {
  topic: FactTopic
  emoji: string
  text: string
}

export const FACTS: Fact[] = [
  // Space
  { topic: 'space', emoji: 'sun', text: 'The Sun is a star. It looks bigger than other stars because it is much closer to us.' },
  { topic: 'space', emoji: 'sun', text: 'Light from the Sun takes about 8 minutes to reach the Earth.' },
  { topic: 'space', emoji: 'globe', text: 'The Earth goes once around the Sun every year.' },
  { topic: 'space', emoji: 'moon', text: 'There is no air on the Moon, so astronauts take air with them in their spacesuits.' },
  { topic: 'space', emoji: 'moon', text: 'The first people walked on the Moon in 1969.' },
  { topic: 'space', emoji: 'footprints', text: 'Footprints on the Moon can last for a very long time, because there is no wind or rain to blow them away.' },
  { topic: 'space', emoji: 'glowstar', text: 'Jupiter is the biggest planet in our solar system.' },
  { topic: 'space', emoji: 'glowstar', text: 'A day on Venus is longer than a whole year on Venus.' },
  // Science
  { topic: 'science', emoji: 'snowflake', text: 'Ice floats on water because it is lighter than the same amount of water.' },
  { topic: 'science', emoji: 'fire', text: 'Water boils at 100 degrees Celsius at sea level.' },
  { topic: 'science', emoji: 'storm', text: 'A flash of lightning is hotter than the surface of the Sun.' },
  { topic: 'science', emoji: 'storm', text: 'You see lightning before you hear thunder, because light travels much faster than sound.' },
  { topic: 'science', emoji: 'sun-rain', text: 'A rainbow appears when sunlight shines through raindrops.' },
  { topic: 'science', emoji: 'heart', text: 'Your heart beats about 100,000 times every day.' },
  { topic: 'science', emoji: 'chart', text: 'A grown-up has 206 bones. Babies are born with more, and some of them join together as they grow.' },
  { topic: 'science', emoji: 'seedling', text: 'Plants make their own food from sunlight, water and air.' },
  { topic: 'science', emoji: 'music', text: 'Sound travels faster through water than through air.' },
  { topic: 'science', emoji: 'light', text: 'A magnet pulls things made of iron, like paper clips, but not things made of wood or plastic.' },
  // Nature
  { topic: 'nature', emoji: 'animal-octopus', text: 'An octopus has three hearts and blue blood.' },
  { topic: 'nature', emoji: 'animal-honeybee', text: 'Honeybees do a little dance to tell other bees where to find flowers.' },
  { topic: 'nature', emoji: 'animal-butterfly', text: 'Butterflies taste with their feet.' },
  { topic: 'nature', emoji: 'animal-owl', text: 'A group of owls is called a parliament.' },
  { topic: 'nature', emoji: 'animal-elephant', text: 'Elephants are the biggest animals that live on land.' },
  { topic: 'nature', emoji: 'animal-penguin', text: 'Almost all penguins live in the southern half of the world.' },
  { topic: 'nature', emoji: 'animal-kangaroo', text: 'A baby kangaroo is called a joey.' },
  { topic: 'nature', emoji: 'animal-spouting-whale', text: 'Whales are not fish. They are mammals and breathe air, like us.' },
  { topic: 'nature', emoji: 'seedling', text: 'Some trees live for thousands of years.' },
  { topic: 'nature', emoji: 'animal-frog', text: 'Frogs can breathe through their skin.' },
  // World
  { topic: 'world', emoji: 'globe', text: 'The Pacific is the biggest ocean on Earth.' },
  { topic: 'world', emoji: 'globe', text: 'Mount Everest is the highest mountain above the sea.' },
  { topic: 'world', emoji: 'sun', text: 'The Sahara is the biggest hot desert in the world.' },
  { topic: 'world', emoji: 'snowflake', text: 'Antarctica is the coldest place on Earth.' },
  { topic: 'world', emoji: 'globe', text: 'The Nile and the Amazon are the two longest rivers in the world.' },
  { topic: 'world', emoji: 'speech', text: 'People around the world speak more than 7,000 different languages.' },
  { topic: 'world', emoji: 'animal-kangaroo', text: 'Australia is a country and a whole continent at the same time.' },
  { topic: 'world', emoji: 'globe', text: 'Russia is the biggest country in the world.' },
  // History
  { topic: 'history', emoji: 'sun', text: 'The Great Pyramid in Egypt was built more than 4,500 years ago.' },
  { topic: 'history', emoji: 'memo', text: 'The ancient Egyptians wrote with little pictures called hieroglyphs.' },
  { topic: 'history', emoji: 'memo', text: 'Paper was first made in China about 2,000 years ago.' },
  { topic: 'history', emoji: 'footprints', text: 'Some roads built by the Romans about 2,000 years ago are still used today.' },
  { topic: 'history', emoji: 'trophy', text: 'The Olympic Games began in ancient Greece.' },
  { topic: 'history', emoji: 'books', text: 'The first books printed with a printing press in Europe were made in the 1450s.' },
  { topic: 'history', emoji: 'speech', text: 'The telephone was invented in the 1870s.' },
  { topic: 'history', emoji: 'sparkles', text: 'The first aeroplane flight with an engine was in 1903. It lasted just 12 seconds.' },
  { topic: 'history', emoji: 'game', text: 'The first computers were as big as a whole room.' },
  { topic: 'history', emoji: 'footprints', text: 'Dinosaurs died out about 66 million years ago, long before there were people.' },
]

/** A new random order of all facts (the next fact is never the one just seen). Pure with a given random. */
export function factOrder(random = Math.random): Fact[] {
  return shuffled(FACTS, random)
}
