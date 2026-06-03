<template>
  <div class="json-format">
    <div class="toolbar">
      <el-button type="primary" @click="handleFormat">格式化</el-button>
      <el-button @click="handleCompress">压缩</el-button>
      <el-button @click="handleCopy">复制结果</el-button>
      <el-button @click="handleClear">清空</el-button>
    </div>
    <div class="editor-area">
      <div class="editor-left">
        <div class="panel-title">输入 JSON</div>
        <el-input
          v-model="inputJson"
          type="textarea"
          :rows="20"
          placeholder="请在此粘贴或输入 JSON 内容..."
          class="json-textarea"
        />
      </div>
      <div class="editor-right">
        <div class="panel-title">格式化结果</div>
        <div class="output-panel">
          <pre v-if="outputHtml" class="json-output" v-html="outputHtml" />
          <div v-else class="output-placeholder">格式化结果将在此显示</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const inputJson = ref('')
const outputHtml = ref('')

function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number'
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string'
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean'
        } else if (/null/.test(match)) {
          cls = 'json-null'
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
}

function handleFormat() {
  const raw = inputJson.value.trim()
  if (!raw) {
    ElMessage.warning('请先输入 JSON 内容')
    return
  }
  try {
    const parsed = JSON.parse(raw)
    const formatted = JSON.stringify(parsed, null, 2)
    outputHtml.value = syntaxHighlight(formatted)
  } catch (e) {
    ElMessage.error('JSON 格式错误：' + e.message)
  }
}

function handleCompress() {
  const raw = inputJson.value.trim()
  if (!raw) {
    ElMessage.warning('请先输入 JSON 内容')
    return
  }
  try {
    const parsed = JSON.parse(raw)
    const compressed = JSON.stringify(parsed)
    outputHtml.value = syntaxHighlight(compressed)
  } catch (e) {
    ElMessage.error('JSON 格式错误：' + e.message)
  }
}

async function handleCopy() {
  if (!outputHtml.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  const text = outputHtml.value.replace(/<[^>]+>/g, '')
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

function handleClear() {
  inputJson.value = ''
  outputHtml.value = ''
}
</script>

<style scoped>
.json-format {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
.toolbar {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.editor-area {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}
.editor-left,
.editor-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.json-textarea :deep(.el-textarea__inner) {
  height: 100%;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
}
.output-panel {
  flex: 1;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: auto;
  padding: 16px;
}
.json-output {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-all;
}
.output-placeholder {
  color: #666;
  font-size: 14px;
  text-align: center;
  padding-top: 40px;
}
</style>

<style>
.json-key { color: #9cdcfe; }
.json-string { color: #ce9178; }
.json-number { color: #b5cea8; }
.json-boolean { color: #569cd6; }
.json-null { color: #569cd6; }
</style>
