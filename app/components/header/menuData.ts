// components/menuData.ts

// ==================== 类型定义 ====================
export type SubItem = { label: string; href: string };
export type SecondaryItem = { label: string; href?: string; sub?: SubItem[] };
export type SecondaryMenu = { label: string; items: SecondaryItem[] };

// ==================== 1. 品牌全局配置 (新增) ====================
// 在这里修改，全站抽屉里的联系信息都会同步更新
export const BRAND_CONFIG = {
  email: "service@linjinluxury.com",
  phone: "+86 13435206582",
  whatsapp: "+86 17817026596",
  social: {
    instagram: "https://instagram.com/linjin",
    wechat: "linjin_official",
    tiktok: "https://tiktok.com/@linjin"
  }
};

// ==================== 2. 个人中心菜单配置 (新增) ====================
// 对应你文件夹中的：addresses, orders, settings, vip-services
export const ACCOUNT_MENU = [
  { label: "My Orders", href: "/account/orders" },
  { label: "Saved Items", href: "/wishlist" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Settings", href: "/account/settings" },
  { label: "VIP Services", href: "/account/vip-services", isSpecial: true }, // 特殊样式标注
];

// ==================== 3. 完整二级菜单数据 ====================
export const secondaryMenus: Record<string, SecondaryMenu> = {
  newIn: {
    label: 'New In',
    items: [
      { label: 'All New Arrivals', href: '/new-in' },
      { label: 'Women’s New Arrivals', sub: [
        { label: 'All Women’s New', href: '/new-in/women' },
        { label: 'Handbags', href: '/new-in/women/handbags' },
        { label: 'Shoes', href: '/new-in/women/shoes' },
        { label: 'Ready-to-Wear', href: '/new-in/women/ready-to-wear' },
        { label: 'Jewelry', href: '/new-in/women/jewelry' },
        { label: 'Accessories', href: '/new-in/women/accessories' },
        { label: 'Small Leather Goods', href: '/new-in/women/small-leather-goods' },
      ]},
      { label: 'Men’s New Arrivals', sub: [
        { label: 'All Men’s New', href: '/new-in/men' },
        { label: 'Bags', href: '/new-in/men/bags' },
        { label: 'Shoes', href: '/new-in/men/shoes' },
        { label: 'Ready-to-Wear', href: '/new-in/men/ready-to-wear' },
        { label: 'Accessories', href: '/new-in/men/accessories' },
        { label: 'Small Leather Goods', href: '/new-in/men/small-leather-goods' },
        { label: 'Travel & Business', href: '/new-in/men/travel-business' },
      ]},
      { label: 'Small Leather Goods', href: '/new-in/small-leather-goods' },
      { label: 'Travel', href: '/new-in/travel-lifestyle' },
      { label: 'Limited Editions', href: '/new-in/limited-editions' },
    ],
  },
  women: { label: 'Women', items: [
    { label: 'Handbags', sub: [
      { label: 'All Handbags', href: '/women/handbags' },
      { label: 'Crossbody', href: '/women/handbags/crossbody' },
      { label: 'Shoulder Bag', href: '/women/handbags/shoulder-bag' },
      { label: 'Mini Bags', href: '/women/handbags/mini-bags' },
      { label: 'Totes', href: '/women/handbags/totes' },
      { label: 'Clutches', href: '/women/handbags/clutches' },
      { label: 'Hobo Bag', href: '/women/handbags/hobo-bag' },
      { label: 'Bucket Bag', href: '/women/handbags/bucket-bag' },
      { label: 'Backpack', href: '/women/handbags/backpack' },
      { label: 'Top Handles', href: '/women/handbags/top-handles' },
      { label: 'Belt Bags', href: '/women/handbags/belt-bags' },
      { label: 'Trunk Inspired', href: '/women/handbags/trunk-inspired' },
    ]},
    { label: 'Shoes', sub: [
      { label: 'All Shoes', href: '/women/shoes' },
      { label: 'Heels', href: '/women/shoes/heels' },
      { label: 'Sneakers', href: '/women/shoes/sneakers' },
      { label: 'Boots', href: '/women/shoes/boots' },
      { label: 'Sandals', href: '/women/shoes/sandals' },
      { label: 'Flats', href: '/women/shoes/flats' },
    ]},
    { label: 'Ready-to-Wear', sub: [
      { label: 'All Ready-to-Wear', href: '/women/ready-to-wear' },
      { label: 'Dresses', href: '/women/ready-to-wear/dresses' },
      { label: 'Tops & Blouses', href: '/women/ready-to-wear/tops-blouses' },
      { label: 'Pants & Skirts', href: '/women/ready-to-wear/pants-skirts' },
      { label: 'Outerwear', href: '/women/ready-to-wear/outerwear' },
      { label: 'Knitwear', href: '/women/ready-to-wear/knitwear' },
    ]},
    { label: 'Jewelry', sub: [
      { label: 'All Jewelry', href: '/women/jewelry' },
      { label: 'Necklaces', href: '/women/jewelry/necklaces' },
      { label: 'Earrings', href: '/women/jewelry/earrings' },
      { label: 'Bracelets', href: '/women/jewelry/bracelets' },
      { label: 'Rings', href: '/women/jewelry/rings' },
      { label: 'Brooches', href: '/women/jewelry/brooches' },
    ]},
    { label: 'Accessories', sub: [
      { label: 'All Accessories', href: '/women/accessories' },
      { label: 'Sunglasses', href: '/women/accessories/sunglasses' },
      { label: 'Scarves & Shawls', href: '/women/accessories/scarves' },
      { label: 'Hats', href: '/women/accessories/hats' },
      { label: 'Belts', href: '/women/accessories/belts' },
      { label: 'Gloves', href: '/women/accessories/gloves' },
    ]},
  ]},
  men: { label: 'Men', items: [
    { label: 'Ready-to-Wear', sub: [
      { label: 'All Clothing', href: '/men/ready-to-wear' },
      { label: 'T-Shirts & Polos', href: '/men/ready-to-wear/t-shirts-polos' },
      { label: 'Shirts', href: '/men/ready-to-wear/shirts' },
      { label: 'Hoodies & Sweatshirts', href: '/men/ready-to-wear/hoodies-sweatshirts' },
      { label: 'Outerwear', href: '/men/ready-to-wear/outerwear' },
      { label: 'Pants & Trousers', href: '/men/ready-to-wear/pants-trousers' },
    ]},
    { label: 'Bags', sub: [
      { label: 'All Bags', href: '/men/bags' },
      { label: 'Briefcases', href: '/men/bags/briefcases' },
      { label: 'Backpacks', href: '/men/bags/backpacks' },
      { label: 'Messenger Bags', href: '/men/bags/messenger-bags' },
      { label: 'Totes', href: '/men/bags/totes' },
      { label: 'Crossbody Bags', href: '/men/bags/crossbody-bags' },
    ]},
    { label: 'Shoes', sub: [
      { label: 'All Shoes', href: '/men/shoes' },
      { label: 'Dress Shoes', href: '/men/shoes/dress' },
      { label: 'Sneakers', href: '/men/shoes/sneakers' },
      { label: 'Boots', href: '/men/shoes/boots' },
      { label: 'Loafers', href: '/men/shoes/loafers' },
      { label: 'Sandals', href: '/men/shoes/sandals' },
    ]},
    { label: 'Accessories', sub: [
      { label: 'All Accessories', href: '/men/accessories' },
      { label: 'Ties', href: '/men/accessories/ties' },
      { label: 'Belts', href: '/men/accessories/belts' },
      { label: 'Wallets', href: '/men/accessories/wallets' },
      { label: 'Sunglasses', href: '/men/accessories/sunglasses' },
      { label: 'Watches', href: '/men/accessories/watches' },
    ]},
  ]},
  smallLeatherGoods: { label: 'Small Leather Goods', items: [
    { label: 'Women', sub: [
      { label: 'All Women\'s SLG', href: '/small-leather-goods/women' },
      { label: 'Wallets', href: '/small-leather-goods/women/wallets' },
      { label: 'Card Holders', href: '/small-leather-goods/women/card-holders' },
      { label: 'Pouches', href: '/small-leather-goods/women/pouches' },
      { label: 'Key Holders', href: '/small-leather-goods/women/key-holders' },
      { label: 'Tech Accessories', href: '/small-leather-goods/women/tech-accessories' },
    ]},
    { label: 'Men', sub: [
      { label: 'All Men\'s SLG', href: '/small-leather-goods/men' },
      { label: 'Wallets', href: '/small-leather-goods/men/wallets' },
      { label: 'Card Holders', href: '/small-leather-goods/men/card-holders' },
      { label: 'Pouches', href: '/small-leather-goods/men/pouches' },
      { label: 'Key Holders', href: '/small-leather-goods/men/key-holders' },
      { label: 'Tech Accessories', href: '/small-leather-goods/men/tech-accessories' },
    ]},
  ]},
  travelLifestyle: { label: 'Travel & Lifestyle', items: [
    { label: 'Luggage', sub: [
      { label: 'All Luggage', href: '/travel-lifestyle/luggage' },
      { label: 'Hard Shell', href: '/travel-lifestyle/luggage/hard-shell' },
      { label: 'Soft Shell', href: '/travel-lifestyle/luggage/soft-shell' },
      { label: 'Carry-On', href: '/travel-lifestyle/luggage/carry-on' },
      { label: 'Checked', href: '/travel-lifestyle/luggage/checked' },
    ]},
    { label: 'Travel Bags', href: '/travel-lifestyle/travel-bags' },
    { label: 'Travel Accessories', href: '/travel-lifestyle/travel-accessories' },
    { label: 'Home & Living', href: '/travel-lifestyle/home-living' },
  ]},
  accessories: { label: 'Accessories', items: [
    { label: 'Women', sub: [
      { label: 'All Women’s Accessories', href: '/accessories/women' },
      { label: 'Belts', href: '/accessories/women/belts' },
      { label: 'Scarves & Shawls', href: '/accessories/women/scarves' },
      { label: 'Sunglasses', href: '/accessories/women/sunglasses' },
      { label: 'Hats & Hair Accessories', href: '/accessories/women/hats' },
      { label: 'Gloves', href: '/accessories/women/gloves' },
      { label: 'Fine Jewelry', href: '/accessories/women/jewelry' },
      { label: 'Tech Accessories', href: '/accessories/women/tech' },
    ]},
    { label: 'Men', sub: [
      { label: 'All Men’s Accessories', href: '/accessories/men' },
      { label: 'Belts', href: '/accessories/men/belts' },
      { label: 'Ties & Pocket Squares', href: '/accessories/men/ties' },
      { label: 'Sunglasses', href: '/accessories/men/sunglasses' },
      { label: 'Hats & Caps', href: '/accessories/men/hats' },
      { label: 'Wallets', href: '/accessories/men/wallets' },
      { label: 'Cufflinks', href: '/accessories/men/cufflinks' },
      { label: 'Gloves', href: '/accessories/men/gloves' },
    ]},
  ]},
  beauty: { label: 'Beauty', items: [
    { label: 'Makeup', sub: [
      { label: 'All Makeup', href: '/beauty/makeup' },
      { label: 'Lipstick', href: '/beauty/makeup/lipstick' },
      { label: 'Foundation & Concealer', href: '/beauty/makeup/foundation' },
      { label: 'Eyeshadow & Eyeliner', href: '/beauty/makeup/eyeshadow' },
      { label: 'Mascara', href: '/beauty/makeup/mascara' },
      { label: 'Blush & Highlighter', href: '/beauty/makeup/blush' },
      { label: 'Nails', href: '/beauty/makeup/nails' },
    ]},
    { label: 'Skincare', sub: [
      { label: 'All Skincare', href: '/beauty/skincare' },
      { label: 'Moisturizers & Creams', href: '/beauty/skincare/moisturizers' },
      { label: 'Serums & Treatments', href: '/beauty/skincare/serums' },
      { label: 'Cleansers & Toners', href: '/beauty/skincare/cleansers' },
      { label: 'Masks & Exfoliators', href: '/beauty/skincare/masks' },
      { label: 'Eye Care', href: '/beauty/skincare/eye-care' },
    ]},
    { label: 'Brushes & Tools', href: '/beauty/tools' },
    { label: 'New Arrivals', href: '/beauty/new-in' },
    { label: 'Best Sellers', href: '/beauty/best-sellers' },
  ]},
  fragrance: { label: 'Fragrance', items: [
    { label: 'All Fragrance', href: '/fragrance' },
    { label: 'Women’s Fragrance', sub: [
      { label: 'All Women’s', href: '/fragrance/women' },
      { label: 'Floral', href: '/fragrance/women/floral' },
      { label: 'Oriental', href: '/fragrance/women/oriental' },
      { label: 'Fresh', href: '/fragrance/women/fresh' },
      { label: 'New Arrivals', href: '/fragrance/women/new-in' },
    ]},
    { label: 'Men’s Fragrance', sub: [
      { label: 'All Men’s', href: '/fragrance/men' },
      { label: 'Woody', href: '/fragrance/men/woody' },
      { label: 'Citrus', href: '/fragrance/men/citrus' },
      { label: 'Spicy', href: '/fragrance/men/spicy' },
      { label: 'New Arrivals', href: '/fragrance/men/new-in' },
    ]},
    { label: 'Unisex Fragrance', href: '/fragrance/unisex' },
    { label: 'Home Fragrance', href: '/fragrance/home' },
    { label: 'Best Sellers', href: '/fragrance/best-sellers' },
  ]},
  limitedEditions: { label: 'Limited Editions', items: [
    { label: 'All Limited Editions', href: '/limited-editions' },
    { label: 'Capsule Collections', sub: [
      { label: 'View All Capsules', href: '/limited-editions/capsule' },
      { label: 'Spring/Summer 2025', href: '/limited-editions/capsule/ss25' },
      { label: 'Fall/Winter 2024', href: '/limited-editions/capsule/fw24' },
      { label: 'Holiday Collection', href: '/limited-editions/capsule/holiday' },
    ]},
    { label: 'Artist Collaborations', sub: [
      { label: 'View All Collaborations', href: '/limited-editions/collaborations' },
      { label: 'With Murakami', href: '/limited-editions/collaborations/murakami' },
      { label: 'With Yayoi Kusama', href: '/limited-editions/collaborations/kusama' },
      { label: 'With Jeff Koons', href: '/limited-editions/collaborations/koons' },
    ]},
    { label: 'Monogram Special Editions', sub: [
      { label: 'View All Special Editions', href: '/limited-editions/special' },
      { label: 'Multicolor Monogram', href: '/limited-editions/special/multicolor' },
      { label: 'Denim Editions', href: '/limited-editions/special/denim' },
      { label: 'Metallic & Exotic Leather', href: '/limited-editions/special/exotic' },
    ]},
    { label: 'New Arrivals', href: '/limited-editions/new-in' },
    { label: 'Coming Soon', href: '/limited-editions/coming-soon' },
  ]},
  giftsPersonalization: { label: 'Gifts & Personalization', items: [
    { label: 'Gift Ideas', href: '/gifts/gift-ideas' },
    { label: 'For Her', href: '/gifts/for-her' },
    { label: 'For Him', href: '/gifts/for-him' },
    { label: 'Monogramming', href: '/personalization/monogramming' },
    { label: 'Engraving', href: '/personalization/engraving' },
  ]},
};

// ==================== 4. 主菜单入口 ====================
export const mainMenuItems = [
  { label: 'New In', key: 'newIn' },
  { label: 'Women', key: 'women' },
  { label: 'Men', key: 'men' },
  { label: 'Small Leather Goods', key: 'smallLeatherGoods' },
  { label: 'Travel & Lifestyle', key: 'travelLifestyle' },
  { label: 'Accessories', key: 'accessories' },
  { label: 'Beauty', key: 'beauty' },
  { label: 'Fragrance', key: 'fragrance' },
  { label: 'Gifts & Personalization', key: 'giftsPersonalization' },
  { label: 'Limited Editions', key: 'limitedEditions' },
  { label: 'World of LJL', href: '/world-of-ljl' },
] as const;