figma.showUI(__html__, { width: 920, height: 620, title: 'SVG Studio' });

figma.ui.onmessage = async function(msg) {
  if (msg.type === 'insert') {
    try {
      var node = figma.createNodeFromSvg(msg.svg);
      node.name = msg.name || 'SVG Asset';
      var center = figma.viewport.center;
      node.x = Math.round(center.x - node.width / 2);
      node.y = Math.round(center.y - node.height / 2);
      figma.currentPage.appendChild(node);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      figma.ui.postMessage({ type: 'insert-success', name: msg.name });
    } catch(e) {
      figma.ui.postMessage({ type: 'insert-error', error: String(e) });
    }
  }
};
