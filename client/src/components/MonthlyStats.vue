<template>
  <div class="stats">
    <div class="stat-card income">
      <div class="stat-icon">↑</div>
      <div class="stat-info">
        <div class="label">收入</div>
        <div class="amount">¥{{ Number(stats.income).toFixed(2) }}</div>
      </div>
    </div>
    <div class="stat-card expense">
      <div class="stat-icon">↓</div>
      <div class="stat-info">
        <div class="label">支出</div>
        <div class="amount">¥{{ Number(stats.expense).toFixed(2) }}</div>
      </div>
    </div>
    <div class="stat-card balance">
      <div class="stat-icon">=</div>
      <div class="stat-info">
        <div class="label">结余</div>
        <div class="amount">¥{{ Number(stats.balance).toFixed(2) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ stats: Object })
</script>

<style scoped>
.stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  color: #fff;
}
.stat-card.income { background: linear-gradient(135deg, #43a047, #66bb6a); }
.stat-card.expense { background: linear-gradient(135deg, #e53935, #ef5350); }
.stat-card.balance { background: linear-gradient(135deg, #1e88e5, #42a5f5); }
.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}
.stat-info { min-width: 0; }
.label { font-size: 12px; opacity: 0.85; }
.amount { font-size: 18px; font-weight: bold; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
