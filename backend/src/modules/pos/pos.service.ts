import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { Ingredient } from './entities/ingredient.entity';
import { Expense } from './entities/expense.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateIngredientDto, RestockIngredientDto } from './dto/create-ingredient.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { INITIAL_INGREDIENTS_SEED, RECIPE_PRODUCTS_SEED } from './seeds/recipe-products.data';
import {
  ImageProcessorService,
  ProcessedImageResult,
  UploadedFilePayload,
} from './services/image-processor.service';

@Injectable()
export class PosService {
  constructor(private readonly imageProcessor: ImageProcessorService) {}

  private ingredients: Ingredient[] = JSON.parse(JSON.stringify(INITIAL_INGREDIENTS_SEED));
  private products: Product[] = JSON.parse(JSON.stringify(RECIPE_PRODUCTS_SEED));
  private orders: any[] = [];
  private expenses: Expense[] = [
    {
      id: 'exp-1',
      title: 'Water Bill (Phnom Penh Water Supply)',
      category: 'WATER',
      amount: 45.0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      note: 'Monthly clean water bill for coffee preparation and washing',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-2',
      title: 'Electricity Bill (EDC Electricite du Cambodge)',
      category: 'ELECTRICITY',
      amount: 135.5,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'QR_CODE',
      note: 'Commercial power for espresso machines & refrigeration',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-3',
      title: 'Monthly Store Lease',
      category: 'RENT',
      amount: 600.0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      note: 'Shop location monthly lease payment',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-4',
      title: 'Senior Barista Staff Salary',
      category: 'SALARY',
      amount: 350.0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      note: 'Staff monthly payroll',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-5',
      title: 'Ice Machine Maintenance',
      category: 'MAINTENANCE',
      amount: 30.0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      note: 'Water filter replacement and pump maintenance',
      createdAt: new Date().toISOString(),
    },
  ];

  // ==================== INGREDIENT INVENTORY ====================

  getIngredients(category?: string, search?: string): Ingredient[] {
    let result = [...this.ingredients];
    if (category && category.toLowerCase() !== 'all') {
      result = result.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return result;
  }

  getIngredientById(id: string): Ingredient {
    const ingredient = this.ingredients.find((i) => i.id === id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  getIngredientCategories(): string[] {
    const cats = Array.from(new Set(this.ingredients.map((i) => i.category)));
    return ['All', ...cats];
  }

  createIngredient(dto: CreateIngredientDto): Ingredient {
    const newIngredient: Ingredient = {
      id: `ing-${Date.now().toString().slice(-6)}`,
      name: dto.name,
      category: dto.category,
      stock: Number(dto.stock || 0),
      uom: dto.uom,
      costPerUnit: Number(dto.costPerUnit || 0),
      minStock: Number(dto.minStock || 0),
      icon: dto.icon || '📦',
    };
    this.ingredients.unshift(newIngredient);
    return newIngredient;
  }

  updateIngredient(id: string, dto: Partial<CreateIngredientDto>): Ingredient {
    const ing = this.getIngredientById(id);
    if (dto.name !== undefined) ing.name = dto.name;
    if (dto.category !== undefined) ing.category = dto.category;
    if (dto.stock !== undefined) ing.stock = Number(dto.stock);
    if (dto.uom !== undefined) ing.uom = dto.uom;
    if (dto.costPerUnit !== undefined) ing.costPerUnit = Number(dto.costPerUnit);
    if (dto.minStock !== undefined) ing.minStock = Number(dto.minStock);
    if (dto.icon !== undefined) ing.icon = dto.icon;
    return ing;
  }

  restockIngredient(id: string, dto: RestockIngredientDto): Ingredient {
    const ing = this.getIngredientById(id);
    ing.stock = Number((ing.stock + Number(dto.quantity)).toFixed(2));
    return ing;
  }

  deleteIngredient(id: string): { success: boolean; message: string } {
    const index = this.ingredients.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    this.ingredients.splice(index, 1);
    return { success: true, message: `Ingredient ${id} deleted successfully` };
  }

  // ==================== PRODUCT & RECIPES (COFFEE / DRINKS) ====================

  /**
   * Calculates the maximum number of cups that can be prepared for a drink
   * based on the lowest bottleneck ingredient in stock.
   */
  public calculateAvailableCups(product: Product): number {
    if (!product.recipe || product.recipe.length === 0) {
      return 999;
    }

    let minCups = Infinity;

    for (const item of product.recipe) {
      const ing = this.ingredients.find(
        (i) => (item.ingredientId && i.id === item.ingredientId) || i.name.toLowerCase() === (item.ingredientName || '').toLowerCase()
      );
      if (!ing || ing.stock <= 0 || item.qty <= 0) {
        return 0;
      }
      const possibleCups = Math.floor(ing.stock / item.qty);
      if (possibleCups < minCups) {
        minCups = possibleCups;
      }
    }

    return minCups === Infinity ? 0 : minCups;
  }

  getProducts(category?: string, search?: string): Product[] {
    let result = this.products.map((p) => {
      const availableStock = this.calculateAvailableCups(p);
      return {
        ...p,
        stock: availableStock,
      };
    });

    if (category && category.toLowerCase() !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return result;
  }

  getProductById(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return {
      ...product,
      stock: this.calculateAvailableCups(product),
    };
  }

  getCategories(): string[] {
    const categories = Array.from(new Set(this.products.map((p) => p.category)));
    return ['All', ...categories];
  }

  createProduct(dto: CreateProductDto): Product {
    const recipe = dto.recipe ? dto.recipe.map((r) => ({
      ingredientId: r.ingredientId,
      ingredientName: r.ingredientName,
      qty: Number(r.qty || 0),
      uom: r.uom,
      cost: Number(r.cost || 0),
    })) : [];

    let baseCost = Number(dto.cost || 0);
    if (recipe.length > 0) {
      baseCost = Number(recipe.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(2));
    }

    const newProduct: Product = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      name: dto.name,
      category: dto.category,
      cost: baseCost,
      packagingCost: Number(dto.packagingCost || 0),
      price: Number(dto.price || 0),
      stock: 0,
      icon: dto.icon || '☕',
      sku: dto.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      imageUrl: dto.imageUrl,
      recipe,
    };

    this.products.unshift(newProduct);
    return {
      ...newProduct,
      stock: this.calculateAvailableCups(newProduct),
    };
  }

  updateProduct(id: string, dto: UpdateProductDto): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.packagingCost !== undefined) product.packagingCost = Number(dto.packagingCost);
    if (dto.price !== undefined) product.price = Number(dto.price);
    if (dto.icon !== undefined) product.icon = dto.icon;
    if (dto.sku !== undefined) product.sku = dto.sku;
    
    if (dto.imageUrl !== undefined) {
      if (product.imageUrl && product.imageUrl !== dto.imageUrl) {
        this.imageProcessor.deleteLocalImage(product.imageUrl);
      }
      product.imageUrl = dto.imageUrl;
    }

    if (dto.recipe !== undefined) {
      product.recipe = dto.recipe.map((r) => ({
        ingredientId: r.ingredientId,
        ingredientName: r.ingredientName,
        qty: Number(r.qty || 0),
        uom: r.uom,
        cost: Number(r.cost || 0),
      }));
      // Auto-recalculate base cost from recipe items
      const computedBaseCost = product.recipe.reduce((sum, r) => sum + (r.cost || 0), 0);
      product.cost = Number(computedBaseCost.toFixed(2));
    } else if (dto.cost !== undefined) {
      product.cost = Number(dto.cost);
    }

    return {
      ...product,
      stock: this.calculateAvailableCups(product),
    };
  }

  async uploadProductImage(file: UploadedFilePayload): Promise<ProcessedImageResult> {
    return this.imageProcessor.processAndSaveImage(file, 500, 500, 80);
  }

  deleteProduct(id: string): { success: boolean; message: string } {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const [deleted] = this.products.splice(index, 1);
    if (deleted && deleted.imageUrl) {
      this.imageProcessor.deleteLocalImage(deleted.imageUrl);
    }
    return { success: true, message: `Product ${id} deleted successfully` };
  }

  seedProducts() {
    this.ingredients = JSON.parse(JSON.stringify(INITIAL_INGREDIENTS_SEED));
    this.products = JSON.parse(JSON.stringify(RECIPE_PRODUCTS_SEED));
    return {
      success: true,
      message: `Successfully seeded ${this.products.length} drinks and ${this.ingredients.length} raw ingredients from Bunrong Vyrom Recipe & Costing`,
      drinksCount: this.products.length,
      ingredientsCount: this.ingredients.length,
    };
  }

  private idempotencyCache: Map<string, { order: any; timestamp: number }> = new Map();

  private cleanIdempotencyCache() {
    const now = Date.now();
    for (const [key, val] of this.idempotencyCache.entries()) {
      if (now - val.timestamp > 10 * 60 * 1000) {
        this.idempotencyCache.delete(key);
      }
    }
  }

  // ==================== POS ORDERS & STOCK DEDUCTION ====================

  createOrder(createOrderDto: CreateOrderDto) {
    this.cleanIdempotencyCache();

    // 1. Idempotency Check: if request was already processed with this key, return the existing order
    if (createOrderDto.idempotencyKey && this.idempotencyCache.has(createOrderDto.idempotencyKey)) {
      return this.idempotencyCache.get(createOrderDto.idempotencyKey)!.order;
    }

    // 2. Rapid Double-Click Protection: check if identical order was completed within last 2 seconds
    const now = Date.now();
    const orderSignature = `${createOrderDto.total}_${createOrderDto.items.map((i) => `${i.productId}:${i.quantity}`).sort().join('|')}`;
    const recentDuplicate = this.orders.find((o) => {
      if (!o.createdAt) return false;
      const orderAge = now - new Date(o.createdAt).getTime();
      if (orderAge > 2000) return false;
      const sig = `${o.total}_${o.items.map((i: any) => `${i.productId}:${i.quantity}`).sort().join('|')}`;
      return sig === orderSignature && o.paymentMethod === createOrderDto.paymentMethod;
    });

    if (recentDuplicate) {
      if (createOrderDto.idempotencyKey) {
        this.idempotencyCache.set(createOrderDto.idempotencyKey, { order: recentDuplicate, timestamp: now });
      }
      return recentDuplicate;
    }

    // 3. Aggregated Stock Verification: Pre-calculate total requirement per ingredient across all items
    const requiredMap = new Map<string, { ing: Ingredient; totalNeeded: number }>();

    for (const item of createOrderDto.items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (product && product.recipe && product.recipe.length > 0) {
        for (const recipeItem of product.recipe) {
          const ing = this.ingredients.find(
            (i) => (recipeItem.ingredientId && i.id === recipeItem.ingredientId) ||
                   i.name.toLowerCase() === (recipeItem.ingredientName || '').toLowerCase()
          );

          if (ing) {
            const needed = recipeItem.qty * item.quantity;
            const existing = requiredMap.get(ing.id);
            if (existing) {
              existing.totalNeeded += needed;
            } else {
              requiredMap.set(ing.id, { ing, totalNeeded: needed });
            }
          }
        }
      }
    }

    // Check if any ingredient exceeds available stock
    for (const [_, item] of requiredMap.entries()) {
      if (item.ing.stock < item.totalNeeded) {
        throw new BadRequestException(
          `Insufficient stock: ${item.ing.name} (Requires ${item.totalNeeded.toFixed(2)} ${item.ing.uom}, Available: ${item.ing.stock.toFixed(2)} ${item.ing.uom})`
        );
      }
    }

    // 4. Atomic Stock Deduction
    for (const [_, item] of requiredMap.entries()) {
      item.ing.stock = Math.max(0, Number((item.ing.stock - item.totalNeeded).toFixed(2)));
    }

    // 5. Create and Record Order
    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      ...createOrderDto,
      status: 'COMPLETED',
    };

    this.orders.unshift(order);

    if (createOrderDto.idempotencyKey) {
      this.idempotencyCache.set(createOrderDto.idempotencyKey, { order, timestamp: now });
    }

    return order;
  }

  getRecentOrders(limit = 10) {
    return this.orders.slice(0, limit);
  }

  getDashboardMetrics() {
    const totalSales = this.orders.reduce((acc, curr) => acc + curr.total, 0);
    const totalOrders = this.orders.length;
    
    // Inventory metrics based on raw ingredient stock
    const ingredientValuation = this.ingredients.reduce((acc, curr) => acc + (curr.costPerUnit * curr.stock), 0);
    const lowStockIngredientsCount = this.ingredients.filter((i) => i.stock <= i.minStock).length;
    
    // Total cups capacity across catalog
    const totalCupsCapacity = this.products.reduce((acc, curr) => acc + this.calculateAvailableCups(curr), 0);

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders,
      totalProducts: this.products.length,
      totalIngredients: this.ingredients.length,
      totalCupsCapacity,
      lowStockIngredientsCount,
      ingredientValuation: parseFloat(ingredientValuation.toFixed(2)),
      recentOrders: this.getRecentOrders(5),
    };
  }

  // ==================== REPORTS & ANALYTICS ====================

  /**
   * 1. Stock Inventory Report (-report stock)
   */
  getStockReport(category?: string, search?: string) {
    let items = this.ingredients.map((ing) => {
      const stockValuation = Number((ing.stock * ing.costPerUnit).toFixed(2));
      let status = 'HEALTHY';
      if (ing.stock <= ing.minStock) {
        status = 'CRITICAL';
      } else if (ing.stock <= ing.minStock * 1.8) {
        status = 'WARNING';
      }

      // Count how many drink recipes use this ingredient
      const recipeUsageCount = this.products.filter((p) =>
        p.recipe?.some(
          (r) =>
            r.ingredientId === ing.id ||
            (r.ingredientName && r.ingredientName.toLowerCase() === ing.name.toLowerCase())
        )
      ).length;

      return {
        ...ing,
        stockValuation,
        status,
        recipeUsageCount,
      };
    });

    if (category && category.toLowerCase() !== 'all') {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }

    const totalValuation = Number(items.reduce((sum, i) => sum + i.stockValuation, 0).toFixed(2));
    const lowStockCount = items.filter((i) => i.status === 'CRITICAL').length;
    const warningStockCount = items.filter((i) => i.status === 'WARNING').length;
    const healthyStockCount = items.filter((i) => i.status === 'HEALTHY').length;

    return {
      summary: {
        totalItems: items.length,
        totalValuation,
        lowStockCount,
        warningStockCount,
        healthyStockCount,
        categoriesCount: Array.from(new Set(this.ingredients.map((i) => i.category))).length,
      },
      items,
    };
  }

  /**
   * 2. Income Report (- report income, filter by date range)
   */
  getIncomeReport(startDate?: string, endDate?: string) {
    let filteredOrders = [...this.orders];

    if (startDate) {
      const startMs = new Date(`${startDate}T00:00:00.000Z`).getTime();
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt).getTime() >= startMs);
    }
    if (endDate) {
      const endMs = new Date(`${endDate}T23:59:59.999Z`).getTime();
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt).getTime() <= endMs);
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let totalDiscount = 0;
    let totalOrders = filteredOrders.length;

    const paymentMap: Record<string, { amount: number; count: number }> = {
      CASH: { amount: 0, count: 0 },
      QR_CODE: { amount: 0, count: 0 },
      CARD: { amount: 0, count: 0 },
    };

    const dailyMap = new Map<string, { date: string; revenue: number; cost: number; profit: number; ordersCount: number }>();

    for (const order of filteredOrders) {
      totalRevenue += Number(order.total || 0);
      totalDiscount += Number(order.discount || 0);

      const method = order.paymentMethod || 'CASH';
      if (!paymentMap[method]) {
        paymentMap[method] = { amount: 0, count: 0 };
      }
      paymentMap[method].amount += Number(order.total || 0);
      paymentMap[method].count += 1;

      // Calculate cost of goods sold for this order (ingredients + packaging)
      let orderCost = 0;
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const product = this.products.find((p) => p.id === item.productId);
          if (product) {
            const unitCost = (product.cost || 0) + (product.packagingCost || 0);
            orderCost += unitCost * (item.quantity || 1);
          }
        }
      }
      totalCost += orderCost;

      // Group by YYYY-MM-DD for daily breakdown
      const dateKey = order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.revenue += Number(order.total || 0);
        existing.cost += orderCost;
        existing.profit += Number(order.total || 0) - orderCost;
        existing.ordersCount += 1;
      } else {
        dailyMap.set(dateKey, {
          date: dateKey,
          revenue: Number(order.total || 0),
          cost: orderCost,
          profit: Number(order.total || 0) - orderCost,
          ordersCount: 1,
        });
      }
    }

    totalRevenue = Number(totalRevenue.toFixed(2));
    totalCost = Number(totalCost.toFixed(2));
    totalDiscount = Number(totalDiscount.toFixed(2));
    const grossProfit = Number((totalRevenue - totalCost).toFixed(2));
    const profitMargin = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;
    const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    const paymentBreakdown = Object.entries(paymentMap).map(([method, data]) => ({
      method,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: totalRevenue > 0 ? Number(((data.amount / totalRevenue) * 100).toFixed(1)) : 0,
    }));

    const dailyBreakdown = Array.from(dailyMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((d) => ({
        ...d,
        revenue: Number(d.revenue.toFixed(2)),
        cost: Number(d.cost.toFixed(2)),
        profit: Number(d.profit.toFixed(2)),
      }));

    // Operating Expenses (Water, Electricity, Rent, Salary, Maintenance, Other)
    let filteredExpenses = [...this.expenses];
    if (startDate) {
      filteredExpenses = filteredExpenses.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      filteredExpenses = filteredExpenses.filter((e) => e.date <= endDate);
    }
    const totalExpenses = Number(filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2));
    const netProfitAfterExpenses = Number((grossProfit - totalExpenses).toFixed(2));
    const netProfitMargin = totalRevenue > 0 ? Number(((netProfitAfterExpenses / totalRevenue) * 100).toFixed(1)) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    return {
      dateRange: {
        startDate: startDate || todayStr,
        endDate: endDate || todayStr,
      },
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
        totalExpenses,
        netProfitAfterExpenses,
        netProfitMargin,
        totalOrders,
        avgOrderValue,
        totalDiscount,
      },
      paymentBreakdown,
      dailyBreakdown,
    };
  }

  /**
   * 3. Best Selling Items Report (- repost sell qty by item order by best selling, filter by date range)
   */
  getBestSellingReport(startDate?: string, endDate?: string, limit = 50, category?: string) {
    let filteredOrders = [...this.orders];

    if (startDate) {
      const startMs = new Date(`${startDate}T00:00:00.000Z`).getTime();
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt).getTime() >= startMs);
    }
    if (endDate) {
      const endMs = new Date(`${endDate}T23:59:59.999Z`).getTime();
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt).getTime() <= endMs);
    }

    // Aggregate sales quantity and revenue by productId
    const salesMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        quantitySold: number;
        totalRevenue: number;
        unitPrice: number;
      }
    >();

    for (const order of filteredOrders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const pId = item.productId;
          const qty = Number(item.quantity || 1);
          const price = Number(item.price || 0);
          const itemRev = price * qty;

          const existing = salesMap.get(pId);
          if (existing) {
            existing.quantitySold += qty;
            existing.totalRevenue += itemRev;
          } else {
            salesMap.set(pId, {
              productId: pId,
              productName: item.productName || 'Drink Item',
              quantitySold: qty,
              totalRevenue: itemRev,
              unitPrice: price,
            });
          }
        }
      }
    }

    // Merge with product details (category, recipe cost, image, etc.)
    let items = Array.from(salesMap.values()).map((s) => {
      const product = this.products.find((p) => p.id === s.productId);
      const category = product ? product.category : 'Beverage';
      const icon = product ? product.icon : '☕';
      const sku = product ? product.sku : 'SKU-000';
      const imageUrl = product ? product.imageUrl : undefined;
      const unitCost = product ? (product.cost || 0) + (product.packagingCost || 0) : 0;

      const totalCost = Number((s.quantitySold * unitCost).toFixed(2));
      const totalRevenue = Number(s.totalRevenue.toFixed(2));
      const totalProfit = Number((totalRevenue - totalCost).toFixed(2));
      const profitMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0;

      return {
        productId: s.productId,
        productName: product ? product.name : s.productName,
        category,
        icon,
        sku,
        imageUrl,
        quantitySold: s.quantitySold,
        unitPrice: s.unitPrice,
        unitCost,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
      };
    });

    if (category && category.toLowerCase() !== 'all') {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }

    // ORDER BY BEST SELLING (quantitySold DESC, then totalRevenue DESC)
    items.sort((a, b) => b.quantitySold - a.quantitySold || b.totalRevenue - a.totalRevenue);

    // Assign rank #1, #2, #3...
    const rankedItems = items.map((item, idx) => ({
      rank: idx + 1,
      ...item,
    })).slice(0, limit);

    const totalUnitsSold = rankedItems.reduce((sum, i) => sum + i.quantitySold, 0);
    const totalRevenue = Number(rankedItems.reduce((sum, i) => sum + i.totalRevenue, 0).toFixed(2));
    const totalProfit = Number(rankedItems.reduce((sum, i) => sum + i.totalProfit, 0).toFixed(2));

    const topSellingProduct = rankedItems.length > 0 ? rankedItems[0].productName : 'N/A';
    const topCategory = rankedItems.length > 0 ? rankedItems[0].category : 'N/A';

    const todayStr = new Date().toISOString().split('T')[0];
    return {
      dateRange: {
        startDate: startDate || todayStr,
        endDate: endDate || todayStr,
      },
      summary: {
        totalUnitsSold,
        totalRevenue,
        totalProfit,
        topSellingProduct,
        topCategory,
        itemsCount: rankedItems.length,
      },
      items: rankedItems,
    };
  }

  // ==================== STORE EXPENSES (OpEx & Payroll) ====================

  getExpenses(startDate?: string, endDate?: string, category?: string, search?: string): Expense[] {
    let result = [...this.expenses];

    if (startDate) {
      result = result.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      result = result.filter((e) => e.date <= endDate);
    }
    if (category && category.toUpperCase() !== 'ALL') {
      result = result.filter((e) => e.category.toUpperCase() === category.toUpperCase());
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || (e.note && e.note.toLowerCase().includes(q)));
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }

  createExpense(dto: CreateExpenseDto): Expense {
    if (dto.amount === undefined || dto.amount === null || isNaN(Number(dto.amount)) || Number(dto.amount) <= 0) {
      throw new BadRequestException('Expense amount must be a positive number');
    }

    const category = dto.category || 'OTHER';
    let defaultTitle = 'Other Expense';
    switch (category) {
      case 'WATER':
        defaultTitle = 'Water Bill';
        break;
      case 'ELECTRICITY':
        defaultTitle = 'Electricity Bill';
        break;
      case 'RENT':
        defaultTitle = 'Shop Rent';
        break;
      case 'SALARY':
        defaultTitle = 'Staff Salary';
        break;
      case 'MAINTENANCE':
        defaultTitle = 'Maintenance';
        break;
    }

    const title = dto.title && dto.title.trim() ? dto.title.trim() : defaultTitle;

    const todayStr = new Date().toISOString().split('T')[0];
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title,
      category,
      amount: Number(Number(dto.amount).toFixed(2)),
      date: dto.date || todayStr,
      paymentMethod: dto.paymentMethod || 'CASH',
      note: dto.note || '',
      createdAt: new Date().toISOString(),
    };

    this.expenses.unshift(newExpense);
    return newExpense;
  }

  deleteExpense(id: string): { success: boolean; id: string } {
    const idx = this.expenses.findIndex((e) => e.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    this.expenses.splice(idx, 1);
    return { success: true, id };
  }

  getExpenseSummary(startDate?: string, endDate?: string) {
    const expenses = this.getExpenses(startDate, endDate);

    const totalExpenses = Number(expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2));
    const waterTotal = Number(expenses.filter((e) => e.category === 'WATER').reduce((sum, e) => sum + e.amount, 0).toFixed(2));
    const electricityTotal = Number(expenses.filter((e) => e.category === 'ELECTRICITY').reduce((sum, e) => sum + e.amount, 0).toFixed(2));
    const rentTotal = Number(expenses.filter((e) => e.category === 'RENT').reduce((sum, e) => sum + e.amount, 0).toFixed(2));
    const salaryTotal = Number(expenses.filter((e) => e.category === 'SALARY').reduce((sum, e) => sum + e.amount, 0).toFixed(2));
    const maintenanceTotal = Number(expenses.filter((e) => e.category === 'MAINTENANCE').reduce((sum, e) => sum + e.amount, 0).toFixed(2));
    const otherTotal = Number(expenses.filter((e) => e.category === 'OTHER').reduce((sum, e) => sum + e.amount, 0).toFixed(2));

    return {
      totalExpenses,
      byCategory: {
        WATER: waterTotal,
        ELECTRICITY: electricityTotal,
        RENT: rentTotal,
        SALARY: salaryTotal,
        MAINTENANCE: maintenanceTotal,
        OTHER: otherTotal,
      },
      utilitiesTotal: Number((waterTotal + electricityTotal).toFixed(2)),
      count: expenses.length,
    };
  }
}
