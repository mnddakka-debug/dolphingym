from PIL import Image

output_dir = "C:/Users/Dakka/Desktop/dolphin-gym---management-suite/public/"
img = Image.open(output_dir + "logo.jpg")

# 1. Favicon (ICO format is best saved with 256x256 max or standard sizes)
img.resize((64, 64)).save(output_dir + "favicon.ico", format="ICO", sizes=[(64, 64)])

# 2. Apple Touch Icon
img.resize((180, 180)).save(output_dir + "apple-touch-icon.png", format="PNG")

# 3. PWA Icons
img.resize((192, 192)).save(output_dir + "pwa-192x192.png", format="PNG")
img.resize((512, 512)).save(output_dir + "pwa-512x512.png", format="PNG")

# 4. Standard logo png
img.save(output_dir + "logo.png", format="PNG")

print("Icons generated successfully!")
