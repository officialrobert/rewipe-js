const timeout = (ms) => {
  return new Promise((resolve) => {
    const _timeout = setTimeout(
      () => {
        clearTimeout(_timeout);
        return resolve();
      },
      ms ? ms : 50
    );
  });
};

module.exports = { timeout };
