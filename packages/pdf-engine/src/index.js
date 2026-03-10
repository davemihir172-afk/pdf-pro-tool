function mergePdfBuffers(base64Files) {
  const buffers = base64Files.map((base64) => Buffer.from(base64, 'base64'));
  return Buffer.concat(buffers);
}

module.exports = { mergePdfBuffers };
