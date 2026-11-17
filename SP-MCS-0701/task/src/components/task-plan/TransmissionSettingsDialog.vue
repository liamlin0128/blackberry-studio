<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElAlert, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElRadio, ElRadioGroup } from 'element-plus'
defineProps<{visible:boolean}>(); const emit=defineEmits<{ 'update:visible':[value:boolean] }>()
const form=reactive({regularMode:'固定时间发送',regularHours:'24',emergencyMode:'不固定时间发送'}); const saving=ref(false)
async function save(){saving.value=true;await new Promise(r=>window.setTimeout(r,450));saving.value=false;ElMessage.success('发送设置已保存');emit('update:visible',false)}
</script>
<template><el-dialog :model-value="visible" title="计划发送设置" width="680px" @update:model-value="emit('update:visible',$event)"><el-alert title="真实生效范围与固定时间联动规则待确认" type="info" :closable="false" show-icon/><el-form class="transmission-settings" label-width="112px">
  <h3>常规计划</h3><el-form-item label="发送方式"><el-radio-group v-model="form.regularMode"><el-radio value="固定时间发送">固定时间发送</el-radio><el-radio value="不固定时间发送">不固定时间发送</el-radio><el-radio value="手动发送">手动发送</el-radio></el-radio-group></el-form-item><el-form-item label="发送计划范围"><el-input v-model="form.regularHours"><template #append>小时，距离最晚上星时间</template></el-input></el-form-item>
  <h3>紧急计划</h3><el-form-item label="发送方式"><el-radio-group v-model="form.emergencyMode"><el-radio value="不固定时间发送">不固定时间发送</el-radio><el-radio value="手动发送">手动发送</el-radio></el-radio-group></el-form-item><el-form-item label="发送计划范围"><span>立即发送</span></el-form-item>
</el-form><template #footer><el-button @click="emit('update:visible',false)">关闭</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template></el-dialog></template>
