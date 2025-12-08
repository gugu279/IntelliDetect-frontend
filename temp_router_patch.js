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
