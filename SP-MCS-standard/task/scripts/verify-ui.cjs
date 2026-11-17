const path = require('node:path')
const { chromium } = require('playwright')

const outputDir = process.argv[2] || path.join(process.cwd(), 'artifacts')
const cases = [
  { name: 'data-status-1920', width: 1920, height: 1080, path: '/app/mccs/tasksys/data/taskPlan', expects: ['北斗星上任务计划状态信息', '计划ID'], fluid: true, surface: true },
  { name: 'data-urgent-1280', width: 1280, height: 900, path: '/app/mccs/tasksys/data/urgentRecord', expects: ['北斗星上应急规划结果记录', '待确认'], surface: true },
  { name: 'data-ipu-1280', width: 1280, height: 900, path: '/app/mccs/tasksys/data/ipuRecord', expects: ['北斗 IPU 任务统计数据', '待确认'], surface: true },
  { name: 'data-task-log-1280', width: 1280, height: 900, path: '/app/mccs/tasksys/data/taskLog', expects: ['星上任务日志记录', '任务日志类型'], surface: true },
  { name: 'upload-registration-1920', width: 1920, height: 1080, path: '/app/mccs/tasksys/uploadFile/uploadFileTable', expects: ['上注文件登记表', '新增登记'], fluid: true, surface: true },
  { name: 'system-dict-1920', width: 1920, height: 1080, path: '/app/mccs/tasksys/system/dict', expects: ['字典管理', '卫星状态', '新增'], fluid: true, surface: true },
  { name: 'system-dict-dialog-1024', width: 1024, height: 768, path: '/app/mccs/tasksys/system/dict?dialog=create', expects: ['新增字典项', '所属分类', '字典值'] },
  { name: 'system-log-1920', width: 1920, height: 1080, path: '/app/mccs/tasksys/system/syslog', expects: ['系统日志', '操作异常信息', '导出'], fluid: true, surface: true },
  { name: 'operation-log-1920', width: 1920, height: 1080, path: '/app/mccs/tasksys/system/sys-operation-log', expects: ['操作日志', 'IP 地址', '导出'], fluid: true, surface: true },
  { name: 'operation-log-1024', width: 1024, height: 768, path: '/app/mccs/tasksys/system/sys-operation-log', expects: ['操作日志', 'IP 地址', '导出'], surface: true },
  { name: 'data-file-1024', width: 1024, height: 768, path: '/app/mccs/tasksys/data/fileTabel', expects: ['星上文件表', '文件记录编号'], surface: true },
  { name: 'transmission-reference-1440', width: 1440, height: 900, path: '/app/mccs/tasksys/task/transmission-record', expects: ['发送记录', '发送设置'], surface: true },
  { name: 'task-plan-summary-1440', width: 1440, height: 900, path: '/app/mccs/tasksys/task/schedule', expects: ['任务计划表', '总数', '待发送', '已取消'], surface: true, summaryRows: 1 },
  { name: 'task-plan-summary-1280', width: 1280, height: 900, path: '/app/mccs/tasksys/task/schedule', expects: ['任务计划表', '559', '执行失败', '496'], surface: true, summaryRows: 2, batchActions: true },
  { name: 'task-plan-summary-1024', width: 1024, height: 768, path: '/app/mccs/tasksys/task/schedule', expects: ['任务计划表', '已发送', '已完成'], surface: true, summaryRows: 2 },
  { name: 'arc-forecast-result-1440', width: 1440, height: 900, path: '/app/mccs/tasksys/schedule/compute?dialog=forecast-result', expects: ['弧段预报结果', '卫星A（MD1A）', '总弧段数', '不写入规划记录，不输出规划日志'], surface: true },
  { name: 'arc-forecast-flow-1280', width: 1280, height: 900, path: '/app/mccs/tasksys/schedule/compute', expects: ['规划计算', '弧段预报', '最近预报完成时间'], surface: true },
  { name: 'arc-forecast-result-1024', width: 1024, height: 768, path: '/app/mccs/tasksys/schedule/compute?dialog=forecast-result', expects: ['弧段预报结果', '卫星B（MD1B）', '测控数传弧段'], surface: true },
  { name: 'schedule-config-surface-1280', width: 1280, height: 900, path: '/app/mccs/tasksys/schedule/config', expects: ['规划配置', '当前配置'], surface: true },
  { name: 'algorithm-surface-1024', width: 1024, height: 768, path: '/app/mccs/tasksys/schedule/algorithm', expects: ['算法管理', '添加算法'], surface: true },
]

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  })
  const results = []
  try {
    for (const item of cases) {
      const page = await browser.newPage({ viewport: { width: item.width, height: item.height } })
      const errors = []
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`http://127.0.0.1:5173${item.path}`, { waitUntil: 'networkidle' })
      const check = await page.evaluate((expects) => {
        const text = document.body.innerText.trim()
        const stage = document.querySelector('.stage-four-page, .requirement-page')
        const child = stage?.firstElementChild
        const style = stage ? getComputedStyle(stage) : null
        const innerWidth = stage && style ? stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) : 0
        const contentWidth = child ? child.getBoundingClientRect().width : 0
        const background = (selector) => {
          const element = document.querySelector(selector)
          return element ? getComputedStyle(element).backgroundColor : 'missing'
        }
        const summaryCards = [...document.querySelectorAll('.plan-summary-statuses article')]
        const summaryRowCount = new Set(summaryCards.map((element) => Math.round(element.getBoundingClientRect().top))).size
        const coreActionButtons = [...document.querySelectorAll('.plan-core-actions .el-button')]
        const batchActionStyleValid = coreActionButtons.length === 5
          && coreActionButtons.every((button) => Boolean(button.querySelector('.el-icon')))
          && coreActionButtons[0].classList.contains('el-button--primary')
          && coreActionButtons[2].classList.contains('el-button--danger')
          && [1, 3, 4].every((index) => !coreActionButtons[index].classList.contains('el-button--primary') && !coreActionButtons[index].classList.contains('el-button--danger') && !coreActionButtons[index].classList.contains('el-button--success'))
          && Boolean(document.querySelector('.plan-batch-actions .manual-create .el-icon'))
        return {
          hasContent: text.length > 0,
          expectedText: expects.map((value) => ({ value, found: text.includes(value) })),
          hasErrorOverlay: Boolean(document.querySelector('.vite-error-overlay, #webpack-dev-server-client-overlay, [data-nextjs-dialog]')),
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          pageOverflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          innerWidth: Math.round(innerWidth),
          contentWidth: Math.round(contentWidth),
          contentGap: Math.round(innerWidth - contentWidth),
          visibleMockMarker: text.includes('模拟数据') || text.includes('模拟保存') || text.includes('模拟计算结果'),
          summaryRowCount,
          batchActionStyleValid,
          backgrounds: {
            workspace: background('.workspace main'),
            page: stage ? getComputedStyle(stage).backgroundColor : 'missing',
            filter: background('.filter-panel'),
            tableRegion: background('.table-region'),
            table: background('.el-table'),
          },
        }
      }, item.expects)
      let interaction = 'not-applicable'
      let interactionDetails = null
      if (item.name === 'system-dict-1920') {
        await page.locator('button[aria-label="删除字典项"]').first().click()
        interaction = await page.getByText('确认删除字典项').isVisible() ? 'delete-confirm-visible' : 'delete-confirm-missing'
        await page.getByRole('button', { name: '取消' }).click()
      }
      if (item.name === 'system-log-1920' || item.name === 'operation-log-1920' || item.name === 'operation-log-1024') {
        await page.getByRole('button', { name: '查询' }).click()
        interaction = 'query-triggered'
      }
      if (item.name === 'arc-forecast-flow-1280') {
        const logBefore = await page.locator('.schedule-log-stream').innerText()
        const rowCountBefore = await page.locator('.schedule-history-table .el-table__row').count()
        const forecastColumnCount = await page.getByRole('columnheader', { name: '弧段预报', exact: true }).count()
        await page.getByRole('button', { name: '弧段预报', exact: true }).click()
        const progressVisible = await page.getByText('弧段预报计算中', { exact: true }).isVisible()
        await page.getByText('弧段预报结果', { exact: true }).waitFor({ state: 'visible', timeout: 6000 })
        await page.getByRole('tab', { name: '卫星B（MD1B）' }).click()
        const activeForecastTotal = page.locator('.satellite-forecast-summary:visible dd').first()
        await activeForecastTotal.waitFor({ state: 'visible', timeout: 2000 })
        const logUnchanged = await page.locator('.schedule-log-stream').innerText() === logBefore
        const rowsUnchanged = await page.locator('.schedule-history-table .el-table__row').count() === rowCountBefore
        const resultVisible = (await activeForecastTotal.textContent())?.trim() === '13'
        interactionDetails = { progressVisible, resultVisible, logUnchanged, rowsUnchanged, forecastColumnCount }
        interaction = progressVisible && resultVisible && logUnchanged && rowsUnchanged && forecastColumnCount === 0
          ? 'forecast-isolated-and-complete'
          : 'forecast-flow-incomplete'
      }
      await page.screenshot({ path: path.join(outputDir, `${item.name}.png`), fullPage: true })
      results.push({ ...item, ...check, interaction, interactionDetails, consoleErrors: errors })
      await page.close()
    }
  } finally {
    await browser.close()
  }
  console.log(JSON.stringify(results, null, 2))
  if (results.some((item) => !item.hasContent || item.hasErrorOverlay || item.pageOverflowX || item.visibleMockMarker || (item.summaryRows && item.summaryRowCount !== item.summaryRows) || (item.batchActions && !item.batchActionStyleValid) || (item.fluid && item.contentGap > 2) || (item.surface && item.backgrounds.page !== 'rgb(255, 255, 255)') || item.interaction === 'delete-confirm-missing' || item.interaction === 'forecast-flow-incomplete' || item.consoleErrors.length || item.expectedText.some((entry) => !entry.found))) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
