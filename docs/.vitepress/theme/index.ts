import DefaultTheme from 'vitepress/theme'
import 'viewerjs/dist/viewer.min.css'
import imageViewer from 'vitepress-plugin-image-viewer'
import { useRoute } from 'vitepress'
// import './custom.css'

export default {
    ...DefaultTheme,
    setup() {
        // 获取路由
        const route = useRoute()
        // 使用图片查看器
        imageViewer(route)
    }
} 