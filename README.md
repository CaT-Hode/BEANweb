# BEANet: Web Presentation

> **Redefining the Efficiency-Accuracy Frontier**  
> An interactive, high-fidelity web presentation for the "Binary Enhanced Adaptive Network" research project.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_CDN_%7C_Tailwind_%7C_NoBuild-blue)

## 📖 Overview

**BEANweb** is a standalone web application designed to present the findings of the **BEANet** research paper. Unlike traditional PowerPoint slides, this project leverages modern web technologies to create an immersive, "Apple Event-style" experience.

It features real-time visualizations of neural network architectures, interactive explanations of quantization methods, and a physics-based UI system—all without a complex build step.

## ✨ Key Features

*   **Fluid Premium Design**: A deep, cinematic aesthetic with glassmorphism, dynamic lighting, and "liquid" physics.
*   **Magnetic Orb Cursor**: A custom-built cursor (`MagneticOrb.js`) that uses SVG filters and spring physics to morph, magnetically snap to buttons, and simulate liquid surface tension.
*   **Interactive Simulations**:
    *   **Architecture Visualization**: Drill down into the macro and micro designs of the network (`ArchitectureUltimate.js`).
    *   **Quantization Demos**: visual comparisons of FP32 vs. Binary quantization (`BackgroundQuantization.js`).
    *   **Memory Wall**: Animated data flow demonstrating the bottleneck between Compute and Memory (`BackgroundMemoryWall.js`).
*   **Zero-Build Architecture**: The entire project runs directly in the browser via CDN imports. No `node_modules`, no Webpack, no build wait times.

## 🚀 Getting Started

Because of the **No-Build** architecture, running the project is incredibly simple:

1.  **Clone the repository** (or download usage).
2.  **Open `index.html`** in any modern web browser (Chrome, Edge, Firefox, Safari).
    *   *Note: For the best experience with audio and smooth animations, use a Chromium-based browser.*
3.  **That's it!**

> **Tip for Developers**: If you use VS Code, you can use the "Live Server" extension to serve the file, which often handles local file protocol restrictions better than just double-clicking the file.

## 🛠️ Project Structure

```text
BEANweb/
├── index.html              # Entry point. Loads React, Tailwind, and all components.
├── REBUILD_GUIDE.md        # Detailed technical guide on the design system.
├── css/
│   ├── styles.css          # Core aesthetics, animations, and global resets.
│   └── liquid-glass.css    # Specific styles for the liquid user interface effects.
├── components/             # All React components (JSX)
│   ├── App.js              # Main presentation logic and slide data.
│   ├── MagneticOrb.js      # The physics-based cursor logic.
│   ├── Architecture*.js    # Various visualization components for the Neural Network.
│   ├── Background*.js      # Interactive background simulations (Memory, Strategies).
│   └── ...                 # Other UI components.
└── source/                 # Static assets (Audio files, Images, PDFs).
```

## 🎨 Design System

For a deep dive into how to replicate this "No-Build" architecture and the "Fluid Premium" aesthetic for your own projects, check out the **[REBUILD_GUIDE.md](./REBUILD_GUIDE.md)** included in this repository.

## 🔧 Technologies

*   **React 18** (via UMD CDN)
*   **TailwindCSS** (via CDN script)
*   **Babel Standalone** (In-browser JSX compilation)
*   **KaTeX** (Math typesetting)
*   **Lucide Icons**

## 📄 License

[MIT License](LICENSE) (or your specific license)
