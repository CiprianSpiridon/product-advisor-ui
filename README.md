# Product Assistant Web UI

A Next.js-based chatbot UI for interacting with the Product Assistant RAG API.

## Features

- Modern chat interface for product queries
- Real-time related product display
- Responsive design that works on mobile and desktop
- Loading states and error handling

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

The assistant will respond with information based on the products available in the database, and related products will appear in the sidebar.

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
