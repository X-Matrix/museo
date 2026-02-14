module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'artic.edu' },
      { protocol: 'https', hostname: 'images.nypl.org' },
    ],
  },
  env: {
    WEB_PROXY_TOKEN: process.env.WEB_PROXY_TOKEN,
  },
}