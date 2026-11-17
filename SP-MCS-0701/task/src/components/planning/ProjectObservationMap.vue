<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElAlert, ElButton, ElCheckbox, ElInputNumber, ElMessage, ElOption, ElSelect, ElTag } from 'element-plus'
import { adminCenters, gansuOutline, mockPasses } from '../../mocks/projectMap'
import type { Target } from '../../types/projectRequirement'

const props = defineProps<{ target: Target | null; payloads: string[]; pointOnly: boolean }>()
const emit = defineEmits<{ 'update:target': [value: Target | null] }>()
const mode = ref<'point' | 'polygon' | 'administrative'>('point')
const draft = ref<[number, number][]>([])
const lon = ref<number | undefined>()
const lat = ref<number | undefined>()
const areaLon = ref<number | undefined>()
const areaLat = ref<number | undefined>()
const province = ref('')
const city = ref('')
const district = ref('')
const entryOpen = ref(false)
const showTrack = ref(true)
const showPass = ref(true)
const cursor = ref<[number, number] | null>(null)
const zoom = ref(1)
const selectedPass = ref<number | null>(null)
const localDate = (value: Date) => { const d = new Date(value.getTime() - value.getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16) }
const startDefault = new Date(); startDefault.setHours(0, 0, 0, 0)
const endDefault = new Date(startDefault); endDefault.setDate(endDefault.getDate() + 2); endDefault.setHours(23, 59)
const passStart = ref(localDate(startDefault))
const passEnd = ref(localDate(endDefault))
const validPassRange = computed(() => passStart.value && passEnd.value && new Date(passEnd.value) > new Date(passStart.value))
const xy = ([x, y]: [number, number]) => `${(x - 92) / 18 * 1000},${(43 - y) / 11 * 620}`
const xOf = (value: number) => (value - 92) / 18 * 1000
const yOf = (value: number) => (43 - value) / 11 * 620
const adminCenter = computed<[number, number]>(() => {
  const selectedProvince = adminCenters[province.value]
  const selectedCity = selectedProvince?.[city.value]
  if (district.value && selectedCity?.[district.value]) return selectedCity[district.value]
  const points = selectedCity ? Object.values(selectedCity) : selectedProvince ? Object.values(selectedProvince).flatMap(districts => Object.values(districts)) : []
  return points.length ? [points.reduce((sum, point) => sum + point[0], 0) / points.length, points.reduce((sum, point) => sum + point[1], 0) / points.length] : [100.5, 38]
})
const adminPreview = computed<[number, number][]>(() => { const c = adminCenter.value; const span = !province.value ? 6 : !city.value ? 1.4 : !district.value ? .48 : .16; return [[c[0]-span,c[1]-span*.75],[c[0],c[1]-span],[c[0]+span,c[1]-span*.75],[c[0]+span,c[1]+span*.75],[c[0],c[1]+span],[c[0]-span,c[1]+span*.75]] })
const targetPoints = computed<[number, number][]>(() => props.target?.kind === 'point' ? [props.target.coordinates] : props.target?.kind === 'polygon' ? props.target.coordinates : props.target?.kind === 'administrative' ? adminPreview.value : [])
const center = computed<[number, number]>(() => targetPoints.value.length ? [targetPoints.value.reduce((sum,p)=>sum+p[0],0)/targetPoints.value.length,targetPoints.value.reduce((sum,p)=>sum+p[1],0)/targetPoints.value.length] : [100.5,38])
const area = computed(() => { const p=targetPoints.value; if(p.length<3)return null; let total=0; for(let i=0;i<p.length;i++){const j=(i+1)%p.length;total+=p[i][0]*p[j][1]-p[j][0]*p[i][1]}return Math.abs(total/2)*111.32*Math.cos(center.value[1]*Math.PI/180)*110.57 })
const aoiSummary = computed(() => props.target ? props.target.kind === 'administrative' ? `AOI：行政区 · ${props.target.name}` : `AOI：${props.target.kind==='point'?'目标点':'绘制区域'} · 中心 ${center.value[0].toFixed(4)}°E, ${center.value[1].toFixed(4)}°N · ${area.value===null?'无面积':`参考面积 ${area.value.toFixed(0)} km²`}` : '尚未选择目标区域 AOI · 必填')
const passes = computed(() => props.target && validPassRange.value ? mockPasses(new Date(passStart.value), new Date(passEnd.value), center.value) : [])
const stripWidth = computed(() => props.payloads.includes('宽幅相机') ? 48 : props.payloads.includes('可见光') ? 36 : 18)
const trackShape = (longitude: number) => { const ax=xOf(longitude+.9),ay=yOf(43.5),bx=xOf(longitude-.9),by=yOf(31.5),dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1,nx=-dy/len*stripWidth.value/2,ny=dx/len*stripWidth.value/2; return `${ax+nx},${ay+ny} ${ax-nx},${ay-ny} ${bx-nx},${by-ny} ${bx+nx},${by+ny}` }
const dateText = (d: Date) => new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(d).replaceAll('/','-')
const coordValid = (x: number | undefined, y: number | undefined) => x !== undefined && y !== undefined && x >= -180 && x <= 180 && y >= -90 && y <= 90
watch(() => props.pointOnly, value => { if(value){mode.value='point';entryOpen.value=false;draft.value=[];if(props.target?.kind !== 'point')emit('update:target',null)} })
watch(passes, value => { selectedPass.value=value.length ? 0 : null })
watch(province, () => { city.value=''; district.value='' })
watch(city, () => { district.value='' })
function selectMode(value: typeof mode.value) { if(props.pointOnly && value !== 'point') return; mode.value=value;entryOpen.value=true;draft.value=[] }
function setPoint() { if(!coordValid(lon.value,lat.value))return ElMessage.warning('请输入有效经纬度'); emit('update:target',{kind:'point',coordinates:[lon.value!,lat.value!]});ElMessage.success('目标点已设置') }
function addVertex() { if(!coordValid(areaLon.value,areaLat.value))return ElMessage.warning('请输入有效经纬度');draft.value.push([areaLon.value!,areaLat.value!]);areaLon.value=undefined;areaLat.value=undefined }
function updateVertex(index:number, axis:0|1, value:number|undefined){if(value===undefined || Math.abs(value)>(axis===0?180:90)){ElMessage.warning(axis===0?'经度需在 -180～180°':'纬度需在 -90～90°');return}draft.value[index][axis]=value }
function closePolygon(){if(draft.value.length<3)return ElMessage.warning('多边形至少需要 3 个顶点');emit('update:target',{kind:'polygon',coordinates:[...draft.value]});draft.value=[];entryOpen.value=false;ElMessage.success('多边形已生成')}
function addAdmin(){const name=['中国',province.value,city.value,district.value].filter(Boolean).join('·');emit('update:target',{kind:'administrative',name});entryOpen.value=false;ElMessage.success(`已选择${name}`)}
function clear(){emit('update:target',null);draft.value=[];lon.value=undefined;lat.value=undefined;areaLon.value=undefined;areaLat.value=undefined;selectedPass.value=null}
function mapCoord(event: MouseEvent):[number,number] { const rect=(event.currentTarget as SVGElement).getBoundingClientRect(); const screenX=(event.clientX-rect.left)/rect.width*1000,screenY=(event.clientY-rect.top)/rect.height*620;return [Number((92+((screenX-500)/zoom.value+500)/1000*18).toFixed(4)),Number((43-((screenY-310)/zoom.value+310)/620*11).toFixed(4))] }
function onClick(event:MouseEvent){if(event.detail>1)return;const p=mapCoord(event);if(mode.value==='point'){lon.value=p[0];lat.value=p[1];emit('update:target',{kind:'point',coordinates:p})}else if(mode.value==='polygon')draft.value.push(p)}
function onMove(event:MouseEvent){cursor.value=mapCoord(event)}
function onContext(event:MouseEvent){event.preventDefault();if(mode.value==='polygon')draft.value.pop()}
function onDouble(event:MouseEvent){if(mode.value==='polygon'){event.preventDefault();if(draft.value.length>=3)closePolygon()}}
</script>

<template>
  <div class="observation-map">
    <div class="map-toolbar">
      <div class="mode-buttons"><el-button :type="mode==='point'?'primary':'default'" @click="selectMode('point')">目标点</el-button><el-button :disabled="pointOnly" :type="mode==='polygon'?'primary':'default'" @click="selectMode('polygon')">绘制区域</el-button><el-button :disabled="pointOnly" :type="mode==='administrative'?'primary':'default'" @click="selectMode('administrative')">行政区</el-button></div>
      <div class="layers"><el-checkbox v-model="showTrack">星下点轨迹</el-checkbox><el-checkbox v-model="showPass">过境时间窗</el-checkbox></div>
      <span class="map-reference">轨道持续变动 · 过境机会仅供参考</span>
    </div>
    <div class="map-stage">
      <svg viewBox="0 0 1000 620" preserveAspectRatio="none" role="img" aria-label="模拟地图：点击选点或添加多边形顶点" @mousemove="onMove" @click="onClick" @dblclick="onDouble" @contextmenu="onContext">
        <defs><pattern id="project-map-grid" width="111.11" height="112.72" patternUnits="userSpaceOnUse"><path d="M 111.11 0 L 0 0 0 112.72" fill="none" stroke="#ccd8e4" stroke-width="1" /></pattern></defs>
        <g :transform="`translate(${500*(1-zoom)} ${310*(1-zoom)}) scale(${zoom})`">
          <rect width="1000" height="620" fill="#f2f6fa"/><rect width="1000" height="620" fill="url(#project-map-grid)"/>
          <polygon :points="gansuOutline.map(xy).join(' ')" fill="#dceaf7" stroke="#8bb4da" stroke-width="2" stroke-dasharray="6 4"/>
          <text :x="xOf(100.5)" :y="yOf(38.5)" text-anchor="middle" fill="#667f99" font-size="24">甘肃省 · 示意</text>
          <template v-for="(pass,index) in passes" :key="pass.id">
            <polygon v-if="showPass" :points="trackShape(pass.longitude)" :fill="selectedPass===index?'#f6a54688':'#f6a54644'" :stroke="selectedPass===index?'#e58a11':'#eab868'" stroke-width="2"/>
            <line v-if="showTrack" :x1="xOf(pass.longitude+.9)" :y1="yOf(43.5)" :x2="xOf(pass.longitude-.9)" :y2="yOf(31.5)" :stroke="selectedPass===index?'#1672c7':'#63a6df'" :stroke-width="selectedPass===index?4:2" :stroke-dasharray="selectedPass===index?'':'7 8'"/>
          </template>
          <polygon v-if="targetPoints.length>=3" :points="targetPoints.map(xy).join(' ')" fill="#e8454540" stroke="#dc4242" stroke-width="3"/>
          <circle v-if="target?.kind==='point'" :cx="xOf(target.coordinates[0])" :cy="yOf(target.coordinates[1])" r="8" fill="#dc4242" stroke="white" stroke-width="3"/>
          <polyline v-if="draft.length" :points="draft.map(xy).join(' ')" fill="none" stroke="#ee9325" stroke-width="3" stroke-dasharray="8 5"/>
          <circle v-for="(p,i) in draft" :key="i" :cx="xOf(p[0])" :cy="yOf(p[1])" r="5" fill="#ee9325" stroke="white" stroke-width="2"/>
        </g>
      </svg>
      <div v-if="entryOpen" class="map-entry-panel">
        <div class="entry-heading"><strong>{{ mode==="point"?"目标点坐标":mode==="polygon"?"绘制区域（多边形）":"行政区边界选择" }}</strong><el-button text aria-label="关闭目标输入控件" @click="entryOpen=false">×</el-button></div>
        <p v-if="mode==='point'" class="entry-help">点击地图选点，或输入经纬度定位目标。</p>
        <p v-else-if="mode==='polygon'" class="entry-help">点击地图添加顶点，也可输入坐标；至少 3 个顶点后闭合。</p>
        <div v-if="mode==='point'||mode==='polygon'" class="coordinate-pair">
          <label><span>经度（°）</span><el-input-number v-if="mode==='point'" v-model="lon" :controls="false" :min="-180" :max="180" :precision="4" placeholder="-180～180"/><el-input-number v-else v-model="areaLon" :controls="false" :min="-180" :max="180" :precision="4" placeholder="-180～180"/></label>
          <label><span>纬度（°）</span><el-input-number v-if="mode==='point'" v-model="lat" :controls="false" :min="-90" :max="90" :precision="4" placeholder="-90～90"/><el-input-number v-else v-model="areaLat" :controls="false" :min="-90" :max="90" :precision="4" placeholder="-90～90"/></label>
        </div>
        <div v-if="mode==='point'" class="entry-actions"><el-button type="primary" @click="setPoint">确认坐标</el-button></div>
        <template v-if="mode==='polygon'"><div class="entry-actions"><el-button @click="addVertex">添加顶点</el-button><el-button :disabled="!draft.length" @click="draft.pop()">撤销上一步</el-button></div><div class="vertex-heading"><strong>已添加顶点</strong><span>{{ draft.length }} 个</span></div><div class="vertex-list"><span v-if="!draft.length" class="vertex-empty">可在地图中点击，或输入坐标添加</span><div v-for="(p,i) in draft" :key="i" class="vertex-row"><span class="vertex-index">{{ String(i+1).padStart(2,'0') }}</span><el-input-number :model-value="p[0]" :controls="false" :min="-180" :max="180" :precision="4" aria-label="顶点经度" @change="value=>updateVertex(i,0,value)"/><el-input-number :model-value="p[1]" :controls="false" :min="-90" :max="90" :precision="4" aria-label="顶点纬度" @change="value=>updateVertex(i,1,value)"/><el-button text type="danger" @click="draft.splice(i,1)">删除</el-button></div></div><div class="entry-footer"><el-button type="primary" :disabled="draft.length<3" @click="closePolygon">完成闭合</el-button></div></template>
        <div v-if="mode==='administrative'" class="admin-entry"><div class="admin-grid"><el-select model-value="中国" disabled><el-option label="中国" value="中国"/></el-select><el-select v-model="province" placeholder="选择省"><el-option v-for="item in Object.keys(adminCenters)" :key="item" :label="item" :value="item"/></el-select><el-select v-model="city" placeholder="选择市" :disabled="!province"><el-option v-for="item in Object.keys(adminCenters[province]||{})" :key="item" :label="item" :value="item"/></el-select><el-select v-model="district" placeholder="选择区县" :disabled="!city"><el-option v-for="item in Object.keys(adminCenters[province]?.[city]||{})" :key="item" :label="item" :value="item"/></el-select></div><p>可直接确认中国，或继续选择省、市、区县。</p><el-button type="primary" @click="addAdmin">确认行政区</el-button></div>
      </div>
    <section v-if="target && showPass" class="pass-section"><div class="pass-heading"><strong>过境机会清单 <el-tag size="small" type="info">{{ passes.length }} 次</el-tag></strong><span>点击过境机会查看覆盖范围</span></div><div class="pass-range"><label>计算范围（北京时间 UTC+8）</label><input v-model="passStart" type="datetime-local" aria-label="过境开始时间"/><span>至</span><input v-model="passEnd" type="datetime-local" aria-label="过境结束时间"/></div><el-alert v-if="!validPassRange" title="结束时间须晚于开始时间" type="warning" :closable="false"/><div v-if="!target" class="pass-empty">选择 AOI 后生成过境机会</div><div v-else-if="!passes.length" class="pass-empty">当前时间范围内无过境机会</div><div v-else class="pass-list"><button v-for="(pass,i) in passes" :key="pass.id" class="pass-item" :class="{selected:selectedPass===i}" @click="selectedPass=selectedPass===i?null:i"><span class="pass-index">{{ pass.id }}</span><span><strong>甘肃资源环境小卫星</strong><small>{{ dateText(pass.start) }} → {{ dateText(pass.end).slice(-8) }}</small></span><span class="pass-area">{{ pass.areaM2.toLocaleString('en-US') }} m²</span></button></div></section>
      <el-alert class="aoi-overlay" :title="aoiSummary" type="info" :closable="false" show-icon/>
      <div class="map-hud">光标 {{ cursor ? `${cursor[0].toFixed(2)}°E · ${cursor[1].toFixed(2)}°N` : '--' }}</div>
      <div class="map-tools"><el-button size="small" title="放大" @click="zoom=Math.min(zoom*1.4,4)">＋</el-button><el-button size="small" title="缩小" @click="zoom=Math.max(zoom*.72,1)">－</el-button><el-button size="small" title="复位" @click="zoom=1">复位</el-button><el-button size="small" title="清除 AOI" @click="clear">清除</el-button></div>
      <div v-if="mode==='polygon'" class="map-draw-hint">点击地图添加顶点 · 双击或按钮完成闭合 · 右键撤销</div>
    </div>


  </div>
</template>

<style scoped>
.observation-map{display:grid;gap:14px;min-width:0}.map-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mode-buttons{display:flex;gap:4px}.mode-buttons .el-button{margin:0}.layers{display:flex;gap:10px;align-items:center}.layers :deep(.el-checkbox){margin:0}.map-reference{color:var(--sp-color-text-muted);font-size:11px}.map-stage{position:relative;height:420px;overflow:hidden;border:1px solid var(--sp-color-border);border-radius:6px;background:#f2f6fa}.map-stage svg{display:block;width:100%;height:100%;cursor:crosshair}.map-hud,.map-draw-hint{position:absolute;left:12px;padding:5px 9px;border-radius:4px;color:#385775;background:#ffffffe8;font-size:11px}.map-hud{top:12px}.map-draw-hint{bottom:12px}.map-tools{position:absolute;right:10px;top:10px;display:grid;gap:4px}.map-tools .el-button{margin:0}.observation-coordinate-controls,.vertex-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.observation-coordinate-controls>span{font-weight:600;font-size:12px}.observation-coordinate-controls :deep(.el-input-number),.vertex-row :deep(.el-input-number){width:126px}.vertex-list{display:grid;gap:6px;max-height:130px;overflow:auto;color:var(--sp-color-text-muted);font-size:12px}.pass-section{border-top:1px solid var(--sp-color-divider);padding-top:14px}.pass-heading{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12px}.pass-heading>span{color:var(--sp-color-text-muted)}.pass-range{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0}.pass-range label{color:var(--sp-color-text-secondary);font-size:12px}.pass-range input{max-width:185px;min-width:150px;padding:5px;border:1px solid var(--sp-color-border);border-radius:4px}.pass-list{max-height:210px;overflow:auto;border:1px solid var(--sp-color-border);border-radius:5px}.pass-item{display:flex;width:100%;align-items:center;gap:10px;padding:9px 12px;border:0;border-bottom:1px solid var(--sp-color-divider);background:#fff;text-align:left;cursor:pointer}.pass-item.selected{background:var(--sp-color-primary-soft);box-shadow:inset 3px 0 var(--sp-color-primary)}.pass-item>span:nth-child(2){display:grid;gap:3px}.pass-item strong{font-size:12px}.pass-item small,.pass-area{color:var(--sp-color-text-muted);font-size:11px}.pass-area{margin-left:auto}.pass-index{display:grid;width:22px;height:22px;place-items:center;border-radius:50%;background:#edf1f6;color:#52677f;font-size:11px}.pass-empty{padding:20px;text-align:center;color:var(--sp-color-text-muted);font-size:12px}.admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.map-stage{height:clamp(620px,calc(100vh - 180px),850px)}
.map-entry-panel,.pass-section{position:absolute;z-index:3;top:12px;max-height:calc(100% - 90px);overflow:auto;border:1px solid var(--sp-color-border);border-radius:7px;background:#fffffff2;box-shadow:0 6px 20px #29456624;backdrop-filter:blur(5px)}
.map-entry-panel{left:12px;width:min(360px,calc(100% - 24px));padding:14px;display:grid;gap:10px}
.entry-heading{display:flex;align-items:center;justify-content:space-between}.entry-heading strong{font-size:12px}.entry-heading .el-button{font-size:18px}
.observation-coordinate-controls{display:grid;gap:8px}.observation-coordinate-controls>span{display:none}.observation-coordinate-controls :deep(.el-input-number){width:100%}.observation-coordinate-controls :deep(.el-button){margin:0}
.vertex-list{max-height:175px}.vertex-row{display:grid;grid-template-columns:20px 1fr 1fr auto;gap:4px}.vertex-row :deep(.el-input-number){width:100%;min-width:0}.admin-grid{grid-template-columns:1fr 1fr}.admin-entry{display:grid;gap:10px}.admin-entry p{margin:0;color:var(--sp-color-text-muted);font-size:11px}
.pass-section{right:12px;width:min(280px,calc(50% - 18px));padding:0}.pass-heading{padding:10px 12px;border-bottom:1px solid var(--sp-color-border);background:#f5f8fc}.pass-range{display:grid;grid-template-columns:1fr auto 1fr;gap:5px;margin:0;padding:10px}.pass-range label{grid-column:1/-1}.pass-range input{width:100%;min-width:0;max-width:none;font-size:10px}.pass-list{max-height:260px;border:0;border-radius:0}.pass-item{padding:8px;gap:6px}.pass-item strong{font-size:11px}.pass-item small,.pass-area{font-size:10px}.pass-area{white-space:nowrap}.pass-index{flex:0 0 20px}.pass-heading>span{font-size:10px}
.aoi-overlay{position:absolute;z-index:2;bottom:12px;left:12px;max-width:calc(100% - 95px)}.map-hud{top:auto;bottom:12px;left:auto;right:12px;z-index:2}.map-tools{top:auto;bottom:54px;z-index:2}.map-draw-hint{bottom:58px;z-index:2}
.entry-heading{padding-bottom:8px;border-bottom:1px solid var(--sp-color-border)}.entry-heading strong{font-size:13px}.entry-help{margin:0;color:var(--sp-color-text-muted);font-size:11px;line-height:1.5}.coordinate-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.coordinate-pair label{min-width:0;display:grid;gap:5px;color:var(--sp-color-text-secondary);font-size:11px}.coordinate-pair :deep(.el-input-number){width:100%}.coordinate-pair :deep(.el-input__inner){text-align:left}.entry-actions{display:flex;gap:8px}.entry-actions .el-button{flex:1;margin:0}.vertex-heading{display:flex;justify-content:space-between;font-size:12px;color:var(--sp-color-text-secondary)}.vertex-heading span,.vertex-empty{color:var(--sp-color-text-muted)}.vertex-empty{font-size:11px}.vertex-list{max-height:188px;min-height:24px}.vertex-row{grid-template-columns:22px minmax(0,1fr) minmax(0,1fr) auto;border:1px solid var(--sp-color-border);border-radius:5px;padding:5px}.vertex-index{font-size:11px;color:var(--sp-color-text-muted)}.vertex-row :deep(.el-input__inner){text-align:left}.entry-footer{padding-top:8px;border-top:1px solid var(--sp-color-border)}.entry-footer .el-button{width:100%;margin:0}.map-stage:has(.map-entry-panel) .pass-section{top:220px}@media(min-width:1350px){.map-stage:has(.map-entry-panel) .pass-section{top:12px}}@media(max-width:780px){.map-entry-panel{width:min(340px,calc(100% - 24px))}.map-stage:has(.map-entry-panel) .pass-section{top:370px}}
</style>


