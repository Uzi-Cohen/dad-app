# Quick Start Guide

Get up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Get Your API Key

1. Go to [https://replicate.com](https://replicate.com)
2. Sign up for a free account
3. Navigate to [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Copy your API token

## 3. Configure Your API Key

Create a `.env` file:

```bash
echo "REPLICATE_API_TOKEN=paste_your_token_here" > .env
```

Replace `paste_your_token_here` with your actual token.

## 4. Start the App

```bash
npm run dev
```

## 5. Open in Browser

Go to [http://localhost:3000](http://localhost:3000)

## First Time Using?

1. Click the "Generate Images" tab
2. Try this prompt: "An elegant burgundy evening gown with flowing fabric"
3. Click "Generate Image" and wait ~15 seconds
4. Your dad can start creating!

## For Your Dad

Make sure to tell your dad:
- **Upload reference photos** of existing designs for best consistency
- **Be specific** in descriptions (colors, styles, fabrics)
- **Images take 15-30 seconds**, videos take 1-3 minutes
- All generated content appears in the **Gallery tab**
- Click **Download** to save any image or video

## Deploying at Home

To make it accessible on your home network:

```bash
# Build the app
npm run build

# Start production server
npm start
```

Then access from any device on your network at:
`http://YOUR_COMPUTER_IP:3000`

(Find your IP with `ip addr` on Linux or `ipconfig` on Windows)

## Need Help?

- See the full README.md for detailed instructions
- Check the Troubleshooting section if something's not working
- Replicate offers $10 in free credits to start!
