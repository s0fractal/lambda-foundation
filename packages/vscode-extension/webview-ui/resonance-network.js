/**
 * Phase 4.4: Resonance Network WebView Script
 *
 * D3.js visualization running in VS Code WebView.
 * Communicates with extension via postMessage.
 */

(function () {
  const vscode = acquireVsCodeApi();

  // State
  let graphData = { nodes: [], links: [] };
  let simulation = null;
  let config = {
    width: window.innerWidth,
    height: window.innerHeight - 120,
    viewMode: "force",
    showLabels: true,
    showParticles: true,
  };

  // Elements
  const svg = d3.select("#graph")
    .attr("width", config.width)
    .attr("height", config.height);

  const g = svg.append("g").attr("class", "graph-container");
  const linkGroup = g.append("g").attr("class", "links");
  const nodeGroup = g.append("g").attr("class", "nodes");
  const labelGroup = g.append("g").attr("class", "labels");

  // Define arrow markers
  const defs = svg.append("defs");
  ["discovery", "validation", "resonance", "proposal"].forEach((type) => {
    defs
      .append("marker")
      .attr("id", `arrow-${type}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 35)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#fff")
      .attr("opacity", 0.6);
  });

  // Zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);

  // Initialize
  function init() {
    console.log("[WebView] Initializing...");
    vscode.postMessage({ type: "ready" });
  }

  // Update graph
  function updateGraph(data) {
    console.log("[WebView] Updating graph:", data);
    graphData = data;

    // Stop existing simulation
    if (simulation) {
      simulation.stop();
    }

    // Create simulation
    simulation = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(config.width / 2, config.height / 2))
      .force("collision", d3.forceCollide().radius(60));

    // Apply layout if needed
    if (config.viewMode === "circular") {
      applyCircularLayout();
    } else if (config.viewMode === "grid") {
      applyGridLayout();
    } else if (config.viewMode === "hierarchical") {
      applyHierarchicalLayout();
    }

    // Draw links
    const link = linkGroup
      .selectAll("line")
      .data(graphData.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
      .join("line")
      .attr("class", "resonance-edge")
      .attr("stroke-width", d => (d.confidence || 0.5) * 5)
      .attr("marker-end", d => `url(#arrow-${d.type})`)
      .on("click", function(event, d) {
        event.stopPropagation();
        vscode.postMessage({ type: "edgeClick", data: d });
      });

    // Draw nodes
    const node = nodeGroup
      .selectAll("circle")
      .data(graphData.nodes, d => d.id)
      .join("circle")
      .attr("class", "agent-node")
      .attr("r", d => 15 + (d.trust || 0.5) * 25)
      .attr("fill", d => d.color)
      .attr("opacity", 0.85)
      .call(
        d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", function(event, d) {
        event.stopPropagation();
        showNodeDetails(d);
        vscode.postMessage({ type: "nodeClick", data: d });
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 15 + (d.trust || 0.5) * 30)
          .attr("opacity", 1);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 15 + (d.trust || 0.5) * 25)
          .attr("opacity", 0.85);
      });

    // Draw labels
    let labels = null;
    if (config.showLabels) {
      labels = labelGroup
        .selectAll("text")
        .data(graphData.nodes, d => d.id)
        .join("text")
        .attr("class", "agent-label")
        .attr("dy", -35)
        .text(d => d.name);
    } else {
      labelGroup.selectAll("text").remove();
    }

    // Update on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x || 0)
        .attr("y1", d => d.source.y || 0)
        .attr("x2", d => d.target.x || 0)
        .attr("y2", d => d.target.y || 0);

      node
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);

      if (labels) {
        labels
          .attr("x", d => d.x || 0)
          .attr("y", d => d.y || 0);
      }
    });

    // Start particles if enabled
    if (config.showParticles) {
      startParticles();
    }

    // Update stats
    updateStats();
  }

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Layout algorithms
  function applyCircularLayout() {
    const radius = Math.min(config.width, config.height) * 0.35;
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const angleStep = (2 * Math.PI) / graphData.nodes.length;

    graphData.nodes.forEach((node, i) => {
      const angle = i * angleStep;
      node.fx = centerX + radius * Math.cos(angle);
      node.fy = centerY + radius * Math.sin(angle);
    });
    simulation.alpha(0.3).restart();
  }

  function applyGridLayout() {
    const cols = Math.ceil(Math.sqrt(graphData.nodes.length));
    const spacing = Math.min(config.width, config.height) / (cols + 1);

    graphData.nodes.forEach((node, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      node.fx = spacing * (col + 1);
      node.fy = spacing * (row + 1);
    });
    simulation.alpha(0.3).restart();
  }

  function applyHierarchicalLayout() {
    const sorted = [...graphData.nodes].sort((a, b) => (b.trust || 0) - (a.trust || 0));
    const levels = 3;
    const nodesPerLevel = Math.ceil(graphData.nodes.length / levels);

    sorted.forEach((node, i) => {
      const level = Math.floor(i / nodesPerLevel);
      const posInLevel = i % nodesPerLevel;
      const levelY = (config.height / (levels + 1)) * (level + 1);
      const levelX = (config.width / (nodesPerLevel + 1)) * (posInLevel + 1);

      node.fx = levelX;
      node.fy = levelY;
    });
    simulation.alpha(0.3).restart();
  }

  // Particle effects
  let particleInterval = null;

  function startParticles() {
    if (particleInterval) clearInterval(particleInterval);

    particleInterval = setInterval(() => {
      graphData.links.forEach(linkData => {
        if (Math.random() > 0.7) {
          const source = linkData.source;
          const target = linkData.target;

          if (source.x && source.y && target.x && target.y) {
            const particle = g.append("circle")
              .attr("class", "particle")
              .attr("r", 3)
              .attr("cx", source.x)
              .attr("cy", source.y);

            particle
              .transition()
              .duration(2000)
              .ease(d3.easeLinear)
              .attr("cx", target.x)
              .attr("cy", target.y)
              .attr("opacity", 0)
              .remove();
          }
        }
      });
    }, 500);
  }

  // Stats
  function updateStats() {
    const avgTrust = graphData.nodes.length > 0
      ? graphData.nodes.reduce((sum, n) => sum + (n.trust || 0), 0) / graphData.nodes.length
      : 0;

    const avgConfidence = graphData.links.length > 0
      ? graphData.links.reduce((sum, l) => sum + (l.confidence || 0), 0) / graphData.links.length
      : 0;

    document.getElementById("statAgents").textContent = graphData.nodes.length;
    document.getElementById("statResonances").textContent = graphData.links.length;
    document.getElementById("statTrust").textContent = avgTrust.toFixed(2);
    document.getElementById("statConfidence").textContent = avgConfidence.toFixed(2);
  }

  // Node details panel
  function showNodeDetails(node) {
    const panel = document.getElementById("nodeDetails");
    const content = document.getElementById("nodeDetailsContent");

    content.innerHTML = `
      <div class="detail-row">
        <strong>Name:</strong> ${node.name}
      </div>
      <div class="detail-row">
        <strong>System:</strong> ${node.system}
      </div>
      <div class="detail-row">
        <strong>Trust:</strong> ${(node.trust || 0).toFixed(3)}
      </div>
      <div class="detail-row">
        <strong>Discoveries:</strong> ${node.discoveries || 0}
      </div>
      <div class="detail-row">
        <strong>Validations:</strong> ${node.validations || 0}
      </div>
      <div class="detail-row">
        <strong>Domains:</strong> ${(node.domains || []).join(", ")}
      </div>
    `;

    panel.style.display = "block";
  }

  // Control handlers
  document.getElementById("viewMode").addEventListener("change", (e) => {
    config.viewMode = e.target.value;
    updateGraph(graphData);
  });

  document.getElementById("showLabels").addEventListener("change", (e) => {
    config.showLabels = e.target.checked;
    updateGraph(graphData);
  });

  document.getElementById("showParticles").addEventListener("change", (e) => {
    config.showParticles = e.target.checked;
    if (config.showParticles) {
      startParticles();
    } else if (particleInterval) {
      clearInterval(particleInterval);
    }
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    graphData.nodes.forEach(n => {
      n.fx = null;
      n.fy = null;
    });
    config.viewMode = "force";
    document.getElementById("viewMode").value = "force";
    updateGraph(graphData);
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    vscode.postMessage({ type: "export", data: graphData });
  });

  document.querySelector("#nodeDetails .close-btn").addEventListener("click", () => {
    document.getElementById("nodeDetails").style.display = "none";
  });

  // Message handler
  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.type) {
      case "init":
        updateGraph(message.data);
        break;

      case "update":
        updateGraph(message.data);
        break;

      case "resonance-message":
        console.log("[WebView] Resonance message:", message.data);
        // Handle real-time resonance messages
        break;
    }
  });

  // Window resize
  window.addEventListener("resize", () => {
    config.width = window.innerWidth;
    config.height = window.innerHeight - 120;
    svg.attr("width", config.width).attr("height", config.height);
    simulation.force("center", d3.forceCenter(config.width / 2, config.height / 2));
    simulation.alpha(0.3).restart();
  });

  // Initialize on load
  init();
})();
