document.getElementById("rewriteBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: getSelectedText,
    },
    async (injectionResults) => {
      const selectedText = injectionResults[0].result;
      const tone = document.getElementById("tone").value;

      if (!selectedText) {
        document.getElementById("result").textContent = "⚠️ Please select some text on the page first.";
        return;
      }

      const prompt = `Rewrite the following email in a more ${tone} tone:\n"${selectedText}"`;

      const apiKey = "AIzaSyAY1jMhcWfTfJmEtnUWWkaY7TnMR7D1qg8";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await res.json();
        console.log("Gemini API response:", data);

        if (data.error) {
          document.getElementById("result").textContent = `❌ Error: ${data.error.message}`;
          return;
        }

        const rewritten = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Gemini gave no response";
        document.getElementById("result").textContent = rewritten;

      } catch (err) {
        document.getElementById("result").textContent = `❌ Fetch Error: ${err.message}`;
      }
    }
  );
});

function getSelectedText() {
  return window.getSelection().toString();
}
