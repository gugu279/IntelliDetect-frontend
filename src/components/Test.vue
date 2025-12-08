<template>
  <div>
    <h1>测试页面</h1>
    <p>路由工作正常！</p>
    <button @click="goToDashboard">前往Dashboard</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>
EOF

# 在router.ts中添加测试路由
cat > temp_router_patch.js << 'EOF'
const fs = require('fs')
const routerPath = 'src/router.ts'
let content = fs.readFileSync(routerPath, 'utf8')

// 添加导入
content = content.replace(
  "import UserInfo from './components/UserInfo.vue'",
  "import UserInfo from './components/UserInfo.vue'\nimport Test from './components/Test.vue'"
)

// 添加路由
const routesEnd = ']\n\nconst router = createRouter({'
content = content.replace(
  '  {\n    path: \'/user/:id\',\n    name: \'UserInfo\',\n    component: UserInfo,\n    props: true,\n    meta: { requiresAuth: false }\n  }\n]',
  `  {
    path: '/user/:id',
    name: 'UserInfo',
    component: UserInfo,
    props: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
  }
]`
)

fs.writeFileSync(routerPath, content)
console.log('已添加测试路由')