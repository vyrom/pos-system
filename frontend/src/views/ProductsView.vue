<template>
  <div class="products-page">
    <!-- Header Section -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('prod.title') }}</h1>
        <p class="page-subtitle">{{ t('prod.subtitle') }}</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary seed-btn" @click="handleSeedRecipes" :disabled="seeding" title="Reset and populate all 38 recipes from Bunrong Vyrom ( Recipe & Costing ).xlsx">
          <Loader2 v-if="seeding" class="spinner" :size="16" />
          <Sprout v-else :size="16" />
          <span>{{ t('prod.seedBtn') }}</span>
        </button>
        <button class="btn btn-secondary manage-cat-btn" @click="openCategoryModal">
          <FolderCog :size="16" />
          <span>{{ t('prod.manageCategories') }}</span>
        </button>
        <button class="btn btn-primary add-product-btn" @click="openAddModal">
          <Plus :size="18" />
          <span>{{ t('prod.addBtn') }}</span>
        </button>
      </div>
    </div>

    <!-- Financial KPI Summary Cards -->
    <div class="summary-cards-grid">
      <div class="kpi-card">
        <div class="kpi-icon-box bg-blue">
          <Package :size="22" />
        </div>
        <div>
          <div class="kpi-label">{{ t('prod.catalogItems') }}</div>
          <div class="kpi-val">{{ products.length }} {{ t('nav.products') }}</div>
          <div class="kpi-sub">{{ totalUnitsInStock }} {{ t('prod.unitsInStock') }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box bg-purple">
          <Boxes :size="22" />
        </div>
        <div>
          <div class="kpi-label">{{ t('prod.totalCost') }}</div>
          <div class="kpi-val">${{ totalInventoryCost.toFixed(2) }}</div>
          <div class="kpi-sub">{{ t('prod.basePackCost') }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box bg-indigo">
          <Tag :size="22" />
        </div>
        <div>
          <div class="kpi-label">{{ t('prod.retailVal') }}</div>
          <div class="kpi-val">${{ totalRetailValuation.toFixed(2) }}</div>
          <div class="kpi-sub">{{ t('prod.expectedSales') }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box bg-emerald">
          <TrendingUp :size="22" />
        </div>
        <div>
          <div class="kpi-label">{{ t('prod.potentialProfit') }}</div>
          <div class="kpi-val text-success">${{ totalPotentialProfit.toFixed(2) }}</div>
          <div class="kpi-sub">{{ t('prod.avgMargin') }} <strong class="text-success">{{ averageMarginPercent }}%</strong></div>
        </div>
      </div>
    </div>

    <!-- Search & Category Filters -->
    <div class="filter-toolbar">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          type="text"
          :placeholder="t('prod.search')"
          v-model="searchQuery"
          @input="filterProducts"
          class="input-field"
        />
      </div>

      <div class="category-filter-bar">
        <button
          v-for="cat in categories"
          :key="cat"
          class="category-chip"
          :class="{ active: selectedCategory === cat }"
          @click="selectCategory(cat)"
        >
          {{ translateCategory(cat) }}
        </button>
      </div>
    </div>

    <!-- Product Table -->
    <div class="card table-card">
      <div v-if="loading" class="loading-container">
        <Loader2 class="spinner" :size="32" />
        <span>{{ t('prod.loading') }}</span>
      </div>

      <div v-else-if="products.length === 0" class="empty-state">
        <PackageX :size="48" class="empty-icon" />
        <h3>{{ t('prod.noProducts') }}</h3>
        <p>{{ t('prod.noProductsSub') }}</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" @click="openAddModal">
          <Plus :size="16" /> {{ t('prod.addBtn') }}
        </button>
      </div>

      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('prod.tblItem') }}</th>
              <th>{{ t('prod.tblCat') }}</th>
              <th>{{ t('prod.tblSku') }}</th>
              <th>{{ t('prod.tblBaseCost') }}</th>
              <th>{{ t('prod.tblPackCost') }}</th>
              <th>{{ t('prod.tblTotalCost') }}</th>
              <th>{{ t('prod.tblPrice') }}</th>
              <th>{{ t('prod.tblMargin') }}</th>
              <th>{{ t('prod.tblStock') }}</th>
              <th style="text-align: right;">{{ t('prod.tblActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <div class="product-cell">
                  <div class="product-icon-wrap">
                    <img
                      v-if="product.imageUrl"
                      :src="getProductImageUrl(product.imageUrl)"
                      :alt="product.name"
                      class="product-thumb-img"
                    />
                    <span v-else class="product-icon">{{ product.icon || '☕' }}</span>
                  </div>
                  <div>
                    <div class="product-name">{{ product.name }}</div>
                    <div v-if="product.recipe && product.recipe.length > 0" class="recipe-preview">
                      <span v-for="(r, idx) in product.recipe.slice(0, 3)" :key="idx" class="recipe-chip">
                        {{ r.qty }}{{ r.uom }} {{ r.ingredientName }}
                      </span>
                      <span v-if="product.recipe.length > 3" class="recipe-more">+{{ product.recipe.length - 3 }} more</span>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span class="category-tag">{{ translateCategory(product.category) }}</span>
              </td>
              <td class="font-mono text-muted">{{ product.sku }}</td>
              <td class="font-mono">${{ (product.cost || 0).toFixed(2) }}</td>
              <td class="font-mono">${{ (product.packagingCost || 0).toFixed(2) }}</td>
              <td class="font-bold font-mono text-dark">
                ${{ ((product.cost || 0) + (product.packagingCost || 0)).toFixed(2) }}
              </td>
              <td class="font-bold font-mono text-primary">
                ${{ (product.price || 0).toFixed(2) }}
              </td>
              <td>
                <div class="margin-badge-box">
                  <span
                    class="badge"
                    :class="getMarginBadgeClass(product)"
                  >
                    +${{ getUnitProfit(product).toFixed(2) }} ({{ getMarginPercent(product) }}%)
                  </span>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :class="product.stock > 20 ? 'badge-coffee' : product.stock > 0 ? 'badge-warning' : 'badge-danger'"
                  :title="`Can prepare up to ${product.stock} cups from current ingredient inventory`"
                >
                  {{ product.stock > 0 ? `~${product.stock} ${t('prod.cups')}` : t('prod.outOfIngredient') }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-buttons">
                  <button class="action-btn edit-btn" :title="t('prod.edit')" @click="openEditModal(product)">
                    <Edit3 :size="16" />
                  </button>
                  <button class="action-btn delete-btn" :title="t('prod.delete')" @click="confirmDelete(product)">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ADD / EDIT PRODUCT MODAL -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="product-modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge">
              <PlusCircle v-if="isCreating" :size="24" />
              <Edit3 v-else :size="24" />
            </div>
            <div>
              <h2 class="modal-title">{{ isCreating ? t('prod.modalAddTitle') : t('prod.modalEditTitle') }}</h2>
              <p class="modal-subtitle">{{ isCreating ? t('prod.modalAddSub') : t('prod.modalEditSub') }}</p>
            </div>
          </div>
          <button class="close-btn" @click="closeModal">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="modal-form">
          <!-- Basic Info Section -->
          <div class="form-section-title">{{ t('prod.generalInfo') }}</div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">{{ t('prod.name') }}</label>
              <input
                type="text"
                v-model="formData.name"
                required
                placeholder="e.g. Vanilla Iced Latte"
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('prod.category') }}</label>
              <div class="category-input-wrapper">
                <input
                  type="text"
                  v-model="formData.category"
                  required
                  placeholder="e.g. Coffee, Bakery, Food"
                  class="input-field"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option v-for="cat in availableCategories" :key="cat" :value="cat" />
                </datalist>
              </div>
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">{{ t('prod.sku') }}</label>
              <input
                type="text"
                v-model="formData.sku"
                placeholder="e.g. LAT-001"
                class="input-field font-mono"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('prod.drinkAvailability') }}</label>
              <div class="stock-info-pill" :class="modalAvailableStock > 0 ? 'stock-ok' : 'stock-zero'">
                <span class="stock-num font-mono">{{ modalAvailableStock > 0 ? `~${modalAvailableStock} ${t('prod.cups')}` : t('pos.outOfStock') }}</span>
                <span class="stock-hint">{{ t('prod.autoComputed') }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('prod.iconEmoji') }}</label>
              <input
                type="text"
                v-model="formData.icon"
                placeholder="☕"
                class="input-field text-center"
              />
            </div>
          </div>

          <!-- Quick Emoji Picker -->
          <div class="emoji-selector">
            <span class="emoji-label">{{ t('prod.quickIcon') }}</span>
            <div class="emoji-chips">
              <button
                type="button"
                v-for="e in ['☕', '🍵', '🧊', '🫖', '🥐', '🧁', '🍫', '🥑', '🥪', '🍊', '💧', '🍕', '🍔', '🥤', '🥗', '🍰', '🧇', '📦']"
                :key="e"
                class="emoji-chip"
                :class="{ active: formData.icon === e }"
                @click="formData.icon = e"
              >
                {{ e }}
              </button>
            </div>
          </div>

          <!-- Product Image Upload & Auto-Compress Section -->
          <div class="image-upload-card">
            <div class="image-upload-header">
              <div class="image-upload-title-wrap">
                <ImageIcon :size="16" class="text-primary" />
                <span class="image-section-title">{{ t('prod.productImage') }}</span>
              </div>
              <span class="standard-size-badge">{{ t('prod.standardSize') }}</span>
            </div>

            <div class="image-upload-body">
              <!-- Thumbnail Preview Box -->
              <div class="image-preview-box">
                <div v-if="uploadingImage" class="image-upload-loading">
                  <Loader2 class="spinner" :size="24" />
                  <span>{{ t('prod.compressing') }}</span>
                </div>
                <img
                  v-else-if="formData.imageUrl"
                  :src="getProductImageUrl(formData.imageUrl)"
                  alt="Product Image Preview"
                  class="uploaded-preview-img"
                />
                <div v-else class="image-placeholder-box">
                  <span class="placeholder-emoji">{{ formData.icon || '☕' }}</span>
                  <span class="placeholder-text">{{ t('prod.iconEmoji') }}</span>
                </div>
              </div>

              <!-- Controls & Info -->
              <div class="image-controls-wrap">
                <div class="image-action-buttons">
                  <input
                    type="file"
                    ref="fileInputRef"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/jpg"
                    class="hidden-file-input"
                    @change="onFileSelected"
                  />
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm upload-trigger-btn"
                    @click="triggerFileInput"
                    :disabled="uploadingImage"
                  >
                    <UploadCloud :size="15" />
                    <span>{{ formData.imageUrl ? t('prod.changePhoto') : t('prod.uploadImage') }}</span>
                  </button>

                  <button
                    v-if="formData.imageUrl"
                    type="button"
                    class="btn btn-outline-danger btn-sm remove-image-btn"
                    @click="removeProductImage"
                    :disabled="uploadingImage"
                    title="Remove custom image and revert to emoji icon"
                  >
                    <Trash2 :size="14" />
                    <span>{{ t('prod.removePhoto') }}</span>
                  </button>
                </div>

                <!-- Optimization Stats Banner -->
                <div v-if="lastUploadStats" class="upload-stats-banner">
                  <Sparkles :size="14" class="text-success" />
                  <span>
                    Auto-optimized to 500x500 ({{ (lastUploadStats.originalSizeBytes / 1024).toFixed(1) }}KB &rarr; {{ (lastUploadStats.compressedSizeBytes / 1024).toFixed(1) }}KB, {{ lastUploadStats.savingsPercentage }} space saved)
                  </span>
                </div>
                <div v-else class="upload-help-text">
                  {{ t('prod.imageHelp') }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-divider"></div>

          <!-- DRINK RECIPE BUILDER SECTION -->
          <div class="recipe-section-box">
            <div class="recipe-section-top">
              <div class="recipe-section-title-wrap">
                <Layers :size="18" class="text-primary" />
                <div>
                  <h4 class="recipe-heading">{{ t('prod.recipeTitle') }}</h4>
                  <p class="recipe-desc">{{ t('prod.recipeDesc') }}</p>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm add-ingredient-row-btn" @click="addRecipeItem">
                <Plus :size="15" />
                <span>{{ t('prod.addIngredient') }}</span>
              </button>
            </div>

            <div v-if="!formData.recipe || formData.recipe.length === 0" class="recipe-empty-state">
              <p>{{ t('prod.noIngredients') }}</p>
              <button type="button" class="btn btn-outline-primary btn-sm" @click="addRecipeItem">
                <Plus :size="14" /> {{ t('prod.addFirstIngredient') }}
              </button>
            </div>

            <div v-else class="recipe-table-wrapper">
              <table class="recipe-modal-table">
                <thead>
                  <tr>
                    <th>{{ t('prod.ingredient') }}</th>
                    <th style="width: 110px;">{{ t('prod.quantity') }}</th>
                    <th style="width: 65px;">{{ t('prod.unit') }}</th>
                    <th style="width: 95px;">{{ t('prod.unitCost') }}</th>
                    <th style="width: 95px;">{{ t('prod.lineCost') }}</th>
                    <th style="width: 42px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in formData.recipe" :key="idx">
                    <td>
                      <select
                        v-model="item.ingredientId"
                        @change="onIngredientSelectChange(item)"
                        class="input-field select-field recipe-select"
                        required
                      >
                        <option value="" disabled>{{ t('prod.selectRawMaterial') }}</option>
                        <optgroup v-for="cat in ingredientGroupedCategories" :key="cat" :label="translateCategory(cat)">
                          <option
                            v-for="ing in getIngredientsByCategory(cat)"
                            :key="ing.id"
                            :value="ing.id"
                          >
                            {{ ing.icon || '🧂' }} {{ ing.name }} (${{ ing.costPerUnit }}/{{ ing.uom }})
                          </option>
                        </optgroup>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        v-model.number="item.qty"
                        @input="onRecipeQtyChange(item)"
                        class="input-field font-mono text-center qty-input"
                        placeholder="0"
                        required
                      />
                    </td>
                    <td>
                      <span class="unit-badge">{{ item.uom || '-' }}</span>
                    </td>
                    <td class="font-mono text-muted text-xs">
                      ${{ getIngredientUnitCost(item.ingredientId).toFixed(4) }}
                    </td>
                    <td class="font-mono font-bold text-dark">
                      ${{ (item.cost || 0).toFixed(3) }}
                    </td>
                    <td style="text-align: right;">
                      <button
                        type="button"
                        class="btn-icon-del"
                        :title="t('prod.delete')"
                        @click="removeRecipeItem(idx)"
                      >
                        <Trash2 :size="15" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="recipe-footer-bar">
                <div class="recipe-notice">
                  <Info :size="14" />
                  <span>{{ t('prod.baseCostAuto') }}</span>
                </div>
                <div class="recipe-sum-box">
                  <span class="sum-label">{{ t('prod.recipeBaseCost') }}</span>
                  <span class="sum-val font-mono font-bold">${{ modalRecipeTotalCost.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-divider"></div>

          <!-- Pricing & Cost Breakdown Section -->
          <div class="form-section-title">
            <span>{{ t('prod.costPricing') }}</span>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">{{ t('prod.baseCost') }}</label>
              <div class="currency-input">
                <span class="cur-symbol">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="formData.cost"
                  required
                  placeholder="0.00"
                  class="input-field font-mono"
                />
              </div>
              <span class="input-hint">Sum of raw ingredients</span>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('prod.packagingCost') }}</label>
              <div class="currency-input">
                <span class="cur-symbol">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="formData.packagingCost"
                  required
                  placeholder="0.00"
                  class="input-field font-mono"
                />
              </div>
              <span class="input-hint">Cup, lid, bag, container</span>
            </div>

            <div class="form-group">
              <label class="form-label highlight-label">{{ t('prod.sellPrice') }}</label>
              <div class="currency-input">
                <span class="cur-symbol">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="formData.price"
                  required
                  placeholder="0.00"
                  class="input-field font-mono price-input"
                />
              </div>
              <span class="input-hint">Final customer menu price</span>
            </div>
          </div>

          <!-- Live Cost & Profit Margin Analysis Card -->
          <div class="margin-calculator-card" :class="calculatedMarginClass">
            <div class="calc-header">
              <Calculator :size="18" />
              <strong>{{ t('prod.profitCalc') }}</strong>
            </div>

            <div class="calc-metrics-grid">
              <div class="calc-item">
                <span class="calc-item-label">{{ t('prod.totalUnitCost') }}</span>
                <span class="calc-item-val font-mono">${{ modalTotalCost.toFixed(2) }}</span>
                <span class="calc-item-sub">Cost + Packaging</span>
              </div>

              <div class="calc-item">
                <span class="calc-item-label">{{ t('prod.profitPerUnit') }}</span>
                <span class="calc-item-val font-mono" :class="modalUnitProfit >= 0 ? 'text-success' : 'text-danger'">
                  {{ modalUnitProfit >= 0 ? '+' : '' }}${{ modalUnitProfit.toFixed(2) }}
                </span>
                <span class="calc-item-sub">Sell Price - Total Cost</span>
              </div>

              <div class="calc-item">
                <span class="calc-item-label">{{ t('prod.profitMargin') }}</span>
                <span class="calc-item-val font-mono" :class="modalMarginPercent >= 20 ? 'text-success' : modalMarginPercent >= 0 ? 'text-warning' : 'text-danger'">
                  {{ modalMarginPercent.toFixed(1) }}%
                </span>
                <span class="calc-item-sub">Margin on retail price</span>
              </div>

              <div class="calc-item">
                <span class="calc-item-label">{{ t('prod.markup') }}</span>
                <span class="calc-item-val font-mono" :class="modalMarkupPercent >= 0 ? 'text-success' : 'text-danger'">
                  {{ modalMarkupPercent.toFixed(1) }}%
                </span>
                <span class="calc-item-sub">Markup over cost</span>
              </div>
            </div>

            <div v-if="modalUnitProfit < 0" class="margin-warning">
              <AlertTriangle :size="16" />
              <span>{{ t('prod.marginLossWarning') }}</span>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">{{ t('prod.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <Loader2 v-if="saving" class="spinner" :size="16" />
              <Check v-else :size="16" />
              <span>{{ isCreating ? t('prod.create') : t('prod.save') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal && productToDelete" class="modal-backdrop" @click.self="showDeleteModal = false">
      <div class="delete-modal">
        <div class="delete-modal-icon">
          <Trash2 :size="32" />
        </div>
        <h3 class="delete-title">{{ t('prod.deleteTitle') }}</h3>
        <p class="delete-desc">
          {{ t('prod.deleteConfirm') }} <strong>{{ productToDelete.name }}</strong> (SKU: {{ productToDelete.sku }})? {{ t('prod.deleteWarning') }}
        </p>
        <div class="delete-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">{{ t('prod.cancel') }}</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
            <Loader2 v-if="deleting" class="spinner" :size="16" />
            <span>{{ t('prod.delete') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CATEGORY MANAGEMENT MODAL -->
    <div v-if="showCategoryModal" class="modal-backdrop" @click.self="closeCategoryModal">
      <div class="category-modal">
        <div class="modal-header">
          <div>
            <h2 class="modal-title flex-center-gap">
              <FolderCog :size="22" class="text-amber" />
              <span>{{ t('cat.manageTitle') }}</span>
            </h2>
            <p class="modal-subtitle">{{ t('cat.manageSub') }}</p>
          </div>
          <button class="btn-close" @click="closeCategoryModal">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body category-modal-body">
          <!-- Add / Edit Category Form -->
          <div class="cat-form-card">
            <h4 class="cat-form-title font-bold text-coffee">
              {{ isEditingCat ? t('cat.editCat') : t('cat.addCat') }}
            </h4>
            <div class="cat-form-grid">
              <div class="form-group">
                <label class="form-label">{{ t('cat.nameEn') }}</label>
                <input
                  type="text"
                  v-model="catFormData.name"
                  placeholder="e.g. Ice Coffee"
                  class="input-field"
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('cat.nameKm') }}</label>
                <input
                  type="text"
                  v-model="catFormData.nameKh"
                  placeholder="ឧ. កាហ្វេទឹកកក"
                  class="input-field"
                />
              </div>
              <div class="form-group sm-group">
                <label class="form-label">{{ t('cat.icon') }}</label>
                <input
                  type="text"
                  v-model="catFormData.icon"
                  placeholder="☕"
                  class="input-field text-center"
                />
              </div>
              <div class="cat-form-actions">
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="handleSaveCategory"
                  :disabled="!catFormData.name.trim()"
                >
                  <Plus v-if="!isEditingCat" :size="14" />
                  <Check v-else :size="14" />
                  <span>{{ isEditingCat ? t('common.save') : t('common.add') }}</span>
                </button>
                <button
                  v-if="isEditingCat"
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="resetCatForm"
                >
                  <span>{{ t('common.cancel') }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Category List Table -->
          <div class="cat-list-container">
            <div v-if="posStore.categoryLoading" class="loading-container p-4">
              <Loader2 class="spinner" :size="24" />
            </div>
            <div v-else class="cat-table-wrapper">
              <table class="cat-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item Count</th>
                    <th>Status (POS Visibility)</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cat in categoriesDetails" :key="cat.id" :class="{ 'row-disabled': !cat.isEnabled }">
                    <td>
                      <div class="cat-cell-name">
                        <span class="cat-emoji-badge">{{ cat.icon || '☕' }}</span>
                        <div>
                          <div class="cat-main-name font-bold">{{ cat.name }}</div>
                          <div v-if="cat.nameKh" class="cat-sub-name text-muted">{{ cat.nameKh }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-neutral font-mono">{{ cat.itemCount || 0 }} {{ t('cat.itemsCount') }}</span>
                    </td>
                    <td>
                      <div class="toggle-status-wrapper" @click="handleToggleCategory(cat)">
                        <button
                          type="button"
                          class="toggle-switch-btn"
                          :class="{ active: cat.isEnabled }"
                          :title="cat.isEnabled ? t('cat.enabled') : t('cat.disabled')"
                        >
                          <span class="toggle-slider"></span>
                        </button>
                        <span class="toggle-label" :class="cat.isEnabled ? 'text-enabled' : 'text-disabled'">
                          {{ cat.isEnabled ? t('cat.enabled') : t('cat.disabled') }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="actions-cell flex-end-gap">
                        <button class="icon-btn edit" @click="startEditCategory(cat)" title="Edit Category">
                          <Edit3 :size="16" />
                        </button>
                        <button class="icon-btn delete" @click="handleDeleteCategory(cat)" title="Delete Category">
                          <Trash2 :size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeCategoryModal">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Package,
  PackageX,
  Boxes,
  Tag,
  TrendingUp,
  PlusCircle,
  X,
  Check,
  Calculator,
  AlertTriangle,
  Loader2,
  Sprout,
  Layers,
  Info,
  UploadCloud,
  ImageIcon,
  Sparkles,
  FolderCog,
} from 'lucide-vue-next';
import { posApi, Product, RecipeItem, getProductImageUrl } from '../services/api';
import { usePosStore } from '../stores/posStore';
import { useI18n } from '../i18n';

const { locale, t, translateCategory } = useI18n();
const posStore = usePosStore();
const products = ref<Product[]>([]);
const categories = ref<string[]>(['All']);
const selectedCategory = ref(
  (typeof localStorage !== 'undefined' ? localStorage.getItem('products_selected_category') : null) || 'All'
);
const searchQuery = ref('');
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const seeding = ref(false);

// Modal state
const showModal = ref(false);
const isCreating = ref(true);
const editingProductId = ref<string | null>(null);

// Category Management Modal state
const showCategoryModal = ref(false);
const categoriesDetails = computed(() => posStore.categoriesDetails);
const editingCategory = ref<any | null>(null);
const isEditingCat = ref(false);
const catFormData = ref({
  id: '',
  name: '',
  nameKh: '',
  icon: '☕',
  isEnabled: true,
});

const openCategoryModal = async () => {
  showCategoryModal.value = true;
  await posStore.fetchCategoriesDetails();
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  resetCatForm();
};

const resetCatForm = () => {
  catFormData.value = {
    id: '',
    name: '',
    nameKh: '',
    icon: '☕',
    isEnabled: true,
  };
  isEditingCat.value = false;
  editingCategory.value = null;
};

const startEditCategory = (cat: any) => {
  isEditingCat.value = true;
  editingCategory.value = cat;
  catFormData.value = {
    id: cat.id,
    name: cat.name,
    nameKh: cat.nameKh || cat.name,
    icon: cat.icon || '☕',
    isEnabled: cat.isEnabled !== false,
  };
};

const handleSaveCategory = async () => {
  if (!catFormData.value.name.trim()) return;
  try {
    if (isEditingCat.value && catFormData.value.id) {
      await posStore.updateCategory(catFormData.value.id, {
        name: catFormData.value.name,
        nameKh: catFormData.value.nameKh,
        icon: catFormData.value.icon,
        isEnabled: catFormData.value.isEnabled,
      });
    } else {
      await posStore.createCategory({
        name: catFormData.value.name,
        nameKh: catFormData.value.nameKh,
        icon: catFormData.value.icon,
        isEnabled: catFormData.value.isEnabled,
      });
    }
    resetCatForm();
    await loadData();
  } catch (err: any) {
    alert(err.message || 'Failed to save category');
  }
};

const handleToggleCategory = async (cat: any) => {
  try {
    await posStore.toggleCategoryStatus(cat.id);
    await loadData();
  } catch (err: any) {
    alert(err.message || 'Failed to toggle category status');
  }
};

const handleDeleteCategory = async (cat: any) => {
  if (!confirm(t('cat.deleteConfirm'))) return;
  try {
    await posStore.deleteCategory(cat.id);
    await loadData();
  } catch (err: any) {
    alert(err.message || 'Failed to delete category');
  }
};

// Image Upload state
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadingImage = ref(false);
const lastUploadStats = ref<any>(null);

const formData = ref({
  name: '',
  category: '',
  cost: 0,
  packagingCost: 0,
  price: 0,
  stock: 0,
  icon: '☕',
  sku: '',
  imageUrl: '',
  recipe: [] as RecipeItem[],
});

// Delete Modal state
const showDeleteModal = ref(false);
const productToDelete = ref<Product | null>(null);

// Image Upload Handlers
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploadingImage.value = true;
  lastUploadStats.value = null;
  try {
    const result = await posApi.uploadProductImage(file);
    formData.value.imageUrl = result.imageUrl;
    lastUploadStats.value = result;
  } catch (err: any) {
    alert(err?.response?.data?.message || err?.message || 'Failed to upload and compress image.');
  } finally {
    uploadingImage.value = false;
    if (target) target.value = '';
  }
};

const removeProductImage = () => {
  formData.value.imageUrl = '';
  lastUploadStats.value = null;
};

// Summary Calculations
const totalUnitsInStock = computed(() => {
  return products.value.reduce((sum, p) => sum + (p.stock || 0), 0);
});

const totalInventoryCost = computed(() => {
  return products.value.reduce((sum, p) => {
    const unitCost = (p.cost || 0) + (p.packagingCost || 0);
    return sum + unitCost * (p.stock || 0);
  }, 0);
});

const totalRetailValuation = computed(() => {
  return products.value.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
});

const totalPotentialProfit = computed(() => {
  return Math.max(0, totalRetailValuation.value - totalInventoryCost.value);
});

const averageMarginPercent = computed(() => {
  if (totalRetailValuation.value === 0) return '0.0';
  const margin = (totalPotentialProfit.value / totalRetailValuation.value) * 100;
  return margin.toFixed(1);
});

const availableCategories = computed(() => {
  return categories.value.filter((c) => c !== 'All');
});

// Modal Live Cost & Margin Calculations
const modalRecipeTotalCost = computed(() => {
  if (!formData.value.recipe || formData.value.recipe.length === 0) {
    return formData.value.cost || 0;
  }
  return Number(formData.value.recipe.reduce((sum, r) => sum + (Number(r.cost) || 0), 0).toFixed(2));
});

const modalAvailableStock = computed(() => {
  if (!formData.value.recipe || formData.value.recipe.length === 0) {
    return 999;
  }
  let minCups = Infinity;
  for (const item of formData.value.recipe) {
    const ing = posStore.ingredients.find(
      (i) => (item.ingredientId && i.id === item.ingredientId) || i.name.toLowerCase() === (item.ingredientName || '').toLowerCase()
    );
    if (!ing || ing.stock <= 0 || !item.qty || item.qty <= 0) {
      return 0;
    }
    const possible = Math.floor(ing.stock / item.qty);
    if (possible < minCups) {
      minCups = possible;
    }
  }
  return minCups === Infinity ? 0 : minCups;
});

const modalTotalCost = computed(() => {
  return Number(((formData.value.cost || 0) + (formData.value.packagingCost || 0)).toFixed(2));
});

const modalUnitProfit = computed(() => {
  return Number(((formData.value.price || 0) - modalTotalCost.value).toFixed(2));
});

const modalMarginPercent = computed(() => {
  if (!formData.value.price || formData.value.price <= 0) return 0;
  return Number(((modalUnitProfit.value / formData.value.price) * 100).toFixed(1));
});

const modalMarkupPercent = computed(() => {
  if (modalTotalCost.value <= 0) return 0;
  return Number(((modalUnitProfit.value / modalTotalCost.value) * 100).toFixed(1));
});

const calculatedMarginClass = computed(() => {
  if (modalUnitProfit.value < 0) return 'margin-negative';
  if (modalMarginPercent.value >= 40) return 'margin-high';
  if (modalMarginPercent.value >= 20) return 'margin-medium';
  return 'margin-low';
});

// Recipe Builder Helpers
const ingredientGroupedCategories = computed(() => {
  const cats = Array.from(new Set(posStore.ingredients.map((i) => i.category || 'General')));
  return cats.sort();
});

const getIngredientsByCategory = (category: string) => {
  return posStore.ingredients.filter((i) => (i.category || 'General') === category);
};

const getIngredientUnitCost = (ingredientId?: string) => {
  if (!ingredientId) return 0;
  const ing = posStore.ingredients.find((i) => i.id === ingredientId);
  return ing ? ing.costPerUnit : 0;
};

const syncRecipeCostToBaseCost = () => {
  if (formData.value.recipe && formData.value.recipe.length > 0) {
    const sum = formData.value.recipe.reduce((acc, r) => acc + (Number(r.cost) || 0), 0);
    formData.value.cost = Number(sum.toFixed(2));
  }
};

const addRecipeItem = () => {
  if (!formData.value.recipe) {
    formData.value.recipe = [];
  }
  const firstIng = posStore.ingredients[0];
  if (firstIng) {
    const defaultQty = firstIng.uom === 'g' || firstIng.uom === 'ml' ? 15 : 1;
    const defaultCost = Number((defaultQty * firstIng.costPerUnit).toFixed(4));
    formData.value.recipe.push({
      ingredientId: firstIng.id,
      ingredientName: firstIng.name,
      qty: defaultQty,
      uom: firstIng.uom,
      cost: defaultCost,
    });
  } else {
    formData.value.recipe.push({
      ingredientId: '',
      ingredientName: '',
      qty: 1,
      uom: 'unit',
      cost: 0,
    });
  }
  syncRecipeCostToBaseCost();
};

const removeRecipeItem = (index: number) => {
  formData.value.recipe.splice(index, 1);
  syncRecipeCostToBaseCost();
};

const onIngredientSelectChange = (item: RecipeItem) => {
  const found = posStore.ingredients.find((i) => i.id === item.ingredientId);
  if (found) {
    item.ingredientName = found.name;
    item.uom = found.uom;
    item.cost = Number(((Number(item.qty) || 0) * found.costPerUnit).toFixed(4));
  }
  syncRecipeCostToBaseCost();
};

const onRecipeQtyChange = (item: RecipeItem) => {
  const found = posStore.ingredients.find(
    (i) => (item.ingredientId && i.id === item.ingredientId) || i.name.toLowerCase() === (item.ingredientName || '').toLowerCase()
  );
  if (found) {
    item.cost = Number(((Number(item.qty) || 0) * found.costPerUnit).toFixed(4));
  }
  syncRecipeCostToBaseCost();
};

// Helper Calculations for Product Table
const getUnitProfit = (product: Product) => {
  const totalCost = (product.cost || 0) + (product.packagingCost || 0);
  return Number(((product.price || 0) - totalCost).toFixed(2));
};

const getMarginPercent = (product: Product) => {
  if (!product.price || product.price <= 0) return '0.0';
  const profit = getUnitProfit(product);
  return ((profit / product.price) * 100).toFixed(1);
};

const getMarginBadgeClass = (product: Product) => {
  const profit = getUnitProfit(product);
  if (profit < 0) return 'badge-danger';
  const margin = (profit / (product.price || 1)) * 100;
  if (margin >= 40) return 'badge-success';
  if (margin >= 20) return 'badge-blue';
  return 'badge-warning';
};

// Data Loading
const loadData = async () => {
  loading.value = true;
  try {
    const [cats, prods] = await Promise.all([
      posApi.getCategories(),
      posApi.getProducts(selectedCategory.value, searchQuery.value, true),
      posStore.fetchIngredients(),
    ]);
    categories.value = cats;
    if (selectedCategory.value !== 'All' && !categories.value.includes(selectedCategory.value)) {
      selectedCategory.value = 'All';
      try { localStorage.setItem('products_selected_category', 'All'); } catch (e) {}
    }
    products.value = prods;
  } catch (err) {
    console.error('Failed to load products', err);
  } finally {
    loading.value = false;
  }
};

let debounceTimer: any = null;
const filterProducts = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    posApi.getProducts(selectedCategory.value, searchQuery.value, true).then((res) => {
      products.value = res;
    });
  }, 250);
};

const selectCategory = (cat: string) => {
  selectedCategory.value = cat;
  try {
    localStorage.setItem('products_selected_category', cat);
  } catch (e) {}
  filterProducts();
};

// Modal Handlers
const openAddModal = () => {
  isCreating.value = true;
  editingProductId.value = null;
  lastUploadStats.value = null;
  formData.value = {
    name: '',
    category: availableCategories.value[0] || 'Ice Coffee',
    cost: 0,
    packagingCost: 0.22,
    price: 2.50,
    stock: 0,
    icon: '☕',
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    imageUrl: '',
    recipe: [],
  };
  showModal.value = true;
};

const openEditModal = (product: Product) => {
  isCreating.value = false;
  editingProductId.value = product.id;
  lastUploadStats.value = null;

  const recipeCopy = (product.recipe || []).map((r) => {
    let ingId = r.ingredientId;
    if (!ingId) {
      const match = posStore.ingredients.find((i) => i.name.toLowerCase() === r.ingredientName.toLowerCase());
      if (match) ingId = match.id;
    }
    return {
      ingredientId: ingId || '',
      ingredientName: r.ingredientName,
      qty: r.qty,
      uom: r.uom,
      cost: r.cost,
    };
  });

  formData.value = {
    name: product.name,
    category: product.category,
    cost: product.cost || 0,
    packagingCost: product.packagingCost || 0,
    price: product.price || 0,
    stock: product.stock || 0,
    icon: product.icon || '☕',
    sku: product.sku || '',
    imageUrl: product.imageUrl || '',
    recipe: recipeCopy,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingProductId.value = null;
};

const saveProduct = async () => {
  saving.value = true;
  try {
    if (isCreating.value) {
      await posStore.addProduct(formData.value);
    } else if (editingProductId.value) {
      await posStore.editProduct(editingProductId.value, formData.value);
    }
    await loadData();
    closeModal();
  } catch (err) {
    alert('Failed to save product. Please check your inputs.');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (product: Product) => {
  productToDelete.value = product;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (!productToDelete.value) return;
  deleting.value = true;
  try {
    await posStore.removeProduct(productToDelete.value.id);
    await loadData();
    showDeleteModal.value = false;
    productToDelete.value = null;
  } catch (err) {
    alert('Failed to delete product.');
  } finally {
    deleting.value = false;
  }
};

const handleSeedRecipes = async () => {
  const confirmed = confirm('Are you sure you want to seed and reset all products from the "Bunrong Vyrom ( Recipe & Costing )" spreadsheet?');
  if (!confirmed) return;
  seeding.value = true;
  try {
    const res = await posStore.seedFromRecipes();
    await loadData();
    alert(`Success: ${res.message}`);
  } catch (err: any) {
    alert(`Failed to seed products: ${err.message || err}`);
  } finally {
    seeding.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-900);
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.add-product-btn {
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
}

/* KPI Summary Grid */
.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.kpi-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue { background: #eff6ff; color: #2563eb; }
.bg-purple { background: #faf5ff; color: #9333ea; }
.bg-indigo { background: #eef2ff; color: #4f46e5; }
.bg-emerald { background: #ecfdf5; color: #059669; }

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.kpi-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--gray-900);
  line-height: 1.2;
}

.kpi-sub {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.text-success { color: var(--success) !important; }
.text-danger { color: var(--danger) !important; }
.text-warning { color: var(--warning) !important; }
.text-primary { color: var(--primary) !important; }
.text-muted { color: var(--gray-500) !important; }
.text-dark { color: var(--dark) !important; }

/* Filter Toolbar */
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--gray-400);
}

.search-box .input-field {
  padding-left: 2.35rem;
}

.category-filter-bar {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.category-chip {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-700);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-chip:hover {
  background: var(--gray-200);
}

.category-chip.active {
  background: var(--dark);
  color: var(--white);
  border-color: var(--dark);
}

/* Table */
.product-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.recipe-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.2rem;
}

.recipe-chip {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.68rem;
  color: var(--gray-600);
  white-space: nowrap;
}

.recipe-more {
  font-size: 0.68rem;
  color: var(--primary);
  font-weight: 600;
  align-self: center;
}

.product-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  flex-shrink: 0;
}

.product-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-icon {
  font-size: 1.6rem;
  background: var(--gray-100);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.product-name {
  font-weight: 600;
  color: var(--gray-900);
}

.category-tag {
  background: var(--gray-100);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-700);
}

.badge-blue {
  background-color: #eff6ff;
  color: #2563eb;
}

.action-buttons {
  display: inline-flex;
  gap: 0.4rem;
}

.action-btn {
  background: none;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  transition: all 0.2s;
}

.action-btn.edit-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.action-btn.delete-btn:hover {
  border-color: var(--danger);
  color: var(--danger);
  background: var(--danger-light);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.data-table th {
  background: var(--gray-100);
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--gray-600);
  border-bottom: 1px solid var(--gray-300);
  white-space: nowrap;
}

.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--gray-200);
  color: var(--gray-800);
  vertical-align: middle;
}

.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.product-modal {
  background: var(--white);
  width: 760px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon-badge {
  background: var(--primary-light);
  color: var(--primary);
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gray-900);
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.close-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
}

.close-btn:hover {
  color: var(--gray-700);
  background: var(--gray-100);
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-section-title {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-600);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-700);
}

.highlight-label {
  color: var(--primary);
}

.input-hint {
  font-size: 0.7rem;
  color: var(--gray-500);
}

.currency-input {
  position: relative;
  display: flex;
  align-items: center;
}

.cur-symbol {
  position: absolute;
  left: 0.75rem;
  font-weight: 600;
  color: var(--gray-400);
}

.currency-input .input-field {
  padding-left: 1.85rem;
}

.price-input {
  border-color: var(--primary);
  font-weight: 700;
  color: var(--dark);
}

.emoji-selector {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.emoji-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
}

.emoji-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.emoji-chip {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  font-size: 1.15rem;
  padding: 0.2rem 0.45rem;
  cursor: pointer;
  transition: all 0.15s;
}

.emoji-chip:hover {
  background: var(--gray-200);
}

.emoji-chip.active {
  background: var(--primary-light);
  border-color: var(--primary);
  transform: scale(1.1);
}

/* Image Upload & Compression Section */
.image-upload-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.image-upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.image-upload-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.image-section-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--gray-800);
}

.standard-size-badge {
  font-size: 0.68rem;
  font-weight: 600;
  background: #eff6ff;
  color: #2563eb;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
}

.image-upload-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.image-preview-box {
  width: 78px;
  height: 78px;
  border-radius: 10px;
  border: 1.5px dashed var(--gray-300);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.image-upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  color: var(--primary);
}

.uploaded-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
}

.placeholder-emoji {
  font-size: 1.75rem;
  line-height: 1;
}

.placeholder-text {
  font-size: 0.62rem;
  color: var(--gray-400);
  font-weight: 500;
}

.image-controls-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}

.image-action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hidden-file-input {
  display: none;
}

.upload-trigger-btn {
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
}

.remove-image-btn {
  font-size: 0.8rem;
  padding: 0.4rem 0.65rem;
}

.btn-outline-danger {
  background: var(--white);
  border: 1px solid var(--danger);
  color: var(--danger);
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
}

.btn-outline-danger:hover {
  background: var(--danger-light);
}

.upload-stats-banner {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--success);
  background: #f0fdf4;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}

.upload-help-text {
  font-size: 0.72rem;
  color: var(--gray-500);
  line-height: 1.35;
}

/* Stock info pill */
.stock-info-pill {
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-300);
  background: var(--gray-50);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.15rem;
}

.stock-info-pill.stock-ok {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.stock-info-pill.stock-zero {
  background: #fef2f2;
  border-color: #fecaca;
}

.stock-num {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray-900);
}

.stock-hint {
  font-size: 0.68rem;
  color: var(--gray-500);
}

/* Recipe Builder Section */
.recipe-section-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.recipe-section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.recipe-section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.recipe-heading {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.recipe-desc {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin: 0;
}

.add-ingredient-row-btn {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.recipe-empty-state {
  text-align: center;
  padding: 1.25rem;
  background: var(--white);
  border: 1px dashed var(--gray-300);
  border-radius: 8px;
  color: var(--gray-500);
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.recipe-table-wrapper {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  overflow: hidden;
}

.recipe-modal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.recipe-modal-table th {
  background: #f1f5f9;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: var(--gray-600);
  border-bottom: 1px solid var(--gray-200);
  text-align: left;
}

.recipe-modal-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
}

.recipe-select {
  font-size: 0.82rem;
  padding: 0.35rem 0.6rem;
}

.qty-input {
  padding: 0.35rem 0.5rem;
  font-size: 0.82rem;
}

.unit-badge {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gray-700);
  display: inline-block;
  text-align: center;
}

.btn-icon-del {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-icon-del:hover {
  color: var(--danger);
  background: var(--danger-light);
}

.recipe-footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: #f8fafc;
  border-top: 1px solid var(--gray-200);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recipe-notice {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--gray-500);
}

.recipe-sum-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sum-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-700);
}

.sum-val {
  font-size: 1rem;
  color: var(--primary);
}

.btn-outline-primary {
  background: var(--white);
  border: 1px solid var(--primary);
  color: var(--primary);
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-outline-primary:hover {
  background: var(--primary-light);
}

.form-divider {
  border-top: 1px solid var(--gray-200);
  margin: 0.25rem 0;
}

/* Margin Calculator Box */
.margin-calculator-card {
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--gray-300);
  background: var(--gray-100);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.margin-calculator-card.margin-high {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.margin-calculator-card.margin-medium {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.margin-calculator-card.margin-low {
  background: #fffbeb;
  border-color: #fde68a;
}

.margin-calculator-card.margin-negative {
  background: #fef2f2;
  border-color: #fecaca;
}

.calc-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--gray-800);
}

.calc-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  text-align: center;
}

.calc-item {
  background: var(--white);
  padding: 0.6rem 0.4rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.calc-item-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray-500);
}

.calc-item-val {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0.15rem 0;
}

.calc-item-sub {
  font-size: 0.65rem;
  color: var(--gray-400);
}

.margin-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--danger);
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--white);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Delete Modal */
.delete-modal {
  background: var(--white);
  width: 420px;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-lg);
}

.delete-modal-icon {
  background: var(--danger-light);
  color: var(--danger);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.delete-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.delete-desc {
  font-size: 0.85rem;
  color: var(--gray-600);
  line-height: 1.4;
  margin-bottom: 1.5rem;
}

.delete-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.delete-actions .btn {
  flex: 1;
}

.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1rem;
  gap: 0.75rem;
  color: var(--gray-500);
}

.empty-icon {
  color: var(--gray-400);
  margin-bottom: 0.5rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-grid-2, .form-grid-3, .calc-metrics-grid {
    grid-template-columns: 1fr;
  }
}

/* CATEGORY MANAGEMENT MODAL STYLES */
.category-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.category-modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #faf7f2;
}

.cat-form-card {
  background: #ffffff;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(121, 64, 34, 0.15);
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.cat-form-title {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  color: #794022;
}

.cat-form-grid {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr auto;
  gap: 0.75rem;
  align-items: end;
}

.sm-group {
  max-width: 90px;
}

.cat-form-actions {
  display: flex;
  gap: 0.5rem;
}

.cat-list-container {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  overflow: hidden;
}

.cat-table-wrapper {
  max-height: 340px;
  overflow-y: auto;
}

.cat-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.cat-table th {
  background: #f4efe6;
  padding: 0.75rem 1rem;
  font-weight: 700;
  color: #591f0b;
  border-bottom: 1px solid rgba(121, 64, 34, 0.12);
  position: sticky;
  top: 0;
  z-index: 2;
}

.cat-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  vertical-align: middle;
}

.cat-table tr.row-disabled {
  background-color: #f9fafb;
  opacity: 0.75;
}

.cat-cell-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cat-emoji-badge {
  font-size: 1.3rem;
  width: 36px;
  height: 36px;
  background: #faf7f2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(121, 64, 34, 0.15);
}

.cat-main-name {
  color: #1f2937;
  font-size: 0.9rem;
}

.cat-sub-name {
  font-size: 0.75rem;
  color: #6b7280;
}

/* TOGGLE SWITCH STYLES */
.toggle-status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
}

.toggle-switch-btn {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #d1d5db;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  padding: 0;
}

.toggle-switch-btn.active {
  background-color: #2d6a4f;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-switch-btn.active .toggle-slider {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 0.8rem;
  font-weight: 600;
}

.text-enabled {
  color: #2d6a4f;
}

.text-disabled {
  color: #6b7280;
}

.flex-center-gap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-amber {
  color: #794022;
}

@media (max-width: 640px) {
  .cat-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
