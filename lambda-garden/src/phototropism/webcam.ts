/**
 * λ_MIRROR - Webcam Phototropism
 * Plants grow towards bright pixels from real-world light
 */

export interface BrightnessField {
  width: number;
  height: number;
  data: Float32Array; // Normalized brightness 0-1
  timestamp: number;
}

export class WebcamCapture {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private streaming = false;
  
  constructor(private width = 64, private height = 64) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      this.video = document.createElement('video');
      this.video.srcObject = stream;
      this.video.play();
      
      // Wait for video to be ready
      await new Promise(resolve => {
        this.video!.onloadedmetadata = resolve;
      });
      
      this.streaming = true;
    } catch (err) {
      console.error('λ_MIRROR: Failed to access webcam', err);
      throw err;
    }
  }
  
  stop(): void {
    if (this.video && this.video.srcObject) {
      const tracks = (this.video.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    this.streaming = false;
  }
  
  capture(): BrightnessField | null {
    if (!this.streaming || !this.video) return null;
    
    // Draw video frame to canvas
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
    
    // Get pixel data
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const pixels = imageData.data;
    
    // Convert to grayscale brightness field
    const brightness = new Float32Array(this.width * this.height);
    
    for (let i = 0; i < brightness.length; i++) {
      const offset = i * 4;
      // Luminance formula: 0.299*R + 0.587*G + 0.114*B
      const lum = (
        0.299 * pixels[offset] + 
        0.587 * pixels[offset + 1] + 
        0.114 * pixels[offset + 2]
      ) / 255;
      
      brightness[i] = lum;
    }
    
    return {
      width: this.width,
      height: this.height,
      data: brightness,
      timestamp: Date.now()
    };
  }
  
  // Get brightness at normalized coordinates (0-1)
  getBrightnessAt(field: BrightnessField, x: number, y: number): number {
    const px = Math.floor(x * field.width);
    const py = Math.floor(y * field.height);
    
    if (px < 0 || px >= field.width || py < 0 || py >= field.height) {
      return 0;
    }
    
    return field.data[py * field.width + px];
  }
  
  // Find brightest spot in field
  findBrightestSpot(field: BrightnessField): { x: number; y: number; brightness: number } {
    let maxBrightness = 0;
    let maxX = 0.5;
    let maxY = 0.5;
    
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        const idx = y * field.width + x;
        if (field.data[idx] > maxBrightness) {
          maxBrightness = field.data[idx];
          maxX = x / field.width;
          maxY = y / field.height;
        }
      }
    }
    
    return { x: maxX, y: maxY, brightness: maxBrightness };
  }
  
  // Get gradient towards brightest areas
  getBrightnessGradient(field: BrightnessField, x: number, y: number): { dx: number; dy: number } {
    const epsilon = 1 / Math.max(field.width, field.height);
    
    const right = this.getBrightnessAt(field, x + epsilon, y);
    const left = this.getBrightnessAt(field, x - epsilon, y);
    const up = this.getBrightnessAt(field, x, y - epsilon);
    const down = this.getBrightnessAt(field, x, y + epsilon);
    
    return {
      dx: (right - left) / (2 * epsilon),
      dy: (down - up) / (2 * epsilon)
    };
  }
}

// Pure functional helpers for phototropic growth
export const phototropicBend = (
  direction: { x: number; y: number; z: number },
  lightGradient: { dx: number; dy: number },
  strength: number = 0.3
) => {
  // Map 2D gradient to 3D space (assuming Y is up)
  const lightDir = {
    x: lightGradient.dx,
    y: 0,
    z: lightGradient.dy
  };
  
  // Blend current direction with light direction
  return {
    x: direction.x + lightDir.x * strength,
    y: direction.y,
    z: direction.z + lightDir.z * strength
  };
};

// Create phototropic growth modifier
export const λ_PHOTOTROPISM = (webcam: WebcamCapture) => {
  let lastField: BrightnessField | null = null;
  
  return {
    update: () => {
      lastField = webcam.capture();
    },
    
    modifyGrowth: (position: { x: number; z: number }, direction: any) => {
      if (!lastField) return direction;
      
      // Map world position to camera space (0-1)
      const camX = (position.x + 10) / 20; // Assuming world is -10 to 10
      const camZ = (position.z + 10) / 20;
      
      const gradient = webcam.getBrightnessGradient(lastField, camX, camZ);
      return phototropicBend(direction, gradient);
    },
    
    getBrightestSpot: () => {
      if (!lastField) return null;
      return webcam.findBrightestSpot(lastField);
    },
    
    getField: () => lastField
  };
};