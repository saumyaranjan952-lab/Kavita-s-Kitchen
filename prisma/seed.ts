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

  // 1. Create admin user in Admin table
  const passwordHash = hashPassword("KavitaAdmin2026!");
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: { passwordHash },
    create: {
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.username}`);

  // 2. Business Config
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

  // 3. Categories
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

  // 4. Menu Items
  const menuItems = [
    {
      id: "dalma",
      name: "Authentic Odia Dalma",
      description: "Traditional slow-cooked yellow lentils with raw banana, pumpkin, brinjal, papaya, tempered with ghee and roasted cumin-chilli powder.",
      price: 110,
      image: "/images/dalma_special.jpg",
      categoryId: "odia-specials",
      isVeg: true,
      isPopular: true,
      order: 1,
      rating: 4.8,
      ingredients: ["Yellow Lentils", "Raw Banana", "Pumpkin", "Brinjal", "Papaya", "Ghee", "Roasted Cumin-Chilli Powder", "Ginger", "Coconut Grated"],
      calories: 310,
      protein: 14.5,
      carbs: 48.0,
      fat: 6.5,
      serves: "1 Person",
      portionSize: "Portion (400ml)",
      spiceLevel: "Low",
      customizations: [
        { name: "Extra Ghee", price: 15 },
        { name: "Extra Grated Coconut", price: 10 }
      ],
      relatedItems: ["pakhala", "veg-thali"]
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
      order: 2,
      rating: 4.6,
      ingredients: ["Papaya", "Raw Banana", "Pointed Gourd", "Mustard Seeds", "Garlic", "Green Chillies", "Refined Oil"],
      calories: 140,
      protein: 2.5,
      carbs: 18.0,
      fat: 4.0,
      serves: "1 Person",
      portionSize: "Portion (300ml)",
      spiceLevel: "Low",
      customizations: [
        { name: "Extra Garlic", price: 5 }
      ],
      relatedItems: ["dalma", "veg-thali"]
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
      order: 3,
      rating: 4.7,
      ingredients: ["Drumsticks", "Potatoes", "Mustard Seeds", "Garlic", "Ambula (Dry Mango)", "Turmeric", "Mustard Oil"],
      calories: 180,
      protein: 3.8,
      carbs: 28.0,
      fat: 6.0,
      serves: "1 Person",
      portionSize: "Portion (350ml)",
      spiceLevel: "Medium",
      customizations: [
        { name: "Extra tanginess (Ambula)", price: 10 }
      ],
      relatedItems: ["dalma", "pakhala"]
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
      order: 4,
      rating: 4.9,
      ingredients: ["Fermented Rice", "Curd", "Ginger", "Roasted Cumin", "Badi", "Amaranth Leaves (Saga)", "Potatoes"],
      calories: 450,
      protein: 9.5,
      carbs: 85.0,
      fat: 7.2,
      serves: "1 Person",
      portionSize: "Full Platter",
      spiceLevel: "Low",
      customizations: [
        { name: "Extra Curd", price: 15 },
        { name: "Fried Fish (Non-Veg Option)", price: 60 }
      ],
      relatedItems: ["dalma", "chaas"]
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
      order: 5,
      rating: 4.8,
      ingredients: ["Basmati Rice / Kanika", "Yellow Split Peas", "Seasonal Vegetables", "Tomato Khata", "Papad"],
      calories: 610,
      protein: 16.0,
      carbs: 95.0,
      fat: 10.5,
      serves: "1 Person",
      portionSize: "Full Meal (650g)",
      spiceLevel: "Medium",
      customizations: [
        { name: "Substitute Plain Rice with Ghee Rice", price: 20 },
        { name: "Extra Dalma", price: 30 }
      ],
      relatedItems: ["lassi", "chaas"]
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
      order: 6,
      rating: 4.9,
      ingredients: ["Fresh Farm Chicken", "Potatoes", "Onion", "Tomato", "Ginger", "Garlic", "Traditional Odia Spices", "Mustard Oil", "Fresh Coriander"],
      calories: 680,
      protein: 34.5,
      carbs: 72.0,
      fat: 18.2,
      serves: "1-2 Persons",
      portionSize: "Full Thali (750g)",
      spiceLevel: "Medium",
      customizations: [
        { name: "Extra Rice", price: 20 },
        { name: "Extra Gravy", price: 15 },
        { name: "Extra Salad", price: 10 },
        { name: "Extra Roti (1 pc)", price: 10 }
      ],
      relatedItems: ["dalma", "veg-thali", "lassi"]
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
      order: 7,
      rating: 4.9,
      ingredients: ["Ghee Rice", "Yellow Lentils", "Amaranth Leaves", "Mustard Paste", "Brinjal", "Curd", "Tomato", "Milk", "Rice", "Sugar", "Papad"],
      calories: 820,
      protein: 21.0,
      carbs: 115.0,
      fat: 22.0,
      serves: "1-2 Persons",
      portionSize: "Feast Platter (900g)",
      spiceLevel: "Medium",
      customizations: [
        { name: "Extra Payesh (Sweet)", price: 25 }
      ],
      relatedItems: ["dalma", "lassi"]
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
      order: 8,
      rating: 4.7,
      ingredients: ["Black Gram Dal (Biri)", "Yellow Peas (Ghuguni)", "Onions", "Green Chillies", "Ginger", "Refined Oil"],
      calories: 280,
      protein: 11.2,
      carbs: 42.0,
      fat: 8.5,
      serves: "1 Person",
      portionSize: "4 Pcs Bara + 200ml Ghuguni",
      spiceLevel: "Medium",
      customizations: [
        { name: "Extra Ghuguni", price: 15 },
        { name: "Extra Onions & Chillies", price: 0 }
      ],
      relatedItems: ["pakodi", "lassi"]
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
      order: 9,
      rating: 4.5,
      ingredients: ["Gram Flour (Besan)", "Onions", "Potatoes", "Cauliflower", "Spices", "Chutney"],
      calories: 220,
      protein: 5.4,
      carbs: 32.0,
      fat: 10.0,
      serves: "1 Person",
      portionSize: "Portion (150g)",
      spiceLevel: "Medium",
      customizations: [
        { name: "Extra Chutney", price: 5 }
      ],
      relatedItems: ["bara-ghuguni", "chaas"]
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
      order: 10,
      rating: 4.6,
      ingredients: ["Curd", "Water", "Coriander", "Mint", "Ginger", "Green Chillies", "Black Salt", "Roasted Cumin"],
      calories: 75,
      protein: 3.2,
      carbs: 5.8,
      fat: 2.5,
      serves: "1 Person",
      portionSize: "Glass (300ml)",
      spiceLevel: "Low",
      customizations: [
        { name: "No Chillies", price: 0 }
      ],
      relatedItems: ["lassi", "veg-thali"]
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
      order: 11,
      rating: 4.9,
      ingredients: ["Fresh Curd", "Puri Rabidi", "Grated Coconut", "Sugar", "Cherries", "Crushed Dry Fruits", "Ice"],
      calories: 420,
      protein: 8.0,
      carbs: 62.0,
      fat: 15.5,
      serves: "1 Person",
      portionSize: "Glass (350ml)",
      spiceLevel: "None",
      customizations: [
        { name: "Extra Rabidi", price: 25 },
        { name: "Extra Dry Fruits", price: 15 }
      ],
      relatedItems: ["chaas", "bara-ghuguni"]
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
        order: item.order,
        rating: item.rating,
        ingredients: item.ingredients,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        serves: item.serves,
        portionSize: item.portionSize,
        spiceLevel: item.spiceLevel,
        customizations: item.customizations,
        relatedItems: item.relatedItems,
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
        order: item.order,
        rating: item.rating,
        ingredients: item.ingredients,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        serves: item.serves,
        portionSize: item.portionSize,
        spiceLevel: item.spiceLevel,
        customizations: item.customizations,
        relatedItems: item.relatedItems,
      }
    });
  }
  console.log("Created menu items.");

  // 5. Subscription Plans
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

  // 6. Coupons
  const coupons = [
    {
      code: "WELCOME50",
      type: "FIXED",
      value: 50,
      minOrderValue: 150,
      expiresAt: new Date("2028-12-31"),
      active: true,
      usageLimit: 1000,
    },
    {
      code: "KAVITA10",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: 200,
      maxDiscount: 50,
      expiresAt: new Date("2028-12-31"),
      active: true,
      usageLimit: 5000,
    },
    {
      code: "ODIAFEAST",
      type: "PERCENTAGE",
      value: 20,
      minOrderValue: 400,
      maxDiscount: 100,
      expiresAt: new Date("2028-12-31"),
      active: true,
      usageLimit: 1000,
    }
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        type: c.type,
        value: c.value,
        minOrderValue: c.minOrderValue,
        maxDiscount: c.maxDiscount,
        expiresAt: c.expiresAt,
        active: c.active,
        usageLimit: c.usageLimit,
      },
      create: {
        code: c.code,
        type: c.type,
        value: c.value,
        minOrderValue: c.minOrderValue,
        maxDiscount: c.maxDiscount,
        expiresAt: c.expiresAt,
        active: c.active,
        usageLimit: c.usageLimit,
      }
    });
  }
  console.log("Created discount coupons.");

  // 7. Reviews (approved & pinned by default for seeding to match existing layout)
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
