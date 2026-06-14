import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Start seeding...");

  // Create admin user
  const passwordHash = hashPassword("password123");
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { passwordHash },
    create: {
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.username}`);

  // Business Config
  const config = await prisma.businessConfig.upsert({
    where: { id: "config" },
    update: {},
    create: {
      id: "config",
      phone: "+91 78480 37181",
      whatsApp: "917848037181",
      instagram: "kavita.kitchen_",
      address: "Puri, Odisha, India",
      operatingHours: "Daily Cooking: 10:00 AM - 10:00 PM",
      heroTitle: "Authentic Homemade Food in Puri",
      heroSubtitle: "Fresh • Hygienic • Delicious • Made With Love",
    },
  });
  console.log("Created business configuration.");

  // Categories
  const categories = [
    { id: "odia-specials", name: "Odia Specials", order: 1 },
    { id: "thalis", name: "Thalis", order: 2 },
    { id: "snacks", name: "Snacks & Sides", order: 3 },
    { id: "beverages", name: "Beverages", order: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, order: cat.order },
      create: { id: cat.id, name: cat.name, order: cat.order },
    });
  }
  console.log("Created food categories.");

  // Menu Items
  const menuItems = [
    // Odia Specials
    {
      id: "dalma",
      name: "Authentic Odia Dalma",
      description: "Traditional slow-cooked yellow lentils with raw banana, pumpkin, brinjal, papaya, tempered with ghee and roasted cumin-chilli powder.",
      price: 110,
      image: "/images/dalma_special.jpg",
      categoryId: "odia-specials",
      isVeg: true,
      isPopular: true,
      order: 1
    },
    {
      id: "santula",
      name: "Odia Santula",
      description: "Light, healthy boiled vegetables (papaya, raw banana, pointed gourd) lightly sautéed with mustard seeds, garlic, and green chillies.",
      price: 90,
      image: "/images/odia_thali.jpg",
      categoryId: "odia-specials",
      isVeg: true,
      isPopular: false,
      order: 2
    },
    {
      id: "besara",
      name: "Sajana Chhuin Besara",
      description: "Drumsticks and potatoes cooked in a mustard-garlic paste, finished with dry mango (Ambula) for an authentic tangy kick.",
      price: 120,
      image: "/images/dalma_special.jpg",
      categoryId: "odia-specials",
      isVeg: true,
      isPopular: false,
      order: 3
    },
    {
      id: "pakhala",
      name: "Dahi Pakhala Platters",
      description: "Traditional fermented rice served chilled in water with curd, ginger, and roasted cumin, accompanied by Badi Chura, saga bhaja, and aloo bharta.",
      price: 140,
      image: "/images/odia_thali.jpg",
      categoryId: "odia-specials",
      isVeg: true,
      isPopular: true,
      order: 4
    },
    // Thalis
    {
      id: "veg-thali",
      name: "Ghara Thali (Veg Thali)",
      description: "Comfort food: Steaming Rice, Kanika/Plain Rice, Dalma or Plain Dal, seasonal vegetable fry (bhaja), Santula, Tomato Khata, and Papad.",
      price: 130,
      image: "/images/odia_thali.jpg",
      categoryId: "thalis",
      isVeg: true,
      isPopular: true,
      order: 5
    },
    {
      id: "chicken-thali",
      name: "Manda Chicken Thali",
      description: "Traditional Odia-style homestyle chicken curry (Odia Rosolo Chicken) with potatoes, served with Steaming Rice, Dal, Veg Bhaja, and Salad.",
      price: 180,
      image: "/images/hero_feast.jpg",
      categoryId: "thalis",
      isVeg: false,
      isPopular: true,
      order: 6
    },
    {
      id: "special-odia-thali",
      name: "Kavita's Special Odia Feast",
      description: "A royal Odia feast: Ghee Rice, Dalma, Saga Bhaja, Besara, Aloo Bharta, Dahi Baigana, sweet Tomato Khata, Payesh (Kheer), and Papad.",
      price: 220,
      image: "/images/hero_feast.jpg",
      categoryId: "thalis",
      isVeg: true,
      isPopular: false,
      order: 7
    },
    // Snacks
    {
      id: "bara-ghuguni",
      name: "Puri Famous Bara Ghuguni",
      description: "Four crispy, golden lentil fritters (Bara) served with a steaming hot, spiced yellow peas curry (Ghuguni) and chopped onions.",
      price: 60,
      image: "/images/odia_snacks.jpg",
      categoryId: "snacks",
      isVeg: true,
      isPopular: true,
      order: 8
    },
    {
      id: "pakodi",
      name: "Piyaji & Pakodi Basket",
      description: "Assorted crispy onion piyaji and mixed vegetable pakodas, seasoned with local spices and served with green chutney.",
      price: 50,
      image: "/images/odia_snacks.jpg",
      categoryId: "snacks",
      isVeg: true,
      isPopular: false,
      order: 9
    },
    // Beverages
    {
      id: "chaas",
      name: "Masala Chaas",
      description: "Refreshing traditional buttermilk churned with fresh coriander, mint, green chillies, ginger, and roasted black salt.",
      price: 40,
      image: "/images/chaas.jpg",
      categoryId: "beverages",
      isVeg: true,
      isPopular: false,
      order: 10
    },
    {
      id: "lassi",
      name: "Puri Rabidi Lassi",
      description: "Rich, creamy sweet lassi topped with local Puri Rabidi, grated coconut, cherries, and crushed dry fruits.",
      price: 80,
      image: "/images/lassi.jpg",
      categoryId: "beverages",
      isVeg: true,
      isPopular: true,
      order: 11
    }
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        categoryId: item.categoryId,
        isVeg: item.isVeg,
        isPopular: item.isPopular,
        order: item.order
      },
      create: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        categoryId: item.categoryId,
        isVeg: item.isVeg,
        isPopular: item.isPopular,
        order: item.order
      }
    });
  }
  console.log("Created menu items.");

  // Subscription Plans
  const subscriptionPlans = [
    {
      id: "student-plan",
      name: "Student Meal Plan",
      description: "Healthy, affordable, and just like home! Perfect for students living away from home in Puri.",
      weeklyPrice: 650,
      monthlyPrice: 2400,
      image: "/images/odia_thali.jpg",
      features: JSON.stringify([
        "1 Lunch or Dinner Daily",
        "Rice + Dal/Dalma + Veg Bhaja + Curry",
        "Hygienic & Packed in Leak-proof Containers",
        "Delivery right to your hostel/PG",
        "Free Delivery within Puri Town"
      ]),
      type: "student"
    },
    {
      id: "office-plan",
      name: "Office Lunch Plan",
      description: "Light, healthy, and timely meals delivered to your workplace. Keep your energy up without feeling heavy.",
      weeklyPrice: 750,
      monthlyPrice: 2800,
      image: "/images/hero_feast.jpg",
      features: JSON.stringify([
        "1 Office Lunch Daily (Mon - Sat)",
        "Balanced diet with low oil & spice",
        "Veg & Non-Veg options available",
        "Guaranteed delivery before 1:30 PM",
        "Pause/Resume subscription anytime"
      ]),
      type: "office"
    },
    {
      id: "family-plan",
      name: "Family Meal Plan",
      description: "Complete nutritious dinners for the whole family. Save time cooking and enjoy fresh homestyle meals.",
      weeklyPrice: 1500,
      monthlyPrice: 5500,
      image: "/images/hero_feast.jpg",
      features: JSON.stringify([
        "1 Dinner Daily (Serves 2-3 Adults)",
        "Choice of 3 Chapatis or Rice per person",
        "Dalma/Dal + 2 seasonal side dishes",
        "Special Odia sweet twice a week",
        "Hassle-free dinner sorting"
      ]),
      type: "family"
    }
  ];

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: {
        name: plan.name,
        description: plan.description,
        weeklyPrice: plan.weeklyPrice,
        monthlyPrice: plan.monthlyPrice,
        image: plan.image,
        features: plan.features,
        type: plan.type
      },
      create: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        weeklyPrice: plan.weeklyPrice,
        monthlyPrice: plan.monthlyPrice,
        image: plan.image,
        features: plan.features,
        type: plan.type
      }
    });
  }
  console.log("Created subscription plans.");

  // Reviews (approved & pinned by default for seeding to match existing layout)
  const reviews = [
    {
      id: "rev-1",
      name: "Amit Mohanty",
      rating: 5,
      text: "Being a student here, finding healthy food was tough. Kavita's Kitchen feels exactly like home-cooked food. The Dalma is just outstanding!",
      date: "2026-05-10",
      location: "VIP Road, Puri",
      approved: true,
      isPinned: true
    },
    {
      id: "rev-2",
      name: "Smaranika Jena",
      rating: 5,
      text: "The Rabidi Lassi and Bara Ghuguni were exceptionally delicious. Highly hygienic and fresh. Best Odia meals in Puri without a doubt.",
      date: "2026-06-01",
      location: "Grand Road, Puri",
      approved: true,
      isPinned: true
    },
    {
      id: "rev-3",
      name: "Dr. Rajesh Das",
      rating: 5,
      text: "I order the Office Lunch Plan daily. It's consistently timely, affordable, very low in oil, and tastes genuine. Recommended for busy professionals.",
      date: "2026-06-12",
      location: "CT Road, Puri",
      approved: true,
      isPinned: true
    }
  ];

  for (const rev of reviews) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {
        name: rev.name,
        rating: rev.rating,
        text: rev.text,
        date: rev.date,
        location: rev.location,
        approved: rev.approved,
        isPinned: rev.isPinned
      },
      create: {
        id: rev.id,
        name: rev.name,
        rating: rev.rating,
        text: rev.text,
        date: rev.date,
        location: rev.location,
        approved: rev.approved,
        isPinned: rev.isPinned
      }
    });
  }
  console.log("Created customer reviews.");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
