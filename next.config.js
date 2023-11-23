/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
    output: 'export',
    assetPrefix: isProd ? 'https://cdn.jsdelivr.net/gh/YumiChen/3d-object-editor@gh-pages' : undefined,
}

module.exports = nextConfig
