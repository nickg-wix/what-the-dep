const _ = require("lodash")
const dayjs = require("dayjs")
const SV = require("semver")

const resolveVersion = (versionToReleaseTime, date, semver) => {
  const versions = Object.keys(versionToReleaseTime)

  const filteredBySemver = versions.filter(version => {
    const semverRegex = /^\d+\.\d+\.\d+$/
    const isTagless = v => semverRegex.test(v)
    return isTagless(version) && SV.satisfies(version, semver)
  })

  const filteredByReleaseDate = filteredBySemver.filter(ver =>
    dayjs(versionToReleaseTime[ver]).isBefore(date)
  )

  if (_.isEmpty(filteredByReleaseDate)) {
    return null
  } else {
    return _.maxBy(filteredByReleaseDate, ver =>
      dayjs(versionToReleaseTime[ver]).valueOf()
    )
  }
}

const compareNameToVersionMaps = (priorVersions, latterVersions) => {
  const priorKeys = Object.keys(priorVersions)
  const latterKeys = Object.keys(latterVersions)
  const keys = _.union(priorKeys, latterKeys)
  return keys.map(moduleName => {
    return {
      packageName: moduleName,
      priorVersion: priorVersions[moduleName] || null,
      latterVersion: latterVersions[moduleName] || null
    }
  })
}

module.exports = {
  compareNameToVersionMaps,
  resolveVersion
}
