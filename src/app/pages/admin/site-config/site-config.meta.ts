export const SITE_CONFIG_META: Record<string, any> = {
  siteName: { label: 'Site Name', type: 'text', group: 'Branding' },
  logoUrl: { label: 'Logo URL', type: 'text', group: 'Branding' },

  enableCheckout: { label: 'Enable Checkout', type: 'boolean', group: 'Checkout' },
  enableCOD: { label: 'Enable COD', type: 'boolean', group: 'Checkout' },
  currency: { label: 'Currency', type: 'select', options: ['PHP', 'USD'], group: 'Checkout' },

  'shipping.baseFee': {
    label: 'Base Shipping Fee',
    type: 'number',
    group: 'Shipping',
    placeholder: '100',
    help: 'Default shipping fee when no province rule applies.'
  },

  'shipping.freeThreshold': {
    label: 'Free Shipping Threshold',
    type: 'number',
    group: 'Shipping',
    placeholder: '2000',
    help: 'Orders above this subtotal receive free shipping.'
  },

  'shipping.sameProvinceFee': {
    label: 'Same Province Fee',
    type: 'number',
    group: 'Shipping',
    placeholder: '50',
    help: 'Shipping fee if customer is in the same province.'
  },

  'shipping.otherProvinceFee': {
    label: 'Other Province Fee',
    type: 'number',
    group: 'Shipping',
    placeholder: '120',
    help: 'Shipping fee if customer is in a different province.'
  },

  'shipping.enableFreeShipping': {
    label: 'Enable Free Shipping',
    type: 'boolean',
    group: 'Shipping',
    help: 'Allow free shipping when threshold is reached.'
  },

  trust_badges: { label: 'Trust Badges', type: 'array', group: 'Product Page' },
  delivery_info: { label: 'Delivery Info', type: 'array', group: 'Product Page' },
};

export const SITE_CONFIG_GROUP_UI: Record<string, any> = {
  Branding: {
    icon: 'mdi mdi-palette',
    subtitle: 'Logo, name, and identity'
  },
  Checkout: {
    icon: 'mdi mdi-cart',
    subtitle: 'Payment and order settings'
  },

  Shipping: {
    icon: 'mdi mdi-truck-delivery',
    subtitle: 'Configure shipping fees and free shipping rules'
  },

  'Product Page': {
    icon: 'mdi mdi-tag-multiple',
    subtitle: 'Product display enhancements'
  },
  Other: {
    icon: 'mdi mdi-cog',
    subtitle: 'Miscellaneous settings'
  }
};