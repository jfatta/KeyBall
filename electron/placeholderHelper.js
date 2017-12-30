var parse = function (value) {
  var regex = /#{keyvault:(.+)}/gim
  console.log(value)
  var match = regex.exec(value)
  var pair = value
  if (match != null) {
    pair = match[1]
  }
  return pair != null ? pair.replace(/\s/g, '').split(':') : null
}

module.exports.parse = parse
