export interface Destination {
  slug: string;
  name: string;
  category: "national-park" | "lake" | "wildlife-reserve" | "cultural" | "city" | "other";
  description: string;
  image: string;
}

export const destinations: Destination[] = [
  { slug: "bwindi-impenetrable-national-park", name: "Bwindi Impenetrable National Park", category: "national-park", description: "Home to nearly half the world's mountain gorillas, this UNESCO World Heritage Site features dense tropical rainforest.", image: "gorilla" },
  { slug: "mgahinga-gorilla-national-park", name: "Mgahinga Gorilla National Park", category: "national-park", description: "Part of the Virunga volcanic region, home to mountain gorillas and rare golden monkeys.", image: "gorilla" },
  { slug: "kibale-national-park", name: "Kibale National Park", category: "national-park", description: "The primate capital of the world with 13 species including chimpanzees.", image: "chimp" },
  { slug: "queen-elizabeth-national-park", name: "Queen Elizabeth National Park", category: "national-park", description: "Uganda's most popular park featuring tree-climbing lions, elephants, and the Kazinga Channel.", image: "tree-lions" },
  { slug: "murchison-falls-national-park", name: "Murchison Falls National Park", category: "national-park", description: "Uganda's largest park where the Nile forces through a narrow gorge creating spectacular falls.", image: "murchison" },
  { slug: "kidepo-valley-national-park", name: "Kidepo Valley National Park", category: "national-park", description: "Remote and stunningly beautiful, home to wildlife found nowhere else in Uganda.", image: "murchison" },
  { slug: "lake-bunyonyi", name: "Lake Bunyonyi", category: "lake", description: "One of Africa's deepest lakes surrounded by terraced hillsides and 29 islands.", image: "lake-bunyonyi" },
  { slug: "lake-mburo-national-park", name: "Lake Mburo National Park", category: "national-park", description: "Compact park with zebras, elands, and beautiful lake scenery.", image: "tree-lions" },
  { slug: "semuliki-national-park", name: "Semuliki National Park", category: "national-park", description: "Extension of the great Ituri Forest with hot springs and unique bird species.", image: "chimp" },
  { slug: "rwenzori-mountains", name: "Rwenzori Mountains National Park", category: "national-park", description: "The legendary 'Mountains of the Moon' with Africa's third-highest peak.", image: "murchison" },
  { slug: "mount-elgon", name: "Mount Elgon National Park", category: "national-park", description: "Ancient volcano with the world's largest caldera and beautiful hiking trails.", image: "murchison" },
  { slug: "ziwa-rhino-sanctuary", name: "Ziwa Rhino Sanctuary", category: "wildlife-reserve", description: "The only place in Uganda to see rhinos in their natural habitat.", image: "tree-lions" },
  { slug: "pian-upe-wildlife-reserve", name: "Pian Upe Wildlife Reserve", category: "wildlife-reserve", description: "Uganda's second-largest wildlife reserve in the remote northeast.", image: "murchison" },
  { slug: "sipi-falls", name: "Sipi Falls", category: "other", description: "Three stunning waterfalls on the edge of Mount Elgon.", image: "murchison" },
  { slug: "jinja-source-of-the-nile", name: "Jinja (Source of the Nile)", category: "other", description: "Adventure capital of East Africa and the source of the mighty River Nile.", image: "lake-bunyonyi" },
  { slug: "mabira-forest", name: "Mabira Forest Reserve", category: "other", description: "Tropical rainforest between Kampala and Jinja, perfect for nature walks.", image: "chimp" },
  { slug: "mabamba-bay-wetland", name: "Mabamba Bay Wetland", category: "other", description: "Prime birding site and the best place to see the rare shoebill stork.", image: "lake-bunyonyi" },
  { slug: "budongo-forest", name: "Budongo Forest Reserve", category: "other", description: "One of East Africa's most important tropical forests with chimpanzees.", image: "chimp" },
  { slug: "kyambura-gorge", name: "Kyambura Gorge", category: "other", description: "The 'Valley of Apes' — a sunken forest gorge with habituated chimpanzees.", image: "chimp" },
  { slug: "entebbe-botanical-gardens", name: "Entebbe Botanical Gardens", category: "other", description: "Beautiful lakeside gardens established in 1898 on the shores of Lake Victoria.", image: "lake-bunyonyi" },
  { slug: "kalinzu-forest", name: "Kalinzu Forest Reserve", category: "other", description: "A biodiversity hotspot with chimpanzees near Queen Elizabeth National Park.", image: "chimp" },
  { slug: "lake-mutanda", name: "Lake Mutanda", category: "lake", description: "A volcanic lake surrounded by the Virunga volcanoes, incredibly scenic.", image: "lake-bunyonyi" },
  { slug: "lake-katwe", name: "Lake Katwe", category: "lake", description: "A crater lake famous for its salt mining tradition in Queen Elizabeth NP.", image: "tree-lions" },
  { slug: "toro-semuliki-wildlife-reserve", name: "Toro-Semuliki Wildlife Reserve", category: "wildlife-reserve", description: "Where East African savanna meets West African jungle.", image: "tree-lions" },
  { slug: "mount-moroto", name: "Mount Moroto", category: "other", description: "A remote mountain in Karamoja region offering cultural encounters.", image: "murchison" },
  { slug: "mparo-royal-tombs", name: "Mparo Royal Tombs", category: "cultural", description: "Burial site of the Omukama kings of Bunyoro-Kitara Kingdom.", image: "tree-lions" },
  { slug: "namugongo-martyrs-shrine", name: "Namugongo Martyrs Shrine", category: "cultural", description: "Important pilgrimage site commemorating the Uganda Martyrs.", image: "tree-lions" },
  { slug: "ngamba-island", name: "Ngamba Island Chimpanzee Sanctuary", category: "other", description: "A chimpanzee sanctuary on an island in Lake Victoria.", image: "chimp" },
  { slug: "ssese-islands", name: "Ssese Islands", category: "other", description: "Tropical islands on Lake Victoria perfect for relaxation.", image: "lake-bunyonyi" },
  { slug: "fort-portal", name: "Fort Portal City", category: "city", description: "The tourism city surrounded by crater lakes and tea plantations.", image: "lake-bunyonyi" },
  { slug: "kabale", name: "Kabale Town", category: "city", description: "Gateway to Bwindi and the 'Switzerland of Africa'.", image: "lake-bunyonyi" },
  { slug: "arua", name: "Arua City", category: "city", description: "Gateway to the West Nile region and its unique attractions.", image: "murchison" },
  { slug: "gulu", name: "Gulu City", category: "city", description: "Northern Uganda's largest city and gateway to Murchison Falls.", image: "murchison" },
  { slug: "uganda-museum", name: "Uganda Museum", category: "cultural", description: "The oldest museum in East Africa showcasing Uganda's heritage.", image: "tree-lions" },
  { slug: "lake-edward", name: "Lake Edward", category: "lake", description: "A great lake shared with DR Congo, part of the Albertine Rift.", image: "lake-bunyonyi" },
];
