import type { Destination, Service, Tour } from '../types/content'
import partnerLogo from '../assets/logo.png'

const freeImages = {
  ugandaBestOne: '/images/safari-vehicle-in-grassland-0093.jpg',
  ugandaBestTwo: '/images/elephant-herd-by-riverbank-0067.jpg',
  wildlifeViewing: '/images/tree-climbing-lionesses-resting-0063.jpg',
  ugandaLandscape: '/images/lake-islands-overlook-0031.jpg',
  safariLodge: '/images/luxury-lodge-aerial-view-0094.jpg',
  safariSunset: '/images/sunset-over-mountain-ridges-0081.jpg',
  gorillaTrekking: '/images/tourists-near-mountain-gorilla-0024.jpg',
  gorillaTours: '/images/gorilla-family-in-forest-0075.jpg',
  mgahingaGorillas: '/images/silverback-gorilla-sitting-0087.jpg',
  goldenMonkey: '/images/monkey-on-tourist-head-0027.jpg',
  visitUganda: '/images/mountain-road-panorama-0046.jpg',
  ziwaRhino: '/images/buffalo-herd-on-savannah-0020.jpg',
  gorillaHabituation: '/images/gorilla-with-infant-on-back-0058.jpg',
  nyungweForest: '/images/chimpanzee-portrait-in-greenery-0057.jpg',
  raftingJinja: '/images/river-rapids-scene-0066.jpg',
  contactTeam: '/images/group-seated-at-forest-viewpoint-0058.jpg',
  partners: partnerLogo,
  groupSafari: '/images/tour-group-on-boat-0055.jpg',
  airportTransfers:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/KigaliAirport.jpg/960px-KigaliAirport.jpg',
  airTicketing:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Entebbe-international-airport-2009-001.jpg/960px-Entebbe-international-airport-2009-001.jpg',
  reservationProcessing: '/images/tour-group-on-boat-0055.jpg',
  permitProcessing: '/images/group-seated-at-forest-viewpoint-0058.jpg',
  accommodationBooking: '/images/luxury-lodge-aerial-view-0094.jpg',
  tourPackagePlanning: '/images/cliffside-bush-breakfast-setup-0083.jpg',
  hotelResortReservations: '/images/forest-lodge-hillside-view-0059.jpg',
  carRentalServices: '/images/safari-vehicle-in-grassland-0093.jpg',
  cruiseBookings: '/images/three-people-on-boat-0078.jpg',
  corporateTravelManagement: '/images/lakeside-resort-aerial-view-0003.jpg',
  conferenceEventCoordination: '/images/breakfast-on-lodge-deck-0042.jpg',
  groupTravelArrangements: '/images/group-watching-sunset-0023.jpg',
  honeymoonGetaways: '/images/couple-at-lake-viewpoint-0037.jpg',
  educationalTours: '/images/tea-picker-in-plantation-0076.jpg',
  pilgrimageTours: '/images/misty-mountain-valley-view-0074.jpg',
  tourGuideServices: '/images/tourists-with-gorilla-guide-0082.jpg',
  consultationItinerary: '/images/woman-on-viewing-deck-0025.jpg',
  documentationSupport: '/images/three-travelers-at-viewpoint-0013.jpg',
}

export const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Tours', to: '/tours' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact Us', to: '/contact-us' },
]

const tourCatalog = [
  {
    id: '10-days-best-uganda',
    title: '10 Days Best Of Uganda Safari',
    duration: '10 Days',
    country: 'Uganda',
    summary:
      'A balanced route across major parks with game drives, boat cruises, and primate tracking.',
    image: freeImages.ugandaBestOne,
    featured: true,
  },
  {
    id: '12-days-best-uganda',
    title: '12 Days Best Of Uganda Safari',
    duration: '12 Days',
    country: 'Uganda',
    summary:
      'Longer safari pace with extended wildlife viewing and stronger focus on local experiences.',
    image: freeImages.ugandaBestTwo,
    featured: true,
  },
  {
    id: '17-days-wildlife-culture',
    title: '17 Days Uganda Wildlife Culture Safari',
    duration: '17 Days',
    country: 'Uganda',
    summary:
      'A comprehensive Uganda circuit combining wildlife, primates, and cultural village encounters.',
    image: freeImages.wildlifeViewing,
    featured: true,
  },
  {
    id: '25-days-uganda',
    title: '25 Days Uganda Safari',
    duration: '25 Days',
    country: 'Uganda',
    summary:
      'Deep multi-region journey for travelers who want to explore Uganda in full detail.',
    image: freeImages.safariLodge,
  },
  {
    id: '18-days-uganda',
    title: '18 Days Uganda Safari',
    duration: '18 Days',
    country: 'Uganda',
    summary:
      'Extended wildlife and primate itinerary with premium game-drive and forest trekking days.',
    image: freeImages.safariSunset,
  },
  {
    id: '10-days-gorillas-chimps-big5',
    title: '10 Days Gorillas, Chimps And Big 5 Safari',
    duration: '10 Days',
    country: 'Uganda',
    summary:
      'Top-selling route that combines gorilla trekking, chimpanzee tracking, and big game.',
    image: freeImages.gorillaTrekking,
  },
  {
    id: '4-days-gorillas-golden-monkeys',
    title: '4 Days Mountain Gorillas And Golden Monkeys',
    duration: '4 Days',
    country: 'Uganda',
    summary:
      'Fast-paced primate experience for travelers with limited time but high wildlife priority.',
    image: freeImages.goldenMonkey,
  },
  {
    id: '4-days-bunyonyi-wildlife',
    title: '4 Days Gorillas, Lake Bunyonyi And Wildlife',
    duration: '4 Days',
    country: 'Uganda',
    summary:
      'A short circuit built around gorillas, scenic lake time, and classic wildlife viewing.',
    image: freeImages.gorillaTours,
  },
  {
    id: '4-days-bwindi-gorilla-fly-in',
    title: '3 Nights / 4 Days Gorilla Safari Package - Bwindi National Park',
    duration: '4 Days',
    country: 'Uganda',
    summary:
      'A fly-in Bwindi gorilla safari with Rushaga lodge stay, gorilla trekking, and a full Batwa cultural experience.',
    image: freeImages.gorillaTrekking,
  },
  {
    id: '4-days-bwindi-lake-mutanda',
    title: 'Uganda Safari Holiday - 3 Nights / 4 Days Safari Package',
    duration: '4 Days',
    country: 'Uganda / Rwanda',
    summary:
      'A cross-border safari from Kigali to Bwindi with gorilla trekking, Lake Mutanda, and the Mgahinga Batwa forest trail.',
    image: freeImages.ugandaLandscape,
  },
  {
    id: '4-days-entebbe-fly-in-gorilla',
    title: 'Uganda Safari Holiday - 3 Nights / 4 Days Entebbe Fly-In Package',
    duration: '4 Days',
    country: 'Uganda',
    summary:
      'An Entebbe arrival package with an overnight near the airport, domestic flight to Kisoro, and gorilla trekking in Bwindi.',
    image: freeImages.gorillaTrekking,
  },
  {
    id: '4-days-bwindi-road-gorilla',
    title: 'Uganda Safari Holiday - 3 Nights / 4 Days Bwindi Road Gorilla Package',
    duration: '4 Days',
    country: 'Uganda',
    summary:
      'A road-based Entebbe to Bwindi safari with gorilla trekking, a second gorilla day for part of the group, and Rushaga lodge stay.',
    image: freeImages.gorillaTours,
  },
  {
    id: '8-days-rwanda-uganda-adventure',
    title: 'Uganda & Rwanda Safari Adventure Holiday - 7 Nights / 8 Days',
    duration: '8 Days',
    country: 'Uganda / Rwanda',
    summary:
      'A two-country safari linking Kigali, Volcanoes National Park, Bwindi, and Lake Mburo with gorilla trekking in both Rwanda and Uganda.',
    image: freeImages.ugandaBestTwo,
  },
  {
    id: '9-days-top-adventure-uganda',
    title: 'Top Adventure Safari In Uganda - 8 Nights / 9 Days',
    duration: '9 Days',
    country: 'Uganda',
    summary:
      'A broader Uganda adventure combining Lake Bunyonyi, gorilla trekking, volcano hiking, Ishasha tree-climbing lions, Queen Elizabeth, and Kibale chimpanzees.',
    image: freeImages.ugandaLandscape,
  },
  {
    id: '6-days-murchison-queen-bwindi',
    title: 'Uganda Safari Holiday - 5 Nights / 6 Days Safari Package',
    duration: '6 Days',
    country: 'Uganda',
    summary:
      'A 5-night Uganda road safari combining Murchison Falls, Queen Elizabeth, Ishasha tree-climbing lions, and gorilla trekking in Bwindi.',
    image: freeImages.ugandaBestOne,
  },
  {
    id: '3-days-queen-ishasha-bunyonyi',
    title:
      '2 Nights / 3 Days Uganda Safari Package - Queen Elizabeth, Ishasha And Lake Bunyonyi',
    duration: '3 Days',
    country: 'Uganda',
    summary:
      'A short road safari featuring Queen Elizabeth game viewing, Ishasha tree-climbing lions, and a scenic Lake Bunyonyi boat cruise.',
    image: freeImages.wildlifeViewing,
  },
  {
    id: '8-days-chimps-wildlife',
    title: '8 Days Chimps And Wildlife Safari',
    duration: '8 Days',
    country: 'Uganda',
    summary:
      'Chimpanzee-forward itinerary paired with savannah wildlife and river activities.',
    image: freeImages.ziwaRhino,
  },
  {
    id: '20-days-uganda',
    title: '20 Days Safari In Uganda',
    duration: '20 Days',
    country: 'Uganda',
    summary:
      'Long-range safari build for photography and repeat game drives across varied habitats.',
    image: freeImages.ugandaLandscape,
  },
  {
    id: '3-days-gorilla-habituation',
    title: '3 Days Uganda Gorilla Habituation Tour',
    duration: '3 Days',
    country: 'Uganda',
    summary:
      'Concentrated gorilla habituation experience with efficient travel and lodge placement.',
    image: freeImages.gorillaHabituation,
  },
  {
    id: '3-days-chimp-habituation',
    title: '3 Days Uganda Chimpanzee Habituation Experience',
    duration: '3 Days',
    country: 'Uganda',
    summary: 'A focused chimpanzee immersion paired with forest-guided walking activities.',
    image: freeImages.nyungweForest,
  },
  {
    id: '5-days-ishasha-bwindi-gorilla',
    title: '4 Nights / 5 Days Ishasha Tree Climbing Lions And Bwindi Gorilla Safari Package',
    duration: '5 Days',
    country: 'Uganda',
    summary:
      'A 4-night Uganda safari linking Bwindi gorilla trekking with Ishasha tree-climbing lions and a road return to Kampala or Entebbe.',
    image: freeImages.wildlifeViewing,
  },
]

// Keep newly added tours at the end of the source list so they automatically
// appear first anywhere the shared `tours` collection is rendered.
export const tours: Tour[] = [...tourCatalog].reverse()

export const destinations: Destination[] = [
  {
    id: 'bwindi-impenetrable',
    name: 'Bwindi Impenetrable National Park',
    region: 'Southwestern Uganda',
    summary:
      'Home to mountain gorillas and one of the most iconic trekking experiences in East Africa.',
    image: '/images/gorilla-family-in-forest-0075.jpg',
    highlights: ['Mountain gorilla trekking', 'Dense tropical forest', 'Community cultural encounters'],
  },
  {
    id: 'mgahinga-gorilla',
    name: 'Mgahinga Gorilla National Park',
    region: 'Southwestern Uganda',
    summary:
      'A scenic highland park known for golden monkeys, gorilla trekking, and volcanic landscapes.',
    image: '/images/lake-islands-overlook-0031.jpg',
    highlights: ['Golden monkey tracking', 'Volcano hiking routes', 'Primate-focused short itineraries'],
  },
  {
    id: 'kibale-national-park',
    name: 'Kibale National Park',
    region: 'Western Uganda',
    summary:
      'Uganda’s leading chimpanzee destination with rich biodiversity and immersive forest activities.',
    image: '/images/chimpanzee-portrait-in-greenery-0057.jpg',
    highlights: ['Chimpanzee tracking', 'Forest walks', 'Birding and primate diversity'],
  },
  {
    id: 'queen-elizabeth-national-park',
    name: 'Queen Elizabeth National Park',
    region: 'Western Uganda',
    summary:
      'A diverse savannah destination combining classic game drives, crater landscapes, and water safaris.',
    image: '/images/tree-climbing-lionesses-resting-0063.jpg',
    highlights: ['Savannah game drives', 'Kazinga Channel boat trips', 'Tree-climbing lions in Ishasha'],
  },
  {
    id: 'murchison-falls-national-park',
    name: 'Murchison Falls National Park',
    region: 'Northwestern Uganda',
    summary:
      'A major wildlife destination famous for dramatic waterfalls, Nile river cruises, and large mammal sightings.',
    image: '/images/waterfall-rapids-landscape-0043.jpg',
    highlights: ['Murchison Falls viewpoint', 'Nile delta boat safari', 'Big game sightings'],
  },
  {
    id: 'kidepo-valley-national-park',
    name: 'Kidepo Valley National Park',
    region: 'Northeastern Uganda',
    summary:
      'A remote and rugged wilderness area offering dramatic landscapes and exclusive safari experiences.',
    image: '/images/zebra-in-mountain-savannah-0086.jpg',
    highlights: ['Remote wilderness safari', 'Distinctive savannah scenery', 'High-value photography destination'],
  },
  {
    id: 'lake-bunyonyi',
    name: 'Lake Bunyonyi',
    region: 'Southwestern Uganda',
    summary:
      'A scenic lake destination often paired with gorilla routes for relaxation, canoeing, and panoramic views.',
    image: '/images/lake-island-mountain-view-0015.jpg',
    highlights: ['Scenic recovery stop', 'Canoe excursions', 'Lodge stays with lake views'],
  },
  {
    id: 'lake-mburo-national-park',
    name: 'Lake Mburo National Park',
    region: 'Western Uganda',
    summary:
      'A compact savannah park ideal for short wildlife trips, known for zebras, antelopes, and scenic lake systems.',
    image: '/images/giraffes-in-open-field-0084.jpg',
    highlights: ['Short-stay game drives', 'Boat trips on Lake Mburo', 'Walking safaris'],
  },
  {
    id: 'semuliki-national-park',
    name: 'Semuliki National Park',
    region: 'Western Uganda',
    summary:
      'A lowland tropical forest destination with rich birdlife, hot springs, and distinctive central African ecology.',
    image: '/images/rainforest-valley-landscape-0088.jpg',
    highlights: ['Sempaya hot springs', 'Tropical forest trails', 'Birding diversity'],
  },
  {
    id: 'rwenzori-mountains-national-park',
    name: 'Rwenzori Mountains National Park',
    region: 'Western Uganda',
    summary:
      'A high-altitude mountain destination for trekking, glacier views, and dramatic alpine scenery.',
    image: '/images/misty-mountain-valley-view-0074.jpg',
    highlights: ['Multi-day mountain trekking', 'Alpine landscapes', 'Highland photography'],
  },
  {
    id: 'mount-elgon-national-park',
    name: 'Mount Elgon National Park',
    region: 'Eastern Uganda',
    summary:
      'A volcanic mountain ecosystem with waterfalls, caves, forest trails, and cool highland terrain.',
    image: '/images/mountain-road-panorama-0046.jpg',
    highlights: ['Mountain hikes', 'Waterfall visits', 'Cultural trails'],
  },
  {
    id: 'ziwa-rhino-sanctuary',
    name: 'Ziwa Rhino Sanctuary',
    region: 'Nakasongola, Central Uganda',
    summary:
      'Uganda’s key rhino conservation destination offering guided rhino tracking on foot.',
    image: '/images/buffalo-herd-on-savannah-0020.jpg',
    highlights: ['On-foot rhino tracking', 'Conservation-focused stop', 'Popular en-route safari activity'],
  },
  {
    id: 'pian-upe-wildlife-reserve',
    name: 'Pian Upe Wildlife Reserve',
    region: 'Northeastern Uganda',
    summary:
      'A lesser-visited wilderness reserve with wide-open landscapes and strong adventure travel appeal.',
    image: '/images/winding-road-through-hills-0075.jpg',
    highlights: ['Remote safari experience', 'Rugged scenery', 'Low-traffic wildlife routes'],
  },
  {
    id: 'sipi-falls',
    name: 'Sipi Falls',
    region: 'Eastern Uganda',
    summary:
      'A scenic waterfall destination on the slopes of Mount Elgon, known for hiking and landscape views.',
    image: '/images/tall-waterfall-in-rainforest-0048.jpg',
    highlights: ['Waterfall hikes', 'Coffee tour experiences', 'Highland viewpoints'],
  },
  {
    id: 'jinja-source-of-the-nile',
    name: 'Jinja (Source of the Nile)',
    region: 'Eastern Uganda',
    summary:
      'A major adventure and river destination where Nile experiences, city touring, and water sports combine.',
    image: '/images/river-rapids-scene-0066.jpg',
    highlights: ['Nile source visits', 'Adventure activities', 'Riverfront experiences'],
  },
  {
    id: 'mabira-forest-reserve',
    name: 'Mabira Forest Reserve',
    region: 'Central Uganda',
    summary:
      'A rainforest reserve near Kampala and Jinja with nature walks, canopy views, and biodiversity experiences.',
    image: '/images/bright-green-bird-on-branch-0050.jpg',
    highlights: ['Forest walks', 'Birding routes', 'Easy-access nature excursion'],
  },
  {
    id: 'mabamba-bay-wetland',
    name: 'Mabamba Bay Wetland',
    region: 'Near Entebbe, Central Uganda',
    summary:
      'A globally known wetland destination, popular for birding and shoebill-focused canoe excursions.',
    image: '/images/shoebill-standing-in-wetland-0085.jpg',
    highlights: ['Shoebill birding trips', 'Wetland canoe tours', 'Half-day Entebbe excursion'],
  },
  {
    id: 'budongo-forest-reserve',
    name: 'Budongo Forest Reserve',
    region: 'Northwestern Uganda',
    summary:
      'A major mahogany forest ecosystem often paired with Murchison routes for chimp and forest activities.',
    image: '/images/chimpanzees-walking-together-0074.jpg',
    highlights: ['Forest chimp tracking', 'Mahogany trails', 'Wildlife route extension'],
  },
  {
    id: 'kyambura-gorge',
    name: 'Kyambura Gorge',
    region: 'Queen Elizabeth Ecosystem, Western Uganda',
    summary:
      'A dramatic forested gorge within the Queen Elizabeth landscape, known for unique primate trekking.',
    image: '/images/tourists-with-gorilla-guide-0082.jpg',
    highlights: ['Chimp tracking in gorge habitat', 'Unique landscape contrast', 'Add-on to Queen Elizabeth safaris'],
  },
  {
    id: 'entebbe-botanical-gardens',
    name: 'Entebbe Botanical Gardens',
    region: 'Entebbe, Central Uganda',
    summary:
      'A calm lakeside destination often used for arrival or departure day activities near Entebbe.',
    image: '/images/lake-and-road-aerial-view-0040.jpg',
    highlights: ['Lakeside nature walks', 'Birding and primates', 'Ideal pre- or post-safari stop'],
  },
  {
    id: 'kalinzu-forest-reserve',
    name: 'Kalinzu Forest Reserve',
    region: 'Western Uganda',
    summary:
      'A tropical forest reserve known for primate sightings and forest nature trails near Queen Elizabeth routes.',
    image: '/images/lake-islands-drone-shot-0019.jpg',
    highlights: ['Forest primate walks', 'Birding habitat', 'Add-on to western circuit tours'],
  },
  {
    id: 'lake-mutanda',
    name: 'Lake Mutanda',
    region: 'Southwestern Uganda',
    summary:
      'A scenic highland lake destination often paired with gorilla trekking routes for relaxation and photography.',
    image: '/images/sunset-over-mountain-ridges-0081.jpg',
    highlights: ['Canoe experiences', 'Volcano-view scenery', 'Quiet post-trek recovery stays'],
  },
  {
    id: 'lake-katwe',
    name: 'Lake Katwe',
    region: 'Western Uganda',
    summary:
      'A crater lake known for traditional salt extraction and cultural interactions within the Queen Elizabeth ecosystem.',
    image: '/images/tourist-with-ankole-cattle-0014.jpg',
    highlights: ['Salt mining experience', 'Cultural learning visits', 'Crater-lake landscapes'],
  },
  {
    id: 'toro-semuliki-wildlife-reserve',
    name: 'Toro-Semuliki Wildlife Reserve',
    region: 'Western Uganda',
    summary:
      'A wildlife reserve with broad savannah views, birdlife, and dramatic Rwenzori backdrops.',
    image: '/images/couple-at-lake-viewpoint-0037.jpg',
    highlights: ['Open savannah habitats', 'Scenic mountain views', 'Wildlife extension destination'],
  },
  {
    id: 'mount-moroto',
    name: 'Mount Moroto',
    region: 'Karamoja, Northeastern Uganda',
    summary:
      'A rugged mountain destination in Karamoja offering adventure trekking and striking semi-arid landscapes.',
    image: '/images/visitors-with-cattle-herd-0044.jpg',
    highlights: ['Mountain trekking', 'Karamoja landscape experiences', 'Adventure-focused itineraries'],
  },
  {
    id: 'mparo-royal-tombs',
    name: 'Mparo Royal Tombs',
    region: 'Hoima, Western Uganda',
    summary:
      'A historical cultural site associated with Bunyoro kingdom heritage and guided interpretation visits.',
    image: '/images/woman-on-viewing-deck-0025.jpg',
    highlights: ['Cultural heritage site', 'Kingdom history experiences', 'Short educational stopovers'],
  },
  {
    id: 'namugongo-martyrs-shrine',
    name: 'Namugongo Martyrs Shrine',
    region: 'Wakiso District, Central Uganda',
    summary:
      'A major pilgrimage and heritage destination with national religious significance.',
    image: '/images/friends-at-lodge-lounge-0065.jpg',
    highlights: ['Religious pilgrimage visits', 'Historic martyrdom site', 'Cultural and spiritual tourism'],
  },
  {
    id: 'ngamba-island-chimpanzee-sanctuary',
    name: 'Ngamba Island Chimpanzee Sanctuary',
    region: 'Lake Victoria, Central Uganda',
    summary:
      'A conservation sanctuary focused on rescued chimpanzees, accessed through lake-based excursions.',
    image: '/images/group-seated-at-forest-viewpoint-0058.jpg',
    highlights: ['Chimpanzee conservation visits', 'Lake excursion experiences', 'Educational wildlife programs'],
  },
  {
    id: 'ssese-islands',
    name: 'Ssese Islands',
    region: 'Lake Victoria, Central Uganda',
    summary:
      'A lake-island destination known for relaxed beach stays, boat travel, and island getaway experiences.',
    image: '/images/lakeside-lodge-aerial-0035.jpg',
    highlights: ['Island relaxation retreats', 'Boat transfer routes', 'Lake Victoria beach escapes'],
  },
  {
    id: 'fort-portal-city',
    name: 'Fort Portal City',
    region: 'Western Uganda',
    summary:
      'A gateway city to crater lakes, Kibale, and Rwenzori routes with scenic highland surroundings.',
    image: '/images/river-and-hills-panorama-0028.jpg',
    highlights: ['Crater-lake region access', 'Highland city exploration', 'Base for western safari routes'],
  },
  {
    id: 'kabale-town',
    name: 'Kabale Town',
    region: 'Southwestern Uganda',
    summary:
      'A high-altitude town frequently used as a hub for Lake Bunyonyi and southwestern park circuits.',
    image: '/images/crater-lake-aerial-view-0045.jpg',
    highlights: ['Southwest circuit base', 'Lake and highland access', 'Convenient transfer stop'],
  },
  {
    id: 'arua-city',
    name: 'Arua City',
    region: 'Northwestern Uganda',
    summary:
      'A regional city that serves as a transit and cultural hub for northwest Uganda itineraries.',
    image: '/images/lake-islands-aerial-landscape-0004.jpg',
    highlights: ['Northwest route connection', 'Urban-cultural stop', 'Regional gateway logistics'],
  },
  {
    id: 'gulu-city',
    name: 'Gulu City',
    region: 'Northern Uganda',
    summary:
      'A northern urban center often used as a route base for cultural and wildlife extensions.',
    image: '/images/gorilla-family-in-forest-0075.jpg',
    highlights: ['Northern Uganda gateway', 'City stopovers', 'Culture-focused extensions'],
  },
  {
    id: 'uganda-museum',
    name: 'Uganda Museum',
    region: 'Kampala, Central Uganda',
    summary:
      'A historical and cultural site showcasing Uganda’s heritage, ethnography, and natural history.',
    image: '/images/lake-islands-overlook-0031.jpg',
    highlights: ['Cultural exhibits', 'Historical collections', 'Educational city excursion'],
  },
  {
    id: 'lake-edward',
    name: 'Lake Edward',
    region: 'Western Uganda',
    summary:
      'A transboundary rift valley lake in the Queen Elizabeth ecosystem, rich in scenic and ecological value.',
    image: '/images/chimpanzee-portrait-in-greenery-0057.jpg',
    highlights: ['Rift valley lake scenery', 'Ecosystem biodiversity', 'Linked wildlife landscapes'],
  },
]

export const services: Service[] = [
  {
    id: 'airport-transfers',
    name: 'Airport Transfers',
    description:
      'Reliable pickup and drop-off services for a stress-free travel experience.',
    image: freeImages.airportTransfers,
  },
  {
    id: 'air-ticketing',
    name: 'Air Ticketing',
    description: 'Domestic and international flight bookings at competitive rates.',
    image: freeImages.airTicketing,
  },
  {
    id: 'reservation-processing',
    name: 'Tracking Reservation Processing',
    description: 'Efficient management of reservations, confirmations, and re-bookings.',
    image: freeImages.reservationProcessing,
  },
  {
    id: 'permit-processing',
    name: 'Permit Processing',
    description: 'Assistance with travel permits and required documentation.',
    image: freeImages.permitProcessing,
  },
  {
    id: 'accommodation-booking',
    name: 'Accommodation Booking',
    description: 'Hotel and resort reservations for all budgets.',
    image: freeImages.accommodationBooking,
  },
  {
    id: 'tour-package-planning',
    name: 'Tour Package Planning',
    description: 'Customized local tour packages.',
    image: freeImages.tourPackagePlanning,
  },
  {
    id: 'hotel-resort-reservations',
    name: 'Hotel & Resort Reservations',
    description:
      'Special deals with resorts, boutique hotels, and luxury accommodations.',
    image: freeImages.hotelResortReservations,
  },
  {
    id: 'car-rental-services',
    name: 'Car Rental Services',
    description:
      'Self-drive or chauffeur-driven car rentals for trips and events.',
    image: freeImages.carRentalServices,
  },
  {
    id: 'cruise-bookings',
    name: 'Cruise Bookings',
    description: 'Arrangements for cruise vacations with itinerary planning.',
    image: freeImages.cruiseBookings,
  },
  {
    id: 'corporate-travel-management',
    name: 'Corporate Travel Management',
    description:
      'Complete business travel solutions including flights and accommodation.',
    image: freeImages.corporateTravelManagement,
  },
  {
    id: 'conference-event-coordination',
    name: 'Conference & Event Travel Coordination',
    description:
      'Travel logistics for meetings, exhibitions, and events.',
    image: freeImages.conferenceEventCoordination,
  },
  {
    id: 'group-travel-arrangements',
    name: 'Group Travel Arrangements',
    description:
      'Planning and coordination for school, religious, or social group tours.',
    image: freeImages.groupTravelArrangements,
  },
  {
    id: 'honeymoon-getaways',
    name: 'Honeymoon & Romantic Getaways',
    description: 'Personalized vacation packages for couples.',
    image: freeImages.honeymoonGetaways,
  },
  {
    id: 'educational-tours',
    name: 'Educational Tours',
    description:
      'Study tours, educational trips, and international exchange travel.',
    image: freeImages.educationalTours,
  },
  {
    id: 'pilgrimage-tours',
    name: 'Pilgrimage Tours',
    description: 'Religious and spiritual travel arrangements.',
    image: freeImages.pilgrimageTours,
  },
  {
    id: 'tour-guide-services',
    name: 'Tour Guide Services',
    description: 'Professional guides to enhance your travel experience.',
    image: freeImages.tourGuideServices,
  },
  {
    id: 'consultation-itinerary',
    name: 'Travel Consultation & Itinerary Planning',
    description: 'Expert advice and detailed itinerary creation.',
    image: freeImages.consultationItinerary,
  },
  {
    id: 'documentation-support',
    name: 'Travel Documentation Support',
    description:
      'Assistance with passports, renewals, and other necessary documents.',
    image: freeImages.documentationSupport,
  },
]

export const stats = [
  { label: 'Years Of Field Experience', value: '12+' },
  { label: 'Planned Itineraries', value: '1,400+' },
  { label: 'National Parks Covered', value: '20+' },
  { label: 'Client Satisfaction', value: '98%' },
]
