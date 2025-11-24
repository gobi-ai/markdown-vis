# Markdown Visualization Dashboard

A Next.js single-page application that automatically generates data visualizations (PNG images) from markdown files using **Google Gemini** (Nano-banana). The dashboard monitors markdown files in the `documents` folder and creates appropriate visualizations.

## Features

- 📊 **Automatic Visualization**: Uses **Google Gemini** to analyze markdown content and generate professional SVG/PNG charts or diagrams.
- 🔄 **Auto-generation**: GitHub Actions workflow automatically generates visualizations on git commits.
- 🎨 **Visuals**: Generates high-quality images suitable for any kind of data (charts, concept maps, infographics).
- 💾 **Persistent Storage**: Generated visualization images (`vis.png`) are saved to the file system and committed to git.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm
- An API key from **Google Gemini** (Nano-banana)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd markdown-vis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running Locally

1. Add markdown files to the `documents/` folder.

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3030](http://localhost:3030) in your browser.

4. If no visualization exists, you can click "Regenerate" on the dashboard, or wait for the GitHub Action to run on push.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
/
├── documents/            # Place your markdown files here
├── generated/            # Generated visualization outputs (auto-created)
│   ├── vis.png           # The generated visualization image
│   └── last-processed.md # Metadata for tracking changes
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── api/
│   │   ├── visualization/# API route to trigger generation
│   │   └── visualization/image # API route to serve the image
├── lib/
│   ├── ai.ts             # Gemini AI integration
│   └── utils.ts          # Utility functions
└── .github/workflows/
    └── generate-visualization.yml    # GitHub Actions workflow
```

## How It Works

1. **Markdown Detection**: The app scans the `documents/` folder and identifies the most recently updated markdown file.

2. **AI Generation**: The markdown content is sent to **Google Gemini (gemini-1.5-flash)** with a prompt to generate an SVG visualization.

3. **Image Conversion**: The generated SVG code is converted to a PNG image using `sharp`.

4. **Persistence**: The resulting image is saved as `generated/vis.png`.

5. **Auto-generation**: When new markdown files are committed to git, the GitHub Actions workflow automatically generates the visualization and commits it back to the repository.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## GitHub Actions Setup

The GitHub Actions workflow automatically generates visualizations when markdown files in the `documents/` folder are updated. To enable this:

1. Add your Gemini API key as a GitHub Secret:
   - Go to your repository Settings → Secrets and variables → Actions
   - Add `GEMINI_API_KEY`

2. The workflow will automatically run on pushes to `main` branch when `.md` files in `documents/` are changed.

3. The generated visualization will be automatically committed back to the repository.

## Contributing

Feel free to fork and customize for your needs.

## License

MIT
