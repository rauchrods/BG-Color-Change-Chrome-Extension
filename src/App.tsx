import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [color, setColor] = useState<string>("#ffffff");
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get("recentColors", (result) => {
      if (result.recentColors) {
        setRecentColors(result.recentColors);
      }
    });
  }, []);

  useEffect(() => {
    if (recentColors.length > 0) {
      chrome.storage.local.set({ recentColors });
    }
  }, [recentColors]);

  const changeColorHandler = async (color: string) => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [color],
      func: (color) => {
        document.body.style.backgroundColor = color;
        document.body.style.transition = "background-color 0.75s ease";

        // Calculate luminance to determine if background is dark or light
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // Set text color based on background luminance for readability
        const textColor = luminance > 0.5 ? "#000000" : "#ffffff";
        document.body.style.color = textColor;

        // Apply to all text elements for better visibility
        // const textElements = document.querySelectorAll(
        //   "p, h1, h2, h3, h4, h5, h6, span, a, li, td, th"
        // );
        // textElements.forEach((el) => {
        //   (el as HTMLElement).style.color = textColor;
        // });
      },
    });

    if (!recentColors.includes(color)) {
      setRecentColors([...recentColors, color]);
    }

    setIsApplied(true);

    setTimeout(() => {
      setIsApplied(false);
    }, 1500);
  };

  return (
    <div className="color-changer-container">
      <header>
        <h1>Tab Color Changer</h1>
        <p className="subtitle">Change the background color of any webpage</p>
      </header>

      <div className="color-picker-section">
        <div className="color-preview" style={{ backgroundColor: color }}>
          <span className="color-value">{color}</span>
        </div>

        <div className="color-input-container">
          <input
            type="color"
            id="colorPicker"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Select color"
          />
          <label htmlFor="colorPicker">Choose Color</label>
        </div>
      </div>

      <button
        className="apply-button"
        onClick={() => changeColorHandler(color)}
      >
        Apply to Current Tab
      </button>

      {isApplied && <div className="success-message">Color applied!</div>}

      {recentColors.length > 0 && (
        <div className="recent-colors-section">
          <h2>Recent Colors</h2>
          <div className="recent-colors-grid">
            {recentColors.map((recentColor, index) => (
              <button
                key={index}
                className="recent-color-item"
                style={{ backgroundColor: recentColor }}
                onClick={() => {
                  if (recentColor !== color) {
                    setColor(recentColor);
                    changeColorHandler(recentColor);
                  }
                }}
                aria-label={`Apply color ${recentColor}`}
              />
            ))}
          </div>
        </div>
      )}

      <footer>
        <p>
          Click the button to change the background color of the current tab
        </p>

        <a href="https://rauchrodrigues.in/" target="_blank">
          Created by Rauch Rodrigues
        </a>
      </footer>
    </div>
  );
}

export default App;
