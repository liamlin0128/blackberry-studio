const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

function load(file) {
  const source = fs.readFileSync(file, 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const current = new Module(file, module)
  current.filename = file
  current.paths = Module._nodeModulePaths(path.dirname(file))
  current.require = (name) => name === './time' ? load(path.join(path.dirname(file), 'time.ts')) : require(name)
  current._compile(js, file)
  return current.exports
}

const root = path.join(__dirname, '..', 'src', 'features', 'conversion')
const { convertTime, parseClock } = load(path.join(root, 'time.ts'))
const { convertOrbit } = load(path.join(root, 'orbit.ts'))
const time = Object.fromEntries(convertTime(parseClock('2026-11-02T16:13:45', 'BJT')))
assert.equal(time.UTC时间, '2026-11-02T08:13:45.000')
assert.equal(time.BJT, '2026-11-02T16:13:45.000')
assert.equal(time['International Atomic Time（TAI）'], '2026-11-02T08:14:22.000')
assert.equal(time['Terrestrial Time（TT）'], '2026-11-02T08:14:54.184')
assert.throws(() => parseClock('2027-01-01T00:00:00', 'UTC'), /闰秒/)

const epoch = '2026-11-02T16:13:45'
const elements = { a: '7000', e: '0.01', i: '98', raan: '30', argp: '40', m: '50' }
const cart = convertOrbit('kepler', 'j2000', elements, epoch)
const cartFields = ['x', 'y', 'z', 'vx', 'vy', 'vz']
const cartRecord = Object.fromEntries(cartFields.map((key, index) => [key, String(cart[index])]))
const back = convertOrbit('j2000', 'kepler', cartRecord, epoch)
for (let i = 0; i < 6; i++) assert.ok(Math.abs(back[i] - Number(Object.values(elements)[i])) < 1e-7, `Kepler round trip field ${i}`)
const fixed = convertOrbit('j2000', 'wgs84', cartRecord, epoch)
const fixedRecord = Object.fromEntries(cartFields.map((key, index) => [key, String(fixed[index])]))
const inertial = convertOrbit('wgs84', 'j2000', fixedRecord, epoch)
for (let i = 0; i < 6; i++) assert.ok(Math.abs(inertial[i] - cart[i]) < 1e-7, `Earth-fixed round trip field ${i}`)
assert.throws(() => convertOrbit('kepler', 'j2000', { ...elements, e: '1.2' }, epoch), /椭圆轨道/)
assert.throws(() => convertOrbit('kepler', 'kepler', { ...elements, e: '1.2' }, epoch), /椭圆轨道/)
console.log('Conversion checks passed: time sample, validity, orbital and Earth-fixed round trips, invalid orbit')
