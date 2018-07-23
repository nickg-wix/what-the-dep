const _ = require("lodash")
const { execSync } = require('child_process') 
const fs = require("fs")
const dayjs = require("dayjs")
const semver = require("semver")

const getDepsFromPackageJson = path => {
  const pj = fs.readFileSync(path, "utf8")
  const parsedPj = JSON.parse(pj)
  const deps = {...parsedPj.dependencies, ...parsedPj.devDependencies}
  return deps
}

const getReleaseTimes = packageName => {
  const semverRegex = /^\d+\.\d+\.\d+$/
  const cmd = `npm view --json ${packageName} time`
  const viewJson = execSync(cmd, {encoding: "utf8"})
  const view = JSON.parse(viewJson)
  const semverOnly = _.pickBy(view, (v, k) => semverRegex.test(k))
  return semverOnly
}

// date -> semver -> releaseTimes -> version
const resolveDependencyVersion = (timestamp, semverRule, releaseTimes) => {
  const doesMatchSemverRule = version => semver.satisfies(version, semverRule)
  const isBeforeTimestamp = releaseTime => dayjs(releaseTime).isBefore(dayjs(timestamp))

  const validVersions = _(releaseTimes)
    .map((releaseTime, version) => ({ version, releaseTime }))
    .filter(({releaseTime, version}) => doesMatchSemverRule(version) && isBeforeTimestamp(releaseTime))
    .value()
  const latestValidVersion = _.maxBy(validVersions, ({releaseTime}) => dayjs(releaseTime).valueOf())

  return latestValidVersion && latestValidVersion.version
}

module.exports = {
  getDepsFromPackageJson,
  getReleaseTimes,
  resolveDependencyVersion,
}


