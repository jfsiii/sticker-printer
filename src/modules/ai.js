export class AIManager {
  constructor(modalManager) {
    this.modalManager = modalManager;
  }

  async generateImage(prompt) {
    const aiStatus = document.getElementById('aiStatus');
    aiStatus.style.display = 'block';

    return new Promise((resolve, reject) => {
      try {
        const enhancedPrompt = encodeURIComponent(
          `${prompt}, coloring book style, simple black and white line art, outline drawing, no shading`
        );

        const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=384&height=384&nologo=true&enhance=true`;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          aiStatus.style.display = 'none';
          resolve(img);
        };

        img.onerror = () => {
          aiStatus.style.display = 'none';
          reject(new Error('Could not generate image. Try a different description!'));
        };

        img.src = imageUrl;
      } catch (error) {
        aiStatus.style.display = 'none';
        reject(error);
      }
    });
  }
}
