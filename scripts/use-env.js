#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);
const command = args[0]; // dev 或 build
const envName = process.env.ENV_NAME;

if (!envName) {
  console.error('❌ 请指定环境名称，使用方式：');
  console.error('   ENV_NAME=your-env-name npm run dev:env');
  console.error('   ENV_NAME=your-env-name npm run build:env');
  console.error('');
  console.error('📁 可用的环境文件：');
  
  // 列出所有可用的环境文件
  const envFiles = fs.readdirSync(process.cwd())
    .filter(file => file.startsWith('env.') && !file.includes('.'))
    .map(file => file.replace('env.', ''));
  
  if (envFiles.length > 0) {
    envFiles.forEach(file => {
      console.error(`   - ${file}`);
    });
  } else {
    console.error('   (未找到任何 env.* 文件)');
  }
  
  process.exit(1);
}

const envFile = `env.${envName}`;
const envLocalFile = '.env.local';

// 检查环境文件是否存在
if (!fs.existsSync(envFile)) {
  console.error(`❌ 环境文件 ${envFile} 不存在`);
  console.error('请确保文件存在，或使用正确的环境名称');
  process.exit(1);
}

try {
  // 复制环境文件到 .env.local
  fs.copyFileSync(envFile, envLocalFile);
  console.log(`✅ 已加载环境配置: ${envFile}`);
  
  // 显示环境文件内容（前几行）
  const content = fs.readFileSync(envFile, 'utf8');
  const lines = content.split('\n').slice(0, 5);
  console.log('📋 环境配置预览:');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      console.log(`   ${line}`);
    }
  });
  
  // 执行 Next.js 命令
  console.log(`🚀 启动 ${command} 模式...`);
  execSync(`next ${command}`, { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ 执行失败:', error.message);
  process.exit(1);
}
