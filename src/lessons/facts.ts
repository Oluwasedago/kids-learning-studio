import type { Lang } from '@/i18n'
import { shuffled } from './question'

// "Did you know?": short, true facts about the world, science, nature, space and history, one at a time in a
// random order. Written for young children; each is a widely documented fact (to verify again before v1:
// ROADMAP.md). To add one: add a line with a topic, a picture from public/emoji and the text.

export type FactTopic = 'space' | 'science' | 'nature' | 'world' | 'history'

export interface Fact {
  topic: FactTopic
  emoji: string
  /** English, then German and French (each checked to say the same; see content.test.ts for completeness). */
  text: string
  de: string
  fr: string
}

/** A fact's text in a language. */
export const factText = (f: Fact, lang: Lang) => (lang === 'en' ? f.text : f[lang])

export const FACTS: Fact[] = [
  // Space
  { topic: 'space', emoji: 'sun', text: 'The Sun is a star. It looks bigger than other stars because it is much closer to us.', de: 'Die Sonne ist ein Stern. Sie sieht größer aus als andere Sterne, weil sie uns viel näher ist.', fr: 'Le Soleil est une étoile. Il paraît plus grand que les autres étoiles parce qu’il est beaucoup plus près de nous.' },
  { topic: 'space', emoji: 'sun', text: 'Light from the Sun takes about 8 minutes to reach the Earth.', de: 'Das Licht der Sonne braucht etwa 8 Minuten bis zur Erde.', fr: 'La lumière du Soleil met environ 8 minutes pour arriver jusqu’à la Terre.' },
  { topic: 'space', emoji: 'globe', text: 'The Earth goes once around the Sun every year.', de: 'Die Erde kreist jedes Jahr einmal um die Sonne.', fr: 'La Terre fait le tour du Soleil une fois par an.' },
  { topic: 'space', emoji: 'moon', text: 'There is no air on the Moon, so astronauts take air with them in their spacesuits.', de: 'Auf dem Mond gibt es keine Luft. Darum nehmen Astronauten Luft in ihren Raumanzügen mit.', fr: 'Il n’y a pas d’air sur la Lune : les astronautes emportent de l’air dans leur combinaison spatiale.' },
  { topic: 'space', emoji: 'moon', text: 'The first people walked on the Moon in 1969.', de: '1969 sind zum ersten Mal Menschen auf dem Mond gelaufen.', fr: 'Les premiers humains ont marché sur la Lune en 1969.' },
  { topic: 'space', emoji: 'footprints', text: 'Footprints on the Moon can last for a very long time, because there is no wind or rain to blow them away.', de: 'Fußspuren auf dem Mond können sehr lange bleiben, weil dort kein Wind und kein Regen sie verweht.', fr: 'Les traces de pas sur la Lune peuvent rester très longtemps, car il n’y a ni vent ni pluie pour les effacer.' },
  { topic: 'space', emoji: 'glowstar', text: 'Jupiter is the biggest planet in our solar system.', de: 'Jupiter ist der größte Planet in unserem Sonnensystem.', fr: 'Jupiter est la plus grande planète de notre système solaire.' },
  { topic: 'space', emoji: 'glowstar', text: 'A day on Venus is longer than a whole year on Venus.', de: 'Ein Tag auf der Venus dauert länger als ein ganzes Jahr auf der Venus.', fr: 'Sur Vénus, un jour dure plus longtemps qu’une année entière.' },
  // Science
  { topic: 'science', emoji: 'snowflake', text: 'Ice floats on water because it is lighter than the same amount of water.', de: 'Eis schwimmt auf Wasser, weil es leichter ist als die gleiche Menge Wasser.', fr: 'La glace flotte sur l’eau parce qu’elle est plus légère que la même quantité d’eau.' },
  { topic: 'science', emoji: 'thermometer', text: 'Water boils at 100 degrees Celsius at sea level.', de: 'Auf Meereshöhe kocht Wasser bei 100 Grad Celsius.', fr: 'Au niveau de la mer, l’eau bout à 100 degrés Celsius.' },
  { topic: 'science', emoji: 'storm', text: 'A flash of lightning is hotter than the surface of the Sun.', de: 'Ein Blitz ist heißer als die Oberfläche der Sonne.', fr: 'Un éclair est plus chaud que la surface du Soleil.' },
  { topic: 'science', emoji: 'storm', text: 'You see lightning before you hear thunder, because light travels much faster than sound.', de: 'Man sieht den Blitz, bevor man den Donner hört, weil Licht viel schneller ist als Schall.', fr: 'On voit l’éclair avant d’entendre le tonnerre, parce que la lumière va beaucoup plus vite que le son.' },
  { topic: 'science', emoji: 'sun-rain', text: 'A rainbow appears when sunlight shines through raindrops.', de: 'Ein Regenbogen entsteht, wenn Sonnenlicht durch Regentropfen scheint.', fr: 'Un arc-en-ciel apparaît quand la lumière du Soleil traverse des gouttes de pluie.' },
  { topic: 'science', emoji: 'anatomical-heart', text: 'Your heart beats about 100,000 times every day.', de: 'Dein Herz schlägt jeden Tag ungefähr 100.000-mal.', fr: 'Ton cœur bat environ 100 000 fois par jour.' },
  { topic: 'science', emoji: 'bone', text: 'A grown-up has 206 bones. Babies are born with more, and some of them join together as they grow.', de: 'Ein Erwachsener hat 206 Knochen. Babys haben bei der Geburt mehr, und einige davon wachsen beim Großwerden zusammen.', fr: 'Un adulte a 206 os. Les bébés en ont plus à la naissance, et certains se soudent en grandissant.' },
  { topic: 'science', emoji: 'seedling', text: 'Plants make their own food from sunlight, water and air.', de: 'Pflanzen machen ihre Nahrung selbst: aus Sonnenlicht, Wasser und Luft.', fr: 'Les plantes fabriquent leur propre nourriture avec la lumière du Soleil, l’eau et l’air.' },
  { topic: 'science', emoji: 'droplet', text: 'Sound travels faster through water than through air.', de: 'Schall ist im Wasser schneller als in der Luft.', fr: 'Le son va plus vite dans l’eau que dans l’air.' },
  { topic: 'science', emoji: 'magnet', text: 'A magnet pulls things made of iron, like paper clips, but not things made of wood or plastic.', de: 'Ein Magnet zieht Dinge aus Eisen an, zum Beispiel Büroklammern, aber keine Dinge aus Holz oder Plastik.', fr: 'Un aimant attire les objets en fer, comme les trombones, mais pas ceux en bois ou en plastique.' },
  // Nature
  { topic: 'nature', emoji: 'animal-octopus', text: 'An octopus has three hearts and blue blood.', de: 'Ein Oktopus hat drei Herzen und blaues Blut.', fr: 'Une pieuvre a trois cœurs et du sang bleu.' },
  { topic: 'nature', emoji: 'animal-honeybee', text: 'Honeybees do a little dance to tell other bees where to find flowers.', de: 'Honigbienen tanzen, um anderen Bienen zu zeigen, wo es Blüten gibt.', fr: 'Les abeilles font une petite danse pour indiquer aux autres où trouver des fleurs.' },
  { topic: 'nature', emoji: 'animal-butterfly', text: 'Butterflies taste with their feet.', de: 'Schmetterlinge schmecken mit ihren Füßen.', fr: 'Les papillons goûtent avec leurs pattes.' },
  { topic: 'nature', emoji: 'animal-owl', text: 'A group of owls is sometimes called a parliament.', de: 'Eulen fliegen fast lautlos.', fr: 'Les chouettes et les hiboux volent presque sans bruit.' },
  { topic: 'nature', emoji: 'animal-elephant', text: 'Elephants are the biggest animals that live on land.', de: 'Elefanten sind die größten Tiere, die an Land leben.', fr: 'Les éléphants sont les plus grands animaux qui vivent sur la terre ferme.' },
  { topic: 'nature', emoji: 'animal-penguin', text: 'Almost all penguins live in the southern half of the world.', de: 'Fast alle Pinguine leben auf der Südhalbkugel der Erde.', fr: 'Presque tous les manchots vivent dans l’hémisphère Sud.' },
  { topic: 'nature', emoji: 'animal-kangaroo', text: 'A baby kangaroo is called a joey.', de: 'Ein Känguru-Baby heißt Joey.', fr: 'Un bébé kangourou s’appelle un joey.' },
  { topic: 'nature', emoji: 'animal-spouting-whale', text: 'Whales are not fish. They are mammals and breathe air, like us.', de: 'Wale sind keine Fische. Sie sind Säugetiere und atmen Luft, so wie wir.', fr: 'Les baleines ne sont pas des poissons. Ce sont des mammifères qui respirent de l’air, comme nous.' },
  { topic: 'nature', emoji: 'tree', text: 'Some trees live for thousands of years.', de: 'Manche Bäume werden Tausende Jahre alt.', fr: 'Certains arbres vivent des milliers d’années.' },
  { topic: 'nature', emoji: 'animal-frog', text: 'Frogs can breathe through their skin.', de: 'Frösche können durch ihre Haut atmen.', fr: 'Les grenouilles peuvent respirer par la peau.' },
  // World
  { topic: 'world', emoji: 'wave', text: 'The Pacific is the biggest ocean on Earth.', de: 'Der Pazifik ist der größte Ozean der Erde.', fr: 'Le Pacifique est le plus grand océan de la Terre.' },
  { topic: 'world', emoji: 'mountain', text: 'Mount Everest is the highest mountain on Earth above sea level.', de: 'Der Mount Everest ist der höchste Berg der Erde über dem Meeresspiegel.', fr: 'L’Everest est la plus haute montagne de la Terre au-dessus du niveau de la mer.' },
  { topic: 'world', emoji: 'desert', text: 'The Sahara is the biggest hot desert in the world.', de: 'Die Sahara ist die größte heiße Wüste der Welt.', fr: 'Le Sahara est le plus grand désert chaud du monde.' },
  { topic: 'world', emoji: 'snowflake', text: 'Antarctica is the coldest place on Earth.', de: 'Die Antarktis ist der kälteste Ort der Erde.', fr: 'L’Antarctique est l’endroit le plus froid de la Terre.' },
  { topic: 'world', emoji: 'globe', text: 'The Nile and the Amazon are the two longest rivers in the world.', de: 'Der Nil und der Amazonas sind die zwei längsten Flüsse der Welt.', fr: 'Le Nil et l’Amazone sont les deux plus longs fleuves du monde.' },
  { topic: 'world', emoji: 'speech', text: 'People around the world speak more than 7,000 different languages.', de: 'Auf der Welt werden mehr als 7.000 verschiedene Sprachen gesprochen.', fr: 'Dans le monde, on parle plus de 7 000 langues différentes.' },
  { topic: 'world', emoji: 'animal-kangaroo', text: 'Australia is a country and a whole continent at the same time.', de: 'Australien ist ein Land und gleichzeitig ein ganzer Kontinent.', fr: 'L’Australie est le plus grand pays d’Océanie.' },
  { topic: 'world', emoji: 'globe', text: 'Russia is the biggest country in the world.', de: 'Russland ist das größte Land der Welt.', fr: 'La Russie est le plus grand pays du monde.' },
  // History
  { topic: 'history', emoji: 'desert', text: 'The Great Pyramid in Egypt was built more than 4,500 years ago.', de: 'Die Große Pyramide in Ägypten wurde vor mehr als 4.500 Jahren gebaut.', fr: 'La Grande Pyramide d’Égypte a été construite il y a plus de 4 500 ans.' },
  { topic: 'history', emoji: 'scroll', text: 'The ancient Egyptians wrote with little pictures called hieroglyphs.', de: 'Die alten Ägypter schrieben mit kleinen Bildern, den Hieroglyphen.', fr: 'Les anciens Égyptiens écrivaient avec de petits dessins appelés hiéroglyphes.' },
  { topic: 'history', emoji: 'memo', text: 'Paper was first made in China about 2,000 years ago.', de: 'Papier wurde vor etwa 2.000 Jahren in China erfunden.', fr: 'Le papier a été inventé en Chine il y a environ 2 000 ans.' },
  { topic: 'history', emoji: 'road', text: 'Some roads built by the Romans about 2,000 years ago are still used today.', de: 'Manche Straßen, die die Römer vor etwa 2.000 Jahren gebaut haben, werden heute noch benutzt.', fr: 'Certaines routes construites par les Romains il y a environ 2 000 ans sont encore utilisées aujourd’hui.' },
  { topic: 'history', emoji: 'medal', text: 'The Olympic Games began in ancient Greece.', de: 'Die Olympischen Spiele haben im alten Griechenland angefangen.', fr: 'Les Jeux olympiques sont nés dans la Grèce antique.' },
  { topic: 'history', emoji: 'books', text: 'The first books printed with a printing press in Europe were made in the 1450s.', de: 'Die ersten Bücher, die in Europa mit einer Druckerpresse gedruckt wurden, entstanden in den 1450er-Jahren.', fr: 'Les premiers livres imprimés en Europe avec une presse à imprimer datent des années 1450.' },
  { topic: 'history', emoji: 'telephone', text: 'The telephone was invented in the 1870s.', de: 'Das Telefon wurde in den 1870er-Jahren erfunden.', fr: 'Le téléphone a été inventé dans les années 1870.' },
  { topic: 'history', emoji: 'airplane', text: 'The first aeroplane flight with an engine was in 1903. It lasted just 12 seconds.', de: 'Der erste Flug mit einem Motorflugzeug war 1903. Er dauerte nur 12 Sekunden.', fr: 'Le premier vol d’un avion à moteur a eu lieu en 1903. Il n’a duré que 12 secondes.' },
  { topic: 'history', emoji: 'computer', text: 'The first computers were as big as a whole room.', de: 'Die ersten Computer waren so groß wie ein ganzes Zimmer.', fr: 'Les premiers ordinateurs étaient aussi grands qu’une pièce entière.' },
  { topic: 'history', emoji: 'dinosaur', text: 'The giant dinosaurs died out about 66 million years ago, long before there were people. Birds are their living relatives.', de: 'Die großen Dinosaurier sind vor etwa 66 Millionen Jahren ausgestorben, lange bevor es Menschen gab. Vögel sind ihre heute lebenden Verwandten.', fr: 'Les grands dinosaures ont disparu il y a environ 66 millions d’années, bien avant l’arrivée des humains. Les oiseaux sont leurs descendants.' },
]

/** A new random order of all facts (the next fact is never the one just seen). Pure with a given random. */
export function factOrder(random = Math.random): Fact[] {
  return shuffled(FACTS, random)
}
