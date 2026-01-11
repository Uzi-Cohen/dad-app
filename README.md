# Fashion Design Studio - AI Photo & Video Generator

A powerful web application designed specifically for fashion design businesses. Generate high-quality images and videos of dresses and clothing designs using AI, while maintaining consistent details across multiple generations.

## Features

- **Image Generation**: Create new dress designs or variations from text prompts
- **Reference-Based Generation**: Upload existing photos and generate variations while maintaining key details
- **Video Generation**: Animate static images to showcase fabric movement and design details
- **Gallery**: View and download all your generated content
- **Professional Quality**: Uses Stability AI's SDXL and Stable Video Diffusion models

## Perfect For

- Creating design variations quickly
- Visualizing fabric and color changes
- Generating marketing materials
- Showcasing designs in motion
- Maintaining consistent brand aesthetics

## Quick Start - It's Already Configured! 🎉

Everything is set up and ready to use. No configuration needed!

### Option 1: Easy Startup (Recommended)

**On Mac/Linux:**
1. Double-click `start.sh`
2. Open your browser to http://localhost:3000

**On Windows:**
1. Double-click `start.bat`
2. Open your browser to http://localhost:3000

That's it! The first time will take a few minutes to install dependencies.

### Option 2: Manual Startup

If you prefer using the terminal:

```bash
npm install  # Only needed first time
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment Options

### Option 1: Home Server (Recommended for Local Use)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Run the production server**:
   ```bash
   npm start
   ```

3. **Make it accessible on your local network**:
   - The app will run on port 3000 by default
   - Access it from other devices using: `http://[your-computer-ip]:3000`
   - To find your IP:
     - Linux/Mac: `ifconfig` or `ip addr`
     - Windows: `ipconfig`

4. **Keep it running**:
   - Use a process manager like PM2:
     ```bash
     npm install -g pm2
     pm2 start npm --name "fashion-studio" -- start
     pm2 save
     pm2 startup
     ```

### Option 2: Cloud Deployment (Vercel)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add your `REPLICATE_API_TOKEN` in the Vercel dashboard under Settings → Environment Variables

### Option 3: Docker Deployment

1. Create a `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. Build and run:
   ```bash
   docker build -t fashion-studio .
   docker run -p 3000:3000 -e REPLICATE_API_TOKEN=your_token fashion-studio
   ```

## Usage Guide

### Generating Images

1. **Navigate to "Generate Images" tab**
2. **Upload a reference image** (optional but recommended for consistency)
   - Upload a photo of an existing dress design
3. **Enter a prompt** describing what you want:
   - "Change the color to navy blue"
   - "Add floral embroidery on the bodice"
   - "Make it a midi-length cocktail dress"
4. **Click "Generate Image"**
5. **Download or save** to gallery

### Generating Videos

1. **Navigate to "Generate Videos" tab**
2. **Upload a reference image** (required)
   - Upload a static photo of a dress
3. **Describe the motion**:
   - "Dress flowing elegantly in the wind"
   - "Model walking on runway"
   - "360 degree rotation"
4. **Click "Generate Video"** (takes 1-3 minutes)
5. **Download or save** to gallery

### Tips for Best Results

- **Use high-quality reference images** with good lighting
- **Be specific in prompts**: "burgundy evening gown with lace sleeves" works better than "nice dress"
- **Maintain consistency**: Use the same reference image for related variations
- **Iterate**: Generate multiple versions and pick the best one

## Cost Considerations

This app uses Replicate's API, which charges per generation:
- Image generation: ~$0.003-0.01 per image
- Video generation: ~$0.05-0.10 per video

Check [Replicate's pricing](https://replicate.com/pricing) for current rates.

## Troubleshooting

### "Replicate API token not configured" error
- Make sure you created a `.env` file with your API token
- Restart the development server after adding the token

### Images/Videos not loading
- Check that your API token is valid
- Ensure you have credits in your Replicate account
- Check the browser console for error messages

### Slow generation
- Image generation typically takes 10-30 seconds
- Video generation takes 1-3 minutes
- This is normal and depends on Replicate's server load

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Replicate API**: AI model hosting
- **Stability AI SDXL**: Image generation
- **Stable Video Diffusion**: Video generation

## Support

For issues or questions:
- Check the troubleshooting section above
- Review [Replicate's documentation](https://replicate.com/docs)
- Check [Next.js documentation](https://nextjs.org/docs)

## License

MIT License - Free to use for personal and commercial projects.

---

Built with love for the fashion design community ❤️
