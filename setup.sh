#!/bin/bash

# Fashion Design Studio - One-time Setup Script
# This creates your configuration file

echo "Setting up Fashion Design Studio..."
echo ""

# Create .env file with pre-configured token
cat > .env << 'EOF'
REPLICATE_API_TOKEN=r8_TivdoDn2JE7VkjhGE9Ahpglvqpgme293WuwH8
EOF

echo "✅ Configuration complete!"
echo ""
