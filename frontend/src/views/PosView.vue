<template>
  <div class="pos-layout">
    <!-- Left Section: Catalog & Items -->
    <div class="catalog-section">
      <!-- Categories Filter -->
      <div class="search-bar-wrapper">
        <div class="categories-container">
          <button
            v-for="cat in posStore.categories"
            :key="cat"
            class="category-chip"
            :class="{ active: posStore.selectedCategory === cat }"
            @click="posStore.setCategory(cat)"
          >
            {{ translateCategory(cat) }}
          </button>
        </div>
      </div>

      <!-- Loading and Error Indicators -->
      <div v-if="posStore.isLoading" class="loading-state">
        <Loader2 class="spinner" :size="32" />
        <span>{{ t('pos.loading') }}</span>
      </div>

      <div v-else-if="posStore.error" class="error-banner">
        <AlertCircle :size="20" />
        <span>{{ posStore.error }}</span>
        <button class="btn btn-secondary" @click="posStore.loadInitialData">{{ t('pos.retry') }}</button>
      </div>

      <!-- Product Grid -->
      <div v-else class="product-grid">
        <div
          v-for="product in posStore.filteredProducts"
          :key="product.id"
          class="product-card"
          :class="{ 'out-of-stock': product.stock === 0 }"
          @click="product.stock > 0 && openCustomizer(product)"
        >
          <!-- Hero Product Image / Media Area -->
          <div class="product-media-box">
            <img
              v-if="product.imageUrl"
              :src="getProductImageUrl(product.imageUrl)"
              :alt="product.name"
              class="product-hero-img"
            />
            <div v-else class="product-hero-emoji">
              {{ product.icon || '☕' }}
            </div>
            <span
              class="stock-badge-floating badge"
              :class="product.stock > 10 ? 'badge-coffee' : product.stock > 0 ? 'badge-warning' : 'badge-danger'"
            >
              {{ product.stock > 0 ? `~${product.stock} ${t('pos.cups')}` : t('pos.outOfStock') }}
            </span>
          </div>

          <!-- Product Details -->
          <div class="product-card-body">
            <div class="product-info">
              <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
              <span class="product-sku font-mono">{{ product.sku }}</span>
            </div>

            <div class="product-footer">
              <span class="product-price font-mono font-bold">${{ product.price.toFixed(2) }}</span>
              <button
                class="add-btn"
                :disabled="product.stock === 0"
                @click.stop="product.stock > 0 && openCustomizer(product)"
                :title="t('customizer.addToOrder')"
              >
                <Sliders :size="15" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: Order Cart & Checkout -->
    <div class="cart-section">
      <div class="cart-header">
        <div class="cart-title">
          <ShoppingCart :size="20" />
          <span>{{ t('pos.currentOrder') }}</span>
        </div>
        <span class="badge badge-coffee">{{ posStore.cartItemCount }} {{ t('pos.itemsCount') }}</span>
        <button v-if="posStore.cart.length > 0" class="clear-cart-btn" @click="posStore.clearCart" :title="t('pos.clearCart')">
          <Trash2 :size="16" />
        </button>
      </div>

      <!-- Cart Items List -->
      <div class="cart-items-container">
        <div v-if="posStore.cart.length === 0" class="empty-cart">
          <ShoppingBag :size="48" class="empty-icon" />
          <p>{{ t('pos.cartEmpty') }}</p>
          <span>{{ t('pos.cartEmptySub') }}</span>
        </div>

        <div v-else class="cart-items-list">
          <!-- Unclaimed Free Drink Alert Banner -->
          <div v-if="posStore.unclaimedBogoCount > 0" class="unclaimed-free-alert">
            <div class="unclaimed-meta">
              <span class="unclaimed-emoji">🎁</span>
              <div class="unclaimed-texts">
                <span class="unclaimed-title">{{ posStore.unclaimedBogoCount }} {{ t('pos.freeItemCount') }}</span>
                <span class="unclaimed-sub">{{ t('customizer.unclaimedBogo') }}</span>
              </div>
            </div>
          </div>

          <div
            v-for="item in posStore.cart"
            :key="item.id"
            class="cart-item"
            :class="{ 'is-promo-free': item.isPromoFree }"
            @click="openCustomizerForEdit(item)"
            :title="t('pos.clickToEdit')"
          >
            <div class="cart-item-icon">
              <img
                v-if="item.product.imageUrl"
                :src="getProductImageUrl(item.product.imageUrl)"
                :alt="item.product.name"
                class="cart-thumb-img"
              />
              <span v-else class="cart-emoji">{{ item.product.icon || '☕' }}</span>
            </div>
            <div class="cart-item-details">
              <div class="item-name-row">
                <span class="item-name" :title="item.product.name">{{ item.product.name }}</span>
                <div class="cart-item-header-actions">
                  <span v-if="item.isPromoFree" class="promo-item-pill">
                    {{ item.promoBadge || '🎁 FREE' }}
                  </span>
                  <button class="cart-item-edit-icon" :title="t('pos.editOptions')" @click.stop="openCustomizerForEdit(item)">
                    <Edit2 :size="12" />
                  </button>
                </div>
              </div>

              <!-- Customization Options Badges -->
              <div v-if="item.options" class="cart-options-wrap">
                <span class="opt-tag sugar-tag">{{ getSugarLabel(item.options.sugarLevel) }}</span>
                <span class="opt-tag ice-tag">{{ getIceLabel(item.options.iceLevel) }}</span>
                <span v-for="top in item.options.toppings" :key="top.name" class="opt-tag topping-tag">
                  +{{ getToppingLabel(top) }}
                </span>
                <span v-if="item.options.notes" class="opt-tag note-tag">
                  📝 {{ item.options.notes }}
                </span>
              </div>

              <div class="item-price-row">
                <template v-if="item.isPromoFree">
                  <span class="free-price-lbl font-mono font-bold">$0.00 (FREE)</span>
                  <span class="original-cross font-mono">${{ (item.originalPrice || item.product.price).toFixed(2) }}</span>
                </template>
                <template v-else>
                  <span class="item-price font-mono">${{ item.unitPrice.toFixed(2) }}</span>
                </template>
              </div>

              <!-- Quick Add Free Paired Cup Action (if paid item has unclaimed promo) -->
              <div v-if="!item.isPromoFree && isProductEligibleForBogo(item.product) && posStore.unclaimedBogoCount > 0" class="claim-chip-row" @click.stop>
                <button class="claim-free-btn" @click="quickAddFreeCup(item)" type="button">
                  <Plus :size="12" />
                  <span>{{ t('customizer.addFreePromoCup') }} ($0.00)</span>
                </button>
              </div>
            </div>

            <div class="quantity-controls" @click.stop>
              <button
                class="qty-btn"
                @click="posStore.updateQuantity(item.id, item.quantity - 1)"
              >
                <Minus :size="14" />
              </button>
              <span class="qty-number font-mono">{{ item.quantity }}</span>
              <button
                class="qty-btn"
                :disabled="item.quantity >= item.product.stock"
                @click="posStore.updateQuantity(item.id, item.quantity + 1)"
              >
                <Plus :size="14" />
              </button>
            </div>

            <div class="cart-item-total font-mono font-bold" :class="{ 'text-free': item.isPromoFree }">
              ${{ (item.unitPrice * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Summary & Checkout -->
      <div class="cart-footer">
        <!-- Discount Selector -->
        <div class="discount-selector">
          <span class="discount-label">{{ t('pos.discount') }}</span>
          <div class="discount-chips">
            <button
              v-for="d in [0, 5, 10, 15, 20]"
              :key="d"
              class="d-chip"
              :class="{ active: posStore.discountPercentage === d }"
              @click="posStore.setDiscount(d)"
              type="button"
            >
              {{ d }}%
            </button>
          </div>
        </div>

        <!-- Calculation Rows -->
        <div class="calc-rows">
          <div class="calc-row">
            <span>{{ t('pos.subtotal') }}</span>
            <span>${{ posStore.subtotal.toFixed(2) }}</span>
          </div>

          <!-- Promo Discount Row -->
          <div v-if="posStore.promoDiscountAmount > 0" class="calc-row promo-discount-row">
            <span class="promo-row-label">
              <Tag :size="13" />
              {{ posStore.activePromotion ? (posStore.activePromotion.name[locale] || posStore.activePromotion.name.en) : t('pos.promoDiscount') }}
            </span>
            <span class="font-mono font-bold promo-discount-val">-${{ posStore.promoDiscountAmount.toFixed(2) }}</span>
          </div>

          <!-- Manual % Discount Row -->
          <div v-if="posStore.manualDiscountAmount > 0" class="calc-row discount-row">
            <span>{{ t('pos.discount') }} ({{ posStore.discountPercentage }}%)</span>
            <span class="font-mono font-bold">-${{ posStore.manualDiscountAmount.toFixed(2) }}</span>
          </div>

          <div class="calc-row tax-calc-row">
            <span class="vat-tax-trigger" @click="openVatModal" title="Configure VAT Tax Settings">
              {{ t('pos.tax') }} ({{ posStore.vatEnabled ? posStore.vatPercentage + '%' : t('vat.disabledBadge') }})
              <Settings2 :size="13" class="tax-settings-icon" />
            </span>
            <span class="font-mono">${{ posStore.taxAmount.toFixed(2) }}</span>
          </div>
          <div class="calc-row total-row">
            <span>{{ t('pos.total') }}</span>
            <span>${{ posStore.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="payment-method-selector">
          <button
            class="pay-btn"
            :class="{ active: selectedPaymentMethod === 'CASH' }"
            @click="setPaymentMethod('CASH')"
          >
            <Banknote :size="18" />
            <span>{{ t('pos.cash') }}</span>
          </button>
          <button
            class="pay-btn"
            :class="{ active: selectedPaymentMethod === 'CARD' }"
            @click="setPaymentMethod('CARD')"
          >
            <CreditCard :size="18" />
            <span>{{ t('pos.card') }}</span>
          </button>
          <button
            class="pay-btn"
            :class="{ active: selectedPaymentMethod === 'QR_CODE' }"
            @click="setPaymentMethod('QR_CODE')"
          >
            <QrCode :size="18" />
            <span>{{ t('pos.qrPay') }}</span>
          </button>
        </div>

        <!-- Tendered input for Cash -->
        <div v-if="selectedPaymentMethod === 'CASH' && posStore.cart.length > 0" class="cash-input-row">
          <label>{{ t('pos.tendered') }}</label>
          <input
            type="number"
            step="0.5"
            v-model.number="cashTendered"
            :placeholder="posStore.total.toString()"
            class="cash-input"
          />
          <span v-if="cashTendered > posStore.total" class="change-preview">
            {{ t('pos.change') }} ${{ (cashTendered - posStore.total).toFixed(2) }}
          </span>
        </div>

        <!-- Checkout Action Button -->
        <button
          class="btn btn-primary checkout-btn"
          :disabled="posStore.cart.length === 0 || isProcessing || posStore.isSubmitting"
          @click="handleCheckout"
        >
          <Loader2 v-if="isProcessing || posStore.isSubmitting" class="spinner" :size="18" />
          <CheckCircle2 v-else :size="18" />
          <span>{{ isProcessing || posStore.isSubmitting ? t('pos.processing') : `${t('pos.completeOrder')} ($${posStore.total.toFixed(2)})` }}</span>
        </button>
      </div>
    </div>

    <!-- Drink Customization Modal -->
    <div v-if="showCustomizerModal && selectedProduct" class="modal-backdrop" @click.self="closeCustomizerModal">
      <div class="customizer-modal">
        <!-- Modal Header -->
        <div class="customizer-head">
          <div class="customizer-product-header">
            <div class="customizer-hero-thumb">
              <img
                v-if="selectedProduct.imageUrl"
                :src="getProductImageUrl(selectedProduct.imageUrl)"
                :alt="selectedProduct.name"
                class="modal-thumb-img"
              />
              <span v-else class="modal-emoji">{{ selectedProduct.icon || '☕' }}</span>
            </div>
            <div class="customizer-info-header">
              <span class="customizer-cat-badge">{{ translateCategory(selectedProduct.category) }}</span>
              <h2 class="customizer-title">{{ selectedProduct.name }}</h2>
              <div class="customizer-base-price">
                <span class="base-lbl">{{ t('customizer.base') }}</span>
                <span class="base-val font-mono font-bold">${{ selectedProduct.price.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeCustomizerModal" :title="t('customizer.cancel')">
            <X :size="18" />
          </button>
        </div>

        <div class="customizer-body">
          <!-- Sugar Level Selection -->
          <div class="option-section">
            <div class="section-title-row">
              <div class="title-left">
                <span class="section-icon">🍬</span>
                <span class="section-heading">{{ t('customizer.sugarLevel') }}</span>
              </div>
              <span class="section-selected-badge font-mono font-bold">{{ selectedSugar }}</span>
            </div>
            <div class="sugar-segmented-group">
              <button
                v-for="s in sugarOptions"
                :key="s.value"
                class="sugar-btn font-mono font-bold"
                :class="{ active: selectedSugar === s.value }"
                @click="selectedSugar = s.value"
                type="button"
              >
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Ice Level Selection -->
          <div class="option-section">
            <div class="section-title-row">
              <div class="title-left">
                <span class="section-icon">🧊</span>
                <span class="section-heading">{{ t('customizer.iceLevel') }}</span>
              </div>
              <span class="section-selected-badge font-bold">{{ getIceLabel(selectedIce) }}</span>
            </div>
            <div class="ice-chips-grid">
              <button
                v-for="ice in iceOptions"
                :key="ice.value"
                class="ice-pill"
                :class="{ active: selectedIce === ice.value }"
                @click="selectedIce = ice.value"
                type="button"
              >
                <span class="ice-pill-icon">{{ ice.icon }}</span>
                <span class="ice-pill-text">{{ ice.label }}</span>
              </button>
            </div>
          </div>

          <!-- Toppings / Add-ons Selection (Collapsible Accordion) -->
          <div class="option-section toppings-accordion-section" :class="{ 'is-open': showToppingsPicker }">
            <button
              type="button"
              class="toppings-toggle-bar"
              :class="{ 'has-selected': selectedToppings.length > 0, expanded: showToppingsPicker }"
              @click="showToppingsPicker = !showToppingsPicker"
            >
              <div class="title-left">
                <span class="section-icon">🧋</span>
                <span class="section-heading">{{ t('customizer.toppings') }}</span>
                <span v-if="selectedToppings.length > 0" class="topping-count-badge font-bold font-mono">
                  {{ selectedToppings.length }} (+${{ selectedToppingsTotal.toFixed(2) }})
                </span>
                <span v-else class="toppings-optional-hint">{{ t('customizer.notesOptional') }}</span>
              </div>
              <div class="toppings-toggle-action font-bold">
                <span>{{ showToppingsPicker ? 'បិទ' : '+ ជ្រើសរើស' }}</span>
                <ChevronDown :size="16" class="accordion-chevron" :class="{ rotated: showToppingsPicker }" />
              </div>
            </button>

            <!-- Selected Toppings Preview Chips (when collapsed) -->
            <div v-if="selectedToppings.length > 0 && !showToppingsPicker" class="selected-toppings-chips-row">
              <span v-for="topping in selectedToppings" :key="topping.name" class="selected-top-chip">
                {{ topping.icon }} {{ getToppingLabel(topping) }} (+${{ topping.price.toFixed(2) }})
                <button type="button" class="remove-top-chip-btn" @click.stop="toggleTopping(topping)">✕</button>
              </span>
            </div>

            <!-- Expandable Toppings Grid -->
            <div v-if="showToppingsPicker" class="toppings-grid-collapsible">
              <button
                v-for="topping in availableToppings"
                :key="topping.name"
                class="topping-card"
                :class="{ active: isToppingSelected(topping.name) }"
                @click="toggleTopping(topping)"
                type="button"
              >
                <div class="topping-left">
                  <div class="topping-checkbox" :class="{ checked: isToppingSelected(topping.name) }">
                    <Check v-if="isToppingSelected(topping.name)" :size="12" />
                  </div>
                  <span class="topping-icon">{{ topping.icon }}</span>
                  <span class="topping-name">{{ getToppingLabel(topping) }}</span>
                </div>
                <div class="topping-price-badge font-mono">
                  +${{ topping.price.toFixed(2) }}
                </div>
              </button>
            </div>
          </div>

          <!-- Special Barista Instructions / Notes -->
          <div class="option-section">
            <div class="section-title-row">
              <div class="title-left">
                <span class="section-icon">📝</span>
                <span class="section-heading">{{ t('customizer.baristaNotes') }}</span>
              </div>
              <span class="section-subtext">{{ t('customizer.notesOptional') }}</span>
            </div>
            <div class="notes-input-wrapper">
              <input
                type="text"
                v-model="customNotes"
                :placeholder="t('customizer.notesPlaceholder')"
                class="notes-input"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="customizer-footer">
          <div class="footer-left-qty">
            <span class="qty-label">{{ t('customizer.quantity') }}</span>
            <div class="quantity-controls lg">
              <button
                class="qty-btn"
                :disabled="customQuantity <= 1"
                @click="customQuantity > 1 && customQuantity--"
                type="button"
              >
                <Minus :size="15" />
              </button>
              <span class="qty-number font-mono">{{ customQuantity }}</span>
              <button
                class="qty-btn"
                :disabled="customQuantity >= selectedProduct.stock"
                @click="customQuantity < selectedProduct.stock && customQuantity++"
                type="button"
              >
                <Plus :size="15" />
              </button>
            </div>
            <div class="item-calc-preview font-mono">
              ${{ modalUnitPrice.toFixed(2) }} {{ t('customizer.perCup') }}
            </div>
          </div>

          <div class="footer-right-actions">
            <button class="btn btn-secondary cancel-btn" @click="closeCustomizerModal" type="button">
              {{ t('customizer.cancel') }}
            </button>
            <button class="btn btn-primary add-custom-btn" @click="confirmCustomization" type="button">
              <ShoppingCart :size="17" />
              <span>
                {{ editingCartItemId ? t('customizer.updateOrder') : t('customizer.addToOrder') }} • ${{ modalTotalPrice.toFixed(2) }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt / Order Success Modal -->
    <div v-if="showSuccessModal && receiptOrder" class="modal-backdrop">
      <div class="receipt-modal">
        <div class="modal-header">
          <div class="receipt-shop-brand">
            <img :src="logoIcon" alt="តស់កាហ្វេ TOS CAFE" class="receipt-logo" />
            <div class="receipt-shop-title">តស់កាហ្វេ • TOS CAFE</div>
          </div>
          <div class="success-badge-row">
            <CheckCircle2 :size="22" class="success-icon" />
            <h2>{{ t('pos.paymentSuccess') }}</h2>
          </div>
          <p class="order-id">{{ receiptOrder.id }}</p>
        </div>

        <div class="receipt-body">
          <div class="receipt-items">
            <div v-for="(item, idx) in receiptOrder.items" :key="idx" class="receipt-item-block" :class="{ 'receipt-promo-block': item.price === 0 }">
              <div class="receipt-item-row">
                <span class="font-bold">
                  {{ item.quantity }}x {{ item.productName }}
                  <span v-if="item.price === 0" class="receipt-free-badge">🎁 FREE</span>
                </span>
                <span class="font-mono font-bold" :class="{ 'text-free': item.price === 0 }">
                  {{ item.price === 0 ? '$0.00 (FREE)' : '$' + ((item.price || 0) * item.quantity).toFixed(2) }}
                </span>
              </div>
              <div v-if="item.options" class="receipt-custom-line">
                <span>{{ getSugarLabel(item.options.sugarLevel) }} • {{ getIceLabel(item.options.iceLevel) }}</span>
                <span v-if="item.options.toppings && item.options.toppings.length > 0">
                  • {{ item.options.toppings.map((t: any) => '+' + getToppingLabel(t)).join(', ') }}
                </span>
                <span v-if="item.options.notes || item.notes">
                  • Note: {{ item.options.notes || item.notes }}
                </span>
              </div>
            </div>
          </div>

          <div class="receipt-divider"></div>

          <div class="receipt-summary">
            <div class="receipt-row">
              <span>{{ t('pos.subtotal') }}:</span>
              <span>${{ receiptOrder.subtotal?.toFixed(2) }}</span>
            </div>
            <div v-if="receiptOrder.discount > 0" class="receipt-row">
              <span>{{ t('pos.discount') }}</span>
              <span class="font-bold text-success">-${{ receiptOrder.discount?.toFixed(2) }}</span>
            </div>
            <div class="receipt-row">
              <span>{{ t('pos.tax') }}:</span>
              <span>${{ receiptOrder.tax?.toFixed(2) }}</span>
            </div>
            <div class="receipt-row total">
              <span>{{ t('pos.totalPaid') }}</span>
              <span>${{ receiptOrder.total?.toFixed(2) }}</span>
            </div>
            <div class="receipt-row">
              <span>{{ t('pos.paymentMethod') }}</span>
              <span class="badge badge-success">{{ receiptOrder.paymentMethod }}</span>
            </div>
            <div v-if="receiptOrder.change > 0" class="receipt-row">
              <span>{{ t('pos.changeReturned') }}</span>
              <span>${{ receiptOrder.change?.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" style="width: 100%;" @click="closeSuccessModal" type="button">
            {{ t('pos.nextOrder') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Admin Promotion Management Modal -->
    <div v-if="showPromoManagerModal" class="modal-backdrop">
      <div class="customizer-modal promo-modal-card">
        <div class="customizer-header">
          <div class="customizer-header-info">
            <div class="header-badge-row">
              <span class="category-pill">🎉 {{ t('pos.managePromo') }}</span>
            </div>
            <h2 class="modal-product-title">Promotions & Deals Manager</h2>
          </div>
          <button class="close-btn" @click="showPromoManagerModal = false" type="button">
            <X :size="18" />
          </button>
        </div>

        <div class="customizer-body">
          <div class="promo-manager-list">
            <div
              v-for="p in posStore.promotions"
              :key="p.id"
              class="promo-config-card"
              :class="{ 'is-active': p.isActive }"
            >
              <div class="promo-card-top-row">
                <div class="promo-card-left">
                  <div class="promo-card-badge">{{ p.badge }}</div>
                  <div class="promo-card-details">
                    <div class="promo-title-row">
                      <span class="promo-card-title">{{ p.name[locale] || p.name.en }}</span>
                      <span class="promo-status-badge" :class="getPromoStatusBadge(p).class">
                        {{ getPromoStatusBadge(p).text }}
                      </span>
                    </div>
                    <div class="promo-card-desc">{{ p.description[locale] || p.description.en }}</div>
                    <div v-if="p.eligibleCategories && p.eligibleCategories.length > 0" class="promo-eligible-tags">
                      <span v-for="cat in p.eligibleCategories" :key="cat" class="cat-tag">
                        {{ cat }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="promo-card-right">
                  <button
                    class="promo-toggle-btn"
                    :class="{ active: p.isActive }"
                    @click="posStore.togglePromotionActive(p.id)"
                    type="button"
                  >
                    <Check v-if="p.isActive" :size="14" />
                    <span>{{ p.isActive ? 'Enabled' : 'Disabled' }}</span>
                  </button>
                </div>
              </div>

              <!-- Date Range Schedule Inputs -->
              <div class="promo-dates-schedule">
                <div class="date-input-group">
                  <label class="date-label">
                    <Calendar :size="12" />
                    <span>{{ t('promo.startDate') }}:</span>
                  </label>
                  <input
                    type="date"
                    class="promo-date-input"
                    v-model="p.startDate"
                    @change="posStore.updatePromotionSchedule(p.id, p.startDate, p.endDate)"
                  />
                </div>

                <div class="date-input-group">
                  <label class="date-label">
                    <Clock :size="12" />
                    <span>{{ t('promo.endDate') }}:</span>
                  </label>
                  <input
                    type="date"
                    class="promo-date-input"
                    v-model="p.endDate"
                    @change="posStore.updatePromotionSchedule(p.id, p.startDate, p.endDate)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="promo-manager-actions">
            <button class="btn btn-secondary btn-sm" @click="posStore.resetPromotions" type="button">
              Reset Default Deals
            </button>
          </div>
        </div>

        <div class="customizer-footer">
          <button class="btn btn-primary" style="width: 100%;" @click="showPromoManagerModal = false" type="button">
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Error Modal -->
    <div v-if="showCheckoutErrorModal" class="modal-backdrop" @click.self="showCheckoutErrorModal = false">
      <div class="modal error-alert-modal">
        <div class="error-modal-header">
          <div class="error-icon-circle">
            <AlertCircle :size="30" />
          </div>
          <h3>{{ t('pos.checkoutError') }}</h3>
        </div>
        <div class="error-modal-body">
          <p class="error-message-text">{{ checkoutErrorMessage }}</p>
          <p class="error-tip-text">
            {{ t('pos.checkoutErrorTip') }}
          </p>
        </div>
        <div class="error-modal-actions">
          <button class="btn btn-secondary" @click="showCheckoutErrorModal = false" type="button">
            {{ t('common.cancel') || 'Close' }}
          </button>
          <button class="btn btn-primary" @click="showCheckoutErrorModal = false; handleCheckout()" type="button">
            🔄 {{ t('pos.tryAgain') }}
          </button>
        </div>
      </div>
    </div>

    <!-- VAT Settings Modal -->
    <div v-if="showVatModal" class="modal-backdrop" @click.self="closeVatModal">
      <div class="customizer-modal vat-modal-card">
        <div class="modal-header">
          <div class="modal-header-info">
            <Settings2 :size="22" class="text-coffee" />
            <h2 class="modal-product-title">{{ t('vat.title') }}</h2>
          </div>
          <button class="modal-close-btn" @click="closeVatModal" type="button">
            <X :size="20" />
          </button>
        </div>

        <div class="customizer-body vat-modal-body">
          <!-- Enable / Disable VAT Switch Box -->
          <div class="vat-toggle-box">
            <div class="toggle-meta">
              <span class="toggle-title">{{ t('vat.enableLabel') }}</span>
              <span class="toggle-sub">{{ t('vat.enableSub') }}</span>
            </div>
            <button
              class="vat-toggle-btn"
              :class="{ active: tempVatEnabled }"
              @click="tempVatEnabled = !tempVatEnabled"
              type="button"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>

          <!-- VAT Rate Selection & Custom Input -->
          <div class="vat-rate-section" :class="{ disabled: !tempVatEnabled }">
            <label class="section-title">{{ t('vat.rateLabel') }}</label>

            <div class="vat-preset-chips">
              <button
                v-for="rate in vatPresets"
                :key="rate"
                type="button"
                class="vat-chip"
                :class="{ active: tempVatEnabled && tempVatPercentage === rate }"
                @click="tempVatPercentage = rate; tempVatEnabled = true"
              >
                {{ rate }}%
              </button>
            </div>

            <!-- Custom Input Field -->
            <div class="custom-rate-wrap">
              <label class="custom-rate-label">{{ t('vat.customInput') }}</label>
              <div class="rate-input-box">
                <input
                  type="number"
                  v-model.number="tempVatPercentage"
                  min="0"
                  max="100"
                  step="0.5"
                  class="rate-input"
                  :disabled="!tempVatEnabled"
                />
                <span class="pct-symbol">%</span>
              </div>
            </div>
          </div>

          <!-- Realtime Cart Tax Preview -->
          <div class="vat-preview-box">
            <div class="preview-row">
              <span>Taxable Subtotal:</span>
              <span class="font-mono font-bold">${{ Math.max(0, posStore.subtotal - posStore.discountAmount).toFixed(2) }}</span>
            </div>
            <div class="preview-row">
              <span>VAT Status / Rate:</span>
              <span class="font-mono font-bold" :class="tempVatEnabled ? 'text-accent' : 'text-muted'">
                {{ tempVatEnabled ? `${tempVatPercentage}% Rate` : t('vat.disabledBadge') }}
              </span>
            </div>
            <div class="preview-row total">
              <span>Calculated Tax:</span>
              <span class="font-mono font-bold text-accent">
                ${{ (tempVatEnabled ? Math.max(0, posStore.subtotal - posStore.discountAmount) * (tempVatPercentage / 100) : 0).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer-actions">
          <button type="button" class="btn btn-secondary cancel-btn" @click="closeVatModal">Cancel</button>
          <button type="button" class="btn btn-primary submit-btn" @click="saveVatSettings">
            <Check :size="16" />
            <span>Save Settings</span>
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
  X,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  Banknote,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Sliders,
  Check,
  Gift,
  Tag,
  Settings2,
  Sparkles,
  Percent,
  Calendar,
  Clock,
  ChevronDown,
} from 'lucide-vue-next';
import { usePosStore, Promotion, getPromotionStatus, isProductEligibleForPromotion } from '../stores/posStore';
import { getProductImageUrl, Product, CartItem, ToppingOption, DrinkCustomization } from '../services/api';
import { useI18n } from '../i18n';
import { useAuth } from '../composables/useAuth';
import logoIcon from '../assets/logo-icon.jpg';

const { locale, t, translateCategory } = useI18n();
const { isAdmin } = useAuth();
const posStore = usePosStore();
const selectedPaymentMethod = ref<'CASH' | 'CARD' | 'QR_CODE'>(
  (typeof localStorage !== 'undefined' && (localStorage.getItem('pos_payment_method') as any)) || 'CASH'
);
const cashTendered = ref<number | null>(null);
const isProcessing = ref(false);
const showSuccessModal = ref(false);
const receiptOrder = ref<any>(null);
const showPromoManagerModal = ref(false);
const checkoutErrorMessage = ref<string | null>(null);
const showCheckoutErrorModal = ref(false);

// VAT Settings Modal State
const showVatModal = ref(false);
const tempVatEnabled = ref(true);
const tempVatPercentage = ref(8);
const vatPresets = [0, 5, 7, 8, 10, 15, 20];

const openVatModal = () => {
  tempVatEnabled.value = posStore.vatEnabled;
  tempVatPercentage.value = posStore.vatPercentage;
  showVatModal.value = true;
};

const closeVatModal = () => {
  showVatModal.value = false;
};

const saveVatSettings = () => {
  posStore.setVatSettings(tempVatEnabled.value, tempVatPercentage.value);
  closeVatModal();
};

const activePromotions = computed(() => posStore.validPromotions);

const getPromoStatusBadge = (promo: Promotion) => {
  const status = getPromotionStatus(promo);
  switch (status) {
    case 'ACTIVE':
      return { text: t('promo.statusActive'), class: 'status-active' };
    case 'UPCOMING':
      return { text: t('promo.statusUpcoming'), class: 'status-upcoming' };
    case 'EXPIRED':
      return { text: t('promo.statusExpired'), class: 'status-expired' };
    case 'DISABLED':
    default:
      return { text: t('promo.statusDisabled'), class: 'status-disabled' };
  }
};

// Customizer Modal State
const showCustomizerModal = ref(false);
const selectedProduct = ref<Product | null>(null);
const selectedSugar = ref('100%');
const selectedIce = ref('Regular Ice');
const selectedToppings = ref<ToppingOption[]>([]);
const customNotes = ref('');
const customQuantity = ref(1);
const editingCartItemId = ref<string | null>(null);
const editingCartItem = ref<CartItem | null>(null);
const showToppingsPicker = ref(false);

const isProductEligibleForBogo = (product?: Product | null): boolean => {
  if (!product) return false;
  return isProductEligibleForPromotion(product, posStore.activePromotion);
};

const quickAddFreeCup = (paidItem: CartItem) => {
  posStore.claimFreePromoItem(
    paidItem.id,
    paidItem.product,
    paidItem.options ? { ...paidItem.options } : undefined,
    posStore.activePromotion ? posStore.activePromotion.badge : '🎁 1 Get 1 Free'
  );
};

// Translation Label Helpers
const getSugarLabel = (val?: string) => {
  return val ? `${val}` : '';
};

const getIceLabel = (val?: string) => {
  if (!val) return '';
  const norm = val.toLowerCase();
  if (norm.includes('regular')) return t('ice.regular');
  if (norm.includes('less')) return t('ice.less');
  if (norm.includes('no')) return t('ice.no');
  if (norm.includes('extra')) return t('ice.extra');
  if (norm.includes('hot')) return t('ice.hot');
  return val;
};

const getToppingLabel = (top: { name: string; label?: string } | string) => {
  const name = typeof top === 'string' ? top : top.name || top.label || '';
  const norm = name.toLowerCase();
  if (norm.includes('boba') || (norm.includes('pearl') && !norm.includes('brown'))) return t('topping.boba');
  if (norm.includes('cheese')) return t('topping.cheeseFoam');
  if (norm.includes('coffee jelly')) return t('topping.coffeeJelly');
  if (norm.includes('pudding') || norm.includes('egg')) return t('topping.eggPudding');
  if (norm.includes('grass')) return t('topping.grassJelly');
  if (norm.includes('whipped') || norm.includes('cream')) return t('topping.whippedCream');
  if (norm.includes('shot') || norm.includes('espresso')) return t('topping.extraShot');
  if (norm.includes('coconut')) return t('topping.coconutJelly');
  if (norm.includes('aloe')) return t('topping.aloeVera');
  if (norm.includes('brown sugar')) return t('topping.brownSugar');
  return name;
};

const sugarOptions = [
  { label: '0%', value: '0%' },
  { label: '10%', value: '10%' },
  { label: '20%', value: '20%' },
  { label: '30%', value: '30%' },
  { label: '50%', value: '50%' },
  { label: '70%', value: '70%' },
  { label: '100%', value: '100%' },
  { label: '120%', value: '120%' },
];

const iceOptions = computed(() => [
  { label: t('ice.regular'), value: 'Regular Ice', icon: '🧊' },
  { label: t('ice.less'), value: 'Less Ice', icon: '🧊' },
  { label: t('ice.no'), value: 'No Ice', icon: '🚫' },
  { label: t('ice.extra'), value: 'Extra Ice', icon: '🧊' },
  { label: t('ice.hot'), value: 'Hot Drink', icon: '♨️' },
]);

const availableToppings: ToppingOption[] = [
  { name: 'Boba Pearls', price: 0.50, icon: '🧋' },
  { name: 'Cheese Foam', price: 0.75, icon: '🧀' },
  { name: 'Coffee Jelly', price: 0.50, icon: '🍮' },
  { name: 'Egg Pudding', price: 0.50, icon: '🍮' },
  { name: 'Grass Jelly', price: 0.50, icon: '🫘' },
  { name: 'Whipped Cream', price: 0.50, icon: '🍦' },
  { name: 'Extra Espresso Shot', price: 0.75, icon: '☕' },
  { name: 'Coconut Jelly', price: 0.50, icon: '🥥' },
  { name: 'Aloe Vera', price: 0.50, icon: '🌿' },
  { name: 'Brown Sugar Pearls', price: 0.60, icon: '🍯' },
];

const isToppingSelected = (name: string) => {
  return selectedToppings.value.some((t) => t.name === name);
};

const toggleTopping = (topping: ToppingOption) => {
  const idx = selectedToppings.value.findIndex((t) => t.name === topping.name);
  if (idx >= 0) {
    selectedToppings.value.splice(idx, 1);
  } else {
    selectedToppings.value.push(topping);
  }
};

const selectedToppingsTotal = computed(() => {
  return selectedToppings.value.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
});

const modalUnitPrice = computed(() => {
  if (!selectedProduct.value) return 0;
  return (Number(selectedProduct.value.price) || 0) + selectedToppingsTotal.value;
});

const modalTotalPrice = computed(() => {
  return modalUnitPrice.value * customQuantity.value;
});

const openCustomizer = (product: Product) => {
  selectedProduct.value = product;
  editingCartItemId.value = null;
  customQuantity.value = 1;
  customNotes.value = '';
  selectedToppings.value = [];
  editingCartItem.value = null;
  showToppingsPicker.value = false;

  const isHot = product.category.toLowerCase().includes('hot');
  const isBlackCoffee = ['espresso', 'ristretto', 'doppio', 'americano'].some((name) =>
    product.name.toLowerCase().includes(name)
  );

  selectedIce.value = isHot ? 'Hot Drink' : 'Regular Ice';
  selectedSugar.value = isBlackCoffee ? '0%' : '100%';

  showCustomizerModal.value = true;
};

const openCustomizerForEdit = (item: CartItem) => {
  selectedProduct.value = item.product;
  editingCartItemId.value = item.id;
  editingCartItem.value = item;
  customQuantity.value = item.quantity;
  selectedSugar.value = item.options?.sugarLevel || '100%';
  selectedIce.value = item.options?.iceLevel || 'Regular Ice';
  selectedToppings.value = item.options?.toppings ? [...item.options.toppings] : [];
  customNotes.value = item.options?.notes || '';
  showToppingsPicker.value = !!(item.options?.toppings && item.options.toppings.length > 0);
  showCustomizerModal.value = true;
};

const closeCustomizerModal = () => {
  showCustomizerModal.value = false;
  selectedProduct.value = null;
  editingCartItemId.value = null;
  editingCartItem.value = null;
};

const confirmCustomization = () => {
  if (!selectedProduct.value) return;

  const options: DrinkCustomization = {
    sugarLevel: selectedSugar.value,
    iceLevel: selectedIce.value,
    toppings: [...selectedToppings.value],
    notes: customNotes.value.trim() || undefined,
  };

  if (editingCartItemId.value && editingCartItem.value) {
    const wasPromoFree = !!editingCartItem.value.isPromoFree;
    const badge = editingCartItem.value.promoBadge;
    const paired = editingCartItem.value.pairedWithItemId;

    // Remove existing item from cart
    posStore.cart = posStore.cart.filter((i) => i.id !== editingCartItemId.value);

    // Re-add updated version
    posStore.addToCart(
      selectedProduct.value,
      options,
      customQuantity.value,
      wasPromoFree,
      badge,
      paired
    );
    posStore.reconcilePromoCart();
    closeCustomizerModal();
    return;
  }

  // Adding fresh new item -> auto-apply BOGO/promotions and split into 1 Paid + 1 Free item if matched!
  posStore.addToCartAutoPromo(selectedProduct.value, options, customQuantity.value);

  closeCustomizerModal();
};

const setPaymentMethod = (method: 'CASH' | 'CARD' | 'QR_CODE') => {
  selectedPaymentMethod.value = method;
  try {
    localStorage.setItem('pos_payment_method', method);
  } catch (e) {}
};

let debounceTimer: any = null;
const onSearchInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    posStore.setSearch(value);
  }, 250);
};

const clearSearch = () => {
  posStore.setSearch('');
};

const handleCheckout = async () => {
  if (isProcessing.value || posStore.isSubmitting || posStore.cart.length === 0) return;
  isProcessing.value = true;
  checkoutErrorMessage.value = null;

  try {
    const order = await posStore.checkout(
      selectedPaymentMethod.value,
      cashTendered.value || posStore.total,
    );
    if (order) {
      receiptOrder.value = order;
      showSuccessModal.value = true;
      cashTendered.value = null;
    }
  } catch (err: any) {
    console.error('Checkout error:', err);
    checkoutErrorMessage.value = posStore.error || err.message || 'Checkout failed. Please try again.';
    showCheckoutErrorModal.value = true;
  } finally {
    isProcessing.value = false;
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  receiptOrder.value = null;
};

onMounted(() => {
  posStore.loadInitialData();
});
</script>

<style scoped>
.pos-layout {
  display: grid;
  grid-template-columns: 1fr 410px;
  gap: 0;
  height: calc(100vh - var(--header-height));
  width: 100%;
  overflow: hidden;
  background-color: #FAF7F2;
}

/* Catalog Section */
.catalog-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem 1.25rem;
  border-right: 1px solid var(--gray-200);
}

.search-bar-wrapper {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--gray-400);
}

.search-input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.75rem;
  border-radius: var(--border-radius);
  border: 1.5px solid var(--gray-200);
  background: var(--white);
  font-size: 0.92rem;
  outline: none;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.25rem;
}

.categories-container {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding-bottom: 0.35rem;
}

.category-chip {
  padding: 0.45rem 1.1rem;
  border-radius: var(--border-radius-full);
  border: 1.5px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-800);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--shadow-xs);
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.category-chip:hover {
  background: var(--primary-50);
  border-color: var(--primary-border);
  color: var(--primary);
}

.category-chip.active {
  background: linear-gradient(135deg, #794022 0%, #591F0B 100%);
  color: var(--white);
  border-color: #794022;
  box-shadow: 0 4px 12px rgba(121, 64, 34, 0.28);
  transform: translateY(-1px);
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 0.85rem;
  overflow-y: auto;
  padding-right: 0.35rem;
}

.product-card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.product-card:hover:not(.out-of-stock) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-border);
}

.product-card.out-of-stock {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--gray-100);
}

/* Hero Media Area for Product Card */
.product-media-box {
  width: 100%;
  height: 110px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--gray-100);
  padding: 0.25rem;
}

.product-hero-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.06));
  transition: transform 0.25s ease;
}

.product-card:hover:not(.out-of-stock) .product-hero-img {
  transform: scale(1.06);
}

.product-hero-emoji {
  font-size: 2.75rem;
  line-height: 1;
}

.stock-badge-floating {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(4px);
}

.product-card-body {
  padding: 0.45rem 0.65rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.product-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.22;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-sku {
  font-size: 0.68rem;
  color: #94a3b8;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.2rem;
  padding-top: 0;
}

.product-price {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}

.add-btn {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid var(--primary-border);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
}

.add-btn:hover:not(:disabled) {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

/* Cart Section */
.cart-section {
  background: var(--white);
  border-radius: 16px;
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.clear-cart-btn {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.clear-cart-btn:hover {
  background: var(--danger-light);
}

.cart-items-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.85rem;
  background: #ffffff;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-400);
  text-align: center;
}

.empty-icon {
  margin-bottom: 0.75rem;
  color: var(--gray-300);
}

.empty-cart p {
  font-weight: 600;
  color: var(--gray-600);
}

.empty-cart span {
  font-size: 0.8rem;
  color: var(--gray-400);
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  transition: all 0.15s ease;
}

.cart-item:hover {
  border-color: var(--gray-300);
  background: #ffffff;
  box-shadow: var(--shadow-xs);
}

.cart-item-promo {
  background: var(--success-light);
  border: 1.5px solid var(--success-border);
}

.cart-item-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  max-width: 44px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: 1px solid var(--gray-200);
  flex-shrink: 0;
}

.cart-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-emoji {
  font-size: 1.3rem;
  line-height: 1;
}

.cart-item-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.item-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}

.item-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-edit-icon {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 3px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.cart-item-edit-icon:hover {
  color: var(--primary);
  background: var(--primary-light);
}

.cart-options-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.1rem;
}

.opt-tag {
  font-size: 0.68rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
  line-height: 1.2;
}

.sugar-tag {
  background: #FFF8EE;
  color: #B57537;
  border: 1px solid #FAD7A0;
}

.ice-tag {
  background: #FAF7F2;
  color: #794022;
  border: 1px solid #DEAC76;
}

.topping-tag {
  background: #FDF4EB;
  color: #794022;
  border: 1px solid #DEAC76;
}

.note-tag {
  background: #FAF7F2;
  color: #6B372B;
  border: 1px solid #EFE7DC;
  font-style: italic;
}

.item-price-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.1rem;
}

.item-price {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-600);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--white);
  padding: 0.2rem 0.45rem;
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-xs);
  flex-shrink: 0;
}

.qty-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem;
  border-radius: 4px;
}

.qty-btn:hover:not(:disabled) {
  background: var(--gray-100);
  color: var(--primary);
}

.qty-number {
  font-size: 0.85rem;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cart-item-total {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--gray-900);
  min-width: 52px;
  text-align: right;
  flex-shrink: 0;
}

/* Cart Footer */
.cart-footer {
  border-top: 1px solid var(--gray-200);
  padding: 1.15rem;
  background: var(--gray-50);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.discount-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray-700);
}

.discount-chips {
  display: flex;
  gap: 0.3rem;
}

.d-chip {
  border: 1px solid var(--gray-200);
  background: var(--white);
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.15s ease;
}

.d-chip:hover {
  background: var(--gray-100);
}

.d-chip.active {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.calc-rows {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.86rem;
  color: var(--gray-700);
}

.calc-row {
  display: flex;
  justify-content: space-between;
}

.discount-row {
  color: var(--success-dark);
  font-weight: 700;
}

.total-row {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gray-900);
  border-top: 1.5px dashed var(--gray-300);
  padding-top: 0.6rem;
  margin-top: 0.25rem;
}

.payment-method-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.pay-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.55rem 0.4rem;
  border-radius: 10px;
  border: 1.5px solid var(--gray-200);
  background: var(--white);
  color: var(--gray-700);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition: all 0.18s ease;
}

.pay-btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.pay-btn.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}

.cash-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
}

.cash-input {
  width: 95px;
  padding: 0.4rem 0.6rem;
  border: 1.5px solid var(--gray-200);
  border-radius: 8px;
  outline: none;
  font-size: 0.88rem;
  font-weight: 700;
}

.cash-input:focus {
  border-color: var(--primary);
}

.change-preview {
  color: var(--success-dark);
  font-weight: 700;
}

.checkout-btn {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1.02rem;
  font-weight: 800;
  border-radius: 12px;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
}

/* Drink Customizer Modal */
.customizer-modal {
  background: var(--white);
  width: 550px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.customizer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.4rem;
  border-bottom: 1px solid var(--gray-200);
  background: #ffffff;
}

.customizer-product-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.customizer-hero-thumb {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.modal-emoji {
  font-size: 1.8rem;
}

.customizer-info-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.customizer-cat-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #e0f2fe;
  color: #0284c7;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  align-self: flex-start;
}

.customizer-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.customizer-base-price {
  font-size: 0.85rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.base-val {
  color: var(--gray-800);
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.modal-close-btn:hover {
  background: var(--gray-100);
  color: var(--gray-800);
}

.customizer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.option-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.section-icon {
  font-size: 1.1rem;
}

.section-heading {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.section-selected-badge {
  font-size: 0.82rem;
  color: var(--primary);
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
}

.section-subtext {
  font-size: 0.78rem;
  color: var(--gray-500);
}

/* Sugar Segmented Control */
.sugar-segmented-group {
  display: flex;
  gap: 0.25rem;
  background: var(--gray-100);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--gray-200);
  overflow-x: auto;
}

.sugar-btn {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.15rem;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--gray-700);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  white-space: nowrap;
}

.sugar-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  color: var(--gray-900);
}

.sugar-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(121, 64, 34, 0.35);
}

/* Ice Level Grid */
.ice-chips-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.4rem;
}

.ice-pill {
  padding: 0.55rem 0.25rem;
  border-radius: 12px;
  border: 1.5px solid var(--gray-200);
  background: #ffffff;
  color: var(--gray-700);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 52px;
  transition: all 0.15s ease;
}

.ice-pill:hover {
  border-color: var(--gray-300);
  background: var(--gray-50);
}

.ice-pill.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
  font-weight: 700;
}

/* Toppings Accordion Section */
.toppings-accordion-section {
  border: 1.5px solid var(--gray-200);
  border-radius: 14px;
  background: var(--white);
  overflow: hidden;
  transition: all 0.2s ease;
}

.toppings-accordion-section.is-open {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-sm);
}

.toppings-toggle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: var(--gray-50);
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
}

.toppings-toggle-bar:hover {
  background: var(--gray-100);
}

.toggle-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-heading {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray-900);
}

.toggle-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.accordion-chevron {
  color: var(--gray-400);
  transition: transform 0.2s ease;
}

.accordion-chevron.rotate {
  transform: rotate(180deg);
  color: var(--primary);
}

.toppings-accordion-content {
  padding: 0.75rem 1rem 1rem;
  border-top: 1px solid var(--gray-200);
  background: var(--white);
}

.selected-toppings-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.45rem;
  padding-top: 0.45rem;
  border-top: 1px dashed var(--gray-200);
}

.selected-top-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #FDF4EB;
  color: #794022;
  border: 1px solid #DEAC76;
  padding: 0.2rem 0.55rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
}

.remove-top-chip-btn {
  background: none;
  border: none;
  color: #B57537;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0 0.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s;
}

.remove-top-chip-btn:hover {
  color: #ef4444;
}

.toppings-grid-collapsible {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.45rem;
  margin-top: 0.65rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--gray-200);
}

.topping-count-badge {
  font-size: 0.78rem;
  color: var(--gray-500);
  background: var(--gray-100);
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
}

.topping-count-badge.has-selected {
  color: #794022;
  background: #F7EFE8;
  border: 1px solid #DEAC76;
}

.topping-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  border: 1.5px solid var(--gray-200);
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.topping-card:hover {
  border-color: var(--gray-300);
  background: var(--gray-50);
}

.topping-card.selected {
  border-color: #794022;
  background: #F7EFE8;
  box-shadow: 0 0 0 1px #794022;
}

.topping-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topping-icon {
  font-size: 1.25rem;
}

.topping-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray-800);
}

.topping-pill-price {
  font-size: 0.78rem;
  font-weight: 700;
  color: #794022;
}

.topping-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.15s;
  flex-shrink: 0;
}

.topping-checkbox.checked {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}

.topping-icon {
  font-size: 1.1rem;
}

.topping-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.topping-price-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

/* Notes Input */
.notes-input-wrapper {
  position: relative;
}

.notes-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.88rem;
  outline: none;
  transition: all 0.2s;
}

.notes-input:focus {
  background: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(121, 64, 34, 0.15);
}

/* Customizer Footer */
.customizer-footer {
  padding: 0.9rem 1.4rem;
  border-top: 1px solid var(--gray-200);
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.footer-left-qty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.qty-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
}

.quantity-controls.lg {
  padding: 0.25rem 0.6rem;
  gap: 0.65rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
}

.quantity-controls.lg .qty-btn {
  padding: 0.2rem;
  border-radius: 6px;
}

.quantity-controls.lg .qty-number {
  font-size: 1.05rem;
  min-width: 22px;
}

.item-calc-preview {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.footer-right-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.cancel-btn {
  padding: 0.65rem 1.1rem;
  border-radius: 10px;
  font-weight: 600;
}

.add-custom-btn {
  padding: 0.65rem 1.35rem;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #794022 0%, #591F0B 100%);
  color: #ffffff;
  border: 1px solid #794022;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(121, 64, 34, 0.3);
  transition: all 0.15s ease;
}

.add-custom-btn:hover {
  background: linear-gradient(135deg, #591F0B 0%, #3D1407 100%);
  border-color: #591F0B;
  box-shadow: 0 6px 16px rgba(89, 31, 11, 0.42);
  transform: translateY(-1px);
}

/* Receipt Modal */
.receipt-modal {
  background: var(--white);
  width: 440px;
  max-width: 90%;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
}

.modal-header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.receipt-shop-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.6rem;
}

.receipt-logo {
  width: 58px;
  height: 58px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin-bottom: 0.35rem;
  background: #ffffff;
}

.receipt-shop-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--gray-900);
}

.success-badge-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.25rem;
}

.success-badge-row h2 {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 700;
}

.success-icon {
  color: var(--success);
}

.order-id {
  font-size: 0.85rem;
  color: var(--gray-500);
  font-family: monospace;
}

.receipt-items {
  max-height: 220px;
  overflow-y: auto;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.receipt-item-block {
  padding-bottom: 0.35rem;
  border-bottom: 1px dotted var(--gray-200);
}

.receipt-item-block:last-child {
  border-bottom: none;
}

.receipt-item-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
}

.receipt-custom-line {
  font-size: 0.75rem;
  color: var(--gray-600);
  margin-top: 0.15rem;
  padding-left: 0.5rem;
}

.receipt-divider {
  border-top: 1px dashed var(--gray-300);
  margin: 0.75rem 0;
}

.receipt-summary {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
}

.receipt-row.total {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--dark);
}

.loading-state, .error-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: var(--gray-600);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ================= Promotions & Deals Styling ================= */
.promotion-bar-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.65rem 0.75rem;
  margin-bottom: 0.75rem;
}

.auto-promo-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
  border: 1px solid #86efac;
}

.auto-promo-badge-tag {
  background: #10b981;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  letter-spacing: 0.3px;
}

.promo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.45rem;
}

.promo-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
}

.promo-settings-btn {
  background: transparent;
  border: none;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.promo-settings-btn:hover {
  background: var(--primary-light);
}

.promo-chips-scroll {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: thin;
}

.promo-chip {
  flex-shrink: 0;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0.28rem 0.6rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.promo-chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.promo-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);
}

.promo-chip.promo-deal-pill.active {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border-color: #6d28d9;
}

.promo-applied-banner {
  margin-top: 0.45rem;
  padding: 0.4rem 0.6rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.promo-banner-text {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e40af;
}

.free-badge {
  background: #22c55e;
  color: #ffffff;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 800;
}

.promo-savings-tag {
  font-family: monospace;
  font-weight: 800;
  color: #16a34a;
  font-size: 0.82rem;
}

.promo-hint-tag {
  font-size: 0.7rem;
  color: #64748b;
  font-style: italic;
}

.promo-discount-row {
  color: #7c3aed;
  font-weight: 600;
}

.promo-row-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #7c3aed;
}

.promo-discount-val {
  color: #16a34a;
  font-weight: 800;
}

/* Promo Management Modal */
.promo-modal-card {
  max-width: 580px !important;
}

.promo-manager-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.promo-config-card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--gray-200);
  background: var(--white);
  transition: all 0.2s ease;
}

.promo-config-card.is-active {
  border-color: #818cf8;
  background: #f8faff;
}

.promo-card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.promo-card-left {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.promo-card-badge {
  font-size: 1.3rem;
  background: var(--gray-100);
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--gray-300);
  flex-shrink: 0;
}

.promo-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.promo-card-title {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--gray-900);
  line-height: 1.2;
}

.promo-status-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.promo-status-badge.status-active {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.promo-status-badge.status-upcoming {
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid #fef08a;
}

.promo-status-badge.status-expired {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.promo-status-badge.status-disabled {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.promo-card-desc {
  font-size: 0.78rem;
  color: var(--gray-600);
  margin-top: 0.2rem;
}

.promo-eligible-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.35rem;
}

.cat-tag {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
}

.promo-dates-schedule {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  flex: 1;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #475569;
  font-weight: 700;
  white-space: nowrap;
}

.promo-date-input {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: monospace;
  color: #1e293b;
  width: 100%;
  max-width: 140px;
}

.promo-date-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

.promo-toggle-btn {
  border: 1px solid var(--gray-300);
  background: var(--gray-100);
  color: var(--gray-600);
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.promo-toggle-btn.active {
  background: #10b981;
  border-color: #059669;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}

.promo-manager-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--gray-200);
}

/* ==================== BOGO & PROMO CART / CUSTOMIZER STYLES ==================== */

/* Unclaimed Free Drink Alert in Cart */
.unclaimed-free-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #6ee7b7;
  border-radius: 8px;
  color: #065f46;
  font-size: 0.8rem;
  font-weight: 600;
  animation: pulse-promo 2s infinite ease-in-out;
}

@keyframes pulse-promo {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }
}

.unclaimed-badge {
  background: #10b981;
  color: #ffffff;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.unclaimed-text {
  flex: 1;
}

/* Free Promo Cart Item */
.cart-item.is-promo-free {
  background: #f0fdf4;
  border: 1.5px dashed #86efac;
}

.promo-item-pill {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  letter-spacing: 0.3px;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.2);
}

.free-price-lbl {
  color: #16a34a;
  font-size: 0.82rem;
  font-weight: 800;
}

.original-cross {
  text-decoration: line-through;
  color: #94a3b8;
  font-size: 0.75rem;
  margin-left: 0.35rem;
}

.text-free {
  color: #16a34a !important;
}

/* Quick Claim Free Button on Paid Cart Item */
.claim-chip-row {
  margin-top: 0.2rem;
}

.claim-free-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #ecfdf5;
  border: 1px solid #10b981;
  color: #065f46;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.claim-free-btn:hover {
  background: #10b981;
  color: #ffffff;
}

/* BOGO Selector Card in Customizer Modal */
.bogo-selector-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1.5px solid #86efac;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.06);
}

.bogo-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.bogo-toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  flex: 1;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  width: 38px;
  height: 22px;
  background-color: #cbd5e1;
  border-radius: 20px;
  position: relative;
  transition: 0.2s ease;
  flex-shrink: 0;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-checkbox:checked + .toggle-slider {
  background-color: #10b981;
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(16px);
}

.bogo-meta-texts {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.bogo-title {
  font-size: 0.92rem;
  color: #065f46;
  line-height: 1.2;
}

.bogo-sub {
  font-size: 0.74rem;
  color: #047857;
}

.bogo-tag-pill {
  background: #10b981;
  color: #ffffff;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

/* Free Cup Config Box inside Modal */
.free-cup-config-box {
  background: #ffffff;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.free-cup-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cup-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cup-badge {
  background: #dcfce7;
  color: #15803d;
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #bbf7d0;
}

.cup-name {
  font-size: 0.85rem;
  color: #1e293b;
}

.free-cup-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.free-tab-pill {
  border: none;
  background: transparent;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.free-tab-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.free-custom-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.4rem;
  border-top: 1px dashed #e2e8f0;
}

.mini-control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mini-lbl {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  min-width: 90px;
}

.mini-pills-wrap {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.mini-pill {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-pill:hover {
  background: #e2e8f0;
}

.mini-pill.active {
  background: #10b981;
  border-color: #059669;
  color: #ffffff;
}

/* Receipt Promo Styles */
.receipt-promo-block {
  background: #f0fdf4;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border-left: 3px solid #10b981;
}

.receipt-free-badge {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  margin-left: 0.35rem;
}

/* Error Alert Modal & Protection Styles */
.error-alert-modal {
  max-width: 440px;
  width: 90%;
  padding: 1.5rem;
  text-align: center;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.error-modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.error-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-modal-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.error-modal-body {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.error-message-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 10px;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.error-tip-text {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.error-modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.error-modal-actions .btn {
  flex: 1;
  padding: 0.65rem 1rem;
  font-weight: 700;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
