# Product Assistant Web UI

A Next.js-based chatbot UI for interacting with the Product Assistant RAG API.

## Features

- Modern chat interface for product queries
- Real-time related product display with images and details
- Interactive product cards with detailed product information
- Shopping cart with sticky header and checkout
- Responsive design that works on mobile and desktop
- Loading states and error handling
- AED pricing display throughout the UI

## Getting Started

1. First, make sure the Product Assistant API is running
2. Create a `.env.local` file with API configuration:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Usage

Simply type your product questions in the chat input field. For example:
- "What baby products do you have?"
- "Do you have any strollers?"
- "Tell me about your electronics"

The assistant will respond with information based on the products available in the database, and related products will appear in a carousel below the chat. You can click on any product to view more details and add it to your cart.

### Product Details

When you click on a product, a bottom sheet will open showing:
- Product image
- Detailed information
- Features list
- Price in AED
- "View on Website" link to the product page
- Add to Cart button

### Shopping Cart

The cart system features:
- Sticky header for easy navigation
- Row-based product display with images
- Remove button with trash icon
- Sticky total and checkout section
- Dynamic total calculation
- Responsive design

## Recommended Product Data Structure

When the assistant provides product recommendations, each recommended product will adhere to the following JSON structure:

```json
{
  "sku": "SKU123",
  "name": "Interactive Learning Tablet",
  "brand_default_store": "EduKids",
  "description": "A fun and educational tablet for young children with interactive games and learning activities.",
  "features": "10-inch HD screen, pre-loaded educational apps, parental controls, durable design",
  "recom_age": "3-6 years",
  "top_category": "Toys & Games",
  "secondary_category": "Educational Toys",
  "action": "View Product",
  "url": "https://example.com/product/tablet123",
  "image": "https://example.com/images/tablet123.jpg",
  "objectID": "product_123456789",
  "price": "149"
}
```

Where:
- `sku`: (string) Product Stock Keeping Unit
- `name`: (string) Product Name
- `brand_default_store`: (string) Brand or Default Store
- `description`: (string) Product Description
- `features`: (string) Key Features
- `recom_age`: (string) Recommended Age Range
- `top_category`: (string) Main Product Category
- `secondary_category`: (string) Sub-category
- `action`: (string) Call to action text (e.g., "Buy Now", "Learn More")
- `url`: (string) Direct URL to the product page
- `image`: (string) URL to the product image
- `objectID`: (string) Unique identifier for the product object
- `price`: (string) Product price in AED

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- Next.js 14 with App Router
- React
- TypeScript
- Tailwind CSS
- Axios for API requests
- React Hot Toast for notifications
- KeenSlider for product carousels
