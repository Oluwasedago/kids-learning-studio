import type { Lang } from '@/i18n'
import { pick, type Question, type Random, shuffleIn } from './question'

// World records and space (Stages 4–5): fixed questions with one right answer and two wrong ones, the same in
// English, German and French. Each fact checked against encyclopaedias (Oct 2026: India has the most people
// since 2023; Pluto is a dwarf planet, so Neptune is the farthest planet). Nothing that differs between school
// systems (e.g. how many continents there are: 7 in English-speaking schools, 5 or 6 in French ones).

type T = [question: string, right: string, wrong1: string, wrong2: string]
export interface FixedQuestion {
  en: T
  de: T
  fr: T
}

export const WORLD_RECORDS: FixedQuestion[] = [
  {
    en: ['Which is the biggest ocean?', 'The Pacific', 'The Atlantic', 'The Indian Ocean'],
    de: ['Welcher Ozean ist der größte?', 'Der Pazifik', 'Der Atlantik', 'Der Indische Ozean'],
    fr: ['Quel est le plus grand océan ?', 'Le Pacifique', 'L’Atlantique', 'L’océan Indien'],
  },
  {
    en: ['Which is the biggest continent?', 'Asia', 'Africa', 'Europe'],
    de: ['Welcher Kontinent ist der größte?', 'Asien', 'Afrika', 'Europa'],
    fr: ['Quel est le plus grand continent ?', 'L’Asie', 'L’Afrique', 'L’Europe'],
  },
  {
    en: ['Which is the coldest continent?', 'Antarctica', 'Europe', 'Africa'],
    de: ['Welcher Kontinent ist der kälteste?', 'Die Antarktis', 'Europa', 'Afrika'],
    fr: ['Quel est le continent le plus froid ?', 'L’Antarctique', 'L’Europe', 'L’Afrique'],
  },
  {
    en: ['Which is the highest mountain in the world?', 'Mount Everest', 'Mount Kilimanjaro', 'Mont Blanc'],
    de: ['Welcher Berg ist der höchste der Welt?', 'Der Mount Everest', 'Der Kilimandscharo', 'Der Montblanc'],
    fr: ['Quelle est la plus haute montagne du monde ?', 'L’Everest', 'Le Kilimandjaro', 'Le mont Blanc'],
  },
  {
    en: ['Which is the biggest hot desert in the world?', 'The Sahara', 'The Kalahari', 'The Atacama'],
    de: ['Welche ist die größte heiße Wüste der Welt?', 'Die Sahara', 'Die Kalahari', 'Die Atacama'],
    fr: ['Quel est le plus grand désert chaud du monde ?', 'Le Sahara', 'Le Kalahari', 'L’Atacama'],
  },
  {
    en: ['Which country is the biggest in the world?', 'Russia', 'China', 'Brazil'],
    de: ['Welches Land ist das größte der Welt?', 'Russland', 'China', 'Brasilien'],
    fr: ['Quel est le plus grand pays du monde ?', 'La Russie', 'La Chine', 'Le Brésil'],
  },
  {
    en: ['Which is the longest river in Africa?', 'The Nile', 'The Congo', 'The Niger'],
    de: ['Welcher Fluss ist der längste in Afrika?', 'Der Nil', 'Der Kongo', 'Der Niger'],
    fr: ['Quel est le plus long fleuve d’Afrique ?', 'Le Nil', 'Le Congo', 'Le Niger'],
  },
  {
    en: ['Which ocean lies between Europe and North America?', 'The Atlantic', 'The Pacific', 'The Indian Ocean'],
    de: ['Welcher Ozean liegt zwischen Europa und Nordamerika?', 'Der Atlantik', 'Der Pazifik', 'Der Indische Ozean'],
    fr: ['Quel océan se trouve entre l’Europe et l’Amérique du Nord ?', 'L’Atlantique', 'Le Pacifique', 'L’océan Indien'],
  },
  {
    en: ['Which country has the most people?', 'India', 'The United States', 'Brazil'],
    de: ['Welches Land hat die meisten Einwohner?', 'Indien', 'Die USA', 'Brasilien'],
    fr: ['Quel pays compte le plus d’habitants ?', 'L’Inde', 'Les États-Unis', 'Le Brésil'],
  },
  {
    en: ['Which is the biggest island in the world?', 'Greenland', 'Madagascar', 'Iceland'],
    de: ['Welche ist die größte Insel der Welt?', 'Grönland', 'Madagaskar', 'Island'],
    fr: ['Quelle est la plus grande île du monde ?', 'Le Groenland', 'Madagascar', 'L’Islande'],
  },
  {
    en: ['Which country is shaped like a boot?', 'Italy', 'Spain', 'Greece'],
    de: ['Welches Land hat die Form eines Stiefels?', 'Italien', 'Spanien', 'Griechenland'],
    fr: ['Quel pays a la forme d’une botte ?', 'L’Italie', 'L’Espagne', 'La Grèce'],
  },
  {
    en: ['Where is the biggest rainforest in the world?', 'The Amazon', 'The Sahara', 'The Alps'],
    de: ['Wo ist der größte Regenwald der Welt?', 'Am Amazonas', 'In der Sahara', 'In den Alpen'],
    fr: ['Où se trouve la plus grande forêt tropicale du monde ?', 'En Amazonie', 'Au Sahara', 'Dans les Alpes'],
  },
]

export const SPACE: FixedQuestion[] = [
  {
    en: ['Which planet is the biggest?', 'Jupiter', 'Saturn', 'Earth'],
    de: ['Welcher Planet ist der größte?', 'Jupiter', 'Saturn', 'Die Erde'],
    fr: ['Quelle est la plus grande planète ?', 'Jupiter', 'Saturne', 'La Terre'],
  },
  {
    en: ['Which planet is closest to the Sun?', 'Mercury', 'Venus', 'Mars'],
    de: ['Welcher Planet ist der Sonne am nächsten?', 'Merkur', 'Venus', 'Mars'],
    fr: ['Quelle planète est la plus proche du Soleil ?', 'Mercure', 'Vénus', 'Mars'],
  },
  {
    en: ['Which planet is called the Red Planet?', 'Mars', 'Jupiter', 'Venus'],
    de: ['Welcher Planet heißt der Rote Planet?', 'Mars', 'Jupiter', 'Venus'],
    fr: ['Quelle planète appelle-t-on la planète rouge ?', 'Mars', 'Jupiter', 'Vénus'],
  },
  {
    en: ['Which planet is famous for its big, bright rings?', 'Saturn', 'Mars', 'Mercury'],
    de: ['Welcher Planet ist für seine großen, hellen Ringe bekannt?', 'Saturn', 'Mars', 'Merkur'],
    fr: ['Quelle planète est célèbre pour ses grands anneaux brillants ?', 'Saturne', 'Mars', 'Mercure'],
  },
  {
    en: ['What is the Sun?', 'A star', 'A planet', 'A moon'],
    de: ['Was ist die Sonne?', 'Ein Stern', 'Ein Planet', 'Ein Mond'],
    fr: ['Qu’est-ce que le Soleil ?', 'Une étoile', 'Une planète', 'Une lune'],
  },
  {
    en: ['How long does the Earth take to go once around the Sun?', 'One year', 'One day', 'One month'],
    de: ['Wie lange braucht die Erde einmal um die Sonne?', 'Ein Jahr', 'Einen Tag', 'Einen Monat'],
    fr: ['Combien de temps la Terre met-elle pour faire le tour du Soleil ?', 'Un an', 'Un jour', 'Un mois'],
  },
  {
    en: ['Why do we have day and night?', 'The Earth turns around', 'The Sun goes around the Earth', 'The Moon covers the Sun'],
    de: ['Warum gibt es Tag und Nacht?', 'Die Erde dreht sich', 'Die Sonne kreist um die Erde', 'Der Mond verdeckt die Sonne'],
    fr: ['Pourquoi y a-t-il le jour et la nuit ?', 'La Terre tourne sur elle-même', 'Le Soleil tourne autour de la Terre', 'La Lune cache le Soleil'],
  },
  {
    en: ['Who was the first person to walk on the Moon?', 'Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin'],
    de: ['Wer hat als erster Mensch den Mond betreten?', 'Neil Armstrong', 'Buzz Aldrin', 'Juri Gagarin'],
    fr: ['Qui a été le premier humain à marcher sur la Lune ?', 'Neil Armstrong', 'Buzz Aldrin', 'Youri Gagarine'],
  },
  {
    en: ['Which planet is farthest from the Sun?', 'Neptune', 'Uranus', 'Saturn'],
    de: ['Welcher Planet ist am weitesten von der Sonne entfernt?', 'Neptun', 'Uranus', 'Saturn'],
    fr: ['Quelle planète est la plus éloignée du Soleil ?', 'Neptune', 'Uranus', 'Saturne'],
  },
  {
    en: ['Which star is closest to the Earth?', 'The Sun', 'The North Star', 'Sirius'],
    de: ['Welcher Stern ist der Erde am nächsten?', 'Die Sonne', 'Der Polarstern', 'Sirius'],
    fr: ['Quelle étoile est la plus proche de la Terre ?', 'Le Soleil', 'L’étoile Polaire', 'Sirius'],
  },
  {
    en: ['What do we call a group of stars that makes a pattern in the sky?', 'A constellation', 'A comet', 'A crater'],
    de: ['Wie heißt eine Gruppe von Sternen, die am Himmel ein Bild ergibt?', 'Ein Sternbild', 'Ein Komet', 'Ein Krater'],
    fr: ['Comment appelle-t-on un groupe d’étoiles qui forme un dessin dans le ciel ?', 'Une constellation', 'Une comète', 'Un cratère'],
  },
  {
    en: ['Who was the first person to travel into space?', 'Yuri Gagarin', 'Neil Armstrong', 'Christopher Columbus'],
    de: ['Wer war der erste Mensch im Weltall?', 'Juri Gagarin', 'Neil Armstrong', 'Christoph Kolumbus'],
    fr: ['Qui a été le premier humain à aller dans l’espace ?', 'Youri Gagarine', 'Neil Armstrong', 'Christophe Colomb'],
  },
]

/** A fixed question in a language, with its answers in a random order. */
export function fixedQuestion(r: Random, bank: FixedQuestion[], lang: Lang): Question {
  const [prompt, right, ...wrong] = pick(r, bank)[lang]
  return { prompt, ...shuffleIn(r, { label: right }, wrong.map((label) => ({ label }))) }
}
