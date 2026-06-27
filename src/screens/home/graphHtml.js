// Self-contained HTML for the family-graph WebView.
//
// Loads Cytoscape.js + the fcose (force-directed) layout from CDN, then waits
// for the React Native side to push graph data via `window.renderGraph(...)`.
// It talks back to RN through window.ReactNativeWebView.postMessage:
//   { type: 'ready' }            -> cytoscape is loaded, send me data
//   { type: 'open', id, name }   -> a node was tapped
//   { type: 'notfound', q }      -> search found nothing
//
// RN -> WebView functions exposed on window:
//   renderGraph({ nodes, edges })
//   focusNode(query)   // center + highlight a person by (partial) name
//
// Colors are passed in from the RN theme so the graph matches the app.
export function buildGraphHtml(colors) {
  const C = {
    male: "#3b5ba5",
    maleBg: "#D9E2F3",
    female: colors.primary700 || "#B0578D",
    femaleBg: "#F3D9E4",
    marriage: colors.primary600 || "#640233",
    parent: "#9aa0a6",
    highlight: "#E8A33D",
    bg: colors.primary100 || "#FAF7F6",
  };

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: ${C.bg}; }
  #cy { width: 100%; height: 100%; display: block; }
  #msg {
    position: absolute; top: 8px; left: 8px; right: 8px;
    font-family: -apple-system, Roboto, sans-serif; font-size: 13px;
    color: #b00020; text-align: center; pointer-events: none;
  }
</style>
<script src="https://unpkg.com/cytoscape@3.30.2/dist/cytoscape.min.js"></script>
<script src="https://unpkg.com/layout-base@2.0.1/layout-base.js"></script>
<script src="https://unpkg.com/cose-base@2.2.0/cose-base.js"></script>
<script src="https://unpkg.com/cytoscape-fcose@2.2.0/cytoscape-fcose.js"></script>
<script src="https://unpkg.com/dagre@0.8.5/dist/dagre.min.js"></script>
<script src="https://unpkg.com/cytoscape-dagre@2.5.0/cytoscape-dagre.js"></script>
</head>
<body>
<div id="cy"></div>
<div id="msg"></div>
<script>
  var cy = null;
  var RN = window.ReactNativeWebView;
  function send(obj){ if (RN) RN.postMessage(JSON.stringify(obj)); }
  function setMsg(t){ document.getElementById('msg').textContent = t || ''; }

  var currentMode = 'tree'; // 'tree' (hierarchical) | 'graph' (force-directed)

  // Apply the layout for a mode. Tree mode lays out ONLY the parent-child edges
  // (so marriage edges don't distort the hierarchy); graph mode uses fcose.
  // NOTE: cytoscape layouts position nodes asynchronously, so we fit the view
  // on 'layoutstop' (not right after run()) — otherwise we'd fit the empty
  // initial positions and the graph appears blank.
  function runLayout(target, opts) {
    var layout = target.layout(opts);
    layout.one('layoutstop', function(){ try { cy.fit(undefined, 30); } catch (e) {} });
    layout.run();
  }

  function applyLayout(mode) {
    if (!cy) return;
    currentMode = mode;
    cy.stop();
    var marriageEdges = cy.edges('[type = "marriage"]');
    if (mode === 'tree') {
      // Marriage edges only clutter the hierarchy — hide them.
      marriageEdges.style('display', 'none');
      // Hide married-in (external) people who aren't anyone's child (i.e. they
      // connect only by marriage). Their children stay — linked via the other,
      // bloodline parent. This keeps the tree to the family line only.
      cy.nodes().forEach(function(n){
        var isChild = n.incomers('edge[type = "parent"]').length > 0;
        n.style('display', (n.data('external') && !isChild) ? 'none' : 'element');
      });
      // Lay out only the visible nodes + their parent edges.
      var nodes = cy.nodes(':visible');
      var pEdges = cy.edges('[type = "parent"]').filter(function(e){
        return e.source().visible() && e.target().visible();
      });
      var eles = nodes.union(pEdges);
      var dagreOk = (typeof window.dagre !== 'undefined');
      try {
        runLayout(eles, dagreOk
          ? { name: 'dagre', rankDir: 'TB', nodeSep: 22, rankSep: 75,
              edgeSep: 8, animate: false, fit: true, padding: 30 }
          : { name: 'breadthfirst', directed: true, spacingFactor: 1.1,
              animate: false, fit: true, padding: 30 });
      } catch (e) {
        runLayout(eles, { name: 'breadthfirst', directed: true,
                          spacingFactor: 1.1, animate: false, fit: true, padding: 30 });
      }
    } else {
      // Graph mode: show everything.
      marriageEdges.style('display', 'element');
      cy.nodes().style('display', 'element');
      var opts = window.cytoscapeFcose
        ? { name: 'fcose', quality: 'default', animate: false, fit: true, padding: 30,
            nodeRepulsion: 8000, idealEdgeLength: 90, nodeSeparation: 90 }
        : { name: 'cose', animate: false, fit: true, padding: 30, idealEdgeLength: 90 };
      runLayout(cy, opts);
    }
  }

  // Called from React Native to switch view.
  window.setMode = function(mode) { applyLayout(mode); };

  window.renderGraph = function(data){
    try {
      var elements = [];
      (data.nodes || []).forEach(function(n){
        elements.push({ data: {
          id: n.id,
          name: n.name || '',
          // Graph labels show the full (lineage) name; first name kept too.
          label: n.fullname || n.name || '',
          firstname: n.firstname || n.name || '',
          fullname: n.fullname || n.name || '',
          sex: n.sex || '',
          photoUrl: n.photoUrl || '', deceased: !!n.deceased,
          external: !!n.external
        }});
      });
      (data.edges || []).forEach(function(e){
        elements.push({ data: {
          id: e.type + '_' + e.from + '_' + e.to,
          source: e.from, target: e.to, type: e.type
        }});
      });

      cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        minZoom: 0.02, maxZoom: 3,
        style: [
          { selector: 'node', style: {
              'label': 'data(label)',
              'font-size': 11,
              'color': '#333',
              'text-valign': 'bottom',
              'text-margin-y': 4,
              'width': 34, 'height': 34,
              'border-width': 2,
              'background-color': '#ccc'
          }},
          { selector: 'node[sex = "male"]', style: {
              'background-color': '${C.maleBg}', 'border-color': '${C.male}' }},
          { selector: 'node[sex = "famale"]', style: {
              'background-color': '${C.femaleBg}', 'border-color': '${C.female}' }},
          // Photo nodes show the image.
          { selector: 'node[photoUrl != ""]', style: {
              'background-image': 'data(photoUrl)',
              'background-fit': 'cover', 'background-clip': 'node' }},
          // Married-in (external) members: dashed border.
          { selector: 'node[?external]', style: { 'border-style': 'dashed' }},
          // Deceased: dimmed.
          { selector: 'node[?deceased]', style: { 'opacity': 0.45 }},
          // Highlighted (search result / selection).
          { selector: 'node.highlight', style: {
              'border-color': '${C.highlight}', 'border-width': 5,
              'opacity': 1 }},
          // Parent-child edges: solid, directed.
          { selector: 'edge[type = "parent"]', style: {
              'width': 1.5, 'line-color': '${C.parent}',
              'target-arrow-color': '${C.parent}',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier' }},
          // Marriage edges: dashed, no arrow, themed color.
          { selector: 'edge[type = "marriage"]', style: {
              'width': 2, 'line-color': '${C.marriage}',
              'line-style': 'dashed', 'curve-style': 'bezier' }}
        ],
        layout: { name: 'preset' }
      });

      applyLayout(currentMode);

      cy.on('tap', 'node', function(evt){
        var n = evt.target;
        cy.nodes().removeClass('highlight');
        n.addClass('highlight');
        send({ type: 'open', id: n.id(), name: n.data('name') });
      });

      send({ type: 'rendered', count: (data.nodes || []).length });
    } catch (err) {
      setMsg('Graph error: ' + err.message);
    }
  };

  window.focusNode = function(query){
    if (!cy || !query) return;
    var q = ('' + query).trim().toLowerCase();
    if (!q) return;
    var match = cy.nodes().filter(function(n){
      return (n.data('name') || '').toLowerCase().indexOf(q) !== -1
          || (n.data('fullname') || '').toLowerCase().indexOf(q) !== -1
          || ('' + n.id()).toLowerCase().indexOf(q) !== -1;
    });
    cy.nodes().removeClass('highlight');
    if (match.length === 0) { setMsg('لا يوجد نتيجة لـ "' + query + '"'); send({type:'notfound', q: query}); return; }
    setMsg('');
    var target = match[0];
    target.addClass('highlight');
    cy.animate({ center: { eles: target }, zoom: 1.4 }, { duration: 350 });
  };

  // Tell RN we're ready for data once the scripts are parsed.
  if (window.cytoscape) {
    send({ type: 'ready' });
  } else {
    window.addEventListener('load', function(){ send({ type: 'ready' }); });
  }
</script>
</body>
</html>`;
}