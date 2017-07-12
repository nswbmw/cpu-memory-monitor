## cpu-memory-monitor

CPU & Memory Monitor, auto dump.

### Install

```
$ npm i cpu-memory-monitor --save
```

### Usage

```
require('cpu-memory-monitor')(options)
```

example:

```javascript
require('cpu-memory-monitor')({
  cpu: {
    interval: 1000,
    duration: 30000,
    threshold: 50,
    profileDir: '/tmp',
    limiter: [5, 'hour']
  },
  memory: {
    interval: 5000,
    threshold: '500mb'
  }
})
```

will generate:

```
cpu-${process.pid}-${Date.now()}.cpuprofile
memory-${process.pid}-${Date.now()}.heapsnapshot
leak-memory-${process.pid}-${Date.now()}.heapsnapshot
```

### Options

- cpu`{Object}`
  - interval`{Number}`: interval(ms) for check CPU usage, default: `1000`
  - duration`{Number}`: duration(ms) for profiling CPU, default: `30000`
  - threshold`{Number}:` process max CPU(%) usage, default: `90`
  - profileDir`{String}`: directory for save cpuprofile, default: `process.cwd()`
  - limiter`{Array}`: options pass to [limiter](https://github.com/jhurliman/node-rate-limiter), default: `[3, 'hour']`
- memory`{Object}`
  - interval`{Number}`: interval(ms) for check Memory usage, default: `1000`
  - threshold`{String}:` process max Memory usage, default: `1.2gb`, see [bytes](https://github.com/visionmedia/bytes.js)
  - profileDir`{String}`: directory for save heapsnapshot, default: `process.cwd()`
  - limiter`{Array}`: options pass to [limiter](https://github.com/jhurliman/node-rate-limiter), default: `[3, 'hour']`

**NB**: If omit cpu/memory option, cpu-momery-monitor will not monitor it.

### License

MIT