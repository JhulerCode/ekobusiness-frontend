const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
	transpileDependencies: true,
	pwa: {
		name: "Eko Business App",
		themeColor: "#2c47aa",
		display: "standalone",
		manifestOptions: {
			background_color: "#ffffff",
			start_url: "/signin",
		},
		iconPaths: {
			favicon32: 'img/icons/favicon.ico',
		}
	}
})