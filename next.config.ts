
const nextConfig = {
    images: {
        unoptimized: true,
    },
    webpack: (config: any) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
};

export default nextConfig;
