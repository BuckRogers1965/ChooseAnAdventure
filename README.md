# AI-Powered Choose Your Path Adventure Builder

This is a web-based graphical user interface (GUI) for building and playing "choose your own adventure" style games. It leverages the Google Gemini API to dynamically generate story elements like location descriptions and player choices, making adventure creation fast, easy, and fun.

![Screenshot of the Adventure Builder UI](https://storage.googleapis.com/aistudio-o-images/project_screenshots/cyoa-builder.png)

## ✨ Features

- **Adventure Management**: Create, delete, import (`.json`), and export (`.json`) entire adventures.
- **Intuitive Builder UI**: A simple, two-panel interface to manage locations, the core building blocks of your adventure.
- **AI-Powered Content Generation**:
  - Generate immersive location descriptions with a single click.
  - Generate context-aware player choices based on a location's description.
- **Complex Story Logic**:
  - Define distinct start and finish points for your story.
  - Implement item-based progression: players can find items in one location that are required to unlock choices in another.
- **Interactive Player Mode**: Switch seamlessly from building to playing to test your adventure in real-time.
- **Local Storage Persistence**: All your adventures are automatically saved in your browser's local storage, so your work is never lost.

## 🚀 How It Works

The application is divided into three main views:

1.  **Adventure List View**: This is the main screen where you can manage all your adventures. From here, you can create a new adventure, import one from a file, or choose an existing one to play or edit.

2.  **Builder View**: The heart of the application. This is where you bring your story to life.
    -   **Left Panel**: A list of all locations in the current adventure. You can add new ones or delete existing ones.
    -   **Right Panel**: A detailed editor for the selected location. You can set its name, description, and choices. This is where you can use the AI to generate content. Each choice can be linked to another location, and you can optionally specify an "item required" to make that choice available, adding a layer of puzzle-solving to your game.

3.  **Player View**: An immersive, clean interface to play through the created adventure. The UI shows the current location, its description, and the choices available to the player. It also discreetly tracks the player's inventory at the bottom of the screen.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI**: Google Gemini API (`@google/genai`) for content generation.
-   **No Backend**: The entire application runs in the browser and uses `localStorage` for data persistence.

## 🕹️ How to Use

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aWx_4PheJ9Zn_R2j2RP0OAKOaru9VrhT

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Then I had to allow connections to that server address on that box.  
    `sudo ufw allow 3000/tcp'


The app runs directly in your browser.

    `http://localhost:3000`

The app starts with a pre-built example adventure ("The Key and the Door") to demonstrate the features.

### Creating Your Own Adventure

1.  From the main screen, click **"Create New Adventure"**.
2.  You'll be taken to the Builder View. Give your adventure a title at the top of the screen.
3.  Click **"Add New Location"** to create your first scene.
4.  Select the new location, and in the right panel, give it a name (e.g., "Enchanted Cave Entrance").
5.  Click the **"Generate with AI"** button next to the description field to get a rich, AI-generated description for your location.
6.  Once you have a description, click the **"Generate with AI"** button next to the Choices header to get some ideas for what the player can do.
7.  For each choice, use the dropdown menu to link it to a destination location.
8.  Don't forget to designate one location as the **"Set as Start"** point.
9.  Create a "Finish" location by checking the **"This is a Finish Location"** box. This will give your game a conclusive ending.
10. Save your changes!

### Playing an Adventure

1.  From the adventure list, click the **Play icon** next to any adventure.
2.  Read the story and click the choices to progress. Your inventory will be updated automatically as you find items.

## 📁 Project Structure

```
.
├── index.html                # Main HTML entry point
├── index.tsx                 # React application root
├── App.tsx                   # Main component, handles state and view routing
├── components/
│   ├── AdventureListView.tsx   # UI for the main adventure list screen
│   ├── BuilderView.tsx         # UI for creating and editing adventures
│   ├── PlayerView.tsx          # UI for playing an adventure
│   └── icons.tsx               # Reusable SVG icon components
├── services/
│   └── geminiService.ts      # Logic for all API calls to Google Gemini
├── types.ts                  # TypeScript type definitions for the application
└── README.md                 # This file
```