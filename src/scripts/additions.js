const fs = require("fs");
const csvParser = require("csv-parser");
// const { parseContactFormData } = require("../lib/data/contact");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sponsorsAndProspectsCSV = "./data/contacts.csv";

async function seedContactsFromCSV() {
  // Read and parse the CSV file
  const contacts = [];
  const addressBook = await createAddressBook();
  fs.createReadStream(sponsorsAndProspectsCSV)
    .pipe(csvParser())
    .on("data", (row) => {
      const contact = mapKeys(row);
      contacts.push(contact);
    })
    .on("end", async () => {
      let count = 0;
      console.log("Starting to process contacts");
      const length = contacts.length;
      const user = await prisma.user.findFirst({
        where: {
          firstName: "Joyce",
        },
      });
      for (const contact of contacts) {
        count++;
        console.log(`Processing contact ${count} of ${length}`);
        if (!contact) {
          console.log("Skipping empty contact");
          continue;
        }
        await upserContact(contact, addressBook.id, user.id);
      }

      console.log("All contacts have been processed");
    });
}

const mapKeys = (contact) => {
  try {
    let mappedContact = {};
    Object.keys(contact).forEach((key) => {
      switch (key) {
        case "Name":
          const firtName = contact[key].split(" ")[0];
          const lastName = contact[key].split(" ")[1];
          mappedContact.firstName = firtName;
          mappedContact.lastName = lastName;
          break;
        case "Company":
          mappedContact.company = contact[key];
          break;
        case "Email":
          mappedContact.email = contact[key];
          break;
        case "Phone":
          mappedContact.phone = contact[key];
          break;
        case "Alt Phone Number":
          mappedContact.altPhone = contact[key];
          break;
        case "Cell":
          mappedContact.cell = contact[key];
        case "Address":
          mappedContact.address = contact[key];
          break;
        case "City":
          mappedContact.city = contact[key];
          break;
        case "State" || "StatePr":
          mappedContact.state = contact[key];
          break;
        case "ZipPC":
          mappedContact.zip = contact[key];
          break;
        case "Web":
          mappedContact.webAddress = contact[key];
          break;
        case "Category":
          const catId = CATEGORIES.find(
            (category) => category.label === contact[key]
          )?.id;
          mappedContact.category = catId || null;
          break;
        case "CustSince":
          mappedContact.customerSince = contact[key];
          break;
        case "Ext":
          mappedContact.extension = contact[key];
          break;
      }
    });

    if ((!mappedContact.lastName || !mappedContact.firstName) && !mappedContact.company) {
      return null;
    }

    return mappedContact;
  } catch (error) {
    console.error(error);
  }
};

const upserContact = async (contactData, addressBookID, userId) => {
  try {
    if (!contactData) return;
    let contact;
    const result = await prisma.$transaction(
      async (prisma) => {
        contact = await prisma.contact.create({
          data: {
            userId,
            customerSince: contactData.customerSince,
            notes: contactData.notes || null,
            category: contactData.category,
            webAddress: contactData.webAddress,
            addressBooks: {
              connect: [
                {
                  id: addressBookID,
                },
              ],
            },
          },
        });

        if (contact && contact.id) {
          await prisma.contactContactInformation.create({
            data: {
              firstName: contactData.firstName,
              lastName: contactData.lastName,
              company: contactData.company,
              contactId: contact.id,
            },
          });

          await prisma.contactTelecomInformation.create({
            data: {
              extension: contactData.extension,
              phone: contactData.phone,
              cellPhone: contactData.altPhone,
              contactId: contact.id,
              email: contactData.email,
            },
          });

          await prisma.contactAddress.create({
            data: {
              address: contactData.address,
              city: contactData.city,
              state: contactData.state,
              zip: contactData.zip,
              country: "United States",
              contactId: contact.id,
            },
          });

          await prisma.contactAddressBook.create({
            data: {
              addressBookId: addressBookID,
              contactId: contact.id,
            },
          });
        }
      },
      {
        maxWait: 10000,
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error("Error saving contact", error);
  }
};

const createAddressBook = async () => {
  const user = await prisma.user.findFirst();
  const userId = user.id;
  let addressBook = await prisma.addressBook.findFirst({
    where: {
      name: "Sponsors and Prospects",
      userId,
    },
  });

  // if (addressBook) {
  //   return addressBook;
  // }

  addressBook = await prisma.addressBook.create({
    data: {
      name: "Sponsors and Prospects",
      userId,
      displayLevel: "Private",
    },
  });

  return addressBook;
};

const createCalendarEditions = async () => {
  const user = await prisma.user.findFirst({
    where: {
      firstName: "Joyce",
    },
  });
  const userId = user.id;
  const editionNames = ["Sacramento, Arden", "Elk Grove", "West Sacramento"];
  for (const name of editionNames) {
    // const edition = await prisma.calendarEdition.findFirst({
    //   where: {
    //     name, userId
    //   }
    // })
    // if (!edition) continue
    await prisma.calendarEdition.create({
      data: {
        name,
        userId,
      },
    });
  }
};

const createAdvertismentTypes = async () => {
  const user = await prisma.user.findFirst({
    where: {
      firstName: "Joyce",
    },
  });
  const userId = user.id;
  for (const type of ADVERTISEMENT_TYPES) {
    // const existingType = await prisma.advertisement.findFirst({
    //   where: {
    //     name: type.name, userId
    //   }
    // })
    await prisma.advertisement.create({
      data: {
        userId,
        name: type.name,
        perMonth: type.quantity,
        isDayType: type.isDayType,
      },
    });
  }
};
const CATEGORIES = [
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
const ADVERTISEMENT_TYPES = [
  {
    name: "Display",
    quantity: 4,
    isDayType: false,
  },
  {
    name: "Premium Display",
    quantity: 2,
    isDayType: false,
  },
  {
    name: "Billboard",
    quantity: 1,
    isDayType: false,
  },
  {
    name: "Monthly Photo",
    quantity: 1,
    isDayType: false,
  },
  {
    name: "Coupon",
    quantity: 8,
    isDayType: false,
  },
  {
    name: "Junior Coupon",
    quantity: 16,
    isDayType: false,
  },
  {
    name: "DateBlock",
    quantity: 35,
    isDayType: true,
  },
  {
    name: "Double DateBlock",
    quantity: 35,
    isDayType: true,
  },
];
// createCalendarEditions().catch(console.error);
// createAddressBook().catch(console.error);
// createAdvertismentTypes().catch(console.error);
seedContactsFromCSV().catch(console.error);
