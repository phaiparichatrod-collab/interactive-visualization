export default function NetworkMiniGraphs({ data }) {
  return (
    <div id="miniWrap">
      <div id="miniTitle">ภาพย่อย (Radial Link–Node)</div>
      <div id="miniScroller">
        <div id="miniGraphs">
          <p style={{ color: "#666" }}>
            {data.length ? "Mini graphs will appear here (to be implemented)." : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}
