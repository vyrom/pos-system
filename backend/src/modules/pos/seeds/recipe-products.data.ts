import { Ingredient } from '../entities/ingredient.entity';
import { Product } from '../entities/product.entity';

export const INITIAL_INGREDIENTS_SEED: Ingredient[] = [
  // --- Coffee Beans ---
  { id: 'ing-1', name: 'Coffee Sayon', category: 'Coffee Beans', stock: 4000, uom: 'g', costPerUnit: 0.012, minStock: 500, icon: '☕' }, // Sayon 500g (8 packs = 4,000g @ $6.00/pack)
  { id: 'ing-2', name: 'Sakor Bean', category: 'Coffee Beans', stock: 5000, uom: 'g', costPerUnit: 0.0178, minStock: 500, icon: '☕' },

  // --- Dairy & Milk ---
  { id: 'ing-3', name: 'Fresh Milk', category: 'Dairy & Milk', stock: 4000, uom: 'ml', costPerUnit: 0.0019, minStock: 2000, icon: '🥛' }, // Full Cream Milk 1L (4 cartons = 4,000ml @ $1.90/L)
  { id: 'ing-4', name: 'Sweeten Milk', category: 'Dairy & Milk', stock: 8000, uom: 'ml', costPerUnit: 0.00195, minStock: 500, icon: '🥛' }, // Kofi-Condensed Milk 2kg (4 packs = 8,000g @ $3.90/2kg)
  { id: 'ing-5', name: 'Kofi Evaporated milk', category: 'Dairy & Milk', stock: 3600, uom: 'ml', costPerUnit: 0.00222, minStock: 500, icon: '🥛' }, // Evaporated Milk 900ml (4 bottles = 3,600ml @ $2.00/900ml)
  { id: 'ing-6', name: 'Whipping Cream', category: 'Dairy & Milk', stock: 2000, uom: 'g', costPerUnit: 0.00696, minStock: 300, icon: '🍦' },
  { id: 'ing-7', name: 'Vanilla Ice-Cream', category: 'Dairy & Milk', stock: 50, uom: 'scoop', costPerUnit: 0.41, minStock: 10, icon: '🍨' },
  { id: 'ing-8', name: 'Kofi Non Dairy creamer', category: 'Dairy & Milk', stock: 3000, uom: 'g', costPerUnit: 0.0058, minStock: 400, icon: '🥣' },

  // --- Syrups & Sauces ---
  { id: 'ing-9', name: 'Kofi Sugar Syrup', category: 'Syrups & Sauces', stock: 10000, uom: 'ml', costPerUnit: 0.00233, minStock: 1000, icon: '🍯' },
  { id: 'ing-10', name: 'Monin Caramel Syrup', category: 'Syrups & Sauces', stock: 3000, uom: 'ml', costPerUnit: 0.015, minStock: 300, icon: '🍯' },
  { id: 'ing-11', name: 'Monin Caramel Sauce', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.0137, minStock: 200, icon: '🍮' },
  { id: 'ing-12', name: 'Monin Raspberry Syrup', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.015, minStock: 200, icon: '💖' },
  { id: 'ing-13', name: 'Monin Toffee nut syrup', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.015, minStock: 200, icon: '🌰' },
  { id: 'ing-14', name: 'Monin Dark Chocolate Sauce', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.01053, minStock: 200, icon: '🍫' },
  { id: 'ing-15', name: 'Monin Chai Tea Syrup', category: 'Syrups & Sauces', stock: 2000, uom: 'g', costPerUnit: 0.015, minStock: 200, icon: '🍵' },
  { id: 'ing-16', name: 'Monin Green Tea syrup', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.015, minStock: 200, icon: '🍵' },
  { id: 'ing-17', name: 'Monin Kiwi Syrup', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.015, minStock: 200, icon: '🥝' },
  { id: 'ing-18', name: 'Monin Passion Syrup', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.015, minStock: 200, icon: '🥭' },
  { id: 'ing-19', name: 'Monin Blue Curacao', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.015, minStock: 200, icon: '🌊' },
  { id: 'ing-20', name: 'Monin Strawberry Syrup', category: 'Syrups & Sauces', stock: 2000, uom: 'ml', costPerUnit: 0.015, minStock: 200, icon: '🍓' },

  // --- Fruit Purees ---
  { id: 'ing-21', name: 'Monin Strawberry Puree', category: 'Fruit Purees', stock: 3000, uom: 'ml', costPerUnit: 0.0199, minStock: 300, icon: '🍓' },
  { id: 'ing-22', name: 'Monin Blueberry Puree', category: 'Fruit Purees', stock: 3000, uom: 'ml', costPerUnit: 0.0199, minStock: 300, icon: '🫐' },
  { id: 'ing-23', name: 'Monin Passion Puree', category: 'Fruit Purees', stock: 3000, uom: 'ml', costPerUnit: 0.0199, minStock: 300, icon: '🥭' },

  // --- Powders & Tea ---
  { id: 'ing-24', name: 'Chocolate Powder', category: 'Powders & Tea', stock: 2000, uom: 'g', costPerUnit: 0.0218, minStock: 300, icon: '🍫' }, // Cocoa Powder 500g (4 packs = 2,000g @ $10.90/pack)
  { id: 'ing-25', name: 'Kofi Chocolate Powder', category: 'Powders & Tea', stock: 2000, uom: 'g', costPerUnit: 0.0218, minStock: 300, icon: '🍫' },
  { id: 'ing-26', name: 'Kofi Matcha Powder', category: 'Powders & Tea', stock: 400, uom: 'g', costPerUnit: 0.079, minStock: 200, icon: '🍵' }, // Premium Matcha Green Tea 100g (4 packs = 400g @ $7.90/pack)
  { id: 'ing-27', name: 'Green tea Powder', category: 'Powders & Tea', stock: 400, uom: 'g', costPerUnit: 0.079, minStock: 200, icon: '🍵' },
  { id: 'ing-28', name: 'Monin Smoothie base', category: 'Powders & Tea', stock: 3000, uom: 'g', costPerUnit: 0.0159, minStock: 300, icon: '🥤' },
  { id: 'ing-29', name: 'Monin Coffee Powder', category: 'Powders & Tea', stock: 2000, uom: 'g', costPerUnit: 0.0219, minStock: 200, icon: '☕' },
  { id: 'ing-30', name: 'Monin Vanilla Powder', category: 'Powders & Tea', stock: 2000, uom: 'g', costPerUnit: 0.0185, minStock: 200, icon: '🍨' },

  // --- Fresh & Others ---
  { id: 'ing-31', name: 'Lime Slice', category: 'Fresh & Others', stock: 100, uom: 'slice', costPerUnit: 0.01, minStock: 20, icon: '🍋' },
  { id: 'ing-32', name: 'Lime Juice', category: 'Fresh & Others', stock: 2000, uom: 'ml', costPerUnit: 0.00225, minStock: 200, icon: '🍋' },
  { id: 'ing-33', name: 'Fresh Passion Fruit', category: 'Fresh & Others', stock: 100, uom: 'pc', costPerUnit: 0.048, minStock: 20, icon: '🥭' },
  { id: 'ing-34', name: 'Soda', category: 'Fresh & Others', stock: 10000, uom: 'ml', costPerUnit: 0.00069, minStock: 1000, icon: '🫧' },
  { id: 'ing-35', name: 'Ice', category: 'Fresh & Others', stock: 5000, uom: 'oz', costPerUnit: 0.00125, minStock: 500, icon: '🧊' },

  // --- Packaging & Cups ---
  { id: 'ing-36', name: '8oz Hot Cup & Lid', category: 'Packaging', stock: 500, uom: 'pc', costPerUnit: 0.10, minStock: 50, icon: '☕' },
  { id: 'ing-37', name: '12oz Hot Cup, Lid & Sleeve', category: 'Packaging', stock: 800, uom: 'pc', costPerUnit: 0.18, minStock: 100, icon: '☕' },
  { id: 'ing-38', name: '16oz Cold PET Cup, Lid & Straw', category: 'Packaging', stock: 1200, uom: 'pc', costPerUnit: 0.22, minStock: 150, icon: '🥤' },
  { id: 'ing-39', name: '16oz Smoothie/Frappe Cup & Dome Lid', category: 'Packaging', stock: 800, uom: 'pc', costPerUnit: 0.25, minStock: 100, icon: '🧋' },
];

export const RECIPE_PRODUCTS_SEED: Product[] = [
  // ==================== HOT COFFEE ====================
  {
    id: 'prod-1',
    name: 'Espresso',
    category: 'Hot Coffee',
    cost: 0.11,
    packagingCost: 0.10,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-001',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 9, uom: 'g', cost: 0.108 }
    ]
  },
  {
    id: 'prod-2',
    name: 'Ristretto',
    category: 'Hot Coffee',
    cost: 0.14,
    packagingCost: 0.10,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-002',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 }
    ]
  },
  {
    id: 'prod-3',
    name: 'Doppio',
    category: 'Hot Coffee',
    cost: 0.28,
    packagingCost: 0.10,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-003',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 16, uom: 'g', cost: 0.2848 }
    ]
  },
  {
    id: 'prod-4',
    name: 'Espresso Con Panna',
    category: 'Hot Coffee',
    cost: 0.30,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-004',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Whipping Cream', qty: 23, uom: 'g', cost: 0.160 }
    ]
  },
  {
    id: 'prod-5',
    name: 'Espresso Con Lech',
    category: 'Hot Coffee',
    cost: 0.23,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-005',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Sweeten Milk', qty: 30, uom: 'ml', cost: 0.087 }
    ]
  },
  {
    id: 'prod-6',
    name: 'Espresso Romano',
    category: 'Hot Coffee',
    cost: 0.15,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-006',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Lime Slice', qty: 1, uom: 'slice', cost: 0.010 }
    ]
  },
  {
    id: 'prod-7',
    name: 'Maroccino',
    category: 'Hot Coffee',
    cost: 0.31,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-007',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Fresh Milk', qty: 80, uom: 'ml', cost: 0.168 }
    ]
  },
  {
    id: 'prod-8',
    name: 'Afogato',
    category: 'Hot Coffee',
    cost: 0.55,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '🍨',
    sku: 'HOT-008',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Vanilla Ice-Cream', qty: 1, uom: 'scoop', cost: 0.410 }
    ]
  },
  {
    id: 'prod-9',
    name: 'Americano',
    category: 'Hot Coffee',
    cost: 0.11,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-009',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 9, uom: 'g', cost: 0.108 }
    ]
  },
  {
    id: 'prod-10',
    name: 'Flat White',
    category: 'Hot Coffee',
    cost: 0.48,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-010',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Fresh Milk', qty: 160, uom: 'ml', cost: 0.336 }
    ]
  },
  {
    id: 'prod-11',
    name: 'Cappuccino',
    category: 'Hot Coffee',
    cost: 0.37,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-011',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 9, uom: 'g', cost: 0.108 },
      { ingredientName: 'Fresh Milk', qty: 140, uom: 'ml', cost: 0.266 }
    ]
  },
  {
    id: 'prod-12',
    name: 'Café Latte',
    category: 'Hot Coffee',
    cost: 0.37,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-012',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 9, uom: 'g', cost: 0.108 },
      { ingredientName: 'Fresh Milk', qty: 140, uom: 'ml', cost: 0.266 }
    ]
  },
  {
    id: 'prod-13',
    name: 'Mocha',
    category: 'Hot Coffee',
    cost: 0.57,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '🍫',
    sku: 'HOT-013',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 9, uom: 'g', cost: 0.108 },
      { ingredientName: 'Fresh Milk', qty: 140, uom: 'ml', cost: 0.266 },
      { ingredientName: 'Kofi Chocolate Powder', qty: 15, uom: 'g', cost: 0.195 }
    ]
  },
  {
    id: 'prod-14',
    name: 'Hot Chocolate',
    category: 'Hot Coffee',
    cost: 0.52,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '🍫',
    sku: 'HOT-014',
    recipe: [
      { ingredientName: 'Chocolate Powder', qty: 15, uom: 'g', cost: 0.252 },
      { ingredientName: 'Fresh Milk', qty: 140, uom: 'ml', cost: 0.266 }
    ]
  },
  {
    id: 'prod-15',
    name: 'Matcha Latte',
    category: 'Hot Coffee',
    cost: 0.58,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '🍵',
    sku: 'HOT-015',
    recipe: [
      { ingredientName: 'Kofi Matcha Powder', qty: 4, uom: 'g', cost: 0.276 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 15, uom: 'ml', cost: 0.035 },
      { ingredientName: 'Fresh Milk', qty: 140, uom: 'ml', cost: 0.266 }
    ]
  },
  {
    id: 'prod-16',
    name: 'Chai Latte',
    category: 'Hot Coffee',
    cost: 0.64,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '🍵',
    sku: 'HOT-016',
    recipe: [
      { ingredientName: 'Monin Chai Tea Syrup', qty: 20, uom: 'g', cost: 0.300 },
      { ingredientName: 'Fresh Milk', qty: 160, uom: 'ml', cost: 0.336 }
    ]
  },
  {
    id: 'prod-17',
    name: 'Macchiato',
    category: 'Hot Coffee',
    cost: 0.18,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-017',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Fresh Milk', qty: 20, uom: 'ml', cost: 0.042 }
    ]
  },
  {
    id: 'prod-18',
    name: 'Caramel Macchiato',
    category: 'Hot Coffee',
    cost: 0.77,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '🍮',
    sku: 'HOT-018',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Fresh Milk', qty: 160, uom: 'ml', cost: 0.336 },
      { ingredientName: 'Monin Caramel Syrup', qty: 10, uom: 'ml', cost: 0.150 },
      { ingredientName: 'Monin Caramel Sauce', qty: 10, uom: 'ml', cost: 0.137 }
    ]
  },
  {
    id: 'prod-19',
    name: 'Latte Macchiato',
    category: 'Hot Coffee',
    cost: 0.51,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '☕',
    sku: 'HOT-019',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Fresh Milk', qty: 160, uom: 'ml', cost: 0.336 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.0233 }
    ]
  },
  {
    id: 'prod-20',
    name: 'Raspberry Love',
    category: 'Hot Coffee',
    cost: 0.82,
    packagingCost: 0.18,
    price: 1.25,
    stock: 0,
    icon: '💖',
    sku: 'HOT-020',
    recipe: [
      { ingredientName: 'Sakor Bean', qty: 8, uom: 'g', cost: 0.1424 },
      { ingredientName: 'Fresh Milk', qty: 180, uom: 'ml', cost: 0.378 },
      { ingredientName: 'Monin Raspberry Syrup', qty: 10, uom: 'ml', cost: 0.150 },
      { ingredientName: 'Monin Caramel Syrup', qty: 10, uom: 'ml', cost: 0.150 }
    ]
  },

  // ==================== ICE COFFEE ====================
  {
    id: 'prod-21',
    name: 'Iced Americano',
    category: 'Ice Coffee',
    cost: 0.26,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🧊',
    sku: 'ICE-001',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 18, uom: 'g', cost: 0.216 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.023 }
    ]
  },
  {
    id: 'prod-22',
    name: 'Iced Latte',
    category: 'Ice Coffee',
    cost: 0.46,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🧊',
    sku: 'ICE-002',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 18, uom: 'g', cost: 0.216 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 15, uom: 'ml', cost: 0.035 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 },
      { ingredientName: 'Fresh Milk', qty: 100, uom: 'ml', cost: 0.190 }
    ]
  },
  {
    id: 'prod-23',
    name: 'Iced Cappuccino',
    category: 'Ice Coffee',
    cost: 0.46,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🧊',
    sku: 'ICE-003',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 18, uom: 'g', cost: 0.216 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 15, uom: 'ml', cost: 0.035 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 },
      { ingredientName: 'Fresh Milk', qty: 100, uom: 'ml', cost: 0.190 }
    ]
  },
  {
    id: 'prod-24',
    name: 'Iced Mocha',
    category: 'Ice Coffee',
    cost: 0.71,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🍫',
    sku: 'ICE-004',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 18, uom: 'g', cost: 0.216 },
      { ingredientName: 'Chocolate Powder', qty: 10, uom: 'g', cost: 0.168 },
      { ingredientName: 'Fresh Milk', qty: 140, uom: 'ml', cost: 0.266 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 15, uom: 'ml', cost: 0.035 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-25',
    name: 'Iced Chocolate',
    category: 'Ice Coffee',
    cost: 0.57,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🍫',
    sku: 'ICE-005',
    recipe: [
      { ingredientName: 'Chocolate Powder', qty: 15, uom: 'g', cost: 0.252 },
      { ingredientName: 'Fresh Milk', qty: 140, uom: 'ml', cost: 0.266 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 15, uom: 'ml', cost: 0.035 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-26',
    name: 'Iced Matcha Latte',
    category: 'Ice Coffee',
    cost: 0.54,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🍵',
    sku: 'ICE-006',
    recipe: [
      { ingredientName: 'Green tea Powder', qty: 4, uom: 'g', cost: 0.298 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 15, uom: 'ml', cost: 0.035 },
      { ingredientName: 'Fresh Milk', qty: 100, uom: 'ml', cost: 0.190 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-27',
    name: 'Iced Cambodian Coffee',
    category: 'Ice Coffee',
    cost: 0.48,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🧊',
    sku: 'ICE-007',
    recipe: [
      { ingredientName: 'Coffee Sayon', qty: 18, uom: 'g', cost: 0.216 },
      { ingredientName: 'Fresh Milk', qty: 50, uom: 'ml', cost: 0.095 },
      { ingredientName: 'Sweeten Milk', qty: 40, uom: 'ml', cost: 0.078 },
      { ingredientName: 'Kofi Evaporated milk', qty: 30, uom: 'ml', cost: 0.067 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },

  // ==================== ITALIAN SODA ====================
  {
    id: 'prod-28',
    name: 'Kiwi Soda',
    category: 'Soda',
    cost: 0.58,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🥝',
    sku: 'SOD-001',
    recipe: [
      { ingredientName: 'Monin Kiwi Syrup', qty: 30, uom: 'ml', cost: 0.450 },
      { ingredientName: 'Lime Juice', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Soda', qty: 120, uom: 'ml', cost: 0.083 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-29',
    name: 'Passion Soda',
    category: 'Soda',
    cost: 0.62,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🥭',
    sku: 'SOD-002',
    recipe: [
      { ingredientName: 'Monin Passion Syrup', qty: 30, uom: 'ml', cost: 0.450 },
      { ingredientName: 'Lime Juice', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Fresh Passion Fruit', qty: 1, uom: 'pc', cost: 0.048 },
      { ingredientName: 'Soda', qty: 120, uom: 'ml', cost: 0.083 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-30',
    name: 'Blue Curacao Soda',
    category: 'Soda',
    cost: 0.58,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🌊',
    sku: 'SOD-003',
    recipe: [
      { ingredientName: 'Monin Blue Curacao', qty: 30, uom: 'ml', cost: 0.450 },
      { ingredientName: 'Lime Juice', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Soda', qty: 120, uom: 'ml', cost: 0.083 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-31',
    name: 'Strawberry Soda',
    category: 'Soda',
    cost: 0.58,
    packagingCost: 0.22,
    price: 1.25,
    stock: 0,
    icon: '🍓',
    sku: 'SOD-004',
    recipe: [
      { ingredientName: 'Monin Strawberry Syrup', qty: 30, uom: 'ml', cost: 0.450 },
      { ingredientName: 'Lime Juice', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Soda', qty: 120, uom: 'ml', cost: 0.083 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },

  // ==================== SMOOTHIES ====================
  {
    id: 'prod-32',
    name: 'Strawberry Smoothies',
    category: 'Smoothies',
    cost: 1.22,
    packagingCost: 0.25,
    price: 1.25,
    stock: 0,
    icon: '🍓',
    sku: 'SMO-001',
    recipe: [
      { ingredientName: 'Monin Strawberry Puree', qty: 40, uom: 'ml', cost: 0.796 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Monin Smoothie base', qty: 20, uom: 'g', cost: 0.318 },
      { ingredientName: 'Kofi Non Dairy creamer', qty: 10, uom: 'g', cost: 0.058 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-33',
    name: 'Blueberry Smoothies',
    category: 'Smoothies',
    cost: 1.22,
    packagingCost: 0.25,
    price: 1.25,
    stock: 0,
    icon: '🫐',
    sku: 'SMO-002',
    recipe: [
      { ingredientName: 'Monin Blueberry Puree', qty: 40, uom: 'ml', cost: 0.796 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Monin Smoothie base', qty: 20, uom: 'g', cost: 0.318 },
      { ingredientName: 'Kofi Non Dairy creamer', qty: 10, uom: 'g', cost: 0.058 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-34',
    name: 'Passion Smoothies',
    category: 'Smoothies',
    cost: 1.22,
    packagingCost: 0.25,
    price: 1.25,
    stock: 0,
    icon: '🥭',
    sku: 'SMO-003',
    recipe: [
      { ingredientName: 'Monin Passion Puree', qty: 40, uom: 'ml', cost: 0.796 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Monin Smoothie base', qty: 20, uom: 'g', cost: 0.318 },
      { ingredientName: 'Kofi Non Dairy creamer', qty: 10, uom: 'g', cost: 0.058 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },

  // ==================== FRAPPE ====================
  {
    id: 'prod-35',
    name: 'Coffee Frappe',
    category: 'Frappe',
    cost: 1.16,
    packagingCost: 0.25,
    price: 1.25,
    stock: 0,
    icon: '🧋',
    sku: 'FRP-001',
    recipe: [
      { ingredientName: 'Monin Toffee nut syrup', qty: 30, uom: 'ml', cost: 0.450 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Monin Coffee Powder', qty: 20, uom: 'g', cost: 0.438 },
      { ingredientName: 'Kofi Non Dairy creamer', qty: 10, uom: 'g', cost: 0.058 },
      { ingredientName: 'Fresh Milk', qty: 90, uom: 'ml', cost: 0.171 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-36',
    name: 'Chocolate Frappe',
    category: 'Frappe',
    cost: 0.96,
    packagingCost: 0.25,
    price: 1.25,
    stock: 0,
    icon: '🍫',
    sku: 'FRP-002',
    recipe: [
      { ingredientName: 'Monin Dark Chocolate Sauce', qty: 30, uom: 'ml', cost: 0.316 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Monin Vanilla Powder', qty: 20, uom: 'g', cost: 0.370 },
      { ingredientName: 'Kofi Non Dairy creamer', qty: 10, uom: 'g', cost: 0.058 },
      { ingredientName: 'Fresh Milk', qty: 90, uom: 'ml', cost: 0.171 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-37',
    name: 'Green Tea Frappe',
    category: 'Frappe',
    cost: 1.09,
    packagingCost: 0.25,
    price: 1.25,
    stock: 0,
    icon: '🍵',
    sku: 'FRP-003',
    recipe: [
      { ingredientName: 'Monin Green Tea syrup', qty: 20, uom: 'ml', cost: 0.300 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 20, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Green tea Powder', qty: 2, uom: 'g', cost: 0.149 },
      { ingredientName: 'Monin Vanilla Powder', qty: 20, uom: 'g', cost: 0.370 },
      { ingredientName: 'Kofi Non Dairy creamer', qty: 10, uom: 'g', cost: 0.058 },
      { ingredientName: 'Fresh Milk', qty: 90, uom: 'ml', cost: 0.171 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  },
  {
    id: 'prod-38',
    name: 'Caramel Frappe',
    category: 'Frappe',
    cost: 1.16,
    packagingCost: 0.25,
    price: 1.25,
    stock: 0,
    icon: '🍮',
    sku: 'FRP-004',
    recipe: [
      { ingredientName: 'Monin Caramel Syrup', qty: 30, uom: 'ml', cost: 0.450 },
      { ingredientName: 'Kofi Sugar Syrup', qty: 10, uom: 'ml', cost: 0.023 },
      { ingredientName: 'Monin Coffee Powder', qty: 20, uom: 'g', cost: 0.438 },
      { ingredientName: 'Kofi Non Dairy creamer', qty: 10, uom: 'g', cost: 0.058 },
      { ingredientName: 'Fresh Milk', qty: 90, uom: 'ml', cost: 0.171 },
      { ingredientName: 'Ice', qty: 16, uom: 'oz', cost: 0.020 }
    ]
  }
];
