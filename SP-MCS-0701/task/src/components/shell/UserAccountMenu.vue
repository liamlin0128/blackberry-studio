<script setup lang="ts">
import { ArrowDown, Bell, Lock, SwitchButton, UserFilled } from '@element-plus/icons-vue'
import { ElAvatar, ElButton, ElDialog, ElForm, ElFormItem, ElIcon, ElInput, ElMessage, ElMessageBox, ElPopover } from 'element-plus'
import { reactive, ref } from 'vue'

const visible = ref(new URLSearchParams(window.location.search).get('accountMenu') === 'open')
const passwordVisible = ref(false)
const passwordForm = reactive({ current: '', next: '', confirm: '' })

function openAccountSecurity() {
  visible.value = false
  Object.assign(passwordForm, { current: '', next: '', confirm: '' })
  passwordVisible.value = true
}

function savePassword() {
  if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) return ElMessage.warning('请完整填写密码信息')
  if (passwordForm.next !== passwordForm.confirm) return ElMessage.error('两次输入的新密码不一致')
  passwordVisible.value = false
  ElMessage.success('密码已修改')
}

function requestLogout() {
  visible.value = false
  void ElMessageBox.confirm('确认退出当前登录账号吗？', '退出登录', {
    confirmButtonText: '退出登录',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => ElMessage.success('已退出登录'))
    .catch(() => false)
}
</script>

<template>
  <div class="user-area">
    <el-icon class="notice-icon" aria-label="通知"><Bell /></el-icon>
    <el-popover
      v-model:visible="visible"
      placement="bottom-end"
      :width="320"
      trigger="click"
      popper-class="user-account-popper"
      :popper-style="{ padding: '0' }"
    >
      <template #reference>
        <button class="user-trigger" type="button" :aria-expanded="visible" aria-label="打开用户账户菜单">
          <el-avatar class="header-avatar" :size="26"><el-icon><UserFilled /></el-icon></el-avatar>
          <span class="user-name">演示用户</span>
          <el-icon class="trigger-arrow"><ArrowDown /></el-icon>
        </button>
      </template>

      <section class="account-card" aria-label="用户账户">
        <div class="account-profile">
          <el-avatar class="profile-avatar" :size="54"><el-icon :size="29"><UserFilled /></el-icon></el-avatar>
          <div>
            <strong>演示用户</strong>
            <small>姓名：演示用户</small>
          </div>
        </div>
        <div class="account-actions">
          <button type="button" @click="openAccountSecurity">
            <el-icon><Lock /></el-icon><span>账号管理</span>
          </button>
          <button type="button" @click="requestLogout">
            <el-icon><SwitchButton /></el-icon><span>退出登录</span>
          </button>
        </div>
      </section>
    </el-popover>
    <el-dialog v-model="passwordVisible" title="修改密码" width="460px" destroy-on-close>
      <el-form label-width="96px">
        <el-form-item label="当前密码" required><el-input v-model="passwordForm.current" type="password" show-password autocomplete="current-password" /></el-form-item>
        <el-form-item label="新密码" required><el-input v-model="passwordForm.next" type="password" show-password autocomplete="new-password" /></el-form-item>
        <el-form-item label="确认新密码" required><el-input v-model="passwordForm.confirm" type="password" show-password autocomplete="new-password" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="passwordVisible = false">取消</el-button><el-button type="primary" @click="savePassword">修改</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-area { display: flex; height: 100%; margin-left: auto; align-items: center; gap: 12px; padding: 0 18px; color: #b8c6d6; font-size: 12px; }
.notice-icon { color: #9fb0c2; }
.user-trigger { display: inline-flex; height: 38px; align-items: center; gap: 8px; padding: 0 7px; color: #d9e3ee; border: 1px solid transparent; border-radius: 6px; background: transparent; cursor: pointer; transition: color .18s ease,background-color .18s ease,border-color .18s ease; }
.user-trigger:hover,.user-trigger[aria-expanded="true"] { color: #fff; border-color: #7ca4d22e; background: #ffffff0a; }
.header-avatar { color: #5d7188; background: #e8f1fb; }
.trigger-arrow { color: #8699ad; font-size: 12px; transition: transform .18s ease; }
.user-trigger[aria-expanded="true"] .trigger-arrow { transform: rotate(180deg); }
.account-card { overflow: hidden; border-radius: 7px; background: #fff; box-shadow: 0 16px 38px #1734562e; }
.account-profile { display: flex; align-items: center; gap: 16px; padding: 22px 22px 18px; }
.profile-avatar { flex: none; color: #fff; background: #74a0ee; }
.account-profile strong,.account-profile small { display: block; }.account-profile strong { color: #202833; font-size: 15px; font-weight: 600; }.account-profile small { margin-top: 7px; color: #7f8996; font-size: 12px; }
.account-actions { display: grid; grid-template-columns: 1fr 1fr; margin: 0 14px; padding: 12px 0 13px; border-top: 1px dashed #e0e5eb; }
.account-actions button { display: flex; height: 36px; align-items: center; justify-content: center; gap: 9px; padding: 0; color: #252d37; border: 0; background: transparent; cursor: pointer; font-size: 14px; font-weight: 600; transition: color .18s ease,background-color .18s ease; }
.account-actions button+button { border-left: 1px solid #e1e5ea; }
.account-actions button:hover { color: #165dff; background: #f6f9ff; }
.account-actions .el-icon { font-size: 20px; }
@media (max-width: 1100px) { .user-area { gap: 8px; padding: 0 12px; }.user-name,.header-avatar { display: none; } }
</style>
