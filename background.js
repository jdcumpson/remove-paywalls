chrome.runtime.onInstalled.addListener(function() {
  console.info('xxxx1')
});

var count = 0;

setInterval(function () {
  console.info('count', count);
  count += 1;
}, 1000);