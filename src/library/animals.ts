import type { Lang } from '@/i18n'

// The animals library: a real photo of each animal (public/photos/animals/<id>.jpg), its name and fact from the
// lesson texts (lessons/text*.ts), and where it lives, in each language. The photos show the species the facts
// are about (e.g. a one-humped dromedary, a mute swan, an emperor penguin).

export const ANIMAL_HOMES: Record<string, Record<Lang, string>> = {
  fox: { en: 'Forests, fields and even towns in many parts of the world', de: 'Wälder, Felder und sogar Städte in vielen Teilen der Welt', fr: 'Forêts, champs et même villes, dans de nombreuses régions du monde' },
  owl: { en: 'Woods and parks; most owls hunt at night', de: 'Wälder und Parks; die meisten Eulen jagen nachts', fr: 'Bois et parcs ; la plupart chassent la nuit' },
  hedgehog: { en: 'Gardens, hedges and woods in Europe', de: 'Gärten, Hecken und Wälder in Europa', fr: 'Jardins, haies et bois d’Europe' },
  elephant: { en: 'Grasslands and forests in Africa and Asia', de: 'Grasland und Wälder in Afrika und Asien', fr: 'Savanes et forêts d’Afrique et d’Asie' },
  giraffe: { en: 'Savannas of Africa', de: 'Savannen in Afrika', fr: 'Savanes d’Afrique' },
  penguin: { en: 'Cold seas and ice in the southern half of the world', de: 'Kalte Meere und Eis auf der Südhalbkugel', fr: 'Mers froides et glaces de l’hémisphère Sud' },
  dolphin: { en: 'Seas and oceans all over the world', de: 'Meere und Ozeane auf der ganzen Welt', fr: 'Mers et océans du monde entier' },
  lion: { en: 'Grasslands of Africa, and one forest in India', de: 'Grasland in Afrika und ein Wald in Indien', fr: 'Savanes d’Afrique, et une forêt en Inde' },
  panda: { en: 'Bamboo forests in the mountains of China', de: 'Bambuswälder in den Bergen Chinas', fr: 'Forêts de bambous dans les montagnes de Chine' },
  koala: { en: 'Eucalyptus forests in Australia', de: 'Eukalyptuswälder in Australien', fr: 'Forêts d’eucalyptus en Australie' },
  turtle: { en: 'On land, in fresh water and in the sea, almost everywhere warm', de: 'An Land, im Süßwasser und im Meer, fast überall, wo es warm ist', fr: 'Sur terre, en eau douce et en mer, presque partout où il fait chaud' },
  butterfly: { en: 'Meadows and gardens with flowers, on every continent but Antarctica', de: 'Wiesen und Gärten mit Blumen, auf allen Kontinenten außer der Antarktis', fr: 'Prairies et jardins fleuris, sur tous les continents sauf l’Antarctique' },
  honeybee: { en: 'Hives in hollow trees, or ones that beekeepers build', de: 'Bienenstöcke in hohlen Bäumen oder bei Imkern', fr: 'Ruches dans des arbres creux, ou construites par les apiculteurs' },
  octopus: { en: 'Rocky sea floors and coral reefs', de: 'Felsiger Meeresboden und Korallenriffe', fr: 'Fonds marins rocheux et récifs de corail' },
  frog: { en: 'Ponds, wet meadows and gardens', de: 'Teiche, feuchte Wiesen und Gärten', fr: 'Mares, prairies humides et jardins' },
  rabbit: { en: 'Burrows under fields and meadows', de: 'Baue unter Feldern und Wiesen', fr: 'Terriers sous les champs et les prairies' },
  chipmunk: { en: 'Forests of North America', de: 'Wälder in Nordamerika', fr: 'Forêts d’Amérique du Nord' },
  bear: { en: 'Forests and mountains in North America, Europe and Asia', de: 'Wälder und Berge in Nordamerika, Europa und Asien', fr: 'Forêts et montagnes d’Amérique du Nord, d’Europe et d’Asie' },
  tiger: { en: 'Forests and grasslands in Asia', de: 'Wälder und Grasland in Asien', fr: 'Forêts et prairies d’Asie' },
  zebra: { en: 'Grasslands of Africa', de: 'Grasland in Afrika', fr: 'Savanes d’Afrique' },
  kangaroo: { en: 'Grasslands and dry plains of Australia', de: 'Grasland und trockene Ebenen in Australien', fr: 'Prairies et plaines sèches d’Australie' },
  'spouting-whale': { en: 'Oceans all over the world', de: 'Ozeane auf der ganzen Welt', fr: 'Océans du monde entier' },
  parrot: { en: 'Warm forests, often in big noisy groups', de: 'Warme Wälder, oft in großen, lauten Gruppen', fr: 'Forêts chaudes, souvent en grands groupes bruyants' },
  flamingo: { en: 'Shallow salty lakes and lagoons', de: 'Flache Salzseen und Lagunen', fr: 'Lacs salés peu profonds et lagunes' },
  snail: { en: 'Gardens, woods and damp places', de: 'Gärten, Wälder und feuchte Orte', fr: 'Jardins, bois et endroits humides' },
  'lady-beetle': { en: 'Gardens, meadows and fields', de: 'Gärten, Wiesen und Felder', fr: 'Jardins, prairies et champs' },
  crab: { en: 'Beaches, rocky shores and the sea floor', de: 'Strände, felsige Küsten und Meeresboden', fr: 'Plages, côtes rocheuses et fonds marins' },
  horse: { en: 'Farms and fields; a few herds still live wild', de: 'Bauernhöfe und Weiden; einige Herden leben noch wild', fr: 'Fermes et prés ; quelques troupeaux vivent encore en liberté' },
  cow: { en: 'Farms and meadows all over the world', de: 'Bauernhöfe und Weiden auf der ganzen Welt', fr: 'Fermes et prés du monde entier' },
  hippopotamus: { en: 'Rivers and lakes in Africa', de: 'Flüsse und Seen in Afrika', fr: 'Fleuves et lacs d’Afrique' },
  camel: { en: 'Deserts of North Africa and the Middle East', de: 'Wüsten in Nordafrika und im Nahen Osten', fr: 'Déserts d’Afrique du Nord et du Moyen-Orient' },
  bat: { en: 'Caves, old trees and roofs; it sleeps by day', de: 'Höhlen, alte Bäume und Dächer; tagsüber schläft sie', fr: 'Grottes, vieux arbres et toits ; elle dort le jour' },
  peacock: { en: 'Forests of India and Sri Lanka, and many parks', de: 'Wälder in Indien und Sri Lanka und viele Parks', fr: 'Forêts d’Inde et du Sri Lanka, et beaucoup de parcs' },
  shark: { en: 'Oceans all over the world', de: 'Ozeane auf der ganzen Welt', fr: 'Océans du monde entier' },
  sloth: { en: 'Rainforests of Central and South America', de: 'Regenwälder in Mittel- und Südamerika', fr: 'Forêts tropicales d’Amérique centrale et du Sud' },
  otter: { en: 'Rivers, lakes and coasts; sea otters live in the Pacific Ocean', de: 'Flüsse, Seen und Küsten; Seeotter leben im Pazifik', fr: 'Rivières, lacs et côtes ; les loutres de mer vivent dans le Pacifique' },
  beaver: { en: 'Rivers and lakes in North America and Europe', de: 'Flüsse und Seen in Nordamerika und Europa', fr: 'Rivières et lacs d’Amérique du Nord et d’Europe' },
  seal: { en: 'Cold seas and coasts', de: 'Kalte Meere und Küsten', fr: 'Mers froides et côtes' },
  swan: { en: 'Lakes, rivers and ponds', de: 'Seen, Flüsse und Teiche', fr: 'Lacs, rivières et étangs' },
  mouse: { en: 'Fields, woods and houses, almost everywhere people live', de: 'Felder, Wälder und Häuser, fast überall, wo Menschen leben', fr: 'Champs, bois et maisons, presque partout où vivent les humains' },
}

/** Photo address of an animal (relative to the app). */
export const animalPhoto = (id: string) => `photos/animals/${id}.jpg`
