export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isPopular?: boolean;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  weeklyPrice: number;
  monthlyPrice: number;
  image: string;
  features: string[];
  type: "student" | "office" | "family";
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  location: string;
};

export const MENU_CATEGORIES = [
  { id: "odia-specials", name: "Odia Specials" },
  { id: "thalis", name: "Thalis" },
  { id: "snacks", name: "Snacks & Sides" },
  { id: "beverages", name: "Beverages" }
];

export const MENU_ITEMS: MenuItem[] = [
  // Odia Specials
  {
    id: "dalma",
    name: "Authentic Odia Dalma",
    description: "Traditional slow-cooked yellow lentils with raw banana, pumpkin, brinjal, papaya, tempered with ghee and roasted cumin-chilli powder.",
    price: 110,
    image: "/images/dalma_special.jpg",
    category: "odia-specials",
    isVeg: true,
    isPopular: true
  },
  {
    id: "santula",
    name: "Odia Santula",
    description: "Light, healthy boiled vegetables (papaya, raw banana, pointed gourd) lightly sautéed with mustard seeds, garlic, and green chillies.",
    price: 90,
    image: "/images/odia_thali.jpg", // reuse or set specific
    category: "odia-specials",
    isVeg: true
  },
  {
    id: "besara",
    name: "Sajana Chhuin Besara",
    description: "Drumsticks and potatoes cooked in a mustard-garlic paste, finished with dry mango (Ambula) for an authentic tangy kick.",
    price: 120,
    image: "/images/dalma_special.jpg",
    category: "odia-specials",
    isVeg: true
  },
  {
    id: "pakhala",
    name: "Dahi Pakhala Platters",
    description: "Traditional fermented rice served chilled in water with curd, ginger, and roasted cumin, accompanied by Badi Chura, saga bhaja, and aloo bharta.",
    price: 140,
    image: "/images/odia_thali.jpg",
    category: "odia-specials",
    isVeg: true,
    isPopular: true
  },
  // Thalis
  {
    id: "veg-thali",
    name: "Ghara Thali (Veg Thali)",
    description: "Comfort food: Steaming Rice, Kanika/Plain Rice, Dalma or Plain Dal, seasonal vegetable fry (bhaja), Santula, Tomato Khata, and Papad.",
    price: 130,
    image: "/images/odia_thali.jpg",
    category: "thalis",
    isVeg: true,
    isPopular: true
  },
  {
    id: "chicken-thali",
    name: "Manda Chicken Thali",
    description: "Traditional Odia-style homestyle chicken curry (Odia Rosolo Chicken) with potatoes, served with Steaming Rice, Dal, Veg Bhaja, and Salad.",
    price: 180,
    image: "/images/hero_feast.jpg",
    category: "thalis",
    isVeg: false,
    isPopular: true
  },
  {
    id: "special-odia-thali",
    name: "Kavita's Special Odia Feast",
    description: "A royal Odia feast: Ghee Rice, Dalma, Saga Bhaja, Besara, Aloo Bharta, Dahi Baigana, sweet Tomato Khata, Payesh (Kheer), and Papad.",
    price: 220,
    image: "/images/hero_feast.jpg",
    category: "thalis",
    isVeg: true
  },
  // Snacks
  {
    id: "bara-ghuguni",
    name: "Puri Famous Bara Ghuguni",
    description: "Four crispy, golden lentil fritters (Bara) served with a steaming hot, spiced yellow peas curry (Ghuguni) and chopped onions.",
    price: 60,
    image: "/images/odia_snacks.jpg",
    category: "snacks",
    isVeg: true,
    isPopular: true
  },
  {
    id: "pakodi",
    name: "Piyaji & Pakodi Basket",
    description: "Assorted crispy onion piyaji and mixed vegetable pakodas, seasoned with local spices and served with green chutney.",
    price: 50,
    image: "/images/odia_snacks.jpg",
    category: "snacks",
    isVeg: true
  },
  // Beverages
  {
    id: "chaas",
    name: "Masala Chaas",
    description: "Refreshing traditional buttermilk churned with fresh coriander, mint, green chillies, ginger, and roasted black salt.",
    price: 40,
    image: "/images/chaas.jpg",
    category: "beverages",
    isVeg: true
  },
  {
    id: "lassi",
    name: "Puri Rabidi Lassi",
    description: "Rich, creamy sweet lassi topped with local Puri Rabidi, grated coconut, cherries, and crushed dry fruits.",
    price: 80,
    image: "/images/lassi.jpg",
    category: "beverages",
    isVeg: true,
    isPopular: true
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "student-plan",
    name: "Student Meal Plan",
    description: "Healthy, affordable, and just like home! Perfect for students living away from home in Puri.",
    weeklyPrice: 650,
    monthlyPrice: 2400,
    image: "/images/odia_thali.jpg",
    features: [
      "1 Lunch or Dinner Daily",
      "Rice + Dal/Dalma + Veg Bhaja + Curry",
      "Hygienic & Packed in Leak-proof Containers",
      "Delivery right to your hostel/PG",
      "Free Delivery within Puri Town"
    ],
    type: "student"
  },
  {
    id: "office-plan",
    name: "Office Lunch Plan",
    description: "Light, healthy, and timely meals delivered to your workplace. Keep your energy up without feeling heavy.",
    weeklyPrice: 750,
    monthlyPrice: 2800,
    image: "/images/hero_feast.jpg",
    features: [
      "1 Office Lunch Daily (Mon - Sat)",
      "Balanced diet with low oil & spice",
      "Veg & Non-Veg options available",
      "Guaranteed delivery before 1:30 PM",
      "Pause/Resume subscription anytime"
    ],
    type: "office"
  },
  {
    id: "family-plan",
    name: "Family Meal Plan",
    description: "Complete nutritious dinners for the whole family. Save time cooking and enjoy fresh homestyle meals.",
    weeklyPrice: 1500,
    monthlyPrice: 5500,
    image: "/images/hero_feast.jpg",
    features: [
      "1 Dinner Daily (Serves 2-3 Adults)",
      "Choice of 3 Chapatis or Rice per person",
      "Dalma/Dal + 2 seasonal side dishes",
      "Special Odia sweet twice a week",
      "Hassle-free dinner sorting"
    ],
    type: "family"
  }
];

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Amit Mohanty",
    rating: 5,
    text: "Being a student here, finding healthy food was tough. Kavita's Kitchen feels exactly like home-cooked food. The Dalma is just outstanding!",
    date: "2026-05-10",
    location: "VIP Road, Puri"
  },
  {
    id: "rev-2",
    name: "Smaranika Jena",
    rating: 5,
    text: "The Rabidi Lassi and Bara Ghuguni were exceptionally delicious. Highly hygienic and fresh. Best Odia meals in Puri without a doubt.",
    date: "2026-06-01",
    location: "Grand Road, Puri"
  },
  {
    id: "rev-3",
    name: "Dr. Rajesh Das",
    rating: 5,
    text: "I order the Office Lunch Plan daily. It's consistently timely, affordable, very low in oil, and tastes genuine. Recommended for busy professionals.",
    date: "2026-06-12",
    location: "CT Road, Puri"
  }
];
