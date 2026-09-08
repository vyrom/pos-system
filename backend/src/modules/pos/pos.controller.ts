import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateIngredientDto, RestockIngredientDto } from './dto/create-ingredient.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { Product } from './entities/product.entity';
import { Ingredient } from './entities/ingredient.entity';
import { Expense } from './entities/expense.entity';
import { CategoryEntity } from './entities/category.entity';
import { UploadedFilePayload } from './services/image-processor.service';

@ApiTags('POS')
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  // ==================== INGREDIENTS ====================

  @Get('ingredients')
  @ApiOperation({ summary: 'Get all raw ingredients with optional category and search filters' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of ingredients', type: [Ingredient] })
  getIngredients(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Ingredient[] {
    return this.posService.getIngredients(category, search);
  }

  @Get('ingredients/categories')
  @ApiOperation({ summary: 'Get list of ingredient categories' })
  @ApiResponse({ status: 200, description: 'Ingredient categories' })
  getIngredientCategories(): string[] {
    return this.posService.getIngredientCategories();
  }

  @Get('ingredients/:id')
  @ApiOperation({ summary: 'Get single ingredient detail' })
  @ApiResponse({ status: 200, type: Ingredient })
  getIngredientById(@Param('id') id: string): Ingredient {
    return this.posService.getIngredientById(id);
  }

  @Post('ingredients')
  @ApiOperation({ summary: 'Create new raw ingredient' })
  @ApiResponse({ status: 201, type: Ingredient })
  createIngredient(@Body() dto: CreateIngredientDto): Ingredient {
    return this.posService.createIngredient(dto);
  }

  @Put('ingredients/:id')
  @ApiOperation({ summary: 'Update raw ingredient properties' })
  @ApiResponse({ status: 200, type: Ingredient })
  updateIngredient(
    @Param('id') id: string,
    @Body() dto: Partial<CreateIngredientDto>,
  ): Ingredient {
    return this.posService.updateIngredient(id, dto);
  }

  @Post('ingredients/:id/restock')
  @ApiOperation({ summary: 'Restock / add quantity to an existing ingredient stock' })
  @ApiResponse({ status: 200, type: Ingredient })
  restockIngredient(
    @Param('id') id: string,
    @Body() dto: RestockIngredientDto,
  ): Ingredient {
    return this.posService.restockIngredient(id, dto);
  }

  @Delete('ingredients/:id')
  @ApiOperation({ summary: 'Delete an ingredient' })
  @ApiResponse({ status: 200 })
  deleteIngredient(@Param('id') id: string) {
    return this.posService.deleteIngredient(id);
  }

  // ==================== PRODUCTS & RECIPES ====================

  @Get('products')
  @ApiOperation({ summary: 'Get all drinks with dynamically calculated available cups from ingredient stock' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'includeDisabled', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of products', type: [Product] })
  getProducts(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('includeDisabled') includeDisabled?: string,
  ): Product[] {
    const showDisabled = includeDisabled === 'true' || includeDisabled === '1';
    return this.posService.getProducts(category, search, showDisabled);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get single product details by ID' })
  @ApiResponse({ status: 200, description: 'Product detail', type: Product })
  getProductById(@Param('id') id: string): Product {
    return this.posService.getProductById(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product recipe' })
  @ApiResponse({ status: 201, type: Product })
  createProduct(@Body() createProductDto: CreateProductDto): Product {
    return this.posService.createProduct(createProductDto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update an existing product completely' })
  @ApiResponse({ status: 200, type: Product })
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Product {
    return this.posService.updateProduct(id, updateProductDto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Partially update an existing product' })
  @ApiResponse({ status: 200, type: Product })
  patchProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Product {
    return this.posService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product from the catalog' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  deleteProduct(@Param('id') id: string) {
    return this.posService.deleteProduct(id);
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload, auto-resize to 500x500 standard dimensions, compress to WebP, and save product image locally' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, WebP, GIF, SVG)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Image processed and saved successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|svg\+xml)$/)) {
          return cb(new BadRequestException('Only image files (JPG, PNG, WebP, GIF, SVG) are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedFilePayload) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    return this.posService.uploadProductImage(file);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed and reset products and ingredients from Bunrong Vyrom Recipe & Costing sheet' })
  @ApiResponse({ status: 201, description: 'Database seeded successfully' })
  seedProducts() {
    return this.posService.seedProducts();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get list of active product categories for cashier POS' })
  @ApiResponse({ status: 200, description: 'List of active category names', type: [String] })
  getCategories(): string[] {
    return this.posService.getCategories();
  }

  @Get('categories/manage')
  @ApiOperation({ summary: 'Get full list of categories with item counts & enabled status for Admin management' })
  @ApiResponse({ status: 200, description: 'List of category details', type: [CategoryEntity] })
  getCategoriesDetails(): CategoryEntity[] {
    return this.posService.getCategoriesDetails();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: CategoryEntity })
  createCategory(@Body() dto: CreateCategoryDto): CategoryEntity {
    return this.posService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: CategoryEntity })
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): CategoryEntity {
    return this.posService.updateCategory(id, dto);
  }

  @Patch('categories/:id/toggle')
  @ApiOperation({ summary: 'Toggle category enabled/disabled status' })
  @ApiResponse({ status: 200, description: 'Category status toggled', type: CategoryEntity })
  toggleCategoryStatus(@Param('id') id: string): CategoryEntity {
    return this.posService.toggleCategoryStatus(id);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  deleteCategory(@Param('id') id: string) {
    return this.posService.deleteCategory(id);
  }

  // ==================== POS ORDERS ====================

  @Post('orders')
  @ApiOperation({ summary: 'Create a new POS transaction order and automatically deduct recipe ingredients' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.posService.createOrder(createOrderDto);
  }

  @Get('orders/recent')
  @ApiOperation({ summary: 'Get recent POS orders' })
  getRecentOrders(@Query('limit') limit?: number) {
    return this.posService.getRecentOrders(limit ? Number(limit) : 10);
  }

  @Get('dashboard/metrics')
  @ApiOperation({ summary: 'Get POS summary metrics for dashboard' })
  getDashboardMetrics() {
    return this.posService.getDashboardMetrics();
  }

  // ==================== REPORTS & ANALYTICS ====================

  @Get('reports/stock')
  @ApiOperation({ summary: 'Get stock inventory report with valuation and status breakdown' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  getStockReport(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.posService.getStockReport(category, search);
  }

  @Get('reports/income')
  @ApiOperation({ summary: 'Get income and revenue financial report filtered by date range' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getIncomeReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.posService.getIncomeReport(startDate, endDate);
  }

  @Get('reports/best-selling')
  @ApiOperation({ summary: 'Get best selling items report ordered by sales quantity, filtered by date range' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  getBestSellingReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ) {
    return this.posService.getBestSellingReport(
      startDate,
      endDate,
      limit ? Number(limit) : 50,
      category,
    );
  }

  // ==================== STORE EXPENSES (OpEx & Payroll) ====================

  @Get('expenses')
  @ApiOperation({ summary: 'Get store expenses list filtered by date range, category, or search query' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: [Expense] })
  getExpenses(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Expense[] {
    return this.posService.getExpenses(startDate, endDate, category, search);
  }

  @Get('expenses/summary')
  @ApiOperation({ summary: 'Get summary totals for store expenses categorized by Water, Electricity, Rent, Salary, Maintenance' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getExpenseSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.posService.getExpenseSummary(startDate, endDate);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Record a new shop operating expense or staff payroll payment' })
  @ApiResponse({ status: 201, type: Expense })
  createExpense(@Body() dto: CreateExpenseDto): Expense {
    return this.posService.createExpense(dto);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete recorded shop expense' })
  deleteExpense(@Param('id') id: string) {
    return this.posService.deleteExpense(id);
  }
}
