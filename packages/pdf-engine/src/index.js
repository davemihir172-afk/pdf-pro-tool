function mergeBuffers(buffers) {
  return buffers[0];
}

function singleFilePassThrough(buffers) {
  return buffers[0];
}

function processPdfTool(tool, base64Files, fields) {
  const buffers = base64Files.map((base64) => Buffer.from(base64, 'base64'));

  if (tool === 'merge') return mergeBuffers(buffers);
  if (tool === 'split') return singleFilePassThrough(buffers, fields.range);
  if (tool === 'compress') return singleFilePassThrough(buffers);
  if (tool === 'rotate') return singleFilePassThrough(buffers, fields.angle);
  if (tool === 'delete-pages') return singleFilePassThrough(buffers, fields.range);
  if (tool === 'extract-pages') return singleFilePassThrough(buffers, fields.range);

  throw new Error(`Unsupported tool: ${tool}`);
}

module.exports = { processPdfTool };
