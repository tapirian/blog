import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'

//每页的文章数量
const pageSize = 10

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
    title: '一介白衣ing',
    base: '/',
    cacheDir: './node_modules/vitepress_cache',
    description: 'vitepress,blog,blog-theme',
    ignoreDeadLinks: true,
    themeConfig: {
        posts: await getPosts(pageSize),
        website: 'https://github.com/airene/vitepress-blog-pure', //copyright link
        // 评论的仓库地址 https://giscus.app/ 请按照这个官方初始化后覆盖
        comment: {
            repo: 'airene/vitepress-blog-pure',
            repoId: 'MDEwOlJlcG9zaXRvcnkzODIyMjY5Nzg',
            categoryId: 'DIC_kwDOFshSIs4CpZga'
        },
        nav: [
            { text: '主页', link: '/' },
            { text: '分类', link: '/pages/category' },
            { text: '归档', link: '/pages/archives' },
            { text: '标签', link: '/pages/tags' },
            { text: '关于', link: '/pages/about' }
        ],
        search: {
            provider: 'local'
        },
        //outline:[2,3],
        outline: {
            label: '文章摘要'
        },
        socialLinks: [{ icon: 'github', link: 'https://github.com/airene/vitepress-blog-pure' }]
    } as any,

    srcExclude: isProd
        ? [
              '**/trash/**/*.md', // 排除所有 trash 目录
              '**/draft/**/*.md', // 递归排除子目录
              '**/private-notes/*.md', // 排除特定文件
              'README.md'
          ]
        : ['README.md'],
    vite: {
        //build: { minify: false }
        server: { port: 5000 }
    }
    /*
      optimizeDeps: {
          keepNames: true
      }
      */
})
