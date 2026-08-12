// Fallback & Offline Catalog Data for Sarees For Naaris
// Provides instant zero-latency product data when backend is sleeping/cold-starting or offline.

export const FALLBACK_CATEGORIES = [
  { categoryId: 1, categoryName: 'Casual', categoryimage: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/casual.jpg?updatedAt=1785166625193' },
  { categoryId: 2, categoryName: 'Traditional', categoryimage: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/traditional.jpg?updatedAt=1785166625181' },
  { categoryId: 3, categoryName: 'Party', categoryimage: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/party.webp?updatedAt=1785166624926' },
  { categoryId: 4, categoryName: 'Wedding', categoryimage: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/marriages.jpeg?updatedAt=1785166624793' }
];

export const FALLBACK_SUBCATEGORIES = [
  { subcategoryId: 1, categoryId: 1, subcategoryName: 'Georgette' },
  { subcategoryId: 2, categoryId: 1, subcategoryName: 'Linen' },
  { subcategoryId: 3, categoryId: 1, subcategoryName: 'Printed' },
  { subcategoryId: 4, categoryId: 1, subcategoryName: 'Cotton' },
  { subcategoryId: 5, categoryId: 2, subcategoryName: 'Chanderi' },
  { subcategoryId: 6, categoryId: 2, subcategoryName: 'Paithani' },
  { subcategoryId: 7, categoryId: 2, subcategoryName: 'Banarasi' },
  { subcategoryId: 8, categoryId: 2, subcategoryName: 'Kanjivaram' },
  { subcategoryId: 9, categoryId: 3, subcategoryName: 'Ruffle' },
  { subcategoryId: 10, categoryId: 3, subcategoryName: 'Satin' },
  { subcategoryId: 11, categoryId: 3, subcategoryName: 'Net' },
  { subcategoryId: 12, categoryId: 3, subcategoryName: 'Sequin' },
  { subcategoryId: 13, categoryId: 4, subcategoryName: 'Designer Bridal' },
  { subcategoryId: 14, categoryId: 4, subcategoryName: 'Embroidered' },
  { subcategoryId: 15, categoryId: 4, subcategoryName: 'Zari Work' },
  { subcategoryId: 16, categoryId: 4, subcategoryName: 'Bridal Silk' }
];

export const FALLBACK_PRODUCTS = [
  {
    productId: 1,
    name: 'Wine Red Ruffle Party Saree',
    description: 'Chic pre-stitched ruffle saree with glamorous border detail and comfortable inner lining.',
    price: 5999.00,
    stock: 12,
    category: { categoryId: 3, categoryName: 'Party' },
    subcategory: { subcategoryId: 9, subcategoryName: 'Ruffle' },
    subCategory: 'Ruffle',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Ruffle/Ruffle4.jpeg?updatedAt=1785161024860' }]
  },
  {
    productId: 5,
    name: 'Rose Gold Liquid Satin Saree',
    description: 'Ultra-smooth shimmering satin saree with silky drape for high-fashion evening events.',
    price: 4999.00,
    stock: 20,
    category: { categoryId: 3, categoryName: 'Party' },
    subcategory: { subcategoryId: 10, subcategoryName: 'Satin' },
    subCategory: 'Satin',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Satin/_Satin2.webp?updatedAt=1785161053940' }]
  },
  {
    productId: 13,
    name: 'Glamorous Gold Sequin Saree',
    description: 'Full sequin shimmer saree inspired by Bollywood red carpets with lightweight organza base.',
    price: 9999.00,
    stock: 10,
    category: { categoryId: 3, categoryName: 'Party' },
    subcategory: { subcategoryId: 12, subcategoryName: 'Sequin' },
    subCategory: 'Sequin',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Sequin/Sequin3.webp?updatedAt=1785161185269' }]
  },
  {
    productId: 17,
    name: 'Peach Floral Georgette Saree',
    description: 'Lightweight breathable georgette saree with vibrant digital floral prints.',
    price: 2499.00,
    stock: 25,
    category: { categoryId: 1, categoryName: 'Casual' },
    subcategory: { subcategoryId: 1, subcategoryName: 'Georgette' },
    subCategory: 'Georgette',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Georgette/Georgette1.jpg?updatedAt=1785161223667' }]
  },
  {
    productId: 21,
    name: 'Natural Beige Linen Saree',
    description: 'Pure eco-friendly breathable linen saree with handloom silver zari border.',
    price: 3499.00,
    stock: 20,
    category: { categoryId: 1, categoryName: 'Casual' },
    subcategory: { subcategoryId: 2, subcategoryName: 'Linen' },
    subCategory: 'Linen',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Linen/%20_Linen1.jpeg?updatedAt=1785161252627' }]
  },
  {
    productId: 25,
    name: 'Multicolor Kalamkari Printed Saree',
    description: 'Artisanal Kalamkari block print casual saree crafted by master craftsmen in Andhra Pradesh.',
    price: 2999.00,
    stock: 24,
    category: { categoryId: 1, categoryName: 'Casual' },
    subcategory: { subcategoryId: 3, subcategoryName: 'Printed' },
    subCategory: 'Printed',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Printed/_%20%20_Printed3.jpg?updatedAt=1785161278360' }]
  },
  {
    productId: 29,
    name: 'Mulmul Yellow Daily Cotton Saree',
    description: 'Ultra-soft handloom Mulmul cotton saree for all-day summer comfort.',
    price: 1999.00,
    stock: 35,
    category: { categoryId: 1, categoryName: 'Casual' },
    subcategory: { subcategoryId: 4, subcategoryName: 'Cotton' },
    subCategory: 'Cotton',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Cotton/_Cotton3.jpeg?updatedAt=1785161301936' }]
  },
  {
    productId: 33,
    name: 'Pastel Pink Tissue Chanderi Saree',
    description: 'Sheer golden tissue Chanderi saree with gold bootis and contrast border.',
    price: 5499.00,
    stock: 15,
    category: { categoryId: 2, categoryName: 'Traditional' },
    subcategory: { subcategoryId: 5, subcategoryName: 'Chanderi' },
    subCategory: 'Chanderi',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Chanderi/c1.avif?updatedAt=1785214661226' }]
  },
  {
    productId: 38,
    name: 'Peacock Blue Royal Paithani Saree',
    description: 'Authentic hand-loomed peacock blue Paithani with pure gold zari kaleidoscope pallu.',
    price: 24999.00,
    stock: 5,
    category: { categoryId: 2, categoryName: 'Traditional' },
    subcategory: { subcategoryId: 6, subcategoryName: 'Paithani' },
    subCategory: 'Paithani',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Paithani/p1.webp?updatedAt=1785214696341' }]
  },
  {
    productId: 43,
    name: 'Royal Red Banarasi Zari Silk',
    description: 'Exquisite handwoven crimson Banarasi silk saree with intricate real gold kadwa jaal motifs.',
    price: 14999.00,
    stock: 10,
    category: { categoryId: 2, categoryName: 'Traditional' },
    subcategory: { subcategoryId: 7, subcategoryName: 'Banarasi' },
    subCategory: 'Banarasi',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Banarasi/b3.webp?updatedAt=1785214721013' }]
  },
  {
    productId: 48,
    name: 'Classic Mustard Gold Kanjivaram',
    description: 'Authentic Kanjivaram silk saree in mustard gold with contrast maroon heavy zari border.',
    price: 18999.00,
    stock: 9,
    category: { categoryId: 2, categoryName: 'Traditional' },
    subcategory: { subcategoryId: 8, subcategoryName: 'Kanjivaram' },
    subCategory: 'Kanjivaram',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Kanjivaram/k3.jpg?updatedAt=1785214746050' }]
  },
  {
    productId: 53,
    name: 'Bridal Scarlet Designer Saree',
    description: 'Heavy bridal crimson red saree with royal zardozi embroidery and stone accents.',
    price: 28999.00,
    stock: 4,
    category: { categoryId: 4, categoryName: 'Wedding' },
    subcategory: { subcategoryId: 13, subcategoryName: 'Designer Bridal' },
    subCategory: 'Designer Bridal',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Designer%20Bridal/Designer%20Bridal_5.jpg?updatedAt=1785215669360' }]
  },
  {
    productId: 58,
    name: 'Heavy Embroidered Silk Saree',
    description: 'Intricately embroidered silk saree with gota patti and resham handiwork.',
    price: 18999.00,
    stock: 8,
    category: { categoryId: 4, categoryName: 'Wedding' },
    subcategory: { subcategoryId: 14, subcategoryName: 'Embroidered' },
    subCategory: 'Embroidered',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Embroidered/Embroidered_5.jpeg?updatedAt=1785215700076' }]
  },
  {
    productId: 63,
    name: 'Antique Gold Zari Work Saree',
    description: 'Pure silk wedding saree woven with antique gold zari threads and regal motif borders.',
    price: 22999.00,
    stock: 7,
    category: { categoryId: 4, categoryName: 'Wedding' },
    subcategory: { subcategoryId: 15, subcategoryName: 'Zari Work' },
    subCategory: 'Zari Work',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Zari%20Work/Zari%20work_3.jpg?updatedAt=1785168310198' }]
  },
  {
    productId: 68,
    name: 'Pure Crimson Bridal Silk Saree',
    description: 'High grade pure silk bridal saree with traditional temple motifs and Silk Mark tag.',
    price: 27999.00,
    stock: 5,
    category: { categoryId: 4, categoryName: 'Wedding' },
    subcategory: { subcategoryId: 16, subcategoryName: 'Bridal Silk' },
    subCategory: 'Bridal Silk',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Bridal%20Silk/Bridal%20silk_5.webp?updatedAt=1785215761786' }]
  },
  {
    productId: 69,
    name: 'Kanchipuram Pure Bridal Silk',
    description: 'Authentic heavyweight Kanchipuram silk saree for Indian brides with pure gold zari weave.',
    price: 29500.00,
    stock: 4,
    category: { categoryId: 4, categoryName: 'Wedding' },
    subcategory: { subcategoryId: 16, subcategoryName: 'Bridal Silk' },
    subCategory: 'Bridal Silk',
    images: [{ imageUrl: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Bridal%20Silk/Bride%20Silk_3.jpg?updatedAt=1785168354745' }]
  }
];
