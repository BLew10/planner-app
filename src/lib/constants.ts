const countryList = [
  "United States",
  "Afghanistan",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antarctica",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas (the)",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia (Plurinational State of)",
  "Bonaire, Sint Eustatius and Saba",
  "Bosnia and Herzegovina",
  "Botswana",
  "Bouvet Island",
  "Brazil",
  "British Indian Ocean Territory (the)",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cayman Islands (the)",
  "Central African Republic (the)",
  "Chad",
  "Chile",
  "China",
  "Christmas Island",
  "Cocos (Keeling) Islands (the)",
  "Colombia",
  "Comoros (the)",
  "Congo (the Democratic Republic of the)",
  "Congo (the)",
  "Cook Islands (the)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Curaçao",
  "Cyprus",
  "Czechia",
  "Côte d'Ivoire",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic (the)",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Falkland Islands (the) [Malvinas]",
  "Faroe Islands (the)",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "French Southern Territories (the)",
  "Gabon",
  "Gambia (the)",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Heard Island and McDonald Islands",
  "Holy See (the)",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran (Islamic Republic of)",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea (the Democratic People's Republic of)",
  "Korea (the Republic of)",
  "Kuwait",
  "Kyrgyzstan",
  "Lao People's Democratic Republic (the)",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands (the)",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mayotte",
  "Mexico",
  "Micronesia (Federated States of)",
  "Moldova (the Republic of)",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands (the)",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger (the)",
  "Nigeria",
  "Niue",
  "Norfolk Island",
  "Northern Mariana Islands (the)",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine, State of",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines (the)",
  "Pitcairn",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Republic of North Macedonia",
  "Romania",
  "Russian Federation (the)",
  "Rwanda",
  "Réunion",
  "Saint Barthélemy",
  "Saint Helena, Ascension and Tristan da Cunha",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Martin (French part)",
  "Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Sint Maarten (Dutch part)",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Georgia and the South Sandwich Islands",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan (the)",
  "Suriname",
  "Svalbard and Jan Mayen",
  "Sweden",
  "Switzerland",
  "Syrian Arab Republic",
  "Taiwan",
  "Tajikistan",
  "Tanzania, United Republic of",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tokelau",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks and Caicos Islands (the)",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates (the)",
  "United Kingdom of Great Britain and Northern Ireland (the)",
  "United States Minor Outlying Islands (the)",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela (Bolivarian Republic of)",
  "Viet Nam",
  "Virgin Islands (British)",
  "Virgin Islands (U.S.)",
  "Wallis and Futuna",
  "Western Sahara",
  "Yemen",
  "Zambia",
  "Zimbabwe",
  "Åland Islands",
];

export const COUNTRIES = countryList.map((country) => {
  return {
    value: country,
    label: country,
  };
});

export const STATES = [
  { value: "CA", label: "California" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export const CATEGORIES = [
  { value: "0", label: "Please select" },
  { value: "1", label: "Accountants" },
  { value: "2", label: "Ad Agencies" },
  { value: "3", label: "Appliance, Repair" },
  { value: "4", label: "Appliance, Retail" },
  { value: "5", label: "Arts and Crafts" },
  { value: "6", label: "Arts and Entertainment - Bands, Concerts" },
  {
    value: "7",
    label: "Arts and Entertainment - Banquet Halls, Venues, Event Centers",
  },
  {
    value: "8",
    label: "Arts and Entertainment - Batting Cages, Go-Karts, Mini Golf",
  },
  { value: "9", label: "Arts and Entertainment - Casinos" },
  { value: "10", label: "Arts and Entertainment - Festivals, Fairs, Galas" },
  { value: "11", label: "Arts and Entertainment - Fireworks" },
  {
    value: "12",
    label:
      "Arts and Entertainment - Fun Centers, Trampoline Parks, Escape Rooms",
  },
  { value: "13", label: "Arts and Entertainment - Movies, Theaters" },
  { value: "14", label: "Arts and Entertainment - Museums" },
  { value: "15", label: "Arts and Entertainment - Other" },
  { value: "16", label: "Arts and Entertainment - Parks, Recreation" },
  { value: "17", label: "Attorneys, Lawyers" },
  { value: "18", label: "Bagels" },
  { value: "19", label: "Bakeries, Donuts" },
  { value: "20", label: "Banks, Credit Unions" },
  { value: "21", label: "Batteries" },
  { value: "22", label: "Beer, Liquor, Wine" },
  { value: "23", label: "Bicycles" },
  { value: "24", label: "Bookstores, Comics" },
  { value: "25", label: "Bowling" },
  { value: "26", label: "Business to Business" },
  { value: "27", label: "Car, Truck, and Auto - Body" },
  { value: "28", label: "Car, Truck, and Auto - Dealers" },
  { value: "29", label: "Car, Truck, and Auto - Gas, Marts, Stations" },
  { value: "30", label: "Car, Truck, and Auto - Oil Change" },
  { value: "31", label: "Car, Truck, and Auto - Other" },
  { value: "32", label: "Car, Truck, and Auto - Rentals" },
  { value: "33", label: "Car, Truck, and Auto - Repair" },
  { value: "34", label: "Car, Truck, and Auto - Supplies, Parts" },
  { value: "35", label: "Car, Truck, and Auto - Tires" },
  { value: "36", label: "Car, Truck, and Auto - Towing" },
  { value: "37", label: "Car, Truck, and Auto - Transmissions" },
  { value: "38", label: "Car, Truck, and Auto - Used Cars" },
  { value: "39", label: "Car, Truck, and Auto - Used Parts, Salvage Yards" },
  { value: "40", label: "Car, Truck, and Auto - Wash" },
  { value: "41", label: "Carpet Cleaning, Restoration" },
  { value: "42", label: "Cellular, Accessories, Pagers, Service, Stores" },
  { value: "43", label: "Cemeteries, Cremation" },
  { value: "44", label: "Chambers of Commerce" },
  { value: "45", label: "Charities, Nonprofit" },
  { value: "46", label: "Childcare, Daycare" },
  { value: "47", label: "Clothing - Clothes, Fashion" },
  { value: "48", label: "Clothing - Embroidery" },
  { value: "49", label: "Clothing - Tailors, Seamstresses" },
  { value: "50", label: "Community and Government" },
  { value: "51", label: "Computers" },
  { value: "52", label: "Construction, Builders, Architects" },
  { value: "53", label: "Consumers" },
  { value: "54", label: "Dance, Gymnastics" },
  { value: "55", label: "Dentists, Orthodontists" },
  { value: "56", label: "Dry Cleaners" },
  { value: "57", label: "Education - Colleges and Universities, Adult" },
  { value: "58", label: "Education - Preschool, K-12" },
  { value: "59", label: "Electricians" },
  { value: "60", label: "Electronics" },
  { value: "61", label: "Financial, Investments" },
  { value: "62", label: "Firearms, Fishing, Ammo" },
  { value: "63", label: "Fitness" },
  { value: "64", label: "Florists" },
  { value: "65", label: "Food, Restaurants - Asian" },
  { value: "66", label: "Food, Restaurants - Barbecue" },
  { value: "67", label: "Food, Restaurants - Bars, Grills" },
  { value: "68", label: "Food, Restaurants - Buffet" },
  { value: "69", label: "Food, Restaurants - Cafe" },
  { value: "70", label: "Food, Restaurants - Catering" },
  { value: "71", label: "Food, Restaurants - Coffee" },
  { value: "72", label: "Food, Restaurants - Deli" },
  { value: "73", label: "Food, Restaurants - Family, Dining" },
  { value: "74", label: "Food, Restaurants - Fast" },
  { value: "75", label: "Food, Restaurants - French" },
  { value: "76", label: "Food, Restaurants - Indian" },
  { value: "77", label: "Food, Restaurants - Juicers, Smoothies" },
  { value: "78", label: "Food, Restaurants - Mexican" },
  { value: "79", label: "Food, Restaurants - Other" },
  { value: "80", label: "Food, Restaurants - Pizza, Italian" },
  { value: "81", label: "Food, Restaurants - Seafood" },
  { value: "82", label: "Food, Restaurants - Steak House" },
  { value: "83", label: "Food, Restaurants - Sushi" },
  { value: "84", label: "Food, Restaurants - Thai" },
  { value: "85", label: "Framing" },
  { value: "86", label: "Funeral Homes" },
  { value: "87", label: "Furniture, Stores" },
  { value: "88", label: "Furniture, Upholstery" },
  { value: "89", label: "Gifts, Card Shops, Party Supplies" },
  { value: "90", label: "Golf" },
  { value: "91", label: "Grocers, Grocery, Markets" },
  { value: "92", label: "Hair, Skin, Nails" },
  { value: "93", label: "Hardware" },
  { value: "94", label: "Health - Food Stores" },
  { value: "95", label: "Health - Other" },
  { value: "96", label: "Health - Supplements" },
  { value: "97", label: "Heating and Cooling" },
  { value: "98", label: "Hobby Stores, Toy Stores" },
  { value: "99", label: "Home Improvement - Bathrooms" },
  { value: "100", label: "Home Improvement - Carpet, Flooring" },
  { value: "101", label: "Home Improvement - Chimneys" },
  { value: "102", label: "Home Improvement - Decks, Patios" },
  { value: "103", label: "Home Improvement - Doors, Windows" },
  { value: "104", label: "Home Improvement - Driveways" },
  { value: "105", label: "Home Improvement - Fencing" },
  { value: "106", label: "Home Improvement - Kitchens" },
  { value: "107", label: "Home Improvement - Other" },
  { value: "108", label: "Home Improvement - Remodel, Painters" },
  { value: "109", label: "Home Improvement - Roofing" },
  { value: "110", label: "Home Improvement - Siding" },
  { value: "111", label: "Hotels" },
  { value: "112", label: "Housewares" },
  { value: "113", label: "Ice Cream, Candy, Yogurt" },
  { value: "114", label: "Independent Sales Consultants" },
  { value: "115", label: "Insurance" },
  { value: "116", label: "Interiors - Blinds" },
  { value: "117", label: "Interiors - Carpet, Flooring" },
  { value: "118", label: "Interiors - Lighting, Fixtures" },
  { value: "119", label: "Interiors - Wallpaper" },
  { value: "120", label: "Internet, Networking, Service" },
  { value: "121", label: "Jewelers" },
  { value: "122", label: "Jobs, Job Openings" },
  { value: "123", label: "Landscaping, Lawn, Tree Service" },
  { value: "124", label: "Lawn, Garden Centers, Nurseries" },
  { value: "125", label: "Lawn, Mowers, Shops" },
  { value: "126", label: "Libraries" },
  { value: "127", label: "Lighting Fixtures" },
  { value: "128", label: "Limo, Taxi Service, Public Transportation" },
  { value: "129", label: "Locksmiths" },
  { value: "130", label: "Maid Service, House Cleaning, Window Cleaning" },
  { value: "131", label: "Marine, Boats, Service" },
  { value: "132", label: "Martial Arts" },
  {
    value: "133",
    label: "Medical, Physicians and Doctors - Anesthesiologists",
  },
  {
    value: "134",
    label: "Medical, Physicians and Doctors - Audiologists, Hearing",
  },
  { value: "135", label: "Medical, Physicians and Doctors - Cardiologists" },
  { value: "136", label: "Medical, Physicians and Doctors - Chiropractors" },
  { value: "137", label: "Medical, Physicians and Doctors - Dermatologists" },
  {
    value: "138",
    label: "Medical, Physicians and Doctors - Ear, Nose, Throat",
  },
  { value: "139", label: "Medical, Physicians and Doctors - Family Medicine" },
  { value: "140", label: "Medical, Physicians and Doctors - Health Services" },
  { value: "141", label: "Medical, Physicians and Doctors - Home Health Care" },
  {
    value: "142",
    label:
      "Medical, Physicians and Doctors - Hospital, Health Centers, Urgent Care",
  },
  {
    value: "143",
    label: "Medical, Physicians and Doctors - Internal Medicine",
  },
  {
    value: "144",
    label:
      "Medical, Physicians and Doctors - Massage Clinics, Therapists, Spas",
  },
  {
    value: "145",
    label:
      "Medical, Physicians and Doctors - Mental Health, Counseling, Psychologists",
  },
  { value: "146", label: "Medical, Physicians and Doctors - OBGYN" },
  { value: "147", label: "Medical, Physicians and Doctors - Oncologists" },
  { value: "148", label: "Medical, Physicians and Doctors - Ophthalmologists" },
  { value: "149", label: "Medical, Physicians and Doctors - Orthopedics" },
  { value: "150", label: "Medical, Physicians and Doctors - Other" },
  { value: "151", label: "Medical, Physicians and Doctors - Pediatricians" },
  { value: "152", label: "Medical, Physicians and Doctors - Podiatrists" },
  { value: "153", label: "Medical, Physicians and Doctors - Sports Medicine" },
  { value: "154", label: "Mortgages, Loans" },
  { value: "155", label: "Music, Lessons" },
  { value: "156", label: "Music, Stores" },
  { value: "157", label: "Newspapers, Radio, Television Stations" },
  { value: "158", label: "Nursing Homes/Hospice" },
  { value: "159", label: "Optical, Optometrist" },
  { value: "160", label: "Packaging, Shipping" },
  { value: "161", label: "Personal Care Services" },
  { value: "162", label: "Pest Control" },
  { value: "163", label: "Pets - Boarding, Day Care" },
  { value: "164", label: "Pets - Feed, Products" },
  { value: "165", label: "Pets - Other" },
  { value: "166", label: "Pets - Services, Grooming" },
  { value: "167", label: "Pets - Shops" },
  { value: "168", label: "Pets - Veterinarians" },
  { value: "169", label: "Pharmacies" },
  { value: "170", label: "Photography, Processing, Cameras" },
  { value: "171", label: "Plumbing" },
  { value: "172", label: "Political" },
  { value: "173", label: "Pools" },
  { value: "174", label: "Powersports, Motorcycles, Scooters, Utes" },
  { value: "175", label: "Propane, Propane Refills, Accessories" },
  { value: "176", label: "Real Estate - Agents" },
  { value: "177", label: "Real Estate - Apartments, Condos" },
  { value: "178", label: "Real Estate - Commercial" },
  { value: "179", label: "Real Estate - Inspection" },
  { value: "180", label: "Real Estate - Mobile Homes" },
  { value: "181", label: "Real Estate - Movers" },
  { value: "182", label: "Real Estate - Other" },
  { value: "183", label: "Real Estate - Property Management" },
  { value: "184", label: "Religious - Churches, Synagogues, Mosques" },
  { value: "185", label: "Rentals, Equipment, Tools" },
  { value: "186", label: "Resale, Pawn Shops, Consignment" },
  { value: "187", label: "Retirement Homes, Assisted Living" },
  { value: "188", label: "Security, Home Automation" },
  { value: "189", label: "Senior Citizen Services" },
  { value: "190", label: "Septic, Sewers" },
  { value: "191", label: "Shoes" },
  { value: "192", label: "Shopping - Children's Stores" },
  { value: "193", label: "Shopping - Department Stores, Retail Stores" },
  { value: "194", label: "Shopping - Other" },
  { value: "195", label: "Shopping - Shopping Centers, Malls" },
  { value: "196", label: "Shopping - Wedding, Bridal" },
  { value: "197", label: "Sporting Goods" },
  { value: "198", label: "Sports Teams, Clubs" },
  { value: "199", label: "Storage" },
  { value: "200", label: "Tanning" },
  { value: "201", label: "Television - Cable" },
  { value: "202", label: "Television - Sales, Repair" },
  { value: "203", label: "Tobacco, CBD" },
  { value: "204", label: "Tourism, Travel - Agents" },
  { value: "205", label: "Tourism, Travel - Airlines, Airports" },
  { value: "206", label: "Tourism, Travel - Cruises" },
  { value: "207", label: "Tourism, Travel - Historical Places" },
  { value: "208", label: "Tourism, Travel - Other" },
  { value: "209", label: "Tourism, Travel - Resorts, Spas" },
  { value: "210", label: "Tourism, Travel - Vacation Rentals" },
  { value: "211", label: "Tourism, Travel - Wineries, Vineyards" },
  { value: "212", label: "Town Planner Publisher" },
  { value: "213", label: "Unclassified, Miscellaneous" },
  { value: "214", label: "Utilities" },
  { value: "215", label: "Video Rental" },
  { value: "216", label: "Waste Management - Other" },
  { value: "217", label: "Waste Management - Recycling" },
  { value: "218", label: "Waste Management - Trash" },
  { value: "219", label: "Water Treatment, Softeners, Systems" },
  { value: "220", label: "Weight Loss" },
];
function generateFutureYears() {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let i = 0; i <= 25; i++) {
    years.push({
      value: String(currentYear + i),
      label: String(currentYear + i),
    });
  }

  return years;
}

export const YEARS = generateFutureYears();

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type PaymentFrequencyType = "Daily" | "Weekly" | "Monthly" | "Annually";
export const PAYMENT_FREQUENCIES: { value: PaymentFrequencyType, label: string }[] = [
  {
    value: "Daily",
    label: "Daily",
  },
  {
    value: "Weekly",
    label: "Weekly",
  },
  {
    value: "Monthly",
    label: "Monthly",
  },
  {
    value: "Annually",
    label: "Annually",
  },
]

export type PaymentStatusType = 'Pending' | 'Completed' | 'Cancelled' | 'In Progress';
export type InvoiceStatusType = 'Pending' | 'Paid' | 'Late' | 'Refunded' | 'Failed' | 'Voided' | 'In Progress' | 'Cancelled' | 'Uncollectible';

export const PAYMENT_STATUSES: { value: PaymentStatusType, label: string }[] = [
  {
    value: "Pending",
    label: "Pending",
  },
  {
    value: "In Progress",
    label: "In Progress",
  },
  {
    value: "Completed",
    label: "Completed",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
  }
]
