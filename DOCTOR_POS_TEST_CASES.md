# Doctor POS Test Cases

This document outlines 20 comprehensive test cases for the Doctor Point of Sale (POS) interface.

## 1. Search Functionality

### TC-01: Search by exact name
- **Action:** Enter "Panadol" in the search input.
- **Expected Result:** Results showing medicines containing "Panadol" appear.

### TC-02: Search by partial name
- **Action:** Enter "Pana" in the search input.
- **Expected Result:** Results showing "Panadol Extra", "Panadol Child", etc.

### TC-03: Search case-insensitive
- **Action:** Enter "panadol" (lowercase).
- **Expected Result:** Results appear correctly (matches "Panadol").

### TC-04: Search with no results
- **Action:** Enter a non-existent drug name (e.g., "XYZ123").
- **Expected Result:** Placeholder "Không tìm thấy thuốc phù hợp" is displayed.

### TC-05: Debounced search
- **Action:** Type quickly and observe network calls.
- **Expected Result:** Only one API call is made after the user stops typing (300ms delay).

## 2. Cart Management

### TC-06: Add item to cart
- **Action:** Click "+ Thêm" on a search result.
- **Expected Result:** Item appears in the right column (cart) with quantity 1.

### TC-07: Increment quantity by clicking "+ Thêm" again
- **Action:** Click "+ Thêm" on the same item multiple times.
- **Expected Result:** `buyQuantity` in the cart increments accordingly.

### TC-08: Add out-of-stock item
- **Action:** Attempt to add an item with `quantity: 0`.
- **Expected Result:** Error toast "Thuốc ... đã hết hàng!" appears.

### TC-09: Remove item from cart
- **Action:** Click the Trash icon on a cart item.
- **Expected Result:** Item is removed from the cart; total price updates.

### TC-10: Update quantity via input
- **Action:** Manually change the quantity input in the cart.
- **Expected Result:** Total amount for that item and the overall total update instantly.

## 3. Validation & Rules

### TC-11: Prevent negative quantity
- **Action:** Enter "-5" or "0" in the quantity input.
- **Expected Result:** Input logic prevents or resets to valid number (minimum 1).

### TC-12: Stock limit validation
- **Action:** Try to set `buyQuantity` higher than available `stock`.
- **Expected Result:** Toast warning "Kho chỉ còn ..." appears and quantity is capped at available stock.

### TC-13: UI visual for low stock
- **Action:** View an item with stock < 10.
- **Expected Result:** Stock number is highlighted in red.

## 4. Checkout Flow

### TC-14: Checkout with empty cart
- **Action:** Click "Thanh toán" when no items are in the cart.
- **Expected Result:** Error toast "Giỏ hàng trống!" appears.

### TC-15: Open Billing Confirmation (Step 1)
- **Action:** Add items and click "Thanh toán".
- **Expected Result:** A Dialog (Bill) opens showing the list of items and total price.

### TC-16: Cancel Checkout
- **Action:** Click "Quay lại" on the confirmation Dialog.
- **Expected Result:** Dialog closes; cart items remain unchanged.

### TC-17: Final Confirmation & RPC Call (Step 2)
- **Action:** Click "Xác nhận và trừ kho" on the confirmation Dialog.
- **Expected Result:** Loading spinner appears; Supabase RPC `process_order` is called.

### TC-18: Successful Checkout Popup
- **Action:** Complete a valid transaction.
- **Expected Result:** Success popup appears showing total amount collected; cart is cleared.

## 5. History & Navigation

### TC-19: Open Transaction History
- **Action:** Click the "Lịch sử" button in the POS header.
- **Expected Result:** History Dialog opens showing the last 20 transactions.

### TC-20: Navigation back to Home
- **Action:** Click the brand/logo or back button.
- **Expected Result:** Returns to the Dashboard landing page.
