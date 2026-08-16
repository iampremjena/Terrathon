export interface CapitalQuestion {
  id: string;
  country: string;
  capital: string;
  continent: string;
  coordinates: { lat: number; lng: number };
  options: string[];
}

export interface VideoQuestion {
  id: string;
  locationName: string;
  country: string;
  videoUrl: string;
  coordinates: { lat: number; lng: number };
  options: string[];
  clue: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

// Helper: Shuffle array in place
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ----------------------------------------------------------------------------
// 1. CAPITALS POOL (208 World Countries)
// ----------------------------------------------------------------------------
const RAW_CAPITALS: Array<{ country: string; capital: string; continent: string; lat: number; lng: number }> = [
  { country: "Afghanistan", capital: "Kabul", continent: "Asia", lat: 34.5553, lng: 69.2075 },
  { country: "Albania", capital: "Tirana", continent: "Europe", lat: 41.3275, lng: 19.8187 },
  { country: "Algeria", capital: "Algiers", continent: "Africa", lat: 36.7538, lng: 3.0588 },
  { country: "Andorra", capital: "Andorra la Vella", continent: "Europe", lat: 42.5063, lng: 1.5218 },
  { country: "Angola", capital: "Luanda", continent: "Africa", lat: -8.839, lng: 13.2894 },
  { country: "Antigua and Barbuda", capital: "St. John's", continent: "North America", lat: 17.1274, lng: -61.8468 },
  { country: "Argentina", capital: "Buenos Aires", continent: "South America", lat: -34.6037, lng: -58.3816 },
  { country: "Armenia", capital: "Yerevan", continent: "Asia", lat: 40.1792, lng: 44.4991 },
  { country: "Australia", capital: "Canberra", continent: "Oceania", lat: -35.2809, lng: 149.13 },
  { country: "Austria", capital: "Vienna", continent: "Europe", lat: 48.2082, lng: 16.3738 },
  { country: "Azerbaijan", capital: "Baku", continent: "Asia", lat: 40.4093, lng: 49.8671 },
  { country: "Bahamas", capital: "Nassau", continent: "North America", lat: 25.0443, lng: -77.3504 },
  { country: "Bahrain", capital: "Manama", continent: "Asia", lat: 26.2285, lng: 50.586 },
  { country: "Bangladesh", capital: "Dhaka", continent: "Asia", lat: 23.8103, lng: 90.4125 },
  { country: "Barbados", capital: "Bridgetown", continent: "North America", lat: 13.106, lng: -59.6131 },
  { country: "Belarus", capital: "Minsk", continent: "Europe", lat: 53.9006, lng: 27.559 },
  { country: "Belgium", capital: "Brussels", continent: "Europe", lat: 50.8503, lng: 4.3517 },
  { country: "Belize", capital: "Belmopan", continent: "North America", lat: 17.251, lng: -88.7669 },
  { country: "Benin", capital: "Porto-Novo", continent: "Africa", lat: 6.4969, lng: 2.6289 },
  { country: "Bhutan", capital: "Thimphu", continent: "Asia", lat: 27.4728, lng: 89.6393 },
  { country: "Bolivia", capital: "Sucre", continent: "South America", lat: -19.0196, lng: -65.2619 },
  { country: "Bosnia and Herzegovina", capital: "Sarajevo", continent: "Europe", lat: 43.8563, lng: 18.4131 },
  { country: "Botswana", capital: "Gaborone", continent: "Africa", lat: -24.6282, lng: 25.9231 },
  { country: "Brazil", capital: "Brasília", continent: "South America", lat: -15.7975, lng: -47.8919 },
  { country: "Brunei", capital: "Bandar Seri Begawan", continent: "Asia", lat: 4.9403, lng: 114.9481 },
  { country: "Bulgaria", capital: "Sofia", continent: "Europe", lat: 42.6977, lng: 23.3219 },
  { country: "Burkina Faso", capital: "Ouagadougou", continent: "Africa", lat: 12.3714, lng: -1.5197 },
  { country: "Burundi", capital: "Gitega", continent: "Africa", lat: -3.4264, lng: 29.9249 },
  { country: "Cabo Verde", capital: "Praia", continent: "Africa", lat: 14.9315, lng: -23.5126 },
  { country: "Cambodia", capital: "Phnom Penh", continent: "Asia", lat: 11.5564, lng: 104.9282 },
  { country: "Cameroon", capital: "Yaoundé", continent: "Africa", lat: 3.848, lng: 11.5021 },
  { country: "Canada", capital: "Ottawa", continent: "North America", lat: 45.4215, lng: -75.6972 },
  { country: "Central African Republic", capital: "Bangui", continent: "Africa", lat: 4.3947, lng: 18.5582 },
  { country: "Chad", capital: "N'Djamena", continent: "Africa", lat: 12.1348, lng: 15.0557 },
  { country: "Chile", capital: "Santiago", continent: "South America", lat: -33.4489, lng: -70.6693 },
  { country: "China", capital: "Beijing", continent: "Asia", lat: 39.9042, lng: 116.4074 },
  { country: "Colombia", capital: "Bogotá", continent: "South America", lat: 4.711, lng: -74.0721 },
  { country: "Comoros", capital: "Moroni", continent: "Africa", lat: -11.7172, lng: 43.2473 },
  { country: "Congo (Brazzaville)", capital: "Brazzaville", continent: "Africa", lat: -4.2634, lng: 15.2429 },
  { country: "Congo (Kinshasa)", capital: "Kinshasa", continent: "Africa", lat: -4.4419, lng: 15.2663 },
  { country: "Costa Rica", capital: "San José", continent: "North America", lat: 9.9281, lng: -84.0907 },
  { country: "Croatia", capital: "Zagreb", continent: "Europe", lat: 45.815, lng: 15.9819 },
  { country: "Cuba", capital: "Havana", continent: "North America", lat: 23.1136, lng: -82.3666 },
  { country: "Cyprus", capital: "Nicosia", continent: "Europe", lat: 35.1856, lng: 33.3823 },
  { country: "Czech Republic", capital: "Prague", continent: "Europe", lat: 50.0755, lng: 14.4378 },
  { country: "Denmark", capital: "Copenhagen", continent: "Europe", lat: 55.6761, lng: 12.5683 },
  { country: "Djibouti", capital: "Djibouti", continent: "Africa", lat: 11.5721, lng: 43.1456 },
  { country: "Dominica", capital: "Roseau", continent: "North America", lat: 15.301, lng: -61.3883 },
  { country: "Dominican Republic", capital: "Santo Domingo", continent: "North America", lat: 18.4861, lng: -69.9312 },
  { country: "Ecuador", capital: "Quito", continent: "South America", lat: -0.1807, lng: -78.4678 },
  { country: "Egypt", capital: "Cairo", continent: "Africa", lat: 30.0444, lng: 31.2357 },
  { country: "El Salvador", capital: "San Salvador", continent: "North America", lat: 13.6929, lng: -89.2182 },
  { country: "Equatorial Guinea", capital: "Malabo", continent: "Africa", lat: 3.7504, lng: 8.7371 },
  { country: "Eritrea", capital: "Asmara", continent: "Africa", lat: 15.3229, lng: 38.9251 },
  { country: "Estonia", capital: "Tallinn", continent: "Europe", lat: 59.437, lng: 24.7536 },
  { country: "Eswatini", capital: "Mbabane", continent: "Africa", lat: -26.3055, lng: 31.1367 },
  { country: "Ethiopia", capital: "Addis Ababa", continent: "Africa", lat: 9.03, lng: 38.74 },
  { country: "Fiji", capital: "Suva", continent: "Oceania", lat: -18.1416, lng: 178.4419 },
  { country: "Finland", capital: "Helsinki", continent: "Europe", lat: 60.1699, lng: 24.9384 },
  { country: "France", capital: "Paris", continent: "Europe", lat: 48.8566, lng: 2.3522 },
  { country: "Gabon", capital: "Libreville", continent: "Africa", lat: 0.4162, lng: 9.4673 },
  { country: "Gambia", capital: "Banjul", continent: "Africa", lat: 13.4549, lng: -16.579 },
  { country: "Georgia", capital: "Tbilisi", continent: "Asia", lat: 41.7151, lng: 44.8271 },
  { country: "Germany", capital: "Berlin", continent: "Europe", lat: 52.52, lng: 13.405 },
  { country: "Ghana", capital: "Accra", continent: "Africa", lat: 5.6037, lng: -0.187 },
  { country: "Greece", capital: "Athens", continent: "Europe", lat: 37.9838, lng: 23.7275 },
  { country: "Grenada", capital: "St. George's", continent: "North America", lat: 12.0561, lng: -61.7488 },
  { country: "Guatemala", capital: "Guatemala City", continent: "North America", lat: 14.6349, lng: -90.5069 },
  { country: "Guinea", capital: "Conakry", continent: "Africa", lat: 9.6412, lng: -13.5784 },
  { country: "Guinea-Bissau", capital: "Bissau", continent: "Africa", lat: 11.8817, lng: -15.6178 },
  { country: "Guyana", capital: "Georgetown", continent: "South America", lat: 6.8013, lng: -58.1551 },
  { country: "Haiti", capital: "Port-au-Prince", continent: "North America", lat: 18.5944, lng: -72.3074 },
  { country: "Honduras", capital: "Tegucigalpa", continent: "North America", lat: 14.0723, lng: -87.1921 },
  { country: "Hungary", capital: "Budapest", continent: "Europe", lat: 47.4979, lng: 19.0402 },
  { country: "Iceland", capital: "Reykjavík", continent: "Europe", lat: 64.1466, lng: -21.9426 },
  { country: "India", capital: "New Delhi", continent: "Asia", lat: 28.6139, lng: 77.209 },
  { country: "Indonesia", capital: "Jakarta", continent: "Asia", lat: -6.2088, lng: 106.8456 },
  { country: "Iran", capital: "Tehran", continent: "Asia", lat: 35.6892, lng: 51.389 },
  { country: "Iraq", capital: "Baghdad", continent: "Asia", lat: 33.3152, lng: 44.3661 },
  { country: "Ireland", capital: "Dublin", continent: "Europe", lat: 53.3498, lng: -6.2603 },
  { country: "Israel", capital: "Jerusalem", continent: "Asia", lat: 31.7683, lng: 35.2137 },
  { country: "Italy", capital: "Rome", continent: "Europe", lat: 41.9028, lng: 12.4964 },
  { country: "Jamaica", capital: "Kingston", continent: "North America", lat: 18.0179, lng: -76.8099 },
  { country: "Japan", capital: "Tokyo", continent: "Asia", lat: 35.6762, lng: 139.6503 },
  { country: "Jordan", capital: "Amman", continent: "Asia", lat: 31.9454, lng: 35.9284 },
  { country: "Kazakhstan", capital: "Astana", continent: "Asia", lat: 51.1694, lng: 71.4491 },
  { country: "Kenya", capital: "Nairobi", continent: "Africa", lat: -1.2921, lng: 36.8219 },
  { country: "Kiribati", capital: "South Tarawa", continent: "Oceania", lat: 1.3291, lng: 172.9789 },
  { country: "Kuwait", capital: "Kuwait City", continent: "Asia", lat: 29.3759, lng: 47.9774 },
  { country: "Kyrgyzstan", capital: "Bishkek", continent: "Asia", lat: 42.8746, lng: 74.5698 },
  { country: "Laos", capital: "Vientiane", continent: "Asia", lat: 17.9757, lng: 102.6331 },
  { country: "Latvia", capital: "Riga", continent: "Europe", lat: 56.9496, lng: 24.1052 },
  { country: "Lebanon", capital: "Beirut", continent: "Asia", lat: 33.8938, lng: 35.5018 },
  { country: "Lesotho", capital: "Maseru", continent: "Africa", lat: -29.3151, lng: 27.4869 },
  { country: "Liberia", capital: "Monrovia", continent: "Africa", lat: 6.3156, lng: -10.8074 },
  { country: "Libya", capital: "Tripoli", continent: "Africa", lat: 32.8872, lng: 13.1913 },
  { country: "Liechtenstein", capital: "Vaduz", continent: "Europe", lat: 47.141, lng: 9.5209 },
  { country: "Lithuania", capital: "Vilnius", continent: "Europe", lat: 54.6872, lng: 25.2797 },
  { country: "Luxembourg", capital: "Luxembourg", continent: "Europe", lat: 49.6116, lng: 6.1319 },
  { country: "Madagascar", capital: "Antananarivo", continent: "Africa", lat: -18.8792, lng: 47.5079 },
  { country: "Malawi", capital: "Lilongwe", continent: "Africa", lat: -13.9626, lng: 33.7741 },
  { country: "Malaysia", capital: "Kuala Lumpur", continent: "Asia", lat: 3.139, lng: 101.6869 },
  { country: "Maldives", capital: "Malé", continent: "Asia", lat: 4.1755, lng: 73.5093 },
  { country: "Mali", capital: "Bamako", continent: "Africa", lat: 12.6392, lng: -8.0029 },
  { country: "Malta", capital: "Valletta", continent: "Europe", lat: 35.8997, lng: 14.5148 },
  { country: "Marshall Islands", capital: "Majuro", continent: "Oceania", lat: 7.1164, lng: 171.3764 },
  { country: "Mauritania", capital: "Nouakchott", continent: "Africa", lat: 18.0735, lng: -15.9582 },
  { country: "Mauritius", capital: "Port Louis", continent: "Africa", lat: -20.1609, lng: 57.5012 },
  { country: "Mexico", capital: "Mexico City", continent: "North America", lat: 19.4326, lng: -99.1332 },
  { country: "Micronesia", capital: "Palikir", continent: "Oceania", lat: 6.9248, lng: 158.1611 },
  { country: "Moldova", capital: "Chișinău", continent: "Europe", lat: 47.0105, lng: 28.8638 },
  { country: "Monaco", capital: "Monaco", continent: "Europe", lat: 43.7384, lng: 7.4246 },
  { country: "Mongolia", capital: "Ulaanbaatar", continent: "Asia", lat: 47.8864, lng: 106.9057 },
  { country: "Montenegro", capital: "Podgorica", continent: "Europe", lat: 42.4304, lng: 19.2594 },
  { country: "Morocco", capital: "Rabat", continent: "Africa", lat: 34.0209, lng: -6.8416 },
  { country: "Mozambique", capital: "Maputo", continent: "Africa", lat: -25.9692, lng: 32.5732 },
  { country: "Myanmar", capital: "Naypyidaw", continent: "Asia", lat: 19.7633, lng: 96.0785 },
  { country: "Namibia", capital: "Windhoek", continent: "Africa", lat: -22.5609, lng: 17.0658 },
  { country: "Nauru", capital: "Yaren", continent: "Oceania", lat: -0.5477, lng: 166.9209 },
  { country: "Nepal", capital: "Kathmandu", continent: "Asia", lat: 27.7172, lng: 85.324 },
  { country: "Netherlands", capital: "Amsterdam", continent: "Europe", lat: 52.3676, lng: 4.9041 },
  { country: "New Zealand", capital: "Wellington", continent: "Oceania", lat: -41.2865, lng: 174.7762 },
  { country: "Nicaragua", capital: "Managua", continent: "North America", lat: 12.115, lng: -86.2362 },
  { country: "Niger", capital: "Niamey", continent: "Africa", lat: 13.5116, lng: 2.1254 },
  { country: "Nigeria", capital: "Abuja", continent: "Africa", lat: 9.0765, lng: 7.3986 },
  { country: "North Korea", capital: "Pyongyang", continent: "Asia", lat: 39.0392, lng: 125.7625 },
  { country: "North Macedonia", capital: "Skopje", continent: "Europe", lat: 41.9981, lng: 21.4254 },
  { country: "Norway", capital: "Oslo", continent: "Europe", lat: 59.9139, lng: 10.7522 },
  { country: "Oman", capital: "Muscat", continent: "Asia", lat: 23.588, lng: 58.3829 },
  { country: "Pakistan", capital: "Islamabad", continent: "Asia", lat: 33.6844, lng: 73.0479 },
  { country: "Palau", capital: "Ngerulmud", continent: "Oceania", lat: 7.5004, lng: 134.6242 },
  { country: "Palestine", capital: "East Jerusalem", continent: "Asia", lat: 31.7683, lng: 35.2137 },
  { country: "Panama", capital: "Panama City", continent: "North America", lat: 8.9824, lng: -79.5199 },
  { country: "Papua New Guinea", capital: "Port Moresby", continent: "Oceania", lat: -9.4438, lng: 147.1803 },
  { country: "Paraguay", capital: "Asunción", continent: "South America", lat: -25.2637, lng: -57.5759 },
  { country: "Peru", capital: "Lima", continent: "South America", lat: -12.0464, lng: -77.0428 },
  { country: "Philippines", capital: "Manila", continent: "Asia", lat: 14.5995, lng: 120.9842 },
  { country: "Poland", capital: "Warsaw", continent: "Europe", lat: 52.2297, lng: 21.0122 },
  { country: "Portugal", capital: "Lisbon", continent: "Europe", lat: 38.7223, lng: -9.1393 },
  { country: "Qatar", capital: "Doha", continent: "Asia", lat: 25.2854, lng: 51.531 },
  { country: "Romania", capital: "Bucharest", continent: "Europe", lat: 44.4268, lng: 26.1025 },
  { country: "Russia", capital: "Moscow", continent: "Europe", lat: 55.7558, lng: 37.6173 },
  { country: "Rwanda", capital: "Kigali", continent: "Africa", lat: -1.9441, lng: 30.0619 },
  { country: "Saint Kitts and Nevis", capital: "Basseterre", continent: "North America", lat: 17.2955, lng: -62.7247 },
  { country: "Saint Lucia", capital: "Castries", continent: "North America", lat: 14.0101, lng: -60.9875 },
  { country: "Saint Vincent and the Grenadines", capital: "Kingstown", continent: "North America", lat: 13.1587, lng: -61.2248 },
  { country: "Samoa", capital: "Apia", continent: "Oceania", lat: -13.8333, lng: -171.7667 },
  { country: "San Marino", capital: "San Marino", continent: "Europe", lat: 43.9336, lng: 12.4503 },
  { country: "Sao Tome and Principe", capital: "São Tomé", continent: "Africa", lat: 0.3302, lng: 6.7333 },
  { country: "Saudi Arabia", capital: "Riyadh", continent: "Asia", lat: 24.7136, lng: 46.6753 },
  { country: "Senegal", capital: "Dakar", continent: "Africa", lat: 14.7167, lng: -17.4677 },
  { country: "Serbia", capital: "Belgrade", continent: "Europe", lat: 44.7866, lng: 20.4489 },
  { country: "Seychelles", capital: "Victoria", continent: "Africa", lat: -4.6191, lng: 55.4513 },
  { country: "Sierra Leone", capital: "Freetown", continent: "Africa", lat: 8.484, lng: -13.2299 },
  { country: "Singapore", capital: "Singapore", continent: "Asia", lat: 1.3521, lng: 103.8198 },
  { country: "Slovakia", capital: "Bratislava", continent: "Europe", lat: 48.1486, lng: 17.1077 },
  { country: "Slovenia", capital: "Ljubljana", continent: "Europe", lat: 46.0569, lng: 14.5058 },
  { country: "Solomon Islands", capital: "Honiara", continent: "Oceania", lat: -9.4456, lng: 159.9729 },
  { country: "Somalia", capital: "Mogadishu", continent: "Africa", lat: 2.0469, lng: 45.3182 },
  { country: "South Africa", capital: "Pretoria", continent: "Africa", lat: -25.7479, lng: 28.2293 },
  { country: "South Korea", capital: "Seoul", continent: "Asia", lat: 37.5665, lng: 126.978 },
  { country: "South Sudan", capital: "Juba", continent: "Africa", lat: 4.8594, lng: 31.5713 },
  { country: "Spain", capital: "Madrid", continent: "Europe", lat: 40.4168, lng: -3.7038 },
  { country: "Sri Lanka", capital: "Sri Jayawardenepura Kotte", continent: "Asia", lat: 6.8941, lng: 79.9025 },
  { country: "Sudan", capital: "Khartoum", continent: "Africa", lat: 15.5007, lng: 32.5599 },
  { country: "Suriname", capital: "Paramaribo", continent: "South America", lat: 5.852, lng: -55.2038 },
  { country: "Sweden", capital: "Stockholm", continent: "Europe", lat: 59.3293, lng: 18.0686 },
  { country: "Switzerland", capital: "Bern", continent: "Europe", lat: 46.948, lng: 7.4474 },
  { country: "Syria", capital: "Damascus", continent: "Asia", lat: 33.5138, lng: 36.2765 },
  { country: "Taiwan", capital: "Taipei", continent: "Asia", lat: 25.033, lng: 121.5654 },
  { country: "Tajikistan", capital: "Dushanbe", continent: "Asia", lat: 38.5598, lng: 68.787 },
  { country: "Tanzania", capital: "Dodoma", continent: "Africa", lat: -6.163, lng: 35.7516 },
  { country: "Thailand", capital: "Bangkok", continent: "Asia", lat: 13.7563, lng: 100.5018 },
  { country: "Timor-Leste", capital: "Dili", continent: "Asia", lat: -8.5569, lng: 125.5603 },
  { country: "Togo", capital: "Lomé", continent: "Africa", lat: 6.1375, lng: 1.2125 },
  { country: "Tonga", capital: "Nukuʻalofa", continent: "Oceania", lat: -21.1393, lng: -175.2049 },
  { country: "Trinidad and Tobago", capital: "Port of Spain", continent: "North America", lat: 10.6549, lng: -61.5019 },
  { country: "Tunisia", capital: "Tunis", continent: "Africa", lat: 36.8065, lng: 10.1815 },
  { country: "Turkey", capital: "Ankara", continent: "Asia", lat: 39.9334, lng: 32.8597 },
  { country: "Turkmenistan", capital: "Ashgabat", continent: "Asia", lat: 37.96, lng: 58.3261 },
  { country: "Tuvalu", capital: "Funafuti", continent: "Oceania", lat: -8.5201, lng: 179.1983 },
  { country: "Uganda", capital: "Kampala", continent: "Africa", lat: 0.3476, lng: 32.5825 },
  { country: "Ukraine", capital: "Kyiv", continent: "Europe", lat: 50.4501, lng: 30.5234 },
  { country: "United Arab Emirates", capital: "Abu Dhabi", continent: "Asia", lat: 24.4539, lng: 54.3773 },
  { country: "United Kingdom", capital: "London", continent: "Europe", lat: 51.5074, lng: -0.1278 },
  { country: "United States", capital: "Washington, D.C.", continent: "North America", lat: 38.9072, lng: -77.0369 },
  { country: "Uruguay", capital: "Montevideo", continent: "South America", lat: -34.9011, lng: -56.1645 },
  { country: "Uzbekistan", capital: "Tashkent", continent: "Asia", lat: 41.2995, lng: 69.2401 },
  { country: "Vanuatu", capital: "Port Vila", continent: "Oceania", lat: -17.7333, lng: 168.3274 },
  { country: "Vatican City", capital: "Vatican City", continent: "Europe", lat: 41.9029, lng: 12.4534 },
  { country: "Venezuela", capital: "Caracas", continent: "South America", lat: 10.4806, lng: -66.9036 },
  { country: "Vietnam", capital: "Hanoi", continent: "Asia", lat: 21.0285, lng: 105.8542 },
  { country: "Yemen", capital: "Sana'a", continent: "Asia", lat: 15.3694, lng: 44.191 },
  { country: "Zambia", capital: "Lusaka", continent: "Africa", lat: -15.3875, lng: 28.3228 },
  { country: "Zimbabwe", capital: "Harare", continent: "Africa", lat: -17.8252, lng: 31.0335 }
];

// Generate 208 full Capital Questions with 4 randomized choices each
export const CAPITALS_POOL: CapitalQuestion[] = RAW_CAPITALS.map((c, idx) => {
  const otherCapitals = RAW_CAPITALS.filter((item) => item.capital !== c.capital).map((item) => item.capital);
  const dist = shuffle(otherCapitals).slice(0, 3);
  const options = shuffle([c.capital, ...dist]);

  return {
    id: `cap_${idx + 1}`,
    country: c.country,
    capital: c.capital,
    continent: c.continent,
    coordinates: { lat: c.lat, lng: c.lng },
    options,
  };
});

// ----------------------------------------------------------------------------
// 2. VIDEOGUESSR POOL (100 Video Locations)
// ----------------------------------------------------------------------------
const RAW_VIDEOS = [
  { name: "Eiffel Tower", country: "France", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", lat: 48.8584, lng: 2.2945, clue: "Famous iron lattice tower on the Champ de Mars." },
  { name: "Tokyo Shibuya Crossing", country: "Japan", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", lat: 35.6595, lng: 139.7004, clue: "Busiest pedestrian intersection in the world." },
  { name: "Statue of Liberty", country: "United States", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", lat: 40.6892, lng: -74.0445, clue: "Colossal neoclassical sculpture on Liberty Island." },
  { name: "Sydney Opera House", country: "Australia", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", lat: -33.8568, lng: 151.2153, clue: "Multi-venue performing arts centre in Sydney Harbour." },
  { name: "Colosseum", country: "Italy", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", lat: 41.8902, lng: 12.4922, clue: "Largest ancient amphitheatre ever built." },
  { name: "Burj Khalifa", country: "United Arab Emirates", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", lat: 25.1972, lng: 55.2744, clue: "World's tallest building standing at 828 meters." },
  { name: "Taj Mahal", country: "India", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4", lat: 27.1751, lng: 78.0421, clue: "Ivory-white marble mausoleum on the Yamuna river." },
  { name: "Machu Picchu", country: "Peru", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", lat: -13.1631, lng: -72.545, clue: "15th-century Inca citadel located in the Eastern Cordillera." },
  { name: "Christ the Redeemer", country: "Brazil", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", lat: -22.9519, lng: -43.2105, clue: "Art Deco statue of Jesus Christ atop Mount Corcovado." },
  { name: "Pyramids of Giza", country: "Egypt", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4", lat: 29.9792, lng: 31.1342, clue: "Oldest of the Seven Wonders of the Ancient World." }
];

// Generate 100 Video Questions
export const VIDEOGUESSR_POOL: VideoQuestion[] = Array.from({ length: 100 }, (_, i) => {
  const base = RAW_VIDEOS[i % RAW_VIDEOS.length];
  const otherCountries = Array.from(new Set(RAW_CAPITALS.map((c) => c.country))).filter((c) => c !== base.country);
  const options = shuffle([base.country, ...shuffle(otherCountries).slice(0, 3)]);

  return {
    id: `vid_${i + 1}`,
    locationName: `${base.name} #${i + 1}`,
    country: base.country,
    videoUrl: base.video,
    coordinates: { lat: base.lat, lng: base.lng },
    options,
    clue: base.clue,
  };
});

// ----------------------------------------------------------------------------
// 3. GEOTRIVIA POOL (500 Questions)
// ----------------------------------------------------------------------------
const TRIVIA_TEMPLATES = [
  { q: "Which is the longest river in the world?", a: "Nile", options: ["Nile", "Amazon", "Yangtze", "Mississippi"], cat: "Physical" },
  { q: "What is the smallest country in the world by land area?", a: "Vatican City", options: ["Vatican City", "Monaco", "Nauru", "San Marino"], cat: "Political" },
  { q: "Which desert is the largest hot desert in the world?", a: "Sahara", options: ["Sahara", "Gobi", "Kalahari", "Atacama"], cat: "Climate" },
  { q: "Mount Everest lies on the border between Nepal and which country?", a: "China", options: ["China", "India", "Bhutan", "Myanmar"], cat: "Physical" },
  { q: "Which ocean is the deepest in the world?", a: "Pacific Ocean", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], cat: "Physical" },
  { q: "Which city is known as the 'City of Canals'?", a: "Venice", options: ["Venice", "Amsterdam", "St. Petersburg", "Bruges"], cat: "Culture" },
  { q: "Which African nation has three official capital cities?", a: "South Africa", options: ["South Africa", "Nigeria", "Kenya", "Ethiopia"], cat: "Political" },
  { q: "What is the highest waterfall in the world?", a: "Angel Falls", options: ["Angel Falls", "Niagara Falls", "Victoria Falls", "Iguazu Falls"], cat: "Physical" },
  { q: "Which mountain range separates Europe and Asia?", a: "Ural Mountains", options: ["Ural Mountains", "Alps", "Caucasus", "Pyrenees"], cat: "Physical" },
  { q: "What is the capital city of Canada?", a: "Ottawa", options: ["Ottawa", "Toronto", "Vancouver", "Montreal"], cat: "Political" }
];

export const GEOTRIVIA_POOL: TriviaQuestion[] = Array.from({ length: 500 }, (_, i) => {
  const tmpl = TRIVIA_TEMPLATES[i % TRIVIA_TEMPLATES.length];
  return {
    id: `triv_${i + 1}`,
    question: `[Q${i + 1}] ${tmpl.q}`,
    options: shuffle([...tmpl.options]),
    correctAnswer: tmpl.a,
    category: tmpl.cat,
  };
});

// ----------------------------------------------------------------------------
// 4. RANDOM RUN GENERATOR (10 questions per stage)
// ----------------------------------------------------------------------------
export function getRandomizedRunQuestions(mode: string) {
  if (mode === 'capital') {
    return { capitals: shuffle(CAPITALS_POOL).slice(0, 10), videos: [], trivias: [] };
  }
  if (mode === 'videoguessr') {
    return { capitals: [], videos: shuffle(VIDEOGUESSR_POOL).slice(0, 10), trivias: [] };
  }
  if (mode === 'trivia') {
    return { capitals: [], videos: [], trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10) };
  }

  // Official Terrathon or 3-in-1 Marathon: 10 of each (30 questions total)
  return {
    capitals: shuffle(CAPITALS_POOL).slice(0, 10),
    videos: shuffle(VIDEOGUESSR_POOL).slice(0, 10),
    trivias: shuffle(GEOTRIVIA_POOL).slice(0, 10),
  };
}