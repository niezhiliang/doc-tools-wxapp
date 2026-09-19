const types = {
  1: ['PDF', '图片', 'pdf', 'image'], 2: ['PDF', 'Word', 'pdf', 'word'],
  3: ['PDF', 'Excel', 'pdf', 'excel'], 4: ['PDF', 'PPT', 'pdf', 'ppt'],
  6: ['图片', 'PDF', 'image', 'pdf'], 7: ['Word', 'PDF', 'word', 'pdf'],
  8: ['Excel', 'PDF', 'excel', 'pdf'], 9: ['PPT', 'PDF', 'ppt', 'pdf']
};
function describe(type) {
  const [source, target, sourceTone, targetTone] = types[Number(type)] || ['文件', '文件', 'file', 'file'];
  return {source, target, sourceTone, targetTone};
}
module.exports = {describe};
