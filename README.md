# Markdown Visualization Dashboard

A Next.js single-page application that automatically generates data visualizations from markdown files using LLM analysis. The dashboard monitors markdown files in the `public` folder and creates appropriate visualizations using Recharts.

## Features

- 📊 **Automatic Visualization**: Uses LLM to analyze markdown content and generate appropriate charts
- 🔄 **Auto-regeneration**: GitHub Actions workflow automatically regenerates visualizations on git commits
- 🎨 **Multiple Chart Types**: Supports line, bar, pie, area, scatter, and composed charts
- 🤖 **Multi-LLM Support**: Works with OpenAI or Anthropic APIs (configurable via environment variables)
- 💾 **Persistent Storage**: Generated visualizations are saved to the file system and committed to git

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- An API key from either OpenAI or Anthropic

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
# Choose one or both (OpenAI is checked first, then Anthropic)
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Running Locally

1. Add markdown files to the `public/` folder

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3030](http://localhost:3030) in your browser

4. Click the "Regenerate" button to generate a visualization from the latest markdown file

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
/
├── public/               # Place your markdown files here
├── generated/            # Generated visualization configs (auto-created)
│   ├── visualization.json
│   └── last-processed.md
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── api/
│   │   ├── latest-md/    # API route to find latest markdown file
│   │   ├── generate-visualization/  # API route to generate visualization
│   │   └── regenerate/   # API route to regenerate visualization
├── lib/
│   ├── llm.ts            # LLM integration (OpenAI/Anthropic)
│   └── utils.ts          # Utility functions
├── scripts/
│   └── regenerate.ts     # Script for GitHub Actions
└── .github/workflows/
    └── regenerate.yml    # GitHub Actions workflow
```

## How It Works

1. **Markdown Detection**: The app scans the `public/` folder and identifies the most recently updated markdown file based on modification time.

2. **LLM Analysis**: The markdown content is sent to an LLM (OpenAI or Anthropic) with a prompt to:
   - Analyze the content for numeric data, trends, and comparisons
   - Determine the best chart type
   - Extract and structure the data appropriately

3. **Visualization Generation**: The LLM returns a JSON configuration that is used to render a chart using Recharts.

4. **Persistence**: The generated visualization config is saved to `generated/visualization.json` and metadata is stored in `generated/last-processed.md`.

5. **Auto-regeneration**: When new markdown files are committed to git, the GitHub Actions workflow automatically regenerates the visualization and commits it back to the repository.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | No (if Anthropic is set) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | No (if OpenAI is set) |

**Note**: At least one LLM API key must be set. The system checks for `OPENAI_API_KEY` first, then falls back to `ANTHROPIC_API_KEY`.

## GitHub Actions Setup

The GitHub Actions workflow automatically regenerates visualizations when markdown files in the `public/` folder are updated. To enable this:

1. Add your LLM API key(s) as GitHub Secrets:
   - Go to your repository Settings → Secrets and variables → Actions
   - Add `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY`

2. The workflow will automatically run on pushes to `main` branch when `.md` files in `public/` are changed.

3. The generated visualization will be automatically committed back to the repository.

## Manual Regeneration

You can manually regenerate the visualization by:
- Clicking the "Regenerate" button on the web interface
- Running the script directly: `npx tsx scripts/regenerate.ts`

## Supported Chart Types

- **Line Chart**: For trends over time
- **Bar Chart**: For comparisons between categories
- **Pie Chart**: For proportional data
- **Area Chart**: For cumulative trends
- **Scatter Chart**: For correlation analysis
- **Composed Chart**: For multiple data series

## Contributing

This is a Vercel template project. Feel free to fork and customize for your needs.

## License

MIT

