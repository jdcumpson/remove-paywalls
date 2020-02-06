
var MAX_DEPTH = 10;

var isOverlay = function(node) {
  var computedStyle = getComputedStyle(node);
  var zIndex = computedStyle.getPropertyValue('z-index');
  var highZIndex = zIndex > 10;
  var positionFixed = computedStyle.getPropertyValue('position') === 'fixed'
  var positionAbsolute = computedStyle.getPropertyValue('position') === 'absolute'
  var maxHeightSet = computedStyle.getPropertyValue('max-height') === '100vh';
  var maxHeightWidth = computedStyle.getPropertyValue('max-height') === '100%' && computedStyle.getPropertyValue('max-width') === '100%';
  var criteria = [highZIndex, positionFixed || positionAbsolute, maxHeightSet || maxHeightWidth];
  return criteria.filter(x => x).length > 1 || zIndex > 100000;
}

var isContainer = function(node) {
  var computedStyle = getComputedStyle(node);
  var positionFixed = computedStyle.getPropertyValue('position') === 'fixed'
  var positionAbsolute = computedStyle.getPropertyValue('position') === 'absolute'
  var maxHeightSet = computedStyle.getPropertyValue('max-height') === '100vh';
  var maxHeightWidth = computedStyle.getPropertyValue('max-height') === '100%' && computedStyle.getPropertyValue('max-width') === '100%';
  var overflowHidden = computedStyle.getPropertyValue('max-height') !== 'visible';
  var criteria = [positionFixed || positionAbsolute, maxHeightSet || maxHeightWidth, overflowHidden];
  return criteria.filter(x => x).length > 1;
}

var recurseChildren = function(node, opts, depth) {
  var overlayNodes = opts.overlayNodes;
  var containerNodes = opts.containerNodes;

  if (!node) {
    return {overlayNodes: overlayNodes, containerNodes: containerNodes};
  }

  if (isOverlay(node)) {
    overlayNodes.push(node);
  }

  if (isContainer(node)) {
    containerNodes.push(node);
  }

  if (depth === MAX_DEPTH) {
    return {overlayNodes: overlayNodes, containerNodes: containerNodes};
  }
  for(var i = 0; i < node.children.length; i++) {
    recurseChildren(node.children[i], {overlayNodes: overlayNodes, containerNodes: containerNodes}, depth + 1);
  }
  return {overlayNodes: overlayNodes, containerNodes: containerNodes};
}

var removeOverlays = function() {
  var body = document.getElementsByTagName('body')[0];
  var results = recurseChildren(body, {overlayNodes: [], containerNodes: []}, 0);
  for (var i = 0; i < results.overlayNodes.length; i++) {
    console.info('Hid element suspected overlay', results.overlayNodes[i])
    if (results.containerNodes.indexOf(results.overlayNodes[i]) === -1) {
      results.overlayNodes[i].style.display = 'none';
      results.overlayNodes[i].style.zIndex = 2;
    }
  }
  for(var i = 0; i < results.containerNodes.length; i++) {
    console.info('Overflow visible suspected container', results.overlayNodes[i])
    results.containerNodes[i].style.overflow = 'visible';
    results.containerNodes[i].style.position = 'inherit';
  }
};

var setBodyScrollable = function(body) {
  body.style.overflow = "visible";
  body.style.position = "inherit";
  body.style.width = 'auto'
}

var currentArticleNode = null;

var removePaywall = function () {
  var body = document.getElementsByTagName('body')[0];
  if (!body) {
    return;
  }
  if (getComputedStyle(body).getPropertyValue('overflow') !== "visible") {
    setBodyScrollable(body);
  }
  removeOverlays();

  var newArticleNode = document.getElementsByName('articleBody')[0];
  if (!newArticleNode) {
    return;
  }
  if (!currentArticleNode) {
    currentArticleNode = newArticleNode.cloneNode(true);
  }
  if (currentArticleNode.textContent.length > newArticleNode.textContent.length) {
    newArticleNode.parentElement.replaceChild(currentArticleNode.cloneNode(true), newArticleNode);
  }
};

removePaywall();
setInterval(removePaywall, 300);