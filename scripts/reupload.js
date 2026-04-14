require('dotenv').config()
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const images = [
  'turtle-oatmeal', 'turtle-black',
  'waistcoat-navy', 'waistcoat-charcoal',
  'henley-grey', 'henley-white',
  'field-tan', 'field-olive',
  'gilet-navy', 'gilet-black',
  'loafer-cognac', 'loafer-navy',
  'brogue-tan', 'brogue-oxblood',
  'gloves-tan', 'gloves-black',
]

async function upload() {
  const results = {}
  for (const name of images) {
    const res = await cloudinary.uploader.upload(`public/${name}.png`, {
      folder: 'cartello/products',
      public_id: name,
      overwrite: true,
      invalidate: true,
    })
    results[name] = res.secure_url
    console.log(`✓ ${name}\n  ${res.secure_url}`)
  }
  console.log('\n// Versioned URLs:')
  Object.entries(results).forEach(([k, v]) => console.log(`// ${k}: ${v}`))
}

upload().catch(console.error)
