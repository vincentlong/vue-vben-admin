#!/usr/bin/env node
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , rawName] = process.argv;

if (!rawName) {
  console.error('Usage: pnpm scaffold:module <ModuleName>');
  process.exit(1);
}

const kebabName = rawName
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/\s+/g, '-')
  .toLowerCase();

const viewDir = resolve(
  process.cwd(),
  'apps/web-ele/src/views',
  kebabName,
);

if (existsSync(viewDir)) {
  console.error(`目录 ${viewDir} 已存在，换一个模块名吧。`);
  process.exit(1);
}

mkdirSync(viewDir, { recursive: true });

const template = `<script setup lang="ts">
import { ref } from 'vue';

const title = ref('${rawName}');
</script>

<template>
  <div class="p-4">
    <ElCard shadow="never">
      <template #header>{{ title }}</template>
      <p>在此编写 ${rawName} 页面内容。</p>
    </ElCard>
  </div>
</template>
`;

writeFileSync(resolve(viewDir, 'index.vue'), template);

console.log(
  `已创建 ${viewDir}/index.vue，别忘了在 apps/web-ele/src/router/routes 中注册路由。`,
);
