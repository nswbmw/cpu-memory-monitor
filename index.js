const fs = require('fs')
const path = require('path')

const bytes = require('bytes')
const pusage = require('pidusage')
const heapdump = require('heapdump')
const profiler = require('v8-profiler')
const memwatch = require('memwatch-next')
const RateLimiter = require('limiter').RateLimiter

const processing = {
  cpu: false,
  memory: false
}

const counter = {
  cpu: 0,
  memory: 0
}

function genProfilePath (profileDir, prefix, suffix) {
  return path.join(profileDir, `${prefix}-${process.pid}-${Date.now()}.${suffix}`)
}

function dumpCpu (cpuProfileDir, cpuDuration) {
  profiler.startProfiling()
  processing.cpu = true
  setTimeout(() => {
    const profile = profiler.stopProfiling()
    const filepath = genProfilePath(cpuProfileDir, 'cpu', 'cpuprofile')
    profile.export()
      .pipe(fs.createWriteStream(filepath))
      .on('finish', () => {
        processing.cpu = false
        profile.delete()
        console.error(`cpuprofile export success: ${filepath}`)
      })
      .on('error', (error) => {
        processing.cpu = false
        console.error(`cpuprofile export error: ${error.message}`)
        console.error(error.stack)
      })
  }, cpuDuration)
}

function dumpMemory (memProfileDir, isLeak = false) {
  processing.memory = true
  const filepath = genProfilePath(memProfileDir, isLeak ? 'leak-memory' : 'memory', 'heapsnapshot')
  heapdump.writeSnapshot(filepath, (error, filename) => {
    processing.memory = false
    if (error) {
      console.error(`heapsnapshot dump error: ${error.message}`)
      console.error(error.stack)
      return
    }
    console.log(`heapsnapshot dump success: ${filename}`)
  })
}

module.exports = function cpuMemoryMonitor (options = {}) {
  const cpuOptions = options.cpu || {}
  const cpuInterval = cpuOptions.interval || 1000
  const cpuDuration = cpuOptions.duration || 30000
  const cpuThreshold = cpuOptions.threshold || 90
  const cpuProfileDir = cpuOptions.profileDir || process.cwd()
  const cpuCounter = cpuOptions.counter || 1
  const cpuLimiterOpt = cpuOptions.limiter || []
  const cpuLimiter = new RateLimiter(cpuLimiterOpt[0] || 3, cpuLimiterOpt[1] || 'hour', true)

  const memOptions = options.memory || {}
  const memInterval = memOptions.interval || 1000
  const memThreshold = bytes.parse(memOptions.threshold || '1.2gb')
  const memProfileDir = memOptions.profileDir || process.cwd()
  const memCounter = memOptions.counter || 1
  const memLimiterOpt = memOptions.limiter || []
  const memLimiter = new RateLimiter(memLimiterOpt[0] || 3, memLimiterOpt[1] || 'hour', true)

  if (options.cpu) {
    const cpuTimer = setInterval(() => {
      if (processing.cpu) {
        return
      }
      pusage.stat(process.pid, (err, stat) => {
        if (err) {
          console.error(`cpu stat error: ${err.message}`)
          console.error(err.stack)
          clearInterval(cpuTimer)
          return
        }
        if (stat.cpu > cpuThreshold) {
          counter.cpu += 1
          if (counter.cpu >= cpuCounter) {
            cpuLimiter.removeTokens(1, (limiterErr, remaining) => {
              if (limiterErr) {
                console.error(`limiterErr: ${limiterErr.message}`)
                console.error(limiterErr.stack)
                return
              }
              if (remaining > -1) {
                dumpCpu(cpuProfileDir, cpuDuration)
                counter.cpu = 0
              }
            })
          }
        } else {
          counter.cpu = 0
        }
      })
    }, cpuInterval)
  }

  if (options.memory) {
    const memTimer = setInterval(() => {
      if (processing.memory) {
        return
      }
      pusage.stat(process.pid, (err, stat) => {
        if (err) {
          console.error(`memory stat error: ${err.message}`)
          console.error(err.stack)
          clearInterval(memTimer)
          return
        }
        if (stat.memory > memThreshold) {
          counter.memory += 1
          if (counter.memory >= memCounter) {
            memLimiter.removeTokens(1, (limiterErr, remaining) => {
              if (limiterErr) {
                console.error(`limiterErr: ${limiterErr.message}`)
                console.error(limiterErr.stack)
                return
              }
              if (remaining > -1) {
                dumpMemory(memProfileDir)
                counter.memory = 0
              }
            })
          }
        } else {
          counter.memory = 0
        }
      })
    }, memInterval)

    memwatch.on('leak', (info) => {
      console.warn('memory leak: %j', info)
      dumpMemory(memProfileDir, true)
    })
  }
}
