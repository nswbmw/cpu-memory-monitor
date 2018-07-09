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
    threshold: 60,
    profileDir: '/tmp',
    counter: 3,
    limiter: [5, 'hour']
  },
  memory: {
    interval: 5000,
    threshold: '500mb',
    ...
  }
})
```

will generate:

```
cpu-${process.pid}-${Date.now()}.cpuprofile
memory-${process.pid}-${Date.now()}.heapsnapshot
leak-memory-${process.pid}-${Date.now()}.heapsnapshot
```


```
require('cpu-memory-monitor')({
  cpu: {
    interval: 1000,
    duration: 30000,
    threshold: 60,
    profileDir: '/tmp',
    counter: 3,
    limiter: [5, 'hour']
  }
})
```

**means**: every `1000ms` check CPU usage, when CPU(%) > `60%` for `3` times, then dump `30000ms` CPU usage(`.cpuprofile`) to `/tmp`, dump could be triggered at most `5` times an `hour`.

you can also use:

```bash
$ kill -USR2 PID
```

see [heapdump](https://github.com/bnoordhuis/node-heapdump).

### Options

- cpu`{Object}`
  - interval`{Number}`: interval(ms) for check CPU usage, default: `1000`
  - duration`{Number}`: duration(ms) for profiling CPU, default: `30000`
  - threshold`{Number}:` process max CPU(%) usage, default: `90`
  - profileDir`{String}`: directory for save cpuprofile, default: `process.cwd()`
  - counter`{Number}:` the number of CPU > threshold, then dump, default: `1`
  - limiter`{Array}`: options pass to [limiter](https://github.com/jhurliman/node-rate-limiter), default: `[3, 'hour']`
- memory`{Object}`
  - interval`{Number}`: interval(ms) for check Memory usage, default: `1000`
  - threshold`{String}:` process max Memory usage, default: `1.2gb`, see [bytes](https://github.com/visionmedia/bytes.js)
  - profileDir`{String}`: directory for save heapsnapshot, default: `process.cwd()`
  - counter`{Number}:` the number of Memory > threshold, then dump, default: `1`
  - limiter`{Array}`: options pass to [limiter](https://github.com/jhurliman/node-rate-limiter), default: `[3, 'hour']`

**NB**: If omit cpu/memory option, cpu-momery-monitor will not monitor it.

### License

MIT
